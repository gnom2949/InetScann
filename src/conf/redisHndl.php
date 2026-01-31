<?php
	require __DIR__ . '../../vendor/autoload.php';

	$redis = new Predis\Client ([
		'scheme' => 'tcp',
		'host' => 'redis',
		'port' => 6379,
	]);

// Тест
try {
	$redis->ping();
	writer()->redis->info ("Redis PONG successfully catched");
} catch (Exception $e) {
	writer()->redis->error ("We dont catch PONG!", ['error' => $e->getMessage()]);
}

return $redis;