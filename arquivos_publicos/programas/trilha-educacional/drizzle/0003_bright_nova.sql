CREATE TABLE `diagnostic_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`total` int NOT NULL,
	`subjectScores` text NOT NULL,
	`weakTopics` text,
	`answers` text NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnostic_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_plan_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`dayOrder` int NOT NULL,
	`subject` varchar(120) NOT NULL,
	`title` varchar(180) NOT NULL,
	`activityKind` enum('aula','quiz','simulado') NOT NULL,
	`durationMinutes` int NOT NULL,
	`rationale` text NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	CONSTRAINT `study_plan_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`summary` text NOT NULL,
	`weeklyMinutes` int NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `study_plans_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `study_plans_user_id_idx` UNIQUE(`userId`)
);
