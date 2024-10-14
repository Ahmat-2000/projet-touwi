CREATE TABLE `Workspace` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `created_at` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATE,
  `path` TEXT NOT NULL
);

CREATE TABLE `User` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `username` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `is_admin` BOOLEAN DEFAULT false,
  `created_at` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATE 
);

CREATE TABLE `Role` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `description` TEXT,
  `can_read` BOOLEAN DEFAULT false,
  `can_write` BOOLEAN DEFAULT false,
  `can_share` BOOLEAN DEFAULT false
);

CREATE TABLE `UserRole` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `role_id` INTEGER NOT NULL,
  `workspace_id` INTEGER NOT NULL,
  `assigned_at` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Invitation` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `workspace_id` INTEGER NOT NULL,
  `owner_id` INTEGER NOT NULL,
  `shared_with_id` INTEGER NOT NULL,
  `role_id` INTEGER NOT NULL,
  `shared_at` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE `UserRole` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`id`);

ALTER TABLE `UserRole` ADD FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`);

ALTER TABLE `UserRole` ADD FOREIGN KEY (`workspace_id`) REFERENCES `Workspace` (`id`);

ALTER TABLE `Invitation` ADD FOREIGN KEY (`workspace_id`) REFERENCES `Workspace` (`id`);

ALTER TABLE `Invitation` ADD FOREIGN KEY (`owner_id`) REFERENCES `User` (`id`);

ALTER TABLE `Invitation` ADD FOREIGN KEY (`shared_with_id`) REFERENCES `User` (`id`);

ALTER TABLE `Invitation` ADD FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`);