'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(root, 'data', 'db.json'), 'utf8'));

function q(value, type) {
  if (value === undefined || value === null) return 'null';
  if (type === 'bool') return value ? 'true' : 'false';
  if (type === 'int') return Number.isFinite(Number(value)) && value !== '' ? String(Number(value)) : 'null';
  if (type === 'json') return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  if (type === 'text_array') {
    const arr = Array.isArray(value) ? value : [];
    return `array[${arr.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',')}]::text[]`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function insert(table, cols, rows) {
  if (!rows.length) return '';
  const values = rows.map(row => {
    const line = cols.map(([name, type, from]) => q(row[from || name], type)).join(', ');
    return `  (${line})`;
  }).join(',\n');
  const names = cols.map(([name]) => name).join(', ');
  const updates = cols
    .map(([name]) => name)
    .filter(name => name !== 'id')
    .map(name => `${name} = excluded.${name}`)
    .join(',\n  ');
  return `insert into public.${table} (${names})\nvalues\n${values}\non conflict (id) do update set\n  ${updates};\n`;
}

const settings = Object.assign({ id: 'main' }, db.settings || {});

const parts = [];
parts.push('-- BajoZone seed data generated from data/db.json\n');
parts.push('begin;\n');
parts.push(insert('site_settings', [
  ['id'], ['site_name_ar'], ['site_name_en'], ['tagline_ar'], ['tagline_en'],
  ['about_ar'], ['about_en'], ['about_image'], ['logo'], ['favicon'],
  ['ticker_ar'], ['ticker_en'], ['about_content_ar'], ['about_content_en'],
  ['social', 'json'], ['about_gallery', 'json'], ['popup', 'json'], ['new_article_bar', 'json']
], [settings]));

parts.push(insert('programs', [
  ['id'], ['slug'], ['name_ar'], ['name_en'], ['short_description_ar'], ['short_description_en'],
  ['description_ar'], ['description_en'], ['logo_url'], ['accent_color'], ['sort_order', 'int'], ['is_active', 'bool']
], db.programs || []));

parts.push(insert('categories', [
  ['id'], ['name_ar'], ['name_en'], ['sort_order', 'int']
], (db.categories || []).map((c, i) => Object.assign({ sort_order: i + 1 }, c))));

parts.push(insert('tags', [
  ['id'], ['name'], ['slug']
], db.tags || []));

parts.push(insert('articles', [
  ['id'], ['slug'], ['title_ar'], ['title_en'], ['excerpt_ar'], ['excerpt_en'],
  ['content_ar'], ['content_en'], ['image'], ['date'], ['category_id'],
  ['category_ar'], ['category_en'], ['program_id'], ['tag_ids', 'text_array', 'tags'],
  ['featured', 'bool'], ['is_new', 'bool'], ['is_published', 'bool'],
  ['reading_time', 'int'], ['level'], ['sources', 'json'], ['youtube_url'], ['video_url']
], (db.articles || []).map(a => Object.assign({ is_published: true, is_new: false }, a))));

parts.push(insert('books', [
  ['id'], ['title_ar'], ['title_en'], ['subtitle_ar'], ['subtitle_en'],
  ['description_ar'], ['description_en'], ['cover'], ['amazon_url'], ['price'], ['available', 'bool']
], db.books || []));

parts.push(insert('resources', [
  ['id'], ['slug'], ['type'], ['document_subtype'], ['title_ar'], ['title_en'],
  ['short_description_ar'], ['short_description_en'], ['full_description_ar'], ['full_description_en'],
  ['bajo_summary_ar'], ['why_it_matters_ar'], ['target_audience'], ['field'], ['language'],
  ['author_or_org'], ['publisher'], ['publication_year', 'int'], ['pages', 'int'], ['file_size'],
  ['cover_image'], ['source_url'], ['download_url'], ['access_type'], ['rights'],
  ['tags', 'text_array'], ['is_featured', 'bool'], ['is_published', 'bool']
], db.resources || []));

parts.push('commit;\n');

const outDir = path.join(root, 'supabase');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'bajozone_seed_from_db.sql'), parts.join('\n'), 'utf8');
console.log('Generated supabase/bajozone_seed_from_db.sql');

