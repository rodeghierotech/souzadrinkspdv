CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `produto` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`preco` real NOT NULL,
	`codigo_barras` text,
	`categoria` text DEFAULT 'outro' NOT NULL,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `produto_codigo_barras_unique` ON `produto` (`codigo_barras`);
--> statement-breakpoint
CREATE TABLE `comanda` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identificador` text NOT NULL,
	`status` text DEFAULT 'aberta' NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`observacao` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`fechada_at` integer
);
--> statement-breakpoint
CREATE TABLE `comanda_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comanda_id` integer NOT NULL,
	`produto_id` integer NOT NULL,
	`quantidade` integer DEFAULT 1 NOT NULL,
	`preco_unitario` real NOT NULL,
	`subtotal` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`comanda_id`) REFERENCES `comanda`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`produto_id`) REFERENCES `produto`(`id`) ON UPDATE no action ON DELETE no action
);
