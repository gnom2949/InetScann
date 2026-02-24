<?php // ping.php \\ ping endpoint || START

require_once __DIR__ . '/../../backend/subNet.php';

return function ($params, $write) {
    $ip = $params['ip'] ?? null;

    if (!$ip) {
        $write->ping->error("no IP provided, trying to detect subnet");

        $subnet = SubNet::pullSubnet ($write);

        if (!$subnet) {
            $write->ping->error ("Could not determine subnet");
            Response::error ("Could not determine subnet", 400);
        }

        // определение подсети типа если было 192.168.1.42/24 -> 192.168.1.1
        if (preg_match ('/(\d+\.\d+\.\d+)\.\d+\/\d+/', $subnet, $m)) {
            $ip = $m[1] . ".1";
            $write->ping->info ("Auto-selected gateway: $ip");
        } else {
            $write->ping->error ("Invalid subnet format: $subnet");
            Response::error ("Invalid subnet format", 400);
        }
    }

    $sip = escapeshellarg ($ip);
    exec ("ping -c 1 -W 1 $sip 2>&1", $output, $code);

    if ($code !== 0) {
        $write->ping->error("Could not receive any response from $ip"); 
        Response::error("Could not receive any response from $ip", 400);

    }
    $write->ping->info ("BONK!");
    Response::json ([
        'ip' => $ip,
        'alive' => true,
        'output' => implode ("\n", $output)
    ]);
};
// ping.php || END