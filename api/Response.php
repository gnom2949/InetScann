<?php // Response.php \\ эээ ну типа ответ ввиде JSON ну всо || START

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
            self::$write->api->error ("$msg");
        }

        self::json([
            'error' => $msg,
            'code' => $code
        ]);
    }

    // успешный ответ
    public static function ok ($data)
    {
        if (self::$write) self::$write->api->info ("API OK response");

        self::json ($data);
    }

    // функция для потоков, разница в том что она не закрывает поток... на этом отличия закончились а и да очищает буфер ✔️✔️✔️
    public static function stream ($data)
    {
        if (!headers_sent()) {
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('Connection: keep-alive');
            header('X-Accel-Buffering: no');
            if (self::$write) self::$write->stream->info('Headers sent, stream starting');
        }
        echo "data: " . json_encode ($data, JSON_UNESCAPED_UNICODE) . "\n\n";
        
        if (ob_get_level() > 0) {
            self::$write->buffer->debug("buffer: " . ob_get_level());
            ob_flush();
        }
        flush();
    }
}

// Response.php || END