<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function contentFetchAll(string $sql, array $params = []): array
{
    $stmt = getDb()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function contentFetchOne(string $sql, array $params = []): ?array
{
    $stmt = getDb()->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return is_array($row) ? $row : null;
}

function contentSlug(string $value): string
{
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    return trim((string) $slug, '-');
}

function decodeDataJson(array $row): array
{
    $raw = $row['data_json'] ?? '';
    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function encodeArrayValue($value): string
{
    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function normalizeArticle(array $row): array
{
    $data = decodeDataJson($row);
    $title = (string) ($row['title'] ?? '');
    $excerpt = (string) ($row['excerpt'] ?? '');
    $content = (string) ($row['content'] ?? '');
    $publishedAt = $row['published_at'] ?? $row['created_at'] ?? null;
    $sources = [];
    if (!empty($row['sources_json']) && is_string($row['sources_json'])) {
        $decodedSources = json_decode($row['sources_json'], true);
        $sources = is_array($decodedSources) ? $decodedSources : [];
    }

    return array_merge($data, [
        'id' => (string) ($row['id'] ?? ''),
        'title' => $title,
        'title_ar' => (string) ($data['title_ar'] ?? $title),
        'title_en' => (string) ($data['title_en'] ?? $title),
        'slug' => (string) ($row['slug'] ?? ''),
        'excerpt' => $excerpt,
        'excerpt_ar' => (string) ($data['excerpt_ar'] ?? $excerpt),
        'excerpt_en' => (string) ($data['excerpt_en'] ?? $excerpt),
        'content' => $content,
        'content_ar' => (string) ($data['content_ar'] ?? $content),
        'content_en' => (string) ($data['content_en'] ?? $content),
        'featured_image' => (string) ($row['featured_image'] ?? ''),
        'image' => (string) ($row['featured_image'] ?? ''),
        'category_id' => isset($row['category_id']) ? (string) $row['category_id'] : '',
        'program_id' => isset($row['program_id']) ? (string) $row['program_id'] : (string) ($data['program_id'] ?? ''),
        'category' => $row['category_name'] ?? '',
        'category_ar' => $row['category_name'] ?? '',
        'category_en' => $row['category_name'] ?? '',
        'status' => (string) ($row['status'] ?? 'published'),
        'is_published' => ($row['status'] ?? 'published') === 'published',
        'featured' => (bool) ($row['is_featured'] ?? $data['featured'] ?? false),
        'read_time' => isset($row['read_time']) ? (int) $row['read_time'] : ($data['read_time'] ?? null),
        'youtube_url' => (string) ($row['youtube_url'] ?? $data['youtube_url'] ?? ''),
        'video_url' => (string) ($row['video_url'] ?? $data['video_url'] ?? ''),
        'sources' => $sources ?: ($data['sources'] ?? []),
        'date' => $publishedAt,
        'published_at' => $publishedAt,
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
        'tags' => [],
    ]);
}

function normalizeCategory(array $row): array
{
    $data = decodeDataJson($row);
    $name = (string) ($row['name'] ?? '');
    return array_merge($data, [
        'id' => (string) ($row['id'] ?? ''),
        'name' => $name,
        'name_ar' => (string) ($data['name_ar'] ?? $name),
        'name_en' => (string) ($data['name_en'] ?? $name),
        'slug' => (string) ($row['slug'] ?? ''),
        'description' => (string) ($row['description'] ?? ''),
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
        'published_count' => (int) ($row['published_count'] ?? 0),
    ]);
}

function normalizeTag(array $row): array
{
    $data = decodeDataJson($row);
    return array_merge($data, [
        'id' => (string) ($row['id'] ?? ''),
        'name' => (string) ($row['name'] ?? ''),
        'slug' => (string) ($row['slug'] ?? ''),
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
        'published_count' => (int) ($row['published_count'] ?? 0),
    ]);
}

function normalizeProgram(array $row): array
{
    $data = decodeDataJson($row);
    $title = (string) ($row['title'] ?? '');
    $description = (string) ($row['description'] ?? '');
    return array_merge($data, [
        'id' => (string) ($row['id'] ?? ''),
        'title' => $title,
        'name_ar' => (string) ($data['name_ar'] ?? $title),
        'name_en' => (string) ($data['name_en'] ?? $title),
        'slug' => (string) ($row['slug'] ?? ''),
        'description' => $description,
        'description_ar' => (string) ($data['description_ar'] ?? $description),
        'description_en' => (string) ($data['description_en'] ?? $description),
        'short_description_ar' => (string) ($data['short_description_ar'] ?? $row['short_description'] ?? $description),
        'short_description_en' => (string) ($data['short_description_en'] ?? $row['short_description'] ?? $description),
        'content' => (string) ($row['content'] ?? ''),
        'image' => (string) ($row['image'] ?? ''),
        'logo_url' => (string) ($row['image'] ?? ''),
        'accent_color' => (string) ($row['accent_color'] ?? $data['accent_color'] ?? ''),
        'sort_order' => (int) ($row['sort_order'] ?? $data['sort_order'] ?? 99),
        'is_featured' => (bool) ($row['is_featured'] ?? $data['is_featured'] ?? false),
        'cover_image' => (string) ($row['cover_image'] ?? $data['cover_image'] ?? ''),
        'status' => (string) ($row['status'] ?? 'published'),
        'is_active' => ($row['status'] ?? 'published') === 'published',
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ]);
}

function normalizeBook(array $row): array
{
    $data = decodeDataJson($row);
    return array_merge($data, [
        'id' => (string) ($row['id'] ?? ''),
        'title' => (string) ($row['title'] ?? ''),
        'title_ar' => (string) ($data['title_ar'] ?? $row['title'] ?? ''),
        'title_en' => (string) ($data['title_en'] ?? $row['title'] ?? ''),
        'slug' => (string) ($row['slug'] ?? ''),
        'subtitle_ar' => (string) ($data['subtitle_ar'] ?? $row['subtitle'] ?? ''),
        'subtitle_en' => (string) ($data['subtitle_en'] ?? $row['subtitle'] ?? ''),
        'description_ar' => (string) ($data['description_ar'] ?? $row['description'] ?? ''),
        'description_en' => (string) ($data['description_en'] ?? $row['description'] ?? ''),
        'cover' => (string) ($row['cover'] ?? ''),
        'external_url' => (string) ($row['external_url'] ?? ''),
        'amazon_url' => (string) ($row['amazon_url'] ?? ''),
        'price' => (string) ($row['price'] ?? ''),
        'available' => (bool) ($row['available'] ?? true),
        'has_landing' => (bool) ($row['has_landing'] ?? false),
        'landing_route' => (string) ($row['landing_route'] ?? ''),
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ]);
}

function normalizeResource(array $row): array
{
    $data = decodeDataJson($row);
    return array_merge($data, [
        'id' => (string) ($row['id'] ?? ''),
        'title' => (string) ($row['title'] ?? ''),
        'title_ar' => (string) ($data['title_ar'] ?? $row['title'] ?? ''),
        'title_en' => (string) ($data['title_en'] ?? $row['title'] ?? ''),
        'slug' => (string) ($row['slug'] ?? ''),
        'type' => (string) ($row['type'] ?? $data['type'] ?? ''),
        'short_description_ar' => (string) ($data['short_description_ar'] ?? $row['short_description'] ?? ''),
        'short_description_en' => (string) ($data['short_description_en'] ?? $row['short_description'] ?? ''),
        'full_description_ar' => (string) ($data['full_description_ar'] ?? $row['full_description'] ?? ''),
        'full_description_en' => (string) ($data['full_description_en'] ?? $row['full_description'] ?? ''),
        'language' => (string) ($row['language'] ?? $data['language'] ?? ''),
        'author_or_org' => (string) ($row['author_or_org'] ?? $data['author_or_org'] ?? ''),
        'publisher' => (string) ($row['publisher'] ?? $data['publisher'] ?? ''),
        'publication_year' => $row['publication_year'] ?? $data['publication_year'] ?? null,
        'cover_image' => (string) ($row['cover_image'] ?? $data['cover_image'] ?? ''),
        'source_url' => (string) ($row['source_url'] ?? $data['source_url'] ?? ''),
        'download_url' => (string) ($row['download_url'] ?? $data['download_url'] ?? ''),
        'access_type' => (string) ($row['access_type'] ?? $data['access_type'] ?? ''),
        'rights' => (string) ($row['rights'] ?? $data['rights'] ?? ''),
        'is_featured' => (bool) ($row['is_featured'] ?? $data['is_featured'] ?? false),
        'status' => (string) ($row['status'] ?? 'published'),
        'is_published' => ($row['status'] ?? 'published') === 'published',
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ]);
}

function attachArticleTags(array $articles): array
{
    if (!$articles) {
        return [];
    }

    $ids = array_values(array_filter(array_map(fn($article) => $article['id'] ?? '', $articles)));
    if (!$ids) {
        return $articles;
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $rows = contentFetchAll(
        "SELECT at.article_id, t.id, t.name, t.slug
         FROM article_tags at
         INNER JOIN tags t ON t.id = at.tag_id
         WHERE at.article_id IN ($placeholders)
         ORDER BY t.name",
        $ids
    );

    $tagIdsByArticle = [];
    foreach ($rows as $row) {
        $articleId = (string) $row['article_id'];
        $tagIdsByArticle[$articleId][] = (string) $row['id'];
    }

    foreach ($articles as &$article) {
        $article['tags'] = $tagIdsByArticle[$article['id']] ?? [];
    }
    unset($article);

    return $articles;
}

function getPublishedArticles(): array
{
    $rows = contentFetchAll(
        "SELECT a.*, c.name AS category_name
         FROM articles a
         LEFT JOIN categories c ON c.id = a.category_id
         WHERE a.status = 'published'
         ORDER BY COALESCE(a.published_at, a.created_at) DESC, a.id DESC"
    );

    return attachArticleTags(array_map('normalizeArticle', $rows));
}

function getPublishedArticleBySlug($slug): ?array
{
    $row = contentFetchOne(
        "SELECT a.*, c.name AS category_name
         FROM articles a
         LEFT JOIN categories c ON c.id = a.category_id
         WHERE a.status = 'published' AND a.slug = ?
         LIMIT 1",
        [(string) $slug]
    );

    if (!$row) {
        return null;
    }

    $articles = attachArticleTags([normalizeArticle($row)]);
    return $articles[0] ?? null;
}

function getPublishedPrograms(): array
{
    $rows = contentFetchAll(
        "SELECT *
         FROM programs
         WHERE status = 'published'
         ORDER BY COALESCE(updated_at, created_at) DESC, id DESC"
    );

    return array_map('normalizeProgram', $rows);
}

function getPublishedProgramBySlug($slug): ?array
{
    $row = contentFetchOne(
        "SELECT *
         FROM programs
         WHERE status = 'published' AND slug = ?
         LIMIT 1",
        [(string) $slug]
    );

    return $row ? normalizeProgram($row) : null;
}

function getBooks(): array
{
    $rows = contentFetchAll(
        "SELECT *
         FROM books
         ORDER BY available DESC, COALESCE(updated_at, created_at) DESC, id DESC"
    );

    return array_map('normalizeBook', $rows);
}

function getPublishedResources(): array
{
    $rows = contentFetchAll(
        "SELECT *
         FROM resources
         WHERE status = 'published'
         ORDER BY is_featured DESC, COALESCE(updated_at, created_at) DESC, id DESC"
    );

    return array_map('normalizeResource', $rows);
}

function getCategoriesWithPublishedArticles(): array
{
    $rows = contentFetchAll(
        "SELECT c.*, COUNT(a.id) AS published_count
         FROM categories c
         INNER JOIN articles a ON a.category_id = c.id AND a.status = 'published'
         GROUP BY c.id, c.name, c.slug, c.description, c.data_json, c.created_at, c.updated_at
         ORDER BY c.name"
    );

    return array_map('normalizeCategory', $rows);
}

function getCategoryBySlug($slug): ?array
{
    $row = contentFetchOne(
        "SELECT c.*, COUNT(a.id) AS published_count
         FROM categories c
         LEFT JOIN articles a ON a.category_id = c.id AND a.status = 'published'
         WHERE c.slug = ?
         GROUP BY c.id, c.name, c.slug, c.description, c.data_json, c.created_at, c.updated_at
         LIMIT 1",
        [(string) $slug]
    );

    return $row ? normalizeCategory($row) : null;
}

function getPublishedArticlesByCategorySlug($slug): array
{
    $rows = contentFetchAll(
        "SELECT a.*, c.name AS category_name
         FROM articles a
         INNER JOIN categories c ON c.id = a.category_id
         WHERE a.status = 'published' AND c.slug = ?
         ORDER BY COALESCE(a.published_at, a.created_at) DESC, a.id DESC",
        [(string) $slug]
    );

    return attachArticleTags(array_map('normalizeArticle', $rows));
}

function getTagsWithPublishedArticles(): array
{
    $rows = contentFetchAll(
        "SELECT t.*, COUNT(DISTINCT a.id) AS published_count
         FROM tags t
         INNER JOIN article_tags at ON at.tag_id = t.id
         INNER JOIN articles a ON a.id = at.article_id AND a.status = 'published'
         GROUP BY t.id, t.name, t.slug, t.data_json, t.created_at, t.updated_at
         ORDER BY t.name"
    );

    return array_map('normalizeTag', $rows);
}

function getTagBySlug($slug): ?array
{
    $row = contentFetchOne(
        "SELECT t.*, COUNT(DISTINCT a.id) AS published_count
         FROM tags t
         LEFT JOIN article_tags at ON at.tag_id = t.id
         LEFT JOIN articles a ON a.id = at.article_id AND a.status = 'published'
         WHERE t.slug = ?
         GROUP BY t.id, t.name, t.slug, t.data_json, t.created_at, t.updated_at
         LIMIT 1",
        [(string) $slug]
    );

    return $row ? normalizeTag($row) : null;
}

function getPublishedArticlesByTagSlug($slug): array
{
    $rows = contentFetchAll(
        "SELECT a.*, c.name AS category_name
         FROM articles a
         INNER JOIN article_tags at ON at.article_id = a.id
         INNER JOIN tags t ON t.id = at.tag_id
         LEFT JOIN categories c ON c.id = a.category_id
         WHERE a.status = 'published' AND t.slug = ?
         ORDER BY COALESCE(a.published_at, a.created_at) DESC, a.id DESC",
        [(string) $slug]
    );

    return attachArticleTags(array_map('normalizeArticle', $rows));
}

function getRelatedArticles($articleId, $categoryId, $tagIds, $limit = 3): array
{
    $articleId = (string) $articleId;
    $categoryId = (string) $categoryId;
    $tagIds = array_values(array_filter(array_map('strval', is_array($tagIds) ? $tagIds : [])));
    $limit = max(1, (int) $limit);
    $related = [];
    $seen = [$articleId => true];

    if ($categoryId !== '') {
        $rows = contentFetchAll(
            "SELECT a.*, c.name AS category_name
             FROM articles a
             LEFT JOIN categories c ON c.id = a.category_id
             WHERE a.status = 'published' AND a.category_id = ? AND a.id <> ?
             ORDER BY COALESCE(a.published_at, a.created_at) DESC
             LIMIT $limit",
            [$categoryId, $articleId]
        );
        foreach (attachArticleTags(array_map('normalizeArticle', $rows)) as $article) {
            $related[] = $article;
            $seen[$article['id']] = true;
        }
    }

    if (count($related) < $limit && $tagIds) {
        $placeholders = implode(',', array_fill(0, count($tagIds), '?'));
        $remaining = $limit - count($related);
        $rows = contentFetchAll(
            "SELECT DISTINCT a.*, c.name AS category_name
             FROM articles a
             INNER JOIN article_tags at ON at.article_id = a.id
             LEFT JOIN categories c ON c.id = a.category_id
             WHERE a.status = 'published' AND a.id <> ? AND at.tag_id IN ($placeholders)
             ORDER BY COALESCE(a.published_at, a.created_at) DESC
             LIMIT $remaining",
            array_merge([$articleId], $tagIds)
        );
        foreach (attachArticleTags(array_map('normalizeArticle', $rows)) as $article) {
            if (!isset($seen[$article['id']])) {
                $related[] = $article;
                $seen[$article['id']] = true;
            }
        }
    }

    if (count($related) < $limit) {
        $remaining = $limit - count($related);
        $rows = contentFetchAll(
            "SELECT a.*, c.name AS category_name
             FROM articles a
             LEFT JOIN categories c ON c.id = a.category_id
             WHERE a.status = 'published' AND a.id <> ?
             ORDER BY COALESCE(a.published_at, a.created_at) DESC
             LIMIT $remaining",
            [$articleId]
        );
        foreach (attachArticleTags(array_map('normalizeArticle', $rows)) as $article) {
            if (!isset($seen[$article['id']])) {
                $related[] = $article;
                $seen[$article['id']] = true;
            }
        }
    }

    return array_slice($related, 0, $limit);
}

function getSiteSettings(): array
{
    $rows = contentFetchAll('SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key');
    $settings = [];
    foreach ($rows as $row) {
        $value = $row['setting_value'];
        $decoded = is_string($value) ? json_decode($value, true) : null;
        $settings[$row['setting_key']] = json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    return $settings;
}

function getFallbackJsonContent(): array
{
    // Do not use data/db.json in production. This is only a temporary local-development fallback
    // while MySQL credentials are not configured.
    $dbPath = dirname(__DIR__) . '/data/db.json';
    if (!is_file($dbPath)) {
        return [];
    }

    $db = json_decode((string) file_get_contents($dbPath), true);
    if (!is_array($db)) {
        return [];
    }

    foreach (($db['articles'] ?? []) as &$article) {
        $article['status'] = ($article['is_published'] ?? true) === false ? 'draft' : 'published';
    }
    unset($article);

    foreach (($db['programs'] ?? []) as &$program) {
        $program['status'] = ($program['is_active'] ?? true) === false ? 'draft' : 'published';
        $program['title'] = $program['name_ar'] ?? $program['name_en'] ?? '';
        $program['description'] = $program['description_ar'] ?? $program['description_en'] ?? '';
    }
    unset($program);

    return $db;
}

function contentRepositoryUsesMysql(): bool
{
    try {
        getDb();
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

function contentAllowDevelopmentFallback(): bool
{
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    return PHP_SAPI === 'cli'
        || $host === ''
        || strpos($host, 'localhost') !== false
        || strpos($host, '127.0.0.1') !== false;
}

function getContentSnapshot(): array
{
    try {
        return [
            'settings' => getSiteSettings(),
            'programs' => getPublishedPrograms(),
            'articles' => getPublishedArticles(),
            'categories' => getCategoriesWithPublishedArticles(),
            'tags' => getTagsWithPublishedArticles(),
            'books' => getBooks(),
            'resources' => getPublishedResources(),
            '_source' => 'mysql',
        ];
    } catch (Throwable $e) {
        error_log('BajoZone MySQL content unavailable: ' . $e->getMessage());
        if (!contentAllowDevelopmentFallback()) {
            throw $e;
        }
        $fallback = getFallbackJsonContent();
        $fallback['_source'] = 'development-json-fallback';
        return $fallback;
    }
}

function getAdminArticles(): array
{
    $rows = contentFetchAll(
        "SELECT a.*, c.name AS category_name
         FROM articles a
         LEFT JOIN categories c ON c.id = a.category_id
         ORDER BY COALESCE(a.published_at, a.created_at) DESC, a.id DESC"
    );

    $articles = attachArticleTags(array_map('normalizeArticle', $rows));
    foreach ($articles as $index => $article) {
        $status = $rows[$index]['status'] ?? 'draft';
        $articles[$index]['status'] = $status;
        $articles[$index]['is_published'] = $status === 'published';
    }

    return $articles;
}

function getAdminPrograms(): array
{
    $rows = contentFetchAll('SELECT * FROM programs ORDER BY COALESCE(updated_at, created_at) DESC, id DESC');
    $programs = array_map('normalizeProgram', $rows);
    foreach ($programs as $index => $program) {
        $status = $rows[$index]['status'] ?? 'draft';
        $programs[$index]['status'] = $status;
        $programs[$index]['is_active'] = $status === 'published';
    }

    return $programs;
}

function getAllCategories(): array
{
    return array_map('normalizeCategory', contentFetchAll('SELECT * FROM categories ORDER BY name'));
}

function getAllTags(): array
{
    return array_map('normalizeTag', contentFetchAll('SELECT * FROM tags ORDER BY name'));
}

function getAllResources(): array
{
    return array_map('normalizeResource', contentFetchAll('SELECT * FROM resources ORDER BY COALESCE(updated_at, created_at) DESC, id DESC'));
}

function getAdminContentSnapshot(): array
{
    try {
        return [
            'settings' => getSiteSettings(),
            'programs' => getAdminPrograms(),
            'articles' => getAdminArticles(),
            'categories' => getAllCategories(),
            'tags' => getAllTags(),
            'books' => getBooks(),
            'resources' => getAllResources(),
            '_source' => 'mysql-admin',
        ];
    } catch (Throwable $e) {
        error_log('BajoZone MySQL admin content unavailable: ' . $e->getMessage());
        if (!contentAllowDevelopmentFallback()) {
            throw $e;
        }
        $fallback = getFallbackJsonContent();
        $fallback['_source'] = 'development-json-fallback';
        return $fallback;
    }
}
