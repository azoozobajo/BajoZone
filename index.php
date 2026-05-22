<?php
require_once __DIR__ . '/includes/seo.php';

function currentBaseUrl(): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'www.bajozone.com';
    return $scheme . '://' . $host;
}

function absoluteAssetUrl(string $path, string $baseUrl): string
{
    $path = trim($path);
    if ($path === '') {
        $path = 'assets/images/logo-bajo.png';
    }
    if (preg_match('/^https?:\/\//i', $path)) {
        return $path;
    }
    return $baseUrl . '/' . ltrim($path, '/');
}

function seoDescription(string $description, int $limit = 160): string
{
    return buildSeoDescription($description, 150, $limit);
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

$baseUrl = currentBaseUrl();
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = '/' . trim($path, '/');
$path = $path === '/' ? '/' : rtrim($path, '/');

$dbPath = __DIR__ . '/data/db.json';
$db = is_file($dbPath) ? json_decode((string) file_get_contents($dbPath), true) : [];
$settings = $db['settings'] ?? [];
$siteName = $settings['site_name_en'] ?? 'BajoZone';
$logo = absoluteAssetUrl($settings['logo'] ?? 'assets/images/logo-bajo.png', $baseUrl);
$currentArticle = null;
$breadcrumbItems = [];
$homeSameAs = [];
$categoryPage = null;
$tagPage = null;

foreach (($settings['social'] ?? []) as $social) {
    if (($social['visible'] ?? false) !== true || empty($social['value'])) {
        continue;
    }
    if (preg_match('/^https?:\/\//i', (string) $social['value'])) {
        $homeSameAs[] = (string) $social['value'];
    }
}

$pageSeo = [
    'title' => 'BajoZone | باجو زون',
    'description' => 'منصة متخصصة في اكتشاف وتطوير المواهب الكروية، وتقديم محتوى معرفي في كرة القدم وعلوم الرياضة.',
    'canonical' => $baseUrl . '/',
    'image' => $logo,
    'type' => 'website',
    'robots' => 'index, follow',
    'lang' => 'ar',
    'site_name' => $siteName,
];

if ($path === '/articles' || $path === '/programs') {
    $pageSeo = array_merge($pageSeo, [
        'title' => 'المقالات والبرامج | BajoZone',
        'description' => 'اقرأ أحدث مقالات وبرامج باجو زون في اكتشاف المواهب، تطوير اللاعبين، التحليل، وعلوم كرة القدم.',
        'canonical' => $baseUrl . '/articles',
        'image' => $logo,
    ]);
} elseif ($path === '/about') {
    $pageSeo = array_merge($pageSeo, [
        'title' => 'عن BajoZone | اكتشاف المواهب وتحليل كرة القدم',
        'description' => 'تعرف على BajoZone: مساحة معرفية وتحليلية في اكتشاف المواهب، الكشافة الكروية، تطوير الناشئين، تحليل الأداء، التقنية والمسارات الرياضية.',
        'canonical' => $baseUrl . '/about',
        'image' => absoluteAssetUrl('images/about/about-bg.png', $baseUrl),
        'robots' => 'index, follow',
    ]);
} elseif ($path === '/author/abdulaziz-bajkhaif') {
    $pageSeo = array_merge($pageSeo, [
        'title' => 'Abdulaziz Bajkhaif | كاتب BajoZone',
        'description' => 'صفحة الكاتب Abdulaziz Bajkhaif، متخصص في علوم الرياضة، الكشافة الكروية، اكتشاف المواهب، وتحليل الأداء في BajoZone.',
        'canonical' => $baseUrl . '/author/abdulaziz-bajkhaif',
        'image' => $logo,
        'robots' => 'index, follow',
    ]);
} elseif (preg_match('#^/articles/category/([^/]+)$#', $path, $matches)) {
    $categoryKey = urldecode($matches[1]);
    foreach (($db['categories'] ?? []) as $category) {
        if (categorySlug($category) === $categoryKey) {
            $categoryPage = $category;
            break;
        }
    }

    if ($categoryPage) {
        $categoryArticles = array_filter(($db['articles'] ?? []), function ($article) use ($categoryPage) {
            return ($article['is_published'] ?? true) !== false && ($article['category_id'] ?? '') === ($categoryPage['id'] ?? '');
        });
        if ($categoryArticles) {
            $categoryName = $categoryPage['name_ar'] ?? $categoryPage['name_en'] ?? 'تصنيف المقالات';
            $categoryDescription = $categoryPage['description'] ?? $categoryPage['description_ar'] ?? $categoryPage['description_en'] ?? ('مقالات BajoZone ضمن تصنيف ' . $categoryName . '، مع قراءات معرفية وتحليلية في كرة القدم وتطوير المواهب.');
            $pageSeo = array_merge($pageSeo, [
                'title' => $categoryName . ' | مقالات BajoZone',
                'description' => $categoryDescription,
                'canonical' => $baseUrl . '/articles/category/' . rawurlencode($categoryKey),
                'image' => $logo,
                'robots' => 'index, follow',
            ]);
            $breadcrumbItems = [
                ['name' => 'الرئيسية', 'url' => 'https://bajozone.com/'],
                ['name' => 'المقالات', 'url' => 'https://bajozone.com/articles'],
                ['name' => $categoryName, 'url' => 'https://bajozone.com/articles/category/' . rawurlencode($categoryKey)],
            ];
        } else {
            $categoryPage = null;
        }
    }
} elseif (preg_match('#^/articles/tag/([^/]+)$#', $path, $matches)) {
    $tagKey = urldecode($matches[1]);
    foreach (($db['tags'] ?? []) as $tag) {
        if (tagSlug($tag) === $tagKey) {
            $tagPage = $tag;
            break;
        }
    }

    if ($tagPage) {
        $tagArticles = array_filter(($db['articles'] ?? []), function ($article) use ($tagPage) {
            return ($article['is_published'] ?? true) !== false
                && is_array($article['tags'] ?? null)
                && in_array($tagPage['id'] ?? '', $article['tags'], true);
        });
        if ($tagArticles) {
            $tagName = $tagPage['name'] ?? 'وسم المقالات';
            $robots = count($tagArticles) >= 3 ? 'index, follow' : 'noindex, follow';
            $tagDescription = 'مقالات BajoZone المرتبطة بوسم ' . $tagName . ' ضمن محتوى كرة القدم وتطوير المواهب.';
            $pageSeo = array_merge($pageSeo, [
                'title' => $tagName . ' | BajoZone',
                'description' => $tagDescription,
                'canonical' => $baseUrl . '/articles/tag/' . rawurlencode($tagKey),
                'image' => $logo,
                'robots' => $robots,
            ]);
            $breadcrumbItems = [
                ['name' => 'الرئيسية', 'url' => 'https://bajozone.com/'],
                ['name' => 'المقالات', 'url' => 'https://bajozone.com/articles'],
                ['name' => $tagName, 'url' => 'https://bajozone.com/articles/tag/' . rawurlencode($tagKey)],
            ];
        } else {
            $tagPage = null;
        }
    }
} elseif (preg_match('#^/article/([^/]+)$#', $path, $matches)) {
    $articleKey = urldecode($matches[1]);
    $article = null;
    foreach (($db['articles'] ?? []) as $item) {
        if (($item['id'] ?? '') === $articleKey || ($item['slug'] ?? '') === $articleKey) {
            $article = $item;
            break;
        }
    }

    if ($article && ($article['is_published'] ?? true) !== false) {
        $currentArticle = $article;
        $title = $article['title_ar'] ?? $article['title_en'] ?? 'مقال BajoZone';
        $description = $article['excerpt_ar'] ?? $article['excerpt_en'] ?? $article['content_ar'] ?? $article['content_en'] ?? $pageSeo['description'];
        $canonicalKey = $article['slug'] ?? $article['id'] ?? $articleKey;
        $articleImage = $article['featured_image'] ?? $article['image'] ?? '';
        $pageSeo = array_merge($pageSeo, [
            'title' => $title . ' | BajoZone',
            'description' => seoDescription($description),
            'canonical' => $baseUrl . '/article/' . rawurlencode($canonicalKey),
            'image' => absoluteAssetUrl($articleImage ?: 'assets/images/story/research-desk.png', $baseUrl),
            'type' => 'article',
        ]);
        $breadcrumbItems = [
            ['name' => 'الرئيسية', 'url' => 'https://bajozone.com/'],
            ['name' => 'المقالات', 'url' => 'https://bajozone.com/articles'],
            ['name' => $title, 'url' => 'https://bajozone.com/article/' . rawurlencode($canonicalKey)],
        ];
    }
}
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($pageSeo['lang'], ENT_QUOTES, 'UTF-8'); ?>" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php renderSeo($pageSeo); ?>
  <?php
  if ($path === '/') {
      renderWebsiteSchema();
      renderOrganizationSchema($homeSameAs);
  } elseif ($path === '/author/abdulaziz-bajkhaif') {
      renderPersonSchema($homeSameAs);
  } elseif ($categoryPage) {
      renderBreadcrumbSchema($breadcrumbItems);
  } elseif ($tagPage) {
      renderBreadcrumbSchema($breadcrumbItems);
  } elseif ($currentArticle) {
      renderArticleSchema($currentArticle, $pageSeo);
      renderBreadcrumbSchema($breadcrumbItems);
  }
  ?>
  <meta name="theme-color" content="#0a0a0a">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Tajawal:wght@300;400;500;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="icon" type="image/png" href="/assets/images/logo-bajo.png">
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script defer src="/js/supabase-config.js"></script>
  <script defer src="/js/supabase-adapter.js"></script>
  <script defer src="/js/app.js"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-4XCSKY8ECD"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-4XCSKY8ECD');
  </script>
  <style>
    #boot-loader { position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;z-index:9000;transition:opacity .5s ease; }
    #boot-loader.fade { opacity:0;pointer-events:none; }
    .boot-logo { height:52px;filter:invert(1);animation:pl 1.8s ease-in-out infinite; }
    .boot-bar { width:120px;height:1px;background:rgba(255,255,255,.1);position:relative;overflow:hidden; }
    .boot-bar::after { content:'';position:absolute;inset-block:0;inset-inline-start:0;width:40%;background:#c8a86e;animation:bs 1.2s ease-in-out infinite; }
    @keyframes pl { 0%,100%{opacity:.5} 50%{opacity:1} }
    @keyframes bs { 0%{inset-inline-start:-40%} 100%{inset-inline-start:100%} }
  </style>
</head>
<body>
  <div id="boot-loader">
    <img class="boot-logo" src="/assets/images/logo-bajo.png" alt="BajoZone" onerror="this.style.display='none'">
    <div class="boot-bar"></div>
  </div>

  <nav class="nav" id="main-nav">
    <div class="nav-brand" onclick="Router&&Router.go('/')">
      <img id="nav-logo" src="/assets/images/logo-bajo.png" alt="BajoZone" onerror="this.style.display='none'">
      <span class="nav-brand-name" id="nav-brand-name">BajoZone</span>
    </div>
    <ul class="nav-links" id="nav-links"></ul>
    <div class="nav-right">
      <button class="lang-btn" id="lang-btn">EN</button>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-nav" id="mobile-nav">
    <ul id="mobile-links"></ul>
  </div>

  <main id="app"></main>
  <div id="site-footer"></div>

</body>
</html>
