<?php
function seoValue(array $seo, string $key, string $fallback = ''): string
{
    $value = $seo[$key] ?? $fallback;
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function renderSeo(array $pageSeo = []): void
{
    $defaults = [
        'title' => 'BajoZone | باجو زون',
        'description' => 'منصة متخصصة في اكتشاف وتطوير المواهب الكروية.',
        'canonical' => '',
        'image' => '/assets/images/logo-bajo.png',
        'type' => 'website',
        'robots' => 'index, follow',
        'lang' => 'ar',
        'site_name' => 'BajoZone',
    ];

    $seo = array_merge($defaults, $pageSeo);
    $seo['description'] = buildSeoDescription($seo['description']);
    $locale = $seo['lang'] === 'ar' ? 'ar_AR' : 'en_US';

    echo '<title>' . seoValue($seo, 'title') . "</title>\n";
    echo '  <meta name="description" content="' . seoValue($seo, 'description') . "\">\n";
    echo '  <link rel="canonical" href="' . seoValue($seo, 'canonical') . "\">\n";
    echo '  <meta name="robots" content="' . seoValue($seo, 'robots') . "\">\n";
    echo '  <meta property="og:locale" content="' . $locale . "\">\n";
    echo '  <meta property="og:type" content="' . seoValue($seo, 'type') . "\">\n";
    echo '  <meta property="og:site_name" content="' . seoValue($seo, 'site_name') . "\">\n";
    echo '  <meta property="og:title" content="' . seoValue($seo, 'title') . "\">\n";
    echo '  <meta property="og:description" content="' . seoValue($seo, 'description') . "\">\n";
    echo '  <meta property="og:url" content="' . seoValue($seo, 'canonical') . "\">\n";
    echo '  <meta property="og:image" content="' . seoValue($seo, 'image') . "\">\n";
    echo '  <meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '  <meta name="twitter:title" content="' . seoValue($seo, 'title') . "\">\n";
    echo '  <meta name="twitter:description" content="' . seoValue($seo, 'description') . "\">\n";
    echo '  <meta name="twitter:image" content="' . seoValue($seo, 'image') . "\">\n";
}

function cleanSchemaText(string $value): string
{
    return trim(preg_replace('/\s+/u', ' ', strip_tags($value)));
}

function seoTextLength(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function seoTextSlice(string $value, int $start, ?int $length = null): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($value, $start, $length ?? seoTextLength($value), 'UTF-8');
    }

    return $length === null ? substr($value, $start) : substr($value, $start, $length);
}

function buildSeoDescription(string $value, int $min = 150, int $max = 160): string
{
    $description = cleanSchemaText(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if ($description === '' || seoTextLength($description) <= $max) {
        return $description;
    }

    $suffix = '...';
    $bodyMax = $max - seoTextLength($suffix);
    $candidate = seoTextSlice($description, 0, $bodyMax);
    $lastSpace = max(
        strrpos($candidate, ' ') ?: -1,
        strrpos($candidate, "\t") ?: -1,
        strrpos($candidate, "\n") ?: -1
    );

    if ($lastSpace >= ($min - seoTextLength($suffix))) {
        $candidate = seoTextSlice($candidate, 0, $lastSpace);
    }

    $candidate = rtrim($candidate, " \t\n\r\0\x0B.,،;؛:-ـ");
    return $candidate . $suffix;
}

function schemaDate(?string $date): string
{
    if (!$date) {
        return '';
    }

    $timestamp = strtotime($date);
    if (!$timestamp || $timestamp > time()) {
        return '';
    }

    return gmdate('c', $timestamp);
}

function schemaAbsoluteUrl(string $url): string
{
    $url = trim($url);
    if ($url === '') {
        return 'https://bajozone.com/assets/images/logo-bajo.png';
    }
    if (preg_match('/^https?:\/\//i', $url)) {
        $path = parse_url($url, PHP_URL_PATH) ?: '/';
        $query = parse_url($url, PHP_URL_QUERY);
        return 'https://bajozone.com' . $path . ($query ? '?' . $query : '');
    }

    return 'https://bajozone.com/' . ltrim($url, '/');
}

function schemaExternalUrl(string $url): string
{
    return preg_replace('/^http:\/\//i', 'https://', trim($url));
}

function renderJsonLd(array $schema): void
{
    static $renderedTypes = [];
    $type = is_string($schema['@type'] ?? null) ? $schema['@type'] : '';
    if ($type && isset($renderedTypes[$type])) {
        return;
    }
    if ($type) {
        $renderedTypes[$type] = true;
    }

    echo '  <script type="application/ld+json">' . "\n";
    echo json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_INVALID_UTF8_SUBSTITUTE);
    echo "\n  </script>\n";
}

function renderArticleSchema($article, $pageSeo): void
{
    if (!is_array($article) || !is_array($pageSeo)) {
        return;
    }

    $datePublished = schemaDate($article['date'] ?? null);
    $dateModified = schemaDate($article['updated_at'] ?? $article['updated'] ?? $article['date'] ?? null);

    renderJsonLd([
        '@context' => 'https://schema.org',
        '@type' => 'BlogPosting',
        'headline' => cleanSchemaText($article['title_ar'] ?? $article['title_en'] ?? $pageSeo['title'] ?? 'BajoZone'),
        'description' => buildSeoDescription($pageSeo['description'] ?? ''),
        'image' => schemaAbsoluteUrl($pageSeo['image'] ?? ''),
        'author' => [
            '@type' => 'Person',
            'name' => 'Abdulaziz Bajkhaif',
            'url' => 'https://bajozone.com/author/abdulaziz-bajkhaif',
        ],
        'publisher' => [
            '@type' => 'Organization',
            'name' => 'BajoZone',
            'url' => 'https://bajozone.com',
            'logo' => [
                '@type' => 'ImageObject',
                'url' => 'https://bajozone.com/assets/images/logo-bajo.png',
            ],
        ],
        'datePublished' => $datePublished,
        'dateModified' => $dateModified ?: $datePublished,
        'mainEntityOfPage' => [
            '@type' => 'WebPage',
            '@id' => schemaAbsoluteUrl($pageSeo['canonical'] ?? ''),
        ],
        'inLanguage' => $pageSeo['lang'] ?? 'ar',
        'url' => schemaAbsoluteUrl($pageSeo['canonical'] ?? ''),
    ]);
}

function renderBreadcrumbSchema($items): void
{
    if (!is_array($items) || !$items) {
        return;
    }

    $listItems = [];
    foreach (array_values($items) as $index => $item) {
        if (!is_array($item) || empty($item['name']) || empty($item['url'])) {
            continue;
        }

        $listItems[] = [
            '@type' => 'ListItem',
            'position' => $index + 1,
            'name' => cleanSchemaText((string) $item['name']),
            'item' => schemaAbsoluteUrl((string) $item['url']),
        ];
    }

    if (!$listItems) {
        return;
    }

    renderJsonLd([
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => $listItems,
    ]);
}

function renderWebsiteSchema(): void
{
    renderJsonLd([
        '@context' => 'https://schema.org',
        '@type' => 'WebSite',
        'name' => 'BajoZone',
        'url' => 'https://bajozone.com',
        'inLanguage' => 'ar',
    ]);
}

function renderOrganizationSchema(array $sameAs = []): void
{
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => 'BajoZone',
        'url' => 'https://bajozone.com',
        'logo' => 'https://bajozone.com/assets/images/logo-bajo.png',
    ];

    $sameAs = array_values(array_filter($sameAs, fn($url) => is_string($url) && trim($url) !== ''));
    if ($sameAs) {
        $schema['sameAs'] = array_map('schemaExternalUrl', $sameAs);
    }

    renderJsonLd($schema);
}

function renderPersonSchema(array $sameAs = []): void
{
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Person',
        'name' => 'Abdulaziz Bajkhaif',
        'url' => 'https://bajozone.com/author/abdulaziz-bajkhaif',
        'jobTitle' => 'Sports Science and Football Talent Writer',
        'description' => 'كاتب ومهتم بعلوم الرياضة، اكتشاف المواهب، الكشافة الكروية، وتحليل الأداء.',
        'knowsAbout' => [
            'Sports Science',
            'Football Scouting',
            'Talent Identification',
            'Performance Analysis',
            'Player Care and Protection',
            'Strategic Team Building',
            'Squad Planning',
            'Player Selection',
        ],
        'worksFor' => [
            '@type' => 'Organization',
            'name' => 'BajoZone',
            'url' => 'https://bajozone.com',
        ],
    ];

    $sameAs = array_values(array_filter($sameAs, fn($url) => is_string($url) && trim($url) !== ''));
    if ($sameAs) {
        $schema['sameAs'] = array_map('schemaExternalUrl', $sameAs);
    }

    renderJsonLd($schema);
}
