<?php // api.php (Main header)
require __DIR__ . '../vendor/autoload.php';
require __DIR__ . '/backend/writeron.php';
require __DIR__ . '/backend/macVen.php';
require __DIR__ . '/backend/ping.php';
require __DIR__ . '/backend/subNet.php';
require __DIR__ . '/backend/SecAu.php';

header ('Content-Type: application/json');
writer()->writer_append();
writer()->writer_colorify();

$action = $_GET['action'] ?? null;

switch ($action) {
    case 'ping':
        writer()->action->info("User queried ping");
        echo json_encode (pingDevice ($_GET['ip'] ?? ''));
        break;
    
    case 'mac':
        writer()->action->info("User queried mac");
        echo json_encode (macVendor ($_GET['mac'] ?? ''));
        break;
    case 'subnet':
        writer()->action->info("User queried SubNet Scanner");
        echo json_encode (getSubNet());
    case 'audit':
        writer()->action->info("User queried the Security Audit");
        echo json_encode (secAud ($_GET['ip'] ?? ''));
        break;
    default:
        writer()->action->error ("Unknown action query!");
        echo json_encode (['error' => 'Unknown action']);
}
?>