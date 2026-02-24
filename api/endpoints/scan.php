<?php // scan.php endpoint \\ ЫЫЫ Типо сканирует сеть и ищо перехватывает вывод nmap для цыфарак красиво |MARK| START
require_once __DIR__ . '/../../backend/scanner.php';
require_once __DIR__ . '/../../backend/redisHndl.php';
require_once __DIR__ . '/../../db.php';

return function ($params, $write)
{
    $redis = redis($write);
    $write->scanEndp->info("Starting an Scanner class");

    $conf = include __DIR__ . '/../../config.php';

    // Если PHP вернул 1 (true), значит массив потерялся в кеше require_once.
    // Форсируем получение массива напрямую из файла.
    if ($conf === true || !is_array($conf)) {
        $conf = require __DIR__ . '/../../config.php';
    }

    // Проверяем, что передаем именно под-массив
    $db = new SQL(is_array($conf) ? $conf['mysql'] : []);

    $devices = Scanner::netScanify($write, $redis);

    // сохранение устройств в бд
    foreach ($devices as $dev) {
        $db->exec("
            INSERT INTO device (profile_owner_id, ip, mac, vendor, hostname, os_desc, safety_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                mac = VALUES(mac),
                vendor = VALUES(vendor),
                hostname = VALUES(hostname)", 
            [
                $dev['profile_owner_id'] ?? 1, 
                $dev['ip'],
                $dev['mac'] ?? null,
                $dev['vendor'] ?? 'Unknown',
                $dev['hostname'] ?? null,
                $dev['os'] ?? null,
                $dev['safety'] ?? 'doubtful'
            ]
        );
        if (!empty($dev['ip'])) {
            $redis->hmset("device:{$dev['ip']}", [
                'ip'         => $dev['ip'],
                'mac'        => $dev['mac'] ?? null,
                'vendor'     => $dev['vendor'] ?? null,
                'safety'     => $dev['safety'] ?? null,
                'os'         => $dev['os'] ?? null,
                'deviceType' => $dev['deviceType'] ?? null,
            ]);

            $redis->expire("device:{$dev['ip']}", 600);
        }
    }

    Response::json($devices);
};
// scan.php endpoint |MARK| END