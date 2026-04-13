/**
 * Professional HTML email templates for admin campaigns.
 * 5 templates total: 4 marketing + 1 general-purpose.
 *
 * Merge fields supported:
 *   {{firstName}} – recipient first name
 *   {{email}} – recipient email
 *   {{currentDate}} – today's date (formatted)
 *   {{trialEndDate}} – trial expiration date
 *   {{signupLink}} – registration URL
 *   {{billingLink}} – billing/upgrade URL
 */

const LOGO_URL = "https://equiprofile.online/logo.png";
const SIGNUP_URL = "https://equiprofile.online/register";
const BILLING_URL = "https://equiprofile.online/billing";
const SITE_URL = "https://equiprofile.online";

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles & layout wrapper
// ─────────────────────────────────────────────────────────────────────────────

function wrapEmail(body: string, bgColor = "#f4f6f9"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>EquiProfile</title>
</head>
<body style="margin:0;padding:0;background:${bgColor};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor};">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
${body}
</table>
<!-- Footer -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:16px;">
<tr><td align="center" style="padding:16px;color:#9ca3af;font-size:12px;line-height:1.5;">
<p style="margin:0;">EquiProfile — Professional Horse Management</p>
<p style="margin:4px 0 0 0;"><a href="${SITE_URL}" style="color:#6366f1;text-decoration:none;">equiprofile.online</a></p>
<p style="margin:8px 0 0 0;">{{currentDate}}</p>
<p style="margin:8px 0 0 0;font-size:11px;color:#b0b8c4;">
You received this email because you subscribed to EquiProfile marketing communications or were contacted as a business.<br/>
<a href="{{unsubscribeLink}}" style="color:#6366f1;text-decoration:underline;">Unsubscribe instantly</a> from future marketing emails.<br/>
<a href="${SITE_URL}/privacy" style="color:#6366f1;text-decoration:underline;">Privacy Policy</a>
</p>
<p style="margin:8px 0 0 0;font-size:10px;color:#c5cdd8;">
EquiProfile, Amarktai Network Ltd. All rights reserved.<br/>
This is a marketing email. If you no longer wish to receive these, click unsubscribe above.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function headerBlock(accent: string): string {
  return `<tr><td style="background:${accent};padding:32px 40px;text-align:center;">
<img src="${LOGO_URL}" alt="EquiProfile" width="140" style="display:block;margin:0 auto 12px auto;max-width:140px;height:auto;"/>
<p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Professional Horse Management</p>
</td></tr>`;
}

function ctaButton(text: string, url: string, color: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
<tr><td style="border-radius:8px;background:${color};">
<a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
${text}
</a>
</td></tr>
</table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1: Feature Spotlight — Health Tracking
// ─────────────────────────────────────────────────────────────────────────────

function template1_healthTracking(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #0f2e6b 0%, #3b82f6 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Hi {{firstName}} 👋
  </h1>
  <p style="margin:0 0 20px;font-size:16px;color:#64748b;line-height:1.6;">
    Did you know EquiProfile gives you a <strong style="color:#1e293b;">complete health dashboard</strong> for every horse?
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <tr><td style="padding:24px;background:#f0f7ff;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#0f2e6b;">🩺 Health Records at a Glance</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#334155;">✅ Vaccinations & reminders</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#334155;">✅ Dental care tracking</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#334155;">✅ Hoof care & farrier logs</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#334155;">✅ Deworming schedules</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#334155;">✅ X-ray records & documents</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#334155;">✅ Treatment history & notes</td>
        </tr>
      </table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 8px;">
    Start your <strong style="color:#3b82f6;">7-day free trial</strong> — no credit card required.
  </p>
  ${ctaButton("Start Free Trial →", "{{signupLink}}", "#3b82f6")}
</td></tr>
<tr><td style="padding:0 40px 32px;text-align:center;">
  <p style="margin:0;font-size:13px;color:#94a3b8;">No credit card needed. Cancel anytime.</p>
</td></tr>
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2: Feature Spotlight — Training & Performance
// ─────────────────────────────────────────────────────────────────────────────

function template2_trainingPerformance(): string {
  return wrapEmail(`
${headerBlock("#1a1a2e")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Level Up Your Training, {{firstName}} 🏇
  </h1>
  <p style="margin:0 0 20px;font-size:16px;color:#64748b;line-height:1.6;">
    Track every session, monitor performance trends, and optimise your horse's progress with EquiProfile.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:50%;padding:8px;vertical-align:top;">
        <div style="background:#faf5ff;border-radius:10px;padding:20px;text-align:center;min-height:120px;">
          <div style="font-size:28px;margin-bottom:8px;">📊</div>
          <h3 style="margin:0 0 6px;font-size:14px;color:#7c3aed;font-weight:600;">Session Logs</h3>
          <p style="margin:0;font-size:13px;color:#64748b;">Log duration, type, intensity, and notes</p>
        </div>
      </td>
      <td style="width:50%;padding:8px;vertical-align:top;">
        <div style="background:#f0fdf4;border-radius:10px;padding:20px;text-align:center;min-height:120px;">
          <div style="font-size:28px;margin-bottom:8px;">🎯</div>
          <h3 style="margin:0 0 6px;font-size:14px;color:#16a34a;font-weight:600;">Performance</h3>
          <p style="margin:0;font-size:13px;color:#64748b;">Rate and track improvement over time</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="width:50%;padding:8px;vertical-align:top;">
        <div style="background:#fff7ed;border-radius:10px;padding:20px;text-align:center;min-height:120px;">
          <div style="font-size:28px;margin-bottom:8px;">📅</div>
          <h3 style="margin:0 0 6px;font-size:14px;color:#ea580c;font-weight:600;">Scheduling</h3>
          <p style="margin:0;font-size:13px;color:#64748b;">Plan sessions with calendar integration</p>
        </div>
      </td>
      <td style="width:50%;padding:8px;vertical-align:top;">
        <div style="background:#eff6ff;border-radius:10px;padding:20px;text-align:center;min-height:120px;">
          <div style="font-size:28px;margin-bottom:8px;">🤖</div>
          <h3 style="margin:0 0 6px;font-size:14px;color:#2563eb;font-weight:600;">AI Insights</h3>
          <p style="margin:0;font-size:13px;color:#64748b;">Get AI-powered training recommendations</p>
        </div>
      </td>
    </tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 8px;">
    Try it free for <strong style="color:#7c3aed;">7 days</strong> — no credit card required.
  </p>
  ${ctaButton("Start Training Smarter →", "{{signupLink}}", "#7c3aed")}
</td></tr>
<tr><td style="padding:0 40px 32px;text-align:center;">
  <p style="margin:0;font-size:13px;color:#94a3b8;">Join hundreds of equestrians managing their horses professionally.</p>
</td></tr>
`, "#f5f3ff");
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3: Feature Spotlight — Stable Management
// ─────────────────────────────────────────────────────────────────────────────

function template3_stableManagement(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #065f46 0%, #10b981 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Run Your Yard Like a Pro, {{firstName}} 🏠
  </h1>
  <p style="margin:0 0 20px;font-size:16px;color:#64748b;line-height:1.6;">
    EquiProfile's Stable Plan gives yard owners and managers everything they need to run a professional operation.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <div style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:0 10px 10px 0;padding:24px;margin-bottom:16px;">
    <h2 style="margin:0 0 12px;font-size:18px;color:#065f46;">What You Get</h2>
    <p style="margin:4px 0;font-size:14px;color:#334155;">🐴 <strong>Multi-horse management</strong> across all clients</p>
    <p style="margin:4px 0;font-size:14px;color:#334155;">👥 <strong>Staff & role management</strong> — assign tasks and permissions</p>
    <p style="margin:4px 0;font-size:14px;color:#334155;">📋 <strong>Client portal</strong> — owners see their horse's progress</p>
    <p style="margin:4px 0;font-size:14px;color:#334155;">📆 <strong>Yard calendar</strong> — appointments, farrier visits, events</p>
    <p style="margin:4px 0;font-size:14px;color:#334155;">💬 <strong>Messaging</strong> — communicate with staff and owners</p>
    <p style="margin:4px 0;font-size:14px;color:#334155;">📄 <strong>Reports & exports</strong> — PDF and CSV for everything</p>
  </div>
</td></tr>
<tr><td style="padding:16px 40px;text-align:center;">
  ${ctaButton("Try Stable Plan Free →", "{{signupLink}}", "#10b981")}
  <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;">7-day free trial. No credit card. No strings.</p>
</td></tr>
<tr><td style="padding:0 40px 32px;">
  <div style="background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;">
    <p style="margin:0;font-size:14px;color:#065f46;font-weight:600;">
      "EquiProfile transformed how we run our yard." — Stable Owner
    </p>
  </div>
</td></tr>
`, "#f0fdf4");
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4: Feature Spotlight — AI Assistant & Weather
// ─────────────────────────────────────────────────────────────────────────────

function template4_aiAndWeather(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Meet Your AI Horse Assistant, {{firstName}} 🤖
  </h1>
  <p style="margin:0 0 20px;font-size:16px;color:#64748b;line-height:1.6;">
    EquiProfile includes an intelligent AI assistant and real-time weather analysis — built right into your dashboard.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding-bottom:16px;">
      <div style="background:linear-gradient(135deg,#eef2ff,#faf5ff);border-radius:12px;padding:24px;border:1px solid #e0e7ff;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#4f46e5;">🧠 AI Chat Assistant</h3>
        <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
          Ask questions about horse care, get training suggestions, understand health records, and manage your stable — all through natural conversation.
        </p>
      </div>
    </td></tr>
    <tr><td>
      <div style="background:linear-gradient(135deg,#ecfeff,#f0f9ff);border-radius:12px;padding:24px;border:1px solid #cffafe;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#0891b2;">🌤️ Smart Weather Analysis</h3>
        <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
          Get AI-powered riding suitability forecasts based on your stable's location. Know exactly when conditions are ideal for training, hacking, or turnout.
        </p>
      </div>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 8px;">
    Experience it free for <strong style="color:#4f46e5;">7 days</strong> — no credit card needed.
  </p>
  ${ctaButton("Try AI Features Free →", "{{signupLink}}", "#4f46e5")}
</td></tr>
<tr><td style="padding:0 40px 32px;text-align:center;">
  <p style="margin:0;font-size:13px;color:#94a3b8;">Powered by advanced AI. Always learning. Always helpful.</p>
</td></tr>
`, "#eef2ff");
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 5: General Campaign / Admin Template
// ─────────────────────────────────────────────────────────────────────────────

function template5_general(): string {
  return wrapEmail(`
${headerBlock("#0f2e6b")}
<tr><td style="padding:40px;">
  <h1 style="margin:0 0 16px;font-size:24px;color:#1e293b;font-weight:700;">
    {{subject}}
  </h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">
    Hi {{firstName}},
  </p>
  <div style="font-size:15px;color:#475569;line-height:1.7;">
    {{content}}
  </div>
  ${ctaButton("Visit EquiProfile →", SITE_URL, "#3b82f6")}
</td></tr>
<tr><td style="padding:0 40px 32px;">
  <div style="border-top:1px solid #e2e8f0;padding-top:16px;">
    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">
      Questions? Reply to this email or contact us at <a href="mailto:hello@equiprofile.online" style="color:#6366f1;">hello@equiprofile.online</a>
    </p>
  </div>
</td></tr>
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Template registry & merge-field processing
// ─────────────────────────────────────────────────────────────────────────────

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  getHtml: () => string;
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "health-tracking",
    name: "Health Tracking Spotlight",
    description:
      "Promotes comprehensive health tracking features — vaccinations, dental, hoof care, and more.",
    previewColor: "#3b82f6",
    getHtml: template1_healthTracking,
  },
  {
    id: "training-performance",
    name: "Training & Performance",
    description:
      "Highlights training logs, performance tracking, scheduling, and AI insights.",
    previewColor: "#7c3aed",
    getHtml: template2_trainingPerformance,
  },
  {
    id: "stable-management",
    name: "Stable Management",
    description:
      "Showcases the Stable Plan — multi-horse, staff, client portal, messaging.",
    previewColor: "#10b981",
    getHtml: template3_stableManagement,
  },
  {
    id: "ai-weather",
    name: "AI Assistant & Weather",
    description:
      "Promotes the AI chat assistant and smart weather-based riding analysis.",
    previewColor: "#4f46e5",
    getHtml: template4_aiAndWeather,
  },
  {
    id: "general",
    name: "General Campaign",
    description:
      "Flexible all-purpose template. Admin fills in subject, greeting, and body content.",
    previewColor: "#0f2e6b",
    getHtml: template5_general,
  },
];

/**
 * Applies merge fields to an HTML template string.
 */
export function applyMergeFields(
  html: string,
  fields: {
    firstName?: string;
    email?: string;
    currentDate?: string;
    trialEndDate?: string;
    signupLink?: string;
    billingLink?: string;
    subject?: string;
    content?: string;
    unsubscribeLink?: string;
  },
): string {
  const safeFields: Record<string, string> = {
    firstName: fields.firstName || "there",
    email: fields.email || "",
    currentDate:
      fields.currentDate ||
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    trialEndDate: fields.trialEndDate || "",
    signupLink: fields.signupLink || SIGNUP_URL,
    billingLink: fields.billingLink || BILLING_URL,
    subject: fields.subject || "",
    content: fields.content || "",
    unsubscribeLink: fields.unsubscribeLink || `${SITE_URL}/unsubscribe`,
  };

  let result = html;
  for (const [key, value] of Object.entries(safeFields)) {
    result = result.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      value,
    );
  }
  return result;
}

/**
 * Retrieve a template by ID.
 */
export function getTemplateById(
  templateId: string,
): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((t) => t.id === templateId);
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN SEQUENCE TEMPLATES — 3 ready-to-run drip sequences
// ─────────────────────────────────────────────────────────────────────────────

export interface SequenceStep {
  stepNumber: number;
  delayDays: number;
  subject: string;
  body: string; // plain body content (will be wrapped in wrapEmail)
  tone: string;
}

export interface CampaignSequenceTemplate {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  steps: SequenceStep[];
}

// ── Campaign 1: Individual Horse Owners ──────────────────────────────────────

const campaign1_individualOwners: CampaignSequenceTemplate = {
  id: "individual-owners",
  name: "Individual Horse Owners",
  description: "4-step sequence targeting individual owners. Focus: organisation, reminders, health tracking.",
  targetAudience: "individual",
  steps: [
    {
      stepNumber: 1,
      delayDays: 0,
      subject: "Keep your horse's records in one place",
      tone: "helpful, personal",
      body: `Hi {{firstName}},

Managing vaccinations, farrier visits, and health records can be overwhelming — especially when everything is scattered across notebooks, photos, and memory.

EquiProfile puts it all in one place. Track health, set reminders, log training, and share a medical passport — all from your phone.

It's free to try for 7 days, no credit card needed.`,
    },
    {
      stepNumber: 2,
      delayDays: 3,
      subject: "Never miss a vaccination or farrier visit again",
      tone: "problem-focused",
      body: `Hi {{firstName}},

How do you currently remember when your horse's next vaccination is due? Or the last time the farrier visited?

Most owners rely on memory, paper diaries, or phone notes — and things slip through the cracks.

EquiProfile sends smart reminders before anything is overdue. Vaccinations, dewormings, dental checks, farrier visits — all tracked and prompted automatically.

No more missed appointments.`,
    },
    {
      stepNumber: 3,
      delayDays: 6,
      subject: "Your horse deserves a digital health record",
      tone: "value-focused",
      body: `Hi {{firstName}},

Imagine having your horse's complete medical history, training log, and passport available instantly — on any device.

When your vet asks "When was the last vaccination?" you'll know in seconds.

EquiProfile gives you:
• Complete health timeline
• Medical passport (shareable)
• Training & performance logs
• AI-powered weather riding advice
• Smart reminders

Join hundreds of horse owners who've gone digital.`,
    },
    {
      stepNumber: 4,
      delayDays: 10,
      subject: "Your free trial is waiting, {{firstName}}",
      tone: "follow-up, gentle close",
      body: `Hi {{firstName}},

Just a quick note — your 7-day free trial of EquiProfile is still available.

No credit card. No obligation. Just a cleaner, smarter way to manage your horse's care.

If it's not for you, no worries at all. But if you've been meaning to get more organised with your horse's records, now's a great time to start.`,
    },
  ],
};

// ── Campaign 2: Riding Schools ───────────────────────────────────────────────

const campaign2_ridingSchools: CampaignSequenceTemplate = {
  id: "riding-schools",
  name: "Riding Schools",
  description: "4-step sequence for riding schools. Focus: scheduling, efficiency, professionalism.",
  targetAudience: "riding_school",
  steps: [
    {
      stepNumber: 1,
      delayDays: 0,
      subject: "Managing multiple horses shouldn't be this hard",
      tone: "operational benefit",
      body: `Hi {{firstName}},

Running a riding school means managing multiple horses, clients, schedules, and health records — often across different systems (or just your head).

EquiProfile is built for exactly this. One platform for all your horses: health records, training logs, schedules, staff tasks, and client communication.

See how it works — free for 7 days.`,
    },
    {
      stepNumber: 2,
      delayDays: 3,
      subject: "How much time do you spend on admin each week?",
      tone: "time-saving",
      body: `Hi {{firstName}},

Between lesson scheduling, horse health tracking, and managing your team — admin can eat up hours every week.

EquiProfile automates the tedious parts:
• Smart health reminders (no more missed vaccinations)
• Calendar management for the whole yard
• Task assignment for staff
• Exportable reports

Spend less time on paperwork. More time with the horses.`,
    },
    {
      stepNumber: 3,
      delayDays: 6,
      subject: "Professional records make a professional school",
      tone: "professionalism",
      body: `Hi {{firstName}},

Parents and clients notice when a riding school runs professionally. Clean records, organised schedules, and proactive health management build trust.

EquiProfile gives you that professional edge:
• Medical passports for every horse
• Digital health records (instant access for vets)
• Training progress tracking
• Client-facing reports

It's the system your school deserves.`,
    },
    {
      stepNumber: 4,
      delayDays: 10,
      subject: "Ready to streamline your school?",
      tone: "follow-up",
      body: `Hi {{firstName}},

Just checking in — have you had a chance to look at EquiProfile?

We built it specifically for equestrian businesses like yours. It's free to try for 7 days, and there's no credit card needed to get started.

If you have questions, just reply to this email — we're happy to help.`,
    },
  ],
};

// ── Campaign 3: Stables / Professional Yards ─────────────────────────────────

const campaign3_stables: CampaignSequenceTemplate = {
  id: "stables-yards",
  name: "Stables & Professional Yards",
  description: "4-step sequence for livery yards and professional stables. Focus: structured management, team coordination.",
  targetAudience: "stable",
  steps: [
    {
      stepNumber: 1,
      delayDays: 0,
      subject: "Run your yard with the system it deserves",
      tone: "premium, business-level",
      body: `Hi {{firstName}},

Managing a professional yard requires precision — across health, training, staffing, scheduling, and client expectations.

EquiProfile's Stable Plan is designed for exactly this. Multi-horse management, team coordination, client portals, and complete health records — all in one platform.

Start your free 7-day trial today.`,
    },
    {
      stepNumber: 2,
      delayDays: 3,
      subject: "Your staff, your horses, one system",
      tone: "team coordination",
      body: `Hi {{firstName}},

When multiple people manage multiple horses, things get complicated fast. Different spreadsheets, WhatsApp groups, paper lists — information gets lost.

EquiProfile gives your entire team one source of truth:
• Assign tasks to specific staff members
• Shared calendar for the whole yard
• Real-time updates across devices
• Role-based permissions

Everyone on the same page. Every horse accounted for.`,
    },
    {
      stepNumber: 3,
      delayDays: 6,
      subject: "What your clients see matters",
      tone: "client-facing professionalism",
      body: `Hi {{firstName}},

Horse owners trust yards that communicate professionally. Digital health records, shareable medical passports, and organised reporting show your clients that their horses are in expert hands.

EquiProfile includes:
• Shareable medical passports
• Detailed health & training records
• Exportable PDF reports
• AI-powered care recommendations

Give your clients the confidence they expect from a premium yard.`,
    },
    {
      stepNumber: 4,
      delayDays: 10,
      subject: "Let's get your yard set up, {{firstName}}",
      tone: "follow-up, personal",
      body: `Hi {{firstName}},

We know running a yard is busy work. That's exactly why we built EquiProfile — to make the management side faster, cleaner, and more professional.

Your free trial is still available. No credit card. No commitment. Just a better way to run your yard.

If you'd like a quick walkthrough, just reply — we're happy to help.`,
    },
  ],
};

// ── Campaign 4: Students / Learners ──────────────────────────────────────────

const campaign4_students: CampaignSequenceTemplate = {
  id: "students",
  name: "Riding Students & Learners",
  description: "4-step sequence for riding students. Focus: progress tracking, lesson organisation, skill development.",
  targetAudience: "student",
  steps: [
    {
      stepNumber: 1,
      delayDays: 0,
      subject: "Track your riding progress in one place",
      tone: "motivating, personal",
      body: `Hi {{firstName}},

Learning to ride is an exciting journey — but it can be hard to see how far you've come without a clear record of your progress.

EquiProfile helps you track every lesson, milestone, and skill as you develop. Log your sessions, note what you're working on, and watch your progress grow over time.

Start your free 7-day trial today.`,
    },
    {
      stepNumber: 2,
      delayDays: 3,
      subject: "See exactly where you're improving",
      tone: "progress-focused",
      body: `Hi {{firstName}},

When you're in the saddle every week, it's easy to forget how much you've improved.

EquiProfile's learning tools help you:
• Log lessons and training sessions
• Track skills and competencies
• Review feedback from your instructor
• Set goals and celebrate milestones

Your riding journey, documented and organised.`,
    },
    {
      stepNumber: 3,
      delayDays: 6,
      subject: "Your personal riding record",
      tone: "value-focused",
      body: `Hi {{firstName}},

Imagine having a complete record of your riding journey — every lesson, every skill, every breakthrough moment.

EquiProfile gives you:
• A personal riding log
• Competency tracking
• Lesson notes and instructor feedback
• Progress reports you can share
• AI-powered tips for your riding level

Build the riding career you've always wanted.`,
    },
    {
      stepNumber: 4,
      delayDays: 10,
      subject: "Your free trial is still available, {{firstName}}",
      tone: "gentle follow-up",
      body: `Hi {{firstName}},

Just a quick reminder — your 7-day free trial of EquiProfile is waiting for you.

Whether you're a beginner or an experienced rider, having a clear record of your progress makes a real difference. And it's completely free to try.

No credit card needed. No commitment. Just a smarter way to grow as a rider.`,
    },
  ],
};

// ── Campaign 5: Teachers / Instructors ───────────────────────────────────────

const campaign5_teachers: CampaignSequenceTemplate = {
  id: "teachers",
  name: "Riding Instructors & Coaches",
  description: "4-step sequence for riding instructors. Focus: student management, lesson planning, professional development tracking.",
  targetAudience: "teacher",
  steps: [
    {
      stepNumber: 1,
      delayDays: 0,
      subject: "The smarter way to manage your students",
      tone: "professional, time-saving",
      body: `Hi {{firstName}},

Managing multiple students — tracking their progress, planning lessons, and keeping records — takes serious time and organisation.

EquiProfile gives instructors a dedicated platform to manage students, plan lessons, track competencies, and monitor progress — all in one place.

Try it free for 7 days, no credit card needed.`,
    },
    {
      stepNumber: 2,
      delayDays: 3,
      subject: "Know exactly where each student stands",
      tone: "insight-focused",
      body: `Hi {{firstName}},

Do you ever wish you had a clearer picture of each student's progress at a glance?

EquiProfile's instructor tools help you:
• Track competencies for every student
• Plan and log individual lesson objectives
• Record feedback and notes after each session
• See progress trends over time

Better insights. Better coaching.`,
    },
    {
      stepNumber: 3,
      delayDays: 6,
      subject: "Professional records for a professional instructor",
      tone: "credibility, professionalism",
      body: `Hi {{firstName}},

The best instructors don't just teach — they document. Keeping clear records of student progress, lesson plans, and competency development is the mark of a professional.

EquiProfile helps you deliver:
• Detailed progress reports for students and parents
• Structured lesson planning
• Competency-based development tracking
• A professional, organised teaching practice

Elevate your coaching with the tools it deserves.`,
    },
    {
      stepNumber: 4,
      delayDays: 10,
      subject: "Ready to take your teaching further?",
      tone: "follow-up, encouraging",
      body: `Hi {{firstName}},

We know your time is valuable — that's exactly why we built EquiProfile to make student and lesson management as effortless as possible.

Your free 7-day trial is still available. No credit card, no commitment.

If you'd like to see how it works for instructors, just reply and we'll walk you through it.`,
    },
  ],
};

export const CAMPAIGN_SEQUENCE_TEMPLATES: CampaignSequenceTemplate[] = [
  campaign1_individualOwners,
  campaign2_ridingSchools,
  campaign3_stables,
  campaign4_students,
  campaign5_teachers,
];

/**
 * Generate full HTML for a sequence step body.
 */
export function buildSequenceStepHtml(body: string): string {
  const htmlBody = body
    .split("\n\n")
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      // Handle bullet lines (starting with •)
      if (trimmed.includes("\n•") || trimmed.startsWith("•")) {
        const lines = trimmed.split("\n");
        const items = lines
          .map((l) => l.trim())
          .filter((l) => l.startsWith("•"))
          .map((l) => `<li style="padding:2px 0;font-size:14px;color:#334155;">${l.replace("•", "").trim()}</li>`)
          .join("");
        const intro = lines.find((l) => !l.trim().startsWith("•"));
        return `${intro ? `<p style="margin:0 0 8px;font-size:15px;color:#475569;line-height:1.6;">${intro}</p>` : ""}
<ul style="margin:0 0 16px;padding-left:20px;">${items}</ul>`;
      }
      return `<p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">${trimmed}</p>`;
    })
    .join("");

  return wrapEmail(`
${headerBlock("#0f2e6b")}
<tr><td style="padding:32px 40px;">
  ${htmlBody}
  ${ctaButton("Start Free Trial →", "{{signupLink}}", "#4f5fd6")}
  <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;text-align:center;">No credit card needed. Cancel anytime.</p>
</td></tr>
`);
}

/**
 * Return all sequence templates for admin listing.
 */
export function getSequenceTemplates(): CampaignSequenceTemplate[] {
  return CAMPAIGN_SEQUENCE_TEMPLATES;
}
