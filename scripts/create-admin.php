<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script from the command line only.\n");
    exit(1);
}

$email = $argv[1] ?? '';
$password = $argv[2] ?? '';
$name = $argv[3] ?? 'BajoZone Admin';

if ($email === '' || $password === '') {
    fwrite(STDERR, "Usage: php scripts/create-admin.php admin@example.com \"StrongPassword123\" \"Admin Name\"\n");
    exit(1);
}

if (strlen($password) < 10) {
    fwrite(STDERR, "Password must be at least 10 characters.\n");
    exit(1);
}

$id = 'admin_' . bin2hex(random_bytes(8));
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = getDb()->prepare(
    "INSERT INTO admin_users (id, name, email, password_hash)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), updated_at = CURRENT_TIMESTAMP"
);
$stmt->execute([$id, $name, $email, $hash]);

echo "Admin user is ready: {$email}\n";

