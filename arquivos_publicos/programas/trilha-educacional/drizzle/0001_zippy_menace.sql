CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(80) NOT NULL,
	`title` varchar(140) NOT NULL,
	`description` text NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_user_slug_idx` UNIQUE(`userId`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `learning_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityKind` enum('diagnostico','aula','quiz','simulado') NOT NULL,
	`percent` int NOT NULL DEFAULT 0,
	`completedCount` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learning_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `learning_progress_user_kind_idx` UNIQUE(`userId`,`activityKind`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityKind` enum('quiz','simulado') NOT NULL,
	`subject` varchar(160) NOT NULL,
	`score` int NOT NULL,
	`total` int NOT NULL,
	`feedback` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`grade` varchar(120),
	`goal` varchar(160),
	`diagnosticCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `student_profiles_user_id_idx` UNIQUE(`userId`)
);
