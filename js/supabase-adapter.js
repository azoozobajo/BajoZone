'use strict';

(function () {
  const cfg = window.BZ_SUPABASE || {};
  const baseUrl = (cfg.url || '').replace(/\/$/, '');
  const anonKey = cfg.anonKey || '';

  function ready() {
    return !!(baseUrl && anonKey);
  }

  function headers(extra) {
    return Object.assign({
      apikey: anonKey,
      Authorization: `Bearer ${getAccessToken() || anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }, extra || {});
  }

  function getAccessToken() {
    return sessionStorage.getItem('bz_supabase_access_token') || '';
  }

  function setAuthSession(session) {
    const accessToken = session?.access_token || '';
    const refreshToken = session?.refresh_token || '';
    if (accessToken) sessionStorage.setItem('bz_supabase_access_token', accessToken);
    if (refreshToken) sessionStorage.setItem('bz_supabase_refresh_token', refreshToken);
  }

  async function rest(path, options) {
    if (!ready()) throw new Error('Supabase config is missing');
    const res = await fetch(`${baseUrl}/rest/v1/${path}`, Object.assign({
      headers: headers()
    }, options || {}));
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Supabase HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  async function authSignIn(email, password) {
    if (!ready()) throw new Error('Supabase config is missing');
    const res = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password })
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.msg || body?.error_description || body?.error || 'Supabase login failed');
    setAuthSession(body);
    return body;
  }

  function authSignOut() {
    sessionStorage.removeItem('bz_supabase_access_token');
    sessionStorage.removeItem('bz_supabase_refresh_token');
  }

  function rowArticle(row) {
    return Object.assign({}, row, {
      tags: row.tag_ids || [],
      read_time: row.reading_time || null,
      tag_ids: undefined
    });
  }

  function defaultValueFor(key) {
    if (['social', 'popup', 'new_article_bar'].includes(key)) return {};
    if (['about_gallery', 'sources', 'about_keywords'].includes(key)) return [];
    if (['tag_ids', 'tags'].includes(key)) return [];
    if (['featured', 'is_new', 'is_featured'].includes(key)) return false;
    if (['is_published', 'is_active', 'available'].includes(key)) return true;
    if (['sort_order'].includes(key)) return 100;
    if (['view_count', 'share_count', 'download_count'].includes(key)) return 0;
    if (['reading_time', 'publication_year', 'pages'].includes(key)) return null;
    if (['category_id', 'program_id', 'document_subtype'].includes(key)) return null;
    if (key === 'date') return new Date().toISOString().slice(0, 10);
    return '';
  }

  function pick(row, keys) {
    return keys.reduce((acc, key) => {
      acc[key] = row[key] !== undefined ? row[key] : defaultValueFor(key);
      return acc;
    }, {});
  }

  function payloadArticle(item) {
    const row = Object.assign({}, item);
    row.tag_ids = Array.isArray(item.tags) ? item.tags : (item.tag_ids || []);
    row.reading_time = item.read_time || item.reading_time || null;
    delete row.tags;
    delete row.read_time;
    delete row.created_at;
    delete row.updated_at;
    return pick(row, [
      'id', 'slug', 'title_ar', 'title_en', 'excerpt_ar', 'excerpt_en',
      'content_ar', 'content_en', 'image', 'date', 'category_id',
      'category_ar', 'category_en', 'program_id', 'tag_ids', 'featured',
      'is_new', 'is_published', 'reading_time', 'level', 'sources',
      'youtube_url', 'video_url', 'view_count', 'share_count'
    ]);
  }

  function payloadClean(item, keys) {
    const row = Object.assign({}, item);
    delete row.created_at;
    delete row.updated_at;
    return keys ? pick(row, keys) : row;
  }

  function payloadSettings(item) {
    const source = item || {};
    const row = pick(source, [
      'id', 'site_name_ar', 'site_name_en', 'tagline_ar', 'tagline_en',
      'about_ar', 'about_en', 'about_image', 'logo', 'favicon',
      'ticker_ar', 'ticker_en', 'about_content_ar', 'about_content_en',
      'social', 'about_gallery', 'popup', 'new_article_bar',
      'about_journey_logos', 'about_var_enabled', 'about_var_data',
      'about_contact_invite_ar', 'about_contact_invite_en',
      'about_keywords'
    ]);
    if (source.about_profile && typeof row.social === 'object' && !Array.isArray(row.social)) {
      row.social = Object.assign({}, row.social, { __about_profile: source.about_profile });
    }
    return row;
  }

  function payloadResource(item) {
    const row = payloadClean(item, [
      'id', 'slug', 'type', 'document_subtype', 'title_ar', 'title_en',
      'short_description_ar', 'short_description_en', 'full_description_ar',
      'full_description_en', 'bajo_summary_ar', 'why_it_matters_ar',
      'target_audience', 'field', 'language', 'author_or_org', 'publisher',
      'publication_year', 'pages', 'file_size', 'cover_image', 'source_url',
      'download_url', 'access_type', 'rights', 'tags', 'is_featured',
      'is_published', 'download_count'
    ]);
    ['bajo_summary_ar', 'why_it_matters_ar', 'target_audience', 'field'].forEach(key => {
      if (Array.isArray(row[key])) row[key] = row[key].join(',');
    });
    row.tags = Array.isArray(row.tags) ? row.tags : String(row.tags || '').split(',').map(x => x.trim()).filter(Boolean);
    return row;
  }

  function buildDb(rows) {
    const settings = rows.settings?.[0] || {};
    if (!settings.about_profile && settings.social?.__about_profile) {
      settings.about_profile = settings.social.__about_profile;
    }
    const db = {
      settings,
      programs: rows.programs || [],
      tags: rows.tags || [],
      categories: rows.categories || [],
      articles: (rows.articles || []).map(rowArticle),
      books: rows.books || [],
      resources: rows.resources || [],
      admin: { username: 'bajo', password: 'BajoZone2025!' }
    };
    return db;
  }

  async function loadDb() {
    const [settings, programs, tags, categories, articles, books, resources] = await Promise.all([
      rest('site_settings?select=*&id=eq.main&limit=1'),
      rest('programs?select=*&order=sort_order.asc'),
      rest('tags?select=*&order=name.asc'),
      rest('categories?select=*&order=sort_order.asc'),
      rest('articles?select=*&order=date.desc'),
      rest('books?select=*&order=created_at.desc'),
      rest('resources?select=*&order=created_at.desc')
    ]);
    return buildDb({ settings, programs, tags, categories, articles, books, resources });
  }

  async function upsertTable(table, rows) {
    if (!rows.length) return [];
    return rest(`${table}?on_conflict=id`, {
      method: 'POST',
      headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
      body: JSON.stringify(rows)
    });
  }

  async function deleteMissing(table, ids) {
    if (!Array.isArray(ids)) return;
    const existing = await rest(`${table}?select=id`);
    const existingIds = (existing || []).map(x => x.id);
    const missing = existingIds.filter(id => !ids.includes(id));
    if (!missing.length) return;
    await rest(`${table}?id=in.(${missing.map(encodeURIComponent).join(',')})`, { method: 'DELETE' });
  }

  async function saveDb(db) {
    if (!getAccessToken()) throw new Error('Supabase Auth session is required for saving');
    const settings = payloadSettings(Object.assign({}, db.settings || {}, { id: 'main' }));

    await upsertTable('site_settings', [settings]);
    await upsertTable('programs', (db.programs || []).map(item => payloadClean(item, [
      'id', 'slug', 'name_ar', 'name_en', 'short_description_ar',
      'short_description_en', 'description_ar', 'description_en',
      'logo_url', 'cover_image', 'accent_color', 'sort_order', 'is_active',
      'is_featured'
    ])));
    await upsertTable('categories', (db.categories || []).map(item => payloadClean(item, [
      'id', 'name_ar', 'name_en', 'sort_order'
    ])));
    await upsertTable('tags', (db.tags || []).map(item => payloadClean(item, [
      'id', 'name', 'slug'
    ])));
    await upsertTable('articles', (db.articles || []).map(payloadArticle));
    await upsertTable('books', (db.books || []).map(item => payloadClean(item, [
      'id', 'title_ar', 'title_en', 'subtitle_ar', 'subtitle_en',
      'description_ar', 'description_en', 'cover', 'amazon_url',
      'price', 'available', 'download_count'
    ])));
    await upsertTable('resources', (db.resources || []).map(payloadResource));

    await deleteMissing('programs', (db.programs || []).map(x => x.id));
    await deleteMissing('categories', (db.categories || []).map(x => x.id));
    await deleteMissing('tags', (db.tags || []).map(x => x.id));
    await deleteMissing('articles', (db.articles || []).map(x => x.id));
    await deleteMissing('books', (db.books || []).map(x => x.id));
    await deleteMissing('resources', (db.resources || []).map(x => x.id));
  }

  async function uploadMedia(blob, path, contentType) {
    if (!getAccessToken()) throw new Error('Supabase Auth session is required for upload');
    if (!ready()) throw new Error('Supabase config is missing');
    const safePath = String(path || `${Date.now()}.bin`).replace(/^\/+/, '');
    const objectUrl = `${baseUrl}/storage/v1/object/bajozone-media/${safePath.split('/').map(encodeURIComponent).join('/')}`;
    const uploadHeaders = {
      apikey: anonKey,
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': contentType || blob.type || 'application/octet-stream',
      'x-upsert': 'true'
    };

    let res = await fetch(objectUrl, {
      method: 'POST',
      headers: uploadHeaders,
      body: blob
    });

    if (!res.ok && [400, 409].includes(res.status)) {
      res = await fetch(objectUrl, {
        method: 'PUT',
        headers: uploadHeaders,
        body: blob
      });
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let message = text || `Supabase upload HTTP ${res.status}`;
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || message;
      } catch (_) {}
      throw new Error(message);
    }
    const publicUrl = `${baseUrl}/storage/v1/object/public/bajozone-media/${safePath.split('/').map(encodeURIComponent).join('/')}`;
    return publicUrl;
  }

  window.BajoSupabase = {
    ready,
    loadDb,
    saveDb,
    uploadMedia,
    authSignIn,
    authSignOut,
    getAccessToken
  };
})();
