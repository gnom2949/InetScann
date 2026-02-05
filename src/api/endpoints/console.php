<?php // console.php \\ ну типо терминал, принимает ввод из браузера и фильтрует его |MARK| START

return function ($request, $write)
{
    $cmdRaw = $_GET['cmd'] ?? 'bash';
    $container = "apache_server";

    // валидация белого списка
    $allowed = [
        'ping', 'nmap', 'curl', 'host', 'traceroute',
        'gcc', 'vim', 'nano', 'ls', 'bash', 'cat',
        'grep', 'touch', 'mkdir', 'clear', 'whoami'
    ];

    $parts = explode(' ', trim($cmdRaw));
    $mainCmd = $parts[0] ?? '';

    if (!in_array($mainCmd, $allowed)) {
        $write->console->error("Access Denied: $mainCmd");
        Response::error("Command '$mainCmd' not allowed", 403);
        return;
    }

    //  запуск процесса
    $descSpec = [
        0 => ["pipe", "r"],   // stdin
        1 => ["pipe", "w"],  // stdout
        2 => ["pipe", "w"]  // stderr
    ];

    $cmd = "docker exec -i -e TERM=xterm $container $cmdRaw 2>&1";
    $proc = proc_open($cmd, $descSpec, $pipes);

    if (!is_resource($proc)) {
        $write->console->error("Failed to start process");
        Response::error("Internal Server Error: Failed to start proc", 500);
        return;
    }

    // переход в режим стриминга
    $write->console->info("Streaming started for: $mainCmd");
    stream_set_blocking($pipes[1], 0);

    while (true) {
        $output = fread($pipes[1], 1024);

        if ($output !== false && strlen($output) > 0) {
            Response::stream(['output' => $output]);
        }

        $status = proc_get_status($proc);
        if (!$status['running']) break;

        if (connection_aborted()) {
            $write->console->warning("User disconnected");
            break;
        }

        usleep(20000); // двасать тысац
    }

    foreach ($pipes as $pipe) {
        if (is_resource($pipe)) fclose($pipe);
    }
    proc_close($proc);

    $write->console->info("Stream closed");
};

// console.php |MARK| END