<?php // scanner.php /backend/\\ может определять девайсы в локальной сети
require_once __DIR__ . '/subNet.php';
require_once __DIR__ . '/macVen.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/redisHndl.php';

class Scanner 
{

    public static function netScanify ($write, $redis): array
    {
        $subnet = SubNet::pullSubnet ($write);
        $write->scanner->info ("Scanning subnet: $subnet");

        $cmd = "nmap -O -n " . escapeshellarg ($subnet);
        $output = shell_exec ("$cmd 2>&1");
        $write->scanner->info("RAW NMAP: " . $output);

        if (!$output) {
            $write->scanner->info ("nmap returned empty output");
            return ['error' => 'output is empty'];
        }
        
        $devices = [];
        $curr = [
            'ip' => null,
            'mac' => null,
            'vendor' => null,
            'safety' => null,
            'os' => null,
            'deviceType' => null
        ];

        foreach (explode ("\n", $output) as $line) {
            $line = trim ($line);
            if ($line === '') continue;
            
            // поиск IP
            if (preg_match ('/Nmap scan report for (.+?)(?: \((\d+\.\d+\.\d+\.\d+)\))?$/', $line, $m)) {
                if ($curr['ip'] !== null) {
                    $devices[] = $curr;
                    self::cacheDevice ($redis, $curr);
                }

                $curr = [
                    'ip' => $m[2] ?? $m[1],
                    'mac' => null,
                    'vendor' => null,
                    'safety' => null,
                    'os' => null,
                    'deviceType' => null
                ];

                continue;
            }

            // поиск MAC адресов
            if (preg_match ('/MAC Address: ([0-9A-F:]+)/i', $line, $m)) {
                $fmac = normalizeMac ($m[1]);
                $pref = substr ($fmac, 0, 6);

                $curr['mac'] = $fmac;

                $ven = macVen ($pref, $write);
                $curr['vendor'] = $ven['vendor'] ?? 'Unknown';
                $curr['safety'] = $ven['safety'] ?? 'danger';

                continue;
            }

            // определиние хоста ОС
            if (preg_match ('/Running: (.+)/', $line, $m)) {
                $curr['os'] = trim ($m[1]);
                $curr['deviceType'] = self::guessDype ($curr['os']);
                continue;
            }
        }

        // последний хост
        if ($curr['ip'] !== null) {
            $devices[] = $curr;
            self::cacheDevice ($redis, $curr);
        }

        return $devices;
    }

    // определене типа устройства по хосту ОС
    private static function guessDype (?string $os = null): string
    {
        if (!$os) return "unknown";
        $os = strtolower ($os);

        if (str_contains ($os, "windows")) return "windowsPC";
        if (str_contains ($os, "linux")) return "linuxPC";
        if (str_contains ($os, "android")) return "androidphone";
        if (str_contains ($os, "ios") || str_contains ($os, "mac")) return "apple";
        if (str_contains ($os, "router") || str_contains ($os, "embedded")) return "router";

        return "unknown";
    }

    // кеширование устройств в redis
    private static function cacheDevice ($redis, array $dev): void
    {
        if (!$dev['ip']) return;

        $key = "device:" . $dev['ip'];

        $redis->hmset ($key, [
            'ip' => $dev['ip'],
            'mac' => $dev['mac'] ?? '',
            'vendor' => $dev['vendor'] ?? '',
            'safety' => $dev['safety'] ?? '',
            'os' => $dev['os'] ?? '',
            'type' => $dev['deviceType'] ?? ''
        ]);

        // TTL 10 минут
        $redis->expire ($key, 600);
    }
}