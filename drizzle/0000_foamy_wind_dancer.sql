CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`hide_globally` integer DEFAULT false NOT NULL,
	`feed_count` integer,
	`total_unread` integer
);
--> statement-breakpoint
CREATE TABLE `entries` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`feed_id` integer NOT NULL,
	`title` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`comments_url` text DEFAULT '' NOT NULL,
	`author` text DEFAULT '' NOT NULL,
	`hash` text DEFAULT '' NOT NULL,
	`published_at` text NOT NULL,
	`created_at` text NOT NULL,
	`changed_at` text,
	`status` text DEFAULT 'unread' NOT NULL,
	`share_code` text DEFAULT '' NOT NULL,
	`starred` integer DEFAULT false NOT NULL,
	`reading_time` integer DEFAULT 0 NOT NULL,
	`enclosures` text,
	`tags` text,
	`cover_image_url` text,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `entries_feed_id_idx` ON `entries` (`feed_id`);--> statement-breakpoint
CREATE INDEX `entries_status_published_idx` ON `entries` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `entries_published_at_idx` ON `entries` (`published_at`);--> statement-breakpoint
CREATE INDEX `entries_starred_idx` ON `entries` (`starred`);--> statement-breakpoint
CREATE TABLE `entry_content` (
	`entry_id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feeds` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`site_url` text DEFAULT '' NOT NULL,
	`feed_url` text NOT NULL,
	`checked_at` text DEFAULT '' NOT NULL,
	`etag_header` text DEFAULT '' NOT NULL,
	`last_modified_header` text DEFAULT '' NOT NULL,
	`parsing_error_message` text DEFAULT '' NOT NULL,
	`parsing_error_count` integer DEFAULT 0 NOT NULL,
	`scraper_rules` text DEFAULT '' NOT NULL,
	`rewrite_rules` text DEFAULT '' NOT NULL,
	`crawler` integer DEFAULT false NOT NULL,
	`blocklist_rules` text DEFAULT '' NOT NULL,
	`keeplist_rules` text DEFAULT '' NOT NULL,
	`user_agent` text DEFAULT '' NOT NULL,
	`username` text DEFAULT '' NOT NULL,
	`password` text DEFAULT '' NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`ignore_http_cache` integer DEFAULT false NOT NULL,
	`fetch_via_proxy` integer DEFAULT false NOT NULL,
	`category_id` integer NOT NULL,
	`icon_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`icon_id`) REFERENCES `icons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `feeds_category_id_idx` ON `feeds` (`category_id`);--> statement-breakpoint
CREATE TABLE `icons` (
	`id` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`mime_type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pending_mutations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pending_mutations_created_at_idx` ON `pending_mutations` (`created_at`);--> statement-breakpoint
CREATE TABLE `sync_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
