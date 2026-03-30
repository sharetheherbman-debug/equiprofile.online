-- Migration 0009: Add equine passport identification fields to horses table
-- Adds passportNumber, feiId, and ueln columns.
-- Safe to run on new and existing installations.

ALTER TABLE `horses`
  ADD COLUMN `passportNumber` varchar(100) DEFAULT NULL,
  ADD COLUMN `feiId` varchar(100) DEFAULT NULL,
  ADD COLUMN `ueln` varchar(100) DEFAULT NULL;
