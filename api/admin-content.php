<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/content-repository.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

requireAdminAuth();

try {
    $snapshot = getAdminContentSnapshot();
    if (($snapshot['settings'] ?? null) === []) {
        $snapshot['settings'] = new stdClass();
    }
    echo json_encode($snapshot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    error_log('BajoZone admin content API failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Content unavailable']);
}
