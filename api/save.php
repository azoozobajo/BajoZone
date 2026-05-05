<?php
/**
 * BajoZone API - Save Database
 * Saves the CMS database JSON file
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Simple token check
$token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
if (empty($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Get JSON body
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
if (!isset($data['settings']) || !isset($data['articles'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data structure']);
    exit;
}

// Don't expose admin credentials in response, but keep them in DB
$dbPath = __DIR__ . '/../data/db.json';

// Create backup
if (file_exists($dbPath)) {
    $backupPath = __DIR__ . '/../data/db_backup_' . date('YmdHis') . '.json';
    copy($dbPath, $backupPath);
    
    // Keep only last 5 backups
    $backups = glob(__DIR__ . '/../data/db_backup_*.json');
    if (count($backups) > 5) {
        usort($backups, fn($a,$b) => filemtime($a) - filemtime($b));
        foreach (array_slice($backups, 0, count($backups) - 5) as $old) {
            unlink($old);
        }
    }
}

// Save
$result = file_put_contents($dbPath, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save database']);
    exit;
}

echo json_encode(['success' => true, 'saved' => date('Y-m-d H:i:s')]);
