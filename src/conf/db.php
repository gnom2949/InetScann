<?php
/* db.php
Файл описания подключения php к MySQL через PDO (PHP Data Objects)
*/
require __DIR__ . '../backend/writeron.php';
writer()->writer_append();
writer()->writer_colorify();
// Установка хоста
$host = 'mariadb';

// Установка БД
$db = 'InetScann';

// Имя пользователя
$user = 'ISnn/user';

// Пароль пользователя
$pass = 'ISnn/user/pass/dog-hot-copper-linux619';

// Кодировка
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
    writer()->db->info ("DataBase connection successfully established");
} catch (\PDOException $e) {
    writer()->db->error("DataBase connection failed!", ['error' => $e->getMessage()]);
    die("DB Error: " . $e->getMessage());
}
