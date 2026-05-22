<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/content-repository.php';

header('Content-Type: application/json; charset=utf-8');

try {
    echo json_encode(getContentSnapshot(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    error_log('BajoZone content API failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Content unavailable']);
}

