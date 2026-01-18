<?php
$host = '127.0.0.1';
$db = 'inetscann';
$user = 'root';
$passwd = 'qwertzRTPass05432';

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $passwd, [
	PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
	PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);
?>