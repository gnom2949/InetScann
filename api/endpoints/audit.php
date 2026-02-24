<?php // audit.php \\ Security Audit endpoint || START
require __DIR__ . '/../../backend/audit.php';

return function ($params, $write)
{
    $ip = $params['ip'] ?? null;
    Response::json (audit::collectInfo ($write, $ip));
};
// audit.php || END