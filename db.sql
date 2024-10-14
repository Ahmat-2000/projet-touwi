CREATE TABLE `Workspace` (
  `id` INTEGER PRIMARY KEY,
  `name` TEXT,
  `created_at` DATE,
  `updated_at` DATE,
  `path` TEXT
);

CREATE TABLE `User` (
  `id` INTEGER PRIMARY KEY,
  `username` TEXT,
  `password` TEXT,
  `created_at` DATE,
  `updated_at` DATE
);

CREATE TABLE `Role` (
  `id` INTEGER PRIMARY KEY,
  `name` TEXT,
  `description` TEXT,
  `can_read` BOOLEAN DEFAULT false,
  `can_write` BOOLEAN DEFAULT false,
  `can_share` BOOLEAN DEFAULT false
);

CREATE TABLE `UserRole` (
  `id` INTEGER PRIMARY KEY,
  `user_id` INTEGER,
  `role_id` INTEGER,
  `workspace_id` INTEGER,
  `assigned_at` DATE
);

CREATE TABLE `Invitation` (
  `id` INTEGER PRIMARY KEY,
  `workspace_id` INTEGER,
  `owner_id` INTEGER,
  `shared_with_id` INTEGER,
  `role_id` INTEGER,
  `shared_at` DATE
);

ALTER TABLE `UserRole` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`id`);

ALTER TABLE `UserRole` ADD FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`);

ALTER TABLE `UserRole` ADD FOREIGN KEY (`workspace_id`) REFERENCES `Workspace` (`id`);

ALTER TABLE `Invitation` ADD FOREIGN KEY (`workspace_id`) REFERENCES `Workspace` (`id`);

ALTER TABLE `Invitation` ADD FOREIGN KEY (`owner_id`) REFERENCES `User` (`id`);

ALTER TABLE `Invitation` ADD FOREIGN KEY (`shared_with_id`) REFERENCES `User` (`id`);

ALTER TABLE `Invitation` ADD FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`);