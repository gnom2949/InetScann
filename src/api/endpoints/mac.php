<?php // mac.php \\ mac endpoint |MARK| START
require __DIR__ . '/../../backend/macVen.php';

return function ($params, $write)
{
    $write->mac->info("MAC endpoint called");

    $mac = $params['mac'] ?? null;

    if (!$mac) {
        Response::error("MAC is required");
    }

    return [
        'status' => 'ok',
        'mac' => $mac
    ];
};

// mac.php |MARK| START