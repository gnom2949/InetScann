<?php
require_once __DIR__ . '/backend/redisHndl.php';
require_once __DIR__ . '/backend/writeron.php';
require_once __DIR__ . '/vendor/autoload.php';

use Predis\Client;
use Predis\Pipeline;
$write = Writer::getInstance();
$write->append();
$write->colorify();

$write->imcve->info("Starting CVE sync...");

$start = "2026-02-01T00:00:00.000";
$end   = "2026-02-20T00:00:00.000";
$apiKey = "fe5fd69e-396f-4e1c-ae29-5870dfb2c3de";
$redis = redis($write);

$url = "https://services.nvd.nist.gov/rest/json/cves/2.0" . 
       "?lastModStartDate=" . urlencode($start) . 
       "&lastModEndDate=" . urlencode($end);

$opts = [
    "http" => [
        "method" => "GET",
        "header" => "User-Agent: MyScanApp/1.0\r\n" . "apiKey: $apiKey\r\n"
    ]
];

$context = stream_context_create($opts);
$json = file_get_contents($url, false, $context);
$data = json_decode($json, true);
$vulnerabilities = $data['vulnerabilities'] ?? [];

$count = 0;
foreach ($vulnerabilities as $entry) {
    $cve = $entry['cve'] ?? null;
    if (!$cve) continue;

    $id = $cve['id'];

    if (preg_match('/CVE-(202[2-6])-\d+/', $id, $matches)) {
        
        $summary = 'No description';
        foreach ($cve['descriptions'] as $desc) {
            if ($desc['lang'] === 'en') { $summary = $desc['value']; break; }
        }

        $metrics = $cve['metrics']['cvssMetricV31'][0]['cvssData']['baseScore'] 
                ?? $cve['metrics']['cvssMetricV30'][0]['cvssData']['baseScore'] 
                ?? 0;

        $redis->hmset("cve:$id", [
            "id"      => (string)$id,
            "summary" => (string)substr($summary, 0, 500),
            "cvss"    => (float)$metrics
        ]);

        $redis->zadd("cve:severity", (float)$metrics, $id);
        $count++;
    }
}

$write->imcve->success("Successfully imported $count CVE's!");