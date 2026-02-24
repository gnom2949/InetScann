<?php // export.php \\ функция-экспортер, собирает данные и парсит в json |MARK| START

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../backend/subNet.php';
require_once __DIR__ . '/../../backend/macVen.php';
require_once __DIR__ . '/../../backend/utils.php';
require_once __DIR__ . '/../../backend/expHel.php';

return function ($params, $write) use ($pdo)
{
    $write->export->info ("Stating JSON export");

    header ('Content-Type: application/json');
    header ('Content-Disposition: attachment; filename="inn-export-' . date('Y-m-d-His') . '.json"');

    $exportData = [
        'export' => [
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.2.1',
            'format' => 'json'
        ],
        'network' => getNetData ($write),
        'devices' => pullDevData ($write, $pdo),
        'profiles' => pullProfileData ($write, $pdo),
        'system' => getSysData()
    ];  

    echo json_encode( $exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
};

// export.php |MARK| END