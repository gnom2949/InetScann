<?php
use Predis\Client;

function macVendor(string $mac): array {
    if (!$mac) return ['error' => 'MAC required'];

    $mac = strtoupper(str_replace([':', '-'], '', $mac));
    $prefix = substr($mac, 0, 6);

    $redis = new Client();
    $vendor = $redis->hget("mac:$prefix", "vendor");

    return [
        'mac' => $mac,
        'vendor' => $vendor ?: 'Unknown'
    ];
}
