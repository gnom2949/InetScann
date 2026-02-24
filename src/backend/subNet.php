<?php // subNet.php \\ ну типа файл который получает маску подсети и дает нормальное сканирование || START
require_once __DIR__ . '/writeron.php';

header('Content-Type: application/json');

class SubNet 
{
    public static function pullSubnet($write): ?string
    {
        $ip_output = shell_exec("hostname -I | awk '{print $1}'");
        $ip = trim($ip_output);

        if (empty($ip) || !filter_var($ip, FILTER_VALIDATE_IP)) {
            $write->Network->failure("IP is invalid or empty ($ip). Trying fallback");
            return "192.168.0.0/24";
        }

        $mask_output = shell_exec("ip -o -f inet addr show wlan0 | awk '{print $4}' | cut -d/ -f2");
        $mask = trim($mask_output);

        if (empty($mask) || !is_numeric($mask)) {
            $write->Network->failure("Mask not found or wrong ($mask). Trying fallback");
            $mask = 24;
        }

        $parts = explode('.', $ip);
        $parts[3] = '0';

        $subnet = implode('.', $parts) . "/24";
        $write->Network->info("Detected subnet: $subnet");

        return $subnet;
    }

    public static function streamScan ($write) 
    {
        $subnet = self::pullSubnet ($write);

        if (empty ($subnet)) {
            Response::error ("Could not determine network");
            return;
        }

        $cmd = "nmap -sn -n -PR " . escapeshellarg ($subnet);

        $write->Network->info ("Executing: $cmd");
        $handle = popen ("$cmd 2>&1", 'r');

        while (!feof ($handle)) {
            $line = fgets ($handle);
            if (!$handle) continue;

            // парсинг ip
            if (preg_match ('/Nmap scan report for ([\d\.]+)/', $line, $m)) {
                $ip = $m[1];

                // поток в TS
                Response::stream([
                    'status' => 'alive',
                    'ip' => $ip,
                    'mode' => 'subnet_discovery',
                    'raw' => "Host detected: $ip"
                ]);

                $write->Network->info ("Device online: $ip");
            }
        }

        pclose ($handle);
        $write->Network->info ("Subnet Scan finished");
    }
}
// subNet.php || END