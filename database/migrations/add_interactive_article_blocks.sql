-- ============================================================
-- Migration: Interactive Article Blocks Support
-- File: database/migrations/add_interactive_article_blocks.sql
-- Run this ONCE against your production database.
-- ============================================================
-- Safe notes:
--   - ALTER TABLE ... ADD COLUMN will error if column already exists; ignore that error.
--   - CREATE TABLE IF NOT EXISTS is always safe to run.
-- ============================================================

SET NAMES utf8mb4;

-- Step 1: Add article_type column to articles table.
-- Allowed values: standard | interactive | report
-- If you see "Duplicate column name 'article_type'", the column already exists — skip this step.
ALTER TABLE articles
  ADD COLUMN article_type VARCHAR(30) NOT NULL DEFAULT 'standard' AFTER status;

-- Step 2: Create article_blocks table.
CREATE TABLE IF NOT EXISTS article_blocks (
  id           VARCHAR(64)  NOT NULL,
  article_id   VARCHAR(64)  NOT NULL,
  block_type   VARCHAR(50)  NOT NULL,
  block_order  INT          NOT NULL DEFAULT 0,
  block_data   LONGTEXT     NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (id),
  KEY idx_article_blocks_article_id (article_id),
  KEY idx_article_blocks_order      (article_id, block_order),
  KEY idx_article_blocks_type       (block_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
