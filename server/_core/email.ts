import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { User } from "../../drizzle/schema";

// SMTP Configuration from environment
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
};

const SMTP_FROM = process.env.SMTP_FROM || '"EquiProfile" <noreply@equiprofile.online>';

let transporter: Transporter | null = null;

// Initialize transporter lazily
function getTransporter(): Transporter | null {
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    console.warn("[Email] SMTP not configured (SMTP_USER and SMTP_PASS required)");
    return null;
  }

  if (!transporter) {
    try {
      transporter = nodemailer.createTransport(SMTP_CONFIG);
      console.log("[Email] SMTP transporter initialized");
    } catch (error) {
      console.error("[Email] Failed to initialize transporter:", error);
      return null;
    }
  }

  return transporter;
}

/**
 * Send a generic email (low-level function)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Email] Skipping email send - SMTP not configured");
    return;
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });
    console.log(`[Email] Sent "${subject}" to ${to}`);
  } catch (error) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, error);
    // Don't throw - email failures should not break app flow
  }
}

/**
 * Send welcome email on first signup
 */
export async function sendWelcomeEmail(user: User): Promise<void> {
  if (!user.email) {
    console.warn("[Email] Cannot send welcome email - user has no email");
    return;
  }

  const trialDays = user.trialEndsAt
    ? Math.ceil((user.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 7;

  const subject = "Welcome to EquiProfile!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Welcome to EquiProfile, ${user.name || "there"}! 🐴</h1>
      
      <p>Thank you for joining EquiProfile, the comprehensive horse management platform!</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #1e40af;">Your ${trialDays}-Day Free Trial</h2>
        <p>You have <strong>${trialDays} days</strong> to explore all premium features:</p>
        <ul>
          <li>📋 Health records and vaccination tracking</li>
          <li>🏋️ Training session management</li>
          <li>🍽️ Feeding schedules and nutrition plans</li>
          <li>📅 Calendar and event reminders</li>
          <li>☁️ AI-powered weather analysis</li>
          <li>📄 Secure document storage</li>
        </ul>
      </div>
      
      <h3>Getting Started:</h3>
      <ol>
        <li>Add your first horse profile</li>
        <li>Log health records and vaccinations</li>
        <li>Set up feeding schedules</li>
        <li>Explore the dashboard analytics</li>
      </ol>
      
      <p style="margin-top: 30px;">
        <a href="${process.env.BASE_URL || "https://equiprofile.online"}/dashboard" 
           style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>
      
      <p style="color: #6b7280; margin-top: 30px;">
        Questions? Reply to this email or contact our support team.
      </p>
      
      <p style="color: #6b7280;">
        Best regards,<br/>
        The EquiProfile Team
      </p>
    </div>
  `;

  await sendEmail(user.email, subject, html);
}

/**
 * Send trial reminder email
 */
export async function sendTrialReminderEmail(user: User, daysLeft: number): Promise<void> {
  if (!user.email) return;

  let subject: string;
  let urgency: string;

  if (daysLeft === 2) {
    subject = "Your EquiProfile trial ends in 2 days";
    urgency = "⏰ Only 2 days left in your free trial!";
  } else if (daysLeft === 1) {
    subject = "⚠️ Your EquiProfile trial ends tomorrow!";
    urgency = "⚠️ Your trial ends tomorrow!";
  } else if (daysLeft === 0) {
    subject = "Your EquiProfile trial has ended";
    urgency = "Your free trial has ended";
  } else {
    subject = `Your EquiProfile trial ends in ${daysLeft} days`;
    urgency = `Your trial ends in ${daysLeft} days`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">${urgency}</h1>
      
      <p>Hi ${user.name || "there"},</p>
      
      ${
        daysLeft > 0
          ? `<p>Your EquiProfile free trial will end in <strong>${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>. 
             After that, you'll need an active subscription to continue using premium features.</p>`
          : `<p>Your EquiProfile free trial has ended. To continue using all features, please upgrade to a paid plan.</p>`
      }
      
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Don't lose access to:</strong></p>
        <ul style="margin: 10px 0 0 0;">
          <li>Your horse profiles and health records</li>
          <li>Training logs and progress tracking</li>
          <li>Document storage and reminders</li>
          <li>Calendar and event management</li>
        </ul>
      </div>
      
      <h3>Choose Your Plan:</h3>
      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="flex: 1; border: 2px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center;">
          <h4 style="margin-top: 0;">Monthly</h4>
          <p style="font-size: 24px; font-weight: bold; color: #1e40af;">£7.99/mo</p>
          <p style="font-size: 14px; color: #6b7280;">Billed monthly</p>
        </div>
        <div style="flex: 1; border: 2px solid #1e40af; border-radius: 8px; padding: 15px; text-align: center; background: #eff6ff;">
          <div style="background: #1e40af; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px;">
            SAVE 17%
          </div>
          <h4 style="margin-top: 0;">Yearly</h4>
          <p style="font-size: 24px; font-weight: bold; color: #1e40af;">£79.90/yr</p>
          <p style="font-size: 14px; color: #6b7280;">Just £6.66/mo</p>
        </div>
      </div>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${process.env.BASE_URL || "https://equiprofile.online"}/billing" 
           style="background: #1e40af; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Upgrade Now
        </a>
      </p>
      
      <p style="color: #6b7280; margin-top: 30px; font-size: 14px;">
        Questions about billing? Contact us anytime.
      </p>
    </div>
  `;

  await sendEmail(user.email, subject, html);
}

/**
 * Send payment success/subscription activated email
 */
export async function sendPaymentSuccessEmail(user: User, plan?: "monthly" | "yearly"): Promise<void> {
  if (!user.email) return;

  const planName = plan === "yearly" ? "Yearly" : "Monthly";
  const amount = plan === "yearly" ? "£79.90/year" : "£7.99/month";

  const subject = "Payment successful - Welcome to EquiProfile Premium! 🎉";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Payment Successful! 🎉</h1>
      
      <p>Hi ${user.name || "there"},</p>
      
      <p>Thank you for subscribing to EquiProfile Premium! Your payment has been processed successfully.</p>
      
      <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #10b981;">Subscription Details</h2>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Status:</strong> Active ✅</p>
        ${
          user.subscriptionEndsAt
            ? `<p><strong>Next billing date:</strong> ${user.subscriptionEndsAt.toLocaleDateString()}</p>`
            : ""
        }
      </div>
      
      <p>You now have unlimited access to all premium features:</p>
      <ul>
        <li>✅ Unlimited horse profiles</li>
        <li>✅ Complete health record tracking</li>
        <li>✅ Training session management</li>
        <li>✅ Document storage (up to 5GB)</li>
        <li>✅ Advanced analytics and reports</li>
        <li>✅ Calendar and reminders</li>
        <li>✅ Priority support</li>
      </ul>
      
      <p style="margin-top: 30px;">
        <a href="${process.env.BASE_URL || "https://equiprofile.online"}/dashboard" 
           style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>
      
      <p style="color: #6b7280; margin-top: 30px; font-size: 14px;">
        You can manage your subscription, update payment methods, or view invoices anytime from your 
        <a href="${process.env.BASE_URL || "https://equiprofile.online"}/billing">billing page</a>.
      </p>
      
      <p style="color: #6b7280;">
        Thank you for choosing EquiProfile!<br/>
        The EquiProfile Team
      </p>
    </div>
  `;

  await sendEmail(user.email, subject, html);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string, name?: string): Promise<void> {
  const resetUrl = `${process.env.BASE_URL || "https://equiprofile.online"}/reset-password?token=${resetToken}`;
  
  const subject = "Reset your EquiProfile password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Password Reset Request</h1>
      
      <p>Hi ${name || "there"},</p>
      
      <p>We received a request to reset your EquiProfile password. Click the button below to create a new password:</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: #1e40af; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </p>
      
      <p style="color: #dc2626; background: #fef2f2; padding: 15px; border-radius: 6px;">
        ⚠️ This link will expire in <strong>1 hour</strong> for security reasons.
      </p>
      
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #1e40af; word-break: break-all;">${resetUrl}</a>
      </p>
      
      <p style="color: #6b7280; margin-top: 30px;">
        Best regards,<br/>
        The EquiProfile Team
      </p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Test email endpoint (for admin testing)
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    await sendEmail(
      to,
      "EquiProfile Test Email",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Test Email</h1>
          <p>This is a test email from EquiProfile SMTP configuration.</p>
          <p>If you received this, your email settings are working correctly! ✅</p>
          <p style="color: #6b7280; margin-top: 30px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `
    );
    return true;
  } catch (error) {
    console.error("[Email] Test email failed:", error);
    return false;
  }
}

/**
 * Simple HTML strip utility for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, "")
    .replace(/<script[^>]*>.*<\/script>/gm, "")
    .replace(/<[^>]+>/gm, "")
    .replace(/\s\s+/g, " ")
    .trim();
}
