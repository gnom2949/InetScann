<?php
use Predis\Client;

require_once __DIR__ . '/redisHndl.php';

function macVendor(string $mac, $write): array {
    if (!$mac) {
        $write->mac->error("empty input");
        return ['error' => 'MAC required'];
    }
    $mac = strtoupper(str_replace([':', '-'], '', $mac));
    $prefix = substr($mac, 0, 6);

    $redis = redis($write);
    $vendor = $redis->hget("mac:$prefix", "vendor");

    return [
        'mac' => $mac,
        'vendor' => $vendor ?: 'Unknown'
    ];
}
