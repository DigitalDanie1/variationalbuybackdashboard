/* ---------- Tab · Whales -----------------------------------------------------
   Who sits at the top of the points board, by name.

   Variational does not publish its leaderboard, so there is no feed to read. What does
   exist is the share card the app hands every account ("Share Points & Rank"), which
   carries points, rank, tier and the date it was made. Accounts post those on X. Each row
   here is one of those cards, copied by hand, linked to the post it came from and kept at
   the date printed on the card — a card is self-reported and goes stale as ranks move, so
   the date is shown on every row and an old one is flagged rather than quietly trusted.

   Value uses the same model as the Points Calculator: the 32% Genesis airdrop split by
   share of all points, with the all-points total taken from the calculator's own weekly
   schedule (ptsPoolAt in dashboard.js) at the card's date.

   To add an account: append to WHALES below. Nothing else changes.

   The deploy CSP is script-src 'self', so this is an external file loaded with defer after
   dashboard.js, and before tge-groups.js, which must stay last. style-src allows
   'unsafe-inline', which is what lets it inject its own <style>. img-src is 'self', so
   avatars are served from assets/whales/. */
(function () {
  'use strict';

  var AIRDROP_SHARE = 0.32;   /* Genesis airdrop, same constant the calculator uses */
  var STALE_DAYS = 14;

  var WHALES = [
    {
      handle: 'linenmito', name: 'LinenMito', avatar: 'assets/whales/linenmito.jpg',
      points: 90358.1, rank: 2, tier: 'Platinum', asOf: '2026-10-16',
      post: 'https://x.com/linenmito/status/2111046106272379225',
      said: ['~$4B volume', '~+$800K PnL', '10+ months', 'BTC · ETH · HYPE · BNB · RWA · swaps'],
      weekly: [585.0, 480.7, 425.1]   /* weeks #7–#9 from the Distribution History on the card */
    },
    {
      handle: 'onchainmonk', name: 'Monk', avatar: 'assets/whales/onchainmonk.jpg',
      points: 15907, rank: 46, tier: 'Platinum', asOf: '2026-10-17',
      post: 'https://x.com/onchainmonk/status/2111312559353835690',
      said: ['10k+ points in 3–4 months', 'up one rank this week', 'manual, no API']
    },
    {
      handle: 'Henrik_on_HL', name: 'Henrik', avatar: 'assets/whales/henrik_on_hl.jpg',
      points: 12408, rank: 73, tier: 'Platinum', asOf: '2026-10-16',
      post: 'https://x.com/Henrik_on_HL/status/2110887784412004353',
      said: []
    },
    {
      /* the posted crop cuts the card off below the points, so the rank is not on it */
      handle: 'Ryuzaki_SEI', name: 'Ryuzaki SEI', avatar: 'assets/whales/ryuzaki_sei.jpg',
      points: 10125, rank: null, tier: 'Platinum', asOf: '2026-10-16',
      post: 'https://x.com/Ryuzaki_SEI/status/2110898412501840063',
      said: ['+211 points this week', '$1.8M OI · $7.1M volume', 'delta-neutral vs Lighter & Arcus', '11 months', 'prices a point at $100']
    },
    {
      /* last card with a total is Sep 4; later posts give weekly drops only, so the
         row keeps the Sep 4 figure and shows as stale rather than adding guesses */
      handle: 'degen_kratos', name: 'Degen Kratos', avatar: 'assets/whales/degen_kratos.jpg',
      points: 12400.68, rank: 66, tier: 'Platinum', asOf: '2026-09-04',
      post: 'https://x.com/degen_kratos/status/2095739465864011860',
      said: ['+390 points week of Oct 9', '$187M volume shown Oct 7', 'BTC & gold scalps, <15 min holds']
    }
  ];

  /* Profile supplied for tracking; keep it outside point totals until a dated
     points card is available. A volume ranking is not a points ranking. */
  var WATCHLIST = [
    {
      handle: 'punk2498_', name: 'an0n2498.hl',
      profile: 'https://x.com/punk2498_',
      post: 'https://x.com/punk2498_/status/2108381438840107417',
      asOf: '2026-10-09',
      note: 'Plans to hold VAR and buy spot at TGE, according to the linked post.'
    },
    {
      handle: 'Defi_Maestro', name: 'Defi_Maestro ✺',
      profile: 'https://x.com/Defi_Maestro',
      post: 'https://x.com/Defi_Maestro/status/2103852141345677503',
      asOf: '2026-09-26',
      note: 'Expects VAR points farming to become more competitive after APIs launch, according to the linked post.'
    },
    {
      handle: 'yh_0x', name: 'yh_0x',
      profile: 'https://x.com/yh_0x',
      post: 'https://x.com/yh_0x/status/2110799569936388198',
      asOf: '2026-10-15',
      note: 'Reports delta-neutral trading across Variational and RiseX for funding arbitrage and points, plus a small oil long.'
    },
    {
      handle: 'hansolar21', name: 'hansolar',
      profile: 'https://x.com/hansolar21',
      post: 'https://x.com/hansolar21/status/2111720672955355624',
      asOf: '2026-10-18',
      note: 'Shares the Variational roadmap covering RWA perps, swaps and institutional derivatives, with a comment on first-principles thinking.'
    },
    {
      handle: 'lynn000333', name: 'Lynn03',
      profile: 'https://x.com/lynn000333',
      note: 'Protected account. Posts and points could not be verified from the public profile.'
    },
    {
      handle: 'corgil', name: 'CorgiI',
      profile: 'https://x.com/corgil',
      post: 'https://x.com/corgil/status/2112005661894836603',
      asOf: '2026-10-19',
      note: 'Shares anticipation for Variational in the linked post.'
    }
  ];

  var FDVS = [1e9, 2.5e9, 5e9, 10e9];
  var fdv = 5e9;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function int(n) { return Math.round(n).toLocaleString('en-US'); }
  function usd(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
    return '$' + Math.round(v);
  }
  function fdvLabel(v) {
    var b = v / 1e9;
    return '$' + (b % 1 ? b.toFixed(1) : b.toFixed(0)) + 'B';
  }
  function dateLabel(d) {
    var p = d.split('-');
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+p[1] - 1] + ' ' + (+p[2]);
  }
  function daysSince(d) {
    var t = Date.parse(d + 'T00:00:00');
    return isFinite(t) ? Math.floor((Date.now() - t) / 864e5) : 0;
  }

  /* dashboard.js declares these as top-level functions, which classic scripts share. */
  function poolAt(d) {
    try { if (typeof ptsPoolAt === 'function') return ptsPoolAt(d); } catch (_) {}
    return 9.4e6;
  }
  function poolNow() {
    try { if (typeof ptsPoolToday === 'function') return ptsPoolToday(); } catch (_) {}
    return 9.4e6;
  }

  function rows() {
    /* ordered by points, not rank: every card shows points, not every crop shows the rank,
       and cards from different days can carry ranks that have since moved */
    return WHALES.slice().sort(function (a, b) { return b.points - a.points; }).map(function (w) {
      var share = w.points / poolAt(w.asOf);
      return {
        w: w,
        share: share,
        value: share * AIRDROP_SHARE * fdv,
        age: daysSince(w.asOf)
      };
    });
  }

  function row(r, top) {
    var w = r.w;
    var bar = Math.max(2, w.points / top * 100);
    var stale = r.age > STALE_DAYS;
    var said = (w.said || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    var weekly = w.weekly && w.weekly.length
      ? '<p class="wh-weekly"><span>Last ' + w.weekly.length + ' weekly drops</span>' +
        w.weekly.map(function (v) { return '<b>' + esc(v.toFixed(1)) + '</b>'; }).join('') + '</p>'
      : '';
    return '<li class="wh-row">' +
      (w.rank ? '<span class="wh-rank"><i>#</i>' + w.rank + '</span>'
              : '<span class="wh-rank none" title="rank not shown on the posted card">—<small>not shown</small></span>') +
      '<div class="wh-who">' +
        '<img src="' + esc(w.avatar) + '" alt="" width="40" height="40" loading="lazy">' +
        '<div><b>' + esc(w.name) + '</b>' +
        '<a href="' + esc(w.post) + '" target="_blank" rel="noopener noreferrer">@' + esc(w.handle) + '</a>' +
        '<span class="wh-tier">' + esc(w.tier) + '</span></div>' +
      '</div>' +
      '<div class="wh-pts"><b>' + int(w.points) + '</b>' +
        '<span class="wh-bar" aria-hidden="true"><i style="width:' + bar.toFixed(1) + '%"></i></span>' +
        '<em>' + (r.share * 100).toFixed(2) + '% of all points</em></div>' +
      '<div class="wh-val"><b>' + esc(usd(r.value)) + '</b><em>at ' + esc(fdvLabel(fdv)) + ' FDV</em></div>' +
      '<div class="wh-asof' + (stale ? ' stale' : '') + '"><b>' + esc(dateLabel(w.asOf)) + '</b>' +
        '<em>' + (stale ? r.age + 'd old · stale' : (r.age <= 0 ? 'today' : r.age + 'd ago')) + '</em>' +
        '<a href="' + esc(w.post) + '" target="_blank" rel="noopener noreferrer">source ↗</a></div>' +
      (said || weekly ? '<div class="wh-said">' + (said ? '<ul>' + said + '</ul>' : '') + weekly + '</div>' : '') +
      '</li>';
  }

  /* One sentence about the spread between the rows, worked out from them so it stays true
     as accounts are added. With fewer than two rows there is nothing to compare. */
  function spread(rs) {
    if (rs.length < 2) return '';
    var hi = rs[0], lo = rs[rs.length - 1];
    var mult = hi.w.points / lo.w.points;
    return '<p class="wh-spread"><b>' + esc(hi.w.name) + ' holds ' + mult.toFixed(1) + '× the points of ' + esc(lo.w.name) + '.</b> ' +
      'The gap between them is ' + int(hi.w.points - lo.w.points) + ' points — about ' +
      usd((hi.value - lo.value)) + ' of airdrop at ' + esc(fdvLabel(fdv)) + ' FDV.</p>';
  }

  function watchlist() {
    if (!WATCHLIST.length) return '';
    return '<div class="wh-watch"><h3>More accounts to watch</h3>' +
      '<p>Points and rank unverified. These accounts are excluded from the totals and valuation above.</p>' +
      '<ul>' + WATCHLIST.map(function (w) {
        return '<li><b>' + esc(w.name) + '</b> ' +
          '<a href="' + esc(w.profile) + '" target="_blank" rel="noopener noreferrer">@' + esc(w.handle) + '</a>' +
          '<span>Points / rank: unverified</span>' +
          '<p>' + esc(w.note) + (w.post && w.asOf
            ? ' <a href="' + esc(w.post) + '" target="_blank" rel="noopener noreferrer">' +
              esc(dateLabel(w.asOf)) + ' source ↗</a>'
            : '') + '</p></li>';
      }).join('') + '</ul></div>';
  }

  function render() {
    var host = document.querySelector('[data-tg="whales"]');
    if (!host) return;
    var rs = rows();
    var top = rs.length ? rs[0].w.points : 1;
    var total = rs.reduce(function (a, r) { return a + r.w.points; }, 0);
    var pool = poolNow();

    var chips = FDVS.map(function (v) {
      return '<button type="button" data-wh-fdv="' + v + '"' + (v === fdv ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' +
        esc(fdvLabel(v)) + '</button>';
    }).join('');

    host.innerHTML =
      '<div class="cmp-heading"><span class="cmp-eyebrow">WHALES</span>' +
      '<h2>Who sits at the top of the points board</h2>' +
      '<p>Variational does not publish its leaderboard. What it does give every account is a share card with points, rank and the date it was made, and some accounts post theirs on X. Each row below is one of those cards, linked to its post. Rows are self-reported and dated; anything older than two weeks is marked stale.</p></div>' +
      '<div class="wh-readouts">' +
        '<div><span>Accounts tracked</span><b>' + rs.length + '</b></div>' +
        '<div><span>Their combined points</span><b>' + int(total) + '</b><em>' + (total / pool * 100).toFixed(2) + '% of all points</em></div>' +
        '<div><span>All points issued, est.</span><b>' + (pool / 1e6).toFixed(2) + 'M</b><em>calculator schedule, this week</em></div>' +
      '</div>' +
      '<div class="tp-chips wh-chips"><span>Value at FDV</span>' + chips + '</div>' +
      '<ol class="wh-list">' + rs.map(function (r) { return row(r, top); }).join('') + '</ol>' +
      spread(rs) +
      watchlist() +
      '<div class="tp-note"><b>How the value is worked out.</b> Share of all points at the card’s date × the 32% Genesis airdrop × the FDV picked above — the same model as the Points Calculator, and the all-points total is that tab’s weekly estimate, not a published figure. Weekly drops are read off the Distribution History on the card where it shows. Know an account that has posted its card? It goes in by hand, with the post as the source.</div>';
  }

  var STYLE =
    '.wh-readouts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 18px}' +
    '.wh-readouts>div{padding:14px 16px;border:1px solid var(--line);background:color-mix(in srgb,var(--panel) 72%,transparent);min-width:0}' +
    '.wh-readouts span{display:block;color:var(--muted)!important;font:800 9.5px var(--mono);letter-spacing:.7px;text-transform:uppercase}' +
    '.wh-readouts b{display:block;margin-top:8px;color:var(--text);font:700 22px/1 var(--mono)}' +
    '.wh-readouts em{display:block;margin-top:6px;color:var(--muted)!important;font-style:normal;font-size:11px}' +
    '.wh-list{margin:0 0 16px;padding:0;list-style:none;border-top:1px solid var(--line)}' +
    '.wh-row{display:grid;grid-template-columns:64px minmax(180px,1.3fr) minmax(160px,1.2fr) minmax(110px,.8fr) minmax(100px,.7fr);' +
      'gap:6px 18px;align-items:start;padding:18px 4px;border-bottom:1px solid var(--line)}' +
    '.wh-rank{color:var(--text);font:700 28px/1 var(--mono);letter-spacing:-1px}' +
    '.wh-rank i{color:var(--dim);font-style:normal;font-size:16px;margin-right:1px;vertical-align:5px}' +
    '.wh-rank.none{color:var(--dim)}' +
    '.wh-rank small{display:block;margin-top:6px;color:var(--muted)!important;font:700 9px/1.3 var(--mono);letter-spacing:.3px}' +
    '.wh-who{display:flex;gap:12px;align-items:flex-start;min-width:0}' +
    '.wh-who img{flex:0 0 auto;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);object-fit:cover}' +
    '.wh-who>div{min-width:0}' +
    '.wh-who b{display:block;color:var(--text);font-size:15px;font-weight:700;letter-spacing:-.01em}' +
    '.wh-who a{display:inline-block;margin-top:2px;color:var(--v2-accent,#4c9af8)!important;font:700 12px var(--mono);text-decoration:none}' +
    '.wh-who a:hover{text-decoration:underline}' +
    '.wh-tier{display:inline-block;margin-left:8px;padding:2px 7px;border:1px solid var(--line);color:var(--muted)!important;font:800 9px var(--mono);letter-spacing:.6px;text-transform:uppercase;vertical-align:1px}' +
    '.wh-pts b,.wh-val b,.wh-asof b{display:block;color:var(--text);font:700 18px/1.1 var(--mono)}' +
    '.wh-pts em,.wh-val em,.wh-asof em{display:block;margin-top:5px;color:var(--muted)!important;font-style:normal;font-size:11px}' +
    '.wh-bar{display:block;height:4px;margin-top:8px;background:color-mix(in srgb,var(--line) 70%,transparent)}' +
    '.wh-bar i{display:block;height:100%;background:var(--v2-accent,#4c9af8)}' +
    '.wh-val b{color:var(--v2-accent,#4c9af8)!important}' +
    '.wh-asof a{display:inline-block;margin-top:5px;color:var(--muted)!important;font:700 11px var(--mono);text-decoration:none}' +
    '.wh-asof a:hover{color:var(--text)!important}' +
    '.wh-asof.stale em{color:#ffc65a!important}' +
    'body.theme-light .wh-asof.stale em{color:#9a6400!important}' +
    '.wh-said{grid-column:2/-1;display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;padding-left:52px}' +
    '.wh-said ul{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}' +
    '.wh-said li{padding:3px 8px;border:1px solid var(--line);color:var(--muted)!important;font-size:11px}' +
    '.wh-weekly{display:flex;align-items:baseline;gap:8px;margin:0}' +
    '.wh-weekly span{color:var(--muted)!important;font:800 9.5px var(--mono);letter-spacing:.6px;text-transform:uppercase}' +
    '.wh-weekly b{color:var(--text);font:700 12px var(--mono)}' +
    '.wh-spread{margin:0 0 18px;color:var(--muted)!important;font-size:13px;line-height:1.6}' +
    '.wh-spread b{color:var(--text);font-weight:700}' +
    '.wh-watch{margin:0 0 18px;padding:16px;border:1px solid var(--line)}' +
    '.wh-watch h3{margin:0 0 8px;color:var(--text);font-size:15px}' +
    '.wh-watch p{margin:6px 0;color:var(--muted)!important;font-size:12px;line-height:1.6}' +
    '.wh-watch ul{margin:12px 0 0;padding:0;list-style:none}' +
    '.wh-watch li{padding-top:12px;border-top:1px solid var(--line);overflow-wrap:anywhere}' +
    '.wh-watch b{color:var(--text);font-size:15px}' +
    '.wh-watch a{color:var(--v2-accent,#4c9af8)!important;text-decoration:none}' +
    '.wh-watch a:hover{text-decoration:underline}' +
    '.wh-watch span{display:block;margin-top:6px;color:var(--muted)!important;font-size:12px}' +
    '@media (max-width:860px){' +
      '.wh-readouts{grid-template-columns:1fr}' +
      '.wh-row{grid-template-columns:44px minmax(0,1fr) minmax(0,1fr);gap:10px 14px;align-items:start}' +
      '.wh-rank{font-size:22px;grid-column:1;grid-row:1}' +
      '.wh-who{grid-column:2/-1}' +
      '.wh-pts{grid-column:2/-1}' +
      '.wh-val{grid-column:2}' +
      '.wh-asof{grid-column:3}' +
      '.wh-said{grid-column:2/-1;padding-left:0}' +
    '}';

  function injectStyle() {
    if (document.getElementById('whales-style')) return;
    var s = document.createElement('style');
    s.id = 'whales-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function mount() {
    if (document.querySelector('[data-tg="whales"]')) return;
    var main = document.querySelector('#main');
    if (!main) return;
    var sec = document.createElement('section');
    sec.className = 'whales-report tsec tg-hide';
    sec.setAttribute('data-tg', 'whales');
    var anchor = document.querySelector('[data-tg="roadmap"]');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else main.appendChild(sec);
    mountTabButton();
    mountRail();
  }

  /* #tabs is the source of tab state: showTab() reads it and the side rail only
     delegates into it, so a section without a #tab-<name> button never unhides. */
  function mountTabButton() {
    if (document.getElementById('tab-whales')) return;
    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    var after = document.getElementById('tab-roadmap');
    var b = document.createElement('button');
    b.id = 'tab-whales';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.dataset.tab = 'whales';
    b.textContent = 'Whales';
    if (after && after.parentNode === tabs) tabs.insertBefore(b, after);
    else tabs.appendChild(b);
  }

  /* Cloned from the Monitors button so it inherits every rail's markup. tge-groups.js
     reorders and renumbers all rails afterwards, so where it lands here does not matter. */
  function mountRail() {
    document.querySelectorAll('[data-open-tab="monitors"]').forEach(function (btn) {
      var rail = btn.parentNode;
      if (!rail || rail.querySelector('[data-open-tab="whales"]')) return;
      var mine = btn.cloneNode(true);
      mine.setAttribute('data-open-tab', 'whales');
      mine.classList.remove('on');
      var strong = mine.querySelector('strong') || mine.querySelector('b');
      if (strong) strong.textContent = 'Whales';
      var small = mine.querySelector('small');
      if (small) small.textContent = 'top of the points board';
      rail.insertBefore(mine, btn.nextSibling);
    });
  }

  function registerTab() {
    try {
      if (typeof VALID_TABS !== 'undefined' && VALID_TABS.indexOf('whales') < 0) VALID_TABS.push('whales');
      if (typeof DEFAULT_TAB_ORDER !== 'undefined' && DEFAULT_TAB_ORDER.indexOf('whales') < 0) {
        var i = DEFAULT_TAB_ORDER.indexOf('monitors');
        DEFAULT_TAB_ORDER.splice(i < 0 ? DEFAULT_TAB_ORDER.length : i + 1, 0, 'whales');
      }
      if (typeof SECTION_COPY !== 'undefined') SECTION_COPY.whales = {
        eyebrow: 'Whales',
        title: 'Whales',
        description: 'The accounts at the top of the points board, from the share cards they posted, with what each holding is worth at a chosen FDV.',
        chip: 'self-reported'
      };
    } catch (_) {}
  }

  function boot() {
    injectStyle();
    registerTab();
    mount();
    render();
    /* dashboard.js resolves the opening hash before this tab exists, so a shared
       #whales link would land on Overview without this */
    if (location.hash === '#whales' && typeof showTab === 'function') {
      try { showTab('whales', { push: false }); } catch (_) {}
    }
    document.addEventListener('click', function (e) {
      var b = e.target && e.target.closest && e.target.closest('[data-wh-fdv]');
      if (!b) return;
      fdv = +b.getAttribute('data-wh-fdv');
      render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
