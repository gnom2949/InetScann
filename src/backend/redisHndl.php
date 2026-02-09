<?php // redisHndl.php \\ A handler for redis db, the part of backend |MARK| START
use Predis\Client;

require_once __DIR__ . '/../vendor/autoload.php';

function redis ($write): Client
{
	static $redis = null;

	if ($redis !== null) return $redis;

	try 
	{
		// схема подключения 
		$redis = new Client([
			'scheme' => 'tcp',
			'host' => '127.0.0.1',
			'port' => 6379,
		]);

		// проверка подключения типом PING|PONG
		$redis->ping();
		$write->redis->info ("We successfully caught the redis PONG");
	} catch (Exception $ex) {
		$write->redis->error("We not caught the redis PONG!!", [
			'error' => $ex->getMessage()
		]);
	}

	return $redis;
}

// redisHndl.php |MARK| END