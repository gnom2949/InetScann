<?php // cves.php \\ cve's endpoint || START
$redis = require_once __DIR__ . '/../../backend/redisHndl.php';

return function ($params, $write) use ($redis)
{
    $cve = $params['id'] ?? null;

    if (!$cve) {
        $write->cve->error("CVE value is NULL!!!");
        Response::error ("CVE required", 400);
    }

    $data = $redis->hgetall("cve:$cve");

    if (!$data) {
        $write->cve->alert ("CVE not found");
        Response::error ("CVE not found", 404);
    }

    Response::json ($data);
};
// cves.php || START