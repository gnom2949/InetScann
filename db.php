<?php // db.php \\ файл описания подключения к бд через PDO (PHP Data Objects) |MARK| START

require_once __DIR__ . '/backend/writeron.php';

class SQL
{
    private PDO $pdo;

    public function __construct(array $cfg)
    {
        $host = $cfg['host'] ?? '127.0.0.1';
        $db = $cfg['db'] ?? 'InnDB';
        $user = $cfg['user'] ?? 'GnomeDef';
        $password = $cfg['password'] ?? 'Nopened90';
        $conScheme = "mysql:host=$host;dbname=$db;charset=utf8mb4";

        $this->pdo = new PDO ($conScheme, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }

    public function dFetch (string $sql, array $params = []): ?array
    {
        $stmt = $this->pdo->prepare ($sql);
        $stmt->execute ($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function muchFetch (string $sql, array $params = []): array
    {
        $stmt = $this->pdo->prepare ($sql);
        $stmt->execute ($params);
        return $stmt->fetchAll();
    }

    public function exec (string $sql, array $params = []): int
    {
        $stmt = $this->pdo->prepare ($sql);
        $stmt->execute ($params);
        return $stmt->rowCount();
    }

    public function insert (string $sql, array $params = []): int
    {
        $stmt = $this->pdo->prepare ($sql);
        $stmt->execute ($params);
        return (int)$this->pdo->lastInsertId();
    }
}

// db.php /\\ |MARK| END