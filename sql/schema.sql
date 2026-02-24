CREATE DATABASE IF NOT EXISTS InnDB;
USE InnDB;

CREATE TABLE IF NOT EXISTS `profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `device` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `profile_owner_id` INT NOT NULL DEFAULT 0,
    `ip` VARCHAR(45) NOT NULL,
    `mac` VARCHAR(17),
    `vendor` VARCHAR(255) DEFAULT 'Unknown',
    `hostname` VARCHAR(255),
    `os_desc` VARCHAR(255),
    `safety_status` VARCHAR(20) DEFAULT 'doubtful',
    `last_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `profile_id` INT,
    UNIQUE KEY (`ip`),
    INDEX (`mac`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
