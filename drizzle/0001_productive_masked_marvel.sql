CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`body` text NOT NULL,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uploaderUserId` int NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`category` enum('photo','document') NOT NULL,
	`caption` text,
	`takenDate` timestamp,
	`location` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_people` (
	`mediaId` int NOT NULL,
	`personId` int NOT NULL,
	CONSTRAINT `media_people_mediaId_personId_pk` PRIMARY KEY(`mediaId`,`personId`)
);
--> statement-breakpoint
CREATE TABLE `partnership_children` (
	`partnershipId` int NOT NULL,
	`childId` int NOT NULL,
	CONSTRAINT `partnership_children_partnershipId_childId_pk` PRIMARY KEY(`partnershipId`,`childId`)
);
--> statement-breakpoint
CREATE TABLE `partnerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partner1Id` int NOT NULL,
	`partner2Id` int NOT NULL,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`birthDate` timestamp,
	`deathDate` timestamp,
	`birthPlace` text,
	`deathPlace` text,
	`bioMarkdown` text,
	`primaryMediaId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `people_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(255),
	`approved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_personId_people_id_fk` FOREIGN KEY (`personId`) REFERENCES `people`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_uploaderUserId_users_id_fk` FOREIGN KEY (`uploaderUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_people` ADD CONSTRAINT `media_people_mediaId_media_id_fk` FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_people` ADD CONSTRAINT `media_people_personId_people_id_fk` FOREIGN KEY (`personId`) REFERENCES `people`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnership_children` ADD CONSTRAINT `partnership_children_partnershipId_partnerships_id_fk` FOREIGN KEY (`partnershipId`) REFERENCES `partnerships`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnership_children` ADD CONSTRAINT `partnership_children_childId_people_id_fk` FOREIGN KEY (`childId`) REFERENCES `people`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnerships` ADD CONSTRAINT `partnerships_partner1Id_people_id_fk` FOREIGN KEY (`partner1Id`) REFERENCES `people`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnerships` ADD CONSTRAINT `partnerships_partner2Id_people_id_fk` FOREIGN KEY (`partner2Id`) REFERENCES `people`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;