<?php
	require __DIR__ . '/../../vendor/autoload.php';

	$write = new Writer;
	$write->append();
	$write->colorify();
	$redis = new Predis\Client ([
		'scheme' => 'tcp',
		'host' => 'redis',
		'port' => 6379,
	]);

// Тест
try {
	$redis->ping();
	$write->redis->info ("Redis PONG successfully catched");
} catch (Exception $e) {
	$write->redis->error ("We dont catch PONG!", ['error' => $e->getMessage()]);
}

return $redis;