<?php // vendor.php \\ vendor endpoint || START
require_once __DIR__ . '/../../backend/macVen.php';
require_once __DIR__ . '/../../backend/utils.php';

return function ($params, $write) {

    $vendor = $params['vendor'] ?? null;

    if (!$vendor) {
        Response::error("Vendor required", 400);
        return;
    }

    $result = macVen($vendor, $write);

    Response::json($result);
};

// vendor.php || END