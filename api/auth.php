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

$body = json_decode((string) file_get_contents('php://input'), true);
$email = trim((string) ($body['email'] ?? ''));
$password = (string) ($body['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

try {
    $user = getAdminUserByEmail($email);
    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'token' => createAdminToken($user),
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    error_log('BajoZone admin login failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Login unavailable']);
}

