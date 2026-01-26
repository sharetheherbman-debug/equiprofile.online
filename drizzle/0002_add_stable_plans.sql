-- Migration: Add stable subscription plans
-- Date: 2026-01-26

-- Modify subscriptionPlan enum to include stable_monthly and stable_yearly
ALTER TABLE `users` MODIFY COLUMN `subscriptionPlan` 
  ENUM('monthly', 'yearly', 'stable_monthly', 'stable_yearly') DEFAULT 'monthly';
