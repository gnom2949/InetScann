<?php // скрипт который импортирует базу IEEE через список src/oui.txt |MARK| START

require_once __DIR__ . '/backend/redisHndl.php';
require_once __DIR__ . '/backend/utils.php';
require_once __DIR__ . '/backend/writeron.php';

$write = Writer::getInstance();
$write->append();
$write->colorify();

$file = 'oui.txt';
$dcmd = "wget http://standarts-oui.ieee.org";

if (!file_exists ($file)) {
    echo "\033[31mFile not exists! Downloading...\n\033[0m";
    shell_exec ($dcmd);
}

$redis = redis ($write);
$handle = fopen ($file, "r");
$count = 0;

echo "Starting import to redis via 'HSET'";

if ($handle) {
    while (($line = fgets ($handle)) !== false) {
        if (preg_match ('/^([0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2})\s+\(hex\)\s+(.+)/', $line, $matches)) {
            $prefixRaw = $matches[1];
            $vendor = trim ($matches[2]);

            $prefix = str_replace('-', '', $prefixRaw);

            $redis->hset ("mac:$prefix", "vendor", $vendor);
            $count++;

            if ($count % 1000 === 0) {
                echo "Processed $count records\n";
            }
        }
    }
    fclose ($handle);
    echo "Complete! Imported records: $count\n";
} else {
    echo "Failure, could not open file!\n";
}

// imoui.php |MARK| END