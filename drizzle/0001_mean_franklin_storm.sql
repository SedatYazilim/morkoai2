CREATE TABLE `generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL DEFAULT 0,
	`prompt` text NOT NULL,
	`imageUrl` text NOT NULL,
	`imageKey` text NOT NULL,
	`model` varchar(100),
	`width` int,
	`height` int,
	`seed` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
