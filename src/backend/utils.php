<?php // utils.php \\ утилиты для api |MARK| START
//проверка валидности IPv4
function isValidIp (string $ip): bool
{
    return filter_var ($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false;
}

// получение MAC через ARP
function getMFA (string $ip): ?string
{
    if (!isValidIp($ip)) return null;

    // чтение arp
    $arpRead = shell_exec ("arp -n $ip 2>/dev/null");

    if (!$arpRead) return null;

    // поиск MAC
    if (preg_match ('/(([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2)/', $arpRead, $m)) return strtolower ($m[1]);

    return null;
}

// нормализация MAC 
function normalizeMac (string $mac): string 
{
    return strtoupper (str_replace ([':', '-'], '', $mac));
}

// utils.php |MARK| END