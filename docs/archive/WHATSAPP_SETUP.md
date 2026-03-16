# WhatsApp Cloud API Setup Guide

## Overview

EquiProfile includes WhatsApp reminder functionality that is **currently disabled by default** behind a feature flag. We have a verified WhatsApp Business number but the WhatsApp Cloud API integration is not yet active.

This document provides exact steps to enable WhatsApp reminders when ready.

## Current Status

- ✅ WhatsApp Business number: **VERIFIED**
- ❌ WhatsApp Cloud API: **NOT CONFIGURED**
- ❌ Webhook endpoint: **NOT IMPLEMENTED**
- ❌ Message templates: **NOT SUBMITTED FOR APPROVAL**

## Prerequisites

Before starting, you need:

- [ ] Meta Business Account (already have)
- [ ] WhatsApp Business number (already verified)
- [ ] Access to Meta Developer Portal
- [ ] SSL certificate for webhook endpoint (have - equiprofile.online)

## Step 1: Set Up WhatsApp Cloud API

### 1.1 Create WhatsApp Business App

1. Go to [Meta Developers Portal](https://developers.facebook.com/)
2. Navigate to "My Apps" → "Create App"
3. Select "Business" type
4. Fill in details:
   - **App Name**: EquiProfile Reminders
   - **Contact Email**: your-email@equiprofile.online
   - **Business Account**: Select your existing Meta Business Account
5. Click "Create App"

### 1.2 Add WhatsApp Product

1. In your new app, click "Add Product"
2. Select "WhatsApp" → "Set up"
3. Select your existing WhatsApp Business Account
4. Select your verified phone number

### 1.3 Get API Credentials

1. In WhatsApp → Configuration:
   - **Phone Number ID**: `xxxxxxxxxxxxx` (copy this)
   - **WhatsApp Business Account ID**: `xxxxxxxxxxxxx` (copy this)
2. In Settings → Basic:
   - **App ID**: `xxxxxxxxxxxxx` (copy this)
   - **App Secret**: `xxxxxxxxxxxxx` (copy this)
3. Generate access token:
   - Go to WhatsApp → API Setup
   - Click "Generate Token"
   - Select permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
   - **Copy the token** (you won't see it again!)

## Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# WhatsApp Configuration
ENABLE_WHATSAPP=true
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_APP_ID=your_app_id
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=generate_random_string_here
```

**Generate webhook verify token:**

```bash
openssl rand -base64 32
```

## Step 3: Implement Webhook Endpoint

The webhook endpoint code needs to be added to `server/_core/index.ts`:

```typescript
// WhatsApp webhook verification (GET)
app.get("/api/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    console.log("[WhatsApp] Webhook verified");
    res.status(200).send(challenge);
  } else {
    console.warn("[WhatsApp] Webhook verification failed");
    res.sendStatus(403);
  }
});

// WhatsApp webhook events (POST)
app.post("/api/webhooks/whatsapp", express.json(), async (req, res) => {
  try {
    const { entry } = req.body;

    if (entry && entry[0]?.changes[0]?.value?.messages) {
      const messages = entry[0].changes[0].value.messages;

      for (const message of messages) {
        // Handle incoming message (delivery status, user replies, etc.)
        console.log("[WhatsApp] Received message:", message);

        // Process message (mark as read, handle reply, etc.)
        // TODO: Implement message handling logic
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[WhatsApp] Webhook error:", error);
    res.sendStatus(500);
  }
});
```

## Step 4: Register Webhook URL

1. In Meta Developer Portal → Your App → WhatsApp → Configuration
2. Click "Configure Webhooks"
3. Enter webhook URL: `https://equiprofile.online/api/webhooks/whatsapp`
4. Enter verify token: (the one from your .env)
5. Click "Verify and Save"
6. Subscribe to webhook fields:
   - `messages` (required for receiving message status)
   - `messaging_postbacks` (optional)
   - `messaging_optins` (optional)

## Step 5: Create Message Templates

WhatsApp requires pre-approved templates for notifications. Create these in Meta Business Manager:

### Template 1: Reminder Notification

**Name**: `reminder_notification`  
**Category**: `ALERT_UPDATE`  
**Language**: `en`

**Template:**

```
Hi {{1}},

Reminder: {{2}}

For horse: {{3}}
Due: {{4}}

EquiProfile - Horse Management
```

**Variables:**

1. User's first name
2. Reminder title
3. Horse name
4. Due date

### Template 2: Vaccination Due

**Name**: `vaccination_due`  
**Category**: `ALERT_UPDATE`  
**Language**: `en`

**Template:**

```
Hi {{1}},

Vaccination reminder for {{2}}:
{{3}} is due on {{4}}

Schedule appointment: https://equiprofile.online/health

EquiProfile
```

**Variables:**

1. User's first name
2. Horse name
3. Vaccination type
4. Due date

### Template 3: Trial Ending

**Name**: `trial_ending`  
**Category**: `ACCOUNT_UPDATE`  
**Language**: `en`

**Template:**

```
Hi {{1}},

Your EquiProfile trial ends in {{2}} days.

Upgrade now to keep your data:
https://equiprofile.online/pricing

Need help? Reply to this message.
```

**Variables:**

1. User's first name
2. Days remaining

## Step 6: Implement Sending Logic

Create `server/_core/whatsapp.ts`:

```typescript
import axios from "axios";
import { ENV } from "./env";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface WhatsAppMessage {
  to: string; // Phone number in international format (e.g., +447123456789)
  template: string;
  language?: string;
  parameters: string[];
}

export async function sendWhatsAppMessage(
  message: WhatsAppMessage,
): Promise<boolean> {
  // Check if WhatsApp is enabled
  if (!process.env.ENABLE_WHATSAPP || process.env.ENABLE_WHATSAPP !== "true") {
    console.log("[WhatsApp] Disabled - skipping message");
    return false;
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error("[WhatsApp] Missing credentials");
    return false;
  }

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: message.to,
        type: "template",
        template: {
          name: message.template,
          language: {
            code: message.language || "en",
          },
          components: [
            {
              type: "body",
              parameters: message.parameters.map((param) => ({
                type: "text",
                text: param,
              })),
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[WhatsApp] Message sent:", response.data.messages[0].id);
    return true;
  } catch (error: any) {
    console.error(
      "[WhatsApp] Send failed:",
      error.response?.data || error.message,
    );
    return false;
  }
}

// Example usage:
export async function sendReminderNotification(
  userPhone: string,
  userName: string,
  reminderTitle: string,
  horseName: string,
  dueDate: string,
): Promise<boolean> {
  return sendWhatsAppMessage({
    to: userPhone,
    template: "reminder_notification",
    parameters: [userName, reminderTitle, horseName, dueDate],
  });
}
```

## Step 7: Update Reminder System

Modify the existing reminder scheduler to check WhatsApp preference:

```typescript
// In server/reminders.ts or wherever reminders are sent

import { sendReminderNotification } from "./_core/whatsapp";

async function sendReminder(reminder: Reminder, user: User) {
  // Check user's notification preferences
  const preferences = user.preferences ? JSON.parse(user.preferences) : {};

  // Always send email
  await sendEmailReminder(reminder, user);

  // Send WhatsApp if enabled and user has opted in
  if (
    process.env.ENABLE_WHATSAPP === "true" &&
    preferences.whatsappReminders === true &&
    user.phone
  ) {
    await sendReminderNotification(
      user.phone,
      user.name || "there",
      reminder.title,
      reminder.horseName,
      formatDate(reminder.dueDate),
    );
  }
}
```

## Step 8: Add UI Toggle

Add WhatsApp preference to user settings (in `client/src/pages/Settings.tsx`):

```typescript
// In settings form
{process.env.VITE_ENABLE_WHATSAPP === "true" && (
  <div className="space-y-2">
    <Label>WhatsApp Notifications</Label>
    <div className="flex items-center gap-2">
      <Switch
        checked={preferences.whatsappReminders || false}
        onCheckedChange={(checked) =>
          setPreferences({ ...preferences, whatsappReminders: checked })
        }
      />
      <span className="text-sm text-gray-600">
        Receive reminders via WhatsApp
      </span>
    </div>
    {preferences.whatsappReminders && (
      <p className="text-sm text-gray-500">
        Ensure your phone number is up to date in your profile.
      </p>
    )}
  </div>
)}
```

## Step 9: Testing

### Test in Development

1. Use Meta's WhatsApp Test Number:
   - Go to WhatsApp → API Setup
   - Use "Test Phone Number" for sending test messages
   - Add your personal phone to "Test Recipients"

2. Test webhook:

   ```bash
   curl -X GET "https://equiprofile.online/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=test&hub.verify_token=YOUR_TOKEN"
   ```

3. Test sending a message:
   ```bash
   npm run send-test-whatsapp
   ```

### Test in Production

1. Add 5 test users (Meta requirement before going live)
2. Each test user sends a message to your WhatsApp number
3. Test all templates
4. Submit for review:
   - Go to WhatsApp → Message Templates
   - Click each template → "Submit for Review"
   - Wait 1-2 business days for approval

## Step 10: Go Live

1. All templates approved ✓
2. Webhook verified ✓
3. 5 test users completed ✓
4. Update `.env`:
   ```bash
   ENABLE_WHATSAPP=true
   ```
5. Restart server:
   ```bash
   sudo systemctl restart equiprofile
   ```
6. Monitor logs:
   ```bash
   sudo journalctl -u equiprofile -f | grep WhatsApp
   ```

## Monitoring & Limits

### Rate Limits (Tier 1 - New Business)

- **1,000 business-initiated conversations per day**
- Unlimited user-initiated conversations
- Quality rating affects limits

### Upgrade Tiers

- **Tier 1**: 1,000/day (default)
- **Tier 2**: 10,000/day (after 7 days good standing)
- **Tier 3**: 100,000/day (after verification)
- **Tier 4**: Unlimited (enterprise)

### Cost

- **User-initiated**: FREE (first 24 hours)
- **Business-initiated**: £0.03 - £0.10 per message (varies by country)
- Marketing messages: Higher cost
- Utility messages (reminders): Lower cost

### Monitoring Dashboard

- Check usage: Meta Business Manager → WhatsApp → Insights
- Monitor quality rating (must stay above 2.5/5)
- Track message delivery rates
- Review failed messages

## Troubleshooting

### Webhook verification fails

- Check `WHATSAPP_WEBHOOK_VERIFY_TOKEN` matches Meta portal
- Ensure endpoint is publicly accessible (test with curl)
- Check nginx configuration allows POST to /api/webhooks/whatsapp

### Messages not sending

- Verify `ENABLE_WHATSAPP=true` in .env
- Check access token not expired (permanent tokens last 60 days)
- Verify phone number format (+447123456789, not 07123456789)
- Check template is approved
- Verify user has not blocked the number

### Template rejected

- Avoid promotional language
- Keep it transactional/utility focused
- Don't include URLs unless in button
- Follow Meta's template guidelines

## Security Notes

- Store WhatsApp credentials in environment variables ONLY
- Never commit tokens to git
- Rotate access token every 60 days
- Use webhook signature verification in production
- Validate incoming webhooks are from Meta
- Rate limit webhook endpoint

## Support

If you encounter issues:

1. Check Meta Developer Portal → Support
2. WhatsApp Business API Documentation: https://developers.facebook.com/docs/whatsapp
3. Meta Business Help Center
4. Community Forum: https://developers.facebook.com/community/

## Next Steps

After successful setup:

- [ ] Add delivery status tracking
- [ ] Implement opt-out mechanism (user can disable)
- [ ] Add read receipts handling
- [ ] Create more template types (farrier due, vet appointment, etc.)
- [ ] Add WhatsApp button to marketing site
- [ ] Track conversion from WhatsApp reminders

## Summary

WhatsApp reminders are **ready to enable** once:

1. WhatsApp Cloud API is configured (this guide)
2. Message templates are approved by Meta
3. Environment variables are set
4. Server is restarted with `ENABLE_WHATSAPP=true`

**Estimated setup time**: 2-3 hours + 1-2 days for template approval

**Cost per month** (estimated for 1000 users, 3 reminders each):

- 3000 messages × £0.05 = **£150/month**

**When to enable**: After MVP launch and user feedback confirms demand for WhatsApp reminders.
