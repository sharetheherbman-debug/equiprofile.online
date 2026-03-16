-- Migration 0004: Add notes table for voice dictation and general notes
-- Safe to run multiple times: CREATE TABLE uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `notes` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `userId`      INT          NOT NULL,
  `horseId`     INT          DEFAULT NULL,
  `title`       VARCHAR(200) DEFAULT NULL,
  `content`     TEXT         NOT NULL,
  `transcribed` BOOLEAN      NOT NULL DEFAULT FALSE,
  `tags`        TEXT         DEFAULT NULL,
  `createdAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notes_userId_idx` (`userId`),
  KEY `notes_horseId_idx` (`horseId`)
);
