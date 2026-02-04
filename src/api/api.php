<?php // api.php \\ MAIN ROUTER || START
require __DIR__ . '/../../vendor/autoload.php';
require __DIR__ . '/Router.php';
require __DIR__ . '/Response.php';
require __DIR__ . '/../backend/writeron.php';

$write = new Writer;
$write->append();
$write->colorify();

// передача логгера в Response.php 
Response::wr_init ($write);

$router = new Router (__DIR__ . '/endpoints', $write);
$router->handle();
// api.php || END