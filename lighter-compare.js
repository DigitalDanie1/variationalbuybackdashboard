/* vs Lighter - header ratio chips, Overview chart compare mode, and the calendar-day
   Fee -> Revenue -> Buyback ladder.

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
      liq: g(F.cLiq) + g(F.rLiq),
      buyUsd: g(F.buyUsd),
      buyLit: g(F.buyLit)
    };
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
  var S = { mode: 'var', metric: 'vol', rng: 90, idx: null };
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
      '<p class="lc-read" id="lcRead"></p><p class="lc-src" id="lcSrc"></p>';
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
      if (!G || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Escape')) return;
      e.preventDefault();
      if (e.key === 'Escape') { setIdx(null); return; }
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
        if (S.mode === 'cmp') paintAll();
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
    $('lcRead').textContent = '';
    $('lcSrc').textContent = '';
  }

  function paintAll() {
    if (!rowsAll || rowsAll.length < 2) return;
    syncButtons();
    renderChart();
    paintTexts();
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
    svg += '<g id="lcHov"></g><rect id="lcHit" x="' + L + '" y="' + T + '" width="' + pw + '" height="' + (b1 - T) + '" fill="transparent"/>';
    chartEl.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Variational versus Lighter, ' + n + ' days">' + svg + '</svg>';
    var hit = $('lcHit');
    var idxFrom = function (e) { var b = hit.getBoundingClientRect(); return Math.max(0, Math.min(n - 1, Math.floor((e.clientX - b.left) / slot))); };
    hit.addEventListener('pointermove', function (e) { setIdx(idxFrom(e)); });
    hit.addEventListener('pointerdown', function (e) { setIdx(idxFrom(e)); });
    hit.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') setIdx(null); });
    setIdx(S.idx != null && S.idx < n ? S.idx : null);
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

  /* ---------- 3. calendar day ladder ---------- */
  var lad = null, lastLadHtml = '', ladTimer = null, flowsValue = null, flowsFailed = false;

  function buildLadderHost() {
    if (lad && lad.isConnected) return true;
    var figs = document.querySelector('#calSel .cal-sel-figs');
    if (!figs) return false;
    lad = document.createElement('div');
    lad.className = 'lc-ladder';
    lad.id = 'lcLadder';
    lad.hidden = true;
    figs.parentNode.insertBefore(lad, figs.nextSibling);
    lastLadHtml = '';
    if (typeof IntersectionObserver === 'function') {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); wantFlows(); }
      });
      io.observe(lad);
    } else wantFlows();
    return true;
  }

  function wantFlows() {
    loadFlows().then(function (v) { flowsValue = v; flowsFailed = false; schedulePaint(); },
                     function () { flowsFailed = true; schedulePaint(); });
  }

  function varDay(d) {
    try {
      var closed = isClosedDailyTotal(d), today = d === resetDateKey(), amt;
      if (closed) amt = CAL.eMap.get(d) || 0;
      else if (today) amt = Math.max(0, currentTreasuryBalance() - cumAt(addDays(d, -1)));
      else return null;
      var rate = spreadShareAt(d).rate;
      if (!(rate > 0)) return null;
      return { amt: amt, rate: rate, spread: amt / rate };
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

  function ladderHtml(d, F) {
    var V = varDay(d);
    if (!V) return null;
    var varCol =
      '<div class="lc-col"><div class="lc-col-h"><span class="lc-sw var"></span><span>Variational</span></div>' +
      step('Fee', 'v', V.spread, V.spread, 'Modeled', 'Gross spreads* · implied from the ' + (V.rate * 100).toFixed(1) + '% report share') +
      conv(V.rate, '') +
      step('Revenue', 'v', V.amt, V.spread, 'Wallet inflow', 'Kept by protocol') +
      conv(1, 'planned') +
      step('Buyback', 'p', V.amt, V.spread, 'Pending TGE', '100% of treasury → $VAR buy &amp; burn after TGE · not executed yet') +
      '</div>';
    var litBody;
    var f = F ? flowFor(F, d) : null;
    if (!F) {
      litBody = '<p class="lc-wait">' + (flowsFailed ? 'Lighter data unavailable' : 'Loading Lighter data…') + '</p>';
    } else if (!f) {
      litBody = '<p class="lc-wait">Lighter posts daily totals after 00:00 UTC.</p>';
    } else {
      litBody =
        step('Fee', 'l', f.fee, f.fee, 'Reported', 'Maker + taker · Core + Robinhood Chain') +
        conv(f.fee > 0 ? f.revenue / f.fee : NaN, '') +
        step('Revenue', 'l', f.revenue, f.fee, 'Reported', 'Core + 50% of Robinhood Chain (Lighter\'s own rule)') +
        conv(f.revenue > 0 ? f.buyUsd / f.revenue : NaN, '') +
        step('Buyback', 'l', f.buyUsd, f.fee, 'Executed', '<span>' + Math.round(f.buyLit).toLocaleString('en-US') + '</span> <span>LIT bought, burned</span>');
    }
    var litCol = '<div class="lc-col"><div class="lc-col-h"><span class="lc-sw lit"></span><span>Lighter · UTC day</span></div>' + litBody + '</div>';
    var notes = '';
    if (f) notes += '<p class="lc-lnote"><span>Liquidation fees</span> <b>' + usd0(f.liq) + '</b> <span>went to LLP, outside this flow.</span></p>';
    notes += '<p class="lc-lnote sub">Fee steps use different bases (modeled vs reported). Compare each venue\'s flow, not the dollar levels across columns.</p>';
    return '<div class="lc-kicker">Fee → Revenue → Buyback</div><div class="lc-lad">' + varCol + litCol + '</div>' + notes;
  }

  function paintLadder() {
    ladTimer = null;
    if (!buildLadderHost()) return;
    var ok = false, html = null;
    try { ok = CALMODE === 'day' && CAL && CAL.selectedDate; } catch (e) { ok = false; }
    if (ok) {
      html = ladderHtml(CAL.selectedDate, flowsValue);
    }
    if (!html) { lad.hidden = true; lastLadHtml = ''; return; }
    lad.hidden = false;
    if (html !== lastLadHtml) { lad.innerHTML = html; lastLadHtml = html; }
  }
  function schedulePaint() { if (!ladTimer) ladTimer = setTimeout(paintLadder, 30); }

  function watchCalendar() {
    var ids = ['calLab', 'calAmt', 'calInspectorDate'];
    var any = false;
    if (typeof MutationObserver !== 'function') return;
    var mo = new MutationObserver(schedulePaint);
    ids.forEach(function (id) {
      var el = $(id);
      if (el) { mo.observe(el, { childList: true, characterData: true, subtree: true }); any = true; }
    });
    var seg = $('calSeg');
    if (seg) seg.addEventListener('click', schedulePaint);
    if (any) schedulePaint();
  }

  /* ---------- boot ---------- */
  function boot() {
    buildChrome();
    if (host) applyMode();
    watchCalendar();
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
