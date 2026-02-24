USE network_db;

CREATE TABLE IF NOT EXISTS `profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL, 
  `profile_name` VARCHAR(100) NOT NULL,
  `db_name` VARCHAR(100) NOT NULL,
  `db_status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `db_table_prefix` VARCHAR(255) NOT NULL,
  `nmap_flags` VARCHAR(255) DEFAULT '-sV -T4',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Внешний ключ, связывающий профиль с пользователем
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
