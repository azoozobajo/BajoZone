<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function adminTokenPayload(array $user): array
{
    return [
        'uid' => (string) ($user['id'] ?? ''),
        'email' => (string) ($user['email'] ?? ''),
        'exp' => time() + ADMIN_SESSION_TTL,
    ];
}

function base64UrlEncode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64UrlDecode(string $value): string
{
    $padding = strlen($value) % 4;
    if ($padding) {
        $value .= str_repeat('=', 4 - $padding);
    }
    return (string) base64_decode(strtr($value, '-_', '+/'), true);
}

function signAdminPayload(string $payload): string
{
    return base64UrlEncode(hash_hmac('sha256', $payload, APP_KEY, true));
}

function createAdminToken(array $user): string
{
    $payload = base64UrlEncode(json_encode(adminTokenPayload($user), JSON_UNESCAPED_SLASHES));
    return $payload . '.' . signAdminPayload($payload);
}

function verifyAdminToken(?string $token): ?array
{
    if (!$token || !str_contains($token, '.')) {
        return null;
    }

    [$payload, $signature] = explode('.', $token, 2);
    if (!hash_equals(signAdminPayload($payload), $signature)) {
        return null;
    }

    $data = json_decode(base64UrlDecode($payload), true);
    if (!is_array($data) || empty($data['uid']) || empty($data['exp']) || (int) $data['exp'] < time()) {
        return null;
    }

    return $data;
}

function requireAdminAuth(): array
{
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    $payload = verifyAdminToken($token);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    return $payload;
}

function getAdminUserByEmail(string $email): ?array
{
    $stmt = getDb()->prepare('SELECT * FROM admin_users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $row = $stmt->fetch();
    return is_array($row) ? $row : null;
}

