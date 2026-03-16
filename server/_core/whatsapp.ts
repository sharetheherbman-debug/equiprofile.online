/**
 * WhatsApp Cloud API Integration Module
 *
 * This module provides functions for sending WhatsApp messages via Meta's Cloud API.
 * It's designed to be feature-flagged (ENABLE_WHATSAPP) and fail gracefully if disabled.
 *
 * IMPORTANT: This requires WhatsApp Cloud API to be configured in Meta Developer Portal.
 * See docs/WHATSAPP_SETUP.md for complete setup instructions.
 */

import axios from "axios";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

export interface WhatsAppMessage {
  to: string; // Phone number in international format (e.g., +447123456789)
  template: string;
  language?: string;
  parameters: string[];
}

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId?: string;
  accessToken?: string;
}

/**
 * Check if WhatsApp is enabled and properly configured
 */
export function isWhatsAppEnabled(): WhatsAppConfig {
  const enabled = process.env.ENABLE_WHATSAPP === "true";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  return {
    enabled,
    phoneNumberId,
    accessToken,
  };
}

/**
 * Send a WhatsApp message using a pre-approved template
 *
 * @param message - Message configuration with template name and parameters
 * @returns true if message sent successfully, false otherwise
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage,
): Promise<boolean> {
  const config = isWhatsAppEnabled();

  // Check if WhatsApp is enabled
  if (!config.enabled) {
    console.log("[WhatsApp] Feature disabled - skipping message");
    return false;
  }

  if (!config.phoneNumberId || !config.accessToken) {
    console.error(
      "[WhatsApp] Missing credentials (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN)",
    );
    return false;
  }

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
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
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      "[WhatsApp] Message sent successfully:",
      response.data.messages[0].id,
    );
    return true;
  } catch (error: any) {
    console.error(
      "[WhatsApp] Send failed:",
      error.response?.data || error.message,
    );
    return false;
  }
}

/**
 * Send a reminder notification via WhatsApp
 * Uses the "reminder_notification" template
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
 * Send a vaccination due reminder via WhatsApp
 * Uses the "vaccination_due" template
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
 * Send a trial ending notification via WhatsApp
 * Uses the "trial_ending" template
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
 * Validate phone number format
 * WhatsApp requires numbers in international format without spaces or dashes
 *
 * @param phone - Phone number to validate
 * @returns Formatted phone number or null if invalid
 */
export function validatePhoneNumber(phone: string): string | null {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Must start with + and have 10-15 digits
  if (/^\+\d{10,15}$/.test(cleaned)) {
    return cleaned;
  }

  // Try to add + if missing and phone starts with country code
  if (/^\d{10,15}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Check if user has WhatsApp enabled in their preferences
 *
 * @param userPreferences - JSON preferences from user record
 * @returns true if user has opted in to WhatsApp notifications
 */
export function userHasWhatsAppEnabled(
  userPreferences: string | null,
): boolean {
  if (!userPreferences) return false;

  try {
    const prefs = JSON.parse(userPreferences);
    return prefs.whatsappReminders === true;
  } catch (error) {
    console.error("[WhatsApp] Error parsing user preferences:", error);
    return false;
  }
}

/**
 * Format date for WhatsApp messages
 *
 * @param date - Date to format
 * @returns Human-readable date string
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
