CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backupLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backupType` enum('full','incremental','users','horses') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL,
	`fileName` varchar(255),
	`fileSize` int,
	`fileUrl` text,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `backupLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`horseId` int,
	`healthRecordId` int,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`fileSize` int,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`category` enum('health','registration','insurance','competition','other') DEFAULT 'other',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedingPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`horseId` int NOT NULL,
	`userId` int NOT NULL,
	`feedType` varchar(100) NOT NULL,
	`brandName` varchar(100),
	`quantity` varchar(50) NOT NULL,
	`unit` varchar(20),
	`mealTime` enum('morning','midday','evening','night') NOT NULL,
	`frequency` varchar(50) DEFAULT 'daily',
	`specialInstructions` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedingPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`horseId` int NOT NULL,
	`userId` int NOT NULL,
	`recordType` enum('vaccination','deworming','dental','farrier','veterinary','injury','medication','other') NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`recordDate` date NOT NULL,
	`nextDueDate` date,
	`vetName` varchar(100),
	`vetPhone` varchar(20),
	`vetClinic` varchar(200),
	`cost` int,
	`documentUrl` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `horses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`breed` varchar(100),
	`age` int,
	`dateOfBirth` date,
	`height` int,
	`weight` int,
	`color` varchar(50),
	`gender` enum('stallion','mare','gelding'),
	`discipline` varchar(100),
	`level` varchar(50),
	`registrationNumber` varchar(100),
	`microchipNumber` varchar(100),
	`notes` text,
	`photoUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `horses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`settingType` enum('string','number','boolean','json') DEFAULT 'string',
	`description` text,
	`isEncrypted` boolean DEFAULT false,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `trainingSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`horseId` int NOT NULL,
	`userId` int NOT NULL,
	`sessionDate` date NOT NULL,
	`startTime` varchar(10),
	`endTime` varchar(10),
	`duration` int,
	`sessionType` enum('flatwork','jumping','hacking','lunging','groundwork','competition','lesson','other') NOT NULL,
	`discipline` varchar(100),
	`trainer` varchar(100),
	`location` varchar(200),
	`goals` text,
	`exercises` text,
	`notes` text,
	`performance` enum('excellent','good','average','poor'),
	`weather` varchar(100),
	`temperature` int,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weatherLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`location` varchar(255) NOT NULL,
	`temperature` int,
	`humidity` int,
	`windSpeed` int,
	`precipitation` int,
	`conditions` varchar(100),
	`uvIndex` int,
	`visibility` int,
	`ridingRecommendation` enum('excellent','good','fair','poor','not_recommended'),
	`aiAnalysis` text,
	`checkedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weatherLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('trial','active','cancelled','overdue','expired') DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('monthly','yearly') DEFAULT 'monthly';--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `lastPaymentAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isSuspended` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `suspendedReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `profileImageUrl` text;