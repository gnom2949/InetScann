<?php
require __DIR__ . '/../../db.php';

return function ($req, $write) use ($pdo) {

    $action = $req['mode'] ?? 'list';

    if ($action === 'list') {
        $stmt = $pdo->query("SELECT * FROM scan_profiles ORDER BY created_at DESC");
        return Response::json([
            'profiles' => $stmt->fetchAll()
        ]);
    }

    if ($action === 'add') {
        $name = $req['name'] ?? null;
        $start = $req['start'] ?? null;
        $end = $req['end'] ?? null;

        if (!$name || !$start || !$end) {
            return Response::error("Missing fields");
        }

        $stmt = $pdo->prepare("INSERT INTO scan_profiles (name, range_start, range_end) VALUES (?, ?, ?)");
        $stmt->execute([$name, $start, $end]);

        return Response::ok(['status' => 'added']);
    }

    if ($action === 'delete') {
        $id = $req['id'] ?? null;
        if (!$id) return Response::error("ID required");

        $stmt = $pdo->prepare("DELETE FROM scan_profiles WHERE id = ?");
        $stmt->execute([$id]);

        return Response::ok(['status' => 'deleted']);
    }

    return Response::error("Unknown mode");
};
