-- Migration 0002: Add missing user columns
-- Adds columns that exist in schema.ts but were absent from migration 0001.
-- Every statement is additive and idempotent so fresh and pre-existing databases
-- can be migrated without a stored-procedure delimiter, which Drizzle does not
-- execute through the mysql2 migration connection.

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `passwordHash` varchar(255);
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `emailVerified` boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `resetToken` varchar(255);
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `resetTokenExpiry` timestamp NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `latitude` varchar(20);
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `longitude` varchar(20);
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `storageUsedBytes` int NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `storageQuotaBytes` int NOT NULL DEFAULT 104857600;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `preferences` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `language` varchar(10) DEFAULT 'en';
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `theme` enum('light','dark','system') DEFAULT 'system';
