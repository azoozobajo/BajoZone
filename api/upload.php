<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$_SERVER['HTTP_X_ADMIN_TOKEN'] = $_POST['token'] ?? ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '');
requireAdminAuth();

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$path = $_POST['path'] ?? '';

// Security checks
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type']);
    exit;
}

// Max 5MB
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large (max 5MB)']);
    exit;
}

// Sanitize path
$path = preg_replace('/[^a-zA-Z0-9_.\-\/]/', '_', $path);
$path = ltrim($path, '/');

// Ensure path is inside assets/images
if (!str_starts_with($path, 'assets/images/')) {
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $path = 'assets/images/' . uniqid() . '.' . $ext;
}

$fullPath = __DIR__ . '/../' . $path;
$dir = dirname($fullPath);

if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

if (move_uploaded_file($file['tmp_name'], $fullPath)) {
    echo json_encode(['success' => true, 'path' => $path]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
}
