<?php // log.php \\ обертка writer над TypeScript

return function ($req)
{
    $input = json_decode (file_get_contents ('php://input'), true);

    $level = $input['level'] ?? 'default';
    $message = $input['msg'] ?? 'Message Missing!';
    $context = $input['ctx'] ?? [];

    $context['ua'] = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

    $log = Writer::getInstance();

    $log->frontend->{$level}($message, $context);

    Response::json(['status' => 'logged']);
};