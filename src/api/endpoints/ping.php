<?php // ping.php \\ ping endpoint || START

$ip = $_GET['ip'] ?? null;

if (!$ip) {
    $write->ping->error("no IP provided");
    return ['error' => 'IP required'];
}

exec ("ping -c 1 -W 1 $ip 2>&1", $output, $code);

if ($code !== 0) $write->ping->error("We not received any response from $ip");

return [
    'ip' => $ip,
    'alive' => $code === 0
];

// ping.php || END