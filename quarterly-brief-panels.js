/* Quarterly Brief — analyst lens for the #biweekly tab.
   Framework adapted from Alea Research's Q3 2026 report on Variational; all copy is ours.
   Data: DeFiLlama (venue volume / OI), Variational public stats (live product mix),
   the dashboard's own treasury series + official biweekly reports, CoinGecko / static BTC closes.
   Lazy: nothing is fetched until the Official Reports tab is first shown. */
(function () {
  'use strict';

  var SEC = document.querySelector('.tsec[data-tg="biweekly"]');
  if (!SEC) return;

  /* ---------- config ---------- */
  var LLAMA = 'https://api.llama.fi/v2/chart/';
  var STATS_URL = 'https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats';
  var TWEET = 'https://x.com/AleaResearch/status/2115092043768758527';
  var TRIM_FROM = '2025-12-15';         // earliest day we keep (Variational volume starts 2025-12-29)
  var TTL = 6 * 3600 * 1000;            // localStorage TTL for history
  var TTL_LIVE = 10 * 60 * 1000;        // live snapshot TTL
  var SPREAD_SHARE = 0.20;              // treasury share of spreads (observed in the latest reports)
  var FIRST_Q = { y: 2026, q: 1 };
  var VENUES = [
    { slug: 'hyperliquid', name: 'Hyperliquid' },
    { slug: 'aster', name: 'Aster' },
    { slug: 'lighter', name: 'Lighter' },
    { slug: 'edgex', name: 'edgeX' },
    { slug: 'variational', name: 'Variational', me: true },
    { slug: 'grvt', name: 'GRVT' },
    { slug: 'pacifica', name: 'Pacifica' },
    { slug: 'extended', name: 'Extended' },
    { slug: 'apex-omni', name: 'ApeX Omni' },
    { slug: 'paradex', name: 'Paradex' }
  ];
  var ME = 'variational', HL = 'hyperliquid';

  /* ---------- tiny helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fin = function (v) { return typeof v === 'number' && isFinite(v); };
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dnum(s) { return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5; }
  function ymd(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function addDays(s, n) { return ymd((dnum(s) + n) * 864e5); }
  function diffDays(a, b) { return Math.round(dnum(b) - dnum(a)); }
  function dayList(a, b) { var o = [], d = a; while (d <= b) { o.push(d); d = addDays(d, 1); } return o; }
  function monthEnd(y, m) { return ymd(Date.UTC(y, m, 0)); }          // m is 1-12
  function qStart(y, q) { return y + '-' + pad(q * 3 - 2) + '-01'; }
  function qEnd(y, q) { return monthEnd(y, q * 3); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dshort(s) { return MON[+s.slice(5, 7) - 1] + ' ' + (+s.slice(8, 10)); }

  function sig(x) { var a = Math.abs(x); return a >= 100 ? x.toFixed(0) : a >= 10 ? x.toFixed(1) : x.toFixed(2); }
  function money(n) {
    if (!fin(n)) return '—';
    var a = Math.abs(n), s = n < 0 ? '-' : '';
    if (a >= 1e12) return s + '$' + (a / 1e12).toFixed(2) + 'T';
    if (a >= 1e9) return s + '$' + sig(a / 1e9) + 'B';
    if (a >= 1e6) return s + '$' + sig(a / 1e6) + 'M';
    if (a >= 1e3) return s + '$' + sig(a / 1e3) + 'K';
    return s + '$' + a.toFixed(0);
  }
  function pct(x, dp, plus) { if (!fin(x)) return '—'; return (plus && x > 0 ? '+' : '') + (x * 100).toFixed(dp == null ? 1 : dp) + '%'; }
  function delta(a, b) { return fin(a) && fin(b) && b > 0 ? a / b - 1 : null; }
  function dcls(x) { return !fin(x) ? '' : x >= 0 ? 'up' : 'dn'; }
  function pp(x) { return fin(x) ? (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(1) + ' pp' : '—'; }
  function sgn(x, dp) { return fin(x) ? (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(dp == null ? 0 : dp) + '%' : '—'; }
  function ordinal(n) { return '#' + n; }

  /* ---------- fetch with cache ---------- */
  var MEM = {};
  function lsGet(key, ttl) {
    try {
      var raw = localStorage.getItem(key); if (!raw) return null;
      var o = JSON.parse(raw); if (!o || Date.now() - o.t > ttl) return null; return o.d;
    } catch (e) { return null; }
  }
  function lsSet(key, d) { try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: d })); } catch (e) { /* quota / private mode */ } }
  function getJson(url, o) {
    o = o || {};
    if (MEM[url]) return MEM[url];
    var key = 'qb1:' + url;
    var hit = lsGet(key, o.ttl || TTL);
    if (hit) { MEM[url] = Promise.resolve(hit); return MEM[url]; }
    var p = new Promise(function (res, rej) {
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); rej(new Error('timeout')); }, o.timeout || 20000);
      fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (j) {
        clearTimeout(timer);
        var d = o.reduce ? o.reduce(j) : j;
        lsSet(key, d); res(d);
      }).catch(function (e) { clearTimeout(timer); rej(e); });
    });
    MEM[url] = p;
    p.catch(function () { delete MEM[url]; });       // allow retry after a failure
    return p;
  }
  var trimSeries = function (j) {
    if (!Array.isArray(j)) throw new Error('bad shape');
    var cut = dnum(TRIM_FROM) * 86400;
    return j.filter(function (r) { return r && r[0] >= cut && fin(+r[1]); }).map(function (r) { return [r[0], +r[1]]; });
  };
  function toMap(arr) {
    var m = {}, first = null, last = null;
    arr.forEach(function (r) { var d = ymd(r[0] * 1000); m[d] = r[1]; if (first === null || d < first) first = d; if (last === null || d > last) last = d; });
    return { m: m, first: first, last: last };
  }
  // small pool so we don't fire 22 requests at once
  function pool(tasks, n) {
    return new Promise(function (resolve) {
      var i = 0, active = 0, out = new Array(tasks.length);
      function next() {
        if (i >= tasks.length && active === 0) return resolve(out);
        while (active < n && i < tasks.length) {
          (function (k) {
            active++;
            tasks[k]().then(function (v) { out[k] = { ok: true, v: v }; }, function (e) { out[k] = { ok: false, e: e }; })
              .then(function () { active--; next(); });
          })(i++);
        }
      }
      next();
    });
  }

  /* ---------- state ---------- */
  var S = { focus: null, fdv: 1e9, raw: null, errs: [], loading: false, started: false, M: null };

  function loadAll() {
    S.loading = true; S.errs = []; render();
    var tasks = [], meta = [];
    VENUES.forEach(function (v) {
      tasks.push(function () { return getJson(LLAMA + 'derivatives/protocol/' + v.slug, { reduce: trimSeries }); }); meta.push({ t: 'vol', v: v });
      tasks.push(function () { return getJson(LLAMA + 'open-interest/protocol/' + v.slug + '?dataType=openInterestAtEnd', { reduce: trimSeries }); }); meta.push({ t: 'oi', v: v });
    });
    tasks.push(function () { return getJson(LLAMA + 'derivatives', { reduce: trimSeries }); }); meta.push({ t: 'agg' });
    tasks.push(function () { return getJson(STATS_URL, { ttl: TTL_LIVE, reduce: slimStats }); }); meta.push({ t: 'stats' });
    tasks.push(function () { return getJson('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=330&interval=daily', { reduce: function (j) { return (j && j.prices || []).map(function (p) { return [Math.round(p[0] / 1000), p[1]]; }); } }); }); meta.push({ t: 'btc' });
    return pool(tasks, 6).then(function (rs) {
      var raw = { vol: {}, oi: {}, agg: null, stats: null, btc: null, at: Date.now() };
      rs.forEach(function (r, i) {
        var m = meta[i];
        if (!r.ok) { if (m.t === 'btc') return; S.errs.push((m.v ? m.v.name + ' ' + m.t : m.t) + ' (' + (r.e && r.e.message || 'failed') + ')'); return; }
        if (m.t === 'vol') raw.vol[m.v.slug] = toMap(r.v);
        else if (m.t === 'oi') raw.oi[m.v.slug] = toMap(r.v);
        else if (m.t === 'agg') raw.agg = toMap(r.v);
        else if (m.t === 'stats') raw.stats = r.v;
        else if (m.t === 'btc') raw.btc = r.v;
      });
      S.raw = raw; S.loading = false;
      render();
    });
  }
  // keep only what the product-mix exhibit needs (the raw payload is ~300 KB)
  function slimStats(j) {
    if (!j || !Array.isArray(j.listings)) throw new Error('bad shape');
    return {
      total_volume_24h: +j.total_volume_24h, open_interest: +j.open_interest,
      listings: j.listings.map(function (l) {
        var oi = l.open_interest;
        return { t: l.ticker, n: l.name || '', v: +l.volume_24h || 0, o: oi ? (+oi.long_open_interest || 0) + (+oi.short_open_interest || 0) : 0, f: l.funding_interval_s };
      })
    };
  }

  /* ---------- treasury (from dashboard.js globals) ---------- */
  function treasurySeries() {
    try { if (typeof SERIES !== 'undefined' && Array.isArray(SERIES) && SERIES.length) return SERIES; } catch (e) { }
    return [];
  }
  function balAt(ser, d) { var v = null; for (var i = 0; i < ser.length; i++) { if (ser[i].d <= d) v = ser[i]; else break; } return v; }
  // inflow between the close of (a-1) and the close of min(b,last). Series starts at 0 on its first day.
  function inflow(ser, a, b) {
    if (!ser.length) return null;
    var first = ser[0], last = ser[ser.length - 1];
    if (b < first.d || a > last.d) return null;
    var s0 = balAt(ser, addDays(a, -1)), startDate;
    if (!s0) { s0 = first; startDate = first.d; } else startDate = s0.d;
    var e = balAt(ser, b < last.d ? b : last.d);
    if (!e || e.d <= startDate) return null;
    var days = diffDays(startDate, e.d);
    return { inflow: e.v - s0.v, days: days, from: addDays(startDate, 1), to: e.d, perDay: (e.v - s0.v) / days };
  }

  /* ---------- model ---------- */
  function buildQuarters(end) {
    var qs = [], y = FIRST_Q.y, q = FIRST_Q.q;
    while (qStart(y, q) <= end) {
      var e = qEnd(y, q), part = e > end;
      qs.push({ key: y + 'Q' + q, y: y, q: q, label: 'Q' + q + ' ' + y, short: 'Q' + q, start: qStart(y, q), end: part ? end : e, fullEnd: e, partial: part, days: diffDays(qStart(y, q), part ? end : e) + 1 });
      q++; if (q > 4) { q = 1; y++; }
    }
    return qs;
  }

  function compute() {
    var raw = S.raw; if (!raw) return null;
    var okV = VENUES.filter(function (v) { return raw.vol[v.slug]; });
    if (!raw.vol[ME]) return { fatal: 'Variational volume history is unavailable right now.' };
    // last full UTC day on which most venues have posted a volume row
    var yday = addDays(ymd(Date.now()), -1), need = Math.ceil(okV.length * 0.8), END = yday;
    for (var i = 0; i < 10; i++, END = addDays(END, -1)) {
      var c = okV.filter(function (v) { return raw.vol[v.slug].m[END] != null; }).length;
      if (c >= need) break;
    }
    var quarters = buildQuarters(END);
    var M = { END: END, quarters: quarters, venues: okV, missing: VENUES.filter(function (v) { return !raw.vol[v.slug] || !raw.oi[v.slug]; }), qv: {}, set: {}, agg: {} };

    quarters.forEach(function (q) {
      var qd = {}, advSum = 0, oiSum = 0;
      okV.forEach(function (v) {
        var vol = raw.vol[v.slug], oi = raw.oi[v.slug];
        var s = vol.first && vol.first > q.start ? vol.first : q.start, r = { adv: null, oi: null, turn: null, vol: 0 };
        if (s <= q.end) {
          var n = diffDays(s, q.end) + 1, sum = 0;
          dayList(s, q.end).forEach(function (d) { sum += vol.m[d] || 0; });
          r.vol = sum; r.adv = sum / n;
        }
        if (oi) {
          var cnt = 0, tot = 0;
          dayList(q.start, q.end).forEach(function (d) { var x = oi.m[d]; if (x != null) { tot += x; cnt++; } });
          if (cnt) r.oi = tot / cnt;
        }
        if (fin(r.adv) && fin(r.oi) && r.oi > 0) r.turn = r.adv / r.oi;
        qd[v.slug] = r;
        if (fin(r.adv)) advSum += r.adv;
        if (fin(r.oi)) oiSum += r.oi;
      });
      var order = okV.filter(function (v) { return fin(qd[v.slug].adv); }).sort(function (a, b) { return qd[b.slug].adv - qd[a.slug].adv; });
      order.forEach(function (v, i) { qd[v.slug].rank = i + 1; });
      okV.forEach(function (v) {
        var r = qd[v.slug];
        r.volShare = fin(r.adv) && advSum ? r.adv / advSum : null;
        r.oiShare = fin(r.oi) && oiSum ? r.oi / oiSum : null;
      });
      M.qv[q.key] = qd; M.set[q.key] = { adv: advSum, oi: oiSum, n: order.length };
      if (raw.agg) { var t = 0; dayList(q.start, q.end).forEach(function (d) { t += raw.agg.m[d] || 0; }); M.agg[q.key] = t / q.days; }
    });

    // weekly share (weeks end on END)
    var weeks = [], NW = 30;
    for (var w = NW - 1; w >= 0; w--) {
      var we = addDays(END, -7 * w), ws = addDays(we, -6);
      var vs = 0, vm = 0, os = 0, om = 0, days = dayList(ws, we);
      okV.forEach(function (v) {
        var vol = raw.vol[v.slug], oi = raw.oi[v.slug], sv = 0;
        days.forEach(function (d) { sv += vol.m[d] || 0; });
        vs += sv; if (v.slug === ME) vm = sv;
        if (oi) {
          var c = 0, t = 0; days.forEach(function (d) { if (oi.m[d] != null) { t += oi.m[d]; c++; } });
          if (c) { var a = t / c; os += a; if (v.slug === ME) om = a; }
        }
      });
      weeks.push({ s: ws, e: we, volShare: vs ? vm / vs : null, oiShare: os ? om / os : null });
    }
    M.weeks = weeks;

    // treasury
    var ser = treasurySeries(); M.ser = ser;
    M.tq = {};
    quarters.forEach(function (q) {
      var t = inflow(ser, q.start, q.end);
      if (t) { t.spread = t.inflow / SPREAD_SHARE; t.spreadPerDay = t.spread / t.days; }
      M.tq[q.key] = t;
    });
    // months, for the bps line
    M.months = [];
    if (ser.length) {
      var y = 2026, m = 1, vme = raw.vol[ME];
      while (qStart(y, Math.ceil(m / 3)) <= END && m <= 12) {
        var ms = y + '-' + pad(m) + '-01', me = monthEnd(y, m);
        var t2 = inflow(ser, ms, me > END ? END : me);
        if (t2) {
          var vsum = 0; dayList(t2.from, t2.to).forEach(function (d) { vsum += vme.m[d] || 0; });
          var spread = t2.inflow / SPREAD_SHARE;
          M.months.push({ label: MON[m - 1], from: t2.from, to: t2.to, days: t2.days, partial: t2.days < diffDays(ms, me) + 1, spread: spread, vol: vsum, bps: vsum > 0 ? spread / vsum * 1e4 : null });
        }
        m++; if (m > 12) break;
      }
    }

    // official report cross-check (pro-rata of each report window into calendar quarters)
    var H = [], allH = null;
    try { allH = BIWEEKLY_HISTORY; } catch (e) { allH = null; }
    M.official = {};
    if (allH) {
      quarters.forEach(function (q) { M.official[q.key] = { spreads: 0, treasury: 0, cov: 0 }; });
      for (var k = 1; k < allH.length; k++) {
        var r = allH[k], ws2 = addDays(allH[k - 1].asOf, 1), we2 = r.asOf, n2 = diffDays(ws2, we2) + 1;
        if (!fin(r.spreads2w) || !(n2 > 0)) continue;
        dayList(ws2, we2).forEach(function (d) {
          quarters.forEach(function (q) {
            if (d >= q.start && d <= q.end) { var o = M.official[q.key]; o.spreads += r.spreads2w / n2; o.treasury += (r.treasury2w || 0) / n2; o.cov++; }
          });
        });
      }
    }

    // BTC per quarter
    M.btc = {};
    var prices = {}, btcSrc = '';
    if (raw.btc && raw.btc.length > 30) { raw.btc.forEach(function (p) { prices[ymd(p[0] * 1000)] = p[1]; }); btcSrc = 'CoinGecko'; }
    var lastP = null; Object.keys(prices).forEach(function (k) { if (!lastP || k > lastP) lastP = k; });
    quarters.forEach(function (q) {
      var a = prices[q.start], b = q.partial ? prices[lastP] : prices[addDays(q.fullEnd, 1)];
      M.btc[q.key] = (fin(a) && fin(b)) ? b / a - 1 : null;
    });
    M.btcSrc = btcSrc;
    if (!btcSrc) {             // fall back to the static Binance closes shipped with the page
      try {
        var mp = {}; MARKET_BTC.forEach(function (r) { mp[r[0]] = r[1]; });
        quarters.forEach(function (q) {
          var a = mp[addDays(q.start, -1)], b = mp[q.end];
          M.btc[q.key] = (fin(a) && fin(b)) ? b / a - 1 : null;
        });
        M.btcSrc = 'Binance closes (static, to ' + MARKET_REGIME_ASOF + ')';
      } catch (e) { }
    }

    // scenarios
    var sc = [], last = ser.length ? ser[ser.length - 1] : null;
    if (last) {
      var lcq = null; quarters.forEach(function (q) { if (!q.partial) lcq = q; });
      if (lcq && M.tq[lcq.key]) sc.push({ key: 'q', name: 'Last complete quarter', sub: lcq.label, annual: M.tq[lcq.key].inflow * 365 / M.tq[lcq.key].days, days: M.tq[lcq.key].days });
      // last complete calendar month relative to the newest treasury day
      var y2 = +last.d.slice(0, 4), m2 = +last.d.slice(5, 7);
      if (last.d < monthEnd(y2, m2)) { m2--; if (m2 < 1) { m2 = 12; y2--; } }
      var tm = inflow(ser, y2 + '-' + pad(m2) + '-01', monthEnd(y2, m2));
      if (tm) sc.push({ key: 'm', name: 'Last complete month', sub: MON[m2 - 1] + ' ' + y2, annual: tm.inflow * 365 / tm.days, days: tm.days });
      var t14 = inflow(ser, addDays(last.d, -13), last.d);
      if (t14) sc.push({ key: 'd', name: 'Last 14 days', sub: dshort(t14.from) + ' – ' + dshort(t14.to), annual: t14.inflow * 365 / t14.days, days: t14.days, inflow: t14.inflow });
    }
    M.scen = sc; M.last = last;
    return M;
  }

  /* ---------- live product mix ---------- */
  var MAJ = { BTC: 1, ETH: 1, SOL: 1, HYPE: 1 };
  var TRAD_T = { XAU: 1, XAUT: 1, PAXG: 1, XAG: 1, XPT: 1, XPD: 1, CL: 1, BZ: 1, NATGAS: 1, COPPER: 1, ANTHROPIC: 1, OPENAI: 1 };
  var EQ_RE = /\b(Inc\.?|Incorporated|Corporation|Corp\.?|Company|Co\.|Limited|Ltd\.?|Holdings?|N\.V\.|S\.p\.A\.|A\/S|Oyj|plc|ETF|Class [A-C]|Common Stock|Depositary|Trust, Series|Group)\b/i;
  function classify(l) {
    if (/^Swap on /i.test(l.n) || l.f === 0) return 'swap';
    if (MAJ[l.t]) return 'major';
    if (TRAD_T[l.t] || EQ_RE.test(l.n)) return 'trad';
    return 'alt';
  }
  function mix(stats) {
    if (!stats) return null;
    var B = { swap: { v: 0, o: 0, n: 0 }, trad: { v: 0, o: 0, n: 0 }, major: { v: 0, o: 0, n: 0 }, alt: { v: 0, o: 0, n: 0 } }, tv = 0, to = 0, swaps = [];
    stats.listings.forEach(function (l) {
      var c = classify(l), b = B[c]; b.v += l.v; b.o += l.o; b.n++; tv += l.v; to += l.o;
      if (c === 'swap') swaps.push(l);
    });
    swaps.sort(function (a, b) { return b.v - a.v; });
    return { B: B, tv: tv, to: to, swaps: swaps, officialOi: stats.open_interest, officialVol: stats.total_volume_24h };
  }

  /* ================= SVG building blocks ================= */
  var UID = 0;
  function svgOpen(w, h, label) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(label) + '">'; }

  // categorical bars. items: {label, sub, val, txt, d, partial, focus, tip}
  function bars(o) {
    var w = Math.max(150, Math.round(o.w)), h = o.h || 150, pt = 34, pb = 30, n = o.items.length;
    var max = 0; o.items.forEach(function (i) { if (fin(i.val) && i.val > max) max = i.val; }); if (!max) max = 1;
    var step = (w - 8) / n, bw = Math.min(46, step * 0.6), ph = h - pt - pb;
    var s = svgOpen(w, h, o.title || ''), narrow = step < 40;
    s += '<line class="grid" x1="0" x2="' + w + '" y1="' + (h - pb) + '" y2="' + (h - pb) + '"/>';
    o.items.forEach(function (it, i) {
      var cx = 4 + step * i + step / 2, x = cx - bw / 2, has = fin(it.val), bh = has ? Math.max(1.5, ph * it.val / max) : 0, y = h - pb - bh;
      var cls = 'qb-bar ' + (it.focus ? 'focus' : '') + (it.partial ? ' part' : '');
      if (has) {
        s += '<rect class="' + cls + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2"><title>' + esc(it.tip || it.txt) + '</title></rect>';
        if (it.inner != null && it.inner > 0) {
          var ih = Math.max(1.5, ph * it.inner / max);
          s += '<rect class="qb-inner" x="' + x.toFixed(1) + '" y="' + (h - pb - ih).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + ih.toFixed(1) + '" rx="2"><title>' + esc(it.innerTip || '') + '</title></rect>';
        }
        s += '<text class="value' + (narrow ? ' sm' : '') + '" x="' + cx.toFixed(1) + '" y="' + (y - (it.d != null ? 13 : 4)).toFixed(1) + '" text-anchor="middle">' + esc(narrow ? it.txt.replace('$', '') : it.txt) + '</text>';
        if (it.d != null) s += '<text class="qb-d ' + dcls(it.d) + '" x="' + cx.toFixed(1) + '" y="' + (y - 3).toFixed(1) + '" text-anchor="middle">' + sgn(it.d) + '</text>';
      } else {
        s += '<text class="axis" x="' + cx.toFixed(1) + '" y="' + (h - pb - 6) + '" text-anchor="middle">n/a</text>';
      }
      s += '<text class="axis' + (it.focus ? ' fx' : '') + '" x="' + cx.toFixed(1) + '" y="' + (h - pb + 13) + '" text-anchor="middle">' + esc(it.label) + '</text>';
      if (it.sub) s += '<text class="axis dim" x="' + cx.toFixed(1) + '" y="' + (h - pb + 24) + '" text-anchor="middle">' + esc(it.sub) + '</text>';
    });
    return s + '</svg>';
  }

  // line chart on an index axis. series: {vals, cls, name, hollow:{i:true}, labels:'all'|'last'|'none', fmt}
  function lines(o) {
    var w = Math.max(200, Math.round(o.w)), h = o.h || 170, pl = 34, pr = o.pr || 40, pt = 16, pb = 22, n = o.n;
    var max = 0; o.series.forEach(function (s) { s.vals.forEach(function (v) { if (fin(v) && v > max) max = v; }); });
    var ns = niceScale(max * 1.12 || 1, 4), max = ns.max, ticks = ns.n, inset = o.inset || 0;
    var X = function (i) { return pl + inset + (n > 1 ? (w - pl - pr - inset * 2) * i / (n - 1) : (w - pl - pr) / 2); };
    var Y = function (v) { return pt + (h - pt - pb) * (1 - v / max); };
    var s = svgOpen(w, h, o.title || '');
    for (var t = 0; t <= ticks; t++) {
      var tv = ns.step * t, y = Y(tv);
      s += '<line class="grid" x1="' + pl + '" x2="' + (w - pr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="axis" x="' + (pl - 5) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end">' + esc(o.yfmt(tv)) + '</text>';
    }
    (o.vlines || []).forEach(function (vl) {
      var x = X(vl.i) - (vl.off || 0);
      s += '<line class="qb-vl" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + pt + '" y2="' + (h - pb) + '"/><text class="axis dim" x="' + (x + 3).toFixed(1) + '" y="' + (pt + 8) + '">' + esc(vl.label) + '</text>';
    });
    for (var i = 0; i < n; i++) {
      var lab = o.xt ? o.xt(i) : '';
      if (lab) s += '<text class="axis" x="' + X(i).toFixed(1) + '" y="' + (h - 6) + '" text-anchor="' + (o.xanchor || 'middle') + '">' + esc(lab) + '</text>';
    }
    o.series.forEach(function (se) {
      var d = '', started = false;
      se.vals.forEach(function (v, i) { if (!fin(v)) { started = false; return; } d += (started ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); started = true; });
      s += '<path class="' + se.cls + '" d="' + d + '"/>';
      var lastI = -1; se.vals.forEach(function (v, i) { if (fin(v)) lastI = i; });
      se.vals.forEach(function (v, i) {
        if (!fin(v)) return;
        var showDot = o.dots !== false || i === lastI, hollow = se.hollow && se.hollow[i];
        if (showDot) s += '<circle class="qb-dot ' + se.cls.replace('series-', 'dot-') + (hollow ? ' hol' : '') + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="' + (o.dots === false ? 3.2 : 3.6) + '"/>';
        s += '<circle class="qb-hit" cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="7"><title>' + esc(o.tip ? o.tip(i, se, v) : se.name + ' ' + se.fmt(v)) + '</title></circle>';
        var mode = se.labels || 'last';
        if (mode === 'all' || (mode === 'last' && i === lastI)) {
          var above = se.pos === 'below' ? false : true;
          s += '<text class="value" x="' + (X(i) + (mode === 'last' ? 6 : 0)).toFixed(1) + '" y="' + (mode === 'last' ? Y(v) + 3 : Y(v) + (above ? -8 : 15)).toFixed(1) + '" text-anchor="' + (mode === 'last' ? 'start' : 'middle') + '">' + esc(se.fmt(v)) + '</text>';
        }
      });
    });
    return s + '</svg>';
  }

  function niceScale(max, want) {
    var raw = max / want, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / mag;
    var step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag, n = Math.ceil(max / step - 1e-9);
    return { step: step, n: n, max: step * n };
  }
  function panelCols(w, min, n) {
    var gap = 14, c = Math.max(1, Math.min(n, Math.floor((w + gap) / (min + gap))));
    return { c: c, w: (w - gap * (c - 1)) / c };
  }
  function panel(title, inner, note, st) { return '<div class="qb-panel"' + (st ? ' style="' + st + '"' : '') + '><div class="qb-ptitle">' + title + '</div>' + inner + (note ? '<div class="qb-pnote">' + note + '</div>' : '') + '</div>'; }
  function legend(items) { return '<div class="bw-viz-legend qb-leg">' + items.map(function (i) { return '<span><i class="' + i.cls + '"></i>' + esc(i.t) + '</span>'; }).join('') + '</div>'; }
  function badge(t, cls) { return '<em class="qb-b ' + (cls || '') + '">' + esc(t) + '</em>'; }

  /* ================= exhibit renderers ================= */
  function qsFocus(M) {
    var qs = M.quarters, idx = -1;
    qs.forEach(function (q, i) { if (q.key === S.focus) idx = i; });
    if (idx < 1) { idx = -1; qs.forEach(function (q, i) { if (!q.partial && i >= 1) idx = i; }); if (idx < 0) idx = Math.min(1, qs.length - 1); }
    S.focus = qs[idx].key;
    return { i: idx, q: qs[idx], p: qs[idx - 1] || null };
  }
  function qLabel(q) { return q.partial ? q.short + ' QTD' : q.short; }
  function qSub(q) { return q.partial ? 'to ' + dshort(q.end) : ''; }

  var EX = {};

  EX.take = function (M, F) {
    var q = F.q.key, p = F.p ? F.p.key : null, V = M.qv[q][ME], Vp = p ? M.qv[p][ME] : {}, H = M.qv[q][HL], N = M.set[q].n, L = [];
    if (fin(V.rank)) {
      var mv = fin(Vp.rank) ? (Vp.rank > V.rank ? 'up from ' + ordinal(Vp.rank) + ' in ' + F.p.short : Vp.rank < V.rank ? 'down from ' + ordinal(Vp.rank) + ' in ' + F.p.short : 'same rank as in ' + F.p.short) : '';
      L.push('By trading volume Variational ranked <b>' + ordinal(V.rank) + ' of ' + N + '</b> on-chain perp venues in ' + F.q.label + (F.q.partial ? ' to date' : '') + ' (' + (mv ? mv + ', ' : '') + '<b>' + money(V.adv) + '</b> a day).');
    }
    if (fin(V.volShare) && fin(Vp.volShare)) L.push('Its slice of venue-set volume went from ' + pct(Vp.volShare) + ' to <b>' + pct(V.volShare) + '</b> (' + pp(V.volShare - Vp.volShare) + '); its share of open interest went from ' + pct(Vp.oiShare) + ' to <b>' + pct(V.oiShare) + '</b> (' + pp(V.oiShare - Vp.oiShare) + ').');
    if (fin(V.turn) && fin(H.turn)) L.push('Every dollar of open interest turned over <b>' + V.turn.toFixed(2) + '×</b> a day, against <b>' + H.turn.toFixed(2) + '×</b> at Hyperliquid — ' + (V.turn > H.turn ? 'positions here churn ' + (V.turn / H.turn).toFixed(1) + '× faster' : 'Hyperliquid churns ' + (H.turn / V.turn).toFixed(1) + '× faster') + '.');
    var T = M.tq[q], Tp = p ? M.tq[p] : null;
    if (T) {
      var g = Tp ? delta(T.spreadPerDay, Tp.spreadPerDay) : null;
      L.push('Traders paid roughly <b>' + money(T.spread) + '</b> in spreads' + (fin(g) ? ' (<b>' + sgn(g) + '</b> per day vs ' + F.p.label + ')' : '') + ', of which <b>' + money(T.inflow) + '</b> reached the treasury (' + pct(SPREAD_SHARE, 0) + ' of spreads).');
    }
    if (M.last) {
      var d14 = M.scen.filter(function (s) { return s.key === 'd'; })[0];
      L.push('The treasury holds <b>' + money(M.last.v) + '</b> as of ' + dshort(M.last.d) + (d14 ? '; the last 14 days added ' + money(d14.inflow) + ', a pace of <b>' + money(d14.annual) + '</b> a year.' : '.'));
    }
    return '<ol class="qb-take">' + L.map(function (t, i) { return '<li><span>' + (i + 1) + '</span><p>' + t + '</p></li>'; }).join('') + '</ol>';
  };

  EX.e1 = function (M, F, w) {
    var qs = M.quarters, pc = panelCols(w, 128, 2);
    function mk(sel, fmt, title) {
      var items = qs.map(function (q, i) {
        var v = sel(q), pv = i ? sel(qs[i - 1]) : null;
        return { label: qLabel(q), sub: qSub(q), val: v, txt: fmt(v), d: delta(v, pv), partial: q.partial, focus: q.key === F.q.key, tip: q.label + ': ' + fmt(v) };
      });
      return panel(title, bars({ w: pc.w, h: 132, items: items, title: title }));
    }
    var html = '<div class="qb-cols" style="grid-template-columns:repeat(' + pc.c + ',minmax(0,1fr))">' +
      mk(function (q) { return M.set[q.key].adv; }, money, 'Venue-set volume, per day') +
      mk(function (q) { return M.set[q.key].oi; }, money, 'Venue-set average open interest') + '</div>';
    var btc = qs.map(function (q) { var b = M.btc[q.key]; return '<span class="qb-pill ' + dcls(b) + '">' + esc(qLabel(q)) + ' <b>' + (fin(b) ? sgn(b, 1) : 'n/a') + '</b></span>'; }).join('');
    html += '<div class="qb-btc"><span>BTC over the quarter</span>' + btc + '</div>';
    var A = M.set[F.q.key], P = F.p ? M.set[F.p.key] : null;
    var da = P ? delta(A.adv, P.adv) : null, dO = P ? delta(A.oi, P.oi) : null, db = M.btc[F.q.key];
    var read = fin(da) ? F.q.short + (F.q.partial ? ' so far' : '') + ': venue-set volume <b>' + sgn(da) + '</b>, OI <b>' + sgn(dO) + '</b>, BTC <b>' + (fin(db) ? sgn(db, 1) : 'n/a') + '</b>' + (fin(db) && Math.abs(da) > Math.abs(db) ? ' — activity moved more than price.' : '.') : '';
    return { body: html, read: read, badges: [badge('DeFiLlama · to ' + dshort(M.END)), badge(M.btcSrc ? M.btcSrc.split(' (')[0] : 'BTC n/a')],
      cav: 'Per-day averages, so the partial quarter compares fairly. Venue set = the ' + M.venues.length + ' venues in Exhibit 3.' };
  };

  EX.e2 = function (M, F, w) {
    var qs = M.quarters, pc = panelCols(w, 128, 3);
    function mk(key, fmt, title) {
      var items = qs.map(function (q, i) {
        var v = M.qv[q.key][ME][key], pv = i ? M.qv[qs[i - 1].key][ME][key] : null;
        return { label: qLabel(q), sub: qSub(q), val: v, txt: fmt(v), d: delta(v, pv), partial: q.partial, focus: q.key === F.q.key, tip: q.label + ': ' + fmt(v) };
      });
      return panel(title, bars({ w: pc.w, h: 132, items: items, title: title }));
    }
    var turn = lines({
      w: pc.c === 2 ? w : pc.w, h: 132, n: qs.length, title: 'Turnover', yfmt: function (v) { return v.toFixed(1) + '×'; },
      xt: function (i) { return qLabel(qs[i]); }, pr: 18, pl: 28, inset: 14,
      series: [
        { name: 'Variational', cls: 'series-a', vals: qs.map(function (q) { return M.qv[q.key][ME].turn; }), labels: 'all', fmt: function (v) { return v.toFixed(2); } },
        { name: 'Hyperliquid', cls: 'series-b', vals: qs.map(function (q) { return M.qv[q.key][HL] ? M.qv[q.key][HL].turn : null; }), labels: 'all', pos: 'below', fmt: function (v) { return v.toFixed(2); } }
      ], tip: function (i, s, v) { return qs[i].label + ' · ' + s.name + ': ' + v.toFixed(2) + '× OI per day'; }
    });
    var html = '<div class="qb-cols" style="grid-template-columns:repeat(' + pc.c + ',minmax(0,1fr))">' +
      mk('adv', money, 'Volume, per day') + mk('oi', money, 'Average open interest') +
      panel('Turnover (volume ÷ OI, per day)', legend([{ cls: 'a', t: 'Variational' }, { cls: 'b', t: 'Hyperliquid' }]) + turn, '', pc.c === 2 ? 'grid-column:1/-1' : '') + '</div>';
    var so = M.mix && M.mix.officialOi, lo = M.mix && M.mix.to;
    var cav = 'OI is DeFiLlama\'s' + (fin(lo) ? ' (' + money(lo) + ' live)' : '') + '. Variational\'s own dual-sided OI is' + (fin(so) ? ' ' + money(so) + ' (' + (so / lo).toFixed(2) + '× the per-market long+short sum)' : ' higher') + ': a known, unreconciled gap. Peers use the same DeFiLlama basis, so shares and turnover stay comparable.';
    return { body: html, badges: [badge('DeFiLlama · to ' + dshort(M.END))], cav: cav };
  };

  EX.e3 = function (M, F) {
    var q = F.q.key, p = F.p ? F.p.key : null, rows = M.venues.filter(function (v) { return fin(M.qv[q][v.slug].adv); })
      .sort(function (a, b) { return M.qv[q][b.slug].adv - M.qv[q][a.slug].adv; });
    var maxS = 0; rows.forEach(function (v) { maxS = Math.max(maxS, M.qv[q][v.slug].volShare || 0); });
    var h = '<div class="qb-tw"><table class="qb-tbl"><thead><tr><th>#</th><th class="l">Venue</th><th>Volume / day</th><th>Vol share</th><th>Avg OI</th><th>OI share</th><th>Turnover</th><th>Δ rank</th></tr></thead><tbody>';
    rows.forEach(function (v) {
      var r = M.qv[q][v.slug], pr = p ? M.qv[p][v.slug] : null, mv;
      if (!pr || !fin(pr.rank)) mv = '<span class="qb-mv n">new</span>';
      else { var dr = pr.rank - r.rank; mv = dr > 0 ? '<span class="qb-mv up">▲' + dr + '</span>' : dr < 0 ? '<span class="qb-mv dn">▼' + (-dr) + '</span>' : '<span class="qb-mv">–</span>'; }
      h += '<tr' + (v.me ? ' class="me"' : '') + '><td>' + r.rank + '</td><td class="l">' + esc(v.name) + '</td><td>' + money(r.adv) + '</td><td><span class="qb-sb"><i style="width:' + ((r.volShare || 0) / (maxS || 1) * 100).toFixed(0) + '%"></i></span>' + pct(r.volShare) + '</td><td>' + money(r.oi) + '</td><td>' + pct(r.oiShare) + '</td><td>' + (fin(r.turn) ? r.turn.toFixed(2) + '×' : '—') + '</td><td>' + mv + '</td></tr>';
    });
    var S1 = M.set[q], V = M.qv[q][ME], ag = M.agg[q];
    h += '<tr class="tot"><td></td><td class="l">Venue set (' + S1.n + ')</td><td>' + money(S1.adv) + '</td><td>100%</td><td>' + money(S1.oi) + '</td><td>100%</td><td>' + (S1.oi ? (S1.adv / S1.oi).toFixed(2) + '×' : '—') + '</td><td></td></tr>';
    if (fin(ag)) h += '<tr class="tot"><td></td><td class="l">All on-chain</td><td>' + money(ag) + '</td><td>' + pct(V.adv / ag) + '</td><td colspan="4" class="l qb-mut">DeFiLlama all-derivatives total; share is volume only</td></tr>';
    h += '</tbody></table></div>';
    return { body: h, badges: [badge('DeFiLlama · ' + F.q.label + (F.q.partial ? ' to ' + dshort(M.END) : ''))],
      cav: 'Shares are within the ' + S1.n + ' listed venues; the all-derivatives row is DeFiLlama\'s broader aggregate. Δ rank compares daily volume with ' + (F.p ? F.p.label : 'the prior quarter') + '.' };
  };

  EX.e4 = function (M, F, w) {
    var wk = M.weeks, vl = [];
    M.quarters.forEach(function (q) {
      if (q.q === 1 && q.y === FIRST_Q.y) return;
      for (var i = 0; i < wk.length; i++) { if (wk[i].e >= q.start) { vl.push({ i: i, label: q.short }); break; } }
    });
    var svg = lines({
      w: w, h: 200, n: wk.length, pr: 44, title: 'Weekly share of venue set', yfmt: function (v) { return (v * 100).toFixed(0) + '%'; },
      xt: function (i) { return (wk.length - 1 - i) % 6 === 0 ? dshort(wk[i].e) : ''; }, xanchor: 'middle', dots: false,
      vlines: vl,
      series: [
        { name: 'Volume share', cls: 'series-a', vals: wk.map(function (x) { return x.volShare; }), labels: 'last', fmt: function (v) { return pct(v); } },
        { name: 'OI share', cls: 'series-b', vals: wk.map(function (x) { return x.oiShare; }), labels: 'last', fmt: function (v) { return pct(v); } }
      ],
      tip: function (i, s, v) { return 'Week ' + dshort(wk[i].s) + ' – ' + dshort(wk[i].e) + ' · ' + s.name + ': ' + pct(v); }
    });
    return { body: legend([{ cls: 'a', t: 'Share of volume' }, { cls: 'b', t: 'Share of open interest' }]) + svg, badges: [badge('DeFiLlama · ' + wk.length + ' weeks')],
      cav: 'Weeks end on ' + dshort(M.END) + '. Dashed lines mark quarter starts. Share = Variational ÷ the ' + M.venues.length + '-venue set.' };
  };

  EX.e5 = function (M, F, w) {
    var q = F.q.key, p = F.p ? F.p.key : null, pts = [];
    if (p) M.venues.forEach(function (v) {
      var a = M.qv[q][v.slug], b = M.qv[p][v.slug], gx = delta(a.adv, b.adv), gy = delta(a.oi, b.oi);
      if (fin(gx) && fin(gy)) pts.push({ v: v, x: gx, y: gy });
    });
    var h = Math.min(250, Math.max(210, w * 0.62)), pl = 38, pr = 14, pt = 12, pb = 28, LIM = 3;
    var lo = -0.8, hiX = 0.7, hiY = 0.7;
    pts.forEach(function (d) { hiX = Math.max(hiX, d.x); hiY = Math.max(hiY, d.y); lo = Math.min(lo, d.x, d.y); });
    hiX = Math.min(hiX * 1.1, LIM); hiY = Math.min(hiY * 1.1, LIM); lo = Math.max(lo * 1.05, -1);
    var X = function (v) { return pl + (w - pl - pr) * (Math.min(Math.max(v, lo), hiX) - lo) / (hiX - lo); };
    var Y = function (v) { return pt + (h - pt - pb) * (1 - (Math.min(Math.max(v, lo), hiY) - lo) / (hiY - lo)); };
    var s = svgOpen(w, h, 'Growth map');
    var tk = [-1, -0.5, 0, 0.5, 1, 2, 3];
    tk.forEach(function (t) {
      if (t >= lo && t <= hiX) s += '<line class="grid' + (t === 0 || t === 0.5 ? ' qb-guide' : '') + '" x1="' + X(t).toFixed(1) + '" x2="' + X(t).toFixed(1) + '" y1="' + pt + '" y2="' + (h - pb) + '"/><text class="axis" x="' + X(t).toFixed(1) + '" y="' + (h - pb + 12) + '" text-anchor="middle">' + (t * 100) + '%</text>';
      if (t >= lo && t <= hiY) s += '<line class="grid' + (t === 0 || t === 0.5 ? ' qb-guide' : '') + '" y1="' + Y(t).toFixed(1) + '" y2="' + Y(t).toFixed(1) + '" x1="' + pl + '" x2="' + (w - pr) + '"/><text class="axis" x="' + (pl - 4) + '" y="' + (Y(t) + 3).toFixed(1) + '" text-anchor="end">' + (t * 100) + '%</text>';
    });
    s += '<text class="axis dim" x="' + (w - pr) + '" y="' + (h - 3) + '" text-anchor="end">volume per day, QoQ →</text>';
    s += '<text class="axis dim" transform="translate(9 ' + (pt + 4) + ') rotate(-90)" text-anchor="end">avg OI, QoQ →</text>';
    var placed = [];
    pts.sort(function (a, b) { return (a.v.me ? 1 : 0) - (b.v.me ? 1 : 0); });
    pts.forEach(function (d) {
      var cx = X(d.x), cy = Y(d.y), clamped = d.x > hiX || d.y > hiY || d.x < lo || d.y < lo;
      s += '<circle class="qb-pt ' + (d.v.me ? 'me' : '') + '" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (d.v.me ? 6 : 4.2) + '"><title>' + esc(d.v.name + ': volume ' + sgn(d.x) + ', OI ' + sgn(d.y) + ' QoQ' + (clamped ? ' (off-scale, pinned to edge)' : '')) + '</title></circle>';
      var tw = d.v.name.length * 5.4 + 4, cands = [[8, 3], [8, -8], [8, 12], [-8 - tw, 3], [-tw / 2, -9], [-tw / 2, 17]], pick = cands[0];
      for (var i = 0; i < cands.length; i++) {
        var bx = cx + cands[i][0], by = cy + cands[i][1], ok = bx > 0 && bx + tw < w + 6;
        for (var j = 0; ok && j < placed.length; j++) { var o = placed[j]; if (bx < o.x + o.w && bx + tw > o.x && Math.abs(by - o.y) < 10) ok = false; }
        if (ok) { pick = cands[i]; break; }
      }
      placed.push({ x: cx + pick[0], y: cy + pick[1], w: tw });
      s += '<text class="qb-pl' + (d.v.me ? ' me' : '') + '" x="' + (cx + pick[0]).toFixed(1) + '" y="' + (cy + pick[1]).toFixed(1) + '">' + esc(d.v.name) + (clamped ? ' ↗' : '') + '</text>';
    });
    s += '</svg>';
    return { body: p ? s : '<div class="qb-empty">No prior quarter to compare against.</div>', badges: [badge('DeFiLlama · ' + F.q.short + ' vs ' + (F.p ? F.p.short : '—'))],
      cav: 'Guides sit at 0% and +50%. Venues with no prior-quarter base are left off; off-scale venues are pinned to the edge (↗).' };
  };

  EX.e6 = function (M, F, w) {
    var X = M.mix;
    if (!X) return { body: '<div class="qb-empty">Variational\'s live market snapshot could not be loaded.</div>', badges: [badge('Variational stats · unavailable', 'warn')] };
    var order = [['swap', 'Swaps', 'c1'], ['trad', 'Traditional perps', 'c2'], ['major', 'Crypto majors', 'c3'], ['alt', 'Other crypto', 'c4']];
    function stack(key, tot, title) {
      var seg = order.map(function (o) { var v = X.B[o[0]][key]; var f = tot ? v / tot : 0; return '<i class="' + o[2] + '" style="flex:' + Math.max(f, 0.0001) + '" title="' + esc(o[1] + ': ' + pct(f) + ' · ' + money(v)) + '">' + (f >= 0.07 ? Math.round(f * 100) + '%' : '') + '</i>'; }).join('');
      return '<div class="qb-stack"><span>' + title + '</span><div>' + seg + '</div></div>';
    }
    var leg = '<div class="bw-viz-legend qb-leg">' + order.map(function (o) { return '<span><i class="sw ' + o[2] + '"></i>' + o[1] + ' <b>' + X.B[o[0]].n + '</b></span>'; }).join('') + '</div>';
    var top = X.swaps.slice(0, 8), mx = top.length ? top[0].v : 1;
    var list = top.map(function (l) {
      return '<div class="qb-sw"><b>' + esc(l.t) + '</b><span>' + esc(l.n.replace(/^Swap on /i, '')) + '</span><i><u style="width:' + (l.v / mx * 100).toFixed(0) + '%"></u></i><em>' + money(l.v) + '</em></div>';
    }).join('');
    var sw = X.B.swap, html = leg + stack('v', X.tv, 'Volume, 24h · ' + money(X.tv)) + stack('o', X.to, 'Open interest · ' + money(X.to)) +
      '<div class="qb-ptitle" style="margin-top:12px">Top swaps by 24h volume</div><div class="qb-swgrid">' + list + '</div>';
    var read = 'Swaps are <b>' + pct(sw.v / X.tv, 0) + '</b> of 24h volume but only <b>' + pct(sw.o / X.to, 0) + '</b> of open interest — fast-turning index and commodity flow rather than long-held positions.';
    return { body: html, read: read, badges: [badge('Variational stats · live snapshot'), badge('no history', 'warn')],
      cav: 'Live snapshot only; Variational publishes no history for this split. Classification uses name and ticker rules, so small markets may land in the wrong bucket. OI = long + short per market.' };
  };

  EX.e7 = function (M, F, w) {
    var qs = M.quarters, wide = w >= 520, pw = wide ? (w - 14) * 0.5 : w, T = M.tq;
    var items = qs.map(function (q, i) {
      var t = T[q.key], pt = i ? T[qs[i - 1].key] : null;
      return t ? { label: qLabel(q), sub: qSub(q) || (t.days < q.days ? 'from ' + dshort(t.from) : ''), val: t.spread, inner: t.inflow, txt: money(t.spread), d: pt ? delta(t.spreadPerDay, pt.spreadPerDay) : null, partial: q.partial, focus: q.key === F.q.key,
        tip: q.label + ': spread ≈ ' + money(t.spread) + ', treasury inflow ' + money(t.inflow) + ' over ' + t.days + ' days' } : { label: qLabel(q), val: null };
    });
    var left = panel('Spread paid · treasury share inside', legend([{ cls: 'a', t: 'implied spread' }, { cls: 'in', t: 'treasury inflow' }]) + bars({ w: pw, h: 142, items: items, title: 'Spread paid by quarter' }), 'Percent labels compare per-day averages with the prior quarter.');
    var mo = M.months, hol = {};
    mo.forEach(function (m, i) { if (m.partial) hol[i] = true; });
    var right = panel('Spread rate on Variational volume (bps)', lines({
      w: pw, h: 142, n: mo.length, title: 'Monthly spread rate', yfmt: function (v) { return v.toFixed(1); }, pr: 18, pl: 28,
      xt: function (i) { return mo[i].label; }, inset: 8,
      series: [{ name: 'bps', cls: 'series-a', vals: mo.map(function (m) { return m.bps; }), hollow: hol, labels: 'all', fmt: function (v) { return v.toFixed(1); } }],
      tip: function (i, s, v) { var m = mo[i]; return m.label + (m.partial ? ' (' + dshort(m.from) + ' – ' + dshort(m.to) + ')' : '') + ': ' + v.toFixed(2) + ' bps on ' + money(m.vol); }
    }), 'Hollow dots are part-months. Implied spread ÷ DeFiLlama volume.');
    var cols = '<div class="qb-cols" style="grid-template-columns:' + (wide ? '1fr 1fr' : '1fr') + '">' + left + right + '</div>';
    // cross-check
    var xr = '<div class="qb-tw"><table class="qb-tbl qb-x"><thead><tr><th class="l">Cross-check</th>' + qs.map(function (q) { return '<th>' + esc(qLabel(q)) + '</th>'; }).join('') + '</tr></thead><tbody>';
    xr += '<tr><td class="l">On-chain implied spread (inflow ÷ ' + pct(SPREAD_SHARE, 0) + ')</td>' + qs.map(function (q) { var t = T[q.key]; return '<td>' + (t ? money(t.spread) : '—') + '</td>'; }).join('') + '</tr>';
    xr += '<tr><td class="l">Official reports: spreads, pro-rated</td>' + qs.map(function (q) {
      var o = M.official[q.key]; if (!o || !o.cov) return '<td>—</td>';
      var full = o.cov >= q.days - 1;
      return '<td>' + money(o.spreads) + (full ? '' : '<small>' + o.cov + ' of ' + q.days + ' d</small>') + '</td>';
    }).join('') + '</tr>';
    xr += '<tr><td class="l">Official treasury ÷ official spreads</td>' + qs.map(function (q) { var o = M.official[q.key]; return '<td>' + (o && o.spreads ? pct(o.treasury / o.spreads, 0) : '—') + '</td>'; }).join('') + '</tr>';
    xr += '</tbody></table></div>';
    return { body: cols + xr, badges: [badge('Treasury wallet · to ' + (M.last ? M.last.d : '—')), badge('Official reports · to ' + lastOfficial()), badge('DeFiLlama volume')],
      cav: 'Implied spread assumes a flat ' + pct(SPREAD_SHARE, 0) + ' treasury share. Official reports show a lower share (10–17%) until mid-April 2026, so earlier quarters read low versus the official row. Q1 starts when the treasury wallet began filling (' + (M.ser[0] ? dshort(M.ser[0].d) : '—') + ').' };
  };
  function lastOfficial() { try { return BIWEEKLY_HISTORY[BIWEEKLY_HISTORY.length - 1].asOf; } catch (e) { return '—'; } }

  EX.e8 = function (M, F, w) {
    var qs = M.quarters;
    var items = qs.map(function (q, i) {
      var t = M.tq[q.key], oi = M.qv[q.key][ME].oi, y = t && fin(oi) && oi > 0 ? (t.inflow * 365 / t.days) / oi : null;
      var pt = i ? M.tq[qs[i - 1].key] : null, po = i ? M.qv[qs[i - 1].key][ME].oi : null, py = pt && fin(po) && po > 0 ? (pt.inflow * 365 / pt.days) / po : null;
      return { label: qLabel(q), sub: qSub(q), val: y, txt: y == null ? '—' : pct(y), partial: q.partial, focus: q.key === F.q.key, d: null, tip: q.label + ': ' + (y == null ? 'n/a' : pct(y, 2) + ' a year') };
    });
    var cur = items[F.i], prv = F.i ? items[F.i - 1] : null;
    var read = fin(cur.val) ? 'Each dollar of open interest earned the treasury about <b>' + (cur.val * 100).toFixed(1) + ' cents</b> a year in ' + F.q.label + (prv && fin(prv.val) ? ', versus ' + (prv.val * 100).toFixed(1) + ' in ' + F.p.label : '') + '.' : '';
    return { body: bars({ w: w, h: 150, items: items, title: 'Treasury yield on OI' }), read: read, badges: [badge('Treasury wallet'), badge('DeFiLlama OI')],
      cav: 'Annualised treasury inflow ÷ Variational\'s average OI in the same quarter (DeFiLlama basis). Using the official dual-sided OI would roughly halve each bar.' };
  };

  EX.e9 = function (M, F, w) {
    var sc = M.scen; if (!sc.length) return { body: '<div class="qb-empty">Treasury history is not available.</div>', badges: [badge('Treasury wallet', 'warn')] };
    var chips = [1e9, 2e9, 5e9].map(function (v) { return '<button type="button" class="qb-chip' + (S.fdv === v ? ' on' : '') + '" data-fdv="' + v + '" aria-pressed="' + (S.fdv === v) + '">$' + (v / 1e9) + 'B</button>'; }).join('');
    var custom = [1e9, 2e9, 5e9].indexOf(S.fdv) < 0;
    var ctl = '<div class="qb-fdv"><span>$VAR FDV</span>' + chips + '<label class="qb-in' + (custom ? ' on' : '') + '">$<input type="number" id="qbFdv" min="0.05" step="0.1" value="' + (S.fdv / 1e9) + '" aria-label="FDV in billions of dollars">B</label></div>';
    var cards = sc.map(function (s) {
      var by = s.annual / S.fdv;
      return '<div class="qb-sc"><div class="k">' + esc(s.name) + '<small>' + esc(s.sub) + ' · ' + s.days + ' days</small></div><div class="v">' + money(s.annual) + '<small>/ year</small></div>' +
        '<div class="b"><b>' + pct(by, 2) + '</b> of $VAR supply per year</div><div class="m">at $1B / $2B / $5B: ' + pct(s.annual / 1e9, 1) + ' / ' + pct(s.annual / 2e9, 1) + ' / ' + pct(s.annual / 5e9, 1) + '</div></div>';
    }).join('');
    return { body: ctl + '<div class="qb-scgrid">' + cards + '</div>', badges: [badge('Treasury wallet · to ' + (M.last ? M.last.d : '—')), badge('Official: 100% to buy & burn')],
      cav: 'Annualised = inflow ÷ days × 365 at each observed pace; buyback % = annual revenue ÷ FDV. Revenue is volatile, past pace is not a forecast, and the burn policy is an announced intent, not a guarantee.' };
  };

  /* ================= shell + render ================= */
  var CARDS = [
    { id: 1, cls: 's5', k: 'Backdrop', t: 'Market backdrop by quarter', s: 'Did the whole on-chain perp pie grow, and did price explain it?', fn: 'e1' },
    { id: 2, cls: 's7', k: 'Variational', t: 'Variational volume, OI and turnover', s: 'Scale each quarter and how hard open interest is worked.', fn: 'e2' },
    { id: 3, cls: 's7', k: 'League table', t: 'Venue league table', s: 'Where Variational sits against the other large on-chain venues.', fn: 'e3' },
    { id: 5, cls: 's5', k: 'Growth map', t: 'Who is growing, volume vs OI', s: 'Quarter-on-quarter growth for every venue in the set.', fn: 'e5' },
    { id: 4, cls: 's5', k: 'Weekly share', t: 'Variational share, week by week', s: 'Is the share gain steady, or a one-off spike?', fn: 'e4' },
    { id: 6, cls: 's7', k: 'Product mix (live)', t: 'What trades on Variational today', s: 'Swaps against traditional perps and crypto.', fn: 'e6' },
    { id: 7, cls: 's12', k: 'Spread & treasury', t: 'Spread paid and treasury inflow', s: 'What traders pay, what the treasury keeps, and the rate per dollar traded.', fn: 'e7' },
    { id: 8, cls: 's5', k: 'Treasury yield', t: 'Treasury yield on open interest', s: 'Annualised treasury inflow per dollar of OI.', fn: 'e8' },
    { id: 9, cls: 's7', k: 'Buyback scenarios', t: 'What the treasury pace could buy back', s: 'Annualised treasury revenue at three observed paces, set against an FDV you choose.', fn: 'e9' }
  ];

  var ROOT, GRID, TAKE, CHIPS, STATUS, RES = {};
  var CSS = '' +
    '.qb{margin:6px 0 30px;color:var(--text,var(--ink))}' +
    '.qb *{box-sizing:border-box}' +
    '.qb-bar-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin:0 0 10px}' +
    '.qb-bar-row>span{font:700 9px var(--mono);letter-spacing:1px;text-transform:uppercase;color:var(--muted,var(--sub))}' +
    '.qb-chips{display:flex;flex-wrap:wrap;gap:6px}' +
    '.qb-chip{cursor:pointer;min-height:30px;padding:5px 12px;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--muted,var(--sub));font:700 11px var(--mono)}' +
    '.qb-chip:hover{color:var(--text,var(--ink));border-color:var(--cyan)}' +
    '.qb-chip.on{color:var(--text,var(--ink));border-color:var(--cyan);background:color-mix(in srgb,var(--cyan) 16%,transparent)}' +
    '.qb-credit{margin-left:auto;font:11px var(--sans);color:var(--muted,var(--sub))}' +
    '.qb-credit a{color:var(--cyan);text-decoration:none;border-bottom:1px solid currentColor}' +
    '.qb-status{margin:0 0 10px;padding:8px 12px;border:1px solid var(--line);border-left:3px solid #ffc65a;font:12px/1.5 var(--sans);color:var(--muted,var(--sub));background:color-mix(in srgb,var(--panel) 88%,transparent)}' +
    '.qb-status button{margin-left:8px;cursor:pointer;border:1px solid var(--line);background:transparent;color:var(--text,var(--ink));font:700 10px var(--mono);padding:3px 9px;border-radius:999px}' +
    '.qb-take{list-style:none;margin:0 0 12px;padding:0;border:1px solid var(--line);background:color-mix(in srgb,var(--panel) 88%,transparent)}' +
    '.qb-take li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;align-items:start;padding:6px 14px;border-bottom:1px solid var(--line)}' +
    '.qb-take li:last-child{border-bottom:0}' +
    '.qb-take li span{width:20px;height:20px;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;font:800 10px var(--mono);color:var(--cyan);margin-top:1px}' +
    '.qb-take p{margin:0;font:13px/1.5 var(--sans);color:var(--text,var(--ink))}' +
    '.qb-take b{font-weight:800}' +
    '.qb-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}' +
    '.qb-grid>.bw-viz{padding:12px 14px;grid-column:span 6}' +
    '.qb-grid>.bw-viz.s7{grid-column:span 7}.qb-grid>.bw-viz.s5{grid-column:span 5}.qb-grid>.bw-viz.s12{grid-column:1/-1}' +
    '.qb-grid .bw-viz-sub{min-height:0;margin:3px 0 8px}' +
    '.qb-grid .bw-viz-kicker{flex-wrap:wrap}' +
    '.qb-badges{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}' +
    '.qb-b{font:700 8.5px var(--mono);letter-spacing:.3px;text-transform:none;font-style:normal;padding:2px 6px;border:1px solid var(--line);border-radius:999px;color:var(--muted,var(--sub));white-space:nowrap}' +
    '.qb-b.warn{color:#e0a53a;border-color:color-mix(in srgb,#e0a53a 50%,var(--line))}' +
    '.qb-cav{margin-top:8px;font:10.5px/1.5 var(--sans);color:var(--muted,var(--sub))}' +
    '.qb-cav:empty{display:none}' +
    '.qb-grid .bw-viz-read{margin:0 0 8px;padding:7px 10px;font:11.5px/1.5 var(--sans);color:var(--text,var(--ink))}' +
    '.qb-grid .bw-viz-read:empty{display:none}' +
    '.qb-cols{display:grid;gap:14px}' +
    '.qb-panel{min-width:0}' +
    '.qb-ptitle{font:700 10px var(--mono);letter-spacing:.4px;color:var(--muted,var(--sub));margin:0 0 4px}' +
    '.qb-pnote{font:10px/1.4 var(--sans);color:var(--muted,var(--sub));margin-top:2px}' +
    '.qb-leg{margin:0 0 2px!important}' +
    '.qb-leg .sw{width:10px!important;height:10px!important;border-radius:2px;margin-right:5px}' +
    '.qb .qb-leg i.in{background:var(--bwv-c)}.qb .qb-leg i.c1{background:var(--bwv-a)}.qb .qb-leg i.c2{background:var(--bwv-b)}.qb .qb-leg i.c3{background:var(--bwv-c)}.qb .qb-leg i.c4{background:var(--bwv-d)}' +
    '.qb svg{max-width:100%}' +
    '.qb-bar{fill:var(--bwv-a);opacity:.42}.qb-bar.focus{opacity:1}' +
    '.qb-bar.part{stroke:var(--bwv-a);stroke-dasharray:3 2;fill-opacity:.55}' +
    '.qb-inner{fill:var(--bwv-c);opacity:.95}' +
    '.qb .axis.fx{fill:var(--text,var(--ink));font-weight:800}.qb .axis.dim{opacity:.7}' +
    '.qb .value.sm{font-size:8px}.qb-d{font:700 8.5px var(--mono)}.qb-d.up{fill:var(--bwv-c)}.qb-d.dn{fill:var(--bwv-d)}' +
    '.qb-vl{stroke:var(--muted,var(--sub));stroke-dasharray:3 3;opacity:.55}' +
    '.qb .qb-dot{stroke:none}.qb .qb-dot.hol{fill:var(--panel,#000);stroke:var(--bwv-a);stroke-width:2}' +
    '.qb .series-a,.qb .series-b{stroke-linejoin:round}' +
    '.qb-hit{fill:transparent;stroke:none}' +
    '.qb-guide{stroke:var(--muted,var(--sub));stroke-dasharray:4 3;opacity:.7}' +
    '.qb-pt{fill:var(--muted,var(--sub));fill-opacity:.55;stroke:var(--muted,var(--sub))}' +
    '.qb-pt.me{fill:var(--bwv-a);fill-opacity:1;stroke:var(--text,var(--ink));stroke-width:1.5}' +
    '.qb-pl{fill:var(--muted,var(--sub));font:9px var(--mono)}.qb-pl.me{fill:var(--text,var(--ink));font-weight:800;font-size:10px}' +
    '.qb-btc{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0 2px;font:10px var(--mono);color:var(--muted,var(--sub))}' +
    '.qb-pill{padding:2px 8px;border:1px solid var(--line);border-radius:999px;font:10px var(--mono);color:var(--muted,var(--sub))}.qb-pill b{font-weight:800}' +
    '.qb-pill.up b{color:var(--bwv-c)}.qb-pill.dn b{color:var(--bwv-d)}' +
    '.qb-tw{overflow-x:auto;-webkit-overflow-scrolling:touch}' +
    '.qb-tbl{width:100%;border-collapse:collapse;font:11.5px var(--mono);font-variant-numeric:tabular-nums}' +
    'body .qb table.qb-tbl th{font:700 9px var(--mono)!important;letter-spacing:.5px;text-transform:uppercase;color:var(--muted,var(--sub));text-align:right;padding:5px 7px!important;border-bottom:1px solid var(--line);white-space:nowrap;background:transparent!important}' +
    'body .qb table.qb-tbl td{font-family:var(--mono)!important;font-size:11.5px!important;line-height:1.3!important;text-align:right;padding:3px 7px!important;border-bottom:1px solid color-mix(in srgb,var(--line) 55%,transparent);white-space:nowrap}' +
    'body .qb table.qb-tbl th.l,body .qb table.qb-tbl td.l{text-align:left}' +
    'body .qb table.qb-tbl tr.me td{background:color-mix(in srgb,var(--bwv-a) 16%,transparent)!important;font-weight:800!important}' +
    '.qb-tbl tr.tot td{color:var(--muted,var(--sub));border-bottom:0}' +
    'body .qb table.qb-tbl small{display:block;font:9px var(--mono)!important;opacity:.75}' +
    'body .qb table.qb-tbl td.qb-mut{white-space:normal;font:10px var(--sans)!important}' +
    '.qb-sb{display:inline-block;width:36px;height:6px;margin-right:6px;background:color-mix(in srgb,var(--line) 70%,transparent);vertical-align:middle;border-radius:2px;overflow:hidden}.qb-sb i{display:block;height:100%;background:var(--bwv-a)}' +
    '.qb-mv{font-weight:800}.qb-mv.up{color:var(--bwv-c)}.qb-mv.dn{color:var(--bwv-d)}.qb-mv.n{color:var(--bwv-b);font-size:10px}' +
    'body .qb table.qb-x td.l{white-space:normal;min-width:180px}' +
    '.qb-stack{margin:6px 0}.qb-stack>span{display:block;font:700 10px var(--mono);color:var(--muted,var(--sub));margin-bottom:3px}' +
    '.qb-stack>div{display:flex;height:24px;border:1px solid var(--line);overflow:hidden;border-radius:3px}' +
    '.qb-stack i{display:grid;place-items:center;min-width:0;font:800 10px var(--mono);font-style:normal;color:#04121f}' +
    '.c1{background:var(--bwv-a)}.c2{background:var(--bwv-b)}.c3{background:var(--bwv-c)}.c4{background:var(--bwv-d)}' +
    'body.theme-light .qb-stack i{color:#fff}' +
    '.qb-swgrid{display:grid;grid-template-columns:1fr 1fr;gap:3px 16px}' +
    '.qb-sw{display:grid;grid-template-columns:52px minmax(0,1fr) 50px;grid-template-rows:auto auto;gap:0 6px;align-items:baseline;padding:1px 0}' +
    '.qb-sw b{font:800 11px var(--mono);grid-row:1}.qb-sw span{font:10px var(--sans);color:var(--muted,var(--sub));overflow:hidden;text-overflow:ellipsis;white-space:nowrap;grid-row:1}' +
    '.qb-sw em{font:700 10.5px var(--mono);font-style:normal;text-align:right;grid-row:1;grid-column:3}' +
    '.qb-sw i{grid-column:1/-1;grid-row:2;height:3px;background:color-mix(in srgb,var(--line) 60%,transparent);display:block}.qb-sw u{display:block;height:100%;background:var(--bwv-a);text-decoration:none}' +
    '.qb-fdv{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 10px}.qb-fdv>span{font:700 9px var(--mono);letter-spacing:1px;text-transform:uppercase;color:var(--muted,var(--sub))}' +
    '.qb-in{display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border:1px solid var(--line);border-radius:999px;font:700 11px var(--mono);color:var(--muted,var(--sub))}.qb-in.on{border-color:var(--cyan);color:var(--text,var(--ink))}' +
    '.qb-in input{width:44px;background:transparent;border:0;color:var(--text,var(--ink));font:700 11px var(--mono);outline:0;-moz-appearance:textfield}' +
    '.qb-scgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}' +
    '.qb-sc{padding:12px 14px;border:1px solid var(--line);background:color-mix(in srgb,var(--bwv-a) 5%,transparent)}' +
    '.qb-sc .k{font:700 10px var(--mono);letter-spacing:.5px;text-transform:uppercase;color:var(--muted,var(--sub))}.qb-sc .k small{display:block;margin-top:2px;font:10px var(--sans);text-transform:none;letter-spacing:0}' +
    '.qb-sc .v{font:800 26px/1.1 var(--mono);margin:8px 0 2px;letter-spacing:-1px;color:var(--text,var(--ink))}.qb-sc .v small{font:600 11px var(--mono);margin-left:6px;letter-spacing:0;color:var(--muted,var(--sub))}' +
    '.qb-sc .b{font:12px var(--sans)}.qb-sc .b b{font:800 15px var(--mono);color:var(--bwv-c)}.qb-sc .m{margin-top:4px;font:10px var(--mono);color:var(--muted,var(--sub))}' +
    '.qb-empty{padding:26px 8px;text-align:center;font:12px var(--sans);color:var(--muted,var(--sub))}' +
    '.qb-skel{height:150px;border-radius:4px;background:linear-gradient(90deg,color-mix(in srgb,var(--line) 45%,transparent) 0,color-mix(in srgb,var(--line) 90%,transparent) 50%,color-mix(in srgb,var(--line) 45%,transparent) 100%);background-size:200% 100%;animation:qbsk 1.4s linear infinite}' +
    '@keyframes qbsk{from{background-position:200% 0}to{background-position:-200% 0}}' +
    '@media(prefers-reduced-motion:reduce){.qb-skel{animation:none}}' +
    '@media(max-width:980px){.qb-grid>.bw-viz,.qb-grid>.bw-viz.s7,.qb-grid>.bw-viz.s5{grid-column:1/-1}}' +
    '@media(max-width:640px){.qb-credit{margin-left:0;flex-basis:100%}.qb-scgrid{grid-template-columns:1fr}.qb-sc{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:10px 12px}.qb-sc .k{grid-column:1;grid-row:1}.qb-sc .v{grid-column:2;grid-row:1;margin:0;font-size:21px;text-align:right}.qb-sc .b,.qb-sc .m{grid-column:1/-1}.qb-swgrid{grid-template-columns:1fr}.qb-grid>.bw-viz{padding:12px}.qb-take li{padding:8px 10px}.qb-badges{justify-content:flex-start}}';

  function mount() {
    if (ROOT) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    ROOT = document.createElement('section');
    ROOT.className = 'qb'; ROOT.id = 'qbBrief'; ROOT.setAttribute('aria-label', 'Quarterly Brief');
    ROOT.innerHTML =
      '<div class="bw-head first"><b>Quarterly Brief</b><span>how Variational\'s last quarters stack up against the on-chain perp field</span></div>' +
      '<div class="qb-bar-row"><span>Focus quarter</span><div class="qb-chips" id="qbChips" role="group" aria-label="Focus quarter"></div>' +
      '<div class="qb-credit">Framework adapted from <a href="' + TWEET + '" target="_blank" rel="noopener">Alea Research\'s Q3 2026 report ↗</a></div></div>' +
      '<div id="qbStatus"></div><div id="qbTake"></div><div class="qb-grid" id="qbGrid"></div>';
    var cap = SEC.querySelector(':scope > .cap');
    if (cap && cap.parentNode === SEC) cap.insertAdjacentElement('afterend', ROOT);
    else { var bw = SEC.querySelector('#bwBlock'); if (bw) bw.parentNode.insertBefore(ROOT, bw); else SEC.appendChild(ROOT); }
    GRID = $('#qbGrid', ROOT); TAKE = $('#qbTake', ROOT); CHIPS = $('#qbChips', ROOT); STATUS = $('#qbStatus', ROOT);
    GRID.innerHTML = CARDS.map(function (c) {
      return '<article class="bw-viz ' + c.cls + '" id="qbx' + c.id + '"><div class="bw-viz-kicker"><span>Exhibit ' + c.id + ' · ' + esc(c.k) + '</span><span class="qb-badges"></span></div>' +
        '<h3>' + esc(c.t) + '</h3><p class="bw-viz-sub">' + esc(c.s) + '</p><div class="bw-viz-read"></div><div class="qb-body"><div class="qb-skel"></div></div><div class="qb-cav"></div></article>';
    }).join('');
    TAKE.innerHTML = '<div class="qb-take"><li style="list-style:none;display:block"><div class="qb-skel" style="height:90px"></div></li></div>';

    ROOT.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button'); if (!b) return;
      if (b.dataset.q) { S.focus = b.dataset.q; render(); }
      else if (b.dataset.fdv) { S.fdv = +b.dataset.fdv; renderOne(9); syncFdv(); }
      else if (b.dataset.retry) { MEM = {}; loadAll(); }
    });
    ROOT.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'qbFdv') {
        var v = parseFloat(e.target.value);
        if (v > 0 && v < 1e4) { S.fdv = v * 1e9; renderOne(9, true); }
      }
    });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (S.M && !S.M.fatal) renderCards(); }, 150); });
  }
  function syncFdv() { /* chips are re-rendered with the card */ }

  function paintChips(M, F) {
    CHIPS.innerHTML = M.quarters.slice(1).map(function (q) {
      return '<button type="button" class="qb-chip' + (q.key === F.q.key ? ' on' : '') + '" data-q="' + q.key + '" aria-pressed="' + (q.key === F.q.key) + '">' + esc(q.label + (q.partial ? ' · QTD' : '')) + '</button>';
    }).join('');
  }

  function renderOne(id, keepFocus) {
    var M = S.M; if (!M || M.fatal) return;
    var c = CARDS.filter(function (x) { return x.id === id; })[0], el = $('#qbx' + id, ROOT); if (!c || !el) return;
    var F = qsFocus(M), body = $('.qb-body', el), active = document.activeElement, hadFocus = keepFocus && active && active.id === 'qbFdv', pos = hadFocus ? active.selectionStart : 0;
    var w = Math.max(160, Math.floor(body.clientWidth || el.clientWidth - 30));
    var r;
    try { r = EX[c.fn](M, F, w); } catch (err) { r = { body: '<div class="qb-empty">This exhibit could not be drawn (' + esc(err && err.message) + ').</div>', badges: [badge('error', 'warn')] }; if (window.console) console.warn('[quarterly-brief] ' + c.fn, err); }
    body.innerHTML = r.body;
    $('.qb-badges', el).innerHTML = (r.badges || []).join('');
    $('.bw-viz-read', el).innerHTML = r.read ? '<span class="what">' + r.read + '</span>' : '';
    $('.qb-cav', el).innerHTML = r.cav || '';
    if (hadFocus) { var inp = $('#qbFdv', el); if (inp) { inp.focus(); try { inp.setSelectionRange(pos, pos); } catch (e) { } } }
  }
  function renderCards() { CARDS.forEach(function (c) { renderOne(c.id); }); }

  function render() {
    if (!ROOT) return;
    if (S.loading || !S.raw) { STATUS.innerHTML = '<div class="qb-status">Loading venue history from DeFiLlama and Variational…</div>'; return; }
    var M; try { M = compute(); } catch (err) { M = { fatal: 'Calculation error: ' + (err && err.message) }; if (window.console) console.warn('[quarterly-brief]', err); }
    S.M = M;
    if (!M || M.fatal) {
      STATUS.innerHTML = '<div class="qb-status">' + esc(M && M.fatal || 'No data.') + '<button type="button" data-retry="1">Retry</button></div>';
      TAKE.innerHTML = ''; GRID.querySelectorAll('.qb-body').forEach(function (b) { b.innerHTML = '<div class="qb-empty">Data unavailable.</div>'; }); return;
    }
    M.mix = mix(S.raw.stats);
    var F = qsFocus(M);
    paintChips(M, F);
    var notes = [];
    if (S.errs.length) notes.push('Some sources failed to load: ' + esc(S.errs.join(', ')) + '. Showing what is available.');
    if (M.missing.length) notes.push('Excluded or partial: ' + esc(M.missing.map(function (v) { return v.name; }).join(', ')) + '.');
    STATUS.innerHTML = notes.length ? '<div class="qb-status">' + notes.join(' ') + '<button type="button" data-retry="1">Retry</button></div>' : '';
    try { TAKE.innerHTML = EX.take(M, F); } catch (err) { TAKE.innerHTML = ''; }
    renderCards();
  }

  /* ---------- lazy start ---------- */
  function visible() { return !SEC.classList.contains('tg-hide'); }
  function start() {
    if (S.started) { if (S.raw) render(); return; }
    S.started = true; mount(); loadAll();
  }
  function check() { if (visible()) start(); }
  new MutationObserver(check).observe(SEC, { attributes: true, attributeFilter: ['class'] });
  check();
})();
