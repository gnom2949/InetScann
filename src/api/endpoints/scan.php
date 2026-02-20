<?php // scan.php endpoint \\ ЫЫЫ Типо сканирует сеть и ищо перехватывает вывод nmap для цыфарак красиво |MARK| START
require_once __DIR__ . '/../../backend/scanner.php';
require_once __DIR__ . '/../../backend/redisHndl.php';

return function ($params, $write)
{
    $redis = redis($write);
    $write->scanEndp->info("Starting an Scanner class");

    $conf = require_once __DIR__ . '/../../config.php';

    $db = new SQL($conf);

    $devices = Scanner::netScanify($write, $redis);

    // сохранение устройств в бд
    foreach ($devices as $dev) {
        $db->exec ("
            INSERT INTO device (profile_owner_id, ip, mac, vendor, hostname, os_desc, safety_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                mac = VALUES(mac),
                vendor = VALUES(vendor)");
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