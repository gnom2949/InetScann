<?php // scan.php endpoint \\ ЫЫЫ Типо сканирует сеть и ищо перехватывает вывод nmap для цыфарак красиво |MARK| START
require_once __DIR__ . '/../../backend/subNet.php';

return function ($params, $write)
{
    set_time_limit(0);
    SubNet::streamScan ($write);

    $target = $params['target'] ?? null;
    $mode = $params['mode'] ?? 'single';

    if (!$target) {
        Response::error ("Target is required"); 
    }

    // очистка, избавление от мусора
    $target = preg_replace ('/[^a-zA-Z0-9\.\-]/', '', $target);
    
    if ($mode == 'multi') {
        $cmd = "nmap -sn -n " . escapeshellarg ($target);
        $write->scan->info ("Starting multi scan on: $target");
    } else {
        $cmd = "nmap -F " . escapeshellarg ($target);
        $write->scan->info ("Starting port scan on: $target");
    }

    $handle = popen ("$cmd 2>&1", "r");
    if (!$handle) {
        Response::error("Could not execute nmap!");
    }

    $curIp = null;

    while (!feof ($handle)) {
        $line = fgets ($handle);
        if ($line === false) break;
        $line = trim ($line);
        if (empty($line)) continue;

        $data = ['raw' => $line, 'mode' => $mode];

        if (preg_match ('/Nmap scan report for ([a-zA-Z0-9\.\-]+ )?\(?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\)?/', $line, $match)) {
            $curIp = $match[2];
            $data['ip'] = $curIp;
        }

        if ($mode === 'multi' && preg_match ('/Host is up/', $line)) {
            $data['status'] = 'up';
            $data['message'] = "Host ONLINE: $curIp";
            Response::stream ($data);
            continue;
        }

        if ($mode === 'single') {
            if (preg_match('/(\d+)\/(tcp|udp)\s+(\w+)\s+(.*)/', $line, $portMatch)) {
                $data['port'] = $portMatch[1];
                $data['protocol'] = $portMatch[2];
                $data['state'] = $portMatch[3];
                $data['service'] = trim ($portMatch[4]);

                if ($data['state'] === 'open') {
                    $data['message'] = "Port {$data['port']} is OPEN ({$data['service']})";
                    $write->scan->warning ("Port {$data['port']} is OPEN ({$data['service']})");
                }
                Response::stream ($data);
                continue;
            }
        }

        Response::stream ($data);
    }

    pclose ($handle);
    $write->scan->info ("Scan complete");
    exit;
};

// scan.php endpoint |MARK| END