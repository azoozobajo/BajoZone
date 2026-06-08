CREATE TABLE categories (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  data_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tags (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  data_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT NULL,
  content LONGTEXT NULL,
  featured_image VARCHAR(1024) NULL,
  category_id VARCHAR(64) NULL,
  program_id VARCHAR(64) NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  read_time INT UNSIGNED NULL,
  youtube_url VARCHAR(1024) NULL,
  video_url VARCHAR(1024) NULL,
  sources_json LONGTEXT NULL,
  data_json LONGTEXT NULL,
  status ENUM('draft', 'published', 'private') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_articles_slug (slug),
  KEY idx_articles_status (status),
  KEY idx_articles_category_id (category_id),
  KEY idx_articles_program_id (program_id),
  KEY idx_articles_is_featured (is_featured),
  CONSTRAINT fk_articles_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE article_tags (
  article_id VARCHAR(64) NOT NULL,
  tag_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  KEY idx_article_tags_article_id (article_id),
  KEY idx_article_tags_tag_id (tag_id),
  CONSTRAINT fk_article_tags_article
    FOREIGN KEY (article_id) REFERENCES articles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_article_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE programs (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  content LONGTEXT NULL,
  image VARCHAR(1024) NULL,
  short_description TEXT NULL,
  accent_color VARCHAR(32) NULL,
  sort_order INT NOT NULL DEFAULT 99,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  cover_image VARCHAR(1024) NULL,
  data_json LONGTEXT NULL,
  status ENUM('draft', 'published', 'private') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_programs_slug (slug),
  KEY idx_programs_status (status),
  KEY idx_programs_sort_order (sort_order),
  KEY idx_programs_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE books (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  subtitle TEXT NULL,
  description TEXT NULL,
  cover VARCHAR(1024) NULL,
  external_url VARCHAR(1024) NULL,
  amazon_url VARCHAR(1024) NULL,
  price VARCHAR(100) NULL,
  available TINYINT(1) NOT NULL DEFAULT 1,
  has_landing TINYINT(1) NOT NULL DEFAULT 0,
  landing_route VARCHAR(255) NULL,
  data_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_books_slug (slug),
  KEY idx_books_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resources (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  type VARCHAR(100) NULL,
  short_description TEXT NULL,
  full_description LONGTEXT NULL,
  language VARCHAR(32) NULL,
  author_or_org VARCHAR(255) NULL,
  publisher VARCHAR(255) NULL,
  publication_year INT NULL,
  cover_image VARCHAR(1024) NULL,
  source_url VARCHAR(1024) NULL,
  download_url VARCHAR(1024) NULL,
  access_type VARCHAR(100) NULL,
  rights VARCHAR(100) NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('draft', 'published', 'private') NOT NULL DEFAULT 'published',
  data_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_resources_slug (slug),
  KEY idx_resources_status (status),
  KEY idx_resources_type (type),
  KEY idx_resources_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_users (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_settings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(191) NOT NULL,
  setting_value LONGTEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Interactive Articles (added via migration: database/migrations/add_interactive_article_blocks.sql) ──
-- Run that migration file to add article_type column to articles table and create article_blocks table.
--
-- article_type column added to articles:
--   article_type VARCHAR(30) NOT NULL DEFAULT 'standard'   -- values: standard | interactive | report
--
-- New table: article_blocks
CREATE TABLE IF NOT EXISTS article_blocks (
  id           VARCHAR(64)  NOT NULL,
  article_id   VARCHAR(64)  NOT NULL,
  block_type   VARCHAR(50)  NOT NULL,               -- stat_cards | chart | timeline | insight_cards | comparison_table | method_note | source_box | accordion
  block_order  INT          NOT NULL DEFAULT 0,
  block_data   LONGTEXT     NOT NULL,               -- JSON object, sanitized server-side
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  KEY idx_article_blocks_article_id (article_id),
  KEY idx_article_blocks_order      (article_id, block_order),
  KEY idx_article_blocks_type       (block_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
