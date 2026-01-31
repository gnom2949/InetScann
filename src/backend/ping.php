<?php
function pingDevice(string $ip): array {
    if (!$ip) return ['error' => 'IP required'];

    exec("ping -c 1 -W 1 $ip 2>&1", $out, $code);

    return [
        'ip' => $ip,
        'alive' => $code === 0
    ];
}
