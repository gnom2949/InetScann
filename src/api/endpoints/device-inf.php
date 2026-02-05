<?php // device-inf.php \\ Device info endpoint || START
require __DIR__ . '/../../backend/utils.php';
require __DIR__ . '/../../backend/macVen.php';

$ip = $_GET['ip'] ?? null;

if (!$ip) return ['error' => 'IP required'];

$mac = getMFA ($ip);
$vendor = macVendor($mac, $write);

return [
    'ip' => $ip,
    'mac' => $mac,
    'vendor' => $vendor['vendor'] ?? 'Unknown'
];

// device-inf.php || END