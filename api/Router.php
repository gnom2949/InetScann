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
        $action = $_GET['action'] ?? null;

        if (!$action) {
            Response::error ("No action provided");
        }

        $file = $this->dir . '/' . $action . '.php';

        if (!file_exists($file)) {
            Response::error ("Unknown action: $action");
        }

        $endpoint = require $file;

        if (is_callable ($endpoint)) {
            return $endpoint ($_GET, $this->write);
        }

        if (is_array ($endpoint)) return Response::json ($endpoint);

        Response::error ("Invalid endpoint response");
    }
}
// Router.php || END