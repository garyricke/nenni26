/*!
 * Nenni & Associates -- Status feed embed (v2 schema)
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
  var PROCESS_URL = ORIGIN + '/episode-production-process.html';
  var PROCESS_EMBED_URL = PROCESS_URL + '?embed=1';
  var LIMIT = 2;

  // Inline SVG icons (flat, currentColor, no <img>).
  var ICON_BOOK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>'
    + '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
  var ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  var ICON_EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>'
    + '<polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';

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
      + '<button class="nenni-st-cta" type="button" data-role="process">'
      +   '<span class="nenni-st-cta-ic">' + ICON_BOOK + '</span>'
      +   '<span class="nenni-st-cta-body">'
      +     '<span class="nenni-st-cta-k">Reference Document</span>'
      +     '<span class="nenni-st-cta-t">How an episode gets made</span>'
      +     '<span class="nenni-st-cta-s">The full production process, start to finish &mdash; handoff, audio, install, and assets.</span>'
      +   '</span>'
      +   '<span class="nenni-st-cta-go"><span class="nenni-st-cta-go-t">Read it</span><span class="nenni-st-cta-go-i">' + ICON_ARROW + '</span></span>'
      + '</button>'
      + '<div class="nenni-st-feed" data-role="feed">'
      +   '<div class="nenni-st-loading">Loading updates&hellip;</div>'
      + '</div>'
      + '<div class="nenni-st-more"><a href="' + escapeAttr(FULL_PAGE_URL) + '" target="_blank" rel="noopener">View full change log &rarr;</a></div>'
    + '</div>';

    host.querySelector('[data-role="process"]').addEventListener('click', openProcess);

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
      +   '<div class="nenni-st-dy">' + escapeHtml(formatDate(entry.date)) + '</div>'
      + '</aside>'
      + '<div class="nenni-st-card">'
      +   (tagsHtml ? '<div class="nenni-st-tags">' + tagsHtml + '</div>' : '')
      +   sectionsHtml
      + '</div>'
    + '</article>';
  }

  /* ---------------------------------------------------------------
   * Process-doc modal.
   * The change log is embedded inside a Squarespace page, so a plain
   * link to a Netlify-hosted HTML page would navigate the visitor away
   * (and a relative href would resolve against the Squarespace origin).
   * Instead we open the document in an overlay backed by an <iframe>,
   * which keeps the visitor on the page and keeps the document's styles
   * fully isolated from Squarespace's.
   * ------------------------------------------------------------- */
  var modal = null;
  var lastFocus = null;

  function buildModal() {
    var m = document.createElement('div');
    m.className = 'nenni-st-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', 'Episode production process');
    m.innerHTML = '<div class="nenni-st-mo-bd" data-role="backdrop"></div>'
      + '<div class="nenni-st-mo-panel">'
      +   '<div class="nenni-st-mo-head">'
      +     '<span class="nenni-st-mo-title">How an episode gets made</span>'
      +     '<span class="nenni-st-mo-actions">'
      +       '<a class="nenni-st-mo-ext" href="' + escapeAttr(PROCESS_URL) + '" target="_blank" rel="noopener">' + ICON_EXT + '<span>Open in new tab</span></a>'
      +       '<button class="nenni-st-mo-x" type="button" data-role="close" aria-label="Close">' + ICON_X + '</button>'
      +     '</span>'
      +   '</div>'
      +   '<div class="nenni-st-mo-body">'
      +     '<div class="nenni-st-mo-load" data-role="spinner">Loading the process document&hellip;</div>'
      +     '<iframe class="nenni-st-mo-frame" data-role="frame" title="Episode production process" loading="lazy"></iframe>'
      +   '</div>'
      + '</div>';

    m.querySelector('[data-role="backdrop"]').addEventListener('click', closeProcess);
    m.querySelector('[data-role="close"]').addEventListener('click', closeProcess);

    var frame = m.querySelector('[data-role="frame"]');
    frame.addEventListener('load', function () {
      var sp = m.querySelector('[data-role="spinner"]');
      if (sp) sp.style.display = 'none';
      frame.classList.add('is-ready');
    });

    document.body.appendChild(m);
    return m;
  }

  function onKeydown(e) {
    if (e.key === 'Escape' || e.keyCode === 27) closeProcess();
  }

  function openProcess(e) {
    // Prefer the element that triggered us: a programmatic .click() leaves
    // document.activeElement on <body>, and we want focus to come back here.
    lastFocus = (e && e.currentTarget) || document.activeElement;
    if (!modal) modal = buildModal();

    var frame = modal.querySelector('[data-role="frame"]');
    if (!frame.getAttribute('src')) frame.setAttribute('src', PROCESS_EMBED_URL);

    modal.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
    var x = modal.querySelector('[data-role="close"]');
    if (x) x.focus();
  }

  function closeProcess() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function tagSlug(t) { return String(t).toLowerCase().replace(/[^a-z0-9-]/g, '-'); }
  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function escapeAttr(s) { return escapeHtml(s); }
  function formatDate(iso) {
    try {
      var d = new Date(iso + 'T12:00:00');
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return iso; }
  }

  function injectStyles() {
    if (document.getElementById('nenni-st-css')) return;
    var css = ''
      + '#nenni-status { font-family: "Source Sans 3", "Helvetica Neue", Arial, sans-serif; color: #2a323d; line-height: 1.6; }'
      + '#nenni-status .nenni-st-wrap { max-width: 880px; margin: 0 auto; }'
      /* ---- Prominent process-doc call to action ---- */
      + '#nenni-status .nenni-st-cta { display: flex; align-items: center; gap: 20px; width: 100%; text-align: left; cursor: pointer; margin: 0 0 40px; padding: 22px 26px; border: 1px solid #2f4a63; border-radius: 10px; background: linear-gradient(135deg, #1f2d3e 0%, #2a4d6d 62%, #3d6d96 100%); color: #fff; box-shadow: 0 6px 18px rgba(26,42,58,0.20); transition: transform .16s ease, box-shadow .16s ease; }'
      + '#nenni-status .nenni-st-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(26,42,58,0.30); }'
      + '#nenni-status .nenni-st-cta:focus-visible { outline: 3px solid #8fc0e6; outline-offset: 3px; }'
      + '#nenni-status .nenni-st-cta-ic { flex: none; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 10px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); color: #fff; }'
      + '#nenni-status .nenni-st-cta-ic svg { width: 26px; height: 26px; }'
      + '#nenni-status .nenni-st-cta-body { flex: 1 1 auto; min-width: 0; display: block; }'
      + '#nenni-status .nenni-st-cta-k { display: block; font-family: "Raleway", sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #9fc4e2; margin-bottom: 5px; }'
      + '#nenni-status .nenni-st-cta-t { display: block; font-family: "Raleway", sans-serif; font-weight: 700; font-size: 21px; line-height: 1.2; color: #fff; letter-spacing: -0.005em; }'
      + '#nenni-status .nenni-st-cta-s { display: block; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.72); margin-top: 6px; }'
      + '#nenni-status .nenni-st-cta-go { flex: none; display: inline-flex; align-items: center; gap: 9px; padding: 11px 18px; border-radius: 999px; background: #fff; color: #1f2d3e; font-family: "Raleway", sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; }'
      + '#nenni-status .nenni-st-cta-go-i { display: inline-flex; }'
      + '#nenni-status .nenni-st-cta-go-i svg { width: 15px; height: 15px; display: block; }'
      + '#nenni-status .nenni-st-cta:hover .nenni-st-cta-go-i { transform: translateX(3px); }'
      + '#nenni-status .nenni-st-cta-go-i { transition: transform .16s ease; }'
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
      /* ---- Process-doc modal (scoped to body, not #nenni-status) ---- */
      + '.nenni-st-modal { position: fixed; inset: 0; z-index: 2147483000; display: none; }'
      + '.nenni-st-modal.is-open { display: block; }'
      + '.nenni-st-mo-bd { position: absolute; inset: 0; background: rgba(14,22,32,0.72); backdrop-filter: blur(2px); }'
      + '.nenni-st-mo-panel { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); display: flex; flex-direction: column; width: min(1140px, 94vw); height: min(880px, 92vh); background: #f4f6fa; border-radius: 12px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.45); }'
      + '.nenni-st-mo-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px 14px 22px; background: #1f2d3e; color: #fff; }'
      + '.nenni-st-mo-title { font-family: "Raleway", sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.04em; }'
      + '.nenni-st-mo-actions { display: flex; align-items: center; gap: 8px; }'
      + '.nenni-st-mo-ext { display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.22); color: #cfe0ee; text-decoration: none; font-family: "Raleway", sans-serif; font-weight: 600; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; }'
      + '.nenni-st-mo-ext:hover { background: rgba(255,255,255,0.10); color: #fff; }'
      + '.nenni-st-mo-ext svg { width: 14px; height: 14px; }'
      + '.nenni-st-mo-x { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.22); background: transparent; color: #cfe0ee; cursor: pointer; }'
      + '.nenni-st-mo-x:hover { background: rgba(255,255,255,0.10); color: #fff; }'
      + '.nenni-st-mo-x svg { width: 19px; height: 19px; }'
      + '.nenni-st-mo-body { flex: 1 1 auto; position: relative; min-height: 0; }'
      + '.nenni-st-mo-load { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #6c7480; font-style: italic; font-family: "Source Sans 3", sans-serif; }'
      + '.nenni-st-mo-frame { width: 100%; height: 100%; border: 0; display: block; opacity: 0; transition: opacity .2s ease; background: #f4f6fa; }'
      + '.nenni-st-mo-frame.is-ready { opacity: 1; }'
      + '@media (max-width: 760px) {'
      +   '.nenni-st-mo-panel { width: 100vw; height: 100vh; border-radius: 0; }'
      +   '.nenni-st-mo-ext span { display: none; }'
      +   '.nenni-st-mo-ext { padding: 9px 11px; }'
      +   '#nenni-status .nenni-st-cta { flex-wrap: wrap; gap: 16px; padding: 20px; }'
      +   '#nenni-status .nenni-st-cta-t { font-size: 18px; }'
      +   '#nenni-status .nenni-st-cta-go { width: 100%; justify-content: center; }'
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
