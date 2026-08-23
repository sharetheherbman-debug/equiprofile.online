-- Phase 3: campaign-system enhancements.
-- Additive and idempotent: application bootstrap can encounter an older schema
-- whose columns already exist before this migration is recorded.

-- Marketing contacts: country, lead focus, organisation and contact history.
ALTER TABLE `marketingContacts`
  ADD COLUMN IF NOT EXISTS `country` varchar(100) DEFAULT NULL AFTER `region`,
  ADD COLUMN IF NOT EXISTS `leadFocus` varchar(200) DEFAULT NULL AFTER `country`,
  ADD COLUMN IF NOT EXISTS `organizationName` varchar(300) DEFAULT NULL AFTER `leadFocus`,
  ADD COLUMN IF NOT EXISTS `lastContactedAt` timestamp NULL DEFAULT NULL AFTER `updatedAt`;
--> statement-breakpoint

-- Add indexes for country-based segmentation queries.
ALTER TABLE `marketingContacts`
  ADD INDEX IF NOT EXISTS `idx_mc_country` (`country`),
  ADD INDEX IF NOT EXISTS `idx_mc_contact_type` (`contactType`);
--> statement-breakpoint

-- Email campaigns: targeting, daily limits and pause state.
ALTER TABLE `emailCampaigns`
  ADD COLUMN IF NOT EXISTS `targetCountry` varchar(100) DEFAULT NULL AFTER `customFilter`,
  ADD COLUMN IF NOT EXISTS `targetType` varchar(100) DEFAULT NULL AFTER `targetCountry`,
  ADD COLUMN IF NOT EXISTS `dailyLimit` int DEFAULT 50 AFTER `targetType`,
  ADD COLUMN IF NOT EXISTS `sentToday` int DEFAULT 0 AFTER `dailyLimit`,
  ADD COLUMN IF NOT EXISTS `lastSendDate` varchar(10) DEFAULT NULL AFTER `sentToday`,
  ADD COLUMN IF NOT EXISTS `pausedAt` timestamp NULL DEFAULT NULL AFTER `lastSendDate`;
--> statement-breakpoint

-- Campaign sequences: optional scheduled follow-up date.
ALTER TABLE `campaignSequences`
  ADD COLUMN IF NOT EXISTS `scheduledDate` varchar(10) DEFAULT NULL AFTER `delayDays`;
--> statement-breakpoint

-- Campaign send log for daily-limit tracking.
CREATE TABLE IF NOT EXISTS `campaignSendLog` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `campaignId` int NOT NULL,
  `sendDate` date NOT NULL,
  `sendCount` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_csl_campaign_date` (`campaignId`, `sendDate`)
);
