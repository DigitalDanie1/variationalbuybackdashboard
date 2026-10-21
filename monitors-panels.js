/* ---------- Tab · Monitors -------------------------------------------------
   Two of the playbook's five monitors, promoted out of that tab because they are
   the ones meant to run continuously rather than be read once.

   Neither can run yet, and the honest version of "coming soon" is to say exactly
   what is missing rather than show an empty box. So each panel lists its inputs
   and marks which already exist. That distinction is real: the wallet monitor has
   nothing at all, while the OLP ratio already has its numerator live on-chain and
   is only waiting on a token to stake. Showing both as the same blank would hide
   the more useful of the two facts.

   The deploy CSP is script-src 'self', so this stays an external file loaded with
   defer after dashboard.js. */
(function () {
  'use strict';

  var OLP_ADDR = '0x74bbbb0e7f0bad6938509dd4b556a39a4db1f2cd';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function usd(v) {
    if (!isFinite(v) || v == null) return null;
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(v);
  }

  /* dashboard.js declares these as top-level consts, which classic scripts share.
     They may not be populated yet on first render, hence the guards. */
  function olpLive() {
    try {
      if (typeof PM_GROWTH_STATE !== 'undefined' && isFinite(PM_GROWTH_STATE.olpCurrent)) {
        return PM_GROWTH_STATE.olpCurrent;
      }
    } catch (_) {}
    try { if (typeof OLP_TVL !== 'undefined' && OLP_TVL > 0) return OLP_TVL; } catch (_) {}
    return null;
  }

  var MONITORS = [
    {
      k: 'wallets',
      n: '01',
      title: 'Top 100 airdropped wallets',
      sub: 'distribution behaviour after TGE',
      state: 'nothing to watch yet',
      ready: 0,
      watches: 'The net balance of the 100 largest airdrop recipients, day by day. It is the read on whether the people handed free supply are still selling it.',
      flips: 'Net balance of the top 100 stops falling — three consecutive days of flat-to-positive net flow.',
      matters: 'This is the gate the playbook puts on converting spot into collateral. Until it reads clear, nothing else in the plan moves.',
      inputs: [
        { t: 'A $VAR token', has: false, why: 'Not launched. No TGE date announced.' },
        { t: 'An allocation list', has: false, why: 'No airdrop recipients published, so there is no set of 100 to rank.' },
        { t: 'An indexer on the airdrop contract', has: false, why: 'Nothing to index against until the contract exists.' }
      ]
    },
    {
      k: 'olp',
      n: '02',
      title: 'OLP deposits ÷ VAR staked',
      sub: 'the flywheel ratio',
      state: 'numerator live, denominator missing',
      ready: 1,
      watches: 'Deposits sitting in the OLP vault against the amount of $VAR locked in staking. One number over the other, tracked over time.',
      flips: 'Rising means deposits arrive faster than tokens are locked. Falling means the staking yield is being paid for by nothing.',
      matters: 'It is the only one of the playbook’s five that measures the business rather than the price. Deposits are what the vault actually earns on.',
      inputs: [
        { t: 'OLP vault deposits', has: true, why: 'Already read on-chain from the Core OLP Vault, the same figure the Fundamentals tab uses.' },
        { t: '$VAR staked', has: false, why: 'No token, so nothing is staked and the denominator is zero.' }
      ]
    }
  ];

  function card(m) {
    var live = m.k === 'olp' ? olpLive() : null;
    var have = m.inputs.filter(function (i) { return i.has; }).length;

    var inputs = m.inputs.map(function (i) {
      return '<li class="mn-input' + (i.has ? ' has' : '') + '">' +
        '<span class="mn-dot" aria-hidden="true">' + (i.has ? '✓' : '—') + '</span>' +
        '<b>' + esc(i.t) + '</b><em>' + esc(i.why) + '</em></li>';
    }).join('');

    /* The one panel with a live input shows it. An empty box would say the same
       thing as the wallet monitor, and they are not in the same state. */
    var value = '';
    if (m.k === 'olp') {
      value = '<div class="mn-live">' +
        '<div class="mn-live-row"><span>OLP vault deposits</span>' +
        '<b>' + (live ? esc(usd(live)) : 'reading on-chain…') + '</b>' +
        '<em>live from the Core OLP Vault</em></div>' +
        '<div class="mn-live-row off"><span>$VAR staked</span><b>—</b>' +
        '<em>no token to stake yet</em></div>' +
        '<div class="mn-live-row out"><span>Ratio</span><b>—</b>' +
        '<em>needs both sides</em></div></div>';
    }

    return '<article class="mn-card ' + m.k + '">' +
      '<header class="mn-head"><span class="mn-n">' + m.n + '</span>' +
      '<div><b>' + esc(m.title) + '</b><small>' + esc(m.sub) + '</small></div></header>' +
      /* the status sits on its own row: one of these labels is three words and the
         other is four, and inline they landed on different lines per card */
      '<p class="mn-badge-row"><span class="mn-badge' + (m.ready ? ' part' : '') + '">' +
      esc(m.state) + '</span></p>' +
      value +
      '<dl class="mn-dl">' +
      '<dt>What it watches</dt><dd>' + esc(m.watches) + '</dd>' +
      '<dt>What flips it</dt><dd>' + esc(m.flips) + '</dd>' +
      '<dt>Why it matters</dt><dd>' + esc(m.matters) + '</dd>' +
      '</dl>' +
      '<div class="mn-need"><span class="mn-need-h">What it needs first' +
      '<i>' + have + ' of ' + m.inputs.length + ' ready</i></span>' +
      '<ul class="mn-inputs">' + inputs + '</ul></div>' +
      '</article>';
  }

  /* ---------- Post-TGE stats ----------
     Henrik's five buy-back questions, run as numbers: each fundamental's average over the
     30 days before the start against its average since. Points pull activity forward, so
     the read that matters after listing is how much of the pre-TGE level survives without
     them — not where the token trades.

     TGE_DATE is unannounced. Until it is set, the post column is empty and the baseline is
     the last 30 days; a reader can pick a past date to preview how the comparison reads.
     Volume and OI are DeFiLlama daily closes (same feed as Historical Data); revenue is
     the treasury's daily on-chain inflow (20% of spreads); TVL and markets come from the
     biweekly reports and the live stats endpoint. Trader counts are not published. */
  var TGE_DATE = null;   /* 'YYYY-MM-DD' once $VAR lists */
  var PRE_DAYS = 30;
  var START_KEY = 'varPostTgeStartV1';
  var STATS_URL = 'https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats';
  var previewStart = null;
  try { previewStart = localStorage.getItem(START_KEY) || null; } catch (_) {}
  var liveStats = null;

  function loadStats() {
    try {
      fetch(STATS_URL, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (s) {
        if (s && +s.tvl > 0) { liveStats = { tvl: +s.tvl, markets: +s.num_markets }; render(); }
      }).catch(function () {});
    } catch (_) {}
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function addDays(d, n) {
    var t = Date.parse(d + 'T00:00:00Z') + n * 864e5;
    return new Date(t).toISOString().slice(0, 10);
  }
  function daysBetween(a, b) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5); }

  /* complete UTC days only: today's row is still filling in */
  function daily(k) {
    var cut = today(), out = [];
    try {
      if (k === 'vol' || k === 'oi') {
        var a = typeof MARKET_ACTIVITY !== 'undefined' ? MARKET_ACTIVITY[k === 'vol' ? 'volume' : 'oi'] : null;
        (a || []).forEach(function (x) { if (x.d < cut) out.push(x); });
      } else if (k === 'rev' && typeof SERIES !== 'undefined') {
        /* the treasury never pays out, so a day's inflow is the change in balance, spread
           evenly over any days the sampler skipped */
        for (var i = 1; i < SERIES.length; i++) {
          var gap = daysBetween(SERIES[i - 1].d, SERIES[i].d);
          var dv = SERIES[i].v - SERIES[i - 1].v;
          if (gap < 1 || dv < 0 || SERIES[i].d >= cut) continue;
          for (var g = gap - 1; g >= 0; g--) out.push({ d: addDays(SERIES[i].d, -g), v: dv / gap });
        }
      }
    } catch (_) {}
    return out;
  }
  function avg(rows) {
    if (!rows.length) return null;
    return rows.reduce(function (s, r) { return s + r.v; }, 0) / rows.length;
  }
  function windows(series, start) {
    var preFrom = addDays(start, -PRE_DAYS);
    return {
      pre: series.filter(function (r) { return r.d >= preFrom && r.d < start; }),
      post: series.filter(function (r) { return r.d >= start; })
    };
  }
  function reports() { try { return typeof BIWEEKLY_HISTORY !== 'undefined' ? BIWEEKLY_HISTORY : []; } catch (_) { return []; } }
  /* a report covers the two weeks before its date, so only one dated 13+ days after the
     start is wholly post-TGE */
  function reportsPre(start, k) { return reports().filter(function (r) { return r.asOf < start && r[k] != null; }); }
  function reportsPost(start, k) { return reports().filter(function (r) { return r.asOf >= addDays(start, 13) && r[k] != null; }); }

  function verdict(ratio, grow) {
    if (ratio == null) return { cls: 'wait', t: 'starts at listing' };
    if (grow && ratio >= 1) return { cls: 'ok', t: 'growing' };
    if (ratio >= 0.9) return { cls: 'ok', t: 'holding' };
    if (ratio >= 0.6) return { cls: 'warn', t: 'softening' };
    return { cls: 'bad', t: 'falling' };
  }

  function spark(series, start, hasPost) {
    var rows = series.slice(-120);
    if (rows.length < 3) return '<div class="pt-spark empty">no daily series yet</div>';
    var W = 240, H = 46, max = 0;
    rows.forEach(function (r) { if (r.v > max) max = r.v; });
    var x = function (i) { return i / (rows.length - 1) * W; };
    var y = function (v) { return H - 3 - (max ? v / max : 0) * (H - 8); };
    var pts = rows.map(function (r, i) { return x(i).toFixed(1) + ',' + y(r.v).toFixed(1); }).join(' ');
    var idx = function (d) { for (var i = 0; i < rows.length; i++) if (rows[i].d >= d) return i; return rows.length - 1; };
    var preFrom = addDays(start, -PRE_DAYS);
    var x0 = rows[0].d > preFrom ? 0 : x(idx(preFrom));
    var x1 = hasPost ? x(idx(start)) : W;
    var s = '<svg class="pt-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect x="' + x0.toFixed(1) + '" y="0" width="' + Math.max(1, x1 - x0).toFixed(1) + '" height="' + H + '" class="pt-prewin"/>' +
      '<polyline points="' + pts + '" class="pt-line"/>';
    if (hasPost) s += '<line x1="' + x1.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y1="0" y2="' + H + '" class="pt-start"/>';
    return s + '</svg>';
  }

  function postTgeStats() {
    var listed = !!TGE_DATE;
    var start = TGE_DATE || previewStart || today();
    var live = listed || !!previewStart;
    var preview = !listed && !!previewStart;

    var rows = [];
    function seriesRow(o) {
      var s = daily(o.series), w = windows(s, start);
      var pre = avg(w.pre), post = live ? avg(w.post) : null;
      var ratio = pre && post != null ? post / pre : null;
      rows.push({ o: o, pre: pre, post: post, ratio: ratio, preN: w.pre.length, postN: w.post.length,
        spark: spark(s, start, live && w.post.length > 0), v: verdict(ratio, o.grow) });
    }
    seriesRow({ k: 'vol', n: '01', name: 'Volume', q: 'Can volume stay elevated without points?', series: 'vol',
      unit: 'perp volume / day', src: 'DeFiLlama daily' });
    seriesRow({ k: 'oi', n: '02', name: 'Open interest', q: 'Can OI keep growing?', series: 'oi', grow: true,
      unit: 'end-of-day OI', src: 'DeFiLlama daily' });
    seriesRow({ k: 'rev', n: '03', name: 'Revenue', key: true, q: 'Can revenue hold up? — his most important metric', series: 'rev',
      unit: 'treasury inflow / day', src: 'on-chain · 20% of spreads' });

    /* revenue again on the reports' own basis, so the on-chain read can be checked */
    var nrPre = reportsPre(start, 'netRevenue2w').slice(-2), nrPost = live ? reportsPost(start, 'netRevenue2w') : [];
    var nrPreV = nrPre.length ? avg(nrPre.map(function (r) { return { v: r.netRevenue2w }; })) : null;
    var nrPostV = nrPost.length ? avg(nrPost.map(function (r) { return { v: r.netRevenue2w }; })) : null;

    /* retention: no trader counts are published, so the read is capital that stays */
    var tvPre = reportsPre(start, 'tvl').slice(-1)[0];
    var tvPostRep = live ? reportsPost(start, 'tvl').slice(-1)[0] : null;
    var tvPost = live ? (listed && liveStats ? liveStats.tvl : tvPostRep ? tvPostRep.tvl : (liveStats && start <= today() ? liveStats.tvl : null)) : null;
    var tvRatio = tvPre && tvPost ? tvPost / tvPre.tvl : null;
    var mkPre = reportsPre(start, 'markets').slice(-1)[0];
    var mkPost = live && liveStats ? liveStats.markets : null;

    function money(v) { return v == null ? '—' : esc(usd(v)); }
    function ratioStr(r) { return r == null ? '—' : (r >= 1 ? '+' : '−') + Math.abs((r - 1) * 100).toFixed(0) + '%'; }

    var html = rows.map(function (r) {
      return '<div class="pt-row' + (r.o.key ? ' key' : '') + '">' +
        '<div class="pt-q"><span>' + r.o.n + '</span><b>' + esc(r.o.name) + (r.o.key ? ' <em>key</em>' : '') + '</b><p>' + esc(r.o.q) + '</p></div>' +
        '<div class="pt-v"><small>Pre-TGE 30D</small><b>' + money(r.pre) + '</b><i>' + esc(r.o.unit) + '</i></div>' +
        '<div class="pt-v"><small>Post-TGE avg</small><b>' + (live ? money(r.post) : '—') + '</b><i>' + (live ? r.postN + ' day' + (r.postN === 1 ? '' : 's') + ' counted' : 'starts at listing') + '</i></div>' +
        '<div class="pt-v"><small>vs pre-TGE</small><b class="pt-' + r.v.cls + '">' + ratioStr(r.ratio) + '</b><i class="pt-pill ' + r.v.cls + '">' + esc(r.v.t) + '</i></div>' +
        '<div class="pt-sp">' + r.spark + '<i>' + esc(r.o.src) + '</i></div></div>';
    }).join('');

    var tvV = verdict(tvRatio, false);
    html += '<div class="pt-row">' +
      '<div class="pt-q"><span>04</span><b>Retention</b><p>Do traders stay once the incentive structure stops or changes?</p></div>' +
      '<div class="pt-v"><small>Pre-TGE report</small><b>' + (tvPre ? money(tvPre.tvl) : '—') + '</b><i>TVL' + (tvPre ? ' · ' + esc(tvPre.asOf) : '') + '</i></div>' +
      '<div class="pt-v"><small>Post-TGE</small><b>' + money(tvPost) + '</b><i>' + (live ? (listed && liveStats ? 'live TVL' : tvPostRep ? 'report ' + esc(tvPostRep.asOf) : 'live TVL') : 'starts at listing') + '</i></div>' +
      '<div class="pt-v"><small>vs pre-TGE</small><b class="pt-' + tvV.cls + '">' + ratioStr(tvRatio) + '</b><i class="pt-pill ' + tvV.cls + '">' + esc(tvV.t) + '</i></div>' +
      '<div class="pt-sp pt-txt"><p>Capital that stays is the proxy. Daily and weekly active traders are not published (DAU/WAU blank in every recent biweekly report), so trader retention itself cannot be measured yet.</p></div></div>';

    var prod = [
      { t: 'SWAPs live', st: 'live', cls: 'ok' },
      { t: 'PRO', st: 'not live', cls: 'wait' },
      { t: 'Trading API', st: 'in preparation · v0.38.1', cls: 'warn' },
      { t: 'Markets listed', st: (mkPre ? mkPre.markets : '—') + (mkPost ? ' → ' + mkPost : ''), cls: mkPost && mkPre ? (mkPost >= mkPre.markets ? 'ok' : 'warn') : 'wait' }
    ].map(function (p) { return '<li><b>' + esc(p.t) + '</b><i class="pt-pill ' + p.cls + '">' + esc(p.st) + '</i></li>'; }).join('');
    html += '<div class="pt-row">' +
      '<div class="pt-q"><span>05</span><b>Product</b><p>Does PRO deliver, and do arbitrage traders onboard once API is live?</p></div>' +
      '<ul class="pt-prod">' + prod + '</ul></div>';

    var counted = rows.filter(function (r) { return r.ratio != null; }).concat(tvRatio != null ? [{ v: tvV }] : []);
    var holding = counted.filter(function (r) { return r.v.cls === 'ok'; }).length;

    var startCtl = listed ? '' :
      '<div class="pt-ctl"><label>Preview a start <input type="date" data-pt-start max="' + today() + '" value="' + (previewStart || '') + '"></label>' +
      (previewStart ? '<button type="button" data-pt-clear>clear preview</button>' : '') +
      '<span>TGE date not announced — the post column fills from listing day.</span></div>';

    return '<section class="pt" id="post-tge-stats">' +
      '<div class="cmp-heading"><span class="cmp-eyebrow">POST-TGE STATS · START</span>' +
      '<h2>Do the fundamentals hold once the points stop?</h2>' +
      '<p>Points pull activity forward. After listing, the question is not who sells their points but how much of the pre-TGE business survives without them. Each row is one of the five questions from <a href="https://x.com/Henrik_on_HL/status/2100614542053019776" target="_blank" rel="noopener noreferrer">Henrik’s playbook</a>, measured as the average since the start against the 30 days before it.</p></div>' +
      startCtl +
      '<div class="pt-sum">' +
        '<div><span>Start</span><b>' + esc(start) + '</b><em>' + (listed ? 'TGE' : preview ? 'preview · not the TGE' : 'today · not listed yet') + '</em></div>' +
        '<div><span>Pre-TGE window</span><b>' + esc(addDays(start, -PRE_DAYS).slice(5)) + ' → ' + esc(addDays(start, -1).slice(5)) + '</b><em>' + PRE_DAYS + ' days, the baseline</em></div>' +
        '<div><span>Post-TGE window</span><b>' + (live ? Math.max(0, daysBetween(start, today())) + ' days' : '—') + '</b><em>' + (live ? 'complete UTC days since start' : 'opens at listing') + '</em></div>' +
        '<div class="' + (counted.length ? (holding === counted.length ? 'ok' : holding ? 'warn' : 'bad') : '') + '"><span>Holding</span><b>' + (counted.length ? holding + ' / ' + counted.length : '—') + '</b><em>fundamentals at ≥90% of baseline</em></div>' +
      '</div>' +
      '<div class="pt-rows">' + html + '</div>' +
      '<div class="tp-note"><b>Reading it.</b> vs pre-TGE = post-TGE average ÷ pre-TGE average, as a change. Holding ≥90%, softening 60–90%, falling below 60%; OI counts as growing above 100%. Net revenue on the biweekly reports’ basis: ' +
        (nrPreV ? esc(usd(nrPreV)) + ' per two weeks before the start' : 'no pre-start report') +
        (live ? (nrPostV ? ', ' + esc(usd(nrPostV)) + ' after (' + ratioStr(nrPostV / nrPreV) + ')' : ', no wholly post-start report yet') : '') +
        '. The first days after a listing are the noisiest, so a week or two of post data says more than day one.</div>' +
      '</section>';
  }

  function render() {
    var host = document.querySelector('[data-tg="monitors"]');
    if (!host) return;
    host.innerHTML =
      postTgeStats() +
      '<div class="cmp-heading pt-next"><span class="cmp-eyebrow">PLAYBOOK MONITORS</span>' +
      '<h2>Two things worth watching, neither of which can run yet</h2>' +
      '<p>Both come straight out of the playbook. They are here rather than there because they are meant to run every day once they can, not be read once. Nothing below is live: what each panel shows is the list of inputs it needs and which of them already exist. The wallet monitor has none of its three. The OLP ratio already has one of its two, read on-chain, and is waiting only on a token.</p></div>' +
      '<div class="mn-grid">' + MONITORS.map(card).join('') + '</div>' +
      '<div class="tp-note"><b>Why these two and not the other three.</b> The playbook lists five monitors. The other three — week-one entry sizing, spot posted as collateral, and on-chain pools hedged with perp longs — are decisions taken once at a point in time, and they already have a home in the Playbook tab. These two are ratios that only mean anything as a series, which is what a monitor is for. Neither will show a number until the token exists; this page will say so plainly until then rather than filling the space with a placeholder chart.</div>';
  }

  function mount() {
    if (document.querySelector('[data-tg="monitors"]')) return;
    var main = document.querySelector('#main');
    if (!main) return;
    var sec = document.createElement('section');
    sec.className = 'monitors-report tsec tg-hide';
    sec.setAttribute('data-tg', 'monitors');
    var anchor = document.querySelector('[data-tg="roadmap"]');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else main.appendChild(sec);
    mountTabButton();
    mountRail();
  }

  /* #tabs is the source of tab state: showTab() reads it and the side rail only
     delegates into it, so a section without a #tab-<name> button never unhides. */
  function mountTabButton() {
    if (document.getElementById('tab-monitors')) return;
    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    var after = document.getElementById('tab-roadmap');
    var b = document.createElement('button');
    b.id = 'tab-monitors';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.dataset.tab = 'monitors';
    b.textContent = 'Monitors';
    if (after && after.parentNode === tabs) tabs.insertBefore(b, after);
    else tabs.appendChild(b);
  }

  function mountRail() {
    var rails = {};
    document.querySelectorAll('[data-open-tab="roadmap"]').forEach(function (btn) {
      var rail = btn.parentNode;
      if (!rail || rail.querySelector('[data-open-tab="monitors"]')) return;
      var mine = btn.cloneNode(true);
      mine.setAttribute('data-open-tab', 'monitors');
      var strong = mine.querySelector('strong') || mine.querySelector('b');
      if (strong) strong.textContent = 'Monitors';
      var small = mine.querySelector('small');
      if (small) small.textContent = 'pre vs post TGE';
      rail.insertBefore(mine, btn);
      rails[rail.className || 'rail'] = rail;
    });
    /* the rail numbers itself top to bottom, so every button is renumbered */
    Object.keys(rails).forEach(function (k) {
      var kids = rails[k].querySelectorAll('[data-open-tab]');
      [].forEach.call(kids, function (b, i) {
        var num = ('0' + (i + 1)).slice(-2);
        var span = b.querySelector('span');
        if (span) span.textContent = num;
        var name = b.querySelector('strong') || b.querySelector('b');
        if (name) b.setAttribute('aria-label', num + ' ' + name.textContent);
      });
    });
  }

  function registerTab() {
    try {
      if (typeof VALID_TABS !== 'undefined' && VALID_TABS.indexOf('monitors') < 0) VALID_TABS.push('monitors');
      if (typeof DEFAULT_TAB_ORDER !== 'undefined' && DEFAULT_TAB_ORDER.indexOf('monitors') < 0) {
        var i = DEFAULT_TAB_ORDER.indexOf('plan');
        if (i < 0) i = DEFAULT_TAB_ORDER.indexOf('paths');
        DEFAULT_TAB_ORDER.splice(i < 0 ? DEFAULT_TAB_ORDER.length : i + 1, 0, 'monitors');
      }
      if (typeof SECTION_COPY !== 'undefined') SECTION_COPY.monitors = {
        eyebrow: 'Monitors',
        title: 'Monitors',
        description: 'Post-TGE stats: whether volume, OI, revenue, retention and product hold against their pre-TGE baseline, plus the two playbook monitors.',
        chip: 'pre vs post'
      };
    } catch (_) {}
  }

  var PT_CSS =
    '.pt{margin:0 0 34px}.pt .cmp-heading a{color:var(--v2-accent,#4c9af8)}' +
    '.pt-ctl{display:flex;align-items:center;flex-wrap:wrap;gap:10px 14px;margin:0 0 14px;color:var(--muted);font:700 10px var(--mono);letter-spacing:.5px;text-transform:uppercase}' +
    '.pt-ctl label{display:inline-flex;align-items:center;gap:8px}.pt-ctl input{padding:6px 8px;border:1px solid var(--line);border-radius:4px;background:var(--panel);color:var(--text);font:700 12px var(--mono)}' +
    '.pt-ctl button{padding:6px 10px;border:1px dashed var(--line);border-radius:4px;background:none;color:var(--muted);font:700 10px var(--mono);cursor:pointer}.pt-ctl span{text-transform:none;letter-spacing:0;font-weight:500;font-size:11px}' +
    '.pt-sum{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 14px}' +
    '.pt-sum>div{padding:13px 15px;border:1px solid var(--line);background:var(--panel);min-width:0}' +
    '.pt-sum span{display:block;color:var(--muted);font:800 9px var(--mono);letter-spacing:.8px;text-transform:uppercase}' +
    '.pt-sum b{display:block;margin:8px 0 4px;color:var(--text);font:800 20px/1 var(--mono);letter-spacing:-.5px}.pt-sum em{color:var(--muted);font-size:10.5px;font-style:normal}' +
    '.pt-sum>div.ok b{color:#2fb37e}.pt-sum>div.warn b{color:#d99a2b}.pt-sum>div.bad b{color:#e2546f}' +
    '.pt-rows{display:grid;gap:8px;margin:0 0 12px}' +
    '.pt-row{display:grid;grid-template-columns:minmax(200px,1.5fr) repeat(3,minmax(0,.8fr)) minmax(170px,1.1fr);gap:14px;align-items:center;padding:14px 16px;border:1px solid var(--line);background:var(--panel)}' +
    '.pt-row.key{border-color:var(--v2-accent,#4c9af8);box-shadow:inset 3px 0 0 var(--v2-accent,#4c9af8)}' +
    '.pt-q span{color:var(--dim,var(--muted));font:800 9px var(--mono)}.pt-q b{display:block;margin:4px 0 3px;color:var(--text);font:800 14px var(--sans)}' +
    '.pt-q b em{margin-left:6px;padding:1px 6px;border-radius:3px;background:var(--v2-accent,#4c9af8);color:#04101d;font:800 9px var(--mono);font-style:normal;text-transform:uppercase;vertical-align:2px}' +
    '.pt-q p{margin:0;color:var(--muted)!important;font-size:11.5px;line-height:1.5}' +
    '.pt-v{min-width:0}.pt-v small{display:block;color:var(--muted);font:800 8.5px var(--mono);letter-spacing:.7px;text-transform:uppercase}' +
    '.pt-v b{display:block;margin:6px 0 3px;color:var(--text);font:800 17px/1 var(--mono);letter-spacing:-.4px}.pt-v i{color:var(--muted);font-size:10.5px;font-style:normal}' +
    '.pt-v b.pt-ok{color:#2fb37e}.pt-v b.pt-warn{color:#d99a2b}.pt-v b.pt-bad{color:#e2546f}' +
    '.pt-pill{display:inline-block;padding:2px 7px;border-radius:3px;border:1px solid var(--line);color:var(--muted);font:800 9px var(--mono)!important;font-style:normal;letter-spacing:.4px;text-transform:uppercase}' +
    '.pt-pill.ok{border-color:#2fb37e;color:#2fb37e}.pt-pill.warn{border-color:#d99a2b;color:#d99a2b}.pt-pill.bad{border-color:#e2546f;color:#e2546f}' +
    '.pt-sp{min-width:0}.pt-sp>i{display:block;margin-top:3px;color:var(--dim,var(--muted));font:9px var(--mono);font-style:normal;text-align:right}' +
    '.pt-spark{display:block;width:100%;height:46px}.pt-spark.empty{display:flex;align-items:center;justify-content:center;color:var(--muted);font:10px var(--mono);border:1px dashed var(--line)}' +
    '.pt-prewin{fill:var(--v2-accent,#4c9af8);fill-opacity:.1}.pt-line{fill:none;stroke:var(--v2-accent,#4c9af8);stroke-width:1.5;vector-effect:non-scaling-stroke}' +
    '.pt-start{stroke:var(--text);stroke-width:1.5;stroke-dasharray:3 3;vector-effect:non-scaling-stroke}' +
    '.pt-txt p{margin:0;color:var(--muted)!important;font-size:11px;line-height:1.5}' +
    '.pt-prod{grid-column:2/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0;padding:0;list-style:none}' +
    '.pt-prod li{padding:10px 12px;border:1px solid var(--line);min-width:0}.pt-prod b{display:block;margin:0 0 6px;color:var(--text);font:800 12px var(--sans)}' +
    '.pt-next{margin-top:8px}' +
    '@media(max-width:1000px){.pt-row{grid-template-columns:repeat(3,minmax(0,1fr))}.pt-q,.pt-sp,.pt-txt{grid-column:1/-1}.pt-prod{grid-column:1/-1;grid-template-columns:repeat(2,minmax(0,1fr))}.pt-sum{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '@media(max-width:520px){.pt-v b{font-size:15px}}';
  function injectStyle() {
    if (document.getElementById('pt-style')) return;
    var st = document.createElement('style');
    st.id = 'pt-style';
    st.textContent = PT_CSS;
    document.head.appendChild(st);
  }

  function boot() {
    injectStyle();
    registerTab();
    mount();
    render();
    /* the OLP balance arrives from an on-chain read well after load, so the one
       live figure on the page is re-read a few times rather than once */
    var tries = 0;
    var timer = setInterval(function () {
      if (++tries > 20) { clearInterval(timer); return; }
      if (olpLive() != null) { render(); clearInterval(timer); }
    }, 1500);
    loadStats();
    /* the DeFiLlama daily history lands a few seconds after load */
    var mTries = 0;
    var mTimer = setInterval(function () {
      if (++mTries > 30) { clearInterval(mTimer); return; }
      try { if (MARKET_ACTIVITY.volume.length && MARKET_ACTIVITY.oi.length) { render(); clearInterval(mTimer); } } catch (_) {}
    }, 1500);
    document.addEventListener('change', function (e) {
      if (!e.target || !e.target.matches || !e.target.matches('[data-pt-start]')) return;
      var v = e.target.value;
      previewStart = /^\d{4}-\d{2}-\d{2}$/.test(v) && v <= today() ? v : null;
      try { previewStart ? localStorage.setItem(START_KEY, previewStart) : localStorage.removeItem(START_KEY); } catch (_) {}
      render();
    });
    document.addEventListener('click', function (e) {
      if (!e.target || !e.target.closest || !e.target.closest('[data-pt-clear]')) return;
      previewStart = null;
      try { localStorage.removeItem(START_KEY); } catch (_) {}
      render();
    });
    var tabs = document.getElementById('tabs');
    if (tabs) tabs.addEventListener('click', function (e) {
      var b = e.target && e.target.closest && e.target.closest('button');
      if (b && b.dataset.tab === 'monitors') setTimeout(render, 40);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
