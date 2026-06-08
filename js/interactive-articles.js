/* BajoZone Interactive Articles — client-side runtime
   Accordion toggling + Chart.js lazy-load
   Entry point: window.initInteractiveBlocks()  */

(function () {
  'use strict';

  /* ── Accordion ─────────────────────────────────────────── */
  function initAccordions(root) {
    var triggers = (root || document).querySelectorAll('.bz-accordion-trigger');
    triggers.forEach(function (btn) {
      if (btn.dataset.bzInit) return;
      btn.dataset.bzInit = '1';
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var panelId  = btn.getAttribute('aria-controls');
        var panel    = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        if (expanded) {
          btn.setAttribute('aria-expanded', 'false');
          panel.hidden = true;
        } else {
          btn.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
        }
      });
    });
  }

  /* ── Chart.js helpers ──────────────────────────────────── */
  var CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
  var chartJsLoaded = false;
  var chartJsLoading = false;
  var chartJsQueue = [];

  function loadChartJs(callback) {
    if (chartJsLoaded) { callback(); return; }
    chartJsQueue.push(callback);
    if (chartJsLoading) return;
    chartJsLoading = true;
    var s = document.createElement('script');
    s.src = CHARTJS_CDN;
    s.onload = function () {
      chartJsLoaded = true;
      chartJsLoading = false;
      chartJsQueue.forEach(function (fn) { fn(); });
      chartJsQueue = [];
    };
    s.onerror = function () {
      chartJsLoading = false;
      chartJsQueue = [];
      console.warn('BajoZone: Chart.js failed to load from CDN.');
    };
    document.head.appendChild(s);
  }

  var BZ_CHART_COLORS = [
    'rgba(200, 168, 110, 0.85)',
    'rgba(60,  60,  60,  0.80)',
    'rgba(200, 168, 110, 0.50)',
    'rgba(100, 100, 100, 0.70)',
    'rgba(220, 190, 130, 0.75)',
    'rgba(40,  40,  40,  0.70)',
  ];

  function initCharts(root) {
    var canvases = (root || document).querySelectorAll('.bz-chart-canvas[data-chart]');
    if (!canvases.length) return;

    loadChartJs(function () {
      canvases.forEach(function (canvas) {
        if (canvas.dataset.bzChartInit) return;
        canvas.dataset.bzChartInit = '1';
        try {
          var cfg = JSON.parse(canvas.dataset.chart);
          buildChart(canvas, cfg);
        } catch (e) {
          console.warn('BajoZone chart parse error:', e);
        }
      });
    });
  }

  function buildChart(canvas, cfg) {
    var chartType = cfg.chartType || 'bar';
    var labels    = cfg.labels || [];
    var datasets  = (cfg.datasets || []).map(function (ds, i) {
      var isLine = chartType === 'line';
      var color  = BZ_CHART_COLORS[i % BZ_CHART_COLORS.length];
      return Object.assign({
        backgroundColor: isLine ? color.replace('0.85', '0.15') : color,
        borderColor:     color,
        borderWidth:     isLine ? 2 : 0,
        tension:         0.35,
        pointRadius:     isLine ? 4 : 0,
      }, ds);
    });

    var isDoughnutOrPie = chartType === 'doughnut' || chartType === 'pie';
    if (isDoughnutOrPie && datasets.length === 1) {
      datasets[0].backgroundColor = BZ_CHART_COLORS;
      datasets[0].borderColor = '#fff';
      datasets[0].borderWidth = 2;
    }

    /* eslint-disable no-undef */
    new Chart(canvas, {
      type: chartType,
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: !!cfg.showLegend,
            labels: { font: { family: 'Tajawal, sans-serif', size: 12 }, color: '#333' },
          },
          tooltip: {
            rtl: true,
            bodyFont: { family: 'Tajawal, sans-serif' },
            titleFont: { family: 'Tajawal, sans-serif' },
          },
        },
        scales: isDoughnutOrPie ? {} : {
          x: {
            ticks: { font: { family: 'Tajawal, sans-serif', size: 11 }, color: '#555' },
            grid:  { color: 'rgba(0,0,0,0.06)' },
          },
          y: {
            beginAtZero: true,
            ticks: { font: { family: 'Tajawal, sans-serif', size: 11 }, color: '#555' },
            grid:  { color: 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });
    /* eslint-enable no-undef */
  }

  /* ── Public entry point ────────────────────────────────── */
  window.initInteractiveBlocks = function (root) {
    initAccordions(root);
    initCharts(root);
  };

  /* Auto-init if DOM already contains blocks (e.g. hard refresh) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.initInteractiveBlocks();
    });
  } else {
    window.initInteractiveBlocks();
  }
}());
