-- Migration 0002: Add missing user columns
-- Adds columns that exist in schema.ts but were absent from migration 0001.
-- Drizzle-kit migrate tracks applied migrations in __drizzle_migrations so
-- this file only ever runs once per database.  All ADD COLUMN statements use
-- conditional stored procedures so they are safe even on DBs that already
-- have some of these columns (e.g. if columns were added manually).

-- Helper procedure to add a column only if it does not already exist
DROP PROCEDURE IF EXISTS _add_col;--> statement-breakpoint
CREATE PROCEDURE _add_col(IN tbl VARCHAR(64), IN col VARCHAR(64), IN def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD `', col, '` ', def);
    PREPARE _s FROM @sql;
    EXECUTE _s;
    DEALLOCATE PREPARE _s;
  END IF;
END;--> statement-breakpoint

CALL _add_col('users', 'passwordHash',      'varchar(255)');--> statement-breakpoint
CALL _add_col('users', 'emailVerified',     'boolean DEFAULT false');--> statement-breakpoint
CALL _add_col('users', 'resetToken',        'varchar(255)');--> statement-breakpoint
CALL _add_col('users', 'resetTokenExpiry',  'timestamp NULL');--> statement-breakpoint
CALL _add_col('users', 'latitude',          'varchar(20)');--> statement-breakpoint
CALL _add_col('users', 'longitude',         'varchar(20)');--> statement-breakpoint
CALL _add_col('users', 'storageUsedBytes',  'int NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _add_col('users', 'storageQuotaBytes', 'int NOT NULL DEFAULT 104857600');--> statement-breakpoint
CALL _add_col('users', 'preferences',       'text');--> statement-breakpoint
CALL _add_col('users', 'language',          "varchar(10) DEFAULT 'en'");--> statement-breakpoint
CALL _add_col('users', 'theme',             "enum('light','dark','system') DEFAULT 'system'");--> statement-breakpoint

DROP PROCEDURE IF EXISTS _add_col;
