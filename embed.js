/*!
 * Nenni & Associates — Status feed embed
 * Drop into a Squarespace code block alongside:
 *   <div id="nenni-status"></div>
 *   <script src="https://YOUR-NETLIFY-URL/embed.js"></script>
 * Source: https://github.com/garyricke/nenni26-status
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
  var LIMIT = 10;

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
    host.innerHTML = '<div class="nenni-status-shell">'
      + '<ul class="nenni-status-feed" data-role="feed">'
      +   '<li class="nenni-status-empty">Loading updates&hellip;</li>'
      + '</ul>'
      + '<div class="nenni-status-more"><a href="' + escapeAttr(FULL_PAGE_URL) + '" target="_blank" rel="noopener">View full status log &rarr;</a></div>'
    + '</div>';

    var feed = host.querySelector('[data-role="feed"]');

    fetch(FEED_URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { render(feed, (data && data.updates) || []); })
      .catch(function (err) {
        feed.innerHTML = '<li class="nenni-status-error">Couldn&rsquo;t load updates right now. Check the <a href="' + escapeAttr(FULL_PAGE_URL) + '" target="_blank" rel="noopener">full status page</a>.</li>';
      });
  }

  function render(feed, updates) {
    if (!updates.length) {
      feed.innerHTML = '<li class="nenni-status-empty">No updates yet.</li>';
      return;
    }
    updates.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    updates = updates.slice(0, LIMIT);
    feed.innerHTML = updates.map(function (u) {
      var kind = (u.kind || '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
      var kindLabel = (u.kind || '').replace(/-/g, ' ');
      return '<li class="nenni-status-item">'
        + '<div class="nenni-status-row">'
        +   '<span class="nenni-status-date">' + escapeHtml(formatDate(u.date || '')) + '</span>'
        +   (kindLabel ? '<span class="nenni-status-kind nenni-k-' + escapeHtml(kind) + '">' + escapeHtml(kindLabel) + '</span>' : '')
        + '</div>'
        + '<h3 class="nenni-status-title">' + escapeHtml(u.title || '') + '</h3>'
        + '<p class="nenni-status-body">' + escapeHtml(u.body || '') + '</p>'
      + '</li>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escapeAttr(s) { return escapeHtml(s); }
  function formatDate(iso) {
    try {
      var d = new Date(iso + 'T12:00:00');
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return iso; }
  }

  function injectStyles() {
    if (document.getElementById('nenni-status-css')) return;
    var css = ''
      + '#nenni-status { font-family: "Source Sans 3", "Helvetica Neue", Arial, sans-serif; color: #1a1c21; line-height: 1.55; }'
      + '#nenni-status .nenni-status-shell { max-width: 760px; margin: 0 auto; }'
      + '#nenni-status .nenni-status-feed { list-style: none; padding: 0; margin: 0; }'
      + '#nenni-status .nenni-status-item { padding: 24px 0; border-bottom: 1px solid #d8dde3; }'
      + '#nenni-status .nenni-status-item:last-child { border-bottom: 0; }'
      + '#nenni-status .nenni-status-row { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; margin-bottom: 8px; }'
      + '#nenni-status .nenni-status-date { font-family: "Raleway", "Helvetica Neue", Arial, sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #6c7480; }'
      + '#nenni-status .nenni-status-kind { font-family: "Raleway", "Helvetica Neue", Arial, sans-serif; font-weight: 700; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px; background: #1a2a3a; color: #fff; }'
      + '#nenni-status .nenni-k-episode-launch { background: #3d6f9a; }'
      + '#nenni-status .nenni-k-episode-update { background: #5b8db8; }'
      + '#nenni-status .nenni-k-page-update { background: #6c7480; }'
      + '#nenni-status .nenni-k-system { background: #131e2a; }'
      + '#nenni-status .nenni-status-title { font-family: "Raleway", "Helvetica Neue", Arial, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.25; color: #1a2a3a; margin: 0 0 6px; letter-spacing: -0.005em; }'
      + '#nenni-status .nenni-status-body { margin: 0; color: #1a1c21; font-size: 15.5px; line-height: 1.6; }'
      + '#nenni-status .nenni-status-empty, #nenni-status .nenni-status-error { padding: 32px 0; color: #6c7480; font-style: italic; }'
      + '#nenni-status .nenni-status-error { color: #b85b5b; font-style: normal; }'
      + '#nenni-status .nenni-status-error a { color: #3d6f9a; }'
      + '#nenni-status .nenni-status-more { margin-top: 28px; font-size: 13px; }'
      + '#nenni-status .nenni-status-more a { color: #3d6f9a; text-decoration: none; font-family: "Raleway", "Helvetica Neue", Arial, sans-serif; font-weight: 600; letter-spacing: 0.04em; }'
      + '#nenni-status .nenni-status-more a:hover { color: #1a2a3a; text-decoration: underline; }'
      + '@media (max-width: 600px) { #nenni-status .nenni-status-title { font-size: 18px; } }';
    var s = document.createElement('style');
    s.id = 'nenni-status-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  ready(mount);
})();
