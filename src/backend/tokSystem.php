<?php
// tokSystem.php
namespace Src\Backend\tokSys;

class TokenManager {
    private $crypt = "chickenbone_googlechrome";
    public function verifyFromHeaders() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (empty($authHeader)) {
            writer()->auth->warning("Access attempt without token");
            return null;
        }

        $token = str_replace('Bearer ', '', $authHeader);
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            writer()->auth->error("Invalid Token format");
            return null;
        }

        [$header64, $payload64, $signatureProvided] = $parts;

        // Проверка подписи
        $expectedSig = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(
            hash_hmac('sha256', $header64 . "." . $payload64, $this->crypt, true)
        ));

        if (!hash_equals($expectedSig, $signatureProvided)) {
            writer()->auth->critical("WARNING: Token sign not valid!!");
            return null;
        }

        $payload = json_decode(base64_decode(strtr($payload64, '-_', '+/')), true);

        // Проверка времени
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            writer()->auth->warning("Token not valid for: " . ($payload['sub'] ?? 'unknown'));
            return null;
        }

        writer()->auth->info("Token is valid. User ID: " . ($payload['sub'] ?? 'n/a'));
        return $payload;
    }
}

// Инициализация объекта, чтобы он был доступен в api.php
$tokSystem = new TokenManager();
?>