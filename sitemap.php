<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/content-repository.php';

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

$content = getContentSnapshot();
$urls = [];

addUrl($urls, '/', '', 'weekly', '1.0');
addUrl($urls, '/articles', '', 'weekly', '0.9');
addUrl($urls, '/programs', '', 'weekly', '0.8');
addUrl($urls, '/about', '', 'monthly', '0.7');
addUrl($urls, '/author/abdulaziz-bajkhaif', '', 'monthly', '0.7');

$publishedArticles = array_values(array_filter(
    $content['articles'] ?? [],
    fn($article) => ($article['status'] ?? 'published') === 'published'
));

foreach (($content['categories'] ?? []) as $category) {
    $slug = (string) ($category['slug'] ?? '');
    if ($slug === '') {
        continue;
    }

    $hasPublishedArticle = (bool) array_filter(
        $publishedArticles,
        fn($article) => ($article['category_id'] ?? '') === ($category['id'] ?? '')
    );

    if ($hasPublishedArticle) {
        addUrl($urls, '/articles/category/' . rawurlencode($slug), '', 'monthly', '0.6');
    }
}

foreach (($content['tags'] ?? []) as $tag) {
    $slug = (string) ($tag['slug'] ?? '');
    if ($slug === '') {
        continue;
    }

    $taggedArticles = array_filter(
        $publishedArticles,
        fn($article) => is_array($article['tags'] ?? null) && in_array($tag['id'] ?? '', $article['tags'], true)
    );

    if (count($taggedArticles) >= 3) {
        addUrl($urls, '/articles/tag/' . rawurlencode($slug), '', 'monthly', '0.5');
    }
}

foreach ($publishedArticles as $article) {
    $slug = $article['slug'] ?? '';
    if ($slug === '') {
        continue;
    }

    $lastmod = normalizedDate($article['updated_at'] ?? $article['published_at'] ?? $article['date'] ?? null);
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
