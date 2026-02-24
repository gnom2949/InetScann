CREATE TABLE IF NOT EXISTS `auths` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'viewer') DEFAULT 'viewer',
  `last_login` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
