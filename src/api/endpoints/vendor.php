<?php // vendor.php \\ vendor endpoint || START
require_once __DIR__ . '/../../backend/macVen.php';

$vendor = $_GET['vendor'] ?? null;

if (!$vendor) return ['error' => 'Vendor required'];

return getVendorInfo ($vendor, $write);

// vendor.php || END