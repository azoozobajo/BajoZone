<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');
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

$payload = requireAdminAuth();
$body = json_decode((string) file_get_contents('php://input'), true);
$currentPassword = (string) ($body['current_password'] ?? '');
$newPassword = (string) ($body['new_password'] ?? '');
$email = trim((string) ($body['email'] ?? ''));

if ($currentPassword === '' || ($newPassword === '' && $email === '')) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing password or email']);
    exit;
}

try {
    $stmt = getDb()->prepare('SELECT * FROM admin_users WHERE id = ? LIMIT 1');
    $stmt->execute([(string) $payload['uid']]);
    $user = $stmt->fetch();

    if (!is_array($user) || !password_verify($currentPassword, (string) $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid current password']);
        exit;
    }

    if ($newPassword !== '' && strlen($newPassword) < 10) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 10 characters']);
        exit;
    }

    $nextEmail = $email !== '' ? $email : (string) $user['email'];
    $nextHash = $newPassword !== '' ? password_hash($newPassword, PASSWORD_DEFAULT) : (string) $user['password_hash'];

    $update = getDb()->prepare('UPDATE admin_users SET email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    $update->execute([$nextEmail, $nextHash, (string) $user['id']]);

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    error_log('BajoZone admin password update failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update admin account']);
}

