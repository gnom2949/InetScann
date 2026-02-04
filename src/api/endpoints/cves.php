<?php // cves.php \\ cve's endpoint || START
$redis = require_once __DIR__ . '/../../backend/redisHndl.php';

$cve = $_GET['id'] ?? null;

if (!$cve) {
    $write->cve->error("CVE value is NULL!!!");
    return ['error' => 'CVE ID Required'];
}

$data = $redis->hgetall("cve:$cve");

if (!$data) {
    $write->cve->alert ("CVE not found");
    return ['error' => 'CVE not found'];
}

return $data;

// cves.php || START