<?php // macVen.php \\ обработка вендоров полученных с редисБД |MARK| START

require_once __DIR__ . '/redisHndl.php';
require_once __DIR__ . '/utils.php';

function macVen (string $mac, $write): array
{
    if (!$mac) {
        return ['vendor' => 'Unknown', 'safety' => 'doubtful'];
    }

    $macN = normalizeMac ($mac);
    $prefix = substr ($macN, 0, 6);

    $redis = redis ($write);
    $vendor = $redis->hget ("mac::$prefix", "vendor");

    // логика значений 'safery'
    if ($vendor) {
        $safety = "normal";
    } else {
        if (in_array ($prefix, ["000000", "FFFFFF"])) {
            $safety = "untrusted";
        } else {
            $safety = "doubtful";
        }
    }

    return [
        'vendor' => $vendor ?: 'Unknown',
        'safety' => $safety
    ];
}
//macVen.php |MARK| END