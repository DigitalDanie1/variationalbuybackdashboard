/* vs Lighter - header ratio chips, Overview chart compare mode, and the Fee -> Revenue -> Buyback
   ladder shown under the compare chart for the clicked (pinned) day.

   Reads dashboard.js globals where they exist (MARKET_ACTIVITY, CAL, CALMODE, spreadShareAt,
   isClosedDailyTotal ...) and falls back to its own fetch / hides itself when they do not.
   Loaded with defer after dashboard.js; no inline script (CSP script-src 'self'). */
(function () {
  'use strict';

  var LLAMA = 'https://api.llama.fi/v2/chart/';
  var LIT_URLS = {
    vol: LLAMA + 'derivatives/protocol/lighter',
    oi: LLAMA + 'open-interest/protocol/lighter?dataType=openInterestAtEnd'
  };
  var VAR_URLS = {
    vol: LLAMA + 'derivatives/protocol/variational',
    oi: LLAMA + 'open-interest/protocol/variational?dataType=openInterestAtEnd'
  };
  var CORE = 'https://mainnet.zklighter.elliot.ai/api/v1/exchangeMetrics?period=all&kind=';
  var RH = 'https://api.rh.lighter.xyz/api/v1/exchangeMetrics?period=all&kind=';
  var MODE_KEY = 'lcChartMode';

  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- formatting ---------- */
  function d2(s) { var p = s.split('-').map(Number); return { y: p[0], m: p[1], d: p[2] }; }
  function fShort(s) { var x = d2(s); return MON[x.m - 1] + ' ' + x.d; }
  function fFull(s) { var x = d2(s); return MON[x.m - 1] + ' ' + x.d + ', ' + x.y; }
  function money(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return '$' + String(+(v / 1e9).toFixed(2)) + 'B';
    if (a >= 1e6) return '$' + Math.round(v / 1e6) + 'M';
    if (a >= 1e3) return '$' + Math.round(v / 1e3) + 'K';
    return '$' + Math.round(v);
  }
  function money2(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return '$' + (v / 1e6).toFixed(0) + 'M';
    return '$' + Math.round(v).toLocaleString('en-US');
  }
  function usd0(v) { return '$' + Math.round(v).toLocaleString('en-US'); }
  function xf(v) { return v.toFixed(2) + '×'; }
  function sum(a, k) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i][k]; return s; }
  function nice(max, n) {
    var raw = max / n, p = Math.pow(10, Math.floor(Math.log10(raw))), step = p, ms = [1, 2, 2.5, 5, 10];
    for (var i = 0; i < ms.length; i++) { step = ms[i] * p; if (step >= raw) break; }
    var t = []; for (var j = 0; j <= n; j++) t.push(step * j);
    return t;
  }
  function dayOf(ts) { return new Date(Number(ts) * 1000).toISOString().slice(0, 10); }

  /* ---------- network (all cached in memory) ---------- */
  function getJson(url, ms) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, ms || 15000) : null;
    return fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) { if (timer) clearTimeout(timer); return j; }, function (e) { if (timer) clearTimeout(timer); throw e; });
  }
  function pairsToMap(a) {
    var m = new Map();
    (Array.isArray(a) ? a : []).forEach(function (x) {
      var v = Number(x[1]);
      if (Number.isFinite(v) && v >= 0) m.set(dayOf(x[0]), v);
    });
    return m;
  }
  function metricsToMap(j) {
    var m = new Map();
    ((j && j.metrics) || []).forEach(function (x) {
      var v = Number(x.data);
      if (Number.isFinite(v)) m.set(dayOf(x.timestamp), v);
    });
    return m;
  }

  var litLlama = null;        // Promise -> {vol: Map, oi: Map}
  function loadLitLlama() {
    if (!litLlama) {
      litLlama = Promise.all([getJson(LIT_URLS.vol), getJson(LIT_URLS.oi)]).then(function (r) {
        return { vol: pairsToMap(r[0]), oi: pairsToMap(r[1]) };
      });
      litLlama.catch(function () { litLlama = null; });
    }
    return litLlama;
  }

  var ownVar = null;          // fallback fetch when dashboard.js has not exposed its series
  function varSeries() {
    var t0 = Date.now();
    return new Promise(function (resolve) {
      (function poll() {
        if (varReady() || Date.now() - t0 > 4000) resolve();
        else setTimeout(poll, 250);
      })();
    }).then(function () {
      if (varReady()) {
        var vm = new Map(), om = new Map(), V = MARKET_ACTIVITY.volume, O = MARKET_ACTIVITY.oi;
        V.forEach(function (x) { vm.set(x.d, x.v); });
        O.forEach(function (x) { om.set(x.d, x.v); });
        return { vol: vm, oi: om, key: V.length + ':' + O.length + ':' + V[V.length - 1].d };
      }
      if (!ownVar) {
        ownVar = Promise.all([getJson(VAR_URLS.vol), getJson(VAR_URLS.oi)]).then(function (r) {
          var vm = pairsToMap(r[0]), om = pairsToMap(r[1]);
          return { vol: vm, oi: om, key: 'own:' + vm.size + ':' + om.size };
        });
        ownVar.catch(function () { ownVar = null; });
      }
      return ownVar;
    });
  }
  function varReady() {
    try { return typeof MARKET_ACTIVITY !== 'undefined' && MARKET_ACTIVITY.volume.length > 1 && MARKET_ACTIVITY.oi.length > 1; } catch (e) { return false; }
  }

  /* Rows where all four same-source series have a value. Lighter's newest volume day can lag
     Variational's, so the latest row is the latest COMMON day. */
  var rowsCache = { key: '', rows: null };
  function loadRows() {
    return Promise.all([loadLitLlama(), varSeries()]).then(function (r) {
      var L = r[0], V = r[1], key = V.key + '|' + L.vol.size + ':' + L.oi.size;
      if (rowsCache.key === key) return rowsCache.rows;
      var rows = [];
      V.vol.forEach(function (vv, d) {
        var vo = V.oi.get(d), lv = L.vol.get(d), lo = L.oi.get(d);
        if (vo == null || lv == null || lo == null || !(lv > 0) || !(lo > 0)) return;
        rows.push({ d: d, varVol: vv, varOi: vo, litVol: lv, litOi: lo });
      });
      rows.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
      rowsCache = { key: key, rows: rows };
      return rows;
    });
  }

  var litFlows = null;        // Promise -> per-day Lighter fee maps
  function loadFlows() {
    if (!litFlows) {
      var jobs = [
        getJson(CORE + 'maker_fee'), getJson(CORE + 'taker_fee'), getJson(CORE + 'liquidation_fee'),
        getJson(RH + 'maker_fee'), getJson(RH + 'taker_fee'), getJson(RH + 'liquidation_fee'),
        getJson(CORE + 'buyback_usdc'), getJson(CORE + 'buyback')
      ];
      litFlows = Promise.all(jobs).then(function (r) {
        var m = r.map(metricsToMap);
        return { cMaker: m[0], cTaker: m[1], cLiq: m[2], rMaker: m[3], rTaker: m[4], rLiq: m[5], buyUsd: m[6], buyLit: m[7] };
      });
      litFlows.catch(function () { litFlows = null; });
    }
    return litFlows;
  }
  function flowFor(F, d) {
    if (!F.cMaker.has(d) && !F.cTaker.has(d)) return null;
    var g = function (m) { return m.get(d) || 0; };
    var core = g(F.cMaker) + g(F.cTaker), rh = g(F.rMaker) + g(F.rTaker);
    return {
      fee: core + rh,
      revenue: core + 0.5 * rh,
      liqFee: g(F.cLiq) + g(F.rLiq),
      buybackUsd: g(F.buyUsd),
      buybackLit: g(F.buyLit)
    };
  }
  /* Per UTC day -> {fee, revenue, liqFee, buybackUsd, buybackLit}; only days Lighter has posted. */
  function loadLighterDaily() {
    return loadFlows().then(function (F) {
      var out = new Map(), days = new Set();
      [F.cMaker, F.cTaker].forEach(function (m) { m.forEach(function (v, d) { days.add(d); }); });
      days.forEach(function (d) { out.set(d, flowFor(F, d)); });
      return out;
    });
  }
  /* Daily DeFiLlama volume for both venues. Variational uses dashboard.js's series when it
     covers every requested day, else its own fetch. days = array of 'YYYY-MM-DD'. */
  var ownVarVol = null;
  function loadVolumes(days) {
    return Promise.all([loadLitLlama(), varSeries()]).then(function (r) {
      var lit = r[0].vol, vv = r[1].vol;
      var covered = days.every(function (d) { return vv.has(d); });
      if (covered) return { lit: lit, var: vv };
      if (!ownVarVol) {
        ownVarVol = getJson(VAR_URLS.vol).then(pairsToMap);
        ownVarVol.catch(function () { ownVarVol = null; });
      }
      return ownVarVol.then(function (m) {
        var merged = new Map(m); vv.forEach(function (v, d) { if (!merged.has(d)) merged.set(d, v); });
        return { lit: lit, var: merged };
      }, function () { return { lit: lit, var: vv }; });
    });
  }

  /* ---------- 1. header chips ---------- */
  function ensureChip(strongId) {
    var s = $(strongId);
    if (!s || !s.parentNode) return null;
    var next = s.nextElementSibling;
    if (next && next.classList.contains('lc-chip')) return next;
    var c = document.createElement('i');
    c.className = 'lc-chip';
    c.hidden = true;
    s.parentNode.insertBefore(c, s.nextSibling);
    return c;
  }
  function setChip(el, r, last) {
    if (!el) return;
    el.textContent = r.toFixed(2) + '× Lighter';
    el.className = 'lc-chip ' + (r >= 1 ? 'lead' : 'trail');
    el.title = 'Same-source DeFiLlama, day ending ' + fFull(last) + ' UTC';
    el.hidden = false;
  }
  function paintChips() {
    return loadRows().then(function (rows) {
      if (!rows.length) return;
      var a = rows[rows.length - 1];
      setChip(ensureChip('v2GlobalVolume'), a.varVol / a.litVol, a.d);
      setChip(ensureChip('v2GlobalOi'), a.varOi / a.litOi, a.d);
    }).catch(function () { /* chips stay hidden */ });
  }

  /* ---------- 2. chart: toggle + compare panel ---------- */
  var S = { mode: 'var', metric: 'vol', rng: 90, idx: null, pin: null };
  try { if (localStorage.getItem(MODE_KEY) === 'cmp') S.mode = 'cmp'; } catch (e) { /* storage blocked */ }
  var host = null, panel = null, chartEl = null, G = null, rowsAll = null, state = 'idle';

  function range() { return rowsAll.slice(-Math.min(rowsAll.length, S.rng)); }

  function buildChrome() {
    host = $('v2MarketChartHost');
    if (!host || host.querySelector('.lc-modebar')) return !!host;
    var bar = document.createElement('div');
    bar.className = 'lc-modebar';
    bar.innerHTML = '<div class="lc-seg main" role="group" aria-label="Chart view" id="lcModeSeg">' +
      '<button type="button" data-mode="var" aria-pressed="true">Variational</button>' +
      '<button type="button" data-mode="cmp" aria-pressed="false">vs Lighter</button></div>';
    host.insertBefore(bar, host.firstChild);

    panel = document.createElement('div');
    panel.className = 'lc-panel';
    panel.hidden = true;
    panel.innerHTML =
      '<div class="lc-bar">' +
        '<div class="lc-seg sm" role="group" aria-label="Metric" id="lcMetricSeg">' +
          '<button type="button" data-metric="vol" aria-pressed="true">Volume</button>' +
          '<button type="button" data-metric="oi" aria-pressed="false">Open interest</button></div>' +
        '<div class="lc-seg sm" role="group" aria-label="Range" id="lcRangeSeg">' +
          '<button type="button" data-range="30" aria-pressed="false">30D</button>' +
          '<button type="button" data-range="90" aria-pressed="true">90D</button></div>' +
      '</div>' +
      '<div class="lc-readout" id="lcReadout" aria-live="off"></div>' +
      '<div class="lc-chart" id="lcChart" tabindex="0" role="group" aria-label="Chart. Use left and right arrow keys to move the crosshair."></div>' +
      '<p class="lc-read" id="lcRead"></p><p class="lc-src" id="lcSrc"></p>' +
      '<div class="lc-ladder" id="lcLadder" hidden></div>';
    host.appendChild(panel);
    chartEl = $('lcChart');

    $('lcModeSeg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      setMode(b.getAttribute('data-mode'));
    });
    $('lcMetricSeg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.metric = b.getAttribute('data-metric'); S.idx = null; paintAll();
    });
    $('lcRangeSeg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.rng = +b.getAttribute('data-range'); S.idx = null; paintAll();
    });
    chartEl.addEventListener('keydown', function (e) {
      if (!G || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Escape' && e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      if (e.key === 'Escape') { setIdx(null); return; }
      if (e.key === 'Enter' || e.key === ' ') { pinIdx(S.idx == null ? G.n - 1 : S.idx); return; }
      var cur = S.idx == null ? G.n - 1 : S.idx;
      setIdx(Math.max(0, Math.min(G.n - 1, cur + (e.key === 'ArrowLeft' ? -1 : 1))));
    });
    chartEl.addEventListener('blur', function () { if (G) setIdx(null); });
    var rw = 0;
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(function () {
        var w = Math.floor(chartEl.clientWidth);
        if (w && w !== rw) { rw = w; if (S.mode === 'cmp' && rowsAll) renderChart(); }
      }).observe(chartEl);
    }
    return true;
  }

  function syncButtons() {
    [].forEach.call(document.querySelectorAll('#lcModeSeg button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === S.mode); });
    [].forEach.call(document.querySelectorAll('#lcMetricSeg button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-metric') === S.metric); });
    [].forEach.call(document.querySelectorAll('#lcRangeSeg button'), function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-range') === S.rng); });
  }

  function setMode(m) {
    if (m !== 'var' && m !== 'cmp') return;
    S.mode = m;
    try { localStorage.setItem(MODE_KEY, m); } catch (e) { /* storage blocked */ }
    applyMode();
  }

  function applyMode() {
    if (!host) return;
    host.classList.toggle('lc-cmp', S.mode === 'cmp');
    panel.hidden = S.mode !== 'cmp';
    syncButtons();
    if (S.mode === 'cmp') {
      showMsg('Loading Lighter data…');
      loadRows().then(function (rows) {
        rowsAll = rows;
        if (rows.length < 2) throw new Error('rows');
        state = 'ready';
        if (S.mode === 'cmp') { paintAll(); wantFlows(); }
      }).catch(function () {
        state = 'error';
        if (S.mode === 'cmp') showMsg('Lighter data unavailable');
      });
    } else {
      /* dashboard.js sized the chart while it was display:none, so redraw it at its real size */
      try { if (typeof renderMarketActivity === 'function') renderMarketActivity(); } catch (e) { /* keep existing chart */ }
    }
  }

  function showMsg(t) {
    G = null;
    $('lcReadout').innerHTML = '';
    chartEl.innerHTML = '<p class="lc-msg">' + esc(t) + '</p>';
    if (lad) lad.hidden = true;
    $('lcRead').textContent = '';
    $('lcSrc').textContent = '';
  }

  function paintAll() {
    if (!rowsAll || rowsAll.length < 2) return;
    syncButtons();
    renderChart();
    paintTexts();
    paintLadder();
  }

  function renderChart() {
    var rows = range(), n = rows.length;
    if (n < 2) return;
    var W = Math.max(280, Math.floor(chartEl.clientWidth) || 340);
    var narrow = W < 520;
    var L = narrow ? 44 : 52, Rm = 12;
    var pw = W - L - Rm, slot = pw / n;
    var cx = function (i) { return L + slot * (i + 0.5); };
    var T = 20, hTop = narrow ? 200 : 240, gap = 36, hBot = narrow ? 96 : 112, axisH = 22;
    var metric = S.metric, kv = metric === 'vol' ? 'varVol' : 'varOi', kl = metric === 'vol' ? 'litVol' : 'litOi';
    var y0 = T + hTop, b0 = y0 + gap, b1 = b0 + hBot, H = b1 + axisH + 4;
    var svg = '';
    var mx = 0; rows.forEach(function (r) { mx = Math.max(mx, r[kv], r[kl]); });
    var t = nice(mx, 4), y = function (v) { return y0 - v / t[4] * hTop; };
    svg += '<text class="axt" x="' + L + '" y="10" text-anchor="start">' + (metric === 'vol' ? 'VOLUME / DAY' : 'OPEN INTEREST') + '</text>';
    for (var k = 0; k <= 4; k++) {
      var yy = y(t[k]);
      svg += '<line class="grid" x1="' + L + '" x2="' + (W - Rm) + '" y1="' + yy + '" y2="' + yy + '"/><text class="ax" x="' + (L - 6) + '" y="' + (yy + 3.5) + '" text-anchor="end">' + money(t[k]) + '</text>';
    }
    if (metric === 'vol') {
      var lw = Math.max(2, slot - (slot > 6 ? 1.5 : 0.8)), vw = Math.max(1.2, lw * 0.5);
      rows.forEach(function (r, i) {
        var x = cx(i);
        svg += '<rect class="b-lit" x="' + (x - lw / 2).toFixed(2) + '" y="' + y(r[kl]).toFixed(1) + '" width="' + lw.toFixed(2) + '" height="' + (y0 - y(r[kl])).toFixed(1) + '"/>';
      });
      rows.forEach(function (r, i) {
        var x = cx(i);
        svg += '<rect class="b-var" x="' + (x - vw / 2).toFixed(2) + '" y="' + y(r[kv]).toFixed(1) + '" width="' + vw.toFixed(2) + '" height="' + (y0 - y(r[kv])).toFixed(1) + '"/>';
      });
    } else {
      var p = function (key) { return rows.map(function (r, i) { return (i ? 'L' : 'M') + cx(i).toFixed(1) + ' ' + y(r[key]).toFixed(1); }).join(''); };
      svg += '<path class="l-lit" d="' + p(kl) + '"/><path class="l-var" d="' + p(kv) + '"/>';
    }
    /* ratio panel */
    var ra = rows.map(function (r) { return r[kv] / r[kl]; });
    var lo = Math.min.apply(null, ra), hi = Math.max.apply(null, ra);
    var dlo = Math.min(0.5, Math.floor(lo * 4) / 4), dhi = Math.max(1.5, Math.ceil(hi * 4) / 4);
    var stepR = (dhi - dlo) > 3 ? 1 : 0.5, rt = [];
    for (var v = Math.ceil(dlo / stepR) * stepR; v <= dhi + 1e-9; v += stepR) rt.push(+v.toFixed(2));
    dlo = Math.min(dlo, rt[0]); dhi = Math.max(dhi, rt[rt.length - 1]);
    var yr = function (val) { return b1 - (val - dlo) / (dhi - dlo) * hBot; }, y1 = yr(1);
    svg += '<text class="axt" x="' + L + '" y="' + (b0 - 9) + '" text-anchor="start">VARIATIONAL OVER LIGHTER</text>';
    rt.forEach(function (val) {
      var ty = yr(val);
      svg += val === 1
        ? '<line class="base1" x1="' + L + '" x2="' + (W - Rm) + '" y1="' + ty + '" y2="' + ty + '"/>'
        : '<line class="grid" x1="' + L + '" x2="' + (W - Rm) + '" y1="' + ty + '" y2="' + ty + '"/>';
      svg += '<text class="ax" style="' + (val === 1 ? 'fill:var(--v2-text);font-weight:700' : '') + '" x="' + (L - 6) + '" y="' + (ty + 3.5) + '" text-anchor="end">' + val + '×</text>';
    });
    var lp = ra.map(function (val, i) { return (i ? 'L' : 'M') + cx(i).toFixed(1) + ' ' + yr(val).toFixed(1); }).join('');
    var ap = lp + 'L' + cx(n - 1).toFixed(1) + ' ' + y1.toFixed(1) + 'L' + cx(0).toFixed(1) + ' ' + y1.toFixed(1) + 'Z';
    svg += '<defs><clipPath id="lcCu"><rect x="' + L + '" y="' + b0 + '" width="' + pw + '" height="' + Math.max(0, y1 - b0) + '"/></clipPath>' +
           '<clipPath id="lcCd"><rect x="' + L + '" y="' + y1 + '" width="' + pw + '" height="' + Math.max(0, b1 - y1) + '"/></clipPath></defs>';
    svg += '<path class="a-up" d="' + ap + '" clip-path="url(#lcCu)"/><path class="a-dn" d="' + ap + '" clip-path="url(#lcCd)"/>';
    svg += '<path class="l-ratio" d="' + lp + '"/>';
    var ex = cx(n - 1), ey = yr(ra[n - 1]), ly = ey - 9;
    if (ly < b0 + 10) ly = ey + 17;
    svg += '<circle class="dot-txt" cx="' + ex + '" cy="' + ey + '" r="3.5"/><text class="end-l" x="' + (ex - 8) + '" y="' + ly + '" text-anchor="end">' + xf(ra[n - 1]) + '</text>';
    /* x ticks */
    var fr = narrow ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];
    fr.forEach(function (f) {
      var i = Math.round(f * (n - 1)), an = f === 0 ? 'start' : f === 1 ? 'end' : 'middle';
      var x = f === 0 ? L : f === 1 ? W - Rm : cx(i);
      svg += '<text class="ax" x="' + x + '" y="' + (b1 + 16) + '" text-anchor="' + an + '">' + fShort(rows[i].d) + '</text>';
    });
    G = { rows: rows, n: n, L: L, slot: slot, cx: cx, yTop: T, yBot: b1, y: y, yr: yr, kv: kv, kl: kl, ra: ra };
    svg += '<g id="lcPin"></g><g id="lcHov"></g><rect id="lcHit" x="' + L + '" y="' + T + '" width="' + pw + '" height="' + (b1 - T) + '" fill="transparent"/>';
    chartEl.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Variational versus Lighter, ' + n + ' days">' + svg + '</svg>';
    var hit = $('lcHit');
    var idxFrom = function (e) { var b = hit.getBoundingClientRect(); return Math.max(0, Math.min(n - 1, Math.floor((e.clientX - b.left) / slot))); };
    hit.addEventListener('pointermove', function (e) { setIdx(idxFrom(e)); });
    hit.addEventListener('pointerdown', function (e) { setIdx(idxFrom(e)); });
    hit.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') setIdx(null); });
    hit.addEventListener('click', function (e) { pinIdx(idxFrom(e)); });
    paintPin();
    setIdx(S.idx != null && S.idx < n ? S.idx : null);
  }

  /* index (within the current range) of the day the ladder shows */
  function ladIdx() {
    if (!G) return -1;
    var rows = G.rows, i;
    if (S.pin) for (i = 0; i < rows.length; i++) if (rows[i].d === S.pin) return i;
    if (flowsValue) {
      for (i = rows.length - 1; i >= 0; i--) {
        if (!flowFor(flowsValue, rows[i].d)) continue;
        var vd = varDay(rows[i].d);
        if (vd && !vd.live) return i;
      }
      for (i = rows.length - 1; i >= 0; i--) if (flowFor(flowsValue, rows[i].d)) return i;
    }
    return rows.length - 1;
  }
  function paintPin() {
    var g = G, el = $('lcPin'); if (!g || !el) return;
    var i = ladIdx(); if (i < 0) { el.innerHTML = ''; return; }
    var x = g.cx(i), yb = g.yTop - 4;
    el.innerHTML = '<line class="pin" x1="' + x + '" x2="' + x + '" y1="' + yb + '" y2="' + g.yBot + '"/>' +
      '<path class="pin-h" d="M' + (x - 4.5) + ' ' + (yb - 6) + 'L' + (x + 4.5) + ' ' + (yb - 6) + 'L' + x + ' ' + yb + 'Z"/>';
  }
  function pinIdx(i) {
    if (!G || i == null) return;
    S.pin = G.rows[i].d;
    paintPin();
    paintLadder();
  }

  function setIdx(i) {
    if (!G) return;
    S.idx = i;
    var g = G, k = i == null ? g.n - 1 : i, r = g.rows[k], x = g.cx(k), h = '';
    if (i != null) {
      h += '<line class="cross" x1="' + x + '" x2="' + x + '" y1="' + g.yTop + '" y2="' + g.yBot + '"/>';
      h += '<circle class="dot-lit" cx="' + x + '" cy="' + g.y(r[g.kl]) + '" r="3.5"/><circle class="dot-var" cx="' + x + '" cy="' + g.y(r[g.kv]) + '" r="3.5"/><circle class="dot-txt" cx="' + x + '" cy="' + g.yr(g.ra[k]) + '" r="3.5"/>';
    }
    var hov = $('lcHov'); if (hov) hov.innerHTML = h;
    var lines = S.metric === 'oi', a = r[g.kv], b = r[g.kl];
    $('lcReadout').innerHTML =
      '<div><div class="lc-ro-l"><span>' + (i == null ? 'Latest day' : 'Day') + '</span></div><div class="lc-ro-v">' + fFull(r.d) + '</div></div>' +
      '<div><div class="lc-ro-l"><span class="lc-sw ' + (lines ? 'ln' : 'var') + '"></span><span>Variational</span></div><div class="lc-ro-v" style="color:var(--v2-accent)">' + money2(a) + '</div></div>' +
      '<div><div class="lc-ro-l"><span class="lc-sw ' + (lines ? 'ln dash' : 'lit') + '"></span><span>Lighter</span></div><div class="lc-ro-v" style="color:var(--lc-lit)">' + money2(b) + '</div></div>' +
      '<div><div class="lc-ro-l"><span>Var / Lighter</span></div><div class="lc-ro-v">' + xf(a / b) + '</div></div>';
  }

  function paintTexts() {
    var rows = range(), a = rows[rows.length - 1];
    var v = sum(rows, 'varVol') / sum(rows, 'litVol'), o = sum(rows, 'varOi') / sum(rows, 'litOi');
    var cls = function (q) { return q >= 1 ? 'v' : ''; };
    $('lcRead').innerHTML =
      '<span>Over ' + S.rng + 'D Variational averaged</span> <b class="' + cls(v) + '">' + xf(v) + '</b> ' +
      '<span>Lighter\'s volume and</span> <b class="' + cls(o) + '">' + xf(o) + '</b> ' +
      '<span>its open interest. Latest day:</span> <b class="' + cls(a.varVol / a.litVol) + '">' + xf(a.varVol / a.litVol) + '</b> / ' +
      '<b class="' + cls(a.varOi / a.litOi) + '">' + xf(a.varOi / a.litOi) + '</b>.';
    $('lcSrc').textContent = 'Source: DeFiLlama daily volume and open interest, same source for both venues. DeFiLlama\'s OI counts roughly half of each venue\'s own OI figure, for both, so the ratio holds.';
  }

  /* ---------- 3. Fee -> Revenue -> Buyback ladder under the compare chart ---------- */
  var lad = null, flowsValue = null, flowsFailed = false, flowsAsked = false;

  function wantFlows() {
    if (flowsAsked) return;
    flowsAsked = true;
    loadFlows().then(function (v) { flowsValue = v; flowsFailed = false; if (S.mode === 'cmp' && G) { paintPin(); paintLadder(); } },
                     function () { flowsFailed = true; flowsAsked = false; if (S.mode === 'cmp' && G) paintLadder(); });
  }

  function varDay(d) {
    try {
      var closed = isClosedDailyTotal(d), today = d === resetDateKey(), amt;
      if (closed) amt = CAL.eMap.get(d) || 0;
      else if (today) amt = Math.max(0, currentTreasuryBalance() - cumAt(addDays(d, -1)));
      else return null;
      var rate = spreadShareAt(d).rate;
      if (!(rate > 0)) return null;
      return { amt: amt, rate: rate, spread: amt / rate, live: !closed };
    } catch (e) { return null; }
  }

  function step(label, kind, val, base, badge, sub) {
    var w = base > 0 ? Math.max(0, Math.min(100, val / base * 100)) : 0;
    return '<div class="lc-step"><div class="lc-step-l"><span>' + label + '</span><span class="lc-badge ' + (kind === 'p' ? 'p' : kind) + '">' + badge + '</span></div>' +
      '<div class="lc-step-v' + (kind === 'p' ? ' dim' : '') + '">' + usd0(val) + '</div>' +
      '<div class="lc-fbar ' + kind + '"><i style="width:' + w.toFixed(1) + '%"></i></div>' +
      '<div class="lc-step-s">' + sub + '</div></div>';
  }
  function conv(frac, tag) {
    var pct = Number.isFinite(frac) ? Math.round(frac * 100) + '%' : '—';
    return '<div class="lc-conv"><span>↓ ' + pct + '</span>' + (tag ? ' <em>' + tag + '</em>' : '') + '</div>';
  }

  /* Shared two-column ladder. varV = {fee, revenue, buyback, rate}; litV = {fee, revenue, buyback,
     buybackLit} or null (then opts.litMsg is shown). opts.litHead overrides the Lighter header.
     Returns the HTML; also writes it into container when one is given. */
  function renderLadder(container, varV, litV, opts) {
    opts = opts || {};
    var varCol = !varV
      ? '<div class="lc-col"><div class="lc-col-h"><span class="lc-sw var"></span><span>Variational</span></div><p class="lc-wait">' + (opts.varMsg || '') + '</p></div>'
      : '<div class="lc-col"><div class="lc-col-h"><span class="lc-sw var"></span><span>Variational</span></div>' +
      (opts.varNote ? '<p class="lc-live">' + opts.varNote + '</p>' : '') +
      step('Fee', 'v', varV.fee, varV.fee, 'Modeled', 'Gross spreads* · implied from the ' + (varV.rate * 100).toFixed(1) + '% report share') +
      conv(varV.rate, '') +
      step('Revenue', 'v', varV.revenue, varV.fee, 'Wallet inflow', 'Kept by protocol') +
      conv(1, 'planned') +
      step('Buyback', 'p', varV.buyback, varV.fee, 'Pending TGE', '100% of treasury → $VAR buy &amp; burn after TGE · not executed yet') +
      '</div>';
    var litBody;
    if (!litV) {
      litBody = '<p class="lc-wait">' + (opts.litMsg || '') + '</p>';
    } else {
      litBody =
        step('Fee', 'l', litV.fee, litV.fee, 'Reported', 'Maker + taker · Core + Robinhood Chain') +
        conv(litV.fee > 0 ? litV.revenue / litV.fee : NaN, '') +
        step('Revenue', 'l', litV.revenue, litV.fee, 'Reported', 'Core + 50% of Robinhood Chain (Lighter\'s own rule)') +
        conv(litV.revenue > 0 ? litV.buyback / litV.revenue : NaN, '') +
        step('Buyback', 'l', litV.buyback, litV.fee, 'Executed', '<span>' + Math.round(litV.buybackLit).toLocaleString('en-US') + '</span> <span>LIT bought, burned</span>');
    }
    var litCol = '<div class="lc-col"><div class="lc-col-h"><span class="lc-sw lit"></span><span>' + (opts.litHead || 'Lighter · UTC day') + '</span></div>' + litBody + '</div>';
    var html = '<div class="lc-lad">' + varCol + litCol + '</div>';
    if (container) container.innerHTML = html;
    return html;
  }

  function paintLadder() {
    if (!lad) lad = $('lcLadder');
    if (!lad) return;
    var i = ladIdx();
    if (i < 0 || S.mode !== 'cmp') { lad.hidden = true; return; }
    var d = G.rows[i].d, F = flowsValue, V = varDay(d), f = F ? flowFor(F, d) : null;
    var litMsg = !F ? (flowsFailed ? 'Lighter data unavailable' : 'Loading Lighter data…') : 'Lighter posts daily totals after 00:00 UTC.';
    var body = renderLadder(null,
      V ? { fee: V.spread, revenue: V.amt, buyback: V.amt, rate: V.rate } : null,
      f ? { fee: f.fee, revenue: f.revenue, buyback: f.buybackUsd, buybackLit: f.buybackLit } : null,
      { litMsg: litMsg, varNote: V && V.live ? 'Day in progress · earned so far (closes 00:00 ET)' : '', varMsg: 'Variational treasury data not available for this day.' });
    var notes = '';
    if (f) notes += '<p class="lc-lnote"><span>Liquidation fees</span> <b>' + usd0(f.liqFee) + '</b> <span>went to LLP, outside this flow.</span></p>';
    notes += '<p class="lc-lnote sub">Fee steps use different bases (modeled vs reported). Compare each venue\'s flow, not the dollar levels across columns.</p>';
    var html = '<div class="lc-lad-h"><div class="lc-kicker">Fee → Revenue → Buyback</div>' +
      '<div class="lc-lad-d">' + fFull(d) + '</div><div class="lc-lad-hint">Click a day on the chart to change it.</div></div>' + body + notes;
    if (html !== lad.getAttribute('data-h')) { lad.innerHTML = html; lad.setAttribute('data-h', html); }
    lad.hidden = false;
  }

  /* ---------- shared API (used by pretge-flow.js) ---------- */
  window.LighterCompare = {
    loadLighterDaily: loadLighterDaily,
    loadVolumes: loadVolumes,
    renderLadder: renderLadder,
    fmt: { usd0: usd0, money: money, fShort: fShort, fFull: fFull, esc: esc }
  };

  /* ---------- boot ---------- */
  function boot() {
    buildChrome();
    if (host) applyMode();
    paintChips();
    /* dashboard.js lands its own series a moment later; refresh chips and chart when it does */
    var tries = 0, iv = setInterval(function () {
      tries++;
      if (varReady() || tries > 12) {
        clearInterval(iv);
        if (varReady()) {
          paintChips();
          if (S.mode === 'cmp' && state === 'ready') loadRows().then(function (r) { rowsAll = r; paintAll(); });
        }
      }
    }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); });
  else setTimeout(boot, 0);
})();
