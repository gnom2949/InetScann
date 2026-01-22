<?php
	require 'vendor/autoload.php';

	$redis = new Predis\Client ([
		'scheme' => 'tcp',
		'host' => 'redis',
		'port' => 6379,
	]);
?>