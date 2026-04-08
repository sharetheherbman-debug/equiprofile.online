/**
 * WhatsApp Integration Module — Twilio Provider
 *
 * Sends WhatsApp messages via Twilio's REST API using axios.
 * Feature-flagged (ENABLE_WHATSAPP) and fails gracefully when disabled or
 * when Twilio credentials are missing.
 *
 * Configuration priority: environment variable > DB siteSettings
 *   ENABLE_WHATSAPP          — set to "true" to enable
 *   TWILIO_ACCOUNT_SID       — Twilio Account SID
 *   TWILIO_AUTH_TOKEN        — Twilio Auth Token
 *   TWILIO_WHATSAPP_FROM     — Sender number in whatsapp:+E.164 format
 *                              e.g. whatsapp:+14155238886
 *
 * The above can also be set via the Admin → WhatsApp dashboard which stores
 * them in the siteSettings table (keys: twilio_account_sid, twilio_auth_token,
 * twilio_whatsapp_from, whatsapp_enabled).
 */

import axios from "axios";
import { getRuntimeConfig } from "../dynamicConfig";

export interface WhatsAppMessage {
  to: string;          // Recipient phone in E.164 format, e.g. +447123456789
  template: string;    // Logical message type — used to compose the body text
  language?: string;   // Unused with Twilio free-form; retained for interface compat
  parameters: string[];
}

export interface WhatsAppConfig {
  enabled: boolean;
  accountSid?: string;
  authToken?: string;
  fromNumber?: string; // e.g. whatsapp:+14155238886
}

/**
 * Resolve Twilio credentials from env vars first, then DB siteSettings.
 * This is the async version used at send-time so DB-configured credentials work.
 */
export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  const enabledEnv = process.env.ENABLE_WHATSAPP === "true";
  const enabledDb = (await getRuntimeConfig("whatsapp_enabled", "ENABLE_WHATSAPP")) === "true";
  const enabled = enabledEnv || enabledDb;

  const accountSid =
    process.env.TWILIO_ACCOUNT_SID ||
    (await getRuntimeConfig("twilio_account_sid", "TWILIO_ACCOUNT_SID")) ||
    undefined;

  const authToken =
    process.env.TWILIO_AUTH_TOKEN ||
    (await getRuntimeConfig("twilio_auth_token", "TWILIO_AUTH_TOKEN")) ||
    undefined;

  const fromNumber =
    process.env.TWILIO_WHATSAPP_FROM ||
    (await getRuntimeConfig("twilio_whatsapp_from", "TWILIO_WHATSAPP_FROM")) ||
    undefined;

  return { enabled, accountSid, authToken, fromNumber };
}

/**
 * Synchronous env-only check — used for quick startup logging.
 * For actual send-time checks, always use the async getWhatsAppConfig().
 */
export function isWhatsAppEnabled(): { enabled: boolean } {
  return { enabled: process.env.ENABLE_WHATSAPP === "true" };
}

/**
 * Compose a human-readable WhatsApp message body from a logical template name
 * and its string parameters.
 */
function composeMessageBody(template: string, parameters: string[]): string {
  const [p0, p1, p2, p3] = parameters;
  switch (template) {
    case "event_reminder":
      // p0=name, p1=eventTitle, p2=dateString, p3=timeLabel
      return `Hi ${p0}, just a reminder: *${p1}* is in ${p3} (${p2}). — EquiProfile`;

    case "reminder_notification":
      // p0=name, p1=reminderTitle, p2=horseName, p3=dueDate
      return `Hi ${p0}, reminder: *${p1}* for ${p2} is due on ${p3}. — EquiProfile`;

    case "vaccination_due":
      // p0=name, p1=horseName, p2=vaccinationType, p3=dueDate
      return `Hi ${p0}, ${p1}'s *${p2}* vaccination is due on ${p3}. — EquiProfile`;

    case "trial_ending":
      // p0=name, p1=daysRemaining
      return `Hi ${p0}, your EquiProfile free trial ends in ${p1} day(s). Visit equiprofile.online to subscribe and keep all your data. — EquiProfile`;

    default:
      // Generic fallback — just join the parameters
      return parameters.join(" — ");
  }
}

/**
 * Normalise a phone number so it has the whatsapp: prefix Twilio requires.
 * Accepts:  +447123456789  or  whatsapp:+447123456789
 * Returns:  whatsapp:+447123456789
 */
function toWhatsAppAddress(phone: string): string {
  const trimmed = phone.trim();
  return trimmed.startsWith("whatsapp:") ? trimmed : `whatsapp:${trimmed}`;
}

/**
 * Send a WhatsApp message via Twilio's Messages API.
 *
 * @returns true on success, false on any failure (config missing, send error)
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage,
): Promise<boolean> {
  const config = await getWhatsAppConfig();

  if (!config.enabled) {
    console.log("[WhatsApp] Feature disabled — skipping message");
    return false;
  }

  if (!config.accountSid || !config.authToken || !config.fromNumber) {
    console.error(
      "[WhatsApp] Missing Twilio credentials — check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM",
    );
    return false;
  }

  const toAddress = toWhatsAppAddress(message.to);
  const fromAddress = toWhatsAppAddress(config.fromNumber);
  const body = composeMessageBody(message.template, message.parameters);

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

    const params = new URLSearchParams();
    params.append("From", fromAddress);
    params.append("To", toAddress);
    params.append("Body", body);

    const response = await axios.post(url, params.toString(), {
      auth: {
        username: config.accountSid,
        password: config.authToken,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log(
      `[WhatsApp] Message sent via Twilio — SID: ${response.data.sid}`,
    );
    return true;
  } catch (error: any) {
    console.error(
      "[WhatsApp] Twilio send failed:",
      error.response?.data || error.message,
    );
    return false;
  }
}

/**
 * Send an event reminder notification via WhatsApp.
 */
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

/**
 * Send a vaccination due reminder via WhatsApp.
 */
export async function sendVaccinationReminder(
  userPhone: string,
  userName: string,
  horseName: string,
  vaccinationType: string,
  dueDate: string,
): Promise<boolean> {
  return sendWhatsAppMessage({
    to: userPhone,
    template: "vaccination_due",
    parameters: [userName, horseName, vaccinationType, dueDate],
  });
}

/**
 * Send a trial ending notification via WhatsApp.
 */
export async function sendTrialEndingNotification(
  userPhone: string,
  userName: string,
  daysRemaining: number,
): Promise<boolean> {
  return sendWhatsAppMessage({
    to: userPhone,
    template: "trial_ending",
    parameters: [userName, daysRemaining.toString()],
  });
}

/**
 * Validate phone number format.
 * WhatsApp / Twilio requires E.164 format: +<country><number>
 *
 * @returns Formatted phone number or null if invalid
 */
export function validatePhoneNumber(phone: string): string | null {
  const cleaned = phone.replace(/[^\d+]/g, "");

  if (/^\+\d{10,15}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^\d{10,15}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Check if a user has opted in to WhatsApp notifications in their preferences.
 */
export function userHasWhatsAppEnabled(
  userPreferences: string | null,
): boolean {
  if (!userPreferences) return false;
  try {
    const prefs = JSON.parse(userPreferences);
    return prefs.whatsappReminders === true;
  } catch {
    return false;
  }
}

/**
 * Format a date for display inside WhatsApp messages.
 */
export function formatDateForWhatsApp(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

