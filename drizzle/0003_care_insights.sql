-- Migration: Add Care Insights System
-- Date: 2026-01-27

-- Care Scores table
CREATE TABLE `careScores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `horseId` INT NOT NULL,
  `userId` INT NOT NULL,
  `date` DATE NOT NULL,
  `overallScore` INT NOT NULL,
  `taskCompletionScore` INT NOT NULL,
  `medicationComplianceScore` INT NOT NULL,
  `healthEventScore` INT NOT NULL,
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_careScores_horseId` (`horseId`),
  INDEX `idx_careScores_userId` (`userId`),
  INDEX `idx_careScores_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medication Schedules table
CREATE TABLE `medicationSchedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `horseId` INT NOT NULL,
  `userId` INT NOT NULL,
  `medicationName` VARCHAR(200) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL,
  `frequency` ENUM('daily', 'twice_daily', 'three_times_daily', 'weekly', 'biweekly', 'monthly', 'as_needed') NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE,
  `timeOfDay` ENUM('morning', 'afternoon', 'evening', 'night', 'any'),
  `specialInstructions` TEXT,
  `isActive` BOOLEAN DEFAULT TRUE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_medicationSchedules_horseId` (`horseId`),
  INDEX `idx_medicationSchedules_userId` (`userId`),
  INDEX `idx_medicationSchedules_isActive` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medication Logs table
CREATE TABLE `medicationLogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `scheduleId` INT NOT NULL,
  `horseId` INT NOT NULL,
  `userId` INT NOT NULL,
  `administeredAt` TIMESTAMP NOT NULL,
  `administeredBy` VARCHAR(100),
  `dosageGiven` VARCHAR(100),
  `notes` TEXT,
  `wasSkipped` BOOLEAN DEFAULT FALSE NOT NULL,
  `skipReason` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_medicationLogs_scheduleId` (`scheduleId`),
  INDEX `idx_medicationLogs_horseId` (`horseId`),
  INDEX `idx_medicationLogs_userId` (`userId`),
  INDEX `idx_medicationLogs_administeredAt` (`administeredAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Behavior Logs table
CREATE TABLE `behaviorLogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `horseId` INT NOT NULL,
  `userId` INT NOT NULL,
  `logDate` DATE NOT NULL,
  `weight` INT,
  `appetite` ENUM('excellent', 'good', 'fair', 'poor'),
  `energy` ENUM('high', 'normal', 'low'),
  `sorenessScore` INT,
  `rideQuality` ENUM('excellent', 'good', 'fair', 'poor', 'skipped'),
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_behaviorLogs_horseId` (`horseId`),
  INDEX `idx_behaviorLogs_userId` (`userId`),
  INDEX `idx_behaviorLogs_logDate` (`logDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Health Alerts table
CREATE TABLE `healthAlerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `horseId` INT NOT NULL,
  `userId` INT NOT NULL,
  `alertType` ENUM('repeat_injury', 'weight_loss', 'reduced_activity', 'medication_missed', 'overdue_health') NOT NULL,
  `severity` ENUM('low', 'medium', 'high') NOT NULL,
  `message` TEXT NOT NULL,
  `isResolved` BOOLEAN DEFAULT FALSE NOT NULL,
  `resolvedAt` TIMESTAMP,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_healthAlerts_horseId` (`horseId`),
  INDEX `idx_healthAlerts_userId` (`userId`),
  INDEX `idx_healthAlerts_isResolved` (`isResolved`),
  INDEX `idx_healthAlerts_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
