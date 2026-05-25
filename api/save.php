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

requireAdminAuth();

$data = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($data) || !isset($data['settings']) || !isset($data['articles'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data structure']);
    exit;
}

function apiSlug(string $value, string $fallback): string
{
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim((string) $slug, '-');
    return $slug !== '' ? $slug : $fallback;
}

function apiDateOrNull($value): ?string
{
    if (!$value) {
        return null;
    }
    $timestamp = strtotime((string) $value);
    return $timestamp ? date('Y-m-d H:i:s', $timestamp) : null;
}

function deleteMissingRows(PDO $pdo, string $table, array $ids): void
{
    if (!$ids) {
        $pdo->exec("DELETE FROM {$table}");
        return;
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $pdo->prepare("DELETE FROM {$table} WHERE id NOT IN ($placeholders)")->execute($ids);
}

function encodeSettingValue($value): string
{
    if (is_bool($value) || is_array($value) || is_object($value) || $value === null) {
        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    return (string) $value;
}

try {
    $pdo = getDb();
    $pdo->beginTransaction();

    $upsertSetting = $pdo->prepare(
        "INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP"
    );
    foreach (($data['settings'] ?? []) as $key => $value) {
        $upsertSetting->execute([(string) $key, encodeSettingValue($value)]);
    }

    $upsertCategory = $pdo->prepare(
        "INSERT INTO categories (id, name, slug, description, data_json)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), description = VALUES(description), data_json = VALUES(data_json)"
    );
    foreach (($data['categories'] ?? []) as $category) {
        $id = (string) ($category['id'] ?? uniqid('cat', true));
        $name = (string) ($category['name_ar'] ?? $category['name_en'] ?? $category['name'] ?? $id);
        $slug = apiSlug((string) ($category['slug'] ?? $category['name_en'] ?? $id), $id);
        $description = $category['description'] ?? $category['description_ar'] ?? $category['description_en'] ?? null;
        $upsertCategory->execute([$id, $name, $slug, $description, json_encode($category, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
    }

    $categoryRows = $pdo->query('SELECT id FROM categories')->fetchAll(PDO::FETCH_COLUMN);
    $validCategoryIds = array_fill_keys(array_map('strval', $categoryRows ?: []), true);

    $upsertTag = $pdo->prepare(
        "INSERT INTO tags (id, name, slug, data_json)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), data_json = VALUES(data_json)"
    );
    foreach (($data['tags'] ?? []) as $tag) {
        $id = (string) ($tag['id'] ?? uniqid('tag', true));
        $name = (string) ($tag['name'] ?? $id);
        $slug = apiSlug((string) ($tag['slug'] ?? $name), $id);
        $upsertTag->execute([$id, $name, $slug, json_encode($tag, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
    }

    $upsertProgram = $pdo->prepare(
        "INSERT INTO programs (id, title, slug, description, content, image, short_description, accent_color, sort_order, is_featured, cover_image, data_json, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug), description = VALUES(description), content = VALUES(content), image = VALUES(image), short_description = VALUES(short_description), accent_color = VALUES(accent_color), sort_order = VALUES(sort_order), is_featured = VALUES(is_featured), cover_image = VALUES(cover_image), data_json = VALUES(data_json), status = VALUES(status)"
    );
    foreach (($data['programs'] ?? []) as $program) {
        $id = (string) ($program['id'] ?? uniqid('prog', true));
        $title = (string) ($program['name_ar'] ?? $program['name_en'] ?? $program['title'] ?? $id);
        $slug = apiSlug((string) ($program['slug'] ?? $program['name_en'] ?? $title), $id);
        $description = (string) ($program['description_ar'] ?? $program['description_en'] ?? $program['description'] ?? $program['short_description_ar'] ?? '');
        $shortDescription = (string) ($program['short_description_ar'] ?? $program['short_description_en'] ?? $description);
        $content = (string) ($program['content'] ?? $description);
        $image = (string) ($program['image'] ?? $program['logo_url'] ?? '');
        $status = ($program['is_active'] ?? true) === false ? 'draft' : 'published';
        $upsertProgram->execute([
            $id,
            $title,
            $slug,
            $description,
            $content,
            $image,
            $shortDescription,
            (string) ($program['accent_color'] ?? ''),
            (int) ($program['sort_order'] ?? 99),
            !empty($program['is_featured']) ? 1 : 0,
            (string) ($program['cover_image'] ?? ''),
            json_encode($program, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $status,
        ]);
    }

    $upsertArticle = $pdo->prepare(
        "INSERT INTO articles (id, title, slug, excerpt, content, featured_image, category_id, program_id, is_featured, read_time, youtube_url, video_url, sources_json, data_json, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug), excerpt = VALUES(excerpt), content = VALUES(content), featured_image = VALUES(featured_image), category_id = VALUES(category_id), program_id = VALUES(program_id), is_featured = VALUES(is_featured), read_time = VALUES(read_time), youtube_url = VALUES(youtube_url), video_url = VALUES(video_url), sources_json = VALUES(sources_json), data_json = VALUES(data_json), status = VALUES(status), published_at = VALUES(published_at)"
    );
    $deleteArticleTags = $pdo->prepare('DELETE FROM article_tags WHERE article_id = ?');
    $insertArticleTag = $pdo->prepare(
        "INSERT IGNORE INTO article_tags (article_id, tag_id)
         VALUES (?, ?)"
    );

    foreach (($data['articles'] ?? []) as $article) {
        $id = (string) ($article['id'] ?? uniqid('article', true));
        $title = (string) ($article['title_ar'] ?? $article['title_en'] ?? $article['title'] ?? $id);
        $slug = apiSlug((string) ($article['slug'] ?? $title), $id);
        $excerpt = (string) ($article['excerpt_ar'] ?? $article['excerpt_en'] ?? $article['excerpt'] ?? '');
        $content = (string) ($article['content_ar'] ?? $article['content_en'] ?? $article['content'] ?? '');
        $image = (string) ($article['featured_image'] ?? $article['image'] ?? '');
        $categoryId = isset($article['category_id']) ? (string) $article['category_id'] : '';
        $categoryId = ($categoryId !== '' && isset($validCategoryIds[$categoryId])) ? $categoryId : null;
        $programId = isset($article['program_id']) ? (string) $article['program_id'] : null;
        $programId = $programId !== '' ? $programId : null;
        $status = ($article['is_published'] ?? true) === false ? 'draft' : 'published';
        $publishedAt = apiDateOrNull($article['published_at'] ?? $article['date'] ?? $article['created_at'] ?? null);

        $upsertArticle->execute([
            $id,
            $title,
            $slug,
            $excerpt,
            $content,
            $image,
            $categoryId,
            $programId,
            !empty($article['featured']) ? 1 : 0,
            isset($article['read_time']) ? $article['read_time'] : null,
            (string) ($article['youtube_url'] ?? ''),
            (string) ($article['video_url'] ?? ''),
            json_encode($article['sources'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            json_encode($article, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $status,
            $publishedAt,
        ]);
        $deleteArticleTags->execute([$id]);
        foreach (($article['tags'] ?? []) as $tagId) {
            $insertArticleTag->execute([$id, (string) $tagId]);
        }
    }

    $upsertBook = $pdo->prepare(
        "INSERT INTO books (id, title, slug, subtitle, description, cover, external_url, amazon_url, price, available, has_landing, landing_route, data_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug), subtitle = VALUES(subtitle), description = VALUES(description), cover = VALUES(cover), external_url = VALUES(external_url), amazon_url = VALUES(amazon_url), price = VALUES(price), available = VALUES(available), has_landing = VALUES(has_landing), landing_route = VALUES(landing_route), data_json = VALUES(data_json)"
    );
    foreach (($data['books'] ?? []) as $book) {
        $id = (string) ($book['id'] ?? uniqid('book', true));
        $title = (string) ($book['title_ar'] ?? $book['title_en'] ?? $book['title'] ?? $id);
        $slug = apiSlug((string) ($book['slug'] ?? $book['title_en'] ?? $title), $id);
        $upsertBook->execute([
            $id,
            $title,
            $slug,
            (string) ($book['subtitle_ar'] ?? $book['subtitle_en'] ?? ''),
            (string) ($book['description_ar'] ?? $book['description_en'] ?? ''),
            (string) ($book['cover'] ?? ''),
            (string) ($book['external_url'] ?? ''),
            (string) ($book['amazon_url'] ?? ''),
            (string) ($book['price'] ?? ''),
            ($book['available'] ?? true) === false ? 0 : 1,
            !empty($book['has_landing']) ? 1 : 0,
            (string) ($book['landing_route'] ?? ''),
            json_encode($book, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    $upsertResource = $pdo->prepare(
        "INSERT INTO resources (id, title, slug, type, short_description, full_description, language, author_or_org, publisher, publication_year, cover_image, source_url, download_url, access_type, rights, is_featured, status, data_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))
         ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug), type = VALUES(type), short_description = VALUES(short_description), full_description = VALUES(full_description), language = VALUES(language), author_or_org = VALUES(author_or_org), publisher = VALUES(publisher), publication_year = VALUES(publication_year), cover_image = VALUES(cover_image), source_url = VALUES(source_url), download_url = VALUES(download_url), access_type = VALUES(access_type), rights = VALUES(rights), is_featured = VALUES(is_featured), status = VALUES(status), data_json = VALUES(data_json), updated_at = VALUES(updated_at)"
    );
    foreach (($data['resources'] ?? []) as $resource) {
        $id = (string) ($resource['id'] ?? uniqid('res', true));
        $title = (string) ($resource['title_ar'] ?? $resource['title_en'] ?? $resource['title'] ?? $id);
        $slug = apiSlug((string) ($resource['slug'] ?? $resource['title_en'] ?? $title), $id);
        $status = ($resource['is_published'] ?? true) === false ? 'draft' : 'published';
        $upsertResource->execute([
            $id,
            $title,
            $slug,
            (string) ($resource['type'] ?? ''),
            (string) ($resource['short_description_ar'] ?? $resource['short_description_en'] ?? ''),
            (string) ($resource['full_description_ar'] ?? $resource['full_description_en'] ?? ''),
            (string) ($resource['language'] ?? ''),
            (string) ($resource['author_or_org'] ?? ''),
            (string) ($resource['publisher'] ?? ''),
            isset($resource['publication_year']) ? $resource['publication_year'] : null,
            (string) ($resource['cover_image'] ?? ''),
            (string) ($resource['source_url'] ?? ''),
            (string) ($resource['download_url'] ?? ''),
            (string) ($resource['access_type'] ?? ''),
            (string) ($resource['rights'] ?? ''),
            !empty($resource['is_featured']) ? 1 : 0,
            $status,
            json_encode($resource, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            apiDateOrNull($resource['created_at'] ?? null),
            apiDateOrNull($resource['updated_at'] ?? null),
        ]);
    }

    $articleIds = array_values(array_filter(array_map(fn($article) => (string) ($article['id'] ?? ''), $data['articles'] ?? [])));
    deleteMissingRows($pdo, 'articles', $articleIds);

    $programIds = array_values(array_filter(array_map(fn($program) => (string) ($program['id'] ?? ''), $data['programs'] ?? [])));
    deleteMissingRows($pdo, 'programs', $programIds);

    $tagIds = array_values(array_filter(array_map(fn($tag) => (string) ($tag['id'] ?? ''), $data['tags'] ?? [])));
    deleteMissingRows($pdo, 'tags', $tagIds);

    $categoryIds = array_values(array_filter(array_map(fn($category) => (string) ($category['id'] ?? ''), $data['categories'] ?? [])));
    deleteMissingRows($pdo, 'categories', $categoryIds);

    $bookIds = array_values(array_filter(array_map(fn($book) => (string) ($book['id'] ?? ''), $data['books'] ?? [])));
    deleteMissingRows($pdo, 'books', $bookIds);

    $resourceIds = array_values(array_filter(array_map(fn($resource) => (string) ($resource['id'] ?? ''), $data['resources'] ?? [])));
    deleteMissingRows($pdo, 'resources', $resourceIds);

    $pdo->commit();
    echo json_encode(['success' => true, 'saved' => date('Y-m-d H:i:s'), 'storage' => 'mysql']);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('BajoZone MySQL save failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save content']);
}
