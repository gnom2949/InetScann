<?php
require __DIR__ . '/writeron.php';
function secAud (string $ip) {
$ip = $_GET['ip'] ?? null;
if (!$ip) {
    echo json_encode(['error' => 'IP required']);
    exit;
}

$cmd = "nmap -sV --script vulners.nse -T4 -Pn $ip 2>&1";
exec($cmd, $out);

$text = implode("\n", $out);

$ports = [];
$currentPort = null;

foreach ($out as $line) {

    if (preg_match('/^([0-9]+)\/tcp\s+open/i', $line, $m)) {
        $currentPort = $m[1];
        $ports[$currentPort] = [];
        continue;
    }

    if ($currentPort && preg_match('/(CVE-\d{4}-\d+)/', $line, $m)) {
        $ports[$currentPort][] = $m[1];
    }
}

$totalCVE = 0;
foreach ($ports as $p => $cves) {
    $totalCVE += count($cves);
}

$grade = 10 - min(9, $totalCVE);
$grade = max(1, $grade);

echo json_encode([
    'ip' => $ip,
    'cve_count' => $totalCVE,
    'setSecGrade' => "uicoG$grade"
]);
}