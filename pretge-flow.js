/* Pre-TGE tab: "Fee -> Revenue -> Buyback" 30D / 90D comparison.
   Renders into <div id="hc-flow"> (created by pretge-health.js). Fetching and the ladder
   markup are shared with the Overview day card through window.LighterCompare
   (lighter-compare.js); Variational daily treasury inflow and report-observed share come
   from dashboard.js globals (SERIES, dailyEarn, spreadShareAt, resetDateKey).
   Loaded with defer; no inline script (CSP script-src 'self'). */
(function () {
  'use strict';

  var LC = null;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var S = { n: 30, state: 'idle' };   // state: idle | loading | ready | error
  var host = null, body = null, loadedOnce = false, cache = null;

  var usd0 = function (v) { return '$' + Math.round(v).toLocaleString('en-US'); };
  var usdK = function (v) {
    var a = Math.abs(v);
    if (a >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + v.toFixed(0);
  };
  var pct = function (f) { return Number.isFinite(f) ? (f * 100).toFixed(1) + '%' : '—'; };
  function addDaysIso(d, n) { return new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10); }
  function fDay(d) { var p = d.split('-').map(Number); return MON[p[1] - 1] + ' ' + p[2]; }
  function fFull(d) { var p = d.split('-').map(Number); return MON[p[1] - 1] + ' ' + p[2] + ', ' + p[0]; }
  function todayUtc() { return new Date().toISOString().slice(0, 10); }

  /* ---------- Variational: closed daily treasury inflow + report-observed share ---------- */
  function varDaily() {
    var out = new Map();
    try {
      var closedBefore = resetDateKey(), last = SERIES[SERIES.length - 1].d;
      dailyEarn().forEach(function (x) {
        if (!(x.d < closedBefore && x.d <= last) || !Number.isFinite(x.e)) return;
        var rate = spreadShareAt(x.d).rate;
        if (rate > 0) out.set(x.d, { amt: Math.max(0, x.e), rate: rate, spread: Math.max(0, x.e) / rate });
      });
    } catch (e) { /* dashboard globals missing -> empty */ }
    return out;
  }

  function maxKey(m) { var k = ''; m.forEach(function (v, d) { if (d > k) k = d; }); return k; }

  /* Window = last N UTC days ending at the earlier of both series' last complete day. */
  function build(N, V, L) {
    var utc = todayUtc();
    var lastV = maxKey(V);
    var lastL = ''; L.forEach(function (v, d) { if (d < utc && d > lastL) lastL = d; });
    if (!lastV || !lastL) return null;
    var end = lastV < lastL ? lastV : lastL;
    var days = [], skipped = 0;
    for (var i = N - 1; i >= 0; i--) {
      var d = addDaysIso(end, -i);
      if (V.has(d) && L.has(d)) days.push(d); else skipped++;
    }
    if (!days.length) return null;
    return { N: N, end: end, start: addDaysIso(end, -(N - 1)), days: days, skipped: skipped, varEarlier: lastV < lastL, lastV: lastV, lastL: lastL };
  }

  function totals(w, V, L) {
    var t = { vFee: 0, vRev: 0, lFee: 0, lRev: 0, lBuy: 0, lBuyLit: 0, lLiq: 0 };
    w.days.forEach(function (d) {
      var v = V.get(d), l = L.get(d);
      t.vFee += v.spread; t.vRev += v.amt;
      t.lFee += l.fee; t.lRev += l.revenue; t.lBuy += l.buybackUsd; t.lBuyLit += l.buybackLit; t.lLiq += l.liqFee;
    });
    t.rate = t.vFee > 0 ? t.vRev / t.vFee : NaN;
    return t;
  }

  /* Volume-normalised buyback uses only days where that venue has a DeFiLlama volume. */
  function perMillion(w, V, L, vol) {
    var vv = 0, vb = 0, lv = 0, lb = 0, vn = 0, ln = 0;
    w.days.forEach(function (d) {
      if (vol.var.has(d)) { vv += vol.var.get(d); vb += V.get(d).amt; vn++; }
      if (vol.lit.has(d)) { lv += vol.lit.get(d); lb += L.get(d).buybackUsd; ln++; }
    });
    return {
      v: vv > 0 ? vb / vv * 1e6 : NaN, l: lv > 0 ? lb / lv * 1e6 : NaN,
      vFull: vn === w.days.length, lFull: ln === w.days.length
    };
  }

  /* ---------- rendering ---------- */
  function shell() {
    host.innerHTML =
      '<section class="hp-valuation pf-flow">' +
        '<header><span>AFTER TGE · WHERE THE FEES GO</span><h3>Fee → Revenue → Buyback</h3></header>' +
        '<p class="pf-lede">Lighter already buys back LIT with its revenue. Variational\'s treasury is earmarked for $VAR buy &amp; burn after TGE. Same window, both venues.</p>' +
        '<div class="pf-bar"><div class="lc-seg sm" role="group" aria-label="Range" id="pfSeg">' +
          '<button type="button" data-n="30" aria-pressed="true">30D</button>' +
          '<button type="button" data-n="90" aria-pressed="false">90D</button></div>' +
          '<p class="pf-win" id="pfWin" aria-live="polite"></p></div>' +
        '<div id="pfBody"></div>' +
      '</section>';
    body = host.querySelector('#pfBody');
    host.querySelector('#pfSeg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.n = +b.getAttribute('data-n');
      sync();
      if (S.state === 'ready') paint();
    });
    sync();
  }

  function sync() {
    [].forEach.call(host.querySelectorAll('#pfSeg button'), function (b) {
      b.setAttribute('aria-pressed', +b.getAttribute('data-n') === S.n);
    });
  }

  function msg(t) { body.innerHTML = '<p class="lc-wait pf-msg">' + t + '</p>'; host.querySelector('#pfWin').innerHTML = ''; }

  function paint() {
    if (!cache) return;
    var C = { V: varDaily(), L: cache.L };   // dashboard.js extends SERIES after load, so re-read it each paint
    seriesKey = varKey();
    var w = build(S.n, C.V, C.L);
    if (!w) { msg('Treasury data unavailable'); return; }
    var t = totals(w, C.V, C.L);
    host.querySelector('#pfWin').innerHTML =
      '<span>Window</span> <b>' + fDay(w.days[0]) + ' – ' + fFull(w.days[w.days.length - 1]) + '</b> <span>·</span> <b>' + w.days.length + '</b> <span>UTC days</span>';

    var litBuy = t.lBuy, rpm;
    var ladder = LC.renderLadder(null,
      { fee: t.vFee, revenue: t.vRev, buyback: t.vRev, rate: t.rate },
      { fee: t.lFee, revenue: t.lRev, buyback: litBuy, buybackLit: t.lBuyLit },
      { litHead: 'Lighter · UTC days' });

    function runRows(vol) {
      rpm = vol ? perMillion(w, C.V, C.L, vol) : null;
      var ann = function (x) { return usdK(x * 365 / w.days.length); };
      var perM = function (x, full) { return Number.isFinite(x) ? '<b>' + usd0(x) + '</b>' + (full ? '' : ' <em>partial volume data</em>') : '<b>—</b>'; };
      return '<div class="pf-run"><div class="hp-table-scroll"><table class="hp-table"><thead><tr><th>Run-rate</th><th>Variational</th><th>Lighter</th></tr></thead><tbody>' +
        '<tr><th scope="row">Annualised buyback</th><td><b>' + ann(t.vRev) + '</b> <em>planned</em></td><td><b>' + ann(litBuy) + '</b></td></tr>' +
        '<tr><th scope="row">Buyback per $1M volume</th><td>' + (rpm ? perM(rpm.v, rpm.vFull) : '<b>…</b>') + ' <em>planned</em></td><td>' + (rpm ? perM(rpm.l, rpm.lFull) : '<b>…</b>') + '</td></tr>' +
        '<tr><th scope="row">Revenue → buyback</th><td><b>100%</b> <em>planned</em></td><td><b>' + pct(t.lRev > 0 ? litBuy / t.lRev : NaN) + '</b></td></tr>' +
        '</tbody></table></div></div>';
    }

    var notes = '';
    if (w.varEarlier) notes += '<p class="lc-lnote">Window ends at the earlier series: Variational\'s treasury data stops before Lighter\'s.</p>';
    if (w.skipped > 0) notes += '<p class="lc-lnote">Fewer complete days than requested are available in both series.</p>';
    notes += '<p class="lc-lnote"><span>Liquidation fees</span> <b>' + usd0(t.lLiq) + '</b> <span>went to Lighter\'s LLP over this window, outside this flow.</span></p>' +
      '<p class="lc-lnote sub">Fee steps use different bases (modeled vs reported). Compare each venue\'s flow, not the dollar levels across columns.</p>' +
      '<details class="hc-sources"><summary>Sources &amp; definitions</summary>' +
        '<p><span>Lighter:</span> <code>mainnet.zklighter.elliot.ai/api/v1/exchangeMetrics</code> <span>(Core) and</span> <code>api.rh.lighter.xyz/api/v1/exchangeMetrics</code> <span>(Robinhood Chain), kinds maker_fee, taker_fee, liquidation_fee, buyback_usdc, buyback. Daily UTC values.</span></p>' +
        '<p><span>Volume:</span> <code>api.llama.fi/v2/chart/derivatives/protocol</code> <span>for both venues, same source.</span></p>' +
        '<p>Robinhood Chain fees are counted at Lighter\'s 50% share in Revenue and at 100% in Fee. Liquidation fees are excluded from Fee, Revenue and Buyback.</p>' +
        '<p>Variational gross spreads are implied: each day\'s treasury inflow divided by the share of spreads the treasury received in the latest official report. They are modeled, not reported.</p>' +
        '<p>Variational buyback equals treasury inflow, planned at 100%. Nothing is bought or burned until after TGE.</p>' +
      '</details>';

    body.innerHTML = '<div class="pf-ladder">' + ladder + '</div><div id="pfRun">' + runRows(null) + '</div>' + notes;

    var token = ++paintToken;
    LC.loadVolumes(w.days).then(function (vol) {
      if (token !== paintToken) return;
      var slot = host.querySelector('#pfRun'); if (slot) slot.innerHTML = runRows(vol);
    }, function () {
      if (token !== paintToken) return;
      var slot = host.querySelector('#pfRun'); if (slot) { rpm = null; slot.innerHTML = runRows(null).replace(/<b>…<\/b>/g, '<b>—</b>'); }
    });
  }
  var paintToken = 0, seriesKey = '';
  function varKey() { try { return SERIES.length + ':' + SERIES[SERIES.length - 1].d + ':' + resetDateKey(); } catch (e) { return ''; } }
  /* Repaint when dashboard.js lands newer treasury days (live chain fetch finishes a few seconds after load). */
  function watchSeries() {
    var tries = 0, iv = setInterval(function () {
      tries++;
      if (varKey() !== seriesKey && S.state === 'ready') paint();
      if (tries > 30) clearInterval(iv);
    }, 2000);
  }

  function load() {
    if (S.state === 'loading' || S.state === 'ready') return;
    S.state = 'loading';
    msg('Loading Lighter data…');
    if (!LC) LC = window.LighterCompare;
    if (!LC) { S.state = 'error'; msg('Lighter data unavailable'); return; }
    LC.loadLighterDaily().then(function (L) {
      if (!varDaily().size) throw new Error('var');
      cache = { L: L };
      S.state = 'ready';
      paint();
      watchSeries();
    }).catch(function () {
      S.state = 'error';
      msg('Lighter data unavailable');
    });
  }

  function mount(anchor) {
    host = anchor;
    shell();
    msg('Loading Lighter data…');
    if (typeof IntersectionObserver === 'function') {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
      }, { rootMargin: '200px' });
      io.observe(host);
    } else load();
  }

  /* pretge-health.js builds the tab asynchronously; wait for its anchor. */
  function boot() {
    var a = document.getElementById('hc-flow');
    if (a) { mount(a); return; }
    if (typeof MutationObserver !== 'function') return;
    var mo = new MutationObserver(function () {
      var el = document.getElementById('hc-flow');
      if (el) { mo.disconnect(); mount(el); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
