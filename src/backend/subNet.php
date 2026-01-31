<?php
header('Content-Type: application/json');

function getSubNet(): array {
    $out = [];
    exec("ip a show eth0", $out);

    foreach ($out as $line) {
        if (preg_match('/inet ([0-9\.]+)\/([0-9]+)/', $line, $m)) {
            $ip = $m[1];
            $mask = (int)$m[2];

            $ipL = ip2long($ip);
            $maskL = -1 << (32 - $mask);
            $netL = $ipL & $maskL;

            $hosts = [];
            $count = pow(2, 32 - $mask);

            for ($i = 1; $i < $count - 1; $i++) {
                $hosts[] = long2ip($netL + $i);
            }

            return $hosts;
        }
    }
    return [];
}

$hosts = getSubNet();
$alive = [];

foreach ($hosts as $h) {
    exec("ping -c 1 -W 1 $h > /dev/null 2>&1", $o, $c);
    if ($c === 0) $alive[] = $h;
}

echo json_encode([
    'alive' => $alive
]);
