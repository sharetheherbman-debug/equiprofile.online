-- Migration 0010: Add 'gallery' to documents.category ENUM
-- Safe to run multiple times: MODIFY COLUMN replaces the full ENUM definition.

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
    'gallery',
    'other'
  ) DEFAULT 'other';
