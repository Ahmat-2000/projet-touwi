-- Table Workspace
CREATE TABLE `Workspace` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `path` VARCHAR(255) NOT NULL,
  CONSTRAINT unique_workspace_name UNIQUE (`name`),  -- Contrainte d'unicité sur le nom du Workspace
  CONSTRAINT unique_workspace_path UNIQUE (`path`)   -- Contrainte d'unicité sur le chemin (path)
);

-- Table User
CREATE TABLE `User` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `is_admin` BOOLEAN DEFAULT false,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT unique_username UNIQUE (`username`),  -- Contrainte d'unicité sur le nom d'utilisateur
  CONSTRAINT chk_admin CHECK (`is_admin` IN (0, 1))  -- Contrôle pour s'assurer que le champ est booléen
);

-- Table Role
CREATE TABLE `Role` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `can_read` BOOLEAN DEFAULT false,
  `can_write` BOOLEAN DEFAULT false,
  `can_share` BOOLEAN DEFAULT false,
  CONSTRAINT unique_role_name UNIQUE (`name`),  -- Contrainte d'unicité sur le nom du rôle
  CONSTRAINT chk_permissions CHECK (
    `can_read` IN (0, 1) AND
    `can_write` IN (0, 1) AND
    `can_share` IN (0, 1)  -- Vérification stricte des valeurs booléennes
  )
);

-- Table UserRole
CREATE TABLE `UserRole` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `role_id` INTEGER NOT NULL,
  `workspace_id` INTEGER NOT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`workspace_id`) REFERENCES `Workspace` (`id`) ON DELETE CASCADE,
  CONSTRAINT unique_user_role UNIQUE (`user_id`, `role_id`, `workspace_id`)  -- Un utilisateur ne peut avoir qu'un seul rôle par Workspace
);

-- Table Invitation
CREATE TABLE `Invitation` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `workspace_id` INTEGER NOT NULL,
  `owner_id` INTEGER NOT NULL,
  `shared_with_id` INTEGER NOT NULL,
  `role_id` INTEGER NOT NULL,
  `shared_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`workspace_id`) REFERENCES `Workspace` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`owner_id`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shared_with_id`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`) ON DELETE CASCADE,
  CONSTRAINT unique_invitation UNIQUE (`workspace_id`, `shared_with_id`, `role_id`)  -- Un utilisateur ne peut avoir qu'une seule invitation pour un rôle spécifique dans un Workspace
);

