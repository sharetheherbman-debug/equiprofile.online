-- Migration 0003: Add chatLeads, contactSubmissions, and siteSettings tables
-- Safe to run multiple times: all CREATE TABLE statements use IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `chatLeads` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `leadId`     VARCHAR(40)  NOT NULL,
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(320) NOT NULL,
  `message`    TEXT,
  `source`     VARCHAR(50)  DEFAULT 'chat',
  `transcript` TEXT,
  `ipHash`     VARCHAR(64),
  `createdAt`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chatLeads_leadId_unique` (`leadId`)
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `contactSubmissions` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(200) NOT NULL,
  `email`     VARCHAR(320) NOT NULL,
  `subject`   VARCHAR(500) NOT NULL,
  `message`   TEXT         NOT NULL,
  `ipHash`    VARCHAR(64),
  `createdAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `siteSettings` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `key`       VARCHAR(100) NOT NULL,
  `value`     TEXT,
  `updatedAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `siteSettings_key_unique` (`key`)
);
