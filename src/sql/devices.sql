USE network_db;

CREATE TABLE IF NOT EXISTS `devices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `profile_owner_id` INT NOT NULL,
    `ip` VARCHAR(45) NOT NULL,
    `mac` VARCHAR(17),
    `vendor` VARCHAR(255) DEFAULT 'Unknown',
    `hostname` VARCHAR(255),
    `os_desc` VARCHAR(255),
    `safety_status` VARCHAR(20) DEFAULT 'doubtful',
    `last_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `profile_id` INT,
    FOREIGN KEY (`profile_owner_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE,
    INDEX (`ip`),
    INDEX (`mac`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
