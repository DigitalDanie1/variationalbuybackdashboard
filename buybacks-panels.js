/* Buybacks tab: Lighter $LIT buyback page mirrored for Variational $VAR, plus a head-to-head view.
   One generic renderer (renderToken) serves both tokens. $VAR has no buyback data until TGE; when it
   does, call window.VarBuybacks.load({daily, dailyUsd, activity}) and the same UI fills in. */
(function () {
  'use strict';
  var TAB = 'buybacks';

  /* ---------- $VAR data hook: flip live + fill when the token lists ---------- */
  var VAR_BUYBACK = {
    live: false,
    address: null,        /* buyback wallet, announced at TGE */
    totalSupply: null,    /* not announced; no constant exists elsewhere in this site */
    burned: null,
    daily: [], dailyUsd: [], activity: []
  };
  var VAR_CIRC_SHARE_AT_TGE = 0.32; /* official: 32% of total supply circulates at TGE */
  var TREASURY = '0x5e91b40467fb8902c46a7b6cb90482363188d645';

  /* ---------- Lighter ---------- */
  var LIT = {
    sym: 'LIT', name: 'Lighter',
    total: 1e9, circ: 250e6, burned: 18.09e6,
    burnedUrl: 'https://etherscan.io/tx/0x208df37eb2d09474fc01347b7f5dc153b5dbae93effd516249685f5515dedb4a',
    asOf: '2026-11-04', launch: '2025-12-30', market: 2049
  };
  var API_DAILY = 'https://mainnet.zklighter.elliot.ai/api/v1/exchangeMetrics?period=all&kind=buyback';
  var API_USD = 'https://mainnet.zklighter.elliot.ai/api/v1/exchangeMetrics?period=all&kind=buyback_usdc';
  var API_ACT = 'https://explorer.elliot.ai/api/accounts/0/logs?pub_data_type=Trade&limit=100&offset=0';
  var lit = { state: 'idle', daily: [], usd: [], act: [], actErr: false, err: '' };

  var ui = { view: 'var', chart: { var: { m: 'tok', r: 'ALL' }, lit: { m: 'tok', r: 'ALL' } }, fdv: 2e9, actOpen: false };
  var host, lastW = 0, lastSig = '';

  /* ---------- helpers ---------- */
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ko = false;
  var t = function (en, kr) { return ko ? kr : en; };
  function num(x) { var n = Number(x); return isFinite(n) ? n : null; }
  function cmp(n, dp) {
    if (n == null) return '—';
    dp = dp == null ? 2 : dp;
    var a = Math.abs(n), s = n < 0 ? '-' : '', v, u = '';
    if (a >= 1e9) { v = a / 1e9; u = 'B'; } else if (a >= 1e6) { v = a / 1e6; u = 'M'; } else if (a >= 1e3) { v = a / 1e3; u = 'K'; } else { v = a; }
    return s + String(parseFloat(v.toFixed(u ? dp : (a < 10 ? dp : 0)))) + u;
  }
  function usd(n, dp) { return n == null ? '—' : '$' + cmp(n, dp); }
  function pct(n, dp) { return n == null ? '—' : (n * 100).toFixed(dp == null ? 2 : dp) + '%'; }
  function iso(sec) { return new Date(sec * 1000).toISOString().slice(0, 10); }
  function addDays(d, n) { return new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10); }
  function daysBetween(a, b) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5); }
  function todayUtc() { return new Date().toISOString().slice(0, 10); }
  function sum(rows) { return rows.reduce(function (s, r) { return s + r.v; }, 0); }
  function lastN(rows, n) { if (!rows.length) return []; var end = rows[rows.length - 1].d, from = addDays(end, -(n - 1)); return rows.filter(function (r) { return r.d >= from; }); }
  function niceMax(v) { if (!(v > 0)) return 1; var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 8 ? 8 : 10) * p; }
  function shortDate(d, long) {
    var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+d.slice(5, 7) - 1];
    return long ? m + " '" + d.slice(2, 4) : m + ' ' + (+d.slice(8, 10));
  }
  function fmtTime(s) { return String(s).replace('T', ' ').replace(/\.\d+Z?$/, '').replace(/Z$/, ''); }
  function shortHash(h) { h = String(h); return h.length > 14 ? h.slice(0, 8) + '…' + h.slice(-4) : h; }

  /* Variational treasury daily inflow from SERIES diffs (gaps spread evenly), complete UTC days only */
  function varInflow() {
    var out = [], cut = todayUtc();
    try {
      if (typeof SERIES === 'undefined' || !SERIES || SERIES.length < 2) return out;
      for (var i = 1; i < SERIES.length; i++) {
        var gap = daysBetween(SERIES[i - 1].d, SERIES[i].d), dv = SERIES[i].v - SERIES[i - 1].v;
        if (gap < 1 || dv < 0 || SERIES[i].d >= cut) continue;
        for (var g = gap - 1; g >= 0; g--) out.push({ d: addDays(SERIES[i].d, -g), v: dv / gap });
      }
    } catch (_) { }
    return out;
  }
  function varBalance() {
    try { if (typeof SERIES !== 'undefined' && SERIES && SERIES.length) { var l = SERIES[SERIES.length - 1]; return { v: l.v, d: l.d }; } } catch (_) { }
    return null;
  }
  function serSig() { var b = varBalance(); return b ? b.d + ':' + Math.round(b.v) + ':' + SERIES.length : ''; }

  /* ---------- Lighter fetch (lazy, once, cached) ---------- */
  function getJson(u) { return fetch(u, { mode: 'cors', credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }
  function metrics(j) {
    if (!j || !Array.isArray(j.metrics)) throw new Error('Unexpected response');
    return j.metrics.map(function (m) { return { d: iso(m.timestamp), v: num(m.data) || 0 }; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  }
  function loadLit(force) {
    if (lit.state === 'loading' || (lit.state === 'ready' && !force)) return;
    lit.state = 'loading'; lit.err = ''; render();
    Promise.all([
      getJson(API_DAILY).then(metrics),
      getJson(API_USD).then(metrics),
      getJson(API_ACT).then(function (a) {
        if (!Array.isArray(a)) throw new Error('bad activity');
        return a.map(function (x) {
          var p = x && x.pubdata && x.pubdata.trade_pubdata;
          if (!p || p.market_index !== LIT.market) return null;
          var pr = num(p.price), sz = num(p.size);
          if (pr == null || sz == null) return null;
          return { hash: x.hash, time: x.time, price: pr, size: sz };
        }).filter(Boolean);
      }).catch(function () { lit.actErr = true; return []; })
    ]).then(function (r) {
      lit.daily = r[0]; lit.usd = r[1]; lit.act = r[2].sort(function (a, b) { return a.time < b.time ? 1 : -1; });
      lit.state = 'ready'; render();
    }).catch(function (e) { lit.state = 'error'; lit.err = String(e && e.message || e); render(); });
  }

  /* ---------- token models ---------- */
  function litModel() {
    return {
      key: 'lit', sym: 'LIT', total: LIT.total, circ: LIT.circ, burned: LIT.burned, burnedUrl: LIT.burnedUrl,
      address: null, addrUrl: null, daily: lit.daily, usd: lit.usd, act: lit.act, state: lit.state === 'idle' ? 'loading' : lit.state,
      err: lit.err, actErr: lit.actErr, live: true
    };
  }
  function varModel() {
    var live = VAR_BUYBACK.live, total = num(VAR_BUYBACK.totalSupply);
    return {
      key: 'var', sym: 'VAR', total: total, circ: total != null ? total * VAR_CIRC_SHARE_AT_TGE : null, burned: live ? num(VAR_BUYBACK.burned) : null, burnedUrl: null,
      address: VAR_BUYBACK.address, addrUrl: VAR_BUYBACK.address ? 'https://arbiscan.io/address/' + VAR_BUYBACK.address : null,
      daily: live ? VAR_BUYBACK.daily : [], usd: live ? VAR_BUYBACK.dailyUsd : [], act: live ? VAR_BUYBACK.activity : [],
      state: live && VAR_BUYBACK.daily.length ? 'ready' : 'empty', live: live
    };
  }

  /* ---------- charts ---------- */
  function chartDims() {
    var W = Math.max(280, (host && host.clientWidth ? host.clientWidth : 960) - 34);
    return { W: W, H: W < 520 ? 240 : 300, l: W < 520 ? 42 : 52, r: W < 520 ? 42 : 52, tp: 14, b: 26 };
  }
  function xTicks(rows, long) {
    var n = rows.length, k = Math.min(n, 5), out = [];
    if (!n) return out;
    for (var i = 0; i < k; i++) { var ix = k === 1 ? 0 : Math.round(i * (n - 1) / (k - 1)); out.push({ i: ix, label: shortDate(rows[ix].d, long) }); }
    return out;
  }
  /* bars (daily, left axis) + line (cumulative, right axis) */
  function barLine(rows, cum, o) {
    var D = chartDims(), W = D.W, H = D.H, pw = W - D.l - D.r, ph = H - D.tp - D.b, n = rows.length;
    var maxV = rows.reduce(function (m, r) { return Math.max(m, r.v); }, 0), maxC = cum.length ? cum[cum.length - 1] : 0;
    var yl = niceMax(maxV), yr = niceMax(maxC), s = '';
    var f = function (x) { return +x.toFixed(1); };
    var fmtA = function (v) { return (o.unit === 'usd' ? '$' : '') + cmp(v, 1); };
    for (var g = 0; g <= 4; g++) {
      var y = D.tp + ph - ph * g / 4;
      s += '<line class="bb-grid" x1="' + D.l + '" x2="' + (W - D.r) + '" y1="' + f(y) + '" y2="' + f(y) + '"/>';
      s += '<text class="bb-ax" x="' + (D.l - 6) + '" y="' + f(y + 3) + '" text-anchor="end">' + fmtA(yl * g / 4) + '</text>';
      s += '<text class="bb-ax bb-ax-r" x="' + (W - D.r + 6) + '" y="' + f(y + 3) + '" text-anchor="start">' + fmtA(yr * g / 4) + '</text>';
    }
    if (n) {
      var cw = pw / n, bw = Math.max(1, cw * 0.72), pts = [];
      rows.forEach(function (r, i) {
        var h = yl ? ph * r.v / yl : 0, x = D.l + cw * i + (cw - bw) / 2;
        s += '<rect class="bb-bar bb-bar-' + o.key + '" x="' + f(x) + '" y="' + f(D.tp + ph - h) + '" width="' + f(bw) + '" height="' + f(Math.max(0, h)) + '"/>';
        pts.push(f(D.l + cw * i + cw / 2) + ',' + f(D.tp + ph - ph * cum[i] / yr));
      });
      s += '<polyline class="bb-cum" points="' + pts.join(' ') + '"/>';
      xTicks(rows, n > 200).forEach(function (tk, j, a) {
        var x = D.l + cw * tk.i + cw / 2;
        s += '<text class="bb-ax" x="' + f(x) + '" y="' + (H - 8) + '" text-anchor="' + (j === 0 ? 'start' : j === a.length - 1 ? 'end' : 'middle') + '">' + tk.label + '</text>';
      });
      rows.forEach(function (r, i) {
        var tip = r.d + '|' + o.dailyLabel + '|' + o.fmt(r.v) + '|' + o.cumLabel + '|' + o.fmt(cum[i]);
        s += '<rect class="bb-hit" x="' + f(D.l + cw * i) + '" y="' + D.tp + '" width="' + f(cw) + '" height="' + ph + '" data-tip="' + esc(tip) + '"/>';
      });
    }
    return '<svg class="bb-svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" role="img" aria-label="' + esc(o.aria) + '">' + s + '</svg>';
  }
  /* two daily lines on one axis (compare) */
  function twoLines(dates, A, B, o) {
    var D = chartDims(), W = D.W, H = D.H, pw = W - D.l - 12, ph = H - D.tp - D.b, n = dates.length, s = '';
    var f = function (x) { return +x.toFixed(1); };
    var mx = 0; A.concat(B).forEach(function (v) { if (v != null && v > mx) mx = v; });
    var yl = niceMax(mx);
    for (var g = 0; g <= 4; g++) {
      var y = D.tp + ph - ph * g / 4;
      s += '<line class="bb-grid" x1="' + D.l + '" x2="' + (W - 12) + '" y1="' + f(y) + '" y2="' + f(y) + '"/><text class="bb-ax" x="' + (D.l - 6) + '" y="' + f(y + 3) + '" text-anchor="end">$' + cmp(yl * g / 4, 1) + '</text>';
    }
    var xs = function (i) { return D.l + (n > 1 ? pw * i / (n - 1) : pw / 2); };
    var path = function (arr, cls) {
      var d = '', pen = false;
      arr.forEach(function (v, i) { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + f(xs(i)) + ' ' + f(D.tp + ph - ph * v / yl); pen = true; });
      return '<path class="bb-line ' + cls + '" d="' + d + '"/>';
    };
    s += path(A, 'bb-line-lit') + path(B, 'bb-line-var');
    xTicks(dates.map(function (d) { return { d: d }; }), false).forEach(function (tk, j, a) {
      s += '<text class="bb-ax" x="' + f(xs(tk.i)) + '" y="' + (H - 8) + '" text-anchor="' + (j === 0 ? 'start' : j === a.length - 1 ? 'end' : 'middle') + '">' + tk.label + '</text>';
    });
    var cw = n > 1 ? pw / (n - 1) : pw;
    dates.forEach(function (d, i) {
      var tip = d + '|' + o.aLabel + '|' + (A[i] == null ? '—' : '$' + cmp(A[i], 2)) + '|' + o.bLabel + '|' + (B[i] == null ? '—' : '$' + cmp(B[i], 2));
      s += '<rect class="bb-hit" x="' + f(xs(i) - cw / 2) + '" y="' + D.tp + '" width="' + f(cw) + '" height="' + ph + '" data-tip="' + esc(tip) + '"/>';
    });
    return '<svg class="bb-svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" role="img" aria-label="' + esc(o.aria) + '">' + s + '</svg>';
  }

  /* ---------- generic token renderer ---------- */
  var RANGES = [['1W', 7], ['1M', 30], ['3M', 90], ['1Y', 365], ['ALL', 0]];
  function stat(label, val, sub, pill, skel) {
    return '<div class="bb-stat"><span class="bb-lbl">' + label + '</span><b class="bb-val' + (skel ? ' bb-skel' : '') + '">' + (skel ? '&nbsp;' : val) + '</b>' +
      (sub ? '<em class="bb-sub">' + sub + '</em>' : '') + (pill ? '<span class="bb-pill">' + pill + '</span>' : '') + '</div>';
  }
  function renderToken(m) {
    var sym = '$' + m.sym, loading = m.state === 'loading', ready = m.state === 'ready', empty = m.state === 'empty';
    var bought = ready ? sum(m.daily) : null, spent = ready ? sum(m.usd) : null;
    var pill = empty ? t('Starts at TGE', 'TGE부터 시작') : '';
    var pTotal = ready && m.total ? bought / m.total : null, pCirc = ready && m.circ ? bought / m.circ : null;
    var h = '<div class="bb-head"><h2>' + sym + ' ' + t('Buybacks', '바이백') + '</h2><p class="bb-lede">' +
      t(m.sym + ' buyback totals, charts, and protocol buyback activity.', m.sym + ' 바이백 누적 수치, 차트, 프로토콜 바이백 활동.') + '</p></div>';

    if (m.state === 'error') {
      h += '<div class="bb-err" role="alert"><b>' + t('Could not load Lighter buyback data.', 'Lighter 바이백 데이터를 불러오지 못했습니다.') + '</b><span>' + esc(m.err) + '</span><button type="button" class="bb-btn" data-bb-retry>' + t('Retry', '다시 시도') + '</button></div>';
    }
    if (m.key === 'var') h += firepower();

    var burnedSub = m.burnedUrl ? '<a href="' + m.burnedUrl + '" target="_blank" rel="noopener noreferrer">' + t('View burn tx ↗', '소각 트랜잭션 ↗') + '</a>' : '';
    h += '<div class="bb-stats">' +
      stat(t('Burned ', '소각된 ') + m.sym, m.burned != null ? cmp(m.burned) : '—', burnedSub, m.burned == null ? pill : '', loading) +
      stat(t('Bought ' + m.sym + ' back', m.sym + ' 매입량'), bought != null ? cmp(bought) : '—', '', bought == null ? pill : '', loading) +
      stat(t('Buyback value', '바이백 금액'), spent != null ? usd(spent) : '—', '', spent == null ? pill : '', loading) +
      stat(t('% of supply', '공급량 대비 %'), pTotal != null ? pct(pTotal) : '—', m.total ? '' : t('Total supply not announced', '총 공급량 미발표'), pTotal == null ? pill : '', loading) +
      stat(t('% of circulating supply bought', '유통량 대비 매입 %'), pCirc != null ? pct(pCirc) : '—', m.key === 'var' ? t('Circulating at TGE = 32% of total', 'TGE 유통량 = 총량의 32%') : '', pCirc == null ? pill : '', loading) +
      '</div>';

    /* window cards */
    var w24 = null, l24 = t('Last 24h', '최근 24시간');
    if (ready) {
      var oldest = m.act.length ? m.act[m.act.length - 1].time : null;
      if (oldest && Date.now() - Date.parse(oldest) >= 864e5) {
        var cut = Date.now() - 864e5; w24 = m.act.filter(function (a) { return Date.parse(a.time) >= cut; }).reduce(function (s, a) { return s + a.size; }, 0);
      } else if (m.daily.length) { w24 = m.daily[m.daily.length - 1].v; l24 = t('Last day (UTC)', '최근 1일 (UTC)'); }
    }
    var w30 = ready ? sum(lastN(m.daily, 30)) : null, w90 = ready ? sum(lastN(m.daily, 90)) : null;
    var wc = function (label, v) { return '<div class="bb-stat bb-win"><span class="bb-lbl">' + label + '</span><b class="bb-val' + (loading ? ' bb-skel' : '') + '">' + (loading ? '&nbsp;' : (v != null ? cmp(v) + ' <i>' + m.sym + '</i>' : '—')) + '</b></div>'; };
    h += '<div class="bb-wins">' + wc(l24, w24) + wc(t('Last 30D', '최근 30일'), w30) + wc(t('Last 90D', '최근 90일'), w90) + '</div>';

    /* addresses */
    var addrVal = m.address ? '<code>' + esc(m.address) + '</code>' : '<span class="bb-tba">' + t('TBA · announced at TGE', 'TBA · TGE 때 공개') + '</span>';
    var addrLink = m.addrUrl ? '<a class="bb-ext" href="' + m.addrUrl + '" target="_blank" rel="noopener noreferrer">' + t('View on Explorer ↗', '익스플로러에서 보기 ↗') + '</a>' : '';
    if (m.key === 'lit') { addrVal = '<span class="bb-tba">' + t('Protocol buyback account (Lighter account index 0)', '프로토콜 바이백 계정 (Lighter 계정 0)') + '</span>'; addrLink = '<a class="bb-ext" href="https://app.lighter.xyz/stats?tab=buybacks" target="_blank" rel="noopener noreferrer">' + t('View on Lighter ↗', 'Lighter에서 보기 ↗') + '</a>'; }
    h += '<div class="bb-addrs"><div class="bb-addr"><span class="bb-lbl">' + t('Buyback address', '바이백 주소') + '</span><div class="bb-addr-v">' + addrVal + '</div>' + addrLink + '</div>';
    if (m.key === 'var') h += '<div class="bb-addr"><span class="bb-lbl">' + t('Treasury (funds buybacks)', '트레저리 (바이백 재원)') + '</span><div class="bb-addr-v"><code>' + TREASURY + '</code></div><a class="bb-ext" href="https://arbiscan.io/address/' + TREASURY + '" target="_blank" rel="noopener noreferrer">' + t('View on Arbiscan ↗', 'Arbiscan에서 보기 ↗') + '</a></div>';
    h += '</div>';

    /* chart */
    var cs = ui.chart[m.key], isUsd = cs.m === 'usd';
    var src = isUsd ? m.usd : m.daily, rows = src;
    var rd = RANGES.filter(function (r) { return r[0] === cs.r; })[0][1];
    if (rd && rows.length) rows = lastN(rows, rd);
    var cumAll = [], run = 0, cmap = {};
    src.forEach(function (r) { run += r.v; cmap[r.d] = run; });
    var cum = rows.map(function (r) { return cmap[r.d]; });
    var label = isUsd ? t('USD Spent', 'USD 지출') : t('Bought ' + m.sym, m.sym + ' 매입');
    h += '<div class="bb-card"><div class="bb-card-top"><div class="bb-seg" role="group" aria-label="Metric">' +
      '<button type="button" data-bb-m="tok" aria-pressed="' + !isUsd + '">' + t('Bought ' + m.sym, m.sym + ' 매입') + '</button>' +
      '<button type="button" data-bb-m="usd" aria-pressed="' + isUsd + '">' + t('USD Spent', 'USD 지출') + '</button></div>' +
      '<div class="bb-seg" role="group" aria-label="Range">' + RANGES.map(function (r) { return '<button type="button" data-bb-r="' + r[0] + '" aria-pressed="' + (cs.r === r[0]) + '">' + r[0] + '</button>'; }).join('') + '</div></div>' +
      '<div class="bb-legend"><span><i class="bb-sw bb-sw-' + m.key + '"></i>' + t('Daily Buybacks', '일별 바이백') + ' (' + t('left axis', '왼쪽 축') + ')</span><span><i class="bb-sw bb-sw-cum"></i>' + t('Cumulative', '누적') + ' (' + t('right axis', '오른쪽 축') + ')</span></div>' +
      '<div class="bb-chart">' + (loading ? '<div class="bb-chart-skel bb-skel"></div>' : barLine(rows, cum, {
        key: m.key, unit: isUsd ? 'usd' : 'tok', aria: sym + ' ' + label,
        fmt: function (v) { return (isUsd ? '$' : '') + cmp(v, 2) + (isUsd ? '' : ' ' + m.sym); }, dailyLabel: t('Daily', '일별'), cumLabel: t('Cumulative', '누적')
      })) +
      (empty ? '<div class="bb-empty"><b>' + t('No buybacks yet', '아직 바이백 없음') + '</b><span>' + t('$VAR buy & burn begins at TGE', '$VAR 매입·소각은 TGE부터 시작') + '</span></div>' : '') +
      '<div class="bb-tip" hidden></div></div></div>';

    /* activity table */
    var body;
    if (loading) body = '<tr><td colspan="6"><div class="bb-skel bb-row-skel"></div></td></tr>';
    else if (!m.act.length) body = '<tr><td colspan="6" class="bb-td-empty">' + (empty ? t('No buyback transactions yet. Rows appear here once $VAR buy & burn starts at TGE.', '바이백 거래가 아직 없습니다. TGE 후 $VAR 매입·소각이 시작되면 여기에 표시됩니다.') : (m.actErr ? t('Activity feed unavailable right now.', '활동 피드를 지금 불러올 수 없습니다.') : t('No activity found.', '활동 없음.'))) + '</td></tr>';
    else body = m.act.slice(0, 100).map(function (a) {
      return '<tr><td data-l="HASH"><code title="' + esc(a.hash) + '">' + esc(shortHash(a.hash)) + '</code></td><td data-l="TIME">' + esc(fmtTime(a.time)) + '</td><td>' + m.sym + '</td><td class="bb-r">$' + (+a.price).toFixed(4) + '</td><td class="bb-r">' + (+a.size).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '</td><td class="bb-r">$' + (a.price * a.size).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '</td></tr>';
    }).join('');
    var nAct = loading ? '' : ' <span class="bb-act-n">' + Math.min(m.act.length, 100) + '</span>';
    h += '<div class="bb-card bb-act' + (ui.actOpen ? ' is-open' : '') + '"><div class="bb-card-top"><button type="button" class="bb-act-tog" data-bb-act aria-expanded="' + ui.actOpen + '" aria-controls="bb-act-' + m.sym + '"><span class="bb-chev" aria-hidden="true"></span><h3 class="bb-h3">' + t('Protocol Buybacks Activity', '프로토콜 바이백 활동') + nAct + '</h3><span class="bb-act-hint">' + (ui.actOpen ? t('Hide', '접기') : t('Show', '펼치기')) + '</span></button></div><div class="bb-tablewrap" id="bb-act-' + m.sym + '"' + (ui.actOpen ? '' : ' hidden') + '><table class="bb-table"><thead><tr><th>' + t('Hash', '해시') + '</th><th>' + t('Time (UTC)', '시간 (UTC)') + '</th><th>' + t('Token', '토큰') + '</th><th class="bb-r">' + t('Price', '가격') + '</th><th class="bb-r">' + t('Bought ', '매입 ') + m.sym + '</th><th class="bb-r">' + t('USD value', 'USD 가치') + '</th></tr></thead><tbody>' + body + '</tbody></table></div></div>';

    if (m.key === 'lit') h += '<p class="bb-note">' + t('Source: Lighter public APIs (exchangeMetrics, explorer logs). Supply constants as of ' + LIT.asOf + ': total ' + cmp(LIT.total, 0) + ' LIT; circulating ≈ ' + cmp(LIT.circ, 0) + ' (derived: 19.46M ÷ 7.79%); burned ' + cmp(LIT.burned) + ' LIT. Activity shows the latest 100 trades. Not affiliated with Lighter.', '출처: Lighter 공개 API(exchangeMetrics, 익스플로러 로그). 공급량 상수는 ' + LIT.asOf + ' 기준: 총 ' + cmp(LIT.total, 0) + ' LIT, 유통량 ≈ ' + cmp(LIT.circ, 0) + '(19.46M ÷ 7.79%로 역산), 소각 ' + cmp(LIT.burned) + ' LIT. 활동은 최근 100건입니다. Lighter와 무관합니다.') + '</p>';
    else h += '<p class="bb-note">' + t('Official tokenomics: 100% of Variational treasury revenue is set to buy & burn $VAR. Nothing here is executed yet; figures fill in automatically once buybacks start.', '공식 토크노믹스: Variational 트레저리 수익 100%가 $VAR 매입·소각에 쓰일 예정입니다. 아직 집행된 것은 없으며, 바이백이 시작되면 자동으로 채워집니다.') + '</p>';
    return h;
  }

  function firepower() {
    var bal = varBalance(), inf = varInflow(), d30 = lastN(inf, 30), last = inf.length ? inf[inf.length - 1] : null;
    var s30 = d30.length ? sum(d30) : null;
    return '<div class="bb-fire"><div class="bb-fire-top"><span class="bb-lbl bb-lbl-acc">' + t('Buyback firepower · pre-TGE', '바이백 화력 · TGE 이전') + '</span><span class="bb-pill">' + t('Real on-chain data', '실제 온체인 데이터') + '</span></div>' +
      '<div class="bb-fire-grid"><div><span class="bb-lbl">' + t('Treasury USDC accumulated', '트레저리 USDC 누적') + '</span><b class="bb-val">' + (bal ? usd(bal.v) : '—') + '</b>' + (bal ? '<em class="bb-sub">' + t('as of ', '') + bal.d + t('', ' 기준') + '</em>' : '') + '</div>' +
      '<div><span class="bb-lbl">' + t('Last full day inflow', '직전 1일 유입') + '</span><b class="bb-val">' + (last ? usd(last.v) : '—') + '</b>' + (last ? '<em class="bb-sub">' + last.d + ' UTC</em>' : '') + '</div>' +
      '<div><span class="bb-lbl">' + t('Last 30D inflow', '최근 30일 유입') + '</span><b class="bb-val">' + (s30 != null ? usd(s30) : '—') + '</b>' + (s30 != null ? '<em class="bb-sub">' + usd(s30 / d30.length) + t(' / day', ' / 일') + '</em>' : '') + '</div></div>' +
      '<p class="bb-fire-note">' + t('100% of treasury revenue is set to fund $VAR buy & burn (official tokenomics). This is accrued USDC, not executed buybacks.', '트레저리 수익 100%가 $VAR 매입·소각 재원으로 쓰일 예정입니다(공식 토크노믹스). 누적된 USDC이며 집행된 바이백이 아닙니다.') + '</p></div>';
  }

  /* ---------- compare view ---------- */
  function renderCompare() {
    var m = litModel(), loading = m.state === 'loading', err = m.state === 'error', ready = m.state === 'ready';
    var h = '<div class="bb-head"><h2>' + t('Lighter vs Variational', 'Lighter vs Variational') + '</h2><p class="bb-lede">' + t('What Lighter spends on $LIT buybacks today versus what Variational treasury is accruing for a future $VAR buy & burn.', 'Lighter가 현재 $LIT 바이백에 쓰는 금액과, Variational 트레저리가 향후 $VAR 매입·소각을 위해 쌓고 있는 금액을 비교합니다.') + '</p></div>';
    if (err) return h + '<div class="bb-err" role="alert"><b>' + t('Could not load Lighter buyback data.', 'Lighter 바이백 데이터를 불러오지 못했습니다.') + '</b><span>' + esc(m.err) + '</span><button type="button" class="bb-btn" data-bb-retry>' + t('Retry', '다시 시도') + '</button></div>';

    var cut = todayUtc();
    var lUsd = ready ? m.usd.filter(function (r) { return r.d < cut; }) : [], l30 = lastN(lUsd, 30);
    var vIn = varInflow(), v30 = lastN(vIn, 30), bal = varBalance();
    var lAvg = l30.length ? sum(l30) / l30.length : null, vAvg = v30.length ? sum(v30) / v30.length : null;
    var lRun = lAvg != null ? lAvg * 365 : null, vRun = vAvg != null ? vAvg * 365 : null;
    var lTot = ready ? sum(m.usd) : null, lTok = ready ? sum(m.daily) : null;
    var price = ready && m.act.length ? m.act[0].price : null, lFdv = price != null ? price * LIT.total : null;
    var sk = function (v) { return loading ? '<span class="bb-skel bb-inline">&nbsp;</span>' : v; };

    var row = function (k, a, b) { return '<tr><th scope="row">' + k + '</th><td>' + a + '</td><td>' + b + '</td></tr>'; };
    h += '<div class="bb-card"><div class="bb-tablewrap"><table class="bb-table bb-cmp"><thead><tr><th></th><th><i class="bb-sw bb-sw-lit"></i>Lighter · $LIT</th><th><i class="bb-sw bb-sw-var"></i>Variational · $VAR</th></tr></thead><tbody>' +
      row(t('Funding source', '재원'), t('Protocol revenue → LIT buyback', '프로토콜 수익 → LIT 바이백'), t('100% of treasury revenue → buy & burn', '트레저리 수익 100% → 매입·소각')) +
      row(t('Status', '상태'), t('Live since 30 Dec 2025', '2025년 12월 30일부터 진행 중'), t('Starts at TGE, Q4 2026', 'TGE(2026년 4분기)부터 시작')) +
      row(t('Total USD deployed', '누적 집행 USD'), sk(usd(lTot)), '$0 · ' + (bal ? usd(bal.v) + ' ' + t('accumulated', '누적') : '—')) +
      row(t('Avg USD per day · 30D', '일평균 USD · 30일'), sk(usd(lAvg)) + '<em>' + t('buyback spend', '바이백 지출') + '</em>', usd(vAvg) + '<em>' + t('treasury inflow', '트레저리 유입') + '</em>') +
      row(t('Annualised run-rate', '연환산 규모'), sk(usd(lRun)), usd(vRun)) +
      row(t('Tokens burned', '소각 토큰'), cmp(LIT.burned) + ' LIT', '—  <em>' + t('starts at TGE', 'TGE부터') + '</em>') +
      row(t('% of supply bought', '공급량 대비 매입 %'), sk(ready ? pct(lTok / LIT.total) : '—'), '—') +
      '</tbody></table></div></div>';

    /* 90-day chart: complete UTC days */
    var end = addDays(cut, -1), dates = [], i;
    for (i = 89; i >= 0; i--) dates.push(addDays(end, -i));
    var lm = {}, vm = {}; lUsd.forEach(function (r) { lm[r.d] = r.v; }); vIn.forEach(function (r) { vm[r.d] = r.v; });
    var A = dates.map(function (d) { return ready && lm[d] != null ? lm[d] : null; }), B = dates.map(function (d) { return vm[d] != null ? vm[d] : null; });
    var aL = 'Lighter · ' + t('USD spent on LIT', 'LIT에 쓴 USD'), bL = 'Variational · ' + t('USD accrued for future buy & burn', '향후 매입·소각용으로 쌓인 USD');
    h += '<div class="bb-card"><div class="bb-card-top"><h3 class="bb-h3">' + t('Daily USD · last 90 days', '일별 USD · 최근 90일') + '</h3></div><div class="bb-legend"><span><i class="bb-sw bb-sw-lit"></i>' + aL + '</span><span><i class="bb-sw bb-sw-var"></i>' + bL + '</span></div>' +
      '<div class="bb-chart">' + (loading ? '<div class="bb-chart-skel bb-skel"></div>' : twoLines(dates, A, B, { aLabel: 'Lighter', bLabel: 'Variational', aria: aL + ' vs ' + bL })) + '<div class="bb-tip" hidden></div></div></div>';

    /* implied buyback yield */
    var fdvs = [1e9, 2e9, 3e9, 5e9];
    var vy = vRun != null ? vRun / ui.fdv : null;
    h += '<div class="bb-card bb-yield"><div class="bb-card-top"><h3 class="bb-h3">' + t('Implied buyback yield', '내재 바이백 수익률') + '</h3><span class="bb-sub">' + t('annualised run-rate ÷ FDV', '연환산 규모 ÷ FDV') + '</span></div><div class="bb-yield-grid">' +
      '<div class="bb-stat"><span class="bb-lbl"><i class="bb-sw bb-sw-lit"></i>Lighter</span><b class="bb-val">' + sk(lRun != null && lFdv ? pct(lRun / lFdv) : '—') + '</b><em class="bb-sub">' + (lFdv ? t('FDV ', 'FDV ') + usd(lFdv) + ' · $' + price.toFixed(2) + ' × 1B' : t('needs latest LIT price', '최신 LIT 가격 필요')) + '</em></div>' +
      '<div class="bb-stat"><span class="bb-lbl"><i class="bb-sw bb-sw-var"></i>Variational</span><b class="bb-val">' + pct(vy) + '</b><em class="bb-sub">' + t('at FDV ', 'FDV ') + usd(ui.fdv, 0) + '</em>' +
      '<div class="bb-chips" role="group" aria-label="FDV">' + fdvs.map(function (f) { return '<button type="button" data-bb-fdv="' + f + '" aria-pressed="' + (ui.fdv === f) + '">$' + (f / 1e9) + 'B</button>'; }).join('') + '</div></div></div>' +
      '<p class="bb-note">' + t('Caveat: Variational’s figure is treasury accrual, not executed buybacks. Run-rates use the last 30 complete UTC days × 365 and will move; FDV for $VAR is hypothetical.', '주의: Variational 수치는 트레저리 적립액이며 집행된 바이백이 아닙니다. 규모는 최근 30일(완결 UTC일) 평균 × 365이며 변동합니다. $VAR FDV는 가정치입니다.') + '</p></div>';
    return h;
  }

  /* ---------- shell ---------- */
  function render() {
    if (!host) return;
    ko = (document.documentElement.lang || '').indexOf('ko') === 0;
    host.classList.toggle('is-ko', ko);
    lastW = host.clientWidth; lastSig = serSig();
    var views = [['var', '$VAR'], ['lit', '$LIT'], ['cmp', t('Compare', '비교')]];
    var bar = '<div class="bb-toolbar"><div class="bb-view-tabs" role="tablist" aria-label="Buybacks view">' + views.map(function (v) {
      return '<button role="tab" type="button" data-bb-view="' + v[0] + '" aria-selected="' + (ui.view === v[0]) + '" tabindex="' + (ui.view === v[0] ? 0 : -1) + '">' + v[1] + '</button>';
    }).join('') + '</div><span class="bb-toolbar-note">' + t('Mirrors the Lighter $LIT Buybacks page', 'Lighter $LIT 바이백 페이지를 그대로 따랐습니다') + '</span></div>';
    var body = ui.view === 'var' ? renderToken(varModel()) : ui.view === 'lit' ? renderToken(litModel()) : renderCompare();
    host.innerHTML = bar + '<div class="bb-body" role="tabpanel">' + body + '</div>';
  }
  function setView(v) {
    ui.view = v;
    if (v !== 'var' && lit.state === 'idle') { loadLit(); return; }
    render();
  }

  function onClick(e) {
    var b;
    if ((b = e.target.closest('[data-bb-view]'))) { setView(b.dataset.bbView); var a = host.querySelector('[data-bb-view="' + ui.view + '"]'); if (a) a.focus({ preventScroll: true }); return; }
    if ((b = e.target.closest('[data-bb-m]'))) { ui.chart[ui.view === 'lit' ? 'lit' : 'var'].m = b.dataset.bbM; render(); return; }
    if ((b = e.target.closest('[data-bb-r]'))) { ui.chart[ui.view === 'lit' ? 'lit' : 'var'].r = b.dataset.bbR; render(); return; }
    if ((b = e.target.closest('[data-bb-fdv]'))) { ui.fdv = +b.dataset.bbFdv; render(); return; }
    if (e.target.closest('[data-bb-act]')) { ui.actOpen = !ui.actOpen; render(); var tg = host.querySelector('[data-bb-act]'); if (tg) tg.focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-bb-retry]')) { lit.state = 'idle'; loadLit(true); }
  }
  function onKey(e) {
    if (!e.target.closest('[data-bb-view]') || ['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
    e.preventDefault();
    var order = ['var', 'lit', 'cmp'], i = order.indexOf(ui.view);
    i = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
    setView(order[i]); var a = host.querySelector('[data-bb-view="' + ui.view + '"]'); if (a) a.focus({ preventScroll: true });
  }
  function onTip(e) {
    var tip = host.querySelector('.bb-tip');
    var hit = e.target.closest && e.target.closest('.bb-hit');
    if (!tip) return;
    if (!hit) { tip.hidden = true; return; }
    var wrap = hit.closest('.bb-chart'), tp = wrap.querySelector('.bb-tip'), p = hit.dataset.tip.split('|');
    tp.innerHTML = '<b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + ' <i>' + esc(p[2]) + '</i></span><span>' + esc(p[3]) + ' <i>' + esc(p[4]) + '</i></span>';
    tp.hidden = false;
    var wr = wrap.getBoundingClientRect(), hr = hit.getBoundingClientRect();
    var x = hr.left + hr.width / 2 - wr.left, w = tp.offsetWidth;
    tp.style.left = Math.max(4, Math.min(wr.width - w - 4, x - w / 2)) + 'px';
    tp.style.top = '8px';
  }

  /* ---------- public hook ---------- */
  window.VarBuybacks = {
    load: function (d) {
      d = d || {};
      var conv = function (a) { return (a || []).map(function (m) { return { d: iso(m.timestamp), v: num(m.data) || 0 }; }).sort(function (x, y) { return x.d < y.d ? -1 : 1; }); };
      VAR_BUYBACK.daily = conv(d.daily); VAR_BUYBACK.dailyUsd = conv(d.dailyUsd);
      VAR_BUYBACK.activity = (d.activity || []).map(function (a) { return { hash: a.hash, time: a.time, price: num(a.price), size: num(a.size) }; }).filter(function (a) { return a.price != null && a.size != null; }).sort(function (a, b) { return a.time < b.time ? 1 : -1; });
      if (d.address) VAR_BUYBACK.address = d.address;
      if (d.totalSupply != null) VAR_BUYBACK.totalSupply = d.totalSupply;
      if (d.burned != null) VAR_BUYBACK.burned = d.burned;
      VAR_BUYBACK.live = true; render();
    },
    config: VAR_BUYBACK
  };

  function boot() {
    VALID_TABS.push(TAB); DEFAULT_TAB_ORDER.push(TAB);
    SECTION_COPY[TAB] = { eyebrow: 'Post-TGE', title: 'Buyback and Burn', description: 'Lighter $LIT buybacks versus Variational $VAR buy & burn.', chip: 'Buy & Burn' };
    host = document.createElement('section'); host.className = 'bb-section tsec tg-hide'; host.dataset.tg = TAB;
    document.getElementById('main').appendChild(host);
    render();
    host.addEventListener('click', onClick); host.addEventListener('keydown', onKey);
    host.addEventListener('mouseover', onTip); host.addEventListener('mousemove', onTip);
    host.addEventListener('mouseleave', function () { var tp = host.querySelector('.bb-tip'); if (tp) tp.hidden = true; });
    host.addEventListener('click', function (e) { if (e.target.closest('.bb-hit')) onTip(e); });
    var btn = document.createElement('button'); btn.type = 'button'; btn.id = 'tab-' + TAB; btn.dataset.tab = TAB; btn.setAttribute('role', 'tab'); btn.textContent = 'Buyback and Burn';
    document.getElementById('tabs').appendChild(btn);
    document.querySelectorAll('[data-open-tab="comparing-revenue"]').forEach(function (anchor) {
      var mine = anchor.cloneNode(true); mine.dataset.openTab = TAB;
      var label = mine.querySelector('strong') || mine.querySelector('b'); if (label) label.textContent = 'Buyback and Burn';
      mine.setAttribute('aria-label', 'Buyback and Burn'); anchor.parentNode.insertBefore(mine, anchor.nextSibling);
    });
    new MutationObserver(function () {
      var k = (document.documentElement.lang || '').indexOf('ko') === 0;
      if (k !== ko) { render(); btn.textContent = k ? '바이백·소각' : 'Buyback and Burn'; }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    if (document.documentElement.lang.indexOf('ko') === 0) btn.textContent = '바이백·소각';
    /* chart width follows the container; also covers the tab becoming visible */
    if (window.ResizeObserver) new ResizeObserver(function () { var w = host.clientWidth; if (w > 0 && Math.abs(w - lastW) >= 4) render(); }).observe(host);
    /* SERIES can grow after a live sync */
    setInterval(function () { if (host.clientWidth > 0 && serSig() !== lastSig) render(); }, 30000);
    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
