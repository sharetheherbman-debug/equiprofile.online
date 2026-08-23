-- Migration 0013: Add email verification token columns.
-- Kept additive and idempotent without a stored procedure because Drizzle's
-- mysql2 migration connection executes statements individually.

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `verificationToken` varchar(255);
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `verificationTokenExpiry` timestamp NULL;
