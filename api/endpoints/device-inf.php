<?php // device-inf.php \\ Device info endpoint || START

require __DIR__ . '/../../backend/utils.php';
require __DIR__ . '/../../backend/macVen.php';

return function ($params, $write) 
{
    $ip = $params['ip'] ?? null;

    if (!$ip) $write->device->error ("IP required"); Response::error ("Ip required", 400);

    $mac = getMFA ($ip);
    $vendor = macVen($mac, $write);

    Response::json ([
        'ip' => $ip,
        'mac' => $mac,
        'vendor' => $vendor['vendor'] ?? 'Unknown'
    ]);
};
// device-inf.php || END