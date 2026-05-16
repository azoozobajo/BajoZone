/* ================================================================
   BajoZone — Main Application Engine  v3.0
   5 updates: book pages, remove visits stat, editable ticker,
   popup banner, rich about page
   ================================================================ */
'use strict';

/* ── CMS ─────────────────────────────────────── */
const CMS = {
  db: null, LS_KEY: 'bz_db_v8',
  async init() {
    if (window.BajoSupabase?.ready?.()) {
      try {
        const remoteDb = await window.BajoSupabase.loadDb();
        const hasRemoteContent = ['articles', 'programs', 'books', 'resources'].some(k => (remoteDb[k] || []).length);
        if (hasRemoteContent) {
          this.db = remoteDb;
          localStorage.setItem(this.LS_KEY, JSON.stringify(this.db));
          return true;
        }
      } catch (err) {
        console.warn('Supabase load failed, falling back to local db.json', err);
      }
    }

    const s = localStorage.getItem(this.LS_KEY);
    if (s) {
      try { this.db = JSON.parse(s); } catch(e) { this.db = null; }
    }
    if (this.db) return true;
    try {
      const r = await fetch('data/db.json?t=' + Date.now());
      if (!r.ok) throw 0;
      this.db = await r.json();
      localStorage.setItem(this.LS_KEY, JSON.stringify(this.db));
    } catch(_) {
      // fallback to previously loaded data if parse succeeded
    }
    return !!this.db;
  },
  s(k, fb) { return this.db?.settings?.[k] ?? fb ?? ''; },
  list(k)  { return this.db?.[k] ?? []; }
};

/* ── Lang ────────────────────────────────────── */
const Lang = {
  cur: localStorage.getItem('bz_lang') || 'ar',
  str(o, fb = '') { if (!o) return fb; return o[this.cur] || o.ar || o.en || fb; },
  t(k) { return (i18n[this.cur] || i18n.ar)[k] || i18n.ar[k] || k; },
  toggle() {
    this.cur = this.cur === 'ar' ? 'en' : 'ar';
    localStorage.setItem('bz_lang', this.cur);
    applyLang();
    Router.go(Router.cur, false);
    renderNav(); renderFooter();
  }
};

/* ── i18n ────────────────────────────────────── */
const i18n = {
  ar: {
    home:'الرئيسية', articles:'المقالات', programs:'البرامج', books:'المكتبة', about:'تعرف علي', library:'المكتبة الرقمية',
    buyNow:'اشتر الآن', downloadFree:'تحميل الملف', readMore:'اقرأ المزيد',
    latestArticles:'آخر المواضيع', latestTopics:'أحدث المواضيع', ourBooks:'مكتبة باجو زون الرقمية', aboutUs:'تعرف علي',
    libHero:'مكتبة باجو زون الرقمية', libSub:'موارد مجانية قابلة للتحميل في كرة القدم، اكتشاف المواهب، تطوير اللاعبين، التدريب، التحليل، والعلوم الرياضية.',
    libFeatured:'موارد مختارة', libAll:'الكل', libSearch:'بحث في الموارد...',
    libEmpty:'لا توجد موارد مطابقة. جرّب تغيير التصنيف أو كلمات البحث.',
    rType_scientific_study:'دراسة علمية', rType_official_document:'وثيقة رسمية', rType_practical_guide:'دليل عملي', rType_template:'قالب',
    rAccess_direct_download:'تحميل مباشر', rAccess_external_link:'رابط خارجي', rAccess_source_only:'عرض المصدر',
    rAudience_coach:'مدرب', rAudience_scout:'كشاف', rAudience_player:'لاعب', rAudience_parent:'ولي أمر', rAudience_academy:'أكاديمية', rAudience_researcher:'باحث',
    rField_talent_identification:'اكتشاف المواهب', rField_player_development:'تطوير اللاعبين', rField_coaching:'التدريب', rField_analysis:'التحليل', rField_sports_science:'العلوم الرياضية', rField_sports_psychology:'علم النفس', rField_nutrition:'التغذية', rField_scouting:'الكشافة', rField_parent:'ولي الأمر',
    btnDownload:'تحميل الملف', btnSource:'عرض المصدر', btnDetails:'عرض التفاصيل',
    libCopyright:'جميع الموارد المعروضة هي ملفات مجانية أو منشورة من مصادرها الأصلية. لا تبيع باجو زون هذه الملفات. في حال وجود أي ملاحظة حقوقية يمكن التواصل معنا.',
    sortNewest:'الأحدث', sortOldest:'الأقدم', sortYear:'حسب السنة', sortType:'حسب النوع',
    libResources:'مورد', libTypes:'تصنيف', libLatest:'آخر تحديث',
    eyebrow:'منصة علم المواهب الكروية',
    h1_1:'اكتشف', h1_2:'المواهب', h1_3:'الحقيقية',
    heroSub:'منصة متخصصة تجمع العلم والميدان في اكتشاف وتطوير المواهب الكروية — من الناشئين حتى الاحتراف',
    exploreBtn:'استكشف البرامج', booksBtn:'مكتبتنا',
    aboutLabel:'عبدالعزيز باجخيف', viewAll:'عرض الكل',
    noArticles:'لا توجد مواضيع حتى الآن', noTopics:'لا توجد مواضيع حتى الآن', noBooks:'لا توجد كتب حتى الآن',
    back:'← العودة للبرامج', backBooks:'← العودة للكتب',
    contactUs:'تواصل معنا', rights:'جميع الحقوق محفوظة',
    s_art:'موضوع منشور', s_bks:'كتاب منشور',
    all:'الكل', comingSoon:'قريباً', onAmazon:'على أمازون',
    whatsapp:'واتساب', email:'البريد الإلكتروني', phone:'هاتف',
    snapchat:'سناب شات', tiktok:'تيك توك', facebook:'فيسبوك',
    instagram:'إنستقرام', twitter:'تويتر / X',
    close:'إغلاق', bookDetails:'تفاصيل الكتاب',
    relatedTopics:'مواضيع ذات صلة', sources:'المصادر', program:'برنامج', topic:'موضوع',
    ticker_default:'اكتشاف المواهب ✦ تطوير اللاعبين ✦ كشافة كرة القدم ✦ علوم الرياضة ✦ BajoZone'
  },
  en: {
    home:'Home', articles:'Articles', programs:'Programs', books:'Library', about:'Meet Abdulaziz', library:'Digital Library',
    buyNow:'Buy Now', downloadFree:'Download File', readMore:'Read More',
    latestArticles:'Latest Topics', latestTopics:'Latest Topics', ourBooks:'BajoZone Digital Library', aboutUs:'Meet Abdulaziz',
    libHero:'BajoZone Digital Library', libSub:'Free downloadable resources on football, talent identification, player development, coaching, analysis, and sports science.',
    libFeatured:'Featured Resources', libAll:'All', libSearch:'Search resources...',
    libEmpty:'No matching resources. Try changing the filter or search terms.',
    rType_scientific_study:'Scientific Study', rType_official_document:'Official Document', rType_practical_guide:'Practical Guide', rType_template:'Template',
    rAccess_direct_download:'Direct Download', rAccess_external_link:'External Link', rAccess_source_only:'View Source',
    rAudience_coach:'Coach', rAudience_scout:'Scout', rAudience_player:'Player', rAudience_parent:'Parent', rAudience_academy:'Academy', rAudience_researcher:'Researcher',
    rField_talent_identification:'Talent ID', rField_player_development:'Player Dev', rField_coaching:'Coaching', rField_analysis:'Analysis', rField_sports_science:'Sports Science', rField_sports_psychology:'Psychology', rField_nutrition:'Nutrition', rField_scouting:'Scouting', rField_parent:'Parenting',
    btnDownload:'Download File', btnSource:'View Source', btnDetails:'View Details',
    libCopyright:'All resources are free files or published from their original sources. BajoZone does not sell these files. For copyright concerns, contact us.',
    sortNewest:'Newest', sortOldest:'Oldest', sortYear:'By Year', sortType:'By Type',
    libResources:'resource', libTypes:'type', libLatest:'Latest',
    eyebrow:'Football Talent Science Platform',
    h1_1:'Discover', h1_2:'Real', h1_3:'Talent',
    heroSub:'A specialized platform merging science and field expertise in football talent identification and development — from youth to professional level.',
    exploreBtn:'Explore Programs', booksBtn:'Our Books',
    aboutLabel:'Abdulaziz Bajkhaif', viewAll:'View All',
    noArticles:'No topics yet', noTopics:'No topics yet', noBooks:'No books yet',
    back:'← Back to Programs', backBooks:'← Back to Books',
    contactUs:'Contact Us', rights:'All Rights Reserved',
    s_art:'Topics', s_bks:'Published Books',
    all:'All', comingSoon:'Coming Soon', onAmazon:'On Amazon',
    whatsapp:'WhatsApp', email:'Email', phone:'Phone',
    snapchat:'Snapchat', tiktok:'TikTok', facebook:'Facebook',
    instagram:'Instagram', twitter:'Twitter / X',
    close:'Close', bookDetails:'Book Details',
    relatedTopics:'Related Topics', sources:'Sources', program:'Program', topic:'Topic',
    ticker_default:'Talent Identification ✦ Player Development ✦ Football Scouting ✦ Sports Science ✦ BajoZone'
  }
};

/* ── Analytics ───────────────────────────────── */
const Stats = {
  KEY: 'bz_analytics_v1',
  data: {
    sessions: 0,
    pageviews: 0,
    articleViews: {},
    bookDownloads: {},
    shareCounts: { whatsapp: 0, x: 0, instagram: 0, facebook: 0, linkedin: 0, copy: 0, pdf: 0 },
    articleShares: {},
    events: [],
    firstSeen: '',
    lastSeen: ''
  },
  load() {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return;
    try { const parsed = JSON.parse(raw); if (parsed && typeof parsed === 'object') this.data = { ...this.data, ...parsed }; } catch (_) {}
  },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.data)); },
  log(type, payload = {}) {
    if (!Array.isArray(this.data.events)) this.data.events = [];
    this.data.events.push({ type, at: new Date().toISOString(), ...payload });
    if (this.data.events.length > 1500) this.data.events = this.data.events.slice(-1500);
  },
  init() {
    this.load();
    if (!this.data.firstSeen) this.data.firstSeen = new Date().toISOString();
    if (!sessionStorage.getItem('bz_analytics_session')) {
      sessionStorage.setItem('bz_analytics_session', '1');
      this.data.sessions = (this.data.sessions || 0) + 1;
      this.log('session');
    }
    this.data.lastSeen = new Date().toISOString();
    this.save();
  },
  recordPageview() {
    this.data.pageviews = (this.data.pageviews || 0) + 1;
    this.data.lastSeen = new Date().toISOString();
    this.log('pageview', { path: Router?.cur || location.hash || '/' });
    this.save();
  },
  recordArticleView(id) {
    if (!id) return;
    this.data.articleViews[id] = (this.data.articleViews[id] || 0) + 1;
    this.log('article_view', { articleId: id });
    this.save();
  },
  recordBookDownload(id) {
    if (!id) return;
    if (!this.data.bookDownloads) this.data.bookDownloads = {};
    this.data.bookDownloads[id] = (this.data.bookDownloads[id] || 0) + 1;
    this.log('book_download', { bookId: id });
    this.save();
  },
  recordShare(channel, articleId) {
    if (!channel) return;
    this.data.shareCounts[channel] = (this.data.shareCounts[channel] || 0) + 1;
    if (articleId) {
      if (!this.data.articleShares) this.data.articleShares = {};
      if (!this.data.articleShares[articleId]) this.data.articleShares[articleId] = {};
      this.data.articleShares[articleId][channel] = (this.data.articleShares[articleId][channel] || 0) + 1;
    }
    this.log('share', { channel, articleId: articleId || '' });
    this.save();
  },
  totalShares() {
    return Object.values(this.data.shareCounts || {}).reduce((sum, value) => sum + (value || 0), 0);
  },
  getTopArticles(n = 5) {
    return Object.entries(this.data.articleViews || {}).sort(([,a], [,b]) => b - a).slice(0, n);
  }
};

/* ── Social SVG icons ────────────────────────── */
const SI = {
  whatsapp:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.18.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17 0-.37-.01-.57-.01s-.52.07-.79.37c-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.19 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35zm-5.47 7.47C4.93 21.85 0 16.92 0 12 0 5.37 5.37 0 12 0s12 5.37 12 12-5.37 12-12 12zm0-22C5.93 1.85 1.85 5.93 1.85 12c0 2.23.65 4.31 1.77 6.07L2.5 21.5l3.55-1.1A10.15 10.15 0 0012 22.15c5.6 0 10.15-4.55 10.15-10.15S17.6 1.85 12 1.85z"/></svg>',
  email:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  phone:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>',
  snapchat:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C8.96 0 6.33 2.63 6.33 5.67c0 .3.03.6.07.89L4.7 7.79c-.23.24-.23.61 0 .85l1.36 1.36c-.3.93-.48 1.93-.5 2.95-.6.19-1.19.48-1.7.89-.32.26-.4.71-.2 1.05.21.35.65.47 1.01.28.58-.31 1.21-.49 1.85-.54.54 1.06 1.67 1.77 2.91 1.77s2.37-.71 2.91-1.77c.64.05 1.27.23 1.85.54.36.19.8.07 1.01-.28.2-.34.12-.79-.2-1.05-.51-.41-1.1-.7-1.7-.89-.02-1.02-.2-2.02-.5-2.95l1.36-1.36c.23-.24.23-.61 0-.85l-1.7-1.23c.04-.29.07-.59.07-.89C17.67 2.63 15.04 0 12 0z"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.74a4.85 4.85 0 01-1-.05z"/></svg>',
  facebook:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12c0-3.2.01-3.58.07-4.85C2.38 3.86 3.9 2.31 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32A6.16 6.16 0 0012 5.84zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>',
  twitter:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24H16.17l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25H8.08l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>',
  author:'<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'
};

/* ── Router ──────────────────────────────────── */
const Router = {
  routes: {}, cur: '/',
  reg(p, fn) { this.routes[p] = fn; },
  go(path, push = true) {
    if (push) history.pushState({}, '', '#' + path);
    if (!path.startsWith('/article/')) document.body.classList.remove('focus-reading');
    document.body.classList.remove('is-about-page');
    this.cur = path;
    const parts = path.replace(/^\//, '').split('/');
    const base = '/' + (parts[0] || '');
    const param = parts[1] || null;
    (this.routes[base] || this.routes['/'])?.(param);
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
      const h = (a.getAttribute('href') || '').replace('#', '');
      a.classList.toggle('active', h === base || (base === '/' && h === '/'));
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    Stats.recordPageview();
    updateNavLogoMode();
  },
  init() {
    window.addEventListener('popstate', () => this.go(location.hash.replace('#', '') || '/', false));
    this.go(location.hash.replace('#', '') || '/', false);
  }
};

/* ── Helpers ─────────────────────────────────── */
function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString(Lang.cur === 'ar' ? 'ar-SA' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' });
}

let _revObs;
function initReveal() {
  if (_revObs) _revObs.disconnect();
  _revObs = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); _revObs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  setTimeout(() => document.querySelectorAll('.reveal').forEach(el => _revObs.observe(el)), 80);
}

function applyLang() {
  document.documentElement.lang = Lang.cur;
  document.documentElement.dir  = Lang.cur === 'ar' ? 'rtl' : 'ltr';
  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = Lang.cur === 'ar' ? 'EN' : 'عربي';
}
function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'bz-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 300); }, 2800);
}
function hideBootLoader() {
  const el = document.getElementById('boot-loader');
  if (!el) return;
  el.classList.add('fade');
  setTimeout(() => el.remove(), 550);
}
function setMetaTag(name, content, property = false) {
  if (!content) return;
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    if (property) tag.setAttribute('property', name);
    else tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
function updatePageMeta(title, description, image, url) {
  document.title = title;
  setMetaTag('description', description);
  setMetaTag('og:title', title, true);
  setMetaTag('og:description', description, true);
  setMetaTag('og:image', imgSrc(image || CMS.s('logo', 'assets/images/logo-bajo.png')), true);
  setMetaTag('og:url', url || location.href, true);
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);
  setMetaTag('twitter:image', imgSrc(image || CMS.s('logo', 'assets/images/logo-bajo.png')));
}
function mediaSrc(url) {
  if (!url) return '';
  const value = String(url).trim();
  if (/^(data:|blob:|https?:\/\/|\/)/i.test(value)) return value;
  if (value.startsWith('public/')) return '/' + value.replace(/^public\//, '');
  return value;
}
function imgSrc(url) {
  return mediaSrc(url);
}
function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (err) {
      reject(err);
    }
    ta.remove();
  });
}
function getShareUrl(id) {
  return `${location.origin}${location.pathname}#/article/${id}`;
}
function trackBookDownload(id) {
  Stats.recordBookDownload(id);
}
function toggleFocusReading() {
  document.body.classList.toggle('focus-reading');
}
function jsArg(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}
function shareArticle(channel, id, title) {
  const url = getShareUrl(id);
  const text = `${title}\n${url}`;
  Stats.recordShare(channel, id);
  if (channel === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    return;
  }
  if (channel === 'x') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    return;
  }
  if (channel === 'instagram') {
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {
        copyTextToClipboard(url).then(() => showToast('Link copied to clipboard')); 
      });
    } else {
      copyTextToClipboard(url).then(() => showToast('Link copied to clipboard'));
    }
    return;
  }
  if (channel === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    return;
  }
  if (channel === 'linkedin') {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    return;
  }
  if (channel === 'copy') {
    copyTextToClipboard(url).then(() => showToast(Lang.cur === 'ar' ? 'تم نسخ الرابط' : 'Link copied'));
    return;
  }
}
function downloadArticlePDF(id) {
  const a = CMS.list('articles').find(x => x.id === id || x.slug === id);
  if (!a) return;
  Stats.recordShare('pdf', a.id);
  const t = Lang.str({ ar: a.title_ar, en: a.title_en });
  const c = Lang.str({ ar: a.category_ar, en: a.category_en });
  const con = parseCallouts(Lang.str({ ar: a.content_ar, en: a.content_en }));
  const url = getShareUrl(id);
  const isAr = Lang.cur === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const align = isAr ? 'right' : 'left';
  const author = isAr ? 'عبدالعزيز باجخيف' : 'Abdulaziz Bajkhaif';
  const authorLabel = isAr ? 'الكاتب' : 'Author';
  const dateLabel = isAr ? 'التاريخ' : 'Date';
  const sourceLabel = isAr ? 'المصدر' : 'Source';
  const siteUrl = 'www.bajozone.com';
  const logo = imgSrc(CMS.s('logo', 'assets/images/logo-bajo.png'));
  const image = a.image ? `<img class="hero-img" src="${imgSrc(a.image)}" alt="${t}">` : '';
  const html = `<!doctype html>
<html lang="${Lang.cur}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <title>${t}</title>
  <style>
    @page { margin: 18mm 16mm 22mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ${isAr ? "'Tajawal', 'Arial'" : "'Arial', 'Helvetica'"}, sans-serif;
      color: #111;
      background: #fff;
      direction: ${dir};
      text-align: ${align};
    }
    .pdf-page { max-width: 820px; margin: 0 auto; padding-bottom: 48px; }
    .pdf-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 2px solid #111;
      padding-bottom: 18px;
      margin-bottom: 28px;
    }
    [dir="rtl"] .pdf-head { flex-direction: row-reverse; }
    .pdf-logo {
      width: 58px;
      height: auto;
      object-fit: contain;
      flex: 0 0 auto;
    }
    .pdf-brand { font-size: 12px; letter-spacing: .18em; color: #8a6a2e; font-weight: 700; margin-bottom: 8px; }
    h1 {
      font-size: 34px;
      line-height: 1.25;
      margin: 0 0 14px;
      color: #111;
      font-weight: 800;
    }
    .pdf-meta {
      display: grid;
      gap: 6px;
      color: #555;
      font-size: 13px;
      line-height: 1.6;
    }
    .pdf-meta b { color: #111; }
    .hero-img {
      width: 100%;
      max-height: 420px;
      object-fit: cover;
      display: block;
      margin: 26px 0;
      border: 1px solid #ddd;
    }
    .content {
      margin-top: 22px;
      font-size: 16px;
      line-height: 1.9;
    }
    .content h2 { font-size: 24px; margin: 34px 0 12px; line-height: 1.35; }
    .content h3 { font-size: 19px; margin: 26px 0 10px; }
    .content p { margin: 0 0 14px; }
    .content ul, .content ol { margin: 0 0 16px; padding-inline-start: 24px; }
    .content li { margin-bottom: 6px; }
    .content img { max-width: 100%; height: auto; display: block; margin: 22px auto; border: 1px solid #ddd; }
    blockquote, .article-callout {
      border-inline-start: 4px solid #c8a86e;
      background: #f7f2e8;
      padding: 14px 18px;
      margin: 24px 0;
      color: #222;
    }
    iframe, video { max-width: 100%; }
    .pdf-footer {
      position: fixed;
      left: 16mm;
      right: 16mm;
      bottom: 8mm;
      border-top: 1px solid #ddd;
      padding-top: 8px;
      color: #666;
      font-size: 11px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    [dir="rtl"] .pdf-footer { flex-direction: row-reverse; }
    .pdf-footer strong { color: #111; }
  </style>
</head>
<body>
  <main class="pdf-page">
    <header class="pdf-head">
      <div>
        <div class="pdf-brand">BAJOZONE</div>
        <h1>${t}</h1>
        <div class="pdf-meta">
          <div><b>${authorLabel}:</b> ${author}</div>
          <div><b>${dateLabel}:</b> ${fmtDate(a.date)}</div>
          <div><b>${sourceLabel}:</b> ${siteUrl}</div>
          <div>${c}</div>
        </div>
      </div>
      <img class="pdf-logo" src="${logo}" alt="BajoZone">
    </header>
    ${image}
    <article class="content">${con}</article>
  </main>
  <footer class="pdf-footer">
    <span><strong>BAJOZONE</strong> — ${siteUrl}</span>
    <span>${url}</span>
  </footer>
</body>
</html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
function updateNavLogoMode() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  nav.classList.toggle('dark-logo', Router.cur === '/' && window.scrollY < 60);
}
/* ── Nav ─────────────────────────────────────── */
function renderNav() {
  applyLang();
  const ne = document.getElementById('nav-brand-name');
  if (ne) ne.textContent = CMS.s('site_name_en', 'BajoZone');
  const li = document.getElementById('nav-logo');
  if (li) li.src = imgSrc(CMS.s('logo', 'assets/images/logo-bajo.png'));
  const ul = document.getElementById('nav-links');
  if (ul) ul.innerHTML = `
    <li><a href="#/" onclick="Router.go('/')">${Lang.t('home')}</a></li>
    <li><a href="#/programs" onclick="Router.go('/programs')">${Lang.t('programs')}</a></li>
    <li><a href="#/books" onclick="Router.go('/books')">${Lang.t('library')}</a></li>
    <li><a href="#/about" onclick="Router.go('/about')">${Lang.t('about')}</a></li>`;
  const mob = document.getElementById('mobile-links');
  if (mob) mob.innerHTML = `
    <li><a href="#/" onclick="document.getElementById('mobile-nav').classList.remove('open');Router.go('/')">${Lang.t('home')}</a></li>
    <li><a href="#/programs" onclick="document.getElementById('mobile-nav').classList.remove('open');Router.go('/programs')">${Lang.t('programs')}</a></li>
    <li><a href="#/books" onclick="document.getElementById('mobile-nav').classList.remove('open');Router.go('/books')">${Lang.t('library')}</a></li>
    <li><a href="#/about" onclick="document.getElementById('mobile-nav').classList.remove('open');Router.go('/about')">${Lang.t('about')}</a></li>`;
}

/* ── Footer ──────────────────────────────────── */
function renderFooter() {
  const soc = CMS.s('social', {});
  const year = new Date().getFullYear();
  const SM = [
    { key:'whatsapp', href: v => `https://wa.me/${v.replace(/\D/g,'')}` },
    { key:'email',    href: v => `mailto:${v}` },
    { key:'phone',    href: v => `tel:${v}` },
    { key:'snapchat', href: v => `https://snapchat.com/add/${v}` },
    { key:'tiktok',   href: v => `https://tiktok.com/@${v.replace('@','')}` },
    { key:'facebook', href: v => v.startsWith('http') ? v : `https://facebook.com/${v}` },
    { key:'instagram',href: v => `https://instagram.com/${v.replace('@','')}` },
    { key:'twitter',  href: v => `https://x.com/${v.replace('@','')}` }
  ];
  const active = SM.filter(s => soc[s.key]?.visible && soc[s.key]?.value);
  const nameEn = CMS.s('site_name_en', 'BajoZone');
  const isArF = Lang.cur === 'ar';
  const footerDesc = isArF
    ? 'منصة عربية للمعرفة الكروية حول اكتشاف وتطوير المواهب.'
    : 'An Arabic platform for football knowledge around talent identification and development.';
  document.getElementById('site-footer').innerHTML = `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div>
            <img class="footer-brand-logo" src="${imgSrc(CMS.s('logo','assets/images/logo-bajo.png'))}" alt="${nameEn}" onerror="this.style.display='none'">
            <div class="footer-brand-name">${nameEn}</div>
            <p class="footer-brand-desc">${footerDesc}</p>
          </div>
          <div>
            <div class="footer-col-title">${isArF ? 'الصفحات' : 'Pages'}</div>
            <ul class="footer-nav">
              <li><a href="#/" onclick="Router.go('/')">${Lang.t('home')}</a></li>
              <li><a href="#/programs" onclick="Router.go('/programs')">${Lang.t('programs')}</a></li>
              <li><a href="#/books" onclick="Router.go('/books')">${isArF ? 'المكتبة' : 'Library'}</a></li>
              <li><a href="#/about" onclick="Router.go('/about')">${Lang.t('about')}</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-col-title">${Lang.t('contactUs')}</div>
            ${active.length
              ? `<div class="social-bar">${active.map(s => `<a class="social-btn" href="${s.href(soc[s.key].value)}" target="_blank" rel="noopener" title="${Lang.t(s.key)}">${SI[s.key]||'•'}</a>`).join('')}</div>`
              : `<p style="font-size:.8rem;color:var(--warm-dark);">${isArF?'أضف وسائل تواصلك من لوحة التحكم':'Add social links from admin panel.'}</p>`}
          </div>
        </div>
        <div class="footer-bottom">
          <span class="footer-copy">© ${year} ${nameEn} — ${Lang.t('rights')}</span>
          <span class="footer-mark">BAJOZONE</span>
        </div>
      </div>
    </footer>`;
}

/* ── Popup Banner ────────────────────────────── */
function maybeShowPopup() {
  const popup = CMS.s('popup', null);
  if (!popup?.enabled) return;
  // Show once per session
  if (sessionStorage.getItem('bz_popup_shown')) return;
  sessionStorage.setItem('bz_popup_shown', '1');
  const delay = (popup.delay || 2) * 1000;
  setTimeout(() => {
    const msg = Lang.cur === 'ar' ? (popup.message_ar || '') : (popup.message_en || '');
    const img = imgSrc(popup.image || '');
    const el = document.createElement('div');
    el.id = 'bz-popup';
    el.style.cssText = 'position:fixed;inset:0;z-index:8000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.82);backdrop-filter:blur(10px);animation:fadein .4s ease;';
    el.innerHTML = `
      <div style="background:#141414;border:1px solid rgba(255,255,255,.1);max-width:520px;width:100%;position:relative;overflow:hidden;">
        ${img ? `<img src="${img}" style="width:100%;max-height:280px;object-fit:cover;display:block;filter:grayscale(.3);">` : ''}
        <div style="padding:28px 32px 24px;">
          <div style="font-family:var(--ff-mono);font-size:.65rem;letter-spacing:.3em;color:var(--gold);text-transform:uppercase;margin-bottom:12px;">BajoZone</div>
          <div style="color:var(--paper);font-size:1.05rem;line-height:1.8;">${msg}</div>
          <button onclick="document.getElementById('bz-popup').remove()" style="margin-top:22px;background:var(--paper);color:var(--ink);border:none;padding:10px 28px;font-weight:700;cursor:pointer;font-size:.88rem;">${Lang.t('close')} ×</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  }, delay);
}

function maybeShowNewArticleBar() {
  const cfg = CMS.s('new_article_bar', { enabled: true });
  if (cfg?.enabled === false) return;
  if (sessionStorage.getItem('bz_new_bar_closed')) return;
  if (document.getElementById('new-article-bar')) return;
  const article = CMS.list('articles').find(a => a.is_new === true);
  if (!article) return;
  const title = Lang.str({ ar: article.title_ar, en: article.title_en });
  const el = document.createElement('div');
  el.id = 'new-article-bar';
  el.className = 'new-article-bar';
  el.innerHTML = `
    <button type="button" class="new-bar-close" aria-label="${Lang.cur === 'ar' ? 'إغلاق' : 'Close'}">×</button>
    <button type="button" class="new-bar-link">
      <span>${Lang.cur === 'ar' ? 'موضوع جديد' : 'New topic'}</span>
      <strong>${title}</strong>
    </button>`;
  document.body.prepend(el);
  document.body.classList.add('has-new-bar');
  el.querySelector('.new-bar-link')?.addEventListener('click', () => Router.go(`/article/${article.id}`));
  el.querySelector('.new-bar-close')?.addEventListener('click', () => {
    sessionStorage.setItem('bz_new_bar_closed', '1');
    document.body.classList.remove('has-new-bar');
    el.remove();
  });
}

/* ── Ticker text ─────────────────────────────── */
function getTickerText() {
  const custom = Lang.cur === 'ar'
    ? CMS.s('ticker_ar', '')
    : CMS.s('ticker_en', '');
  return custom || Lang.t('ticker_default');
}

function stripHtml(html = '') {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function readingMinutes(a) {
  const explicit = Number(a.read_time || a.reading_time || a.reading_minutes || 0);
  if (explicit > 0) return Math.max(1, Math.round(explicit));
  const content = Lang.str({ ar: a.content_ar, en: a.content_en }, '');
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / (Lang.cur === 'ar' ? 180 : 220)));
}

function readingLabel(a) {
  const n = readingMinutes(a);
  return Lang.cur === 'ar' ? `${n} د قراءة` : `${n} min read`;
}

function levelLabel(a) {
  const raw = String(a.level || a.difficulty || '').toLowerCase();
  const map = {
    beginner: { ar: 'مبتدئ', en: 'Beginner' },
    basic: { ar: 'مبتدئ', en: 'Beginner' },
    intermediate: { ar: 'متوسط', en: 'Intermediate' },
    medium: { ar: 'متوسط', en: 'Intermediate' },
    advanced: { ar: 'متقدم', en: 'Advanced' },
    expert: { ar: 'متخصص', en: 'Expert' },
    specialized: { ar: 'متخصص', en: 'Expert' }
  };
  const value = map[raw] || { ar: 'متوسط', en: 'Intermediate' };
  return Lang.cur === 'ar' ? value.ar : value.en;
}


function parseCallouts(html = '') {
  return String(html)
    .replace(/<p>\s*:::callout\s*<\/p>([\s\S]*?)<p>\s*:::\s*<\/p>/g, (_, body) => {
      const clean = body.trim();
      return `<aside class="article-callout">${clean}</aside>`;
    })
    .replace(/:::callout\s*([\s\S]*?):::/g, (_, body) => {
    const clean = body
      .replace(/^(<br\s*\/?>|\s)+/i, '')
      .replace(/(<br\s*\/?>|\s)+$/i, '')
      .trim();
    return `<aside class="article-callout">${clean}</aside>`;
  });
}

/* ── Book card (grid) ────────────────────────── */
function bkCard(b) {
  const t = Lang.str({ ar: b.title_ar, en: b.title_en });
  const s = Lang.str({ ar: b.subtitle_ar, en: b.subtitle_en });
  let badge = '';
  if (b.amazon_url && b.available) badge = `<div class="amazon-tag"><svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M13.23 10.56v-.45c-.96.1-2.13.16-3.13.16-2.56 0-4.7-.61-4.7-3.08 0-2.51 2.28-3.6 5.46-3.6.95 0 1.97.1 2.93.31l.36.08v-.42c0-1.31-.72-1.97-2.13-1.97-1.18 0-2.08.23-3.08.6l-.36.13-.52-1.6.31-.12c1.21-.47 2.33-.7 3.58-.7 2.53 0 3.93 1.37 3.93 3.81v7.22h-2.65zm0-1.64l-.35-.09c-.65-.16-1.44-.26-2.31-.26-1.67 0-2.77.49-2.77 1.7 0 1.14 1 1.57 2.63 1.57 1 0 1.94-.13 2.8-.37v-2.55zm8.78 4.74c-1.83 1.25-3.75 1.78-5.7 1.78-2.94 0-5.44-1.12-7.37-2.93l-.46-.43.73-.89.44.41c1.74 1.63 3.93 2.59 6.52 2.59 1.64 0 3.26-.43 4.82-1.42l.65-.39.44.73-.47.55z"/></svg> Amazon</div>`;
  else if (b.external_url && b.available) badge = `<div class="amazon-tag" style="background:var(--gold);color:#111;">↓ FREE</div>`;
  return `
    <div class="book-card reveal" onclick="Router.go('/book/${b.id}')" style="cursor:pointer;" role="button" tabindex="0" onkeydown="if(event.key==='Enter')Router.go('/book/${b.id}')">
      <div class="book-cover-wrap">
        ${b.cover
          ? `<img class="book-cover" src="${imgSrc(b.cover)}" alt="${t}" loading="lazy" onerror="this.style.display='none'">`
          : `<div class="book-cover-ph"><span class="icon">📚</span><span class="name">${t}</span></div>`}
        ${badge}
      </div>
      <div class="book-info">
        <h3 class="book-title">${t}</h3>
        <p class="book-sub">${s}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:16px;border-top:1px solid var(--line-s);">
          <span style="font-family:var(--ff-mono);font-size:.68rem;color:var(--warm-dark);">${b.price||''}</span>
          <span style="font-family:var(--ff-mono);font-size:.72rem;color:var(--gold);">${Lang.t('readMore')} →</span>
        </div>
      </div>
    </div>`;
}

/* ── Book single page ────────────────────────── */
function renderBookSingle(id) {
  const b = CMS.list('books').find(x => x.id === id);
  if (!b) { Router.go('/books'); return; }
  const t = Lang.str({ ar: b.title_ar, en: b.title_en });
  const s = Lang.str({ ar: b.subtitle_ar, en: b.subtitle_en });
  const d = Lang.str({ ar: b.description_ar, en: b.description_en });
  let cta = '';
  if (b.amazon_url && b.available) {
    cta = `<a class="book-buy" href="${b.amazon_url}" target="_blank" rel="noopener" onclick="trackBookDownload('${b.id}')" style="display:inline-flex;align-items:center;gap:8px;margin-top:4px;">
      <span class="amz-pill">a</span>${Lang.t('buyNow')}${b.price ? ' — ' + b.price : ''}
    </a>`;
  } else if (b.external_url && b.available) {
    cta = `<a class="book-buy" href="${b.external_url}" target="_blank" rel="noopener" download onclick="trackBookDownload('${b.id}')" style="display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:var(--ink);margin-top:4px;">
      ↓ ${Lang.t('downloadFree')}
    </a>`;
  } else {
    cta = `<span style="color:var(--warm-dark);font-family:var(--ff-mono);font-size:.84rem;">${Lang.t('comingSoon')}</span>`;
  }
  document.getElementById('app').innerHTML = `
    <div style="max-width:900px;margin:0 auto;padding:130px 40px 100px;">
      <div class="art-back" onclick="Router.go('/books')" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:var(--ff-mono);font-size:.72rem;letter-spacing:.12em;color:var(--warm-mid);margin-bottom:36px;transition:color .3s;" onmouseover="this.style.color='var(--paper)'" onmouseout="this.style.color='var(--warm-mid)'">${Lang.t('backBooks')}</div>
      <div style="display:grid;grid-template-columns:280px 1fr;gap:56px;align-items:start;">
        <div style="position:sticky;top:100px;">
          ${b.cover
            ? `<img src="${imgSrc(b.cover)}" alt="${t}" style="width:100%;display:block;filter:grayscale(.3);border:1px solid var(--line);">`
            : `<div style="width:100%;aspect-ratio:2/3;background:linear-gradient(160deg,var(--gold-dim),rgba(255,255,255,.02));display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:.3;border:1px solid var(--line);">📚</div>`}
        </div>
        <div>
          <div class="art-eyebrow">${Lang.t('books')}</div>
          <h1 style="font-family:var(--ff-display);font-size:clamp(1.8rem,4vw,3rem);font-weight:900;color:var(--paper);line-height:1.1;margin-bottom:10px;">${t}</h1>
          <p style="font-size:1rem;color:var(--warm-mid);margin-bottom:28px;line-height:1.6;">${s}</p>
          <div style="border-top:1px solid var(--line);padding-top:28px;margin-bottom:28px;">
            <div style="color:var(--off-white);font-size:1.03rem;line-height:1.95;">${d}</div>
          </div>
          ${b.price ? `<div style="font-family:var(--ff-mono);font-size:1.4rem;color:var(--gold);margin-bottom:20px;">${b.price}</div>` : ''}
          ${cta}
        </div>
      </div>
    </div>`;
}

/* ── Published-only helpers ──────────────────── */
function pubArts()  { return CMS.list('articles').filter(a => a.is_published !== false); }
function pubProgs() { return CMS.list('programs').filter(p => p.is_active   !== false); }

/* ── Program helpers ─────────────────────────── */
function getProgramForArticle(a) {
  if (!a?.program_id) return null;
  return CMS.list('programs').find(p => p.id === a.program_id) || null;
}

function tagChipsHtml(a) {
  if (!Array.isArray(a.tags) || !a.tags.length) return '';
  const allTags = CMS.list('tags');
  return a.tags.map(tid => {
    const tag = allTags.find(t => t.id === tid);
    const name = tag ? tag.name : tid;
    return `<span class="tag-chip" title="${name}">${name}</span>`;
  }).join('');
}

function sourcesAccordionHtml(a) {
  const sources = Array.isArray(a.sources) ? a.sources.filter(s => s && (s.title || s.url)) : [];
  if (!sources.length) return '';
  const isAr = Lang.cur === 'ar';
  const typeLabels = { study:'دراسة', official:'موقع رسمي', report:'تقرير', book:'كتاب', video:'فيديو', article:'مقال' };
  return `<div class="sources-box">
      <button class="sources-toggle" onclick="toggleSources(this)" type="button" aria-expanded="false">
        <span>${isAr ? 'المصادر' : 'Sources'} (${sources.length})</span>
        <span class="sources-arrow">▼</span>
      </button>
      <div class="sources-content" hidden>
        <ul class="sources-list">
          ${sources.map(s => {
            const typeName = s.type ? (isAr ? (typeLabels[s.type] || s.type) : s.type) : '';
            return `<li class="sources-item">
              ${typeName ? `<span class="source-type-badge">${typeName}</span>` : ''}
              ${s.url
                ? `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="source-link">${s.title || s.url}</a>`
                : `<span class="source-title">${s.title || ''}</span>`}
              ${s.accessed ? `<span class="source-date">${isAr ? 'الوصول:' : 'Accessed:'} ${s.accessed}</span>` : ''}
            </li>`;
          }).join('')}
        </ul>
      </div>
    </div>`;
}

window.toggleSources = function(btn) {
  const content = btn.nextElementSibling;
  const arrow = btn.querySelector('.sources-arrow');
  const isOpen = !content.hidden;
  content.hidden = isOpen;
  btn.setAttribute('aria-expanded', String(!isOpen));
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
};

function youtubeEmbedHtml(url) {
  if (!url) return '';
  const m = String(url).match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  if (!m) return '';
  return `<div class="art-video-wrap"><iframe src="https://www.youtube.com/embed/${m[1]}" allowfullscreen loading="lazy" title="Video" frameborder="0"></iframe></div>`;
}

/* ── Article card ────────────────────────────── */
function artCard(a) {
  const t    = Lang.str({ ar: a.title_ar, en: a.title_en });
  const ex   = Lang.str({ ar: a.excerpt_ar, en: a.excerpt_en });
  const prog = getProgramForArticle(a);
  const isAr = Lang.cur === 'ar';
  const progBadge = prog ? `<div class="prog-badge">
      ${prog.logo_url ? `<img src="${imgSrc(prog.logo_url)}" alt="" class="prog-badge-logo" loading="lazy">` : `<span class="prog-badge-initial">${(isAr ? prog.name_ar : (prog.name_en || prog.name_ar)).slice(0,1)}</span>`}
      <span>${isAr ? prog.name_ar : (prog.name_en || prog.name_ar)}</span>
    </div>` : '';
  const tags = tagChipsHtml(a);
  return `
    <article class="card reveal" onclick="Router.go('/article/${a.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')Router.go('/article/${a.id}')">
      ${a.image
        ? `<img class="card-thumb" src="${imgSrc(a.image)}" alt="${t}" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="card-thumb-ph">✍</div>`}
      <div class="card-body">
        ${progBadge}
        <h3 class="card-title">${t}</h3>
        <div class="card-meta-line">
          <span>${readingLabel(a)}</span>
          <span>${levelLabel(a)}</span>
        </div>
        <p class="card-excerpt">${ex}</p>
        ${tags ? `<div class="card-tags">${tags}</div>` : ''}
        <div class="card-foot">
          <span class="card-date">${fmtDate(a.date)}</span>
          <div class="card-arrow">→</div>
        </div>
      </div>
    </article>`;
}

/* ── HERO CINEMA V3 ─────────────────────────────── */
function initHeroCinema() {
  const wrapper = document.getElementById('hc-wrapper');
  if (!wrapper) return;
  const hero = document.getElementById('hero-cinema');
  const videos = [...wrapper.querySelectorAll('[data-hc-video]')];
  const copies = [...wrapper.querySelectorAll('[data-hc-copy]')];
  const progressFill = document.getElementById('hc-progress-fill');
  const progressText = document.getElementById('hc-progress-text');
  const sceneLabel = document.getElementById('hc-scene-label');
  const hint = document.getElementById('hc-scroll-hint');
  const zoneCount = videos.length;
  let activeVideoIndex = 0;
  let sceneProgress = 0;
  let targetProgress = 0;
  let lastScrollProgress = 0;
  let scrollOverrideUntil = 0;

  videos.forEach((video, vIdx) => {
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    if (vIdx === 0) video.setAttribute('preload', 'auto');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.load();
    video.addEventListener('loadedmetadata', () => {
      const target = Number(video.dataset.targetTime || 0);
      if (Number.isFinite(target)) video.currentTime = target;
    }, { once: true });
    video.addEventListener('loadeddata', () => {
      if (!video.dataset.targetTime) video.currentTime = 0.001;
    }, { once: true });
    video.addEventListener('ended', () => {
      const videoIdx = videos.indexOf(video);
      if (videoIdx !== activeVideoIndex) return;
      const nextIndex = (videoIdx + 1) % zoneCount;
      targetProgress = nextIndex / zoneCount;
      sceneProgress = targetProgress;
      updateScene(sceneProgress);
      setActiveVideo(nextIndex);
    });
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => value * value * (3 - 2 * value);
  const fadeWidth = 0.085;

  const setVideoTarget = (video, localProgress) => {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const safeTime = duration > 0 ? clamp(localProgress, 0, 1) * Math.max(duration - 0.04, 0) : 0;
    video.dataset.targetTime = String(safeTime);
  };

  const setActiveVideo = index => {
    activeVideoIndex = index;
    videos.forEach((video, i) => {
      if (i === index) {
        if (video.ended || video.currentTime >= Math.max((video.duration || 0) - 0.05, 0)) video.currentTime = 0.001;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  let scrubRaf = 0;
  const smoothVideoTick = () => {
    videos.forEach((video, index) => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!duration) return;
      const target = Number(video.dataset.targetTime || 0);
      if (!Number.isFinite(target)) return;
      const diff = target - video.currentTime;
      const isActive = index === activeVideoIndex;
      const shouldScrub = isActive && performance.now() < scrollOverrideUntil;

      if (shouldScrub && Math.abs(diff) > 1.15) {
        video.currentTime = target;
      } else if (shouldScrub && Math.abs(diff) > 0.006) {
        const viscosity = 0.18;
        video.currentTime += diff * viscosity;
      }

      if (isActive && video.paused) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
      }
    });
    scrubRaf = requestAnimationFrame(smoothVideoTick);
  };
  scrubRaf = requestAnimationFrame(smoothVideoTick);

  const updateScene = progress => {
    progress = clamp(progress, 0, 1);
    const percent = Math.round(progress * 100);
    const activeIndex = clamp(Math.floor(progress * zoneCount), 0, zoneCount - 1);

    if (activeIndex !== activeVideoIndex) {
      setActiveVideo(activeIndex);
    }

    if (progressFill) progressFill.style.transform = `scaleX(${progress})`;
    if (progressText) progressText.textContent = `${String(percent).padStart(2, '0')}%`;
    if (sceneLabel) sceneLabel.textContent = `${String(activeIndex + 1).padStart(2,'0')} / 05`;
    if (hint) hint.style.opacity = progress > 0.025 ? '0' : '1';

    videos.forEach((video, index) => {
      const start = index / zoneCount;
      const end = (index + 1) / zoneCount;
      const local = clamp((progress - start) / (end - start), 0, 1);
      const fadeIn = smoothstep(clamp((progress - (start - fadeWidth)) / fadeWidth, 0, 1));
      const fadeOut = smoothstep(clamp(((end + fadeWidth) - progress) / fadeWidth, 0, 1));
      const opacity = index === 0 && progress <= fadeWidth ? 1 : Math.min(fadeIn, fadeOut);

      video.style.opacity = opacity.toFixed(4);
      video.style.zIndex = String(index === activeIndex ? 3 : 2);
      if (opacity > 0.01) {
        setVideoTarget(video, local);
      }
    });

    copies.forEach((copy, index) => {
      copy.classList.toggle('is-active', index === activeIndex);
    });
  };

  const autoplayTick = () => {
    const now = performance.now();
    const isScrollDriving = now < scrollOverrideUntil;
    if (!isScrollDriving) {
      const activeVideo = videos[activeVideoIndex];
      const duration = Number.isFinite(activeVideo?.duration) ? activeVideo.duration : 0;
      if (duration > 0) {
        const localProgress = clamp(activeVideo.currentTime / duration, 0, 1);
        targetProgress = clamp((activeVideoIndex + localProgress) / zoneCount, 0, 0.9999);
      } else {
        targetProgress += 0.00034;
        if (targetProgress > 1) targetProgress = 0;
      }
    }
    sceneProgress += (targetProgress - sceneProgress) * (isScrollDriving ? 0.16 : 0.28);
    if (Math.abs(targetProgress - sceneProgress) < 0.0003) sceneProgress = targetProgress;
    updateScene(sceneProgress);
    requestAnimationFrame(autoplayTick);
  };

  const updateMouse = e => {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const px = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const py = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const mx = px - 0.5;
    const my = py - 0.5;
    hero.style.setProperty('--hc-mx', mx.toFixed(4));
    hero.style.setProperty('--hc-my', my.toFixed(4));
    hero.style.setProperty('--hc-pointer-x', `${px * 100}%`);
    hero.style.setProperty('--hc-pointer-y', `${py * 100}%`);
  };
  hero?.addEventListener('pointermove', updateMouse);
  hero?.addEventListener('pointerleave', () => {
    hero.style.setProperty('--hc-mx', '0');
    hero.style.setProperty('--hc-my', '0');
    hero.style.setProperty('--hc-pointer-x', '50%');
    hero.style.setProperty('--hc-pointer-y', '50%');
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.getAll().forEach(t => {
      if (t.vars && t.vars.id === 'hero-cinema-scroll') t.kill();
    });

    const state = { progress: 0 };
    gsap.to(state, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
      id: 'hero-cinema-scroll',
      trigger: '#hc-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      invalidateOnRefresh: true
    },
    onUpdate() {
      if (Math.abs(state.progress - lastScrollProgress) > 0.0002) {
        targetProgress = state.progress;
        scrollOverrideUntil = performance.now() + 90;
        lastScrollProgress = state.progress;
      }
    }
  });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  } else {
    console.warn('GSAP/ScrollTrigger not loaded; using vanilla hero scrub fallback.');
    let raf = 0;
    const updateFromScroll = () => {
      raf = 0;
      const rect = wrapper.getBoundingClientRect();
      const max = Math.max(1, rect.height - window.innerHeight);
      const progress = clamp(-rect.top / max, 0, 1);
      if (Math.abs(progress - lastScrollProgress) > 0.0002) {
        targetProgress = progress;
        scrollOverrideUntil = performance.now() + 90;
        lastScrollProgress = progress;
      }
    };
    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(updateFromScroll);
    };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    requestUpdate();
  }

  updateScene(0);
  setActiveVideo(0);
  autoplayTick();
}

function initVideoDividers() {
  const dividers = [...document.querySelectorAll('[data-video-divider]')];
  if (!dividers.length) return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  dividers.forEach((divider, index) => {
    const video = divider.querySelector('[data-divider-video]');
    const sticky = divider.querySelector('.vd-sticky');
    const copy = divider.querySelector('.vd-copy');
    if (!video || !sticky) return;

    video.muted = true;
    video.playsInline = true;
    video.autoplay = false;
    video.loop = false;
    video.disablePictureInPicture = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');
    video.load();
    let visibleEnough = false;

    const playDivider = () => {
      if (!visibleEnough || divider.classList.contains('missing-video')) return;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration && video.currentTime >= duration - 0.08) {
        try { video.currentTime = 0.02; } catch (_) {}
      }
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    };

    const pauseDivider = () => {
      if (!video.paused) video.pause();
    };

    const render = progress => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!duration) {
        video.dataset.pendingProgress = String(progress);
        sticky.style.setProperty('--vd-progress', progress.toFixed(4));
        sticky.style.setProperty('--vd-opacity', '0');
        return;
      }
      const opacity = Math.min(1, Math.max(0, Math.sin(progress * Math.PI) * 1.35));
      visibleEnough = opacity > 0.22;
      sticky.style.setProperty('--vd-progress', progress.toFixed(4));
      sticky.style.setProperty('--vd-opacity', opacity.toFixed(4));
      if (copy) copy.style.opacity = String(Math.min(1, Math.max(0, Math.sin(progress * Math.PI))));
      if (copy) copy.style.transform = `translate3d(0, ${Math.cos(progress * Math.PI) * 18}px, 0)`;
      if (visibleEnough) playDivider();
      else pauseDivider();
    };

    video.addEventListener('loadedmetadata', () => {
      divider.classList.add('has-video');
      try { video.currentTime = 0.02; } catch (_) {}
      render(Number(video.dataset.pendingProgress || 0));
    }, { once: true });
    video.addEventListener('canplay', () => {
      render(Number(video.dataset.pendingProgress || 0));
    }, { once: true });
    video.addEventListener('error', () => {
      divider.classList.add('missing-video');
      sticky.style.setProperty('--vd-opacity', '0');
    }, { once: true });
    video.addEventListener('ended', () => {
      if (visibleEnough) {
        try { video.currentTime = Math.max(0, video.duration - 0.05); } catch (_) {}
      }
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        visibleEnough = entry.isIntersecting && entry.intersectionRatio > 0.28;
        if (visibleEnough) playDivider();
        else pauseDivider();
      });
    }, { threshold: [0, .15, .28, .45, .7] });
    observer.observe(divider);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars && trigger.vars.id === `video-divider-${index}`) trigger.kill();
      });

      const state = { progress: 0 };
      gsap.to(state, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          id: `video-divider-${index}`,
          trigger: divider,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true
        },
        onUpdate() { render(state.progress); }
      });
    } else {
      let raf = 0;
      const update = () => {
        raf = 0;
        const rect = divider.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        render(clamp((vh - rect.top) / (vh + rect.height), 0, 1));
      };
      const request = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', request, { passive: true });
      request();
    }
  });

  if (typeof ScrollTrigger !== 'undefined') requestAnimationFrame(() => ScrollTrigger.refresh());
}

function videoDivider({ file, label, text }) {
  return `
    <section class="video-divider" data-video-divider>
      <div class="vd-sticky">
        <video class="vd-video" data-divider-video src="assets/videos/${file}" muted playsinline preload="auto"></video>
        <div class="vd-vignette" aria-hidden="true"></div>
        <div class="vd-copy" dir="rtl" aria-hidden="true">
          <span>${label}</span>
          <strong>${text}</strong>
        </div>
      </div>
    </section>`;
}

function initTopicsSplit(featuredCount, latestCount) {
  let fIdx = 0;
  let lIdx = 0;
  let fTimer, lTimer;

  function resetFTimer() {
    clearInterval(fTimer);
    if (featuredCount > 1) fTimer = setInterval(() => setFeatured((fIdx + 1) % featuredCount), 5000);
  }

  function setFeatured(i) {
    fIdx = (i + featuredCount) % featuredCount;
    document.querySelectorAll('#featured-cycle .featured-cycle-item').forEach((el, idx) => {
      el.classList.toggle('fci-active', idx === fIdx);
    });
    document.querySelectorAll('#featured-dots .fdot').forEach((el, idx) => {
      el.classList.toggle('fdot-active', idx === fIdx);
    });
  }

  function setLatest(i) {
    lIdx = i;
    document.querySelectorAll('#latest-list .latest-item').forEach((el, idx) => {
      el.classList.toggle('li-active', idx === i);
    });
  }

  window.setFeaturedIdx = setFeatured;

  // Dot clicks
  document.querySelectorAll('#featured-dots .fdot').forEach(btn => {
    btn.addEventListener('click', () => { setFeatured(+btn.dataset.fi); resetFTimer(); });
  });

  // Arrow buttons
  document.getElementById('featured-prev')?.addEventListener('click', () => { setFeatured(fIdx - 1); resetFTimer(); });
  document.getElementById('featured-next')?.addEventListener('click', () => { setFeatured(fIdx + 1); resetFTimer(); });

  // Mouse drag + touch swipe on featured wrap
  const wrap = document.getElementById('featured-cycle');
  if (wrap) {
    let dragX = null;
    const onStart = x => { dragX = x; };
    const onEnd = x => {
      if (dragX === null) return;
      const delta = dragX - x;
      if (Math.abs(delta) > 44) { setFeatured(delta > 0 ? fIdx + 1 : fIdx - 1); resetFTimer(); }
      dragX = null;
    };
    wrap.addEventListener('mousedown',  e => onStart(e.clientX));
    wrap.addEventListener('mouseup',    e => onEnd(e.clientX));
    wrap.addEventListener('mouseleave', () => { dragX = null; });
    wrap.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive: true });
    wrap.addEventListener('touchend',   e => onEnd(e.changedTouches[0].clientX), { passive: true });
  }

  resetFTimer();
  if (latestCount > 1) {
    lTimer = setInterval(() => setLatest((lIdx + 1) % latestCount), 3200);
  }
}

function renderHomeStory() {
  const isAr = Lang.cur === 'ar';
  const articles = pubArts();
  const featured = articles.filter(a => a.featured).slice(0, 3);
  const latest   = articles.slice(0, 6);

  const heroScenes = [
    {
      video: 'public/media/hero/01-hidden-talent.mp4',
      poster: 'public/media/hero/01-hidden-talent-poster.png',
      title: isAr ? 'كل موهبة تستحق أن تُرى' : 'Every Talent Deserves To Be Seen',
      sub: isAr
        ? 'باجو زون مساحة لفهم اكتشاف المواهب الكروية وتطويرها بعيدًا عن الصدفة والانطباع السريع '
        : 'BajoZone is a space for understanding football talent identification and development beyond chance and first impressions.'
    },
    {
      video: 'public/media/hero/02-scout-eye.mp4',
      poster: 'public/media/hero/02-scout-eye-poster.png',
      title: isAr ? 'بين العين والدفتر تبدأ الحكاية' : 'Between the Eye and the Notebook',
      sub: isAr
        ? 'الملاحظة الميدانية، حضور المباريات، وكتابة التقارير جزء أساسي من فهم اللاعب قبل الحكم عليه'
        : 'Field observation, attending matches, and writing reports are essential to understanding a player before judging them.'
    },
    {
      video: 'public/media/hero/03-data.mp4',
      poster: 'public/media/hero/03-data-poster.png',
      title: isAr ? 'الحدس يرى… والبيانات تفسّر' : 'Intuition Sees… Data Interprets',
      sub: isAr
        ? 'نقرأ اللاعب من خلال الأداء، الحركة، اللقطات، المؤشرات، والسياق الذي تظهر فيه الموهبة'
        : 'We read the player through performance, movement, moments, indicators, and the context where talent appears.'
    },
    {
      video: 'public/media/hero/04-multidimensional.mp4',
      poster: 'public/media/hero/04-multidimensional-poster.png',
      title: isAr ? 'الموهبة لا تُقاس من زاوية واحدة' : 'Talent Cannot Be Measured From One Angle',
      sub: isAr
        ? 'التكتيك، المهارة، البدن، الذهن، النفس، والبيئة الاجتماعية… كلها تصنع صورة اللاعب'
        : 'Tactics, skill, physical, mental, psychological, and social environment all combine to build the player\'s picture.'
    },
    {
      video: 'public/media/hero/05-knowledge.mp4',
      poster: 'public/media/hero/05-knowledge-poster.png',
      title: isAr ? 'من رفوف المعرفة إلى فهم الموهبة' : 'From Sources to Arabic Content',
      sub: isAr
        ? 'نبحث في الكتب، الدراسات، التقارير، والمصادر الأكاديمية لنستخرج منها موضوعات تساعد على فهم اكتشاف المواهب الكروية وتطويرها، ونقدّمها لك كخلاصة واضحة قابلة للفهم والتطبيق'
        : 'We read studies, review models, and transform knowledge into content serving players, coaches, scouts, and parents.'
    }
  ];

  const libraryCards = isAr ? [
    'دراسات علمية', 'كتب وتقارير', 'إحصائيات', 'نماذج عالمية', 'أدوات قياس', 'مصادر عربية'
  ] : [
    'Scientific Studies', 'Books & Reports', 'Statistics', 'Global Models', 'Assessment Tools', 'Arabic Sources'
  ];

  document.getElementById('app').innerHTML = `
    <div id="hc-wrapper">
      <div id="hero-cinema" style="--hc-mx:0;--hc-my:0;--hc-pointer-x:50%;--hc-pointer-y:50%;">
        <div class="hc-video-stack" aria-hidden="true">
          ${heroScenes.map((s, i) => `<video class="hc-video" data-hc-video
            src="${s.video}"
            poster="${s.poster}"
            ${i === 0 ? 'autoplay preload="auto"' : 'preload="none"'}
            muted playsinline></video>`).join('')}
        </div>
        <div class="hc-vignette" aria-hidden="true"></div>
        <div class="hc-grain" aria-hidden="true"></div>
        <div class="hc-right-gradient" aria-hidden="true"></div>
        <div class="hc-brand-mark">BAJOZONE</div>
        <div class="hc-copy-wrap" dir="${isAr ? 'rtl' : 'ltr'}">
          ${heroScenes.map((s, i) => `
            <article class="hc-copy ${i === 0 ? 'is-active' : ''}" data-hc-copy>
              <span class="hc-label">${String(i + 1).padStart(2,'0')} / 05</span>
              <h1 class="hc-h1">${s.title}</h1>
              <p class="hc-sub">${s.sub}</p>
            </article>`).join('')}
        </div>
        <div class="hc-hud" aria-hidden="true">
          <span id="hc-scene-label">01 / 05</span>
          <span id="hc-progress-text">00%</span>
        </div>
        <div class="hc-progress-bar"><div id="hc-progress-fill"></div></div>
        <div class="hc-scroll-hint" id="hc-scroll-hint" aria-hidden="true">
          <span>${isAr ? 'مرر' : 'SCROLL'}</span>
          <div class="hc-scroll-line"></div>
        </div>
      </div>
    </div>

    <div class="home-transition-line">
      <div class="htl-inner reveal"></div>
    </div>

    <section class="home-intro-section" aria-label="${isAr ? 'عن باجو زون' : 'About BajoZone'}">
      <div class="container">
        <div class="home-intro-content reveal">
          <div class="section-label">${isAr ? 'من نحن' : 'About'}</div>
          <h2 class="home-intro-title">
            ${isAr
              ? '<span class="gold-text">باجوزون</span> .. نناقش <span class="gold-text">الموهبة الكروية</span> بعمق'
              : '<span class="gold-text">BajoZone</span> .. We Discuss <span class="gold-text">Football Talent</span> In Depth'}
          </h2>
          <p class="home-intro-text">
            ${isAr
              ? 'مساحة شخصية تجمع بين البحث، التجربة، والتحليل لمناقشة قضايا اكتشاف المواهب وتطويرها، وتقديمها كمحتوى واضح يخدم المهتمين بكرة القدم.'
              : 'A personal space that combines research, experience, and analysis to discuss talent identification and development, presented as clear content for football enthusiasts.'}
          </p>
        </div>
      </div>
    </section>

    <section class="home-topics-split" id="home-topics-split">
      <div class="container">
        <div class="topics-split-wrap">

          <!-- Featured cycling -->
          <div class="topics-col">
            <div class="topics-col-head reveal">
              <div class="section-label">${isAr ? 'مختارات' : 'Featured'}</div>
              <h2 class="topics-col-title">${isAr ? 'مواضيع مميزة' : 'Featured Topics'}</h2>
            </div>
            <div class="featured-cycle-wrap" id="featured-cycle">
              ${featured.length ? featured.map((a, i) => {
                const prog = getProgramForArticle(a);
                const t = Lang.str({ ar: a.title_ar, en: a.title_en });
                const ex = Lang.str({ ar: a.excerpt_ar, en: a.excerpt_en });
                const progName = prog ? (isAr ? prog.name_ar : (prog.name_en || prog.name_ar)) : '';
                const progIdHtml = prog ? `<div class="fci-prog-id">
                  ${prog.logo_url
                    ? `<img src="${imgSrc(prog.logo_url)}" alt="${progName}" class="fci-prog-logo">`
                    : `<div class="fci-prog-initial">${progName.slice(0,1)}</div>`}
                  <span class="fci-prog-name">${progName}</span>
                </div>` : '';
                return `<div class="featured-cycle-item${i===0?' fci-active':''}" data-fci="${i}" onclick="Router.go('/article/${a.id}')">
                  ${a.image ? `<img class="fci-img" src="${imgSrc(a.image)}" alt="${t}" loading="lazy">` : '<div class="fci-img-ph"></div>'}
                  <div class="fci-body">
                    ${progIdHtml}
                    <h3 class="fci-title">${t}</h3>
                    <p class="fci-excerpt">${ex}</p>
                    <div class="fci-foot">
                      <span class="card-date">${fmtDate(a.date)}</span>
                    </div>
                  </div>
                </div>`;
              }).join('') : `<div class="empty-state">${Lang.t('noTopics')}</div>`}
            </div>
            ${featured.length > 1 ? `<div class="featured-nav" id="featured-nav">
              <button class="fci-arrow-btn" id="featured-prev" aria-label="${isAr?'السابق':'Previous'}">←</button>
              <div class="featured-dots" id="featured-dots">
                ${featured.map((_, i) => `<button class="fdot${i===0?' fdot-active':''}" data-fi="${i}" aria-label="${i+1}">${String(i+1).padStart(2,'0')}</button>`).join('')}
              </div>
              <button class="fci-arrow-btn" id="featured-next" aria-label="${isAr?'التالي':'Next'}">→</button>
            </div>` : ''}
          </div>

          <div class="topics-split-divider" aria-hidden="true"></div>

          <!-- Latest cycling list -->
          <div class="topics-col">
            <div class="topics-col-head reveal">
              <div class="section-label">${Lang.t('programs')}</div>
              <h2 class="topics-col-title">${Lang.t('latestTopics')}</h2>
            </div>
            <div class="latest-list" id="latest-list">
              ${latest.length ? latest.map((a, i) => {
                const prog = getProgramForArticle(a);
                const t = Lang.str({ ar: a.title_ar, en: a.title_en });
                const initial = prog ? (isAr ? prog.name_ar : (prog.name_en || prog.name_ar)).slice(0, 1) : '؟';
                const logoHtml = prog?.logo_url
                  ? `<img src="${imgSrc(prog.logo_url)}" alt="">`
                  : `<div class="li-prog-initial">${initial}</div>`;
                return `<div class="latest-item${i===0?' li-active':''}" data-li="${i}" onclick="Router.go('/article/${a.id}')">
                  <div class="li-prog-logo">${logoHtml}</div>
                  <div class="li-body">
                    <div class="li-title">${t}</div>
                    <div class="li-meta"><span class="card-date">${fmtDate(a.date)}</span></div>
                  </div>
                  <div class="li-arrow">←</div>
                </div>`;
              }).join('') : `<div class="empty-state">${Lang.t('noTopics')}</div>`}
            </div>
          </div>

        </div>
        <div class="topics-split-footer reveal">
          <a class="btn btn-ghost" href="#/programs" onclick="Router.go('/programs')">${Lang.t('viewAll')}</a>
        </div>
      </div>
    </section>

    <section class="home-cta-section" id="home-about-cta">
      <div class="container">
        <div class="home-cta-card reveal">
          <div class="home-cta-bg" aria-hidden="true"></div>
          <div class="home-cta-content">
            <div class="section-label">${isAr ? 'تعرف علي' : 'About'}</div>
            <h2 class="home-cta-title">${isAr
              ? 'هل تهتم باكتشاف المواهب وتطويرها؟'
              : 'Interested in Talent Identification and Development?'}</h2>
            <p class="home-cta-text">${isAr
              ? 'هنا أشارك قراءاتي، أبحاثي، برامجي، وتجاربي الشخصية في كرة القدم. ولمن يريد معرفة من يقف خلف باجو زون، يمكنه زيارة صفحة التعريف.'
              : 'Here I share my readings, research, programs, and personal experiences in football. Visit the about page to know who stands behind BajoZone.'}</p>
            <a class="btn btn-fill" href="#/about" onclick="Router.go('/about')">${isAr ? 'تعرف علي' : 'About Me'}</a>
          </div>
        </div>
      </div>
    </section>`;

  initHeroCinema();
  initReveal();
  initTopicsSplit(featured.length, latest.length);
  maybeShowPopup();

  // Animate the gold transition line on scroll-into-view
  const htlLine = document.querySelector('.htl-inner');
  if (htlLine) {
    const htlObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { htlLine.classList.add('htl-visible'); htlObs.disconnect(); }
    }, { threshold: 0.5 });
    htlObs.observe(htlLine);
  }

  updatePageMeta(
    `${Lang.t('home')} — ${CMS.s('site_name_en', 'BajoZone')}`,
    isAr ? CMS.s('tagline_ar', 'منصة عربية لاكتشاف وتطوير المواهب الكروية.') : CMS.s('tagline_en', 'A football talent identification and development platform.'),
    CMS.s('logo', 'assets/images/logo-bajo.png'),
    location.origin + location.pathname + '#/'
  );
}

/* /articles redirects to /programs for backward compat */
function renderArticles() {
  renderPrograms();
}

/* ── PROGRAMS PAGE ───────────────────────────── */
function renderPrograms() {
  const isAr = Lang.cur === 'ar';
  const programs = pubProgs().sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
  const arts = pubArts();

  document.getElementById('app').innerHTML = `
    <div class="programs-page">
      <div class="page-header"><div class="container">
        <div class="section-label">BAJOZONE</div>
        <h1 class="section-title">${isAr ? 'البرامج' : 'Programs'}</h1>
        <p class="programs-page-sub">${isAr
          ? 'كل برنامج زاوية مختلفة لفهم كرة القدم، الموهبة، والتطوير.'
          : 'Each program is a different angle on football, talent, and development.'}</p>
      </div></div>

      ${buildTickerHtml(arts, programs, isAr)}

      <section class="programs-grid-section">
        <div class="container">
          ${programs.length
            ? `<div class="programs-grid" id="programs-grid">
                ${programs.map(p => programCardHtml(p, isAr, arts)).join('')}
               </div>`
            : `<div class="empty-state">${isAr ? 'لا توجد برامج حتى الآن' : 'No programs yet'}</div>`}
        </div>
      </section>

      <section class="program-topics-section" id="program-topics-section">
        <div class="container">
          <div id="program-topics-header"></div>
          <div id="program-topics-grid" class="cards-grid"></div>
        </div>
      </section>
    </div>`;

  window._activeProgramId = null;
  window._programsArts = arts;
  window._programsList = programs;

  updateProgramTopics(null, isAr);

  document.querySelectorAll('.program-card').forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.dataset.programId;
      const newPid = pid === window._activeProgramId ? null : pid;
      document.querySelectorAll('.program-card').forEach(c => c.classList.remove('active'));
      if (newPid) card.classList.add('active');
      window._activeProgramId = newPid;
      updateProgramTopics(newPid, Lang.cur === 'ar');
    });
  });

  initReveal();
  updatePageMeta(
    `${isAr ? 'البرامج' : 'Programs'} — ${CMS.s('site_name_en', 'BajoZone')}`,
    isAr
      ? 'برامج باجو زون المعرفية في كرة القدم، الموهبة، واكتشاف المواهب وتطويرها.'
      : 'BajoZone knowledge programs on football, talent identification, and player development.',
    CMS.s('logo', 'assets/images/logo-bajo.png'),
    location.origin + location.pathname + '#/programs'
  );
}

function buildTickerHtml(arts, programs, isAr) {
  const sorted = [...arts].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 10);
  if (!sorted.length) return '';
  function tickerItem(a) {
    const prog = programs.find(p => p.id === a.program_id);
    const title = (isAr ? a.title_ar : a.title_en) || a.title_ar || '';
    const initial = prog ? (isAr ? prog.name_ar : (prog.name_en || prog.name_ar)).slice(0, 1) : '؟';
    const logoHtml = prog?.logo_url
      ? `<img class="ticker-prog-logo" src="${imgSrc(prog.logo_url)}" alt="">`
      : `<span class="ticker-prog-initial">${initial}</span>`;
    return `<span class="ticker-item" onclick="Router.go('/article/${a.id}')" role="link" tabindex="0" onkeydown="if(event.key==='Enter')Router.go('/article/${a.id}')">${logoHtml}<span class="ticker-title">${title}</span></span><span class="ticker-dot" aria-hidden="true"></span>`;
  }
  const items = sorted.map(tickerItem).join('');
  return `<div class="topics-ticker">
    <div class="ticker-label">${isAr ? 'آخر المواضيع' : 'Latest'}</div>
    <div class="ticker-track-wrap">
      <div class="ticker-track">${items}${items}</div>
    </div>
  </div>`;
}

function programCardHtml(p, isAr, arts) {
  const name  = isAr ? p.name_ar : (p.name_en || p.name_ar);
  const desc  = isAr ? (p.short_description_ar || p.description_ar || '') : (p.short_description_en || p.description_en || '');
  const count = (arts || CMS.list('articles')).filter(a => a.program_id === p.id).length;
  const initial = name.slice(0, 1);
  const countLabel = isAr ? `${count} موضوع` : `${count} topic${count !== 1 ? 's' : ''}`;
  return `
    <div class="program-card" data-program-id="${p.id}" role="button" tabindex="0"
      onkeydown="if(event.key==='Enter')this.click()"
      style="${p.accent_color ? `--prog-accent:${p.accent_color}` : ''}">
      <div class="prog-card-base">
        <div class="prog-card-logo">
          ${p.logo_url
            ? `<img src="${imgSrc(p.logo_url)}" alt="${name}" loading="lazy">`
            : `<div class="prog-card-initial">${initial}</div>`}
        </div>
        <div class="prog-card-name">${name}</div>
        <div class="prog-card-count">${countLabel}</div>
      </div>
      <div class="prog-card-overlay">
        <div class="prog-overlay-name">${name}</div>
        <p class="prog-overlay-desc">${desc}</p>
        <div class="prog-overlay-cta">${isAr ? '← عرض المواضيع' : 'View Topics →'}</div>
      </div>
    </div>`;
}

function updateProgramTopics(programId, isAr) {
  const arts     = window._programsArts || pubArts();
  const programs = window._programsList || pubProgs();
  const program  = programId ? programs.find(p => p.id === programId) : null;
  const filtered = programId ? arts.filter(a => a.program_id === programId) : arts;

  const header = document.getElementById('program-topics-header');
  const grid   = document.getElementById('program-topics-grid');
  if (!header || !grid) return;

  if (program) {
    const name = isAr ? program.name_ar : (program.name_en || program.name_ar);
    const desc = isAr ? (program.description_ar || '') : (program.description_en || '');
    const initial = name.slice(0, 1);
    header.innerHTML = `
      <div class="program-selected-info reveal">
        <div class="program-selected-logo">
          ${program.logo_url
            ? `<img src="${imgSrc(program.logo_url)}" alt="${name}" loading="lazy">`
            : `<div class="program-logo-ph lg"><span>${initial}</span></div>`}
        </div>
        <div class="program-selected-text">
          <div class="section-label">${isAr ? 'برنامج' : 'Program'}</div>
          <h2 class="program-selected-name">${name}</h2>
          <p class="program-selected-desc">${desc}</p>
        </div>
      </div>
      <div class="program-topics-title-row">
        <h3>${isAr ? 'مواضيع البرنامج' : 'Program Topics'}</h3>
        <button class="program-clear-btn" onclick="clearProgramSelection()">
          ${isAr ? 'عرض كل المواضيع' : 'Show all topics'}
        </button>
      </div>`;
  } else {
    header.innerHTML = `
      <div class="section-header reveal" style="margin-bottom:32px;">
        <div>
          <div class="section-label">${isAr ? 'المواضيع' : 'Topics'}</div>
          <h2 class="section-title">${isAr ? 'أحدث المواضيع' : 'Latest Topics'}</h2>
        </div>
      </div>`;
  }

  grid.innerHTML = filtered.length
    ? filtered.map(a => artCard(a)).join('')
    : `<div class="empty-state" style="grid-column:1/-1;">${isAr ? 'لا توجد مواضيع في هذا البرنامج حتى الآن.' : 'No topics published in this program yet.'}</div>`;

  initReveal();
  if (programId) {
    document.getElementById('program-topics-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

window.clearProgramSelection = function() {
  document.querySelectorAll('.program-card').forEach(c => c.classList.remove('active'));
  window._activeProgramId = null;
  updateProgramTopics(null, Lang.cur === 'ar');
};

window.filterArts = function(catId, btn) {
  window._artCat = catId;
  document.querySelectorAll('#filter-bar .filter-btn').forEach(b => b.classList.toggle('on', b === btn));
  applyArticleFilters();
};

function articleSearchText(a) {
  return [
    a.title_ar, a.title_en, a.excerpt_ar, a.excerpt_en, a.content_ar, a.content_en,
    a.keywords_ar, a.keywords_en,
    Array.isArray(a.keywords) ? a.keywords.join(' ') : ''
  ].filter(Boolean).join(' ').replace(/<[^>]+>/g, ' ').toLowerCase();
}

function applyArticleFilters() {
  const arts = window._artCache || pubArts();
  const q = (document.getElementById('article-search')?.value || '').trim().toLowerCase();
  const fil = arts.filter(a => {
    return !q || articleSearchText(a).includes(q);
  });
  const g = document.getElementById('art-grid');
  if (g) { g.innerHTML = fil.length ? fil.map(a => artCard(a)).join('') : `<div class="empty-state">${Lang.t('noArticles')}</div>`; initReveal(); }
}

/* ── ARTICLE SINGLE ──────────────────────────── */
function renderArticleSingle(id) {
  const a = CMS.list('articles').find(x => x.id === id || x.slug === id);
  if (!a || a.is_published === false) { Router.go('/programs'); return; }
  const isAr = Lang.cur === 'ar';
  const t   = Lang.str({ ar: a.title_ar, en: a.title_en });
  const con = parseCallouts(Lang.str({ ar: a.content_ar, en: a.content_en }));
  const titleArg = jsArg(t);
  const prog = getProgramForArticle(a);

  // Related: program > shared tags > same category > recent
  const others = CMS.list('articles').filter(x => x.id !== a.id);
  const byProg = prog ? others.filter(x => x.program_id === prog.id) : [];
  const byTags = Array.isArray(a.tags) && a.tags.length
    ? others.filter(x => Array.isArray(x.tags) && x.tags.some(t => a.tags.includes(t)))
    : [];
  const seen = new Set();
  const related = [...byProg, ...byTags, ...others].filter(x => {
    if (seen.has(x.id)) return false;
    seen.add(x.id); return true;
  }).slice(0, 3);

  Stats.recordArticleView(a.id);
  const views = Stats.data.articleViews[a.id] || 1;

  const progBanner = prog ? `
    <div class="art-program-banner" onclick="Router.go('/programs')" style="cursor:pointer;" title="${isAr ? 'فتح البرنامج' : 'Open program'}">
      ${prog.logo_url
        ? `<img src="${imgSrc(prog.logo_url)}" alt="" class="art-prog-logo" loading="lazy">`
        : `<div class="art-prog-logo-ph">${(isAr ? prog.name_ar : (prog.name_en || prog.name_ar)).slice(0,1)}</div>`}
      <div class="art-prog-info">
        <span class="art-prog-label">${isAr ? 'برنامج' : 'Program'}</span>
        <span class="art-prog-name">${isAr ? prog.name_ar : (prog.name_en || prog.name_ar)}</span>
      </div>
      <span class="art-prog-arrow">←</span>
    </div>` : '';

  const tags = tagChipsHtml(a);

  document.getElementById('app').innerHTML = `
    <div class="article-page">
      <div class="art-back" onclick="Router.go('/programs')">${Lang.t('back')}</div>
      ${progBanner}
      <h1 class="art-h1">${t}</h1>
      <div class="article-detail-panel">
        ${tags ? `<div class="article-detail-tags">${tags}</div>` : ''}
        <div class="article-detail-grid">
          <span>${fmtDate(a.date)}</span>
          <span class="art-author-chip">${SI.author} ${isAr ? 'عبدالعزيز باجخيف' : 'Abdulaziz Bajkhaif'}</span>
          <span>${readingLabel(a)}</span>
          <span>${isAr ? 'المستوى' : 'Level'}: ${levelLabel(a)}</span>
          <span>${isAr ? 'مشاهدات' : 'Views'} ${views}</span>
        </div>
        <button type="button" class="focus-toggle" onclick="toggleFocusReading()">${isAr ? 'وضع القراءة المركزة' : 'Focus reading'}</button>
      </div>
      <div class="art-meta">
        <div class="art-meta-info"><span>${readingLabel(a)}</span><span>${levelLabel(a)}</span></div>
        <div class="meta-share" aria-label="${isAr ? 'مشاركة الموضوع' : 'Share topic'}">
          <span class="meta-share-label">${isAr ? 'مشاركة' : 'Share'}</span>
          <button type="button" class="share-btn instagram" title="Instagram" aria-label="Instagram" onclick="shareArticle('instagram','${a.id}','${titleArg}')">${SI.instagram}</button>
          <button type="button" class="share-btn x" title="X" aria-label="X" onclick="shareArticle('x','${a.id}','${titleArg}')">${SI.twitter}</button>
          <button type="button" class="share-btn whatsapp" title="WhatsApp" aria-label="WhatsApp" onclick="shareArticle('whatsapp','${a.id}','${titleArg}')">${SI.whatsapp}</button>
          <button type="button" class="share-btn facebook" title="Facebook" aria-label="Facebook" onclick="shareArticle('facebook','${a.id}','${titleArg}')">${SI.facebook}</button>
          <button type="button" class="share-btn linkedin" title="LinkedIn" aria-label="LinkedIn" onclick="shareArticle('linkedin','${a.id}','${titleArg}')">in</button>
          <button type="button" class="share-btn copy" title="${isAr ? 'نسخ الرابط' : 'Copy link'}" aria-label="${isAr ? 'نسخ الرابط' : 'Copy link'}" onclick="shareArticle('copy','${a.id}','${titleArg}')">⧉</button>
          <button type="button" class="share-btn pdf" title="PDF" aria-label="PDF" onclick="downloadArticlePDF('${a.id}')">PDF</button>
        </div>
      </div>
      ${a.image ? `<img class="art-hero" src="${imgSrc(a.image)}" alt="${t}">` : ''}
      ${youtubeEmbedHtml(a.youtube_url)}
      <div class="art-body">${con}</div>
      ${sourcesAccordionHtml(a)}
      ${related.length ? `
        <section class="related-articles">
          <div class="related-title">${isAr ? 'مواضيع ذات صلة' : 'Related Topics'}</div>
          <div class="related-grid">
            ${related.map(r => artCard(r)).join('')}
          </div>
        </section>` : ''}
      <button type="button" class="focus-exit" onclick="toggleFocusReading()">${isAr ? 'الخروج من وضع القراءة' : 'Exit focus mode'}</button>
    </div>`;
  initReveal();
  updatePageMeta(
    `${t} — ${CMS.s('site_name_en', 'BajoZone')}`,
    con.replace(/<[^>]+>/g, '').slice(0, 140),
    imgSrc(a.image || CMS.s('logo', 'assets/images/logo-bajo.png')),
    getShareUrl(a.id)
  );
}

/* ══════════════════════════════════════════════
   DIGITAL LIBRARY
══════════════════════════════════════════════ */
const RES_TYPES = [
  { v:'all',               ar:'الكل',          en:'All' },
  { v:'scientific_study',  ar:'دراسة علمية',   en:'Scientific Study' },
  { v:'official_document', ar:'وثيقة رسمية',   en:'Official Document' },
  { v:'practical_guide',   ar:'دليل عملي',     en:'Practical Guide' },
  { v:'template',          ar:'قالب',           en:'Template' }
];
const RES_TYPE_ICONS = {
  scientific_study:  '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
  official_document: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
  practical_guide:   '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>',
  template:          '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>'
};

function resTypeLabel(type, isAr) {
  const t = RES_TYPES.find(x => x.v === type);
  return t ? (isAr ? t.ar : t.en) : type;
}
function resTypeColor(type) {
  return { scientific_study:'#6eb5ff', official_document:'#c8a86e', practical_guide:'#7ecb8f', template:'#d4a0ff' }[type] || 'var(--gold)';
}

function applyLibFilters(resources) {
  const f = window._libFilter || {};
  const q = (f.q || '').toLowerCase().trim();
  return resources
    .filter(r => r.is_published !== false)
    .filter(r => f.type === 'all' || !f.type ? true : r.type === f.type)
    .filter(r => {
      if (!q) return true;
      return [r.title_ar, r.title_en, r.short_description_ar, r.short_description_en,
        r.author_or_org, r.publisher, ...(r.tags||[])].join(' ').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (f.sort === 'oldest') return (a.publication_year||0) - (b.publication_year||0);
      if (f.sort === 'year')   return (b.publication_year||0) - (a.publication_year||0);
      if (f.sort === 'type')   return (a.type||'').localeCompare(b.type||'');
      return (b.created_at||'').localeCompare(a.created_at||'');
    });
}

function resourceCard(r, isAr, isFeatured) {
  const t = isAr ? (r.title_ar || r.title_en) : (r.title_en || r.title_ar);
  const desc = isAr ? (r.short_description_ar || r.short_description_en) : (r.short_description_en || r.short_description_ar);
  const typeColor = resTypeColor(r.type);
  const typeIcon = RES_TYPE_ICONS[r.type] || '';
  const typeLabel = resTypeLabel(r.type, isAr);
  const langLabel = { ar:'عربي', en:'English', de:'Deutsch', es:'Español' }[r.language] || r.language || '';
  const accessType = r.access_type || 'external_link';
  const hasDl = accessType === 'direct_download' && r.download_url;
  const hasExt = (accessType === 'external_link' || accessType === 'source_only') && r.source_url;
  const primaryBtn = hasDl
    ? `<a class="lib-btn lib-btn-primary" href="${r.download_url}" download target="_blank" rel="noopener">${isAr?'تحميل الملف':'Download'}</a>`
    : hasExt
      ? `<a class="lib-btn lib-btn-primary" href="${r.source_url}" target="_blank" rel="noopener">${isAr?'عرض المصدر':'View Source'}</a>`
      : `<span class="lib-btn lib-btn-disabled">${isAr?'غير متاح':'Unavailable'}</span>`;
  return `
    <div class="resource-card${isFeatured?' resource-card-featured':''} reveal" style="--rc-color:${typeColor}">
      <div class="rc-type-badge" style="background:${typeColor}20;color:${typeColor};border-color:${typeColor}40">
        ${typeIcon}<span>${typeLabel}</span>
      </div>
      ${r.cover_image ? `<img class="rc-cover" src="${imgSrc(r.cover_image)}" alt="${t}" loading="lazy">` : ''}
      <div class="rc-body">
        <h3 class="rc-title">${t}</h3>
        <p class="rc-desc">${desc}</p>
        <div class="rc-meta">
          ${r.author_or_org ? `<span class="rc-meta-item">${r.author_or_org}</span>` : ''}
          ${r.publication_year ? `<span class="rc-meta-item">${r.publication_year}</span>` : ''}
          ${langLabel ? `<span class="rc-meta-item rc-lang">${langLabel}</span>` : ''}
          ${r.pages ? `<span class="rc-meta-item">${r.pages}${isAr?' ص':' p'}</span>` : ''}
        </div>
        ${r.target_audience?.length ? `<div class="rc-audience">${r.target_audience.map(a=>`<span class="rc-aud-chip">${Lang.t('rAudience_'+a)||a}</span>`).join('')}</div>` : ''}
      </div>
      <div class="rc-actions">
        ${primaryBtn}
        <button class="lib-btn lib-btn-ghost" onclick="openResourceDetail('${r.id}')">${isAr?'التفاصيل':'Details'}</button>
      </div>
    </div>`;
}

function openResourceDetail(id) {
  const r = (CMS.list('resources')).find(x => x.id === id);
  if (!r) return;
  const isAr = Lang.cur === 'ar';
  const t = isAr ? (r.title_ar||r.title_en) : (r.title_en||r.title_ar);
  const fullDesc = isAr ? (r.full_description_ar||r.full_description_en||'') : (r.full_description_en||r.full_description_ar||'');
  const typeColor = resTypeColor(r.type);
  const typeLabel = resTypeLabel(r.type, isAr);
  const bajo = r.bajo_summary_ar?.length ? r.bajo_summary_ar : [];
  const why  = r.why_it_matters_ar?.length ? r.why_it_matters_ar : [];
  const hasDl = r.access_type === 'direct_download' && r.download_url;
  const hasExt = r.source_url;
  const primaryBtn = hasDl
    ? `<a class="lib-btn lib-btn-primary lib-btn-lg" href="${r.download_url}" download target="_blank" rel="noopener">${isAr?'↓ تحميل الملف':'↓ Download File'}</a>`
    : hasExt
      ? `<a class="lib-btn lib-btn-primary lib-btn-lg" href="${r.source_url}" target="_blank" rel="noopener">${isAr?'↗ عرض المصدر':'↗ View Source'}</a>`
      : '';

  const allRes = CMS.list('resources').filter(x => x.id !== id && x.type === r.type && x.is_published !== false).slice(0, 3);

  document.getElementById('lib-modal-body').innerHTML = `
    <div class="lib-modal-inner">
      <div class="lib-modal-head">
        <div class="rc-type-badge" style="background:${typeColor}20;color:${typeColor};border-color:${typeColor}40">
          ${RES_TYPE_ICONS[r.type]||''}<span>${typeLabel}</span>
        </div>
        <h2 class="lib-modal-title">${t}</h2>
        <div class="lib-modal-meta">
          ${r.author_or_org?`<span>${r.author_or_org}</span>`:''}
          ${r.publisher&&r.publisher!==r.author_or_org?`<span>${r.publisher}</span>`:''}
          ${r.publication_year?`<span>${r.publication_year}</span>`:''}
          ${r.language?`<span>${{ar:'عربي',en:'English',de:'Deutsch',es:'Español'}[r.language]||r.language}</span>`:''}
          ${r.pages?`<span>${r.pages} ${isAr?'صفحة':'pages'}</span>`:''}
          ${r.file_size?`<span>${r.file_size}</span>`:''}
        </div>
      </div>
      ${r.cover_image?`<img class="lib-modal-cover" src="${imgSrc(r.cover_image)}" alt="${t}">`:''}
      ${fullDesc?`<div class="lib-modal-section"><p class="lib-modal-full-desc">${fullDesc}</p></div>`:''}
      ${bajo.length?`<div class="lib-modal-section"><div class="lib-modal-section-title">${isAr?'ملخص باجو زون':'BajoZone Summary'}</div><ul class="lib-modal-list">${bajo.map(b=>`<li>${b}</li>`).join('')}</ul></div>`:''}
      ${why.length?`<div class="lib-modal-section"><div class="lib-modal-section-title">${isAr?'لماذا يهمك هذا المورد؟':'Why Does This Matter?'}</div><ul class="lib-modal-list">${why.map(w=>`<li>${w}</li>`).join('')}</ul></div>`:''}
      ${r.target_audience?.length?`<div class="lib-modal-section"><div class="lib-modal-section-title">${isAr?'لمن يناسب؟':'Who Is It For?'}</div><div class="rc-audience">${r.target_audience.map(a=>`<span class="rc-aud-chip">${Lang.t('rAudience_'+a)||a}</span>`).join('')}</div></div>`:''}
      <div class="lib-modal-cta">${primaryBtn}</div>
      ${allRes.length?`<div class="lib-modal-section"><div class="lib-modal-section-title">${isAr?'موارد مشابهة':'Similar Resources'}</div><div class="lib-similar-grid">${allRes.map(x=>{const xt=isAr?(x.title_ar||x.title_en):(x.title_en||x.title_ar);return`<div class="lib-similar-item" onclick="openResourceDetail('${x.id}')"><span class="rc-type-badge" style="background:${resTypeColor(x.type)}20;color:${resTypeColor(x.type)};border-color:${resTypeColor(x.type)}40;font-size:.55rem;padding:2px 6px">${RES_TYPE_ICONS[x.type]||''}<span>${resTypeLabel(x.type,isAr)}</span></span><span class="lib-similar-title">${xt}</span></div>`;}).join('')}</div></div>`:''}
      ${r.rights?`<div class="lib-modal-rights">${isAr?'الحقوق:':'Rights:'} ${r.rights.replace(/_/g,' ')}</div>`:''}
    </div>`;
  document.getElementById('lib-modal-overlay').style.display = 'block';
  document.getElementById('lib-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

window.closeResourceModal = function() {
  document.getElementById('lib-modal-overlay').style.display = 'none';
  document.getElementById('lib-modal').style.display = 'none';
  document.body.style.overflow = '';
};
window.openResourceDetail = openResourceDetail;

function initLibraryEvents() {
  const searchEl = document.getElementById('lib-search');
  if (searchEl) {
    searchEl.value = window._libFilter?.q || '';
    searchEl.addEventListener('input', () => {
      window._libFilter.q = searchEl.value;
      _reRenderLibGrid();
    });
  }
  const sortEl = document.getElementById('lib-sort');
  if (sortEl) {
    sortEl.value = window._libFilter?.sort || 'newest';
    sortEl.addEventListener('change', () => {
      window._libFilter.sort = sortEl.value;
      _reRenderLibGrid();
    });
  }
  const tabsWrap = document.querySelector('.lib-type-tabs');
  if (tabsWrap) {
    tabsWrap.addEventListener('click', e => {
      const btn = e.target.closest('.lib-tab');
      if (!btn) return;
      tabsWrap.querySelectorAll('.lib-tab').forEach(b => b.classList.remove('lib-tab-active'));
      btn.classList.add('lib-tab-active');
      window._libFilter.type = btn.dataset.type || 'all';
      _reRenderLibGrid();
    });
  }
  document.getElementById('lib-modal-overlay')?.addEventListener('click', closeResourceModal);
  document.addEventListener('keydown', function escLib(e) {
    if (e.key === 'Escape') { closeResourceModal(); document.removeEventListener('keydown', escLib); }
  });
}

function _reRenderLibGrid() {
  const isAr = Lang.cur === 'ar';
  const resources = window._libResources || CMS.list('resources');
  const filtered = applyLibFilters(resources);
  const grid = document.getElementById('lib-grid');
  const count = document.getElementById('lib-results-count');
  if (count) count.textContent = `${filtered.length} ${isAr ? Lang.t('libResources') : (filtered.length === 1 ? Lang.t('libResources') : Lang.t('libResources') + 's')}`;
  if (grid) {
    grid.innerHTML = filtered.length
      ? filtered.map(r => resourceCard(r, isAr, false)).join('')
      : `<div class="lib-empty"><p>${isAr ? 'لا توجد موارد مطابقة لهذا التصنيف.' : 'No resources match this filter.'}</p></div>`;
    initReveal();
  }
}

function renderBooks() {
  const isAr = Lang.cur === 'ar';
  const resources = CMS.list('resources');
  window._libResources = resources;
  window._libFilter = { type: 'all', sort: window._libFilter?.sort || 'newest', q: '' };

  const published = resources.filter(r => r.is_published !== false);
  const featured  = published.filter(r => r.is_featured);
  const types     = [...new Set(published.map(r => r.type))].length;
  const lastYear  = published.sort((a,b)=>(b.publication_year||0)-(a.publication_year||0))[0]?.publication_year || '';
  const filtered  = applyLibFilters(resources);

  document.getElementById('app').innerHTML = `
    <div class="library-page">

      <div class="lib-hero page-header">
        <div class="container">
          <div class="section-label">${isAr?'المكتبة':'Library'}</div>
          <h1 class="section-title">${isAr?'مكتبة باجو زون الرقمية':'BajoZone Digital Library'}</h1>
          <p class="lib-hero-sub">${isAr
            ?'موارد مجانية قابلة للتحميل في كرة القدم، اكتشاف المواهب، تطوير اللاعبين، التدريب، التحليل، والعلوم الرياضية. مكتبة مختارة للمدربين، الكشافين، اللاعبين، أولياء الأمور، والمهتمين بصناعة كرة القدم.'
            :'Free downloadable resources on football, talent identification, player development, coaching, analysis, and sports science. A curated library for coaches, scouts, players, parents, and football industry professionals.'}</p>
          <div class="lib-stats reveal">
            <div class="lib-stat"><span class="lib-stat-n">${published.length}</span><span class="lib-stat-l">${isAr?'مورد':'Resources'}</span></div>
            <div class="lib-stat-sep"></div>
            <div class="lib-stat"><span class="lib-stat-n">${types}</span><span class="lib-stat-l">${isAr?'تصنيف':'Types'}</span></div>
            ${lastYear?`<div class="lib-stat-sep"></div><div class="lib-stat"><span class="lib-stat-n">${lastYear}</span><span class="lib-stat-l">${isAr?'آخر تحديث':'Latest'}</span></div>`:''}
          </div>
        </div>
      </div>

      <div class="lib-filters-bar">
        <div class="container">
          <div class="lib-search-row">
            <div class="lib-search-wrap">
              <svg class="lib-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" id="lib-search" class="lib-search-input" placeholder="${isAr?'بحث في الموارد...':'Search resources...'}">
            </div>
            <select id="lib-sort" class="lib-select">
              <option value="newest">${isAr?'الأحدث':'Newest'}</option>
              <option value="oldest">${isAr?'الأقدم':'Oldest'}</option>
              <option value="year">${isAr?'حسب السنة':'By Year'}</option>
              <option value="type">${isAr?'حسب النوع':'By Type'}</option>
            </select>
          </div>
          <div class="lib-type-tabs">
            ${RES_TYPES.map(o=>`<button class="lib-tab${(window._libFilter.type||'all')===o.v?' lib-tab-active':''}" data-type="${o.v}">${isAr?o.ar:o.en}</button>`).join('')}
          </div>
        </div>
      </div>

      ${featured.length ? `<section class="lib-featured-section">
        <div class="container">
          <div class="section-label reveal">${isAr?'موارد مختارة':'Featured Resources'}</div>
          <div class="lib-featured-grid">${featured.slice(0,6).map(r=>resourceCard(r,isAr,true)).join('')}</div>
        </div>
      </section>` : ''}

      <section class="lib-resources-section">
        <div class="container">
          <div class="lib-results-header">
            <span class="lib-results-count" id="lib-results-count">${filtered.length} ${isAr?'مورد':'resource'}</span>
          </div>
          <div class="lib-grid" id="lib-grid">
            ${filtered.length
              ? filtered.map(r=>resourceCard(r,isAr,false)).join('')
              : `<div class="lib-empty"><p>${Lang.t('libEmpty')}</p></div>`}
          </div>
        </div>
      </section>

      <div class="lib-copyright">
        <div class="container">
          <p>${isAr
            ?'<b>تنبيه:</b> جميع الموارد المعروضة في مكتبة باجو زون الرقمية هي ملفات مجانية أو منشورة من مصادرها الأصلية أو متاحة للاطلاع العام. لا تبيع باجو زون هذه الملفات، ويتم ذكر المصدر والجهة الناشرة قدر الإمكان. في حال وجود أي ملاحظة حقوقية يمكن التواصل معنا لتعديل أو إزالة المورد.'
            :'<b>Notice:</b> All resources displayed are free files or published from their original sources and available for public access. BajoZone does not sell these files. Sources and publishers are credited where possible. For any copyright concerns, contact us.'}</p>
        </div>
      </div>

    </div>

    <div class="lib-modal-overlay" id="lib-modal-overlay" style="display:none"></div>
    <div class="lib-modal" id="lib-modal" role="dialog" aria-modal="true" style="display:none">
      <button class="lib-modal-close" onclick="closeResourceModal()" aria-label="Close">✕</button>
      <div id="lib-modal-body"></div>
    </div>`;

  initLibraryEvents();
  initReveal();
  updatePageMeta(
    `${isAr?'المكتبة الرقمية':'Digital Library'} — ${CMS.s('site_name_en','BajoZone')}`,
    isAr ? 'موارد مجانية قابلة للتحميل في كرة القدم واكتشاف المواهب وتطوير اللاعبين.' : 'Free downloadable resources on football talent identification and player development.',
    CMS.s('logo','assets/images/logo-bajo.png'),
    location.origin + location.pathname + '#/books'
  );
}

/* ── ABOUT BAJO ─────────────────────────────── */
function renderAbout() {
  const isAr = Lang.cur === 'ar';
  const abtImg = imgSrc(CMS.s('about_image', ''));
  const gallery = CMS.s('about_gallery', []);
  const articlesCount = CMS.list('articles').length;
  const booksCount = CMS.list('books').length;
  const profile = isAr ? {
    eyebrow: 'إعرف عني',
    name: 'عبدالعزيز باجخيف',
    title: 'أقرأ كرة القدم بعين العلم والميدان',
    lead: 'باحث وممارس في علوم الرياضة وكرة القدم، مهتم باكتشاف المواهب وتطوير اللاعبين في الفئات السنية. BajoZone ليست صفحة تعريف تقليدية، بل دفتر ميدان أترجم فيه الزيارات والمعايشات والدورات والمحاضرات وتجارب التأليف والعمل الرياضي إلى معرفة قابلة للتطبيق.',
    quote: 'الموهبة لا تكفي أن تُرى. يجب أن تُفهم، تُقاس، تُرعى، ثم تُمنح البيئة التي تجعلها تكبر.',
    emailLabel: 'تواصل معي',
    email: 'Abdulaziz.bajkhaif@hotmail.com',
    stats: [
      ['علوم الرياضة', 'خلفية أكاديمية في الحركة والأداء وفهم اللاعب'],
      ['الفئات السنية', 'تركيز على القرارات التي تصنع مسار اللاعب مبكراً'],
      ['كتاب مؤلف', 'تحويل التجربة والمعرفة إلى مرجع يمكن العودة له'],
      ['محاضرات وفعاليات', 'مشاركة وتنظيم ومساهمة داخل بيئات رياضية متنوعة']
    ],
    lensesTitle: 'العدسات التي أكتب من خلالها',
    lenses: [
      ['Talent ID', 'كيف نميز الموهبة بعيداً عن الانطباع السريع؟'],
      ['Player Development', 'كيف يتحول اللاعب الواعد إلى مشروع قابل للنمو؟'],
      ['Recruitment Analysis', 'كيف تُقرأ البيانات والسلوك قبل قرار الاختيار؟'],
      ['Player Care', 'كيف نحمي اللاعب نفسياً وتعليمياً وبيئياً؟']
    ],
    journeyTitle: 'محطات صنعت النظرة',
    journeySub: 'ليست سيرة ذاتية مرتبة على الورق. هذه محطات تراكمت حتى صنعت طريقة تفكير مختلفة في اللاعب والموهبة.',
    journey: [
      ['البداية من الشغف', 'كرة القدم كانت المدخل الأول لفهم الإنسان داخل الملعب: قراره، خوفه، جرأته، ونموه.'],
      ['علوم الحركة والرياضة', 'دراسة أكاديمية في Movement and Sports Sciences منحتني لغة أدق لقراءة الأداء والتطور.'],
      ['زيارات ومعايشات ميدانية', 'الاحتكاك بالبيئات الرياضية يعلّم ما لا تقوله الشرائح: كيف تُدار الحصة، كيف يُلاحظ اللاعب، وكيف تُبنى الثقافة.'],
      ['دورات ودبلومات ومحاضرات', 'كل دورة أو محاضرة كانت إضافة عملية: فكرة، أداة تقييم، أو زاوية جديدة في التعامل مع الفئات السنية.'],
      ['تأليف ومشاركة', 'الكتاب والفعاليات والمحاضرات ليست نهاية الرحلة، بل طريقة لتنظيم المعرفة ومشاركتها مع مجتمع كرة القدم.']
    ],
    albumTitle: 'ألبوم التجارب',
    albumSub: 'هنا مساحة الصور والقصص: زيارة، معايشة، دورة، محاضرة، فعالية، أو لحظة ميدانية تستحق أن تُروى.',
    emptyAlbum: [
      ['صورة زيارة أو معايشة', 'أضف من لوحة التحكم صورة من تجربة ميدانية، ثم اكتب القصة: ماذا رأيت؟ ما المشكلة التي لاحظتها؟ وماذا تعلمت؟'],
      ['صورة محاضرة أو فعالية', 'وثّق لحظة مشاركة أو تنظيم أو إلقاء، واجعل التعليق يشرح القيمة وليس فقط المكان.'],
      ['صورة من كتاب أو مشروع', 'اعرض مشروعك أو كتابك مع نبذة قصيرة تجعل الزائر يفهم لماذا يستحق القراءة.']
    ],
    whyTitle: 'لماذا تستحق BajoZone أن تُقرأ؟',
    whyText: 'لأنها لا تكتفي بالكلام العام عن كرة القدم. هنا أحاول أن أجمع بين العلم، الملاحظة، والتجربة الشخصية لأكتب محتوى يخدم المدرب والكشاف وولي الأمر وصاحب الأكاديمية وكل من يريد أن يفهم اللاعب الناشئ بعمق.',
    ctaTitle: 'هل لديك تجربة، أكاديمية، أو فكرة تستحق النقاش؟',
    ctaText: 'يسعدني التواصل حول المواهب، الفئات السنية، تطوير اللاعبين، المحاضرات، أو التعاون في محتوى يخدم كرة القدم العربية.'
  } : {
    eyebrow: 'About Bajo',
    name: 'Abdulaziz Bajkhaif',
    title: 'Reading football through science and the field',
    lead: 'A sports science and football practitioner focused on talent identification, youth player development, recruitment analysis, academy environments, and player care. BajoZone is not a formal CV page. It is a field journal that turns visits, shadowing experiences, courses, lectures, authoring, and sport projects into practical knowledge.',
    quote: 'Talent should not only be seen. It should be understood, measured, supported, and placed in an environment where it can grow.',
    emailLabel: 'Contact me',
    email: 'Abdulaziz.bajkhaif@hotmail.com',
    stats: [
      ['Sports Science', 'An academic lens for movement, performance, and player growth'],
      ['Youth Football', 'A focus on early decisions that shape long-term pathways'],
      ['Author', 'Turning experience and research into references people can use'],
      ['Events & Lectures', 'Speaking, organizing, and contributing across sport settings']
    ],
    lensesTitle: 'The Lenses Behind My Writing',
    lenses: [
      ['Talent ID', 'How do we identify potential beyond first impressions?'],
      ['Player Development', 'How does a promising player become a growth project?'],
      ['Recruitment Analysis', 'How do data, behavior, and context inform decisions?'],
      ['Player Care', 'How do we protect the player psychologically, educationally, and socially?']
    ],
    journeyTitle: 'Milestones That Shaped The View',
    journeySub: 'This is not a conventional resume. These are the moments that shaped how I read players, environments, and potential.',
    journey: [
      ['The first spark', 'Football became the entry point to understanding the human inside the game: decisions, fear, courage, and growth.'],
      ['Movement and Sports Sciences', 'Academic study gave me a more precise language for performance, development, and observation.'],
      ['Visits and field shadowing', 'Sport environments teach what slides cannot: how sessions are run, how players are noticed, and how culture is built.'],
      ['Courses, diplomas, and lectures', 'Every learning stop added a tool, a question, or a better way to work with youth players.'],
      ['Writing and contribution', 'Books, lectures, and events are not the end of the journey. They are a way to organize knowledge and share it.']
    ],
    albumTitle: 'Experience Album',
    albumSub: 'A space for photos and stories: visits, shadowing, courses, lectures, events, and field moments worth documenting.',
    emptyAlbum: [
      ['Visit or shadowing photo', 'Add a field photo from the admin panel, then write the story: what did you see, what problem did it reveal, and what did it teach you?'],
      ['Lecture or event photo', 'Document a speaking, organizing, or contribution moment, and let the caption explain the value behind it.'],
      ['Book or project photo', 'Show your book or project with a short note that makes visitors understand why it matters.']
    ],
    whyTitle: 'Why BajoZone Is Worth Reading',
    whyText: 'Because it goes beyond generic football talk. Here I connect science, field observation, and lived experience to create useful content for coaches, scouts, parents, academy people, and anyone who wants to understand youth players deeply.',
    ctaTitle: 'Have an academy, idea, or experience worth discussing?',
    ctaText: 'I am open to conversations around talent, youth football, player development, lectures, and Arabic football knowledge.'
  };

  const editable = CMS.s('about_profile', {});
  const langEditable = editable && typeof editable === 'object' ? (editable[Lang.cur] || {}) : {};
  Object.keys(langEditable).forEach(key => {
    if (Array.isArray(langEditable[key])) {
      if (langEditable[key].length) profile[key] = langEditable[key];
    } else if (langEditable[key]) {
      profile[key] = langEditable[key];
    }
  });
  const customContent = isAr ? CMS.s('about_content_ar', '') : CMS.s('about_content_en', '');
  const quotes = Array.isArray(profile.quotes) && profile.quotes.length ? profile.quotes : (isAr ? [
    'أحيانا لا تضيع الموهبة لأنها ضعيفة، بل لأنها قُرئت بطريقة خاطئة.',
    'الكشاف لا يرى ما حدث فقط، بل يسأل: ماذا يمكن أن يحدث بعد عامين؟',
    'في كرة القدم، السياق نصف الحقيقة.'
  ] : [
    'Sometimes talent is not lost because it is weak, but because it was read incorrectly.',
    'A scout does not only see what happened. A scout asks what could happen in two years.',
    'In football, context is half the truth.'
  ]);
  const services = Array.isArray(profile.services) && profile.services.length ? profile.services : (isAr ? [
    ['محتوى معرفي رياضي', 'كتابة وتطوير مقالات وأدلة تربط العلم بالميدان بلغة واضحة.'],
    ['نماذج تقييم وكشف', 'بناء قوالب عملية تساعد الكشاف والمدرب على قراءة اللاعب بعمق.'],
    ['ورش ومحاضرات', 'جلسات معرفية حول اكتشاف المواهب، الفئات السنية، وبيئات التطوير.'],
    ['تعاون بحثي أو إعلامي', 'تحويل الأفكار الرياضية إلى محتوى أو مشاريع قابلة للنشر والتطبيق.']
  ] : [
    ['Sports knowledge content', 'Writing and developing articles and guides that connect science with the field.'],
    ['Scouting frameworks', 'Building practical templates that help scouts and coaches read players deeply.'],
    ['Workshops and lectures', 'Knowledge sessions on talent identification, youth football, and development environments.'],
    ['Research or media collaboration', 'Turning sport ideas into publishable and practical projects.']
  ]);
  const contactHref = /^(https?:|mailto:|tel:|https:\/\/wa\.me)/i.test(profile.email || '') ? profile.email : `mailto:${profile.email}`;

  const albumItems = Array.isArray(gallery) && gallery.length ? gallery.map(item => ({
    image: imgSrc(item.image || ''),
    title: Lang.str({ ar: item.title_ar, en: item.title_en }, profile.albumTitle),
    story: Lang.str({ ar: item.story_ar, en: item.story_en }, '')
  })) : profile.emptyAlbum.map(item => ({ image: '', title: item[0], story: item[1] }));
  const movingAlbum = albumItems.length > 1 ? albumItems.concat(albumItems) : albumItems;

  document.getElementById('app').innerHTML = `
    <section class="bajo-about-hero">
      <div class="about-field-grid"></div>
      <div class="container">
        <div class="bajo-about-hero-grid">
          <div class="bajo-about-copy reveal">
            <div class="section-label">${profile.eyebrow}</div>
            <h1>${profile.name}</h1>
            <p class="about-kicker">${profile.title}</p>
            <p class="about-lead">${profile.lead}</p>
            <blockquote>${profile.quote}</blockquote>
            <div class="about-hero-actions">
              <a class="btn btn-fill" href="${contactHref}">${profile.emailLabel}</a>
              <a class="btn btn-ghost" href="#about-album">${isAr ? 'شاهد التجارب' : 'View Album'}</a>
            </div>
          </div>
          <div class="bajo-portrait reveal">
            <div class="portrait-card">
              ${abtImg
                ? `<img src="${imgSrc(abtImg)}" alt="${profile.name}" loading="eager">`
                : `<div class="portrait-placeholder"><span>BAJO</span><strong>${profile.name}</strong><small>${isAr ? 'أضف صورتك من لوحة التحكم' : 'Add your photo from admin'}</small></div>`}
              <div class="portrait-strip">
                <span>Sports Science</span><span>Talent ID</span><span>Youth Football</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="about-stat-band">
      <div class="container">
        <div class="about-stat-grid">
          ${profile.stats.map(([title, text]) => `<article class="about-stat-card reveal"><strong>${title}</strong><p>${text}</p></article>`).join('')}
          <article class="about-stat-card reveal"><strong>${articlesCount}+</strong><p>${isAr ? 'مقالات منشورة في BajoZone' : 'Published articles on BajoZone'}</p></article>
          <article class="about-stat-card reveal"><strong>${booksCount}</strong><p>${isAr ? 'كتب ومراجع ضمن المكتبة' : 'Books and references in the library'}</p></article>
        </div>
      </div>
    </section>

    ${customContent ? `<section class="about-custom-section">
      <div class="container">
        <div class="about-custom-copy reveal">${customContent}</div>
      </div>
    </section>` : ''}

    <section class="about-lenses-section">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-label">${isAr ? 'منهجيتي' : 'Method'}</div>
            <h2 class="section-title" style="margin-bottom:0;">${profile.lensesTitle}</h2>
          </div>
        </div>
        <div class="about-lenses">
          ${profile.lenses.map(([title, text], idx) => `<article class="about-lens reveal"><span>0${idx + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="about-journey-section">
      <div class="container">
        <div class="about-journey-head reveal">
          <div class="section-label">${isAr ? 'محطات' : 'Milestones'}</div>
          <h2 class="section-title">${profile.journeyTitle}</h2>
          <p class="section-sub">${profile.journeySub}</p>
        </div>
        <div class="about-journey">
          ${profile.journey.map(([title, text], idx) => `<article class="journey-node reveal">
            <div class="journey-index">${String(idx + 1).padStart(2, '0')}</div>
            <div><h3>${title}</h3><p>${text}</p></div>
          </article>`).join('')}
        </div>
      </div>
    </section>

    <section class="about-why-section">
      <div class="container">
        <div class="about-why-card reveal">
          <div class="section-label">${isAr ? 'الفكرة' : 'The Idea'}</div>
          <h2>${profile.whyTitle}</h2>
          <p>${profile.whyText}</p>
        </div>
      </div>
    </section>

    <section class="about-quotes-section">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-label">${isAr ? 'اقتباسات' : 'Quotes'}</div>
            <h2 class="section-title" style="margin-bottom:0;">${isAr ? 'من الأفكار التي أؤمن بها' : 'Ideas I Keep Returning To'}</h2>
          </div>
        </div>
        <div class="about-quotes-grid">
          ${quotes.map((quote, idx) => `<blockquote class="about-quote-card reveal"><span>${String(idx + 1).padStart(2, '0')}</span><p>${quote}</p></blockquote>`).join('')}
        </div>
      </div>
    </section>

    <section class="about-gallery-section" id="about-album">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-label">${isAr ? 'صور وقصص' : 'Photos & Stories'}</div>
            <h2 class="section-title" style="margin-bottom:0;">${profile.albumTitle}</h2>
            <p class="section-sub" style="margin-top:16px;">${profile.albumSub}</p>
          </div>
        </div>
        <div class="about-stations-slider reveal" style="--station-count:${movingAlbum.length || 1};">
          <div class="about-stations-track">
          ${movingAlbum.map((item, idx) => `<article class="about-memory">
            ${item.image ? `<img src="${imgSrc(item.image)}" alt="${item.title}" loading="lazy">` : `<div class="about-memory-ph"><span>${String(idx + 1).padStart(2, '0')}</span></div>`}
            <div class="about-memory-body">
              <span>${String((idx % albumItems.length) + 1).padStart(2, '0')}</span>
              <h3>${item.title}</h3>
              <p>${item.story}</p>
            </div>
          </article>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="about-services-section">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-label">${isAr ? 'كيف أستطيع أن أخدمك؟' : 'How I Can Help'}</div>
            <h2 class="section-title" style="margin-bottom:0;">${isAr ? 'مساحات التعاون والعمل' : 'Collaboration Areas'}</h2>
          </div>
        </div>
        <div class="about-services-grid">
          ${services.map(([title, text], idx) => `<article class="about-service-card reveal"><span>0${idx + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="about-cta-section">
      <div class="container">
        <div class="about-cta reveal">
          <div>
            <h2>${profile.ctaTitle}</h2>
            <p>${profile.ctaText}</p>
          </div>
          <a class="btn btn-fill" href="${contactHref}">${profile.email}</a>
        </div>
      </div>
    </section>`;
  initReveal();
  updatePageMeta(
    `${profile.name} — ${CMS.s('site_name_en', 'BajoZone')}`,
    profile.lead,
    imgSrc(CMS.s('about_image', CMS.s('logo', 'assets/images/logo-bajo.png'))),
    location.origin + location.pathname + '#/about'
  );
}

/* ── ABOUT PORTFOLIO REDESIGN ───────────────── */
function aboutBaseProfile(isAr) {
  return isAr ? {
    eyebrow: 'Personal Portfolio',
    name: 'عبدالعزيز باجخيف',
    title: 'باحث وممارس في كرة القدم وعلوم الرياضة',
    lead: 'أقرأ كرة القدم من نقطة التقاء العلم بالميدان: الموهبة، اللاعب، البيئة، القرار، والحكاية التي تصنع المسار.',
    quote: 'الموهبة لا تكفي أن ترى. يجب أن تفهم، تقاس، ترعى، ثم تمنح البيئة التي تجعلها تكبر.',
    emailLabel: 'لنتواصل',
    email: 'Abdulaziz.bajkhaif@hotmail.com',
    journeyTitle: 'من أين بدأت الحكاية؟',
    journeySub: 'ليست سيرة خطية. هي محطات صغيرة صنعت طريقة نظر مختلفة للعبة واللاعب.',
    albumTitle: 'محطات مصورة',
    albumSub: 'صور تتحرك كدفتر ميدان: كل محطة تحمل قصة قصيرة أو فكرة أو أثر.',
    whyTitle: 'فكرتي',
    whyText: 'BajoZone مساحة شخصية ومهنية لتحويل المشاهدة والخبرة والقراءة إلى محتوى عملي يخدم كرة القدم العربية.',
    ctaTitle: 'هل لديك مشروع أو تجربة تستحق أن نبني حولها معرفة؟',
    ctaText: 'أهتم بالتعاون في المحتوى، المحاضرات، نماذج التقييم، المشاريع التعليمية، وتجارب تطوير المواهب.',
    stats: [['علوم الرياضة','خلفية لفهم الحركة والأداء والنمو'],['الفئات السنية','تركيز على اللاعب في لحظات التكوين'],['التأليف','تحويل الأفكار إلى مراجع وأدلة'],['الميدان','الزيارات والتجارب كمصدر معرفة']],
    lenses: [['اكتشاف المواهب','قراءة الإمكانية لا اللقطة فقط'],['تطوير اللاعب','مسار طويل لا قرار سريع'],['البيئة','ما حول اللاعب يصنع جزءا منه'],['المعرفة','تبسيط العلم دون تفريغه']],
    journey: [['البداية','بدأت الحكاية من سؤال بسيط: لماذا يظهر لاعب ويختفي آخر؟'],['التعلم','الدراسة والقراءة أعطتني لغة لفهم الأداء والنمو.'],['الميدان','كل زيارة أو معايشة تكشف ما لا يظهر في الكتب.'],['التأليف','الكتابة صارت طريقة لترتيب الفكرة ومشاركتها.'],['BajoZone','مساحة تجمع الحكاية، البحث، والتطبيق.']],
    quotes: ['أحيانا لا تضيع الموهبة لأنها ضعيفة، بل لأنها قرئت بطريقة خاطئة.','الكشاف الجيد لا يبحث عن اللاعب الجاهز فقط، بل عن القابل للنمو.','في كرة القدم، السياق نصف الحقيقة.'],
    services: [['محتوى معرفي رياضي','مقالات وأدلة تربط العلم بالميدان.'],['نماذج تقييم وكشف','قوالب عملية لقراءة اللاعب بوضوح.'],['محاضرات وورش','جلسات حول الموهبة والفئات السنية والتطوير.'],['تعاون بحثي أو إعلامي','تحويل الأفكار إلى مشاريع قابلة للنشر.']]
  } : {
    eyebrow: 'Personal Portfolio',
    name: 'Abdulaziz Bajkhaif',
    title: 'Football and sports science practitioner',
    lead: 'I read football where science meets the field: talent, players, environments, decisions, and the stories that shape pathways.',
    quote: 'Talent should not only be seen. It should be understood, measured, supported, and placed in an environment where it can grow.',
    emailLabel: 'Contact',
    email: 'Abdulaziz.bajkhaif@hotmail.com',
    journeyTitle: 'Where The Story Began',
    journeySub: 'Not a linear CV. A set of stops that shaped how I read the game and the player.',
    albumTitle: 'Visual Milestones',
    albumSub: 'A moving field notebook: every image carries a note, story, or idea.',
    whyTitle: 'The Idea',
    whyText: 'BajoZone is a personal and professional space for turning watching, experience, and reading into useful football knowledge.',
    ctaTitle: 'Have a project or experience worth turning into knowledge?',
    ctaText: 'I am interested in content, lectures, evaluation models, learning projects, and talent development experiences.',
    stats: [['Sports Science','A lens for movement, performance, and growth'],['Youth Football','A focus on players during formation years'],['Authoring','Turning ideas into references and guides'],['The Field','Visits and experiences as knowledge sources']],
    lenses: [['Talent ID','Reading potential, not only moments'],['Player Development','A long pathway, not a quick verdict'],['Environment','What surrounds the player shapes part of him'],['Knowledge','Simplifying science without emptying it']],
    journey: [['The Start','It began with a simple question: why does one player emerge and another disappear?'],['Learning','Study and reading gave me language for performance and growth.'],['The Field','Every visit reveals what books cannot show alone.'],['Authoring','Writing became a way to organize and share ideas.'],['BajoZone','A space where story, research, and application meet.']],
    quotes: ['Sometimes talent is not lost because it is weak, but because it was read incorrectly.','A good scout does not only search for the ready player, but the player who can grow.','In football, context is half the truth.'],
    services: [['Sports knowledge content','Articles and guides that connect science with the field.'],['Scouting frameworks','Practical templates for reading players clearly.'],['Lectures and workshops','Sessions around talent, youth football, and development.'],['Research or media collaboration','Turning ideas into publishable projects.']]
  };
}

function renderAboutPortfolio() {
  const isAr = Lang.cur === 'ar';
  const profile = aboutBaseProfile(isAr);
  const editable = CMS.s('about_profile', {});
  const langEditable = editable && typeof editable === 'object' ? (editable[Lang.cur] || {}) : {};
  Object.keys(langEditable).forEach(key => {
    if (Array.isArray(langEditable[key])) {
      if (langEditable[key].length) profile[key] = langEditable[key];
    } else if (langEditable[key]) profile[key] = langEditable[key];
  });

  const abtImg = imgSrc(CMS.s('about_image', ''));
  const gallery = CMS.s('about_gallery', []);
  const books = CMS.list('books');
  const book = books[0] || null;
  const articlesCount = pubArts().length;
  const customContent = isAr ? CMS.s('about_content_ar', '') : CMS.s('about_content_en', '');
  const contactHref = /^(https?:|mailto:|tel:|https:\/\/wa\.me)/i.test(profile.email || '') ? profile.email : `mailto:${profile.email}`;
  const albumFallback = [
    [isAr ? 'محطة ميدانية' : 'Field Stop', isAr ? 'أضف صورة من لوحة التحكم واكتب التعليق الذي يشرح أثرها.' : 'Add a photo from the admin panel and write the note behind it.'],
    [isAr ? 'لحظة تعلم' : 'Learning Moment', isAr ? 'اربط الصورة بفكرة أو درس أو سؤال.' : 'Connect the image to an idea, lesson, or question.'],
    [isAr ? 'مشروع أو كتاب' : 'Project or Book', isAr ? 'اعرض العمل كقصة لا كصورة فقط.' : 'Present the work as a story, not only an image.']
  ];
  const stations = (Array.isArray(gallery) && gallery.length ? gallery.map(item => ({
    image: imgSrc(item.image || ''),
    title: Lang.str({ ar: item.title_ar, en: item.title_en }, profile.albumTitle),
    story: Lang.str({ ar: item.story_ar, en: item.story_en }, '')
  })) : albumFallback.map(item => ({ image: '', title: item[0], story: item[1] })));
  const stationLoop = stations.length > 1 ? stations.concat(stations) : stations;
  const quotes = Array.isArray(profile.quotes) ? profile.quotes : [];
  const services = Array.isArray(profile.services) ? profile.services : [];
  const lenses = Array.isArray(profile.lenses) ? profile.lenses : [];
  const journey = Array.isArray(profile.journey) ? profile.journey : [];
  const stats = Array.isArray(profile.stats) ? profile.stats : [];
  const interests = (isAr ? ['اكتشاف المواهب', 'الفئات السنية', 'الكشافة', 'علوم الرياضة', 'تحليل القرار', 'بيئة اللاعب'] : ['Talent ID', 'Youth Football', 'Scouting', 'Sports Science', 'Decision Analysis', 'Player Environment']);
  const heroChips = [isAr ? 'كاتب' : 'Author', isAr ? 'باحث' : 'Research-minded', isAr ? 'ممارس ميداني' : 'Field practitioner'];

  document.getElementById('app').innerHTML = `
    <div class="portfolio-about-page">
      <section class="portfolio-hero-section">
        <div class="portfolio-hero-grid-bg"></div>
        <div class="container">
          <div class="portfolio-hero-layout">
            <div class="portfolio-hero-copy reveal">
              <div class="portfolio-eyebrow">${profile.eyebrow}</div>
              <h1>${profile.name}</h1>
              <p class="portfolio-title-line">${profile.title}</p>
              <p class="portfolio-lead">${profile.lead}</p>
              <div class="portfolio-hero-actions">
                <a class="btn btn-fill" href="${contactHref}">${profile.emailLabel}</a>
                <a class="btn btn-ghost" href="#portfolio-stations">${isAr ? 'شاهد المحطات' : 'View Milestones'}</a>
              </div>
              <div class="portfolio-chip-row">${heroChips.map(x => `<span>${x}</span>`).join('')}</div>
            </div>
            <div class="portfolio-visual reveal">
              <div class="portfolio-portrait-panel">
                ${abtImg ? `<img src="${imgSrc(abtImg)}" alt="${profile.name}" loading="eager">` : `<div class="portfolio-portrait-empty"><b>BAJO</b><span>${profile.name}</span></div>`}
                <div class="portfolio-orbit p1"><span>01</span>${isAr ? 'موهبة' : 'Talent'}</div>
                <div class="portfolio-orbit p2"><span>02</span>${isAr ? 'ميدان' : 'Field'}</div>
                <div class="portfolio-orbit p3"><span>03</span>${isAr ? 'معرفة' : 'Knowledge'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="portfolio-nav-band">
        <div class="container">
          <div class="portfolio-mini-nav">
            <a href="#portfolio-story">${isAr ? 'الحكاية' : 'Story'}</a>
            <a href="#portfolio-stations">${isAr ? 'المحطات' : 'Milestones'}</a>
            <a href="#portfolio-thinking">${isAr ? 'الأفكار' : 'Thinking'}</a>
            <a href="#portfolio-work">${isAr ? 'المشاريع' : 'Work'}</a>
            <a href="#portfolio-services">${isAr ? 'الخدمات' : 'Services'}</a>
          </div>
        </div>
      </section>

      <section class="portfolio-snapshot-section">
        <div class="container">
          <div class="portfolio-snapshot-grid">
            ${stats.map(([title, text], idx) => `<article class="portfolio-snapshot-card reveal"><span>${String(idx + 1).padStart(2, '0')}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}
            <article class="portfolio-snapshot-card reveal"><span>${String(stats.length + 1).padStart(2, '0')}</span><h3>${articlesCount}+</h3><p>${isAr ? 'موضوع منشور داخل BajoZone' : 'Published BajoZone topics'}</p></article>
          </div>
        </div>
      </section>

      <section class="portfolio-story-section" id="portfolio-story">
        <div class="container">
          <div class="portfolio-story-layout">
            <div class="portfolio-section-head reveal">
              <div class="section-label">${isAr ? 'من أنا؟' : 'Who I Am'}</div>
              <h2>${profile.journeyTitle}</h2>
              <p>${profile.journeySub}</p>
            </div>
            <div class="portfolio-story-map">
              ${journey.map(([title, text], idx) => `<article class="portfolio-story-node reveal" style="--delay:${idx * 80}ms">
                <button type="button">${String(idx + 1).padStart(2, '0')}</button>
                <div><h3>${title}</h3><p>${text}</p></div>
              </article>`).join('')}
            </div>
          </div>
        </div>
      </section>

      ${customContent ? `<section class="portfolio-note-section">
        <div class="container">
          <div class="portfolio-note-copy reveal">${customContent}</div>
        </div>
      </section>` : ''}

      <section class="portfolio-stations-section" id="portfolio-stations">
        <div class="container">
          <div class="portfolio-section-head reveal">
            <div class="section-label">${isAr ? 'محطات وصور' : 'Photos & Milestones'}</div>
            <h2>${profile.albumTitle}</h2>
            <p>${profile.albumSub}</p>
          </div>
        </div>
        <div class="portfolio-stations-slider reveal" style="--station-count:${stationLoop.length || 1};">
          <div class="portfolio-stations-track">
            ${stationLoop.map((item, idx) => `<article class="portfolio-station-card">
              ${item.image ? `<img src="${imgSrc(item.image)}" alt="${item.title}" loading="lazy">` : `<div class="portfolio-station-empty">${String((idx % stations.length) + 1).padStart(2, '0')}</div>`}
              <div class="portfolio-station-caption">
                <span>${String((idx % stations.length) + 1).padStart(2, '0')}</span>
                <h3>${item.title}</h3>
                <p>${item.story}</p>
              </div>
            </article>`).join('')}
          </div>
        </div>
      </section>

      <section class="portfolio-thinking-section" id="portfolio-thinking">
        <div class="container">
          <div class="portfolio-thinking-grid">
            <div class="portfolio-section-head reveal">
              <div class="section-label">${isAr ? 'فكرتي واهتماماتي' : 'Thinking & Interests'}</div>
              <h2>${profile.whyTitle}</h2>
              <p>${profile.whyText}</p>
              <div class="portfolio-interest-cloud">${interests.map(x => `<span>${x}</span>`).join('')}</div>
            </div>
            <div class="portfolio-lens-grid">
              ${lenses.map(([title, text], idx) => `<article class="portfolio-lens-card reveal"><span>0${idx + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="portfolio-quotes-section">
        <div class="container">
          <div class="portfolio-quote-strip">
            ${quotes.map((quote, idx) => `<blockquote class="reveal"><span>${String(idx + 1).padStart(2, '0')}</span><p>${quote}</p></blockquote>`).join('')}
          </div>
        </div>
      </section>

      <section class="portfolio-work-section" id="portfolio-work">
        <div class="container">
          <div class="portfolio-section-head reveal">
            <div class="section-label">${isAr ? 'مشاريعي وكتابي' : 'Work & Book'}</div>
            <h2>${isAr ? 'ما أحاول بناءه' : 'What I Am Building'}</h2>
            <p>${isAr ? 'الكتابة، المشاريع، والأدوات ليست واجهة فقط؛ هي طريقة لتنظيم المعرفة وتحويلها إلى أثر.' : 'Writing, projects, and tools are not only a showcase; they organize knowledge into impact.'}</p>
          </div>
          <div class="portfolio-work-grid">
            <article class="portfolio-book-feature reveal" ${book ? `onclick="Router.go('/book/${book.id}')"` : ''}>
              <div class="portfolio-book-cover">
                ${book?.cover ? `<img src="${imgSrc(book.cover)}" alt="${Lang.str({ ar: book.title_ar, en: book.title_en })}" loading="lazy">` : `<span>${isAr ? 'كتاب' : 'Book'}</span>`}
              </div>
              <div>
                <span class="portfolio-card-kicker">${isAr ? 'كتاب / مرجع' : 'Book / Reference'}</span>
                <h3>${book ? Lang.str({ ar: book.title_ar, en: book.title_en }) : (isAr ? 'مساحة الكتاب القادم' : 'Book space')}</h3>
                <p>${book ? Lang.str({ ar: book.description_ar, en: book.description_en }, Lang.str({ ar: book.subtitle_ar, en: book.subtitle_en })) : (isAr ? 'أضف كتابك من لوحة التحكم ليظهر هنا كجزء من البورتفوليو.' : 'Add your book in the admin panel to feature it here.')}</p>
              </div>
            </article>
            <div class="portfolio-project-stack">
              ${services.slice(0, 3).map(([title, text], idx) => `<article class="portfolio-project-card reveal"><span>${String(idx + 1).padStart(2, '0')}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="portfolio-services-section" id="portfolio-services">
        <div class="container">
          <div class="portfolio-services-panel reveal">
            <div>
              <div class="section-label">${isAr ? 'كيف أقدر أخدمك؟' : 'How I Can Help'}</div>
              <h2>${profile.ctaTitle}</h2>
              <p>${profile.ctaText}</p>
            </div>
            <a class="btn btn-fill" href="${contactHref}">${profile.emailLabel}</a>
          </div>
        </div>
      </section>
    </div>`;

  initReveal();
  updatePageMeta(
    `${profile.name} — ${CMS.s('site_name_en', 'BajoZone')}`,
    profile.lead,
    imgSrc(CMS.s('about_image', CMS.s('logo', 'assets/images/logo-bajo.png'))),
    location.origin + location.pathname + '#/about'
  );
}

/* ── ABOUT PREMIUM CINEMATIC PAGE ───────────── */
const AboutPremium = {
  ar: {
    dir: 'rtl',
    hero: {
      name: 'عبدالعزيز باجخيف',
      tagline: 'باحث ومهتم باكتشاف وتطوير ورعاية المواهب الرياضية، أعمل عند تقاطع كرة القدم، علوم الرياضة، التحليل، والتقنية.',
      bio: 'BajoZone هي مساحتي الشخصية لمشاركة الأفكار، المشاريع، والمحتوى المعرفي حول مستقبل كرة القدم، تطوير اللاعبين، واستخدام البحث والتقنية في فهم المواهب الرياضية بشكل أعمق.',
      primary: 'استكشف BajoZone',
      secondary: 'تواصل معي'
    },
    journey: {
      title: 'رحلتي باختصار',
      intro: 'لم تكن رحلتي مع كرة القدم مجرد متابعة للعبة، بل محاولة مستمرة لفهم اللاعب: كيف يُكتشف؟ كيف يتطور؟ وكيف يمكن رعايته بطريقة تساعده على الوصول إلى أفضل نسخة من نفسه؟',
      items: [
        ['البداية مع كرة القدم', ''],
        ['العمل مع الفئات السنية', ''],
        ['الدراسة والبحث', ''],
        ['التحليل والتقنية', ''],
        ['BajoZone', '']
      ]
    },
    focus: {
      title: 'ما الذي أركز عليه؟',
      intro: 'أركز على فهم الموهبة الرياضية من زاوية أوسع: اكتشافها، تطويرها، رعايتها، وتحليل العوامل التي تساعدها على النمو داخل وخارج الملعب.',
      cards: [
        ['المواهب الرياضية', 'اكتشاف المواهب لا يعني البحث عن اللاعب الأفضل اليوم فقط، بل فهم الإمكانات التي قد تظهر غداً.'],
        ['تطوير اللاعبين', 'الموهبة تحتاج بيئة، توجيه، متابعة، وصبر.'],
        ['رعاية الموهوبين', 'رعاية اللاعب لا تتوقف عند التدريب، بل تشمل الإنسان خلف الأداء.'],
        ['البحث والتحليل', 'أحاول أن أفهم كرة القدم بعين الباحث، لا بعين المشاهد فقط.']
      ]
    },
    experience: {
      title: 'محطات من الرحلة',
      text: 'جهات وتجارب أكاديمية ومهنية ورياضية شكّلت جزءاً من رحلتي.'
    },
    fragments: {
      title: 'لقطات من الرحلة',
      text: 'صور ومحطات صغيرة من رحلة مستمرة بين الملاعب، الدراسة، البحث، السفر، والتجارب التي شكّلت طريقة تفكيري في كرة القدم وتطوير المواهب.'
    },
    varCheck: {
      btn: 'VAR',
      eyebrow: 'هل يستحق هذا القرار مراجعة ثانية؟',
      reviewing: '... جارٍ مراجعة القرار',
      result: 'القرار النهائي: الموهبة الحقيقية لا تُوقف.'
    },
    closing: {
      title: 'لماذا BajoZone؟',
      paragraphs: [
        'BajoZone ليس مجرد موقع شخصي، بل مساحة أفكر من خلالها بصوت عالٍ في مستقبل كرة القدم، وفي كيفية اكتشاف وتطوير ورعاية المواهب الرياضية بطريقة أكثر وعياً واحترافية.',
        'أؤمن أن الموهبة لا تُفهم من لقطة واحدة، ولا تُبنى من تدريب واحد، بل من رحلة طويلة تجمع بين البيئة، المعرفة، المتابعة، والفرصة المناسبة.'
      ],
      statement: 'هدفي أن يكون BajoZone مساحة تجمع بين الملعب، البحث، والتقنية لخدمة مستقبل المواهب الرياضية.',
      invite: 'لديك سؤال أو تريد التواصل؟',
      button: 'استكشف BajoZone'
    }
  },
  en: {
    dir: 'ltr',
    hero: {
      name: 'Abdulaziz Bajkhaif',
      tagline: 'A researcher and sports talent development enthusiast working at the intersection of football, sport science, analysis, and technology.',
      bio: 'BajoZone is my personal space for sharing ideas, projects, and knowledge around the future of football, player development, and the role of research and technology in understanding sports talent more deeply.',
      primary: 'Explore BajoZone',
      secondary: 'Contact Me'
    },
    journey: {
      title: 'My Journey in Brief',
      intro: 'My journey with football has never been only about watching the game. It has always been about understanding the player: how talent is identified, how it develops, and how it can be supported in the right environment.',
      items: [
        ['The Beginning with Football', ''],
        ['Working with Youth Players', ''],
        ['Study and Research', ''],
        ['Analysis and Technology', ''],
        ['BajoZone', '']
      ]
    },
    focus: {
      title: 'What I Focus On',
      intro: 'I focus on understanding sports talent from a wider perspective: identifying it, developing it, supporting it, and analyzing the factors that help it grow inside and outside the game.',
      cards: [
        ['Sports Talent', 'Talent identification is not only about finding the best player today, but about understanding the potential that may appear tomorrow.'],
        ['Player Development', 'Talent needs environment, guidance, monitoring, and patience.'],
        ['Talent Care', 'Supporting a player does not stop at training; it includes the person behind the performance.'],
        ['Research and Analysis', 'I try to understand football through the eyes of a researcher, not only as a spectator.']
      ]
    },
    experience: {
      title: 'Journey Highlights',
      text: 'Academic, professional, and football-related experiences that shaped my path.'
    },
    fragments: {
      title: 'Fragments of the Journey',
      text: 'Small images and moments from an ongoing journey between football fields, study, research, travel, and experiences that shaped the way I think about football and talent development.'
    },
    varCheck: {
      btn: 'VAR',
      eyebrow: 'Should this decision go to review?',
      reviewing: '... reviewing the decision',
      result: 'Final decision: real talent cannot be stopped.'
    },
    closing: {
      title: 'Why BajoZone?',
      paragraphs: [
        'BajoZone is not just a personal website. It is a space where I think out loud about the future of football and how sports talent can be identified, developed, and supported in a more conscious and professional way.',
        'I believe talent cannot be understood from one moment, nor built through one training session. It is a long journey shaped by environment, knowledge, guidance, and the right opportunity.'
      ],
      statement: 'My goal is for BajoZone to become a space where the pitch, research, and technology meet to serve the future of sports talent.',
      invite: 'Have a question or want to get in touch?',
      button: 'Explore BajoZone'
    }
  },
  logos: [
    { src: 'images/about/logos/logo-marburg.png',             alt_ar: 'جامعة ماربورغ',               alt_en: 'University of Marburg' },
    { src: 'images/about/logos/logo-ifi.png',                 alt_ar: 'المعهد الدولي لكرة القدم',    alt_en: 'International Football Institute' },
    { src: 'images/about/logos/logo-barca-innovation-hub.png',alt_ar: 'برشلونة إنوفيشن هاب',        alt_en: 'Barça Innovation Hub' },
    { src: 'images/about/logos/logo-oliver-kahn-academy.png', alt_ar: 'أكاديمية أوليفر كان',        alt_en: 'Oliver Kahn Academy' },
    { src: 'images/about/logos/logo-vfb-marburg.png',         alt_ar: 'في إف بي ماربورغ',           alt_en: 'VfB Marburg' },
    { src: 'images/about/logos/logo-saudi-fa.png',            alt_ar: 'الاتحاد السعودي لكرة القدم', alt_en: 'Saudi Arabian Football Federation' }
  ]
};

function renderAboutPremium() {
  const isAr = Lang.cur === 'ar';
  const c = AboutPremium[isAr ? 'ar' : 'en'];

  const social = CMS.s('social', {}) || {};
  const emailRaw = social?.email?.value || (typeof social?.email === 'string' ? social.email : '') || '';
  const contactHref = emailRaw.includes('@') ? `mailto:${emailRaw}` : '#';

  const heroPhoto = mediaSrc(CMS.s('about_image', ''));
  const defaultKeywords = isAr
    ? ['اكتشاف المواهب','علوم الرياضة','تطوير المواهب','رعاية المواهب','أكاديميات كرة القدم','الفئات السنية','بناء الفريق','استقطاب اللاعبين']
    : ['Talent Discovery','Sport Science','Talent Development','Player Care','Football Academies','Youth Categories','Team Building','Player Scouting'];
  const keywords = CMS.s('about_keywords', null) || defaultKeywords;
  const kwItems = keywords.map(kw => `<span class="about-hero-kw">${kw}</span>`).join('');

  const gallery = CMS.s('about_gallery', []);
  const galleryWithImages = Array.isArray(gallery) ? gallery.filter(item => item && item.image) : [];
  const galleryPhotos = galleryWithImages.length > 0 ? galleryWithImages :
    ['01','02','03','04','05','06'].map(n => ({ image: `/images/about/gallery/journey-${n}.jpg`, title_ar: '', title_en: '' }));
  const albumItems = galleryPhotos.map(item =>
    `<div class="about-photo-album-item"><img src="${mediaSrc(item.image || '')}" alt="${isAr ? (item.title_ar || '') : (item.title_en || '')}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`
  ).join('');
  const albumTrack = albumItems.repeat(4);

  const savedLogos = CMS.s('about_journey_logos', null);
  const logos = (Array.isArray(savedLogos) && savedLogos.length ? savedLogos : AboutPremium.logos)
    .filter(logo => logo && logo.src);
  const logoItems = logos.map(logo =>
    `<div class="about-logo-item"><img src="${mediaSrc(logo.src || '')}" alt="${isAr ? logo.alt_ar : logo.alt_en}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`
  ).join('');
  const logoTrack = logoItems.repeat(8);

  const SVG = {
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    twitter:   `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.734-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    snapchat:  `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.1.043.249.093.445.093.272 0 .58-.096.88-.32a.78.78 0 01.446-.148c.171 0 .34.046.49.135.43.245.5.747.5 1.121 0 .33-.065.612-.195.775-.26.328-.61.51-.99.635-.164.05-.349.07-.533.07-.17 0-.332-.017-.49-.05-.1.248-.167.524-.117.792.065.338-.041.6-.317.761-.266.154-.606.228-.98.228-.17 0-.354-.017-.536-.05-.255-.046-.535-.148-.814-.233-.414.78-.898 1.555-1.48 2.228-.956 1.1-2.11 1.742-3.43 2.09-.188.05-.39.09-.6.133l-.166.034c-.195.04-.41.082-.648.134-.073.016-.146.032-.22.049.177.277.368.524.569.73a.73.73 0 01.152.26c.033.118.048.267.027.423-.054.41-.32.844-.682 1.074-.413.26-.887.387-1.344.387-.35 0-.698-.087-1.014-.258-.27-.146-.521-.304-.764-.456a22.59 22.59 0 00-.703-.421 4.56 4.56 0 00-1.56-.42 5.93 5.93 0 00-.726-.035 4.56 4.56 0 00-.726.035 4.56 4.56 0 00-1.56.42 22.59 22.59 0 00-.703.421c-.243.152-.494.31-.764.456a2.27 2.27 0 01-1.014.258c-.457 0-.93-.127-1.344-.387-.362-.23-.628-.664-.682-1.074-.021-.156-.006-.305.027-.423a.73.73 0 01.152-.26c.2-.206.392-.453.569-.73l-.22-.049c-.237-.052-.453-.094-.648-.134l-.166-.034a6.3 6.3 0 01-.6-.133c-1.32-.348-2.474-.99-3.43-2.09-.582-.673-1.066-1.448-1.48-2.228-.28.085-.559.187-.814.233-.182.033-.365.05-.536.05-.374 0-.714-.074-.98-.228-.276-.16-.382-.423-.317-.761.05-.268-.017-.544-.117-.792a3.33 3.33 0 01-.49.05c-.184 0-.37-.02-.533-.07-.38-.125-.73-.307-.99-.635-.13-.163-.195-.446-.195-.775 0-.374.07-.876.5-1.121.15-.089.319-.135.49-.135a.78.78 0 01.446.148c.3.224.608.32.88.32.196 0 .345-.05.445-.093-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.659 1.07 11.016.793 12.006.793z"/></svg>`,
    email:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>`,
    linkedin:  `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
  };

  const socialPlatforms = [
    { key: 'whatsapp',  label: 'WhatsApp', href: v => `https://wa.me/${v.replace(/\D/g,'')}` },
    { key: 'instagram', label: 'Instagram', href: v => `https://instagram.com/${v}` },
    { key: 'twitter',   label: 'X',         href: v => `https://x.com/${v}` },
    { key: 'snapchat',  label: 'Snapchat',  href: v => `https://snapchat.com/add/${v}` },
    { key: 'email',     label: 'Email',     href: v => v.includes('@') ? `mailto:${v}` : '#' },
    { key: 'linkedin',  label: 'LinkedIn',  href: v => v.startsWith('http') ? v : `https://linkedin.com/in/${v}` }
  ];
  const socialLinksHtml = socialPlatforms.map(p => {
    const raw = social[p.key];
    const val = raw ? (typeof raw === 'string' ? raw : (raw.value || '')) : '';
    if (!val) return '';
    return `<a class="about-social-link" href="${p.href(val)}" target="_blank" rel="noopener noreferrer" aria-label="${p.label}" title="${p.label}">${SVG[p.key]}</a>`;
  }).filter(Boolean).join('');

  const contactInvite = CMS.s(isAr ? 'about_contact_invite_ar' : 'about_contact_invite_en', '') || c.closing.invite || '';
  const varEnabled = CMS.s('about_var_enabled', true);
  const varOverride = CMS.s('about_var_data', null);
  const varData = {
    btn: c.varCheck.btn,
    eyebrow: c.varCheck.eyebrow,
    reviewing: (varOverride && varOverride.reviewing) || c.varCheck.reviewing,
    result:    (varOverride && varOverride.result)    || c.varCheck.result
  };

  document.body.classList.add('is-about-page');

  document.getElementById('app').innerHTML = `
    <div class="about-page" dir="${c.dir}">

      <div class="about-scene-shell" id="about-shell">

        <!-- Scene 0: Intro + Photo + Keywords -->
        <div class="about-scene is-active" data-scene="0">
          <div class="about-hero-row">
            <div class="about-hero-text">
              <p class="about-eyebrow">${isAr ? 'عن صاحب BAJOZONE' : 'ABOUT THE FOUNDER'}</p>
              <p class="about-name">${c.hero.name}</p>
              <h1 class="about-headline">${isAr ? 'بين كرة القدم، البحث، والتقنية' : 'Where football, research, and technology meet'}</h1>
              <div class="about-divider" aria-hidden="true"></div>
              <p class="about-lead">${c.hero.tagline}</p>
              <p class="about-bio">${c.hero.bio}</p>
            </div>
            <div class="about-hero-side">
              <div class="about-hero-card">
                ${heroPhoto
                  ? `<img class="about-hero-card-photo" src="${heroPhoto}" alt="${c.hero.name}" loading="eager" onerror="this.style.display='none'">`
                  : `<div class="about-hero-card-placeholder">${isAr ? 'ع.ب' : 'A.B'}</div>`}
                <div class="about-hero-card-overlay">
                  <div class="about-hero-card-tags">${kwItems}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Scene 1: Journey -->
        <div class="about-scene" data-scene="1">
          <p class="about-scene-label">${isAr ? '02 — رحلتي' : '02 — JOURNEY'}</p>
          <h2 class="about-scene-title">${c.journey.title}</h2>
          <div class="about-divider" aria-hidden="true"></div>
          <p class="about-scene-intro">${c.journey.intro}</p>
          <ol class="about-timeline" role="list">
            ${c.journey.items.map(([label]) => `<li class="about-timeline-item"><span class="about-timeline-dot" aria-hidden="true"></span><span class="about-timeline-label">${label}</span></li>`).join('')}
          </ol>
        </div>

        <!-- Scene 2: Focus -->
        <div class="about-scene" data-scene="2">
          <p class="about-scene-label">${isAr ? '03 — ما أركز عليه' : '03 — FOCUS'}</p>
          <h2 class="about-scene-title">${c.focus.title}</h2>
          <div class="about-divider" aria-hidden="true"></div>
          <p class="about-scene-intro">${c.focus.intro}</p>
          <div class="about-focus-grid">
            ${c.focus.cards.map(([title, text]) => `<div class="about-focus-card"><p class="about-focus-card-title">${title}</p><p class="about-focus-card-text">${text}</p></div>`).join('')}
          </div>
        </div>

        <!-- Scene 3: Moments & Milestones (album + text + logo strip) -->
        <div class="about-scene" data-scene="3">
          <p class="about-scene-label">${isAr ? '04 — لقطات ومحطات' : '04 — MOMENTS & MILESTONES'}</p>
          <h2 class="about-scene-title">${isAr ? 'لقطات ومحطات من الرحلة' : 'Moments and Milestones'}</h2>
          <div class="about-divider" aria-hidden="true"></div>
          <div class="about-moments-main">
            <div class="about-moments-text-col">
              <p class="about-moments-text-eyebrow">${isAr ? 'جهات وتجارب' : 'Institutions'}</p>
              <p class="about-moments-text-body">${c.experience.text}</p>
            </div>
            <div class="about-moments-photos-col">
              <div class="about-photo-album-track">${albumTrack}</div>
            </div>
          </div>
          <div class="about-logo-strip-wrap">
            <div class="about-logo-track">${logoTrack}</div>
          </div>
        </div>

        <!-- Scene 4: VAR Check Easter Egg -->
        ${varEnabled !== false ? `
        <div class="about-scene" data-scene="4">
          <p class="about-scene-label">05 — VAR CHECK</p>
          <h2 class="about-scene-title">${isAr ? 'لحظة VAR' : 'VAR Moment'}</h2>
          <div class="about-divider" aria-hidden="true"></div>
          <p class="about-scene-intro">${isAr ? 'توقف للحظة. كل قرار مهم يستحق نظرة ثانية.' : 'Pause for a moment. Every important decision deserves a second look.'}</p>
          <div class="about-var-area">
            <p class="about-var-eyebrow">${varData.eyebrow}</p>
            <button class="about-var-btn" id="about-var-btn" aria-label="${isAr ? 'مراجعة VAR' : 'VAR Review'}">${varData.btn}</button>
            <p class="about-var-status" id="about-var-status" aria-live="polite"></p>
          </div>
        </div>` : ''}

        <!-- Scene 5: Closing + Social -->
        <div class="about-scene" data-scene="${varEnabled !== false ? 5 : 4}">
          <p class="about-scene-label">${isAr ? '06 — الخاتمة' : '06 — CLOSING'}</p>
          <h2 class="about-scene-title">${c.closing.title}</h2>
          <div class="about-divider" aria-hidden="true"></div>
          ${c.closing.paragraphs.map(p => `<p class="about-scene-para">${p}</p>`).join('')}
          <p class="about-closing-statement">${c.closing.statement}</p>
          ${contactInvite ? `<p class="about-contact-invite">${contactInvite}</p>` : ''}
          ${socialLinksHtml ? `<div class="about-social-row">${socialLinksHtml}</div>` : ''}
          <a class="about-btn-fill" href="#/" onclick="Router.go('/')">${c.closing.button}</a>
        </div>

      </div>

      <div class="about-scene-controls">
        <div class="about-scene-dots" role="tablist" aria-label="${isAr ? 'المشاهد' : 'Scenes'}">
          ${(varEnabled !== false ? [0,1,2,3,4,5] : [0,1,2,3,4]).map(i => `<button class="about-dot${i===0?' is-active':''}" role="tab" aria-selected="${i===0}" data-target="${i}" aria-label="${isAr?'المشهد '+(i+1):'Scene '+(i+1)}"></button>`).join('')}
        </div>
        <button class="about-scene-next" id="about-next-btn" aria-label="${isAr ? 'المشهد التالي' : 'Next scene'}">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4,7 9,12 14,7"/></svg>
        </button>
      </div>

    </div>`;

  updatePageMeta(
    `${c.hero.name} — ${CMS.s('site_name_en', 'BajoZone')}`,
    c.hero.tagline,
    'images/about/about-bg.png',
    location.origin + location.pathname + '#/about'
  );

  requestAnimationFrame(() => {
    initAboutScenes();
    if (varEnabled !== false) initVarCheck(varData);
  });
}

function initAboutScenes() {
  const scenes = [...document.querySelectorAll('.about-scene')];
  const dots   = [...document.querySelectorAll('.about-dot')];
  const nextBtn = document.getElementById('about-next-btn');
  const stage = document.querySelector('.about-page');
  const footer = document.getElementById('site-footer');
  if (!scenes.length) return;

  let cur = 0;
  let locked = false;
  let releasedToFooter = false;
  let returningToStage = false;
  let wheelDebt = 0;
  const TOTAL = scenes.length;
  const LOCK_MS = 760;
  const WHEEL_THRESHOLD = 86;

  function isStageInView() {
    if (!stage) return false;
    const rect = stage.getBoundingClientRect();
    return rect.top < window.innerHeight - 8 && rect.bottom > 8;
  }

  function isStageAligned() {
    if (!stage) return false;
    return Math.abs(stage.getBoundingClientRect().top) <= 8;
  }

  function scrollToStage() {
    if (returningToStage) return;
    returningToStage = true;
    releasedToFooter = false;
    locked = true;
    wheelDebt = 0;
    if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      returningToStage = false;
      locked = false;
    }, LOCK_MS + 260);
  }

  function releaseToFooter() {
    if (releasedToFooter || locked) return;
    releasedToFooter = true;
    locked = true;
    const target = footer || stage?.nextElementSibling;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { locked = false; }, LOCK_MS);
  }

  function goTo(idx) {
    if (locked) return;
    const next = Math.max(0, Math.min(TOTAL - 1, idx));
    if (next === cur) return;
    locked = true;
    const prevEl = scenes[cur];
    const nextEl = scenes[next];
    prevEl.classList.add('is-leaving');
    prevEl.classList.remove('is-active');
    if (dots[cur]) { dots[cur].classList.remove('is-active'); dots[cur].setAttribute('aria-selected', 'false'); }
    cur = next;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nextEl.classList.add('is-active');
        if (dots[cur]) { dots[cur].classList.add('is-active'); dots[cur].setAttribute('aria-selected', 'true'); }
        if (nextBtn) nextBtn.classList.toggle('is-last', cur === TOTAL - 1);
        setTimeout(() => { prevEl.classList.remove('is-leaving'); locked = false; }, LOCK_MS);
      });
    });
  }

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (cur < TOTAL - 1) goTo(cur + 1);
    else releaseToFooter();
  });
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    if (!isStageInView()) scrollToStage();
    goTo(i);
  }));

  const keyHandler = (e) => {
    if (!document.getElementById('about-shell')) { document.removeEventListener('keydown', keyHandler); return; }
    if (releasedToFooter && e.key === 'ArrowUp') { e.preventDefault(); scrollToStage(); return; }
    if (!isStageInView()) return;
    if (!isStageAligned()) { e.preventDefault(); scrollToStage(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); cur === TOTAL - 1 ? releaseToFooter() : goTo(cur + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); goTo(cur - 1); }
  };
  document.addEventListener('keydown', keyHandler);

  let lastWheel = 0;
  const wheelHandler = (e) => {
    if (!document.getElementById('about-shell')) { window.removeEventListener('wheel', wheelHandler); return; }
    if (releasedToFooter) {
      if (e.deltaY < -20 && window.scrollY <= (stage?.offsetTop || 0) + window.innerHeight * 1.15) {
        e.preventDefault();
        scrollToStage();
      }
      return;
    }
    if (!isStageInView()) return;
    if (!isStageAligned()) {
      if (e.deltaY < -12) {
        e.preventDefault();
        scrollToStage();
      }
      return;
    }
    if (returningToStage) { e.preventDefault(); return; }
    const active = scenes[cur];
    const isLast = cur === TOTAL - 1;
    if (active) {
      const { scrollTop, scrollHeight, clientHeight } = active;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      const atTop = scrollTop <= 2;
      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop) return;
    }
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheel > 420) wheelDebt = 0;
    wheelDebt += e.deltaY;
    if (Math.abs(wheelDebt) < WHEEL_THRESHOLD) return;
    const dir = wheelDebt > 0 ? 1 : -1;
    wheelDebt = 0;
    if (now - lastWheel < 900) return;
    lastWheel = now;
    if (dir > 0) {
      if (isLast) releaseToFooter();
      else goTo(cur + 1);
    } else {
      goTo(cur - 1);
    }
  };
  window.addEventListener('wheel', wheelHandler, { passive: false });

  let touchY = 0;
  window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (!document.getElementById('about-shell')) return;
    const diff = touchY - e.changedTouches[0].clientY;
    if (releasedToFooter) {
      if (diff < -48 && window.scrollY <= (stage?.offsetTop || 0) + window.innerHeight * 1.15) scrollToStage();
      return;
    }
    if (!isStageInView()) return;
    if (!isStageAligned()) { if (diff < -48) scrollToStage(); return; }
    if (returningToStage) return;
    if (Math.abs(diff) > 58) {
      if (diff > 0) { cur === TOTAL - 1 ? releaseToFooter() : goTo(cur + 1); }
      else goTo(cur - 1);
    }
  }, { passive: true });
}

function initVarCheck(varData) {
  const btn = document.getElementById('about-var-btn');
  const status = document.getElementById('about-var-status');
  if (!btn || !status) return;

  btn.addEventListener('click', () => {
    if (btn.classList.contains('is-reviewing')) return;
    btn.classList.add('is-reviewing');
    status.textContent = varData.reviewing;
    status.classList.remove('is-result');

    setTimeout(() => {
      status.textContent = varData.result;
      status.classList.add('is-result');

      setTimeout(() => {
        status.classList.remove('is-result');
        status.style.opacity = '0';
        setTimeout(() => {
          status.textContent = '';
          status.style.opacity = '';
          btn.classList.remove('is-reviewing');
        }, 500);
      }, 2400);
    }, 1800);
  });
}

function initAboutPinnedStory(scenes) {
  const pin = document.querySelector('.about-story-pin');
  const stage = document.querySelector('.about-story-stage');
  if (!pin || !stage || !Array.isArray(scenes) || !scenes.length) return;
  const sceneEls = [...pin.querySelectorAll('.about-story-scene')];
  const dots = [...pin.querySelectorAll('[data-scene-target]')];
  const count = pin.querySelector('.about-story-count');
  const current = pin.querySelector('.about-story-current');
  const progress = pin.querySelector('.about-story-progressbar span');
  const nextBtn = pin.querySelector('.about-story-next');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canUseGsap = !reduceMotion && window.gsap && window.ScrollTrigger;
  let active = 0;
  if (window.__aboutStoryTrigger?.kill) window.__aboutStoryTrigger.kill();

  const setScene = (idx) => {
    const next = Math.max(0, Math.min(scenes.length - 1, idx));
    if (next === active && stage.dataset.ready) return;
    active = next;
    stage.dataset.ready = '1';
    stage.dataset.scene = scenes[active].key;
    sceneEls.forEach((el, i) => el.classList.toggle('is-active', i === active));
    dots.forEach((el, i) => el.classList.toggle('is-active', i === active));
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    if (current) current.textContent = scenes[active].label;
    if (progress) progress.style.width = `${((active + 1) / scenes.length) * 100}%`;
    if (nextBtn) {
      nextBtn.classList.toggle('is-last', active === scenes.length - 1);
      nextBtn.querySelector('span').textContent = active === scenes.length - 1
        ? (Lang.cur === 'ar' ? 'استكشف' : 'Explore')
        : (Lang.cur === 'ar' ? 'التالي' : 'Next');
    }
  };

  const scrollToScene = (idx) => {
    if (reduceMotion) { sceneEls[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const max = pin.offsetHeight - window.innerHeight;
    const top = window.scrollY + pin.getBoundingClientRect().top + (max * (idx / Math.max(1, scenes.length - 1)));
    window.scrollTo({ top, behavior: 'smooth' });
  };

  if (reduceMotion) {
    pin.classList.add('is-reduced-motion');
    setScene(0);
  } else if (canUseGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    pin.style.setProperty('--about-story-scenes', scenes.length);
    window.__aboutStoryTrigger = window.ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      snap: 1 / Math.max(1, scenes.length - 1),
      onUpdate: self => setScene(Math.round(self.progress * (scenes.length - 1)))
    });
    requestAnimationFrame(() => window.ScrollTrigger.refresh());
  } else {
    pin.style.setProperty('--about-story-scenes', scenes.length);
    const onScroll = () => {
      const max = Math.max(1, pin.offsetHeight - window.innerHeight);
      const raw = Math.max(0, Math.min(1, -pin.getBoundingClientRect().top / max));
      setScene(Math.round(raw * (scenes.length - 1)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    requestAnimationFrame(onScroll);
  }

  dots.forEach(btn => btn.addEventListener('click', () => scrollToScene(Number(btn.dataset.sceneTarget || 0))));
  nextBtn?.addEventListener('click', () => {
    if (active >= scenes.length - 1) { Router.go('/'); return; }
    scrollToScene(active + 1);
  });
  setScene(0);
}

/* ── Boot ────────────────────────────────────── */
(async function boot() {
  const ok = await CMS.init();
  if (!ok) {
    document.getElementById('app').innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;color:var(--warm-dark);font-family:var(--ff-mono);font-size:.8rem;letter-spacing:.2em;">DATABASE NOT FOUND</div>`;
    hideBootLoader();
    return;
  }
  applyLang();
  Stats.init();
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
    updateNavLogoMode();
  }, { passive: true });
  document.getElementById('hamburger')?.addEventListener('click', () => document.getElementById('mobile-nav')?.classList.toggle('open'));
  document.getElementById('lang-btn')?.addEventListener('click', () => Lang.toggle());
  Router.reg('/',        ()  => renderHomeStory());
  Router.reg('/programs',()  => renderPrograms());
  Router.reg('/articles',()  => renderPrograms()); // backward-compat redirect
  Router.reg('/article', id  => renderArticleSingle(id));
  Router.reg('/books',   ()  => renderBooks());
  Router.reg('/book',    id  => renderBookSingle(id));
  Router.reg('/about',   ()  => renderAboutPremium());
  renderNav(); renderFooter(); Router.init();
  maybeShowNewArticleBar();
  setTimeout(hideBootLoader, 180);
})();
