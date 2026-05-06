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
      tag_ids: undefined
    });
  }

  function payloadArticle(item) {
    const row = Object.assign({}, item);
    row.tag_ids = Array.isArray(item.tags) ? item.tags : (item.tag_ids || []);
    delete row.tags;
    delete row.created_at;
    delete row.updated_at;
    return row;
  }

  function payloadClean(item) {
    const row = Object.assign({}, item);
    delete row.created_at;
    delete row.updated_at;
    return row;
  }

  function buildDb(rows) {
    const settings = rows.settings?.[0] || {};
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
    const settings = Object.assign({}, db.settings || {}, { id: 'main' });
    delete settings.created_at;
    delete settings.updated_at;

    await upsertTable('site_settings', [settings]);
    await upsertTable('programs', (db.programs || []).map(payloadClean));
    await upsertTable('categories', (db.categories || []).map(payloadClean));
    await upsertTable('tags', (db.tags || []).map(payloadClean));
    await upsertTable('articles', (db.articles || []).map(payloadArticle));
    await upsertTable('books', (db.books || []).map(payloadClean));
    await upsertTable('resources', (db.resources || []).map(payloadClean));

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
    const res = await fetch(`${baseUrl}/storage/v1/object/bajozone-media/${encodeURI(safePath)}`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${getAccessToken()}`,
        'Content-Type': contentType || blob.type || 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: blob
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Supabase upload HTTP ${res.status}`);
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
