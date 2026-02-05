<?php // nmap.php \\ запуск nmap, парсинг CVE, передача в endpoint'ы |MARK| START

// аудит через nmap и vulners.nse 
function secAud (string $ip, $write): array
{
    if (!$ip) {
        $write->secAud->error ("empty IP");
        return ['error' => 'IP required'];
    }

    $cmd = "nmap -sV --script vulners.nse -T4 -Pn $ip 2>&1";

    $write->secAud->info ("executing: $cmd");

    exec ($cmd, $output);

    if (!$output) {
        $write->secAud->error ("Nmap returned empty output");
        return ['error' => 'Nmap failed'];
    }

    $ports = [];
    $curPort = null;

    foreach ($output as $line) {
        
        // поиск открытых портов
        if (preg_match ('/^([0-9]+)\/tcp\s+open/i', $line, $m)) {
            $curPort = $m[1];
            $ports[$curPort] = [];
            continue;
        }

        // поиск CVE
        if ($curPort && preg_match('/(CVE-\d{4}-\d+)/', $line, $m)) {
            $ports[$curPort][] = $m[1];
        }
    }

    // подсчет
    $total = array_sum (array_map ('count', $ports));

    if ($total > 0) {
        $write->secAud->info ("Found $total vulns on $ip!");
    } else {
        $write->secAud->warning ("No vulns found on $ip"); 
    }

    $grade = 10 - min (9, $total);
    $grade = max (1, $grade);

    return [
        "ip" => $ip,
        "setSecGrade" => "uico$grade",
        "vulns" => array_merge (...array_values ($ports))
    ];
}

// nmap.php |MARK| END