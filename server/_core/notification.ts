/**
 * Notification Service - DISABLED
 * 
 * This feature requires Forge API which has been removed.
 * To enable notifications, integrate with a notification service like Firebase Cloud Messaging,
 * Pusher, or implement email notifications via SMTP.
 */
import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  throw new TRPCError({
    code: "SERVICE_UNAVAILABLE",
    message: "Notification service is not available. This feature requires additional configuration.",
  });
}
