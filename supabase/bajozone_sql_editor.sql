-- BajoZone Supabase schema
-- انسخ هذا الملف كامل داخل Supabase SQL Editor ثم اضغط Run.
-- الهدف: تجهيز قاعدة بيانات للمقالات، البرامج، المكتبة، الكتب، الإعدادات، والصور/الملفات.

create extension if not exists pgcrypto;

-- =========================
-- Helpers
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- Core content tables
-- =========================

create table if not exists public.site_settings (
  id text primary key default 'main',
  site_name_ar text default '',
  site_name_en text default '',
  tagline_ar text default '',
  tagline_en text default '',
  about_ar text default '',
  about_en text default '',
  about_image text default '',
  logo text default '',
  favicon text default '',
  ticker_ar text default '',
  ticker_en text default '',
  about_content_ar text default '',
  about_content_en text default '',
  social jsonb not null default '{}'::jsonb,
  about_gallery jsonb not null default '[]'::jsonb,
  popup jsonb not null default '{}'::jsonb,
  new_article_bar jsonb not null default '{"enabled": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 'main')
);

create table if not exists public.programs (
  id text primary key,
  slug text not null unique,
  name_ar text not null default '',
  name_en text not null default '',
  short_description_ar text default '',
  short_description_en text default '',
  description_ar text default '',
  description_en text default '',
  logo_url text default '',
  cover_image text not null default '',
  accent_color text default '#c8a86e',
  sort_order integer not null default 100,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name_ar text not null default '',
  name_en text not null default '',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id text primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key,
  slug text not null unique,
  title_ar text not null default '',
  title_en text not null default '',
  excerpt_ar text default '',
  excerpt_en text default '',
  content_ar text default '',
  content_en text default '',
  image text default '',
  date date default current_date,
  category_id text references public.categories(id) on delete set null,
  category_ar text default '',
  category_en text default '',
  program_id text references public.programs(id) on delete set null,
  tag_ids text[] not null default '{}'::text[],
  featured boolean not null default false,
  is_new boolean not null default false,
  is_published boolean not null default true,
  reading_time integer,
  level text default 'intermediate',
  sources jsonb not null default '[]'::jsonb,
  youtube_url text default '',
  video_url text default '',
  view_count bigint not null default 0,
  share_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id text primary key,
  title_ar text not null default '',
  title_en text not null default '',
  subtitle_ar text default '',
  subtitle_en text default '',
  description_ar text default '',
  description_en text default '',
  cover text default '',
  amazon_url text default '',
  price text default '',
  available boolean not null default true,
  download_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id text primary key,
  slug text not null unique,
  type text not null default 'document',
  document_subtype text default '',
  title_ar text not null default '',
  title_en text not null default '',
  short_description_ar text default '',
  short_description_en text default '',
  full_description_ar text default '',
  full_description_en text default '',
  bajo_summary_ar text default '',
  why_it_matters_ar text default '',
  target_audience text default '',
  field text default '',
  language text default '',
  author_or_org text default '',
  publisher text default '',
  publication_year integer,
  pages integer,
  file_size text default '',
  cover_image text default '',
  source_url text default '',
  download_url text default '',
  access_type text default 'free',
  rights text default '',
  tags text[] not null default '{}'::text[],
  is_featured boolean not null default false,
  is_published boolean not null default true,
  download_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional media registry for images/files uploaded to Supabase Storage.
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'bajozone-media',
  path text not null,
  public_url text not null,
  file_name text default '',
  mime_type text default '',
  size_bytes bigint,
  alt_ar text default '',
  alt_en text default '',
  used_for text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bucket, path)
);

-- =========================
-- Indexes
-- =========================

create index if not exists idx_articles_program_id on public.articles(program_id);
create index if not exists idx_articles_category_id on public.articles(category_id);
create index if not exists idx_articles_date on public.articles(date desc);
create index if not exists idx_articles_published on public.articles(is_published);
create index if not exists idx_articles_tags on public.articles using gin(tag_ids);
create index if not exists idx_resources_published on public.resources(is_published);
create index if not exists idx_resources_type on public.resources(type);
create index if not exists idx_resources_tags on public.resources using gin(tags);

-- =========================
-- updated_at triggers
-- =========================

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_programs_updated_at on public.programs;
create trigger trg_programs_updated_at
before update on public.programs
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_tags_updated_at on public.tags;
create trigger trg_tags_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists trg_books_updated_at on public.books;
create trigger trg_books_updated_at
before update on public.books
for each row execute function public.set_updated_at();

drop trigger if exists trg_resources_updated_at on public.resources;
create trigger trg_resources_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

drop trigger if exists trg_media_assets_updated_at on public.media_assets;
create trigger trg_media_assets_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

-- =========================
-- Storage bucket
-- =========================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bajozone-media',
  'bajozone-media',
  true,
  52428800,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/pdf',
    'video/mp4'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =========================
-- Row Level Security
-- Public visitors can read published/active content.
-- Authenticated admin users can manage content from the dashboard.
-- =========================

alter table public.site_settings enable row level security;
alter table public.programs enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.books enable row level security;
alter table public.resources enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select
using (true);

drop policy if exists "Authenticated can manage site settings" on public.site_settings;
create policy "Authenticated can manage site settings"
on public.site_settings for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read active programs" on public.programs;
create policy "Public can read active programs"
on public.programs for select
using (is_active = true);

drop policy if exists "Authenticated can manage programs" on public.programs;
create policy "Authenticated can manage programs"
on public.programs for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories for select
using (true);

drop policy if exists "Authenticated can manage categories" on public.categories;
create policy "Authenticated can manage categories"
on public.categories for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read tags" on public.tags;
create policy "Public can read tags"
on public.tags for select
using (true);

drop policy if exists "Authenticated can manage tags" on public.tags;
create policy "Authenticated can manage tags"
on public.tags for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
on public.articles for select
using (is_published = true);

drop policy if exists "Authenticated can manage articles" on public.articles;
create policy "Authenticated can manage articles"
on public.articles for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read available books" on public.books;
create policy "Public can read available books"
on public.books for select
using (available = true);

drop policy if exists "Authenticated can manage books" on public.books;
create policy "Authenticated can manage books"
on public.books for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read published resources" on public.resources;
create policy "Public can read published resources"
on public.resources for select
using (is_published = true);

drop policy if exists "Authenticated can manage resources" on public.resources;
create policy "Authenticated can manage resources"
on public.resources for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read media assets" on public.media_assets;
create policy "Public can read media assets"
on public.media_assets for select
using (true);

drop policy if exists "Authenticated can manage media assets" on public.media_assets;
create policy "Authenticated can manage media assets"
on public.media_assets for all
to authenticated
using (true)
with check (true);

-- Storage object policies
drop policy if exists "Public can read BajoZone media" on storage.objects;
create policy "Public can read BajoZone media"
on storage.objects for select
using (bucket_id = 'bajozone-media');

drop policy if exists "Authenticated can upload BajoZone media" on storage.objects;
create policy "Authenticated can upload BajoZone media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'bajozone-media');

drop policy if exists "Authenticated can update BajoZone media" on storage.objects;
create policy "Authenticated can update BajoZone media"
on storage.objects for update
to authenticated
using (bucket_id = 'bajozone-media')
with check (bucket_id = 'bajozone-media');

drop policy if exists "Authenticated can delete BajoZone media" on storage.objects;
create policy "Authenticated can delete BajoZone media"
on storage.objects for delete
to authenticated
using (bucket_id = 'bajozone-media');

-- =========================
-- Seed singleton settings row
-- =========================

insert into public.site_settings (id, site_name_ar, site_name_en)
values ('main', 'باجو زون', 'BajoZone')
on conflict (id) do nothing;
