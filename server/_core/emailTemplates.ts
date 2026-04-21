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

// Square PWA icon — ensures the logo is never squashed in email clients.
// The icon-128x128.png is a true square (128×128 px) derived from the brand mark.
const LOGO_URL = "https://equiprofile.online/icons/icon-128x128.png";
const SIGNUP_URL = "https://equiprofile.online/register";
const BILLING_URL = "https://equiprofile.online/billing";
const SITE_URL = "https://equiprofile.online";

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles & layout wrapper
// ─────────────────────────────────────────────────────────────────────────────

/** Wraps all email HTML in the standard EquiProfile outer envelope. */
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
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
${body}
</table>
<!-- Consistent EquiProfile footer -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:20px;">
<tr><td style="padding:0 0 4px 0;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 0 auto;">
    <tr>
      <td style="width:40px;height:1px;background:#e2e8f0;"></td>
      <td style="padding:0 12px;font-size:12px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">EquiProfile</td>
      <td style="width:40px;height:1px;background:#e2e8f0;"></td>
    </tr>
  </table>
</td></tr>
<tr><td align="center" style="padding:12px 16px 4px;color:#9ca3af;font-size:12px;line-height:1.6;">
<p style="margin:0;font-weight:600;color:#64748b;">EquiProfile — Professional Horse Management</p>
<p style="margin:4px 0 0 0;"><a href="${SITE_URL}" style="color:#2e6da4;text-decoration:none;">equiprofile.online</a></p>
<p style="margin:6px 0 0 0;">{{currentDate}}</p>
</td></tr>
<tr><td align="center" style="padding:6px 16px 16px;font-size:12px;color:#b0b8c4;line-height:1.5;">
<p style="margin:0;">
You received this email because you subscribed to EquiProfile communications or were contacted as a business.<br/>
<a href="{{unsubscribeLink}}" style="color:#2e6da4;text-decoration:underline;">Unsubscribe</a> &nbsp;|&nbsp;
<a href="${SITE_URL}/privacy" style="color:#2e6da4;text-decoration:underline;">Privacy Policy</a>
</p>
<p style="margin:6px 0 0 0;font-size:11px;color:#c5cdd8;">
Amarktai Network Ltd. All rights reserved.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Standard EquiProfile email letterhead.
 * Clean brand-blue gradient — lighter and more aligned with the product UI.
 * Logo is displayed without a heavy box/border so it reads cleanly.
 * The accent parameter is retained for backwards compatibility but is not used.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function headerBlock(_accent?: string): string {
  return `<tr>
<td style="background:linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);padding:36px 40px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="vertical-align:middle;padding-right:18px;width:88px;">
      <img src="${LOGO_URL}" alt="EquiProfile" width="72" height="72" style="display:block;border-radius:14px;width:72px;height:72px;background:#ffffff;"/>
    </td>
    <td style="vertical-align:middle;">
      <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.1;display:block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">EquiProfile</span>
      <span style="display:block;margin-top:4px;color:rgba(219,234,254,0.90);font-size:12px;letter-spacing:2.5px;text-transform:uppercase;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Professional Equestrian Platform</span>
    </td>
  </tr>
</table>
</td>
</tr>
<tr><td style="height:3px;background:linear-gradient(90deg, #93c5fd 0%, #ffffff 50%, #93c5fd 100%);opacity:0.6;"></td></tr>`;
}

/**
 * EquiProfile Academy email letterhead.
 * Same clean brand treatment as headerBlock but with "Academy" branding.
 */
function academyHeaderBlock(): string {
  return `<tr>
<td style="background:linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);padding:36px 40px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="vertical-align:middle;padding-right:18px;width:88px;">
      <img src="${LOGO_URL}" alt="EquiProfile Academy" width="72" height="72" style="display:block;border-radius:14px;width:72px;height:72px;background:#ffffff;"/>
    </td>
    <td style="vertical-align:middle;">
      <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.1;display:block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">EquiProfile <span style="color:rgba(186,230,253,0.95);font-weight:500;">Academy</span></span>
      <span style="display:block;margin-top:4px;color:rgba(219,234,254,0.90);font-size:12px;letter-spacing:2.5px;text-transform:uppercase;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Structured Equestrian Education</span>
    </td>
  </tr>
</table>
</td>
</tr>
<tr><td style="height:3px;background:linear-gradient(90deg, #93c5fd 0%, #ffffff 50%, #93c5fd 100%);opacity:0.6;"></td></tr>`;
}

/** Branded call-to-action button. color should be a solid hex. */
function ctaButton(text: string, url: string, color: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
<tr><td style="border-radius:8px;background:${color};box-shadow:0 2px 8px ${color}44;">
<a href="${url}" target="_blank" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.2px;">
${text}
</a>
</td></tr>
</table>`;
}

/**
 * A styled bullet-point row for email-safe layout.
 * The solid circle (&#9679;) is purely decorative — it is hidden from screen readers
 * via aria-hidden so that the text content remains the primary accessible information.
 * Note: HTML email clients have limited accessibility support; this table-based layout
 * is the industry-standard approach for email-safe list items.
 * Use inside a <table> for email-safe layout.
 */
function bulletRow(text: string, color = "#2e6da4"): string {
  return `<tr>
<td style="padding:5px 0;vertical-align:top;width:16px;font-size:8px;color:${color};padding-top:8px;" aria-hidden="true">&#9679;</td>
<td style="padding:5px 0;font-size:14px;color:#334155;line-height:1.5;">${text}</td>
</tr>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1: Feature Spotlight — Health Tracking
// ─────────────────────────────────────────────────────────────────────────────

function template1_healthTracking(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #0f2e6b 0%, #2e6da4 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Hi {{firstName}},
  </h1>
  <p style="margin:0 0 20px;font-size:16px;color:#64748b;line-height:1.6;">
    Did you know EquiProfile gives you a <strong style="color:#1e293b;">complete health dashboard</strong> for every horse?
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <tr><td style="padding:24px;background:#f0f7ff;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#0f2e6b;font-weight:600;">Health Records at a Glance</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${bulletRow("Vaccinations and upcoming reminders")}
        ${bulletRow("Dental care records and next check dates")}
        ${bulletRow("Farrier visits and hoof care logs")}
        ${bulletRow("Deworming schedules and product records")}
        ${bulletRow("X-ray records and uploaded documents")}
        ${bulletRow("Full treatment history and vet notes")}
      </table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 8px;">
    Start your <strong style="color:#2e6da4;">7-day free trial</strong> — no credit card required.
  </p>
  ${ctaButton("Start Free Trial", "{{signupLink}}", "#2e6da4")}
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
${headerBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Level Up Your Training, {{firstName}}
  </h1>
  <p style="margin:0 0 20px;font-size:16px;color:#64748b;line-height:1.6;">
    Track every session, monitor performance trends, and optimise your horse's progress with EquiProfile.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:50%;padding:8px;vertical-align:top;">
        <div style="background:#eaf1fb;border-radius:10px;padding:20px;border-top:3px solid #2e6da4;">
          <h3 style="margin:0 0 6px;font-size:14px;color:#2e6da4;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Session Logs</h3>
          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">Duration, type, intensity, and trainer notes — all in one place.</p>
        </div>
      </td>
      <td style="width:50%;padding:8px;vertical-align:top;">
        <div style="background:#fdf8ee;border-radius:10px;padding:20px;border-top:3px solid #c5a55a;">
          <h3 style="margin:0 0 6px;font-size:14px;color:#9a7d3a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Performance</h3>
          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">Rate sessions and track measurable improvement over weeks and months.</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="width:50%;padding:8px;vertical-align:top;">
        <div style="background:#e8f4f0;border-radius:10px;padding:20px;border-top:3px solid #1a7a6d;">
          <h3 style="margin:0 0 6px;font-size:14px;color:#1a7a6d;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Scheduling</h3>
          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">Plan sessions with integrated calendar and automated reminders.</p>
        </div>
      </td>
      <td style="width:50%;padding:8px;vertical-align:top;">
        <div style="background:#eaf1fb;border-radius:10px;padding:20px;border-top:3px solid #163563;">
          <h3 style="margin:0 0 6px;font-size:14px;color:#163563;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">AI Insights</h3>
          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">AI-powered training recommendations tailored to your horse.</p>
        </div>
      </td>
    </tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 8px;">
    Try it free for <strong style="color:#2e6da4;">7 days</strong> — no credit card required.
  </p>
  ${ctaButton("Start Training Smarter", "{{signupLink}}", "#2e6da4")}
</td></tr>
<tr><td style="padding:0 40px 32px;text-align:center;">
  <p style="margin:0;font-size:13px;color:#94a3b8;">Join hundreds of equestrians managing their horses professionally.</p>
</td></tr>
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3: Feature Spotlight — Stable Management
// ─────────────────────────────────────────────────────────────────────────────

function template3_stableManagement(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #065f46 0%, #10b981 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Run Your Yard Like a Pro, {{firstName}}
  </h1>
  <p style="margin:0 0 20px;font-size:16px;color:#64748b;line-height:1.6;">
    EquiProfile's Stable Plan gives yard owners and managers everything they need to run a professional operation.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <div style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:0 10px 10px 0;padding:24px;margin-bottom:16px;">
    <h2 style="margin:0 0 14px;font-size:18px;color:#065f46;font-weight:600;">What You Get</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${bulletRow("<strong>Multi-horse management</strong> across all clients and liveries", "#10b981")}
      ${bulletRow("<strong>Staff and role management</strong> — assign tasks and permissions", "#10b981")}
      ${bulletRow("<strong>Client portal</strong> — owners see their horse's daily progress", "#10b981")}
      ${bulletRow("<strong>Yard calendar</strong> — appointments, farrier visits, and events", "#10b981")}
      ${bulletRow("<strong>Messaging</strong> — communicate with staff and owners", "#10b981")}
      ${bulletRow("<strong>Reports and exports</strong> — PDF and CSV for everything", "#10b981")}
    </table>
  </div>
</td></tr>
<tr><td style="padding:16px 40px;text-align:center;">
  ${ctaButton("Try Stable Plan Free", "{{signupLink}}", "#10b981")}
  <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;">7-day free trial. No credit card. No strings.</p>
</td></tr>
<tr><td style="padding:0 40px 32px;">
  <div style="background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;border:1px solid #d1fae5;">
    <p style="margin:0;font-size:14px;color:#065f46;font-weight:600;line-height:1.5;">
      "EquiProfile transformed how we run our yard."
    </p>
    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">— Verified Stable Owner</p>
  </div>
</td></tr>
`, "#f0fdf4");
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

// ── SCHOOL CAMPAIGN TEMPLATE FUNCTIONS ─────────────────────────────────────

function schoolTemplate1_introduction(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Introducing EquiProfile to Your School 🎓
  </h1>
  <p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6;">
    Hi {{firstName}},
  </p>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
    We're excited to introduce <strong style="color:#1e293b;">EquiProfile</strong> — a digital learning and management platform designed specifically for equestrian education.
  </p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    EquiProfile helps riding schools deliver structured learning, track student progression, manage assignments, and communicate with parents — all from one platform.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <tr><td style="padding:24px;background:#f5f3ff;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#4f46e5;">What EquiProfile Offers Schools</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Structured learning pathways (Beginner → Advanced)</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Daily practice scenarios matched to student level</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ AI tutor for instant help with equine topics</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Teacher dashboard for assignments and tracking</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Progress reports for students and parents</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  ${ctaButton("Learn More →", "{{signupLink}}", "#4f46e5")}
</td></tr>
`);
}

function schoolTemplate2_partnershipPitch(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #059669 0%, #10b981 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Partner with EquiProfile 🤝
  </h1>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    Hi {{firstName}},
  </p>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
    We'd love to explore a partnership with your riding school. EquiProfile provides the digital infrastructure to modernise equestrian education — from lesson planning to student progression tracking.
  </p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    Our platform helps schools stand out by offering students a professional, structured learning experience that parents can see and trust.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <tr><td style="padding:24px;background:#ecfdf5;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#059669;">Partnership Benefits</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">🏫 Professional digital learning platform for your school</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">📊 Real-time progress tracking and reporting</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">👨‍🏫 Teacher tools for assignments and feedback</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">📱 Mobile-friendly for students and parents</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">🎯 Structured curriculum aligned to industry standards</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  ${ctaButton("Start Partnership Discussion →", "{{signupLink}}", "#059669")}
</td></tr>
`);
}

function schoolTemplate4_teacherOnboarding(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #d97706 0%, #f59e0b 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Teacher Onboarding Pack 👨‍🏫
  </h1>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    Hi {{firstName}},
  </p>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
    Welcome to EquiProfile's Instructor Portal. This guide will help you get started with managing students, assigning work, and tracking progress.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <tr><td style="padding:24px;background:#fffbeb;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#d97706;">Getting Started Checklist</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">1️⃣ Log in and complete your instructor profile</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">2️⃣ Add your students or invite them via email</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">3️⃣ Create groups for your classes</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">4️⃣ Assign lessons and tasks from the learning library</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">5️⃣ Monitor progress and provide feedback</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">6️⃣ Generate reports for students and parents</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  ${ctaButton("Open Instructor Portal →", "{{signupLink}}", "#d97706")}
</td></tr>
`);
}

function schoolTemplate6_trialInvitation(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Your 7-Day Free Trial Awaits 🎉
  </h1>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    Hi {{firstName}},
  </p>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
    We'd like to invite your school to try EquiProfile completely free for 7 days. No credit card required, no obligations — just a full-featured trial of everything we offer.
  </p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    Set up your school, add students, assign lessons, and see real progress tracking in action.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <tr><td style="padding:24px;background:#f5f3ff;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#7c3aed;">Your Trial Includes</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Full teacher & student dashboards</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Complete learning pathway library</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ AI tutor access for all students</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Assignment & progress tracking</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Messaging between teachers and students</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  ${ctaButton("Start Your Free Trial →", "{{signupLink}}", "#7c3aed")}
  <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">No credit card needed. Cancel anytime.</p>
</td></tr>
`);
}

function schoolTemplate10_followUpConversion(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Ready to Transform Your School? ✨
  </h1>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    Hi {{firstName}},
  </p>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
    We hope you've had a chance to explore what EquiProfile can do for your riding school. Whether you've tried the free trial or are still considering it, we wanted to follow up and answer any questions you might have.
  </p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    Schools that partner with EquiProfile see measurable improvements in student engagement, parent satisfaction, and teaching efficiency.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <tr><td style="padding:24px;background:#eef2ff;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#4f46e5;">Quick Recap</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Progression-based learning pathways</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Daily practice scenarios for every student</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ AI tutor for instant, safe learning support</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Teacher assignment and feedback tools</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Progress reports and school-wide analytics</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#334155;">✅ Messaging between teachers, students, and parents</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 12px;text-align:center;">
  <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 8px;">
    Start your <strong style="color:#4f46e5;">7-day free trial</strong> today — no credit card required.
  </p>
  ${ctaButton("Get Started Free →", "{{signupLink}}", "#4f46e5")}
  <p style="margin:12px 0 0;font-size:13px;color:#94a3b8;">
    Have questions? Just reply to this email — we're happy to help.
  </p>
</td></tr>
`);
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  /** management = stable/yard/owner campaigns; academy_school = education/riding-school campaigns */
  category: "management" | "academy_school";
  getHtml: () => string;
  /**
   * When true, this template is shown in the "Advanced / Spotlight" section of the
   * template picker rather than the primary sequence section.
   * Primary templates form the 4-email conversion sequences.
   * Advanced templates are standalone spotlight or re-engagement emails.
   */
  isAdvanced?: boolean;
}

// ─── Daily sending policy defaults ──────────────────────────────────────────
/** Total maximum emails per day across all campaign types (hard mailbox cap). */
export const CAMPAIGN_DAILY_TOTAL_LIMIT = 40;
/** Maximum new outreach sends per day across all management campaigns. */
export const CAMPAIGN_DAILY_MANAGEMENT_LIMIT = 25;
/** Maximum academy/school-type sends per day. */
export const CAMPAIGN_DAILY_ACADEMY_LIMIT = 15;

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMY MARKETING TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

function academyTemplate1_competitionPrep(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #92400e 0%, #d97706 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    Is Your Academy Ready for Competition Season?
  </h1>
  <p style="margin:0 0 8px;font-size:15px;color:#475569;line-height:1.6;">Hi {{firstName}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    As competition season approaches, the academies and schools that arrive best prepared are the ones with organised, data-backed preparation. EquiProfile gives your academy the tools to enter every competition with confidence.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <div style="background:#fffbeb;border-radius:10px;padding:24px;border:1px solid #fde68a;margin-bottom:16px;">
    <h2 style="margin:0 0 14px;font-size:17px;color:#92400e;font-weight:600;">Competition Preparation Features</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${bulletRow("<strong>Competition log</strong> — record entries, classes, scores, and placements", "#d97706")}
      ${bulletRow("<strong>Pre-competition training plans</strong> — structured 4-week prep programmes", "#d97706")}
      ${bulletRow("<strong>Horse fitness tracking</strong> — ensure horses peak at the right time", "#d97706")}
      ${bulletRow("<strong>Analytics dashboard</strong> — compare performance across students and horses", "#d97706")}
      ${bulletRow("<strong>Exportable reports</strong> — professional PDF results summaries for parents", "#d97706")}
    </table>
  </div>
  <div style="background:#fef3c7;border-radius:8px;padding:16px;border-left:4px solid #f59e0b;">
    <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
      <strong>Training Templates Included:</strong> Our 4-week competition preparation programme guides riders through fitness, sharpening, and competition-week routines — step by step.
    </p>
  </div>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;">
  ${ctaButton("Explore Competition Tools", "{{signupLink}}", "#d97706")}
  <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;">Start your 7-day free trial — no credit card required.</p>
</td></tr>
`);
}

function academyTemplate3_seasonalEnrolment(): string {
  return wrapEmail(`
${headerBlock("linear-gradient(135deg, #134e4a 0%, #0f766e 100%)")}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 8px;font-size:26px;color:#1e293b;font-weight:700;">
    New Term. New Students. New Possibilities.
  </h1>
  <p style="margin:0 0 8px;font-size:15px;color:#475569;line-height:1.6;">Hi {{firstName}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
    The new season is the perfect time to upgrade how your academy manages student enrolments, progress tracking, and communications. With EquiProfile, your team spends less time on admin and more time in the saddle.
  </p>
</td></tr>
<tr><td style="padding:0 40px;">
  <div style="background:#f0fdfa;border-radius:10px;padding:24px;border:1px solid #99f6e4;margin-bottom:16px;">
    <h2 style="margin:0 0 14px;font-size:17px;color:#134e4a;font-weight:600;">Why Academies Switch to EquiProfile</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${bulletRow("Streamlined student onboarding — digital profiles from day one", "#0f766e")}
      ${bulletRow("Structured learning pathways mapped to student ability levels", "#0f766e")}
      ${bulletRow("Automatic progress reports for parents — no manual writing required", "#0f766e")}
      ${bulletRow("Appointment scheduling for lessons, assessments, and competitions", "#0f766e")}
      ${bulletRow("One platform for all students, horses, and instructors", "#0f766e")}
    </table>
  </div>
  <div style="background:#ecfdf5;border-radius:8px;padding:16px;border-left:4px solid #10b981;">
    <p style="margin:0;font-size:14px;color:#134e4a;line-height:1.6;">
      <strong>This term's offer:</strong> Start your 7-day free trial and we'll help you migrate your existing student records at no charge.
    </p>
  </div>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;">
  ${ctaButton("Enrol Your Academy — Free Trial", "{{signupLink}}", "#0f766e")}
  <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;">No credit card. Cancel anytime. Full features included.</p>
</td></tr>
<tr><td style="padding:0 40px 32px;">
  <div style="background:#f0fdfa;border-radius:8px;padding:16px;text-align:center;border:1px solid #99f6e4;">
    <p style="margin:0;font-size:14px;color:#134e4a;font-weight:600;line-height:1.5;">
      "Our admin time dropped by 40% in the first month."
    </p>
    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">— Academy Principal</p>
  </div>
</td></tr>
`, "#f0fdfa");
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  // ── Management — 4-step conversion family ────────────────────────────────
  {
    id: "mgmt-intro",
    name: "Management — Intro",
    description: "First outreach to stables, yards, and owners. Introduces EquiProfile with a clear value proposition and a low-friction CTA.",
    previewColor: "#2e6da4",
    category: "management",
    getHtml: () => wrapEmail(`
${headerBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0c1e3c;line-height:1.3;">The professional platform built for equestrian businesses</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Hi {{firstName}},</p>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Running a yard, stable, or equestrian business means juggling horse records, client communications, health tracking, and staff — often across notebooks, spreadsheets, and WhatsApp threads.</p>
  <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">EquiProfile replaces that friction with one clean, professional platform — built specifically for equestrian operations.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
${bulletRow("<strong>Full horse health &amp; vet records</strong> — vaccinations, dental, hoof care, passport")}
${bulletRow("<strong>Staff &amp; client management</strong> — roles, access levels, booking")}
${bulletRow("<strong>Reminders &amp; calendar</strong> — never miss a farrier or jab again")}
${bulletRow("<strong>Secure, shareable records</strong> — export medical passports instantly")}
  </table>
  <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">No credit card required. 7-day free trial. Takes minutes to set up.</p>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
  ${ctaButton("Start Your Free Trial", SIGNUP_URL, "#2e6da4")}
  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Questions? Reply to this email — we read every one.</p>
</td></tr>
`),
  },
  {
    id: "mgmt-value",
    name: "Management — Value",
    description: "Second outreach highlighting specific time-saving value for yard/stable managers. Concrete benefits, no fluff.",
    previewColor: "#2e6da4",
    category: "management",
    getHtml: () => wrapEmail(`
${headerBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0c1e3c;line-height:1.3;">How much time does admin actually cost you?</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Hi {{firstName}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">Most yard and stable managers spend 5–10 hours per week on admin that could be automated. EquiProfile gives that time back.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
${bulletRow("Set health reminders once — get notified automatically")}
${bulletRow("Clients see real-time horse records — fewer calls to you")}
${bulletRow("One-click vet reports and travel documents")}
${bulletRow("Full audit trail — every treatment, every note, timestamped")}
  </table>
  <div style="background:#f0f6ff;border-left:4px solid #2e6da4;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 28px;">
    <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;line-height:1.5;">"I stopped forgetting vaccination dates the day I switched."</p>
    <p style="margin:4px 0 0;font-size:12px;color:#64748b;">— Stable Owner, UK</p>
  </div>
  <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">Try it free for 7 days — no card, no commitment.</p>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
  ${ctaButton("View the Platform", SIGNUP_URL, "#2e6da4")}
</td></tr>
`),
  },
  {
    id: "mgmt-proof",
    name: "Management — Proof",
    description: "Third outreach with social proof and trust signals for equestrian management. Builds confidence before final push.",
    previewColor: "#2e6da4",
    category: "management",
    getHtml: () => wrapEmail(`
${headerBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0c1e3c;line-height:1.3;">Used by equestrian businesses across the UK &amp; Ireland</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Hi {{firstName}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">EquiProfile is trusted by stables, livery yards, and private owners who needed one professional system — not another workaround.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
    <tr><td style="padding:16px;background:#f8fafc;border-radius:10px;margin-bottom:12px;">
      <p style="margin:0;font-size:14px;color:#0c1e3c;font-weight:600;line-height:1.5;">"Our team runs tighter operations — and clients actually trust us more because the records are always up to date."</p>
      <p style="margin:6px 0 0;font-size:12px;color:#64748b;">— Livery Yard Manager, Ireland</p>
    </td></tr>
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;">
${bulletRow("GDPR-compliant record storage")}
${bulletRow("Works on mobile — manage from the yard or the field")}
${bulletRow("Trusted by operations with 1 horse to 60+")}
${bulletRow("Flat-rate pricing — no per-horse fees")}
  </table>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
  ${ctaButton("Start Free Trial", SIGNUP_URL, "#2e6da4")}
  <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">7 days free. Upgrade only when you're ready.</p>
</td></tr>
`),
  },
  {
    id: "mgmt-nudge",
    name: "Management — Final Nudge",
    description: "Final outreach email for management leads. Direct, respectful, low-pressure. Clear close.",
    previewColor: "#2e6da4",
    category: "management",
    getHtml: () => wrapEmail(`
${headerBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0c1e3c;line-height:1.3;">Last note — just in case the timing is right now</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Hi {{firstName}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">I won't keep filling your inbox. But if you've been meaning to sort your horse records, streamline your yard, or give clients a more professional experience — EquiProfile is worth 10 minutes.</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">The free trial is risk-free. You'll know quickly whether it's a fit.</p>
  <div style="background:#f0f6ff;border-radius:10px;padding:20px 24px;margin:0 0 28px;">
    <p style="margin:0;font-size:14px;font-weight:600;color:#0c1e3c;">What's included in the free trial:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:10px;">
${bulletRow("Full platform access for 7 days")}
${bulletRow("Unlimited horse profiles")}
${bulletRow("Health records, reminders, calendar")}
${bulletRow("No credit card required")}
    </table>
  </div>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
  ${ctaButton("Get Started — It's Free", SIGNUP_URL, "#2e6da4")}
  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">If the timing isn't right, no problem — <a href="{{unsubscribeLink}}" style="color:#94a3b8;">unsubscribe here</a>.</p>
</td></tr>
`),
  },
  // ── Academy — 4-step conversion family ───────────────────────────────────
  {
    id: "academy-intro",
    name: "Academy — Intro",
    description: "First outreach to riding schools, colleges, and academies. Introduces the academic/student platform.",
    previewColor: "#163563",
    category: "academy_school",
    getHtml: () => wrapEmail(`
${academyHeaderBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0c1e3c;line-height:1.3;">A structured learning platform designed for equestrian schools</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Hi {{firstName}},</p>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Teaching equestrian skills is complex. Tracking student progression, managing lesson content, and keeping parents informed shouldn't be.</p>
  <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">EquiProfile Academy gives your school a professional, structured digital platform — built specifically for equestrian education.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;">
${bulletRow("<strong>Structured lesson pathways</strong> — from beginner to advanced rider", "#163563")}
${bulletRow("<strong>Student progress tracking</strong> — measurable, reportable", "#163563")}
${bulletRow("<strong>Teacher &amp; instructor portal</strong> — lesson planning, notes, assessments", "#163563")}
${bulletRow("<strong>Parent visibility</strong> — progress updates without admin overhead", "#163563")}
  </table>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
  ${ctaButton("Explore the Academy Platform", SIGNUP_URL, "#163563")}
  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">7-day free trial. No credit card required.</p>
</td></tr>
`),
  },
  {
    id: "academy-value",
    name: "Academy — Value",
    description: "Second outreach for academies/schools. Concrete time-saving and professional benefits for instructors and managers.",
    previewColor: "#163563",
    category: "academy_school",
    getHtml: () => wrapEmail(`
${academyHeaderBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0c1e3c;line-height:1.3;">What does your school gain from going digital?</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Hi {{firstName}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">Paper lesson plans, scattered progress notes, and manual parent updates take hours every week. EquiProfile Academy consolidates all of it — so your instructors can focus on teaching.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
${bulletRow("Instructors spend less time on admin, more time teaching", "#163563")}
${bulletRow("Students learn faster with structured, trackable pathways", "#163563")}
${bulletRow("Parents stay informed without constant phone calls", "#163563")}
${bulletRow("School leadership sees real data — enrolment, progression, retention", "#163563")}
  </table>
  <div style="background:#eff6ff;border-left:4px solid #163563;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 28px;">
    <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;line-height:1.5;">"Our admin time dropped significantly in the first term."</p>
    <p style="margin:4px 0 0;font-size:12px;color:#64748b;">— School Principal, UK</p>
  </div>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
  ${ctaButton("Learn More", SIGNUP_URL, "#163563")}
</td></tr>
`),
  },
  {
    id: "academy-proof",
    name: "Academy — Proof",
    description: "Third outreach with trust signals and proof for academy/school decision-makers.",
    previewColor: "#163563",
    category: "academy_school",
    getHtml: () => wrapEmail(`
${academyHeaderBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0c1e3c;line-height:1.3;">Trusted by riding schools across the UK &amp; Ireland</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Hi {{firstName}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">EquiProfile Academy is used by riding schools, colleges, and equestrian centres that needed a professional digital infrastructure — without enterprise complexity or cost.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
    <tr><td style="padding:16px;background:#f8fafc;border-radius:10px;">
      <p style="margin:0;font-size:14px;color:#0c1e3c;font-weight:600;line-height:1.5;">"Our students progress faster because everyone — instructors, students, parents — is working from the same information."</p>
      <p style="margin:6px 0 0;font-size:12px;color:#64748b;">— Head of Instruction, Riding College, Ireland</p>
    </td></tr>
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;">
${bulletRow("GDPR-compliant — student data handled properly", "#163563")}
${bulletRow("Works on any device — no app install required for parents", "#163563")}
${bulletRow("Scales from 10 to 200+ students", "#163563")}
${bulletRow("Flat pricing — no per-student fees", "#163563")}
  </table>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
  ${ctaButton("Start Free Trial", SIGNUP_URL, "#163563")}
  <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">7 days free. Upgrade only when you're ready.</p>
</td></tr>
`),
  },
  {
    id: "academy-nudge",
    name: "Academy — Final Nudge",
    description: "Final outreach email for academy/school leads. Respectful close with a clear, low-pressure CTA.",
    previewColor: "#163563",
    category: "academy_school",
    getHtml: () => wrapEmail(`
${academyHeaderBlock()}
<tr><td style="padding:40px 40px 0;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0c1e3c;line-height:1.3;">One last note — if the timing is finally right</h1>
  <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">Hi {{firstName}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">I won't keep emailing. But if you've been putting off modernising your school's administration — this is the simplest way to start.</p>
  <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">A free 7-day trial gives you full access. You'll know within a day whether it fits how your school works.</p>
  <div style="background:#eff6ff;border-radius:10px;padding:20px 24px;margin:0 0 28px;">
    <p style="margin:0;font-size:14px;font-weight:600;color:#0c1e3c;">What's included in the trial:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:10px;">
${bulletRow("Full Academy platform access", "#163563")}
${bulletRow("Student profiles, lessons, and progress tracking", "#163563")}
${bulletRow("Instructor and parent portals", "#163563")}
${bulletRow("No credit card required", "#163563")}
    </table>
  </div>
</td></tr>
<tr><td style="padding:0 40px 40px;text-align:center;">
  ${ctaButton("Start Free — No Card Needed", SIGNUP_URL, "#163563")}
  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Not the right time? <a href="{{unsubscribeLink}}" style="color:#94a3b8;">Unsubscribe here</a> and we won't contact you again.</p>
</td></tr>
`),
  },
  {
    id: "general",
    name: "General Campaign",
    description:
      "Flexible all-purpose template. Admin fills in subject, greeting, and body content.",
    previewColor: "#2e6da4",
    category: "management",
    getHtml: template5_general,
  },

  // ── Advanced / Spotlight Templates (management) ──────────────────────────
  // These are high-quality standalone templates for specific feature angles.
  // They appear in the "Advanced Templates" section of the template picker,
  // not in the primary conversion sequence section.
  {
    id: "health-tracking",
    name: "Health Tracking Spotlight",
    description: "Feature spotlight on health records — vaccinations, dental, farrier, deworming, and vet notes. Strong trial CTA.",
    previewColor: "#2e6da4",
    category: "management",
    isAdvanced: true,
    getHtml: template1_healthTracking,
  },
  {
    id: "training-performance",
    name: "Training & Performance",
    description: "Feature spotlight on training logs, session tracking, performance monitoring, and AI insights.",
    previewColor: "#2e6da4",
    category: "management",
    isAdvanced: true,
    getHtml: template2_trainingPerformance,
  },
  {
    id: "stable-management",
    name: "Stable Management Spotlight",
    description: "Feature spotlight for yard owners — multi-horse management, staff, client portal, yard calendar.",
    previewColor: "#10b981",
    category: "management",
    isAdvanced: true,
    getHtml: template3_stableManagement,
  },

  // ── Advanced / Spotlight Templates (academy_school) ──────────────────────
  {
    id: "school-introduction",
    name: "School Introduction",
    description: "First outreach to riding schools — structured learning, progression tracking, teacher tools.",
    previewColor: "#4f46e5",
    category: "academy_school",
    isAdvanced: true,
    getHtml: schoolTemplate1_introduction,
  },
  {
    id: "school-partnership",
    name: "Riding School Partnership Pitch",
    description: "Partnership proposal for riding schools — professional digital infrastructure, measurable outcomes.",
    previewColor: "#4f46e5",
    category: "academy_school",
    isAdvanced: true,
    getHtml: schoolTemplate2_partnershipPitch,
  },
  {
    id: "school-teacher-outreach",
    name: "Instructor & Teacher Outreach",
    description: "Targeted email for instructors and teachers — lesson planning tools, student progress, assessment features.",
    previewColor: "#4f46e5",
    category: "academy_school",
    isAdvanced: true,
    getHtml: schoolTemplate4_teacherOnboarding,
  },
  {
    id: "school-trial-invite",
    name: "School Trial Invitation",
    description: "Low-friction 7-day trial invitation for riding schools and equestrian colleges.",
    previewColor: "#4f46e5",
    category: "academy_school",
    isAdvanced: true,
    getHtml: schoolTemplate6_trialInvitation,
  },
  {
    id: "school-conversion",
    name: "School Follow-Up & Conversion",
    description: "Re-engagement and conversion email for school decision-makers who haven't yet started a trial.",
    previewColor: "#4f46e5",
    category: "academy_school",
    isAdvanced: true,
    getHtml: schoolTemplate10_followUpConversion,
  },
  {
    id: "academy-competition",
    name: "Competition Season Prep",
    description: "Seasonal urgency email around competition season — training logs, performance tracking, event scheduling.",
    previewColor: "#163563",
    category: "academy_school",
    isAdvanced: true,
    getHtml: academyTemplate1_competitionPrep,
  },
  {
    id: "academy-seasonal",
    name: "Academy Seasonal Enrolment Drive",
    description: "Term-time seasonal enrolment email — 40% admin savings metric, free migration, no per-student fees.",
    previewColor: "#163563",
    category: "academy_school",
    isAdvanced: true,
    getHtml: academyTemplate3_seasonalEnrolment,
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
