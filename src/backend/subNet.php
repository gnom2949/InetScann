<?php // subNet.php \\ ну типа файл который получает маску подсети и дает нормальное сканирование || START
require_once __DIR__ . '/writeron.php';

header('Content-Type: application/json');

class SubNet 
{
    public static function pullSubnet ($write): ?string
    {
      $raw = shell_exec("ip -o -f inet addr show | grep 'scope global' | grep -v 'lo' | awk '{print $4}' | head -n1");

      $subnet = $raw ? trim ((string)$raw) : null;

      if (empty ($subnet)) {
        $write->Network->failure ("Ip command failed or returned nothing. Trying fallback");
        
        $fallback = shell_exec ("hostname -I | awk '{print $1}'");
        if ($fallback) {
            $ip = trim ($fallback);
            $subnet = $ip . "/24";
        }
      }
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