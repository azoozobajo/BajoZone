<?php
declare(strict_types=1);

header('Content-Type: application/xml; charset=utf-8');

const SITE_URL = 'https://bajozone.com';

function xmlEscape(string $value): string
{
    return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
}

function normalizedDate(?string $date): string
{
    if (!$date) {
        return '';
    }

    $timestamp = strtotime($date);
    return $timestamp ? gmdate('Y-m-d', $timestamp) : '';
}

function addUrl(array &$urls, string $path, string $lastmod = '', string $changefreq = '', string $priority = ''): void
{
    $path = '/' . ltrim($path, '/');
    $urls[] = [
        'loc' => SITE_URL . ($path === '/' ? '/' : rtrim($path, '/')),
        'lastmod' => $lastmod,
        'changefreq' => $changefreq,
        'priority' => $priority,
    ];
}

function categorySlug(array $category): string
{
    $source = $category['slug'] ?? $category['name_en'] ?? $category['id'] ?? '';
    $slug = strtolower((string) $source);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    return trim((string) $slug, '-');
}

function tagSlug(array $tag): string
{
    $source = $tag['slug'] ?? $tag['name'] ?? $tag['id'] ?? '';
    $slug = strtolower((string) $source);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    return trim((string) $slug, '-');
}

$dbPath = __DIR__ . '/data/db.json';
$db = is_file($dbPath) ? json_decode((string) file_get_contents($dbPath), true) : [];
$urls = [];

addUrl($urls, '/', '', 'weekly', '1.0');
addUrl($urls, '/articles', '', 'weekly', '0.9');
addUrl($urls, '/programs', '', 'weekly', '0.8');
addUrl($urls, '/about', '', 'monthly', '0.7');
addUrl($urls, '/author/abdulaziz-bajkhaif', '', 'monthly', '0.7');

$publishedArticles = array_filter(($db['articles'] ?? []), fn($article) => ($article['is_published'] ?? true) !== false);
foreach (($db['categories'] ?? []) as $category) {
    $slug = categorySlug($category);
    if ($slug === '') {
        continue;
    }

    $hasPublishedArticle = (bool) array_filter($publishedArticles, fn($article) => ($article['category_id'] ?? '') === ($category['id'] ?? ''));
    if ($hasPublishedArticle) {
        addUrl($urls, '/articles/category/' . rawurlencode($slug), '', 'monthly', '0.6');
    }
}

foreach (($db['tags'] ?? []) as $tag) {
    $slug = tagSlug($tag);
    if ($slug === '') {
        continue;
    }

    $taggedArticles = array_filter($publishedArticles, fn($article) => is_array($article['tags'] ?? null) && in_array($tag['id'] ?? '', $article['tags'], true));
    if (count($taggedArticles) >= 3) {
        addUrl($urls, '/articles/tag/' . rawurlencode($slug), '', 'monthly', '0.5');
    }
}

foreach (($db['articles'] ?? []) as $article) {
    if (($article['is_published'] ?? true) === false) {
        continue;
    }

    $slug = $article['slug'] ?? $article['id'] ?? '';
    if ($slug === '') {
        continue;
    }

    $lastmod = normalizedDate($article['updated_at'] ?? $article['updated'] ?? $article['date'] ?? null);
    addUrl($urls, '/article/' . rawurlencode((string) $slug), $lastmod, 'monthly', '0.7');
}

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

foreach ($urls as $url) {
    echo "  <url>\n";
    echo '    <loc>' . xmlEscape($url['loc']) . "</loc>\n";
    if ($url['lastmod'] !== '') {
        echo '    <lastmod>' . xmlEscape($url['lastmod']) . "</lastmod>\n";
    }
    if ($url['changefreq'] !== '') {
        echo '    <changefreq>' . xmlEscape($url['changefreq']) . "</changefreq>\n";
    }
    if ($url['priority'] !== '') {
        echo '    <priority>' . xmlEscape($url['priority']) . "</priority>\n";
    }
    echo "  </url>\n";
}

echo "</urlset>\n";
