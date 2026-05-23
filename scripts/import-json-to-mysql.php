<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script from the command line only.\n");
    exit(1);
}

$jsonPath = $argv[1] ?? (__DIR__ . '/../data/db.json');
if (!is_file($jsonPath)) {
    fwrite(STDERR, "JSON file not found: {$jsonPath}\n");
    exit(1);
}

$data = json_decode((string) file_get_contents($jsonPath), true);
if (!is_array($data)) {
    fwrite(STDERR, "Invalid JSON file.\n");
    exit(1);
}

function importSlug(string $value, string $fallback): string
{
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim((string) $slug, '-');
    return $slug !== '' ? $slug : $fallback;
}

function importDateOrNull($value): ?string
{
    if (!$value) {
        return null;
    }

    $timestamp = strtotime((string) $value);
    return $timestamp ? date('Y-m-d H:i:s', $timestamp) : null;
}

$pdo = getDb();
$pdo->beginTransaction();

try {
    $upsertSetting = $pdo->prepare(
        "INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP"
    );
    foreach (($data['settings'] ?? []) as $key => $value) {
        $upsertSetting->execute([(string) $key, is_scalar($value) ? (string) $value : json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
    }

    $upsertCategory = $pdo->prepare(
        "INSERT INTO categories (id, name, slug, description)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), description = VALUES(description)"
    );
    foreach (($data['categories'] ?? []) as $category) {
        $id = (string) ($category['id'] ?? uniqid('cat', true));
        $name = (string) ($category['name_ar'] ?? $category['name_en'] ?? $category['name'] ?? $id);
        $slug = importSlug((string) ($category['slug'] ?? $category['name_en'] ?? $id), $id);
        $description = $category['description'] ?? $category['description_ar'] ?? $category['description_en'] ?? null;
        $upsertCategory->execute([$id, $name, $slug, $description]);
    }

    $upsertTag = $pdo->prepare(
        "INSERT INTO tags (id, name, slug)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug)"
    );
    foreach (($data['tags'] ?? []) as $tag) {
        $id = (string) ($tag['id'] ?? uniqid('tag', true));
        $name = (string) ($tag['name'] ?? $id);
        $slug = importSlug((string) ($tag['slug'] ?? $name), $id);
        $upsertTag->execute([$id, $name, $slug]);
    }

    $upsertProgram = $pdo->prepare(
        "INSERT INTO programs (id, title, slug, description, content, image, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug), description = VALUES(description), content = VALUES(content), image = VALUES(image), status = VALUES(status)"
    );
    foreach (($data['programs'] ?? []) as $program) {
        $id = (string) ($program['id'] ?? uniqid('prog', true));
        $title = (string) ($program['name_ar'] ?? $program['name_en'] ?? $program['title'] ?? $id);
        $slug = importSlug((string) ($program['slug'] ?? $program['name_en'] ?? $title), $id);
        $description = (string) ($program['description_ar'] ?? $program['description_en'] ?? $program['description'] ?? $program['short_description_ar'] ?? '');
        $content = (string) ($program['content'] ?? $description);
        $image = (string) ($program['image'] ?? $program['logo_url'] ?? '');
        $status = ($program['is_active'] ?? true) === false ? 'draft' : 'published';
        $upsertProgram->execute([$id, $title, $slug, $description, $content, $image, $status]);
    }

    $upsertArticle = $pdo->prepare(
        "INSERT INTO articles (id, title, slug, excerpt, content, featured_image, category_id, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug), excerpt = VALUES(excerpt), content = VALUES(content), featured_image = VALUES(featured_image), category_id = VALUES(category_id), status = VALUES(status), published_at = VALUES(published_at)"
    );
    $deleteTags = $pdo->prepare('DELETE FROM article_tags WHERE article_id = ?');
    $insertTag = $pdo->prepare('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');

    foreach (($data['articles'] ?? []) as $article) {
        $id = (string) ($article['id'] ?? uniqid('article', true));
        $title = (string) ($article['title_ar'] ?? $article['title_en'] ?? $article['title'] ?? $id);
        $slug = importSlug((string) ($article['slug'] ?? $title), $id);
        $excerpt = (string) ($article['excerpt_ar'] ?? $article['excerpt_en'] ?? $article['excerpt'] ?? '');
        $content = (string) ($article['content_ar'] ?? $article['content_en'] ?? $article['content'] ?? '');
        $image = (string) ($article['featured_image'] ?? $article['image'] ?? '');
        $categoryId = $article['category_id'] ?? null;
        $status = ($article['is_published'] ?? true) === false ? 'draft' : 'published';
        $publishedAt = importDateOrNull($article['published_at'] ?? $article['date'] ?? $article['created_at'] ?? null);

        $upsertArticle->execute([$id, $title, $slug, $excerpt, $content, $image, $categoryId, $status, $publishedAt]);
        $deleteTags->execute([$id]);
        foreach (($article['tags'] ?? []) as $tagId) {
            $insertTag->execute([$id, (string) $tagId]);
        }
    }

    $pdo->commit();
    echo "Imported content into MySQL.\n";
} catch (Throwable $e) {
    $pdo->rollBack();
    fwrite(STDERR, "Import failed: {$e->getMessage()}\n");
    exit(1);
}

