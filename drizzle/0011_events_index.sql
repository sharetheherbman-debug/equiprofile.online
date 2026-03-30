-- Migration 0011: Add performance index for calendar.getEvents query
-- This index covers the most common calendar query pattern:
--   WHERE userId = ? AND startDate BETWEEN ? AND ? ORDER BY startDate

CREATE INDEX IF NOT EXISTS `events_userId_startDate_idx`
  ON `events` (`userId`, `startDate`);
