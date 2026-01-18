<?php

class Writer {
    private static $instance = null;
    private $logFile = null;
    private $moduleName = null;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __get($name) {
        $this->moduleName = strtoupper($name);
        return $this;
    }

    public function __call($method, $args) {
        if ($this->moduleName === null) {
            throw new Exception("specify the module first: writer()->db->error()");
        }

        $level = strtoupper($method);
        $message = $args[0] ?? '';
        $this->writeLog($this->moduleName, $level, $message);
        $this->moduleName = null;
    }

    public function lf($filepath) {
        $this->logFile = fopen($filepath, 'a');
        if (!$this->logFile) {
            throw new Exception("Doesnt open file: $filepath");
        }
    }

    public function ld($dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $filename = "logger-" . date('Y-m-d') . ".log";
        $this->lf($dir  . '/' . $filename);
    }

    private function writelog($module, $level, $message) {
        $timestamp = date('Y-m-d H:i:s');
        $logLine = "[$timestamp] [$module] [$level]: $message\n";

        $color = '';
        $reset = "\033[0m";

        if ($this->logFile) {
            fwrite($this->logFile, $logLine);
            fflush($this->logFile);
        } else {
            switch ($level) {
                case 'ERROR': $color = "\033[31m"; break;
                case 'WARN': $color = "\033[33m"; break;
                case 'INFO': $color = "\033[32m"; break;
                default: $color = "\033[36m"; break;
            }
            fwrite(STDERR, $color . $logLine . $reset);
        }
    }

    public function __destruct(){
        if ($this->logFile) {
            fclose($this->logFile);
        }
    }
}

function writer() {
    return Writer::getInstance();
}
?>