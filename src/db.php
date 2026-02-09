<?php
/* db.php
Файл описания подключения php к MySQL через PDO (PHP Data Objects)
*/
require_once __DIR__ . '/backend/writeron.php';

$write = Writer::getInstance();
$write->append();
$write->colorify();

// Установка хоста
$host = 'mariadb';
$db = 'InetScann';
$user = 'root';
$pass = 'dog-hot-copper-linux619';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Опции
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    // Создание объекта
    $pdo = new PDO($dsn, $user, $pass, $options);
    $write->db->info("DataBase connection successfully established");
} catch (\PDOException $e) {
    $write->db->error("DataBase connection failed!", ['error' => $e->getMessage()]);
    $pdo = null;
}

global $pdo;
?>