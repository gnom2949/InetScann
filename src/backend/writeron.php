<?php

class LogWriter {
    private $resource;
    private $useColors;
    private $isConsole;

    public function __construct($resource, $useColors = false, $isConsole = false) {
        $this->resource = $resource;
        $this->useColors = $useColors;
        $this->isConsole = $isConsole;
    }

    public function write($message, $color = null) {
        $output = $message;

        if ($this->useColors && $color && $this->isConsole) {
            $output = $color . $output . "\033[0m";
        }

        fwrite($this->resource, $output);
    }

    public function isConsole() {
        return $this->isConsole;
    }
}

class Writer {
    private static $instance = null;
    private $writers = [];
    private $moduleName = null;
    private $defaultLogDir = 'logs';
    private $logToConsole = true;
    private $useColors = true;

    private $colors = [
        'ERROR'     => "\033[31m", // Красный
        'WARNING'   => "\033[33m", // Желтый
        'WARN'      => "\033[33m", // Желтый
        'INFO'      => "\033[32m", // Зеленый
        'DEBUG'     => "\033[36m", // Голубой
        'NOTICE'    => "\033[34m", // Синий
        'CRITICAL'  => "\033[35m", // Пурпурный
        'ALERT'     => "\033[41m", // Красный фон
        'EMERGENCY' => "\033[41;1m", // Яркий красный фон
        'DEFAULT'   => "\033[36m", // Голубой
    ];

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // По умолчанию пишет в консоль
        $this->addConsoleWriter();
    }

    public function __get($name) {
        $this->moduleName = strtoupper($name);
        return $this;
    }

    public function __call($method, $args) {
        $level = strtoupper ($method);
        $message = $args[0] ?? '';

        $context = isset ($args[1]) ? " | CTX: " . json_encode($args[1], JSON_UNESCAPED_UNICODE) : "";

        $this->writeLog ($this->moduleName, $level, $message . $context);
        $this->moduleName = null;
    }

    /**
     * Добавляет writer для записи в файл
     */
    public function append($def = null, $ld = null, $logcon = true) {
        $logDir = $ld ?? $this->defaultLogDir;
        $this->logToConsole = $logcon;

        // Создаем директорию если нужно
        if (!is_dir($logDir)) {
            mkdir($logDir, 0775, true);
        }

        $filename = "logger-" . date('Y-m-d') . ".log";
        $filepath = $logDir . '/' . $filename;

        $file = fopen($filepath, 'a');
        if (!$file) {
            throw new Exception("Cannot open file: $filepath");
        }

        $this->addFileWriter($file, $filepath);

        // Если нужно логировать в консоль - добавляем консольный writer
        if ($logcon && !$this->hasConsoleWriter()) {
            $this->addConsoleWriter();
        }

        return $this;
    }

    /**
     * Добавляет консольный writer
     */
    private function addConsoleWriter() {
        $writer = new LogWriter(fopen('php://stdout', 'w'), $this->useColors, true);
        $this->writers['console'] = $writer;
    }

    /**
     * Добавляет файловый writer
     */
    private function addFileWriter($resource, $filepath) {
        $writer = new LogWriter($resource, false, false);
        $this->writers['file_' . md5($filepath)] = $writer;
    }

    /**
     * Проверяет есть ли консольный writer
     */
    private function hasConsoleWriter() {
        return isset($this->writers['console']);
    }

    public function useCol (bool $yes = true)
    {
        $this->useColors = $yes;

        if (isset ($this->writers['console'])) {
            $this->addConsoleWriter();
        } 
        return $this;
    }

    /**
     * Устанавливает цветовую схему
     */
    public function colorify($colorScheme = null, bool $yes = true) {
        if ($colorScheme && is_array($colorScheme)) {
            $this->colors = array_merge($this->colors, $colorScheme);
        }
        $this->useColors = ($yes);
        return $this;
    }

    /**
     * Отключает цвета
     */
    public function disableColors() {
        $this->useColors = false;
        if (isset($this->writers['console'])) {
            $this->writers['console'] = new LogWriter(STDERR, false, true);
        }
        return $this;
    }

    /**
     * Добавляет кастомный writer
     */
    public function addWriter($key, $resource, $useColors = false, $isConsole = false) {
        $writer = new LogWriter($resource, $useColors, $isConsole);
        $this->writers[$key] = $writer;
        return $this;
    }

    /**
     * Удаляет writer по ключу
     */
    public function remove ($key) {
        if (isset($this->writers[$key]) && $key !== 'console') {
            fclose($this->writers[$key]->resources);
            unset($this->writers[$key]);
        }
        return $this;
    }

    /**
     * Очищает все writers (кроме консольного)
     */
    public function clearWriters() {
        foreach ($this->writers as $key => $writer) {
            if ($key !== 'console') {
                fclose($writer->resources);
                unset($this->writers[$key]);
            }
        }
        return $this;
    }

    private function writeLog($module, $level, $message) {
        $timestamp = date('Y-m-d H:i:s');
        $logLine = "[$timestamp] [$module] [$level]: $message\n";

        $color = $this->colors[$level] ?? $this->colors['DEFAULT'];

        foreach ($this->writers as $writer) {
            $writer->write($logLine, $color);
        }
    }

    /**
     * Прямой вызов для обратной совместимости
     */
    public function LegacyWrite($level, $message) {
        $module = $this->moduleName ?? 'SYSTEM';
        $level = strtoupper($level);
        $this->writeLog($module, $level, $message);
        $this->moduleName = null;
    }

    #public function __destruct() {
     #   foreach ($this->writers as $key => $writer) {
      #      if ($key !== 'console') {
       #         fclose($this->resource);
       #     }
        #}
    #}
}

function writer() {
    return Writer::getInstance();
}

/*
 Примеры использования:

 1. Базовое использование
 writer()->db->error("Database connection failed!");
 writer()->api->warning("Slow response detected");

 2. Настройка writer'ов
 writer()->writer_append(); // По умолчанию: logs/ + консоль
 writer()->writer_append('custom_module', '/var/logs/myapp', true); // Своя директория
 writer()->writer_append(null, null, false); // Только в файл, без консоли

 3. Цвета
 writer()->writter_colorify(); // Включить цвета
 writer()->writter_colorify(['SUCCESS' => "\033[42m"]); // Добавить свои цвета
 writer()->disableColors(); // Отключить цвета

 4. Множественные writer'ы
 $file1 = fopen('log1.txt', 'a');
 $file2 = fopen('log2.txt', 'a');
 writer()->addWriter('custom1', $file1);
 writer()->addWriter('custom2', $file2, true, false);

 5. Прямой вызов
 writer()->writelog('WARNING', 'Captcha not passed!');
*/
?>