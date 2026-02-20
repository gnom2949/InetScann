<?php // audit.php \\ Бекенд модуль аудита |MARK|
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/redisHndl.php';
require_once __DIR__ . '/scanner.php';
require_once __DIR__ . '/utils.php';

class audit
{
    public static function collectInfo($write, $ip): array
    {
        $redis = redis($write);

        if (!$ip) {
            return ['error' => 'ip is empty'];
        }

        // Получаем устройство
        $dev = $redis->hgetall("device:$ip");

        if (!$dev) {
            $write->backAudit->warning("Device not found in redis");
            return ['error' => 'device not found in redis'];
        }

        // Оценка риска
        $risk = 'low';

        if (($dev['safety'] ?? '') === 'danger') {
            $risk = 'high';
        } elseif (($dev['safety'] ?? '') === 'warning') {
            $risk = 'medium';
        }

        $dev['risk'] = $risk;

        // CVE
        $cveIds = $redis->zrevrange("cve:severity", 0, 49);
        $cves = [];

        foreach ($cveIds as $id) {
            $row = $redis->hgetall("cve:$id");
            if ($row) $cves[] = $row;
        }

        return [
            'device' => $dev,
            'cves'   => $cves,
        ];
    }
}
