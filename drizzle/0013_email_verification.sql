-- Migration 0013: Add email verification token columns
-- Adds verificationToken and verificationTokenExpiry for email verification flow.

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

CALL _add_col('users', 'verificationToken',       'varchar(255)');--> statement-breakpoint
CALL _add_col('users', 'verificationTokenExpiry',  'timestamp NULL');--> statement-breakpoint

DROP PROCEDURE IF EXISTS _add_col;
