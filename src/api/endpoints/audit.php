<?php // audit.php \\ Security Audit endpoint || START
require __DIR__ . '/../../backend/nmap.php';

$ip = $_GET['ip'] ?? null;

if (!$ip) {
    $write->audit->error ("No Ip provided!");
    return ['error' => 'IP required'];
}

$write->nmap->info ("Starting security audit for $ip");

$result = secAud ($ip, $write);

$write->nmap->info ("Audit work complete for $ip");

return $result;

// audit.php || END