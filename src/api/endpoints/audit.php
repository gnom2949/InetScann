<?php // audit.php \\ Security Audit endpoint || START
require __DIR__ . '/../../backend/nmap.php';

return function ($params, $write)
{
    $ip = $params['ip'] ?? null;

    if (!$ip) {
        $write->audit->error ("No Ip provided!");
        Response::error ("Ip required", 400);
    }

    $write->audit->info ("Starting security audit for $ip");

    $result = secAud ($ip, $write);

    $write->audit->info ("Audit work complete for $ip");

    Response::json ($result);
};
// audit.php || END