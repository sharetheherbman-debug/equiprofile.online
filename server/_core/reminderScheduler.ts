import cron from "node-cron";
import * as db from "../db";
import {
  getWhatsAppConfig,
  sendWhatsAppMessage,
  formatDateForWhatsApp,
  userHasWhatsAppEnabled,
} from "./whatsapp";
import { sendEmail } from "./email";
import {
  getTodayDateString,
  isWeekday,
  NEW_OUTREACH_DAILY_CAP,
  TOTAL_MAILBOX_DAILY_CAP,
  NEW_OUTREACH_PER_WINDOW,
  SEND_WINDOWS,
} from "./campaignService";

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

  // ── Campaign Follow-Up Sequence Scheduler ───────────────────
  // Runs daily at 10:00 AM UTC on weekdays — checks for pending sequence steps
  // that have reached their scheduled date and sends them automatically.
  // Respects global TOTAL_MAILBOX_DAILY_CAP so follow-ups never exceed the cap.
  cron.schedule("0 10 * * 1-5", async () => {
    console.log("[CampaignFollowUp] Checking for due follow-up steps...");

    try {
      const dbConn = await db.getDb();
      if (!dbConn) {
        console.log("[CampaignFollowUp] No database connection — skipping");
        return;
      }

      // Extra weekday guard in case cron expression is ever relaxed
      if (!isWeekday()) {
        console.log("[CampaignFollowUp] Weekend — skipping");
        return;
      }

      const { eq, and, lte, or, sql } = await import("drizzle-orm");
      const {
        campaignSequences,
        campaignSequenceRecipients,
        emailCampaignRecipients,
        emailUnsubscribes,
        marketingContacts,
        emailCampaigns,
        campaignSendLog,
      } = await import("../../drizzle/schema");

      const today = getTodayDateString();

      // ── Check global daily caps before doing any work ──
      const [outreachResult] = await dbConn
        .select({ total: sql<number>`COALESCE(SUM(${campaignSendLog.sendCount}), 0)` })
        .from(campaignSendLog)
        .where(eq(campaignSendLog.sendDate, today));
      const outreachSentToday = Number(outreachResult?.total ?? 0);

      const [followupCountResult] = await dbConn
        .select({ total: sql<number>`COALESCE(COUNT(*), 0)` })
        .from(campaignSequenceRecipients)
        .where(and(
          eq(campaignSequenceRecipients.status, "sent"),
          sql`DATE(${campaignSequenceRecipients.sentAt}) = ${today}`,
        ));
      const followupSentToday = Number(followupCountResult?.total ?? 0);
      let globalTotalSentToday = outreachSentToday + followupSentToday;

      if (globalTotalSentToday >= TOTAL_MAILBOX_DAILY_CAP) {
        console.log(
          `[CampaignFollowUp] Total mailbox cap (${TOTAL_MAILBOX_DAILY_CAP}) already reached — skipping all follow-ups`,
        );
        return;
      }

      // Find pending sequence steps whose scheduledDate is today or earlier
      const dueSteps = await dbConn
        .select()
        .from(campaignSequences)
        .where(
          and(
            eq(campaignSequences.status, "pending"),
            lte(campaignSequences.scheduledDate, today),
          ),
        );

      if (dueSteps.length === 0) {
        console.log("[CampaignFollowUp] No due follow-up steps");
        return;
      }

      console.log(`[CampaignFollowUp] Found ${dueSteps.length} due follow-up step(s)`);

      // Build global suppression set (once for all steps)
      const suppressions = await dbConn
        .select({ email: emailUnsubscribes.email })
        .from(emailUnsubscribes);
      const suppressedSet = new Set(suppressions.map((s) => s.email.toLowerCase()));

      const mcBounced = await dbConn
        .select({ email: marketingContacts.email })
        .from(marketingContacts)
        .where(
          or(
            eq(marketingContacts.status, "unsubscribed"),
            eq(marketingContacts.status, "bounced"),
          ),
        );
      for (const b of mcBounced) suppressedSet.add(b.email.toLowerCase());

      const BASE_URL = process.env.BASE_URL || "https://equiprofile.online";

      for (const step of dueSteps) {
        // Respect global cap: stop processing further steps if cap is hit
        if (globalTotalSentToday >= TOTAL_MAILBOX_DAILY_CAP) {
          console.log(`[CampaignFollowUp] Total mailbox cap reached mid-run — deferring remaining steps`);
          break;
        }

        try {
          // Check that parent campaign exists and is not paused/draft-cancelled
          const [campaign] = await dbConn
            .select()
            .from(emailCampaigns)
            .where(eq(emailCampaigns.id, step.campaignId));
          if (!campaign || campaign.status === "paused") {
            console.log(
              `[CampaignFollowUp] Skipping step ${step.id} — campaign ${step.campaignId} is paused or missing`,
            );
            continue;
          }

          // Deduplicate: skip contacts already processed for this step
          const alreadyProcessed = await dbConn
            .select({ email: campaignSequenceRecipients.email })
            .from(campaignSequenceRecipients)
            .where(eq(campaignSequenceRecipients.sequenceId, step.id));
          const alreadyProcessedSet = new Set(alreadyProcessed.map(r => r.email.toLowerCase()));

          // Get original recipients who were successfully sent the initial campaign
          const recipients = await dbConn
            .select()
            .from(emailCampaignRecipients)
            .where(
              and(
                eq(emailCampaignRecipients.campaignId, step.campaignId),
                eq(emailCampaignRecipients.status, "sent"),
              ),
            );

          let sentCount = 0;
          let failedCount = 0;
          let skippedCount = 0;

          for (const recipient of recipients) {
            // Respect global cap mid-loop
            if (globalTotalSentToday >= TOTAL_MAILBOX_DAILY_CAP) break;

            // Skip if already processed for this step
            if (alreadyProcessedSet.has(recipient.email.toLowerCase())) {
              skippedCount++;
              continue;
            }

            // Skip if suppressed/unsubscribed/bounced
            if (suppressedSet.has(recipient.email.toLowerCase())) {
              await dbConn.insert(campaignSequenceRecipients).values({
                sequenceId: step.id,
                campaignId: step.campaignId,
                email: recipient.email,
                status: "skipped",
              });
              skippedCount++;
              continue;
            }

            try {
              // Get unsubscribe token
              const [mc] = await dbConn
                .select()
                .from(marketingContacts)
                .where(eq(marketingContacts.email, recipient.email.toLowerCase()));
              const unsubToken = mc?.unsubscribeToken || "";
              const unsubLink = unsubToken
                ? `${BASE_URL}/unsubscribe?token=${unsubToken}`
                : `${BASE_URL}/unsubscribe`;

              // Simple merge field replacement for follow-up body
              let html = step.htmlBody || "";
              html = html.replace(/\{\{firstName\}\}/g, recipient.name?.split(" ")[0] || "");
              html = html.replace(/\{\{email\}\}/g, recipient.email);
              html = html.replace(/\{\{unsubscribeLink\}\}/g, unsubLink);

              await sendEmail(recipient.email, step.subject || "Follow-up", html);

              await dbConn.insert(campaignSequenceRecipients).values({
                sequenceId: step.id,
                campaignId: step.campaignId,
                email: recipient.email,
                status: "sent",
                sentAt: new Date(),
              });
              sentCount++;
              globalTotalSentToday++;
            } catch (err) {
              await dbConn.insert(campaignSequenceRecipients).values({
                sequenceId: step.id,
                campaignId: step.campaignId,
                email: recipient.email,
                status: "failed",
                error: err instanceof Error ? err.message : "Unknown error",
              });
              failedCount++;
            }
          }

          // Mark step as sent
          await dbConn
            .update(campaignSequences)
            .set({ status: "sent", sentAt: new Date(), sentCount, failedCount })
            .where(eq(campaignSequences.id, step.id));

          console.log(
            `[CampaignFollowUp] Step ${step.id} (Day ${step.delayDays}): sent=${sentCount} failed=${failedCount} skipped=${skippedCount}`,
          );
        } catch (stepErr) {
          console.error(
            `[CampaignFollowUp] Error processing step ${step.id}:`,
            stepErr,
          );
        }
      }

      console.log("[CampaignFollowUp] Follow-up check complete");
    } catch (error) {
      console.error("[CampaignFollowUp] Error:", error);
    }
  });

  // ── Automated New-Outreach Stagger Windows ───────────────────────────────
  // Fires at 08:30, 10:30, 12:30, 14:30, 16:30 UTC — weekdays only.
  // Each window processes up to NEW_OUTREACH_PER_WINDOW (5) emails from paused
  // campaigns that still have un-sent recipients.
  //
  // A campaign is "paused" after the first manual send if not all recipients
  // could be sent in that trigger (due to per-window and daily caps).
  // These cron windows automatically continue sending until all recipients are
  // covered or the daily cap is reached.

  async function processOutreachWindow(windowLabel: string) {
    console.log(`[CampaignOutreach] Processing window ${windowLabel}...`);

    try {
      // Redundant weekday guard (cron already uses 1-5 pattern)
      if (!isWeekday()) {
        console.log("[CampaignOutreach] Weekend — skipping");
        return;
      }

      const dbConn = await db.getDb();
      if (!dbConn) {
        console.log("[CampaignOutreach] No DB connection — skipping");
        return;
      }

      const { eq, and, or, sql } = await import("drizzle-orm");
      const {
        emailCampaigns,
        emailCampaignRecipients,
        emailUnsubscribes,
        marketingContacts,
        campaignSendLog,
        campaignSequenceRecipients,
        chatLeads,
        users,
      } = await import("../../drizzle/schema");

      const today = getTodayDateString();

      // ── Check global daily caps ──
      const [outreachResult] = await dbConn
        .select({ total: sql<number>`COALESCE(SUM(${campaignSendLog.sendCount}), 0)` })
        .from(campaignSendLog)
        .where(eq(campaignSendLog.sendDate, today));
      const outreachSentToday = Number(outreachResult?.total ?? 0);

      if (outreachSentToday >= NEW_OUTREACH_DAILY_CAP) {
        console.log(`[CampaignOutreach] New outreach cap (${NEW_OUTREACH_DAILY_CAP}) reached — skipping window`);
        return;
      }

      const [followupResult] = await dbConn
        .select({ total: sql<number>`COALESCE(COUNT(*), 0)` })
        .from(campaignSequenceRecipients)
        .where(and(
          eq(campaignSequenceRecipients.status, "sent"),
          sql`DATE(${campaignSequenceRecipients.sentAt}) = ${today}`,
        ));
      const followupSentToday = Number(followupResult?.total ?? 0);
      const totalSentToday = outreachSentToday + followupSentToday;

      if (totalSentToday >= TOTAL_MAILBOX_DAILY_CAP) {
        console.log(`[CampaignOutreach] Total mailbox cap (${TOTAL_MAILBOX_DAILY_CAP}) reached — skipping window`);
        return;
      }

      // ── Find paused campaigns ──
      const pausedCampaigns = await dbConn
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.status, "paused"));

      if (pausedCampaigns.length === 0) {
        console.log("[CampaignOutreach] No paused campaigns — nothing to process");
        return;
      }

      // ── Build global suppression set ──
      const suppressions = await dbConn
        .select({ email: emailUnsubscribes.email })
        .from(emailUnsubscribes);
      const suppressedSet = new Set(suppressions.map((s) => s.email.toLowerCase()));

      const mcBounced = await dbConn
        .select({ email: marketingContacts.email })
        .from(marketingContacts)
        .where(or(
          eq(marketingContacts.status, "unsubscribed"),
          eq(marketingContacts.status, "bounced"),
        ));
      for (const b of mcBounced) suppressedSet.add(b.email.toLowerCase());

      const BASE_URL = process.env.BASE_URL || "https://equiprofile.online";
      const { sendEmail: sendCampaignEmail } = await import("./email");
      const { applyMergeFields } = await import("./emailTemplates");

      // Local helpers (arrow functions — avoid strict-mode function-in-block restriction)
      const fmtDateGB = (d: Date = new Date()): string =>
        d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
      const firstNameOf = (name: string | null | undefined): string => {
        if (!name) return "";
        return name.split(/\s+/)[0].replace(/[^a-zA-Z'-]/g, "") || "";
      };

      let windowSentTotal = 0;

      for (const campaign of pausedCampaigns) {
        if (windowSentTotal >= NEW_OUTREACH_PER_WINDOW) break;
        if (outreachSentToday + windowSentTotal >= NEW_OUTREACH_DAILY_CAP) break;
        if (totalSentToday + windowSentTotal >= TOTAL_MAILBOX_DAILY_CAP) break;

        // ── Rebuild eligible recipient list for this campaign ──
        type Recipient = { email: string; name: string | null; unsubscribeToken?: string };
        let allRecipients: Recipient[] = [];

        if (campaign.segment === "leads") {
          const leads = await dbConn.select().from(chatLeads);
          allRecipients = leads.map((l) => ({ email: l.email, name: l.name }));
        } else if (campaign.segment === "marketing") {
          const conditions = [eq(marketingContacts.status, "active")];
          if (campaign.targetCountry) {
            conditions.push(eq(marketingContacts.country, campaign.targetCountry));
          }
          if (campaign.targetType) {
            conditions.push(eq(marketingContacts.contactType, campaign.targetType));
          }
          const contacts = await dbConn.select().from(marketingContacts).where(and(...conditions));
          allRecipients = contacts.map((c) => ({
            email: c.email,
            name: c.name,
            unsubscribeToken: c.unsubscribeToken,
          }));
        } else {
          let condition;
          if (campaign.segment === "trial") {
            condition = and(eq(users.subscriptionStatus, "trial"), eq(users.isActive, true));
          } else if (campaign.segment === "paid") {
            condition = and(eq(users.subscriptionStatus, "active"), eq(users.isActive, true));
          } else {
            condition = eq(users.isActive, true);
          }
          const userList = await dbConn
            .select({ email: users.email, name: users.name })
            .from(users)
            .where(condition);
          allRecipients = userList.filter((u) => u.email) as Recipient[];
        }

        // ── Exclude already-sent, already-skipped, and suppressed ──
        // "skipped" rows are pre-inserted by runCampaignAutopilot to mark
        // contacts from the wrong campaign family so they are never emailed
        // from this campaign. Treat them the same as already-sent.
        const alreadySent = await dbConn
          .select({ email: emailCampaignRecipients.email })
          .from(emailCampaignRecipients)
          .where(and(
            eq(emailCampaignRecipients.campaignId, campaign.id),
            or(
              eq(emailCampaignRecipients.status, "sent"),
              eq(emailCampaignRecipients.status, "skipped"),
            ),
          ));
        const alreadySentSet = new Set(alreadySent.map((r) => r.email.toLowerCase()));

        const seen = new Set<string>();
        const eligibleRecipients = allRecipients.filter((r) => {
          if (!r.email || seen.has(r.email.toLowerCase())) return false;
          if (suppressedSet.has(r.email.toLowerCase())) return false;
          if (alreadySentSet.has(r.email.toLowerCase())) return false;
          seen.add(r.email.toLowerCase());
          return true;
        });

        if (eligibleRecipients.length === 0) {
          // Campaign is fully sent — mark it done
          await dbConn
            .update(emailCampaigns)
            .set({ status: "sent", sentAt: new Date() })
            .where(eq(emailCampaigns.id, campaign.id));
          console.log(`[CampaignOutreach] Campaign ${campaign.id} fully sent — marking as sent`);
          continue;
        }

        // ── Determine how many to send this window ──
        const windowRemaining = NEW_OUTREACH_PER_WINDOW - windowSentTotal;
        const outreachRemaining = NEW_OUTREACH_DAILY_CAP - (outreachSentToday + windowSentTotal);
        const globalRemaining = TOTAL_MAILBOX_DAILY_CAP - (totalSentToday + windowSentTotal);
        const sendBatch = eligibleRecipients.slice(
          0,
          Math.min(windowRemaining, outreachRemaining, globalRemaining),
        );

        const currentDate = fmtDateGB();
        let sentCount = 0;
        let failedCount = 0;

        // ── Look up existing send log entry ──
        const [todayLog] = await dbConn
          .select({ sendCount: campaignSendLog.sendCount })
          .from(campaignSendLog)
          .where(and(
            eq(campaignSendLog.campaignId, campaign.id),
            eq(campaignSendLog.sendDate, today),
          ));
        const alreadySentTodayCount = todayLog?.sendCount || 0;

        for (const recipient of sendBatch) {
          try {
            let unsubToken = recipient.unsubscribeToken || "";
            if (!unsubToken) {
              const [mc] = await dbConn
                .select()
                .from(marketingContacts)
                .where(eq(marketingContacts.email, recipient.email.toLowerCase()));
              unsubToken = mc?.unsubscribeToken || "";
            }
            const unsubLink = unsubToken
              ? `${BASE_URL}/unsubscribe?token=${unsubToken}`
              : `${BASE_URL}/unsubscribe`;

            const html = applyMergeFields(campaign.htmlBody, {
              firstName: firstNameOf(recipient.name),
              email: recipient.email,
              currentDate,
              unsubscribeLink: unsubLink,
            });

            await sendCampaignEmail(recipient.email, campaign.subject, html, unsubLink);

            await dbConn.insert(emailCampaignRecipients).values({
              campaignId: campaign.id,
              email: recipient.email,
              name: recipient.name || null,
              status: "sent",
              sentAt: new Date(),
            });
            sentCount++;
            windowSentTotal++;

            // Update lastContactedAt
            await dbConn.update(marketingContacts)
              .set({ lastContactedAt: new Date() })
              .where(eq(marketingContacts.email, recipient.email.toLowerCase()))
              .catch(() => {});
          } catch (err) {
            await dbConn.insert(emailCampaignRecipients).values({
              campaignId: campaign.id,
              email: recipient.email,
              name: recipient.name || null,
              status: "failed",
              error: err instanceof Error ? err.message : "Unknown error",
            });
            failedCount++;
          }
        }

        // ── Update campaign send log ──
        if (sentCount > 0) {
          if (todayLog) {
            await dbConn.update(campaignSendLog)
              .set({ sendCount: alreadySentTodayCount + sentCount })
              .where(and(
                eq(campaignSendLog.campaignId, campaign.id),
                eq(campaignSendLog.sendDate, today),
              ));
          } else {
            await dbConn.insert(campaignSendLog).values({
              campaignId: campaign.id,
              sendDate: today,
              sendCount: sentCount,
            });
          }
        }

        // ── Update campaign record ──
        const updatedSentCount = (campaign.sentCount || 0) + sentCount;
        const updatedFailedCount = (campaign.failedCount || 0) + failedCount;
        // After this batch, recheck if fully sent
        const remainingAfterBatch = eligibleRecipients.length - sendBatch.length;
        const newStatus = remainingAfterBatch <= 0 ? "sent" : "paused";

        await dbConn
          .update(emailCampaigns)
          .set({
            status: newStatus,
            sentCount: updatedSentCount,
            failedCount: updatedFailedCount,
            sentToday: alreadySentTodayCount + sentCount,
            lastSendDate: today,
            sentAt: newStatus === "sent" ? new Date() : campaign.sentAt,
            pausedAt: newStatus === "paused" ? new Date() : null,
          })
          .where(eq(emailCampaigns.id, campaign.id));

        console.log(
          `[CampaignOutreach] Window ${windowLabel}: campaign ${campaign.id} — sent=${sentCount} failed=${failedCount} remaining≈${remainingAfterBatch} status=${newStatus}`,
        );
      }

      console.log(`[CampaignOutreach] Window ${windowLabel} complete — total sent this window: ${windowSentTotal}`);
    } catch (error) {
      console.error(`[CampaignOutreach] Error in window ${windowLabel}:`, error);
    }
  }

  // Schedule 5 send windows per weekday (1-5 = Mon–Fri)
  for (const w of SEND_WINDOWS) {
    const cronExpr = `${w.minute} ${w.hour} * * 1-5`;
    const label = w.label;
    cron.schedule(cronExpr, () => {
      processOutreachWindow(label).catch((err) =>
        console.error(`[CampaignOutreach] Unhandled error in window ${label}:`, err),
      );
    });
  }
  console.log("[CampaignOutreach] Scheduled 5 automated outreach windows:", SEND_WINDOWS.map(w => w.label).join(", "));

  // ── Campaign Reply Fetcher ────────────────────────────────────────────────
  // Polls the sending mailbox for incoming replies every 15 minutes during
  // business hours (08:00–19:00 UTC) on weekdays.
  cron.schedule("*/15 8-19 * * 1-5", () => {
    import("./campaignReplyFetcher")
      .then(({ fetchCampaignReplies }) =>
        fetchCampaignReplies(50).then((count) => {
          if (count > 0) {
            console.log(`[CampaignReplies] Fetched ${count} new reply(s)`);
          }
        }),
      )
      .catch((err) => console.error("[CampaignReplies] Error:", err));
  });
  console.log("[CampaignReplies] Reply poller scheduled (every 15 min, weekdays 08:00–19:00 UTC)");

  // ── Duplicate-Person Scan ─────────────────────────────────────────────────
  // Runs at 07:00 UTC on weekdays, 30 minutes BEFORE the autopilot run so that
  // newly flagged suspected duplicates are already excluded when the autopilot
  // classifies contacts at 07:30.
  cron.schedule("0 7 * * 1-5", async () => {
    if (!isWeekday()) return;
    console.log("[DupScan] Running daily duplicate-person scan...");
    try {
      const dbConn = await db.getDb();
      if (!dbConn) { console.log("[DupScan] No DB — skipping"); return; }

      const { eq: _eq } = await import("drizzle-orm");
      const { marketingContacts: _mc } = await import("../../drizzle/schema");
      const { detectDuplicatePeople: _detect } = await import("./dupPersonDetection");

      const contacts = await dbConn.select({
        id: _mc.id,
        email: _mc.email,
        name: _mc.name,
        businessName: _mc.businessName,
        country: _mc.country,
        region: _mc.region,
        contactType: _mc.contactType,
        suspectedDuplicateOf: _mc.suspectedDuplicateOf,
      }).from(_mc).where(_eq(_mc.status, "active"));

      const results = _detect(contacts);
      const alreadyFlagged = new Set(contacts.filter(c => c.suspectedDuplicateOf != null).map(c => c.id));
      let newlyFlagged = 0;
      for (const r of results) {
        if (alreadyFlagged.has(r.contactId)) continue;
        await dbConn.update(_mc)
          .set({ suspectedDuplicateOf: r.suspectedDuplicateOf, dupRiskScore: r.riskScore })
          .where(_eq(_mc.id, r.contactId));
        newlyFlagged++;
      }
      console.log(`[DupScan] Complete — scanned ${contacts.length}, newly flagged ${newlyFlagged}`);
    } catch (err) {
      console.error("[DupScan] Error:", err);
    }
  });
  console.log("[DupScan] Daily duplicate scan scheduled (07:00 UTC weekdays)");

  // ── Campaign Autopilot ────────────────────────────────────────────────────
  // Runs at 07:30 UTC on weekdays, before the first send window (08:30).
  // Classifies any new uncontacted marketing contacts into Management or
  // Academy autopilot campaigns and marks them as "paused" so the send
  // windows pick them up within the same day.
  cron.schedule("30 7 * * 1-5", async () => {
    if (!isWeekday()) return;
    console.log("[CampaignAutopilot] Running daily contact classification...");

    try {
      const dbConn = await db.getDb();
      if (!dbConn) {
        console.log("[CampaignAutopilot] No DB — skipping");
        return;
      }

      const { eq: _eq, inArray: _inArray, sql: _drizzleSql } = await import("drizzle-orm");
      const {
        marketingContacts: _mc,
        emailCampaignRecipients: _ecr,
        emailCampaigns: _ec,
        emailUnsubscribes: _eu,
      } = await import("../../drizzle/schema");
      const { CAMPAIGN_TEMPLATES: _templates } = await import("./emailTemplates");

      const ACADEMY_TYPES = new Set(["school", "college", "academy", "student", "teacher", "instructor"]);

      const allContacts = await dbConn.select().from(_mc).where(_eq(_mc.status, "active"));
      const suppressed = await dbConn.select({ email: _eu.email }).from(_eu);
      const suppressedSet = new Set(suppressed.map((s) => s.email.toLowerCase()));

      const sentRows = await dbConn.select({ email: _ecr.email }).from(_ecr).where(_eq(_ecr.status, "sent"));
      const sentSet = new Set(sentRows.map((r) => r.email.toLowerCase()));

      const autopilotCampaigns = await dbConn
        .select({ id: _ec.id })
        .from(_ec)
        .where(_drizzleSql`${_ec.name} LIKE 'Autopilot — %'`);
      const apIds = autopilotCampaigns.map((r) => r.id);

      const enrolledSet = new Set<string>();
      if (apIds.length > 0) {
        const enrolledRows = await dbConn.select({ email: _ecr.email }).from(_ecr).where(_inArray(_ecr.campaignId, apIds));
        for (const r of enrolledRows) enrolledSet.add(r.email.toLowerCase());
      }

      const management: Array<{ email: string; name: string | null }> = [];
      const academy: Array<{ email: string; name: string | null }> = [];

      for (const c of allContacts) {
        const email = c.email?.toLowerCase();
        if (!email || !email.includes("@")) continue;
        if (suppressedSet.has(email) || sentSet.has(email) || enrolledSet.has(email)) continue;
        // Skip contacts flagged as suspected duplicates — admin must clear flag
        if (c.suspectedDuplicateOf != null) continue;
        (ACADEMY_TYPES.has(c.contactType || "") ? academy : management).push({ email, name: c.name });
      }

      if (management.length === 0 && academy.length === 0) {
        console.log("[CampaignAutopilot] No unenrolled contacts — nothing to do");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const ADMIN_USER_ID = 1; // system / scheduler user

      if (management.length > 0) {
        const mgmtTpl = _templates.find((t) => t.id === "mgmt-intro");
        if (mgmtTpl) {
          const ins = await dbConn.insert(_ec).values({
            name: `Autopilot — Management (${today})`,
            subject: "The professional platform built for equestrian businesses",
            htmlBody: mgmtTpl.getHtml(),
            templateId: "mgmt-intro",
            segment: "marketing",
            customFilter: null,
            targetCountry: null,
            targetType: null,
            dailyLimit: 25,
            sentToday: 0,
            lastSendDate: null,
            recipientCount: management.length,
            sentCount: 0,
            failedCount: 0,
            status: "paused",
            sentAt: null,
            pausedAt: new Date(),
            sentByUserId: ADMIN_USER_ID,
          });
          const campId = Number(ins[0].insertId);
          if (academy.length > 0) {
            const vals = academy.map((c) => ({ campaignId: campId, email: c.email, name: c.name, status: "skipped" as const }));
            for (let i = 0; i < vals.length; i += 500) {
              await dbConn.insert(_ecr).values(vals.slice(i, i + 500));
            }
          }
          console.log(`[CampaignAutopilot] Management campaign ${campId} created — ${management.length} contacts enrolled`);
        }
      }

      if (academy.length > 0) {
        const acaTpl = _templates.find((t) => t.id === "academy-intro");
        if (acaTpl) {
          const ins = await dbConn.insert(_ec).values({
            name: `Autopilot — Academy (${today})`,
            subject: "A structured learning platform designed for equestrian schools",
            htmlBody: acaTpl.getHtml(),
            templateId: "academy-intro",
            segment: "marketing",
            customFilter: null,
            targetCountry: null,
            targetType: null,
            dailyLimit: 15,
            sentToday: 0,
            lastSendDate: null,
            recipientCount: academy.length,
            sentCount: 0,
            failedCount: 0,
            status: "paused",
            sentAt: null,
            pausedAt: new Date(),
            sentByUserId: ADMIN_USER_ID,
          });
          const campId = Number(ins[0].insertId);
          if (management.length > 0) {
            const vals = management.map((c) => ({ campaignId: campId, email: c.email, name: c.name, status: "skipped" as const }));
            for (let i = 0; i < vals.length; i += 500) {
              await dbConn.insert(_ecr).values(vals.slice(i, i + 500));
            }
          }
          console.log(`[CampaignAutopilot] Academy campaign ${campId} created — ${academy.length} contacts enrolled`);
        }
      }
    } catch (err) {
      console.error("[CampaignAutopilot] Error:", err);
    }
  });
  console.log("[CampaignAutopilot] Daily autopilot scheduled (07:30 UTC weekdays)");

  isRunning = true;
  console.log("[Reminders] Scheduler started successfully");
}

export function stopReminderScheduler() {
  // Note: node-cron doesn't provide a direct way to stop all tasks
  // In production, you might want to keep track of task references
  isRunning = false;
  console.log("[Reminders] Scheduler stopped");
}
