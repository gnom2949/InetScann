<?php // mac.php \\ mac endpoint || START
require __DIR__ . '/../../backend/macVen.php';

$mac = $_GET['mac'] ?? null;

if (!$mac) {
    $write->mac->error("no MAC provided");
    return ['error' => 'MAC required'];
}

return macVendor($mac, $write);

// mac.php || END