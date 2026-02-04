<?php // subNet.php \\ ну типа файл который получает маску подсети и дает нормальное сканирование || START
require __DIR__ . '/writeron.php';

header('Content-Type: application/json');

function pullAliveDev(): array 
{
    $write = new Writer;
    $write->append();
    $write->colorify();

    // поиск строки 'default via ... dev eth0'
    $write->Network->info ("Getting subnet ip...");
    $subnet = shell_exec("ip -o -f inet addr show | awk '/scope global/ {print $4}' | head -n1");
    $subnet = trim ($subnet);
   
    if (empty($subnet)) {
        $write->Network->error ("We couldn't receive subnet");
        return ['error' => 'We couldn receive subnet'];
    }

    //запуск nmap
    $rawOutput = shell_exec("sudo nmap -sn -n $subnet");

    // парсинг вывода
    preg_match_all('/report for ([\d\.]+)/', $rawOutput, $matches);

    return [
        'subnet' => $subnet,
        'alive' => $matches[1] ?? []
    ];
}
Response::json(pullAliveDev());

// subNet.php || END