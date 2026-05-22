const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dbPath = path.join(root, 'data', 'db.json');
const sitemapPath = path.join(root, 'sitemap.php');
const appPath = path.join(root, 'js', 'app.js');

function fail(message, details = '') {
  console.error(`SEO check failed: ${message}`);
  if (details) console.error(details);
  process.exitCode = 1;
}

function cleanText(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const sitemapSource = fs.readFileSync(sitemapPath, 'utf8');
const appSource = fs.readFileSync(appPath, 'utf8');
const articles = Array.isArray(db.articles) ? db.articles : [];
const published = articles.filter(article => article.is_published !== false);
const categories = Array.isArray(db.categories) ? db.categories : [];
const tags = Array.isArray(db.tags) ? db.tags : [];
const seenSlugs = new Set();

function categorySlug(category) {
  const source = category.slug || category.name_en || category.id || '';
  return String(source).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function tagSlug(tag) {
  const source = tag.slug || tag.name || tag.id || '';
  return String(source).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function countPublishedByTag(tag) {
  return published.filter(article => Array.isArray(article.tags) && article.tags.includes(tag.id)).length;
}

const categoryById = new Map(categories.map(category => [category.id, category]));
const tagById = new Map(tags.map(tag => [tag.id, tag]));

for (const article of published) {
  const slug = cleanText(article.slug || '');
  const title = cleanText(article.title_ar || article.title_en || '');
  const descriptionSource = cleanText(article.excerpt_ar || article.excerpt_en || article.content_ar || article.content_en || '');
  const category = categoryById.get(article.category_id);

  if (!slug) fail(`Published article is missing slug: ${article.id || '(missing id)'}`);
  if (!title) fail(`Published article is missing title: ${slug || article.id || '(missing id)'}`);
  if (!descriptionSource) fail(`Published article cannot generate description: ${slug || article.id || '(missing id)'}`);
  if (!category || !categorySlug(category)) fail(`Published article is missing category slug: ${slug || article.id || '(missing id)'}`);

  if (slug) {
    if (seenSlugs.has(slug)) fail(`Duplicate article slug: ${slug}`);
    seenSlugs.add(slug);
  }

  if (Array.isArray(article.tags)) {
    for (const tagId of article.tags) {
      const tag = tagById.get(tagId);
      if (!tag) fail(`Published article references missing tag: ${slug || article.id || '(missing id)'} -> ${tagId}`);
      if (tag && (!cleanText(tag.name || '') || !tagSlug(tag))) {
        fail(`Referenced tag is missing name or slug: ${tag.id || tagId}`);
      }
    }
  }
}

const seenCategorySlugs = new Map();
for (const category of categories) {
  const slug = categorySlug(category);
  if (!slug) continue;
  if (seenCategorySlugs.has(slug) && seenCategorySlugs.get(slug) !== category.id) {
    fail(`Duplicate category slug: ${slug}`);
  }
  seenCategorySlugs.set(slug, category.id);
}

const seenTagSlugs = new Map();
for (const tag of tags) {
  const slug = tagSlug(tag);
  if (!slug) continue;
  if (seenTagSlugs.has(slug) && seenTagSlugs.get(slug) !== tag.id) {
    fail(`Duplicate tag slug: ${slug}`);
  }
  seenTagSlugs.set(slug, tag.id);
}

if (!sitemapSource.includes("($article['is_published'] ?? true) === false")) {
  fail('sitemap.php does not explicitly skip unpublished articles.');
}

if (!sitemapSource.includes("'/article/'")) {
  fail('sitemap.php does not use /article/slug article URLs.');
}

if (!sitemapSource.includes("'/about'")) {
  fail('sitemap.php does not include /about.');
}

if (!sitemapSource.includes("'/author/abdulaziz-bajkhaif'")) {
  fail('sitemap.php does not include /author/abdulaziz-bajkhaif.');
}

if (sitemapSource.includes("'/articles/'") || sitemapSource.includes('"/articles/"')) {
  fail('sitemap.php appears to mix /articles/slug with /article/slug.');
}

const routedCategorySlugs = categories
  .map(category => ({
    category,
    slug: categorySlug(category),
    count: published.filter(article => article.category_id === category.id).length
  }))
  .filter(item => item.slug && item.count > 0);

if (routedCategorySlugs.length && !appSource.includes("function renderArticleCategory")) {
  fail('Category data exists, but js/app.js has no renderArticleCategory route.');
}

if (routedCategorySlugs.length && !sitemapSource.includes("'/articles/category/'")) {
  fail('sitemap.php does not include category URL generation.');
}

const emptyCategorySlugs = categories
  .map(category => ({ slug: categorySlug(category), count: published.filter(article => article.category_id === category.id).length }))
  .filter(item => item.slug && item.count === 0);

if (emptyCategorySlugs.length && !sitemapSource.includes('$hasPublishedArticle')) {
  fail('sitemap.php may include category pages without published articles.');
}

if (appSource.includes("renderArticleCategory") && !appSource.includes("Router.reg('/articles',param => renderArticles(param))")) {
  fail('Category page exists, but /articles route is not registered.');
}

if (!appSource.includes('href="${href}"') || !appSource.includes('`/article/${a.slug || a.id}`')) {
  fail('Article cards do not appear to output crawlable /article/slug anchors.');
}

if (!appSource.includes('/articles/category/${catSlug}')) {
  fail('Article page does not appear to link to its category route.');
}

if (!appSource.includes("function renderArticleTag")) {
  fail('Tag data exists, but js/app.js has no renderArticleTag route.');
}

if (!appSource.includes('/articles/tag/${slug}')) {
  fail('Article page does not appear to link tags to /articles/tag/slug routes.');
}

if (!sitemapSource.includes("'/articles/tag/'")) {
  fail('sitemap.php does not include tag URL generation.');
}

if (!sitemapSource.includes('count($taggedArticles) >= 3')) {
  fail('sitemap.php does not enforce the 3 published articles rule for tag pages.');
}

const lowCountTags = tags
  .map(tag => ({ slug: tagSlug(tag), count: countPublishedByTag(tag) }))
  .filter(item => item.slug && item.count > 0 && item.count < 3);

if (lowCountTags.length && !appSource.includes("articles.length >= 3 ? 'index, follow' : 'noindex, follow'")) {
  fail('Tag pages do not appear to set noindex for tags with fewer than 3 published articles.');
}

if (!appSource.includes('pubArts().filter(a => a.category_id === category.id)')) {
  fail('Category pages do not appear to filter only published articles.');
}

if (!appSource.includes('pubArts().filter(a => Array.isArray(a.tags) && a.tags.includes(tag.id))')) {
  fail('Tag pages do not appear to filter only published articles.');
}

const draftSlugs = articles
  .filter(article => article.is_published === false)
  .map(article => article.slug)
  .filter(Boolean);

for (const slug of draftSlugs) {
  if (sitemapSource.includes(slug)) {
    fail(`Draft article slug appears in sitemap source: ${slug}`);
  }
}

if (!process.exitCode) {
  const sitemapCategories = routedCategorySlugs.length;
  const sitemapTags = tags.filter(tag => tagSlug(tag) && countPublishedByTag(tag) >= 3).length;
  console.log(`SEO check passed: ${published.length} published articles, ${seenSlugs.size} unique slugs, ${sitemapCategories} category sitemap pages, ${sitemapTags} tag sitemap pages.`);
}
