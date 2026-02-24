<?php // expHel.php \\ помощник для export\endpoint'а |MARK| START

require_once __DIR__ . '/subNet.php';
require_once __DIR__ . '/macVen.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/redisHndl.php';

function getNetData ($write): array
{
    $write->export->debug ("Collecting network data");

    try {
        $subnet = SubNet::pullSubnet ($write);

        return [
            'scan_time' => date ('Y-m-d H:i:s'),
            'subnet' => $subnet ?? 'N/A',
            'alive_hosts' => [],
            'host_count' => 0
        ];
    } catch (Throwable $e) {
        $write->export->warning ("Network scan failed: " . $e->getMessage());

        return [
            'scan_time' => date ('Y-m-d H:i:s'),
            'subnet' => 'N/A',
            'alive_hosts' => [],
            'host_count' => 0
        ];
    }
}

#function getSecData ($write): array
#{
#    $write->export->debug ("Collecting security audit data ");
#}

function pullDevData ($write, $pdo): array
{
    $write->export->debug ("Collecting devices from Mariadb");

    $devices = [];

    try {
        $stmt = $pdo->query ("SHOW TABLES LIKE 'devices'");
        if ($stmt->rowCount() > 0) {
            $stmt = $pdo->query ("SELECT * FROM devices ORDER BY last_seen DESC");
            $devices = $stmt->fetchAll();

            foreach ($devices as &$dev) {
                $dev ['icon_url'] = '/frontend/public/icons/' . ($dev['icon'] ?? 'Group-Unknown-GREEN.svg');
            }

        } else {
            $write->export->warning ("Table 'devices' does not exist");
        }
    } catch  (Throwable $e) {
        $write->export->warning ("Failed to fetch devices: " . $e->getMessage());
    }

    return [
        'saved_devices' => $devices,
        'total_saved' => count ($devices) 
    ];
}

function pullProfileData ($write, $pdo): array
{
    $write->export->debug ("Collecting scan profiles from DB");

    $profiles = [];

    try {
        $stmt = $pdo->query ("SHOW TABLES LIKE 'profiles'");
        if ($stmt->rowCount() > 0) {
            $stmt = $pdo->query ("SELECT * FROM profiles ORDER BY created_at DESC");
            $profiles = $stmt->fetchAll();
        } else {
            $write->export->warning ("Table 'profiles' does not exist");
        }
    } catch (Throwable $e) {
        $write->export->warning ("Failed to fetch profiles: " . $e->getMessage());
    }

    return [
        'scan_profiles' => $profiles,
        'total_profiles' => count ($profiles)
    ];
}

function getSysData(): array
{
    return [
        'php_version' => phpversion(),
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Apache2 on Debian GNU/Linux',
        'memory_mb' => round (memory_get_usage (true) / 1024 / 1024, 2),
        'export_tms' => time() 
    ];
}
// expHel.php |MARK| START