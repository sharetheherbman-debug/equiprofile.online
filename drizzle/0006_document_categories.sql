-- Migration 0006: Extend documents.category ENUM with new category values
-- Safe to run multiple times: ALTER COLUMN MODIFY is idempotent for ENUM
-- (MySQL replaces the full definition on each MODIFY).
--
-- New categories added:
--   passport   – equine passport / FEI documents
--   training   – training records / session logs
--   feeding    – feeding / nutrition plans
--   invoice    – billing invoices / receipts

ALTER TABLE `documents`
  MODIFY COLUMN `category` ENUM(
    'health',
    'passport',
    'registration',
    'insurance',
    'competition',
    'training',
    'feeding',
    'invoice',
    'other'
  ) DEFAULT 'other';
