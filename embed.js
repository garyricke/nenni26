/*!
 * Nenni & Associates — Status feed embed (v2 schema)
 * Drop into a Squarespace code block alongside:
 *   <div id="nenni-status"></div>
 *   <script src="https://nenni26.netlify.app/embed.js"></script>
 * Source: https://github.com/garyricke/nenni26
 */
(function () {
  var SCRIPT = document.currentScript;
  var ORIGIN = (function () {
    if (SCRIPT && SCRIPT.src) {
      try { return new URL(SCRIPT.src).origin; } catch (e) {}
    }
    return '';
  })();
  var FEED_URL = ORIGIN + '/updates.json';
  var FULL_PAGE_URL = ORIGIN + '/';
  var LIMIT = 2;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function mount() {
    var host = document.getElementById('nenni-status');
    if (!host) return;
    if (host.dataset.nenniMounted === '1') return;
    host.dataset.nenniMounted = '1';

    injectStyles();
    host.innerHTML = '<div class="nenni-st-wrap">'
      + '<div class="nenni-st-feed" data-role="feed">'
      +   '<div class="nenni-st-loading">Loading updates&hellip;</div>'
      + '</div>'
      + '<div class="nenni-st-more"><a href="' + escapeAttr(FULL_PAGE_URL) + '" target="_blank" rel="noopener">View full change log &rarr;</a></div>'
    + '</div>';

    var feed = host.querySelector('[data-role="feed"]');

    fetch(FEED_URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { render(feed, (data && (data.entries || data.updates)) || []); })
      .catch(function () {
        feed.innerHTML = '<div class="nenni-st-err">Couldn&rsquo;t load updates right now. See the <a href="' + escapeAttr(FULL_PAGE_URL) + '" target="_blank" rel="noopener">full change log</a>.</div>';
      });
  }

  function render(feed, entries) {
    if (!entries.length) {
      feed.innerHTML = '<div class="nenni-st-empty">No updates yet.</div>';
      return;
    }
    entries.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    entries = entries.slice(0, LIMIT);
    feed.innerHTML = entries.map(function (e, i) { return renderEntry(e, i === 0); }).join('');
  }

  function renderEntry(entry, isLatest) {
    var tagsHtml = (entry.tags || []).map(function (t) {
      return '<span class="nenni-st-tag nenni-st-t-' + escapeHtml(tagSlug(t)) + '">' + escapeHtml(String(t).replace(/-/g, ' ')) + '</span>';
    }).join('');

    var sectionsHtml = (entry.sections || []).map(function (s) {
      var bulletsHtml = (s.bullets || []).map(function (b) { return '<li>' + b + '</li>'; }).join('');
      return '<section class="nenni-st-block">'
        + (s.heading ? '<h3 class="nenni-st-h">' + escapeHtml(s.heading) + '</h3>' : '')
        + '<ul class="nenni-st-bul">' + bulletsHtml + '</ul>'
      + '</section>';
    }).join('');

    return '<article class="nenni-st-entry' + (isLatest ? ' is-latest' : '') + '">'
      + '<aside class="nenni-st-rail">'
      +   '<div class="nenni-st-mo">' + escapeHtml(formatMonth(entry.date)) + '</div>'
      +   '<div class="nenni-st-dy">' + escapeHtml(formatDay(entry.date)) + '</div>'
      + '</aside>'
      + '<div class="nenni-st-card">'
      +   (tagsHtml ? '<div class="nenni-st-tags">' + tagsHtml + '</div>' : '')
      +   sectionsHtml
      + '</div>'
    + '</article>';
  }

  function tagSlug(t) { return String(t).toLowerCase().replace(/[^a-z0-9-]/g, '-'); }
  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function escapeAttr(s) { return escapeHtml(s); }
  function formatMonth(iso) {
    try {
      var d = new Date(iso + 'T12:00:00');
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    } catch (e) { return ''; }
  }
  function formatDay(iso) {
    try {
      var d = new Date(iso + 'T12:00:00');
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' });
    } catch (e) { return iso; }
  }

  function injectStyles() {
    if (document.getElementById('nenni-st-css')) return;
    var css = ''
      + '#nenni-status { font-family: "Source Sans 3", "Helvetica Neue", Arial, sans-serif; color: #2a323d; line-height: 1.6; }'
      + '#nenni-status .nenni-st-wrap { max-width: 880px; margin: 0 auto; }'
      + '#nenni-status .nenni-st-feed { position: relative; }'
      + '#nenni-status .nenni-st-feed::before { content: ""; position: absolute; top: 8px; bottom: 8px; left: 156px; width: 1px; background: #e2e6ed; z-index: 1; }'
      + '#nenni-status .nenni-st-entry { display: grid; grid-template-columns: 140px 1fr; gap: 40px; margin-bottom: 32px; position: relative; }'
      + '#nenni-status .nenni-st-rail { text-align: right; padding-top: 22px; position: relative; }'
      + '#nenni-status .nenni-st-mo { font-family: "Raleway", sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #9aa1ab; }'
      + '#nenni-status .nenni-st-dy { font-family: "Raleway", sans-serif; font-weight: 700; font-size: 15px; color: #6c7480; margin-top: 6px; letter-spacing: 0.01em; }'
      + '#nenni-status .nenni-st-rail::after { content: ""; position: absolute; top: 28px; right: -22px; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 2px solid #5b8db8; z-index: 2; }'
      + '#nenni-status .nenni-st-entry.is-latest .nenni-st-rail::after { background: #5b8db8; box-shadow: 0 0 0 4px rgba(91,141,184,0.18); }'
      + '#nenni-status .nenni-st-card { background: #fff; border: 1px solid #e2e6ed; border-radius: 8px; padding: 26px 32px 30px; box-shadow: 0 1px 2px rgba(20,30,50,0.04); position: relative; z-index: 2; }'
      + '#nenni-status .nenni-st-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid #edf0f5; }'
      + '#nenni-status .nenni-st-tag { font-family: "Raleway", sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; padding: 5px 11px; border-radius: 14px; line-height: 1.2; }'
      + '#nenni-status .nenni-st-t-today    { background: #d4f0db; color: #1e6e3c; }'
      + '#nenni-status .nenni-st-t-launch   { background: #d4e0f0; color: #2a5e9c; }'
      + '#nenni-status .nenni-st-t-episode  { background: #d6e2ed; color: #1a3d6b; }'
      + '#nenni-status .nenni-st-t-audio    { background: #cee6e1; color: #1e6261; }'
      + '#nenni-status .nenni-st-t-design   { background: #dfd6ee; color: #5a3a8c; }'
      + '#nenni-status .nenni-st-t-fix      { background: #e4e6ea; color: #4a5260; }'
      + '#nenni-status .nenni-st-t-content  { background: #efe3c8; color: #8a6420; }'
      + '#nenni-status .nenni-st-t-brand    { background: #f0d8d8; color: #8c3a3a; }'
      + '#nenni-status .nenni-st-block { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #edf0f5; }'
      + '#nenni-status .nenni-st-block:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: 0; }'
      + '#nenni-status .nenni-st-h { font-family: "Raleway", sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.06em; color: #1a2a3a; margin: 0 0 14px; text-transform: uppercase; }'
      + '#nenni-status .nenni-st-bul { list-style: none; padding: 0; margin: 0; }'
      + '#nenni-status .nenni-st-bul li { position: relative; padding-left: 22px; margin-bottom: 12px; font-size: 15px; line-height: 1.65; color: #2a323d; }'
      + '#nenni-status .nenni-st-bul li:last-child { margin-bottom: 0; }'
      + '#nenni-status .nenni-st-bul li::before { content: ""; position: absolute; left: 6px; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: #5b8db8; }'
      + '#nenni-status .nenni-st-bul li strong { color: #1a2a3a; font-weight: 700; }'
      + '#nenni-status .nenni-st-bul li em { color: #1a2a3a; font-style: italic; }'
      + '#nenni-status .nenni-st-bul li code { font-family: "JetBrains Mono", "SFMono-Regular", Consolas, Menlo, monospace; background: #eef1f5; color: #2a3c54; font-size: 0.86em; padding: 1px 6px; border-radius: 3px; border: 1px solid #dfe3ea; white-space: nowrap; }'
      + '#nenni-status .nenni-st-bul li a { color: #3d6f9a; text-decoration: underline; text-underline-offset: 2px; }'
      + '#nenni-status .nenni-st-bul li a:hover { color: #1a2a3a; }'
      + '#nenni-status .nenni-st-loading, #nenni-status .nenni-st-empty, #nenni-status .nenni-st-err { padding: 32px 0; color: #6c7480; font-style: italic; }'
      + '#nenni-status .nenni-st-err { color: #b85b5b; font-style: normal; }'
      + '#nenni-status .nenni-st-err a { color: #3d6f9a; }'
      + '#nenni-status .nenni-st-more { margin-top: 28px; text-align: right; font-size: 13px; }'
      + '#nenni-status .nenni-st-more a { color: #3d6f9a; text-decoration: none; font-family: "Raleway", sans-serif; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; font-size: 11px; }'
      + '#nenni-status .nenni-st-more a:hover { color: #1a2a3a; text-decoration: underline; }'
      + '@media (max-width: 760px) {'
      +   '#nenni-status .nenni-st-feed::before { display: none; }'
      +   '#nenni-status .nenni-st-entry { grid-template-columns: 1fr; gap: 14px; margin-bottom: 24px; }'
      +   '#nenni-status .nenni-st-rail { text-align: left; padding-top: 0; }'
      +   '#nenni-status .nenni-st-mo, #nenni-status .nenni-st-dy { display: inline-block; }'
      +   '#nenni-status .nenni-st-dy { margin-left: 8px; margin-top: 0; }'
      +   '#nenni-status .nenni-st-rail::after { display: none; }'
      +   '#nenni-status .nenni-st-card { padding: 22px 22px 24px; }'
      + '}';
    var s = document.createElement('style');
    s.id = 'nenni-st-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  ready(mount);
})();
