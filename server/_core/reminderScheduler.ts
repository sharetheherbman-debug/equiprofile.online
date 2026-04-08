import cron from "node-cron";
import * as db from "../db";
import {
  getWhatsAppConfig,
  sendWhatsAppMessage,
  formatDateForWhatsApp,
  userHasWhatsAppEnabled,
} from "./whatsapp";

/**
 * Reminder Scheduler
 * Checks for due reminders every hour and sends email + WhatsApp notifications
 */

let isRunning = false;

export function startReminderScheduler() {
  if (isRunning) {
    console.log("[Reminders] Scheduler already running");
    return;
  }

  console.log("[Reminders] Starting reminder scheduler...");

  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("[Reminders] Checking for due reminders...");

    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // ── Event reminders ──────────────────────────────────────
      const dueReminders = await db.getDueEventReminders(tomorrow);

      console.log(`[Reminders] Found ${dueReminders.length} due reminders`);

      for (const reminder of dueReminders) {
        try {
          // Get the associated event
          const event = await db.getEventById(reminder.eventId);
          if (!event) {
            // Mark orphaned reminder as sent so it doesn't reappear every hour
            await db.markEventReminderSent(reminder.id);
            console.log(
              `[Reminders] Skipped orphaned reminder ${reminder.id} (event deleted) — marked as sent`,
            );
            continue;
          }

          // Get user details
          const user = await db.getUserById(event.userId);
          if (!user || !user.email) {
            console.log(`[Reminders] User not found for event ${event.id}`);
            continue;
          }

          // Send email reminder
          const emailModule = await import("./email");
          await emailModule.sendReminderEmail(
            user.email,
            user.name || "there",
            event.title,
            event.description || "",
            new Date(event.startDate),
            undefined, // horse name if applicable
          );

          // Send WhatsApp reminder if user has it enabled
          const waConfig = await getWhatsAppConfig();
          if (
            waConfig.enabled &&
            userHasWhatsAppEnabled(user.preferences || null)
          ) {
            const phone = user.phone;
            if (phone) {
              const hoursUntil = Math.round(
                (new Date(event.startDate).getTime() - now.getTime()) /
                  (1000 * 60 * 60),
              );
              const timeLabel =
                hoursUntil <= 1 ? "1 hour" : `${hoursUntil} hours`;
              await sendWhatsAppMessage({
                to: phone,
                template: "event_reminder",
                parameters: [
                  user.name || "there",
                  event.title,
                  formatDateForWhatsApp(new Date(event.startDate)),
                  timeLabel,
                ],
              });
            }
          }

          // Mark reminder as sent
          await db.markEventReminderSent(reminder.id);

          console.log(
            `[Reminders] Sent reminder ${reminder.id} to ${user.email}`,
          );
        } catch (error) {
          console.error(
            `[Reminders] Failed to send reminder ${reminder.id}:`,
            error,
          );
        }
      }

      // ── Trial-ending reminders (daily at 9 AM UTC) ───────────
      const TRIAL_REMINDER_LOOKAHEAD_DAYS = 3;
      if (now.getUTCHours() === 9) {
        try {
          const trialUsers = await db.getTrialsEndingSoon(TRIAL_REMINDER_LOOKAHEAD_DAYS);
          const emailModule = await import("./email");

          for (const user of trialUsers) {
            if (!user.email || !user.trialEndsAt) continue;
            const daysLeft = Math.max(
              0,
              Math.ceil(
                (user.trialEndsAt.getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            );
            // Only send at key milestones: 2, 1, or 0 days remaining
            if (daysLeft <= 2) {
              await emailModule
                .sendTrialReminderEmail(user, daysLeft)
                .catch((err: any) =>
                  console.error(
                    `[Reminders] Failed to send trial reminder to ${user.email}:`,
                    err,
                  ),
                );
              console.log(
                `[Reminders] Sent trial reminder (${daysLeft}d left) to ${user.email}`,
              );
            }
          }
        } catch (error) {
          console.error("[Reminders] Error checking trial reminders:", error);
        }
      }

      console.log("[Reminders] Reminder check complete");
    } catch (error) {
      console.error("[Reminders] Error checking reminders:", error);
    }
  });

  isRunning = true;
  console.log("[Reminders] Scheduler started successfully");
}

export function stopReminderScheduler() {
  // Note: node-cron doesn't provide a direct way to stop all tasks
  // In production, you might want to keep track of task references
  isRunning = false;
  console.log("[Reminders] Scheduler stopped");
}
