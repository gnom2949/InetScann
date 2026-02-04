<?php // Response.php \\ эээ ну типа ответ ввиде JSON ну всо || START
require __DIR__ . '/../backend/writeron.php';

class Response {
    private static $write = null;

    public static function wr_init ($writer) { self::$write = $writer; }

    // ответ ввиде json
    public static function json ($data)
    {
        self::$write->json->info ("passing the JSON response");
        header ('Content-Type: application/json; charset=utf-8');

        echo json_encode(
            $data,
            JSON_UNESCAPED_UNICODE |
            JSON_PRETTY_PRINT |
            JSON_UNESCAPED_SLASHES
        );

        exit;
    }

    // jib,jxrf
    public static function error (string $msg, int $code = 400)
    {
        http_response_code ($code);

        if (self::$write) {
            self::$write->api->error ("API error: $msg");
        }

        self::json([
            'error' => $msg,
            'code' => $code
        ]);
    }

    // успешный ответ
    public static function ok ($data)
    {
        if (self::$write) self::$write->api->info("API OK response");

        self::json ($data);
    }
}

// Response.php || END