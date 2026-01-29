<?php
namespace Inn\Backend\WorkWithDataBase;
require 'writeron.php';
require __DIR__ . '../../vendor/autoloader.php';

$pdo = require __DIR__ . '../conf/db.php';
use PDO;
use PDOException;

class WorkWithDataBase {
	private PDO $mysql;
	private redisHndl $redis;

	public function __construct (array $config) {
		// MySQL
		$dsn = "mysql:host{$config['mariadb']['host']"
	}

}
?>