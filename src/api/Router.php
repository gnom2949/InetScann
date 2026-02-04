<?php // Router.php \\ роутер ну типо роутер только роутер || START

class Router 
{
    private string $dir;
    private $write;

    public function __construct(string $dir, $write)
    {
        $this->dir = $dir;
        $this->write = $write;
    }

    public function handle()
    {
        header('Content-Type: application/json');

        $action = $_GET['action'] ?? null;
        if (!$action) {
            Response::error ("No action provided");
        }

        $file = $this->dir . '/' . $action . '.php';

        if (!file_exists($file)) {
            Response::error ("Unknown action: $action");
        }

        // передача логгера в endpoint
        $write = $this->write;
        $result = require __DIR__ . $file;

        Response::json ($result);
    }
}
// Router.php || END