<?php // api.php \\ MAIN ROUTER || START

use Symfony\Component\Routing\Route;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/Router.php';
require __DIR__ . '/Response.php';
require __DIR__ . '/../backend/writeron.php';

$write = Writer::getInstance();
$write->append();
$write->colorify(['SUCCESS' => "\033[42m", 'FAILURE' => "\033[101m"]);

// передача логгера в Response.php 
Response::wr_init ($write);

try {
    $router = new Router (__DIR__ . '/endpoints', $write);

    $router->handle();

} catch (\Throwable $ex) {
    $write->api->error ("Crash detected: " . $ex->getMessage(), [
        'file' => $ex->getFile(),
        'line' => $ex->getLine()
    ]);

    http_response_code (500);
    echo json_encode([
        'status' => 'error',
        'message' => "Internal Server Error!",
        'debug' => $ex->getMessage()
    ]);
}

// api.php || END