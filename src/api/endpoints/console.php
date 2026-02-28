<?php // console.php \\ ну типо терминал, принимает ввод из браузера и фильтрует его |MARK| START

return function ($request, $write)
{
    $cmdRaw = $_GET['cmd'] ?? 'bash';

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

    // базовая защита от инъекций, блокировка опасных символов
    if (preg_match('/[;&|`$><]/', $cmdRaw)) {
        $write->console->error("Blocked dangerous characters in: $cmdRaw");
        Response::error("Command contains forbidden characters", 400);
        return;
    }

    // запуск процесса
    $descSpec = [
        0 => ["pipe", "r"],  // stdin
        1 => ["pipe", "w"],  // stdout
        2 => ["pipe", "w"],  // stderr
    ];

    $proc = proc_open($cmdRaw, $descSpec, $pipes);

    if (!is_resource($proc)) {
        $write->console->error("Failed to start process");
        Response::error("Internal Server Error: Failed to start proc", 500);
        return;
    }

    if (isset($pipes[0]) && is_resource($pipes[0])) {
        fclose($pipes[0]);
    }

    $stdout = '';
    $stderr = '';

    if (isset($pipes[1]) && is_resource($pipes[1])) {
        $stdout = stream_get_contents($pipes[1]) ?: '';
        fclose($pipes[1]);
    }

    if (isset($pipes[2]) && is_resource($pipes[2])) {
        $stderr = stream_get_contents($pipes[2]) ?: '';
        fclose($pipes[2]);
    }

    $exitCode = proc_close($proc);

    $write->console->info("Console command finished: $mainCmd (code: $exitCode)");

    $output = $stdout;
    if ($stderr) {
        $output .= ($output !== '' ? "\n" : "") . $stderr;
    }

    Response::ok([
        'output'    => $output !== '' ? $output : "No output",
        'exit_code' => $exitCode,
    ]);
};

// console.php |MARK| END