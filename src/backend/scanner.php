<?php // scanner.php /backend/\\ может определять девайсы в локальной сети
require_once __DIR__ . '/subNet.php';
require_once __DIR__ . '/macVen.php';
require_once __DIR__ . '/utils.php';

function netScanify ($write): array
{
    $subnet = new SubNet();
    $subnet->pullSubnet ($write);

    $write->scanner->info ("Executing nmap");

    $com = "nmap -sn $subnet";
    $output = escapeshellarg ($com);

    if (!$output) {
        $write->scanner->failure ("subnet args are null");
        return ['error' => 'args is NULL'];
    }

    $devs = [];
    $cur = [];

    foreach (explode ("\n", $output) as $ln) {
        if (preg_match ('/Nmap scan report for (.+)/', $ln, $mt)) {
            if (!empty ($cur)) {
                $devs[] = $cur;
                $cur = [];
            }
            $cur['ip'] = trim ($mt[1]);
        }

        if (preg_match ('/MAC Address: ([0-9A-F:]+) \((.+)\)/i', $ln, $mt)) {
            $mac = strtoupper (str_replace(':', '', $mt[1]));
            $cur['mac'] = $mac;

            $vn = macVen ($mac, $write);
            $cur['vendor'] = $vn['vendor'];
            $cur['safety'] = $vn['safety'];
        }
    }

    if (!empty ($cur)) {
        $devices[] = $cur;
    }

    return $devs;
}