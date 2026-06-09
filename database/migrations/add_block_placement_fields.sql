-- ============================================================
-- Migration: Add block placement fields to article_blocks
-- File: database/migrations/add_block_placement_fields.sql
-- Run ONCE, after add_interactive_article_blocks.sql.
-- ============================================================
-- Safe notes:
--   - If you see "Duplicate column name", the column already exists — skip that line.
--   - Re-running on an already-migrated DB will error on the ALTER; that is safe to ignore.
-- ============================================================

SET NAMES utf8mb4;

-- Step 1: Add placement columns to article_blocks.
--   block_key      — slug used in {{bz_block:key}} shortcodes; unique per article
--   admin_label    — internal human-readable name shown only in admin
--   placement_mode — auto | shortcode | hidden
ALTER TABLE article_blocks
  ADD COLUMN block_key      VARCHAR(100) NULL                   AFTER block_data,
  ADD COLUMN admin_label    VARCHAR(255) NULL                   AFTER block_key,
  ADD COLUMN placement_mode VARCHAR(30)  NOT NULL DEFAULT 'auto' AFTER admin_label;

-- Step 2: Unique index so the same key cannot be reused in the same article.
-- Ignore error if the index already exists.
CREATE UNIQUE INDEX uq_article_blocks_key ON article_blocks (article_id, block_key);
