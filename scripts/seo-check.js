const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  schema: path.join(root, 'database', 'schema.sql'),
  repository: path.join(root, 'includes', 'content-repository.php'),
  db: path.join(root, 'includes', 'db.php'),
  config: path.join(root, 'includes', 'config.php'),
  auth: path.join(root, 'includes', 'auth.php'),
  index: path.join(root, 'index.php'),
  sitemap: path.join(root, 'sitemap.php'),
  app: path.join(root, 'js', 'app.js'),
  admin: path.join(root, 'admin', 'index.html'),
  authApi: path.join(root, 'api', 'auth.php'),
  adminContentApi: path.join(root, 'api', 'admin-content.php'),
  saveApi: path.join(root, 'api', 'save.php'),
  uploadApi: path.join(root, 'api', 'upload.php'),
  importScript: path.join(root, 'scripts', 'import-json-to-mysql.php'),
  createAdminScript: path.join(root, 'scripts', 'create-admin.php'),
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function fail(message) {
  console.error(`SEO/MySQL check failed: ${message}`);
  process.exitCode = 1;
}

for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${name} (${file})`);
}

const schema = read(files.schema);
const repository = read(files.repository);
const db = read(files.db);
const config = read(files.config);
const auth = read(files.auth);
const index = read(files.index);
const sitemap = read(files.sitemap);
const app = read(files.app);
const admin = read(files.admin);
const authApi = read(files.authApi);
const adminContentApi = read(files.adminContentApi);
const saveApi = read(files.saveApi);
const uploadApi = read(files.uploadApi);

for (const table of ['categories', 'tags', 'articles', 'article_tags', 'programs', 'admin_users', 'site_settings']) {
  if (!new RegExp(`CREATE TABLE\\s+${table}\\b`, 'i').test(schema)) {
    fail(`schema.sql missing ${table} table.`);
  }
}

for (const needle of [
  'UNIQUE KEY uq_articles_slug',
  'UNIQUE KEY uq_categories_slug',
  'UNIQUE KEY uq_tags_slug',
  'UNIQUE KEY uq_programs_slug',
  'KEY idx_articles_status',
  'KEY idx_articles_category_id',
  'KEY idx_article_tags_article_id',
  'KEY idx_article_tags_tag_id',
]) {
  if (!schema.includes(needle)) fail(`schema.sql missing index: ${needle}`);
}

for (const fn of [
  'getPublishedArticles',
  'getPublishedArticleBySlug',
  'getPublishedPrograms',
  'getPublishedProgramBySlug',
  'getCategoriesWithPublishedArticles',
  'getCategoryBySlug',
  'getPublishedArticlesByCategorySlug',
  'getTagsWithPublishedArticles',
  'getTagBySlug',
  'getPublishedArticlesByTagSlug',
  'getRelatedArticles',
]) {
  if (!repository.includes(`function ${fn}`)) fail(`content repository missing ${fn}().`);
}

if (!db.includes('new PDO(') || !db.includes('PDO::ATTR_ERRMODE') || !db.includes('function getDb()')) {
  fail('includes/db.php does not expose reusable PDO getDb().');
}

if (!config.includes('DB_HOST') || !config.includes('your_database_name')) {
  fail('includes/config.php should contain placeholder DB constants only.');
}

if (!config.includes('APP_KEY') || !config.includes('ADMIN_SESSION_TTL')) {
  fail('includes/config.php missing admin auth constants.');
}

if (!auth.includes('hash_hmac') || !auth.includes('requireAdminAuth')) {
  fail('includes/auth.php does not implement signed admin tokens.');
}

if (!repository.includes("status = 'published'")) {
  fail('Repository queries do not explicitly filter published content.');
}

if (!index.includes("require_once __DIR__ . '/includes/content-repository.php'")) {
  fail('index.php does not load content-repository.php.');
}

if (index.includes('/data/db.json')) {
  fail('index.php still references data/db.json directly.');
}

if (!sitemap.includes("require_once __DIR__ . '/includes/content-repository.php'")) {
  fail('sitemap.php does not load content-repository.php.');
}

if (sitemap.includes('/data/db.json')) {
  fail('sitemap.php still references data/db.json directly.');
}

if (!sitemap.includes('count($taggedArticles) >= 3')) {
  fail('sitemap.php does not enforce the 3 published article rule for tag pages.');
}

if (!app.includes("/api/content.php")) {
  fail('js/app.js does not load content from the MySQL content API.');
}

if (!admin.includes("../api/auth.php") || !admin.includes("../api/admin-content.php") || !admin.includes("saveMySqlNow")) {
  fail('Admin panel is not wired to MySQL auth/admin content/save APIs.');
}

if (!authApi.includes('password_verify') || !authApi.includes('createAdminToken')) {
  fail('api/auth.php does not authenticate admin_users.');
}

if (!adminContentApi.includes('requireAdminAuth') || !adminContentApi.includes('getAdminContentSnapshot')) {
  fail('api/admin-content.php does not protect admin content reads.');
}

if (!saveApi.includes('requireAdminAuth') || !saveApi.includes('deleteMissingRows')) {
  fail('api/save.php does not protect MySQL writes or delete removed content.');
}

if (!uploadApi.includes('requireAdminAuth')) {
  fail('api/upload.php does not protect uploads with admin auth.');
}

if (!app.includes('Do not use data/db.json in production') || !repository.includes('Do not use data/db.json in production')) {
  fail('Development JSON fallback warning is missing.');
}

for (const source of [index, app, admin]) {
  if (/Supabase|BajoSupabase|supabase/i.test(source)) {
    fail('Production-facing source still references Supabase.');
  }
}

if (!process.exitCode) {
  console.log('SEO/MySQL check passed: schema, repository, sitemap, index, and content API wiring look ready.');
}
