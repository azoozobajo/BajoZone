# BajoZone Production Setup

This version is prepared for PHP + MySQL hosting on cPanel/GoDaddy.

## Server Requirements

- PHP 8.0+ with PDO MySQL enabled
- MySQL or MariaDB
- Apache with `.htaccess` support
- Writable `assets/images/` directory for admin uploads

## MySQL Setup

1. Create a MySQL database and database user in cPanel.
2. Give the user privileges for the database.
3. Import `database/schema.sql` in phpMyAdmin.
4. Edit `includes/config.php` with the real database credentials:

```php
const DB_HOST = 'localhost';
const DB_NAME = 'your_cpanel_database_name';
const DB_USER = 'your_cpanel_database_user';
const DB_PASS = 'your_database_password';
```

5. Replace `APP_KEY` in `includes/config.php` with a long random secret.

## Admin User

Create the first admin user from the server shell:

```bash
php scripts/create-admin.php admin@bajozone.com "StrongPassword123!" "BajoZone Admin"
```

If shell access is not available, create a hashed password locally and insert it into `admin_users` through phpMyAdmin.

## Content Storage

Production content is stored in MySQL:

- `articles`
- `categories`
- `tags`
- `article_tags`
- `programs`
- `books`
- `resources`
- `site_settings`
- `admin_users`

`data/db.json` is a local-development fallback only and should not be used in production.

## Deployment

The `.cpanel.yml` deployment excludes development-only files such as `.git`, `.vercel`, logs, Supabase files, and `data/db.json`.

After deployment, verify:

- `/`
- `/articles`
- `/article/{slug}`
- `/articles/category/{slug}`
- `/articles/tag/{slug}`
- `/programs`
- `/about`
- `/author/abdulaziz-bajkhaif`
- `/sitemap.xml`
- `/robots.txt`
- `/admin/`

## Checks

Run before uploading:

```bash
npm run build
node --check js/app.js
node scripts/seo-check.js
```
