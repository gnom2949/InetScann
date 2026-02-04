<?php
use Predis\Client;

	require_once __DIR__ . '/../../vendor/autoload.php';
function redis ($write): Client
{
	
}

// Тест
try {
	$redis->ping();
	$write->redis->info ("Redis PONG successfully catched");
} catch (Exception $e) {
	$write->redis->error ("We dont catch PONG!", ['error' => $e->getMessage()]);
}

return $redis;