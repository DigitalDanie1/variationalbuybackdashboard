/* ---------- Tab 12 · Two Paths ----------
   Reads Variational's TGE against the only two comparables that actually happened:
   Hyperliquid (2024-11-29) and Lighter (2025-12-22). The question is which of those
   two shapes the listing is more likely to rhyme with, and nothing else — there is no
   plan, no ladder, no recommended action anywhere in this file, by design.

   Two things are scored separately because they disagree:
     · business strength   — volume, OI, markets and profit, which look like HYPE
     · early listing price — float and macro, which look like LIT

   The macro scoreboard is a snapshot comparison, not a live feed: each metric is read
   on HYPE's listing day, on Lighter's listing day, and today, and the row goes to
   whichever listing today sits closer to. Values are carried over from the TGE
   playbook's own macro series (as of 2026-09-05), so this tab and that document
   cannot silently disagree. */
(function () {
  'use strict';

  var ASOF = '2026-09-05'; // Frozen playbook score, separate from the chart.
  var BTC_ASOF = '2026-11-05';
  var DOM_ASOF = '2026-11-06';
  var LIT_TGE = '2025-12-30';

  var LISTINGS = {
    hype: { label: 'HYPE', who: 'Hyperliquid', tge: '2024-11-29', open: 3.20, supply: 952.31e6,
      fdv: 3.05e9, accent: '#4fd6c3', logo: 'logo-hyperliquid.png',
      founder: { name: 'Jeff Yan', role: 'Co-founder & CEO', handle: 'chameleon_jeff', img: 'assets/founders/jeff-yan.jpg', initials: 'JY' },
      shape: '+901% within 22 days of listing, then a deep retrace',
      note: 'First print on listing day $3.20 × total supply 952.31M' },
    lit: { label: 'LIT', who: 'Lighter', tge: '2025-12-22', open: 3.9955, supply: 1e9,
      fdv: 4.00e9, accent: '#b98cff', logo: 'lighter-logo.png',
      founder: { name: 'Vladimir Novakovski', role: 'Founder & CEO', handle: 'vnovakovski', img: 'assets/founders/vladimir-novakovski.jpg', initials: 'VN' },
      shape: 'Top right at listing, −80% to the bottom, back to listing price 8 months later',
      note: 'First listing candle open $4.00 × total supply 1B · first close $3.89' }
  };

  /* value on HYPE's listing day, on Lighter's listing day, and today */
  var pct = function (v) { return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '%'; };
  var raw = function (v) { return v.toFixed(2) + '%'; };
  var raw1 = function (v) { return v.toFixed(1) + '%'; };  /* dominance reads wrong at 2dp */
  var pp  = function (v) { return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2) + '%p'; };
  var usdB = function (v) { return '$' + Math.round(v) + 'B'; };

  var METRICS = [
    { k: 'Bitcoin, last two months', why: 'up or down', h: 53.9, l: -19.5, n: 26.1, w: 1, f: pct },
    { k: 'Bitcoin vs its highest price', why: 'how far below the peak', h: -1.4, l: -28.9, n: -36.0, w: 1, f: pct },
    { k: 'Bitcoin vs its recent average', why: 'above or below the 200-day average', h: 46.1, l: -17.8, n: 14.4, w: 1, f: pct },
    { k: 'Bitcoin weekly MACD', why: 'whether medium-term momentum is building or fading', h: 3.8, l: -4.2, n: 3.2, w: 2, f: pct },
    { k: 'Share of the market sitting in cash', why: 'what % of crypto money is parked in stablecoins', h: 5.20, l: 8.89, n: 9.65, w: 1, f: raw },
    { k: 'That cash, change over 3 months', why: 'falling means people are buying coins with it', h: -2.34, l: 2.43, n: -2.76, w: 2, f: pp },
    { k: "Bitcoin's share of the market", why: 'high means money is crowding into BTC alone — a hard place for alts', h: 58.0, l: 59.6, n: 59.7, w: 1, f: raw1 },
    { k: 'That share, change over 3 months', why: 'falling means money is rotating into alts', h: 0.57, l: 1.11, n: 1.09, w: 1, f: pp },
    { k: 'Total altcoin market size', why: 'every coin except BTC and ETH, added up', h: 966, l: 835, n: 779, w: 1, f: usdB },
    { k: 'Alt market, change over 3 months', why: 'growing makes it easier for a new coin to rise', h: 71.9, l: -22.8, n: 15.2, w: 1, f: pct },
    { k: 'Is the cash pile itself growing', why: 'USDT+USDC supply — whether new money is arriving', h: 14.9, l: 7.1, n: -1.9, w: 1, f: pct }
  ];

  /* Where the listing price lands decides how much room is left above it. The bands
     are anchored on where HYPE and Lighter actually listed, not on a target. */
  var BANDS = [
    { max: 1.5e9, hype: 60, lit: 40, label: 'HYPE outcome is live too',
      why: 'Well below where HYPE ($3.05B) and Lighter ($4.00B) actually listed, so there is real room above.' },
    { max: 3.0e9, hype: 35, lit: 65, label: 'LIT-style fade slightly favoured',
      why: 'Inside the band where the comparable coins actually listed — the base case, with both directions open.' },
    { max: 4.5e9, hype: 22, lit: 78, label: 'LIT-style fade favoured',
      why: 'Starting at or above where Lighter listed, into a macro that is worse than Lighter had.' },
    { max: Infinity, hype: 12, lit: 88, label: 'LIT-style fade strongly favoured',
      why: 'Above where either comparable listed. Priced for the HYPE outcome before it has been earned.' }
  ];

  var FDV_CHIPS = [
    { v: 1.5e9, label: 'Bear $1.5B' },
    { v: 3.0e9, label: 'Base $3.0B' },
    { v: 5.0e9, label: 'Bull $5.0B' }
  ];


  /* Daily close as a multiple of each listing price, day 0 = listing day. Carried over
     from the TGE playbook's own series so the two documents cannot disagree. Stored as
     multiples rather than prices because the only comparable question is how far each
     moved from where it opened. */
  var SERIES = {
    hype: '1.954,2.656,2.959,2.634,3.462,3.562,3.972,4.322,4.412,4.381,4.231,4.237,5.034,5.637,6.087,7.547,7.466,8.512,7.994,7.256,7.788,9.297,10.009,8.894,8.944,9.306,8.294,8.506,8.472,9.147,8.578,8.422,7.503,8.225,7.237,7.638,7.819,7.625,7.884,7.344,7.031,6.334,6.453,6.525,6.6,6.759,7.188,7.619,7.334,7.216,6.856,6.312,6.422,7.244,7.594,6.869,7.206,7.234,6.903,7.309,6.966,7.422,8.509,8.416,7.247,6.972,7.869,7.853,7.737,7.45,7.137,7.303,7.178,7.291,7.344,8.075,8.209,8.181,8.037,8.375,7.931,7.528,7.519,7.641,7.809,7.744,7.228,6.212,6.312,6.116,6.522,6.234,6.128,6.416,5.587,5.341,5.372,4.806,4.731,4.722,4.506,4.206,4.303,4.112,3.85,4.312,4.494,4.053,4.138,4.428,4.881,4.422,4.978,4.866,5.091,5.237,5.009,4.394,4.559,4.184,4.0,3.9,4.059,4.162,3.678,3.656,3.709,3.759,3.203,3.591,3.506,4.244,4.428,4.903,5.103,4.816,4.912,4.7,4.925,5.356,5.331,5.647,5.491,5.684,5.991,5.769,5.862,5.747,5.597,5.434,5.837,5.816,6.25,6.228,6.5,6.547,6.219,6.338,6.547,6.578,7.281,7.716,8.194,7.778,7.756,8.062,7.872,8.156,8.375,8.075,8.453,8.287,8.281,8.834,10.441,10.325,10.875,12.216,11.581,11.166,10.719,9.8,10.25,10.212,10.684,11.4,11.262,11.122,10.616,10.409,10.909,10.931,12.141,13.184,13.062,12.659,13.213,12.534,12.866,13.094,12.494,12.328,11.522,10.419,10.75,11.159,11.944,11.722,11.566,11.175,11.441,11.816,12.425,12.366,11.525,12.472,12.578,12.191,12.231,12.453,12.05,12.134,12.716,13.684,14.469,14.719,15.287,14.859,14.947,14.7,14.25,13.859,13.9,14.381,13.847,14.453,13.669,13.162,13.809,13.537,13.65,13.681,13.609,13.197,12.737,11.747,11.534,11.931,12.122,12.028,11.903,12.787,12.812,13.641,14.144,13.5,13.984,14.891,14.231,14.934,14.475,14.387,13.547,12.891,13.428,12.631,14.156,14.022,14.391,13.419,15.247,14.672,14.228,13.878,13.759,13.834,13.469,14.019,14.316,14.166,14.75,14.372,14.716,15.903,16.644,17.325,17.816,17.266,17.019,16.781,16.872,17.016,18.044,18.309,17.541,16.931,15.869,14.756,13.934,14.266,12.616,14.006,14.3,14.756,14.438,14.128,14.769,15.884,15.45,15.362,15.075,14.762,14.103,14.572,13.741,11.753,11.516,12.391,13.278,12.325,11.706,11.5,11.094,11.516,11.687,11.859,11.056,11.334,12.578,12.294,13.828,14.794,14.556,14.912,15.012,14.184,13.647,13.522,13.266,12.553,12.191,12.931,12.031,13.194,12.544,13.062,12.947,12.087,11.981,12.041,11.712,12.053,12.091,12.272,12.084,12.147,11.728,10.575,9.362,9.959,10.537,10.544,11.328,10.856,10.919,10.734,9.966,9.688,10.572,10.822,10.478,9.684,9.672,9.291,9.213,8.719,9.012,9.112,8.941,9.247,9.009,8.625,8.375,7.65,7.016,7.772,7.503,7.762,7.769,7.487,7.862,7.625,8.056,8.109,7.919,8.059,8.112,7.947,7.572,7.684,7.931,8.397,8.287,8.828,8.391,8.022,7.834,7.506,7.625,7.419,8.05,8.119,7.728,7.812,7.941,7.647,7.409,6.553,6.725,6.7,7.072,7.25,6.934,7.791,9.625,10.762,9.622,9.556,9.681,9.55,10.4,10.209,11.075,10.322,10.112,9.812,10.137,9.794,9.009,9.184,9.716,9.862,9.947,9.594,9.75,9.219,8.966,9.066,9.484,9.297,9.069,8.244,8.469,8.719,8.791,8.534,9.759,9.862,10.259,9.781,10.05,9.541,9.7,9.466,9.6,10.837,10.684,11.319,11.65,11.394,11.822,11.647,12.747,12.866,13.156,12.294,12.356,12.231,11.984,11.672,12.606,12.603,12.228,12.081,12.334,11.816,11.516,11.434,11.256,11.0,11.128,11.372,11.513,11.344,12.075,12.131,12.337,13.003,13.216,12.766,13.862,13.609,13.959,13.697,13.959,13.687,12.712,12.728,12.428,12.872,12.909,12.866,12.972,13.272,13.022,12.556,12.487,12.412,12.859,12.894,12.981,13.059,13.666,13.472,13.287,13.525,13.406,13.444,13.131,12.575,12.122,13.8,13.806,13.069,14.291,14.919,15.009,17.131,18.288,17.056,18.35,19.609,19.097,18.597,18.028,19.225,20.137,21.341,22.516,22.997,21.8,23.284,20.125,18.687,17.663,18.669,19.941,18.056,16.647,18.425,18.522,18.975,19.981,20.909,22.988,22.222,21.341,21.956,22.1,20.903,20.7,19.419,19.975,20.019,20.103,19.266,19.188,20.9,20.306,19.494,20.909,22.081,21.812,22.297,22.059,21.603,21.128,20.969,21.1,20.875,21.041,19.809,20.478,20.884,18.972,18.662,18.819,19.1,19.519,19.022,18.547,17.959,17.941,18.175,18.622,17.516,17.237,16.837,17.45,16.406,16.291,16.425,16.869,17.2,17.797,17.556,16.906,17.222,16.834,17.203,17.016,17.509,17.959,17.647,17.775,17.85,18.575,18.288,21.75,23.034,23.609,24.809,25.719,24.662,24.887,25.703,26.45,25.287,26.066,25.006,26.3,25.866,25.606,27.316,26.375,26.281',
    lit: '0.974,0.92,0.877,0.86,0.844,0.859,0.933,0.836,0.666,0.624,0.672,0.673,0.658,0.669,0.762,0.788,0.788,0.768,0.745,0.656,0.659,0.53,0.542,0.547,0.473,0.466,0.488,0.451,0.418,0.412,0.434,0.439,0.426,0.454,0.395,0.429,0.488,0.499,0.404,0.431,0.392,0.379,0.4,0.371,0.395,0.362,0.417,0.408,0.406,0.388,0.368,0.355,0.358,0.4,0.412,0.419,0.423,0.398,0.362,0.37,0.384,0.38,0.362,0.347,0.358,0.365,0.358,0.34,0.347,0.34,0.34,0.325,0.343,0.303,0.285,0.283,0.255,0.255,0.264,0.268,0.288,0.275,0.277,0.272,0.291,0.324,0.304,0.299,0.266,0.264,0.235,0.239,0.252,0.249,0.228,0.221,0.215,0.207,0.202,0.218,0.223,0.238,0.247,0.247,0.253,0.256,0.27,0.25,0.254,0.284,0.302,0.274,0.287,0.256,0.261,0.261,0.263,0.245,0.223,0.225,0.224,0.22,0.232,0.236,0.233,0.229,0.216,0.224,0.237,0.221,0.226,0.228,0.231,0.227,0.242,0.239,0.248,0.271,0.264,0.265,0.25,0.232,0.224,0.229,0.215,0.22,0.216,0.239,0.285,0.32,0.359,0.297,0.308,0.324,0.346,0.296,0.283,0.294,0.316,0.343,0.345,0.334,0.402,0.447,0.367,0.377,0.356,0.359,0.368,0.396,0.348,0.39,0.384,0.408,0.422,0.423,0.434,0.431,0.404,0.387,0.39,0.393,0.404,0.377,0.426,0.404,0.458,0.431,0.434,0.467,0.463,0.519,0.518,0.53,0.551,0.616,0.646,0.616,0.583,0.601,0.675,0.645,0.658,0.577,0.649,0.604,0.572,0.573,0.566,0.554,0.546,0.587,0.577,0.541,0.51,0.518,0.538,0.534,0.577,0.546,0.571,0.518,0.506,0.509,0.502,0.516,0.547,0.595,0.576,0.572,0.577,0.597,0.606,0.585,0.568,0.56,0.567,0.57,0.584,0.59,0.651,0.67,0.784,0.799,0.896,0.852,0.823,0.864,0.929,0.875,0.891,0.883,0.893,0.881,0.948,1.112,1.207,1.171'
  };
  var WINDOW = 258;   /* Lighter's full life so far — the longest window both cover */

  function parseSeries(k) {
    return SERIES[k].split(',').map(Number);
  }

  /* Log scale: the two paths span ×0.19 to ×15.6 inside the shared window, and a linear
     axis would flatten Lighter into the baseline. */
  /* Swing pivots by zig-zag: a turn is only recorded once the series has reversed by
     more than the threshold from its running extreme, so noise never becomes a pivot.
     28% keeps the structural turns and drops the chop — HYPE resolves to 8 pivots, LIT
     to 5, and those are the points the two paths actually diverge on. */
  var PIVOT_TH = 0.28;
  function zigzag(a, th) {
    var piv = [], ei = 0, ev = a[0], d = 0;
    for (var i = 1; i < a.length; i++) {
      var v = a[i];
      if (d > 0) {
        if (v > ev) { ei = i; ev = v; }
        else if (v <= ev * (1 - th)) { piv.push({ i: ei, v: ev, t: 'high' }); d = -1; ei = i; ev = v; }
      } else if (d < 0) {
        if (v < ev) { ei = i; ev = v; }
        else if (v >= ev * (1 + th)) { piv.push({ i: ei, v: ev, t: 'low' }); d = 1; ei = i; ev = v; }
      } else {
        if (v >= ev * (1 + th)) { piv.push({ i: ei, v: ev, t: 'low' }); d = 1; ei = i; ev = v; }
        else if (v <= ev * (1 - th)) { piv.push({ i: ei, v: ev, t: 'high' }); d = -1; ei = i; ev = v; }
        else if (v > ev) { ei = i; ev = v; }
      }
    }
    piv.push({ i: ei, v: ev, t: d > 0 ? 'high' : 'low' });
    return piv;
  }


  var PIVOT_ROWS = null;

  /* Every swing turn in one aligned grid. A table is the precise form for this — the same
     numbers floating at per-point offsets on the plot could not be scanned or compared. */
  function swingTable() {
    if (!PIVOT_ROWS) return '';
    var rows = [];
    ['hype', 'lit'].forEach(function (k) {
      PIVOT_ROWS[k].forEach(function (p, idx) {
        var prev = idx ? PIVOT_ROWS[k][idx - 1] : null;
        rows.push({ k: k, i: p.i, t: p.t, v: p.v,
          leg: prev ? (p.v / prev.v - 1) * 100 : null,
          days: prev ? p.i - prev.i : null });
      });
    });
    rows.sort(function (a, b) { return a.i - b.i || (a.k === 'hype' ? -1 : 1); });
    var body = rows.map(function (r) {
      var up = r.t === 'low';
      return '<tr>' +
        '<td class="sw-tok ' + r.k + '">' + (r.k === 'hype' ? 'HYPE' : 'LIT') + '</td>' +
        '<td class="sw-turn"><i class="' + (up ? 'up' : 'dn') + '">' + (up ? '\u25b2' : '\u25bc') + '</i>' +
        (up ? 'low' : 'high') + '</td>' +
        '<td class="sw-day">D+' + r.i + '</td>' +
        '<td class="sw-val">' + fromListing(r.v) + '</td>' +
        '<td class="sw-leg ' + (r.leg === null ? '' : r.leg >= 0 ? 'up' : 'dn') + '">' +
        (r.leg === null ? '\u2014' : (r.leg >= 0 ? '+' : '\u2212') + Math.abs(r.leg).toFixed(0) + '%') + '</td>' +
        '<td class="sw-days">' + (r.days === null ? '\u2014' : r.days + 'd') + '</td></tr>';
    }).join('');
    return '<div class="tp-tablewrap"><table class="tp-table sw-table"><thead><tr>' +
      '<th>Token</th><th>Turn</th><th>Day</th><th>From listing</th><th>Leg move</th><th>Days in leg</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function tgeChart() {
    var W = 960, pl = 96, pr = 128, pt = 50, plotH = 380, pb = 56;
    var H = pt + plotH + pb;
    var h = parseSeries('hype').slice(0, WINDOW);
    var l = parseSeries('lit').slice(0, WINDOW);
    var n = Math.max(h.length, l.length);
    var all = h.concat(l).filter(function (v) { return v > 0; });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var L = Math.log10(lo * 0.78), Hh = Math.log10(hi * 1.30);
    var X = function (i) { return pl + (i / Math.max(1, n - 1)) * (W - pl - pr); };
    var Y = function (v) { return pt + (1 - (Math.log10(v) - L) / (Hh - L)) * plotH; };
    var yOne = Y(1);

    /* above the listing price is strength, below it is weakness — the one line that
       decides whether a holder is up or down, so the plot is banded by it */
    var zones = '<rect class="tge-zone up" x="' + pl + '" y="' + pt + '" width="' + (W - pl - pr) +
      '" height="' + (yOne - pt).toFixed(1) + '"/>' +
      '<rect class="tge-zone dn" x="' + pl + '" y="' + yOne.toFixed(1) + '" width="' + (W - pl - pr) +
      '" height="' + (pt + plotH - yOne).toFixed(1) + '"/>' +
      '';

    /* A log axis with only round decades hides how far apart the two paths really are,
       so the ladder is the full 1-2-3-5-7 sequence per decade: labelled majors, plain
       tick marks for the rest. */
    var MAJOR = [0.2, 0.5, 1, 2, 5, 10, 20], MINOR = [0.3, 0.7, 1.5, 3, 7, 15];
    var inRange = function (t) { return t >= lo * 0.78 && t <= hi * 1.30; };
    var grid = MAJOR.filter(inRange).map(function (t) {
      var one = t === 1;
      return '<line class="tge-grid' + (one ? ' one' : '') + '" x1="' + pl + '" y1="' + Y(t).toFixed(1) +
        '" x2="' + (W - pr) + '" y2="' + Y(t).toFixed(1) + '"/>' +
        '<line class="tge-tick" x1="' + (pl - 5) + '" y1="' + Y(t).toFixed(1) + '" x2="' + pl +
        '" y2="' + Y(t).toFixed(1) + '"/>' +
        '<text class="tge-axis' + (one ? ' one' : '') + '" x="' + (pl - 9) + '" y="' + (Y(t) + 4).toFixed(1) +
        '" text-anchor="end">' + (one ? '0%' : fromListing(t)) + '</text>';
    }).join('') + MINOR.filter(inRange).map(function (t) {
      return '<line class="tge-grid minor" x1="' + pl + '" y1="' + Y(t).toFixed(1) + '" x2="' + (W - pr) +
        '" y2="' + Y(t).toFixed(1) + '"/>' +
        '<line class="tge-tick minor" x1="' + (pl - 3) + '" y1="' + Y(t).toFixed(1) + '" x2="' + pl +
        '" y2="' + Y(t).toFixed(1) + '"/>' +
        '<text class="tge-axis minor" x="' + (pl - 9) + '" y="' + (Y(t) + 3.5).toFixed(1) +
        '" text-anchor="end">' + fromListing(t) + '</text>';
    }).join('') +
      '<line class="tge-spine" x1="' + pl + '" y1="' + pt + '" x2="' + pl + '" y2="' + (pt + plotH) + '"/>' +
      '<line class="tge-spine" x1="' + pl + '" y1="' + (pt + plotH) + '" x2="' + (W - pr) +
      '" y2="' + (pt + plotH) + '"/>';

    var path = function (a) {
      return a.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
    };

    /* TradingView convention: a down triangle above a swing high, an up triangle below a
       swing low, and each is labelled with the run of the previous 30 days.

       Thirty days for every arrow, so the figures are comparable with each other and are
       plainly not the axis: the axis reads change since listing, a level, while these read
       change over a fixed window, a rate. Leg-to-leg moves could not do that - they ran
       anywhere from 11 to 112 days, so +461% and +35% were not the same kind of number,
       and sitting next to a +900% gridline they were impossible to tell apart. Inside the
       first 30 days there is no full window, so the label measures from the listing price
       and says how many days it actually covers. */
    var ROC = 30;
    var piv = { hype: zigzag(h, PIVOT_TH), lit: zigzag(l, PIVOT_TH) };
    var marks = '', labs = [], placed = [];
    ['hype', 'lit'].forEach(function (k) {
      var arr = k === 'hype' ? h : l;
      piv[k].forEach(function (p, idx) {
        var x = X(p.i), y = Y(p.v), high = p.t === 'high';
        var off = high ? -10 : 10, sz = 5.4;
        var tri = high
          ? (x - sz) + ',' + (y + off - sz) + ' ' + (x + sz) + ',' + (y + off - sz) + ' ' + x + ',' + (y + off + 1.5)
          : (x - sz) + ',' + (y + off + sz) + ' ' + (x + sz) + ',' + (y + off + sz) + ' ' + x + ',' + (y + off - 1.5);

        var j = Math.max(0, p.i - ROC), span = p.i - j;
        var roc = span > 0 && arr[j] > 0 ? (p.v / arr[j] - 1) * 100 : null;
        var txt = roc === null ? null
          : (roc >= 0 ? '+' : '−') + Math.abs(roc).toFixed(0) + '%/' + span + 'd';

        marks += '<polygon class="tge-arrow ' + k + ' ' + (high ? 'dnsig' : 'upsig') + '" points="' + tri + '">' +
          '<title>' + (k === 'hype' ? 'HYPE' : 'LIT') + ' · D+' + p.i + ' · ' + fromListing(p.v) +
          ' from listing' + (txt === null ? '' : ' · ' + txt + ' run into this turn') +
          '</title></polygon>';
        placed.push({ x0: x - sz - 2, x1: x + sz + 2, y0: y + off - sz - 2, y1: y + off + sz + 2 });
        if (txt === null) return;
        labs.push({ k: k, high: high, up: roc >= 0, arr: arr, x: x, y: y, t: txt });
      });
    });

    labs.sort(function (a, b) { return a.x - b.x; });
    labs.forEach(function (L2) {
      var w = L2.t.length * 6.9 + 6, hgt = 13;

      /* clear the curve, not just the pivot: the price either side of a turn often rides
         higher than the turn itself */
      var span2 = Math.max(1, n - 1), half = w / 2;
      var j0 = Math.max(0, Math.floor((L2.x - half - pl) / (W - pl - pr) * span2));
      var j1 = Math.min(L2.arr.length - 1, Math.ceil((L2.x + half - pl) / (W - pl - pr) * span2));
      var ext = L2.arr[Math.max(0, Math.min(j0, L2.arr.length - 1))];
      for (var q = j0; q <= j1; q++) {
        var vv = L2.arr[q];
        if (!vv || !isFinite(vv)) continue;
        if (L2.high ? vv > ext : vv < ext) ext = vv;
      }
      var edge = Y(ext);
      var base = L2.high ? edge - 22 : edge + 32;
      /* the curve is an obstacle as well as the other labels, so the ladder runs a good
         way out on the preferred side before it gives up and flips */
      var cand = L2.high
        ? [base, base - 14, base - 28, base - 42, base - 56, L2.y + 34, L2.y + 48, L2.y + 62]
        : [base, base + 14, base + 28, base + 42, base + 56, L2.y - 26, L2.y - 40, L2.y - 54];

      var pick = null, first = null;
      for (var c = 0; c < cand.length; c++) {
        var ly = cand[c];
        var b2 = { x0: L2.x - w / 2, x1: L2.x + w / 2, y0: ly - hgt + 3, y1: ly + 3 };
        if (b2.y0 < pt + 1 || b2.y1 > pt + plotH - 1) continue;
        if (!first) first = { ly: ly, box: b2 };
        var clash = placed.some(function (z) {
          return b2.x0 < z.x1 && z.x0 < b2.x1 && b2.y0 < z.y1 && z.y0 < b2.y1;
        });
        if (!clash) {
          /* sample both series across the label's own x-range: a box that any price line
             passes through is rejected outright rather than merely offset */
          for (var sIdx = j0; sIdx <= j1 && !clash; sIdx++) {
            var yy = L2.arr[sIdx];
            if (!yy || !isFinite(yy)) continue;
            var py = Y(yy);
            if (py > b2.y0 - 2 && py < b2.y1 + 2) clash = true;
          }
        }
        if (!clash) { pick = { ly: ly, box: b2 }; break; }
      }
      pick = pick || first;
      if (!pick) return;
      placed.push(pick.box);
      marks += '<text class="tge-lab ' + L2.k + (L2.up ? ' up' : ' dn') + '" x="' + L2.x.toFixed(1) +
        '" y="' + pick.ly.toFixed(1) + '" text-anchor="middle">' + L2.t + '</text>';
    });

    PIVOT_ROWS = piv;

    /* one row of dates, one interval: 30-day majors with 10-day minors between them.
       The old layout put D+22 and the last day on a second baseline, which is what made
       the axis look uneven. */
    var dayLabels = '';
    for (var dd = 0; dd <= n - 1; dd += 10) {
      var major = dd % 30 === 0;
      dayLabels += '<line class="tge-tick' + (major ? '' : ' minor') + '" x1="' + X(dd).toFixed(1) +
        '" y1="' + (pt + plotH) + '" x2="' + X(dd).toFixed(1) + '" y2="' + (pt + plotH + (major ? 7 : 3.5)) + '"/>';
      if (major) dayLabels += '<text class="tge-axis" x="' + X(dd).toFixed(1) + '" y="' + (pt + plotH + 24) +
        '" text-anchor="middle">D+' + dd + '</text>';
    }
    var endLab = function (a, cls, name) {
      var v = a[a.length - 1];
      return '<text class="tge-end ' + cls + '" x="' + (W - pr + 8) + '" y="' + (Y(v) + 4).toFixed(1) + '">' +
        name + ' ' + fromListing(v) + '</text>';
    };
    return '<svg class="tge-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="Price as a multiple of listing price with swing highs and lows marked by arrows">' +
      zones + grid +
      '<path class="tge-line hype" d="' + path(h) + '"/>' +
      '<path class="tge-line lit" d="' + path(l) + '"/>' +
      marks + endLab(h, 'hype', 'HYPE') + endLab(l, 'lit', 'LIT') +
      dayLabels + '</svg>';
  }

  /* Same window, same milestones, so the two are actually comparable. */

  /* ---- each token against Bitcoin over its own first 258 days ----
     Two panels rather than one: HYPE and Lighter listed 13 months apart, so a single
     calendar axis would compare each token to a different stretch of Bitcoin. Aligning
     both to their own D+0 puts the question the same way twice — while Bitcoin did this,
     the token did that — and the two panels are then directly comparable to each other.
     Every series is indexed to 1.00 on the listing day. */
  function overlay() {
    var M = macro();
    var out = {};
    [['hype', MACRO.mark.hype], ['lit', MACRO.mark.lit]].forEach(function (pair) {
      var k = pair[0], at = pair[1];
      var tok = parseSeries(k).slice(0, WINDOW);
      var base = M.btc[at];
      var btc = [];
      for (var i = 0; i < tok.length && at + i < M.btc.length; i++) btc.push(M.btc[at + i] / base);
      var n = Math.min(tok.length, btc.length);
      tok = tok.slice(0, n); btc = btc.slice(0, n);
      /* daily log returns -> beta and correlation of the token against Bitcoin */
      var rt = [], rb = [];
      for (var j = 1; j < n; j++) {
        rt.push(Math.log(tok[j] / tok[j - 1]));
        rb.push(Math.log(btc[j] / btc[j - 1]));
      }
      var mean = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; };
      var mt = mean(rt), mb = mean(rb), cov = 0, vb = 0, vt = 0;
      for (var q = 0; q < rt.length; q++) {
        cov += (rt[q] - mt) * (rb[q] - mb);
        vb += (rb[q] - mb) * (rb[q] - mb);
        vt += (rt[q] - mt) * (rt[q] - mt);
      }
      out[k] = { tok: tok, btc: btc, n: n,
        beta: vb ? cov / vb : 0,
        corr: (vb && vt) ? cov / Math.sqrt(vb * vt) : 0 };
    });
    return out;
  }

  function overlayChart() {
    var O = overlay();
    var W = 960, pl = 58, pr = 104, gap = 30, panelH = 190, pt = 26, pb = 34;
    var H = pt + panelH * 2 + gap + pb;
    var panels = ['hype', 'lit'].map(function (k, row) {
      var D = O[k], top = pt + row * (panelH + gap);
      var all = D.tok.concat(D.btc);
      var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
      var L = Math.log10(lo * 0.9), Hh = Math.log10(hi * 1.15);
      var X = function (i) { return pl + (i / Math.max(1, D.n - 1)) * (W - pl - pr); };
      var Y = function (v) { return top + (1 - (Math.log10(v) - L) / (Hh - L)) * panelH; };
      var path = function (a) {
        return a.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
      };
      var ladder = [0.2, 0.5, 1, 2, 5, 10, 20].filter(function (t) { return t >= lo * 0.9 && t <= hi * 1.15; });
      var grid = ladder.map(function (t) {
        var one = t === 1;
        return '<line class="tge-grid' + (one ? ' one' : '') + '" x1="' + pl + '" y1="' + Y(t).toFixed(1) +
          '" x2="' + (W - pr) + '" y2="' + Y(t).toFixed(1) + '"/>' +
          '<line class="tge-tick" x1="' + (pl - 5) + '" y1="' + Y(t).toFixed(1) + '" x2="' + pl + '" y2="' + Y(t).toFixed(1) + '"/>' +
          '<text class="tge-axis' + (one ? ' one' : '') + '" x="' + (pl - 9) + '" y="' + (Y(t) + 4).toFixed(1) +
          '" text-anchor="end">\u00d7' + t + '</text>';
      }).join('');
      var xt = '';
      for (var dd = 0; dd < D.n; dd += 30) {
        xt += '<line class="tge-tick" x1="' + X(dd).toFixed(1) + '" y1="' + (top + panelH) +
          '" x2="' + X(dd).toFixed(1) + '" y2="' + (top + panelH + 5) + '"/>';
        if (row === 1) xt += '<text class="tge-axis" x="' + X(dd).toFixed(1) + '" y="' + (H - 14) +
          '" text-anchor="middle">D+' + dd + '</text>';
      }
      var lastT = D.tok[D.n - 1], lastB = D.btc[D.n - 1];
      var yT = Y(lastT), yB = Y(lastB);
      if (Math.abs(yT - yB) < 13) { var mid = (yT + yB) / 2; yT = mid + (lastT >= lastB ? -7 : 7); yB = mid + (lastT >= lastB ? 7 : -7); }
      return '<g>' + grid + xt +
        '<line class="tge-spine" x1="' + pl + '" y1="' + top + '" x2="' + pl + '" y2="' + (top + panelH) + '"/>' +
        '<line class="tge-spine" x1="' + pl + '" y1="' + (top + panelH) + '" x2="' + (W - pr) + '" y2="' + (top + panelH) + '"/>' +
        '<path class="ov-btc" d="' + path(D.btc) + '"/>' +
        '<path class="ov-tok ' + k + '" d="' + path(D.tok) + '"/>' +
        '<text class="ov-title ' + k + '" x="' + pl + '" y="' + (top - 8) + '">' +
        (k === 'hype' ? 'HYPE vs Bitcoin' : 'LIT vs Bitcoin') + '</text>' +
        '<text class="ov-stat" x="' + (W - pr) + '" y="' + (top - 8) + '" text-anchor="end">beta ' +
        D.beta.toFixed(2) + ' \u00b7 correlation ' + D.corr.toFixed(2) + '</text>' +
        '<text class="tge-end ' + k + '" x="' + (W - pr + 8) + '" y="' + (yT + 4).toFixed(1) + '">' +
        (k === 'hype' ? 'HYPE' : 'LIT') + ' \u00d7' + lastT.toFixed(2) + '</text>' +
        '<text class="ov-btc-end" x="' + (W - pr + 8) + '" y="' + (yB + 4).toFixed(1) + '">BTC \u00d7' +
        lastB.toFixed(2) + '</text></g>';
    }).join('');
    return '<svg class="tge-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="Each token against Bitcoin over its own first 258 days, both indexed to the listing day">' +
      panels + '</svg>';
  }

  /* Everything the reader compares is quoted as a change from the listing price. Multiples
     and percentages side by side were the confusing part: x0.54 and -46% are the same fact. */
  var fromListing = function (mult) {
    var pc = (mult - 1) * 100;
    return (pc >= 0 ? '+' : '\u2212') + Math.abs(pc).toFixed(0) + '%';
  };

  function milestones() {
    var rows = [
      { k: 'Day 22', why: 'where HYPE had already run +901%' },
      { k: 'Worst point', why: 'lowest close in the window' },
      { k: 'Day 257', why: 'end of the shared window' },
      { k: 'Best point', why: 'highest close in the window' }
    ];
    var get = function (k) {
      var a = parseSeries(k).slice(0, WINDOW);
      var min = Math.min.apply(null, a), max = Math.max.apply(null, a);
      return { d22: a[22], min: min, minD: a.indexOf(min), last: a[a.length - 1], max: max, maxD: a.indexOf(max) };
    };
    var H = get('hype'), Lt = get('lit');
    var cell = function (v, d) {
      return '<td class="tge-v">' + fromListing(v) + (d != null ? '<i>D+' + d + '</i>' : '') + '</td>';
    };
    return '<div class="tp-tablewrap"><table class="tp-table tge-table hl-cols"><thead><tr>' +
      '<th>Milestone</th><th>HYPE</th><th>LIT</th></tr></thead><tbody>' +
      '<tr><td class="tp-k"><b>' + rows[0].k + '</b><small>' + rows[0].why + '</small></td>' + cell(H.d22) + cell(Lt.d22) + '</tr>' +
      '<tr><td class="tp-k"><b>' + rows[1].k + '</b><small>' + rows[1].why + '</small></td>' + cell(H.min, H.minD) + cell(Lt.min, Lt.minD) + '</tr>' +
      '<tr><td class="tp-k"><b>' + rows[3].k + '</b><small>' + rows[3].why + '</small></td>' + cell(H.max, H.maxD) + cell(Lt.max, Lt.maxD) + '</tr>' +
      '<tr><td class="tp-k"><b>' + rows[2].k + '</b><small>' + rows[2].why + '</small></td>' + cell(H.last) + cell(Lt.last) + '</tr>' +
      '</tbody></table></div>';
  }


  /* Bitcoin around each listing, indexed to 1.00 on the listing day itself, D-90 to D+120.
     This is the backdrop the macro table scores numerically — the same question, drawn.
     'now' has no forward half: today is the right edge, which is the point. */
  // Binance BTCUSDT daily UTC closes. The latest series ends at its observation date.
  var BTC = {
    hype: { closes: [58973.99,57301.86,59132.13,57487.73,57970.9,56180.0,53962.97,54160.86,54869.95,57042.0,57635.99,57338.0,58132.32,60498.0,59993.03,59132.0,58213.99,60313.99,61759.99,62947.99,63201.05,63348.96,63578.76,63339.99,64262.7,63152.01,65173.99,65769.95,65858.0,65602.01,63327.59,60805.78,60649.28,60752.71,62086.0,62058.0,62819.91,62224.0,62160.49,60636.02,60326.39,62540.0,63206.22,62870.02,66083.99,67074.14,67620.01,67421.78,68428.0,68378.0,69031.99,67377.5,67426.0,66668.65,68198.28,66698.33,67092.76,68021.7,69962.21,72736.42,72344.74,70292.01,69496.01,69374.74,68775.99,67850.01,69372.01,75571.99,75857.89,76509.78,76677.46,80370.01,88647.99,87952.01,90375.2,87325.59,91032.07,90586.92,89855.99,90464.08,92310.79,94286.56,98317.12,98892.0,97672.4,97900.04,93010.01,91965.16,95863.11,95643.98,97460.0,96407.99,97185.18,95840.62,95849.69,98587.32,96945.63,99740.84,99831.99,101109.59,97276.47,96593.0,101125.0,100004.29,101424.25,101420.0,104463.99,106058.66,106133.74,100204.01,97461.86,97805.44,97291.99,95186.27,94881.47,98663.58,99429.6,95791.6,94299.03,95300.0,93738.2,92792.05,93576.0,94591.79,96984.79,98174.18,98220.5,98363.61,102235.6,96954.61,95060.61,92552.49,94726.11,94599.99,94545.06,94536.1,96560.86,100497.35,99987.3,104077.48,104556.23,101331.57,102260.01,106143.82,103706.66,103910.34,104870.5,104746.85,102620.0,102082.83,101335.52,103733.24,104722.94,102429.56,100635.65,97700.59,101328.52,97763.13,96612.43,96554.35,96506.8,96444.74,96462.75,97430.82,95778.2,97869.99,96608.14,97500.48,97569.66,96118.12,95780.0,95671.74,96644.37,98305.0,96181.98,96551.01,96258.0,91552.88,88680.4,84250.09,84708.58,84349.94,86064.53,94270.0,86220.61,87281.98,90606.01,89931.89,86801.75,86222.45,80734.37,78595.86,82932.99,83680.12,81115.78,83983.2,84338.44,82574.53,84010.03,82715.03,86845.94,84223.39,84088.79,83840.59,86082.5,87498.16,87392.87,86909.17,87232.01,84424.38,82648.54], at: 90, date: '2024-11-29' },
    lit: { closes: [118594.99,120529.35,122232.0,122391.0,123482.31,124658.54,121332.95,123306.0,121662.4,112774.5,110644.4,114958.8,115166.0,113028.14,110763.28,108194.28,106431.68,107185.01,108642.78,110532.09,108297.67,107567.44,110078.18,111004.89,111646.27,114559.4,114107.65,112898.45,110021.29,108322.88,109608.01,110098.1,110540.68,106583.04,101497.22,103885.16,101346.04,103339.08,102312.94,104722.96,106011.13,103058.99,101654.37,99692.02,94594.0,95596.24,94261.44,92215.14,92960.83,91554.96,86637.23,85129.43,84739.74,86830.0,88300.01,87369.96,90484.02,91333.95,90890.7,90802.44,90360.0,86286.01,91277.88,93429.95,92078.06,89330.04,89236.79,90395.31,90634.34,92678.8,92015.37,92513.38,90268.42,90240.01,88172.17,86432.08,87863.42,86243.22,85516.41,88136.94,88360.9,88658.86,88620.79,87486.0,87669.45,87225.27,87369.56,87877.01,87952.71,87237.13,88485.49,87648.22,88839.04,89995.13,90628.01,91529.73,93859.71,93747.97,91364.16,91099.99,90641.28,90504.7,91013.65,91296.2,95414.0,96951.78,95604.8,95550.94,95147.77,93673.14,92631.0,88427.66,89454.73,89559.67,89600.26,89225.34,86670.36,88347.08,89250.0,89299.99,84650.16,84260.49,78741.09,76968.21,78738.61,75770.21,73165.83,62909.86,70580.26,69289.38,70330.38,70138.0,68841.29,67082.52,66272.17,68853.96,69822.95,68832.58,68892.43,67503.52,66461.0,67003.73,68020.01,67975.93,67643.4,64656.02,64058.15,67988.04,67485.18,65872.1,66973.26,65776.47,68830.06,68338.0,72666.77,70890.72,68114.02,67262.91,65971.2,68432.16,69948.63,70191.86,70541.34,70930.0,71211.95,72815.24,74884.67,73909.36,71246.54,69930.0,70510.73,68918.12,67859.0,70906.45,70556.74,71336.53,68820.31,66407.28,66377.03,66010.93,66797.37,68284.48,68113.92,66901.99,66964.3,67300.42,69034.18,68853.66,71924.22,71069.93,71787.97,72962.7,73043.16,70740.98,74417.99,74131.55,74809.99,75154.29,77072.0,75691.76,73801.79,75840.97,76336.15,78178.23,78257.48,77437.13,77625.0,78657.55,77371.32,76342.77,75780.0], at: 90, date: '2025-12-30' },
    now: { closes: [64923.19,64962.6,64901.59,63970.01,63600.0,63479.99,63490.86,63043.56,63086.01,62900.0,64532.1,64725.42,69334.79,73025.15,78338.03,77074.93,77734.0,78992.75,78539.14,79023.75,80249.58,77845.87,78230.0,77682.0,78581.29,77439.0,77340.01,81270.37,79660.77,79831.75,80341.83,79112.01,78455.8,78306.43,76568.72,77225.7,77278.73,76842.01,78189.21,75644.48,76206.01,76417.01,80883.87,81249.99,81178.0,86620.0,86208.56,84397.6,84410.24,84099.99,84433.1,84472.0,83500.01,83663.66,83623.6,84880.05,84518.01,84753.56,86530.0,85766.87,85549.93,83321.81,81754.45,82635.55,82988.36,83773.12,81850.0,83169.0,81682.01,82245.93,81615.64,81491.04,82116.0,81938.4,83028.15,84093.42,81416.09,81189.43,80888.16,80154.09,80150.56,80909.77,81343.5,77991.89,77368.77,77582.02,78354.0,76816.0,77453.86,80504.01,76088.01], at: 90, date: '2026-11-05' }
  };
  var BTC_PRE = 90, BTC_POST = 120;

  function btcChart() {
    var W = 960, H = 300, pl = 58, pr = 92, pt = 20, pb = 34;
    var usd = state.btcUnit === 'usd';
    var keys = ['hype', 'lit', 'now'], data = {};
    keys.forEach(function (k) {
      var r = BTC[k];
      data[k] = usd ? r.closes : r.closes.map(function (v) { return v / r.closes[r.at]; });
    });
    var all = keys.reduce(function (a, k) { return a.concat(data[k]); }, []);
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    var X = function (d) { return pl + ((d + BTC_PRE) / (BTC_PRE + BTC_POST)) * (W - pl - pr); };
    var Y = function (v) { return pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb); };
    var ticks = usd ? Array.from({length: Math.floor(hi / 10000) - Math.ceil(lo / 10000) + 1}, function (_, i) { return (Math.ceil(lo / 10000) + i) * 10000; }) : [0.7, 0.85, 1, 1.15, 1.3];
    var grid = ticks.filter(function (t) { return t > lo && t < hi; })
      .map(function (t) {
        var one = !usd && t === 1;
        return '<line class="tge-grid' + (one ? ' one' : '') + '" x1="' + pl + '" y1="' + Y(t).toFixed(1) +
          '" x2="' + (W - pr) + '" y2="' + Y(t).toFixed(1) + '"/>' +
          '<text class="tge-axis' + (one ? ' one' : '') + '" x="' + (pl - 8) + '" y="' + (Y(t) + 4).toFixed(1) +
          '" text-anchor="end">' + (usd ? '$' + (t / 1000) + 'K' : 'x' + t) + '</text>';
      }).join('');
    var lines = keys.map(function (k) {
      var a = data[k], at = BTC[k].at;
      return '<path class="btc-line ' + k + '" d="' + a.map(function (v, i) {
        return (i ? 'L' : 'M') + X(i - at).toFixed(1) + ' ' + Y(v).toFixed(1);
      }).join(' ') + '"/>';
    }).join('');
    var nowDot = '<circle class="btc-dot" cx="' + X(0).toFixed(1) + '" cy="' +
      Y(data.now[data.now.length - 1]).toFixed(1) + '" r="4"/>';
    var zero = '<line class="btc-zero" x1="' + X(0).toFixed(1) + '" y1="' + pt + '" x2="' +
      X(0).toFixed(1) + '" y2="' + (H - pb) + '"/>';
    /* Both series happen to finish within a couple of percent of each other, so the two
       end labels land on the same line and overprint. Push them apart when they collide. */
    var endY = {};
    ['hype', 'lit'].forEach(function (k) { endY[k] = Y(data[k][data[k].length - 1]) + 4; });
    if (Math.abs(endY.hype - endY.lit) < 13) {
      var mid = (endY.hype + endY.lit) / 2;
      var hiFirst = data.hype[data.hype.length - 1] >= data.lit[data.lit.length - 1];
      endY.hype = mid + (hiFirst ? -7 : 7);
      endY.lit = mid + (hiFirst ? 7 : -7);
    }
    var ends = [['hype', 'HYPE'], ['lit', 'LIT']].map(function (p) {
      return '<text class="tge-end ' + p[0] + '" x="' + (W - pr + 8) + '" y="' +
        endY[p[0]].toFixed(1) + '">' + p[1] + '</text>';
    }).join('');
    var dayLab = [-90, -45, 0, 45, 90, 120].map(function (d) {
      return '<text class="tge-axis' + (d === 0 ? ' one' : '') + '" x="' + X(d).toFixed(1) + '" y="' + (H - 12) +
        '" text-anchor="' + (d === -90 ? 'start' : d === 120 ? 'end' : 'middle') + '">D' +
        (d >= 0 ? '+' : '') + d + '</text>';
    }).join('');
    var step = X(1) - X(0), hover = '';
    for (var d = -BTC_PRE; d <= BTC_POST; d++) {
      var note = keys.map(function (k) {
        var r = BTC[k], price = r.closes[r.at + d];
        if (price == null) return '';
        return (k === 'now' ? 'Latest window' : k.toUpperCase()) + ' · ' + addDays(r.date, d) + ': ' + btcDollar(price);
      }).filter(Boolean).join(' | ');
      hover += '<rect x="' + (X(d) - step / 2).toFixed(2) + '" y="' + pt + '" width="' + (step + .04).toFixed(2) +
        '" height="' + (H - pt - pb) + '" fill="transparent"><title>' + esc(note) + '</title></rect>';
    }
    return '<svg class="tge-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="Bitcoin daily closes around HYPE and LIT TGE and the latest BTC observation, ' +
      (usd ? 'USDT price' : 'indexed to each anchor') + '">' + grid + zero + lines + nowDot + ends + dayLab + hover + '</svg>';
  }

  function btcDollar(v) {
    return v == null ? '—' : '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function btcRunup() {
    var offsets = [-90, -45, 0, 45, 90, 120];
    return '<div class="tp-tablewrap"><table class="tp-table tge-table"><thead><tr><th>BTC close · UTC</th>' +
      offsets.map(function (d) { return '<th>' + (d === 0 ? 'D+0 · Anchor' : 'D' + (d > 0 ? '+' : '') + d) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + [['hype', 'HYPE TGE'], ['lit', 'LIT TGE'], ['now', 'Latest observed close']].map(function (r) {
        var b = BTC[r[0]];
        return '<tr><td class="tp-k"><b>' + r[1] + '</b><small>' + b.date + '</small></td>' + offsets.map(function (d) {
          return '<td class="tp-v' + (d === 0 ? ' now' : '') + '">' + btcDollar(b.closes[b.at + d]) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }


  /* ---- the three listings on one Bitcoin chart ----
     Daily BTC (in $K) and stablecoin dominance since 2020-08-28. The 200-day line and the
     weekly MACD are derived here rather than shipped, so there is one source for them.
     Markers: HYPE listing, LIT TGE, latest BTC close, and the assumed VAR date. */
  var MACRO = {
    start: '2020-08-28',
    btc: '11.5,11.5,11.7,11.7,11.9,11.4,10.1,10.4,10.2,10.3,10.4,10.1,10.2,10.3,10.4,10.4,10.3,10.7,10.8,11,10.9,10.9,11.1,10.9,10.4,10.5,10.2,10.7,10.7,10.7,10.8,10.7,10.8,10.8,10.6,10.6,10.5,10.7,10.8,10.6,10.7,10.9,11.1,11.3,11.4,11.5,11.4,11.4,11.5,11.3,11.4,11.5,11.8,11.9,12.8,13,12.9,13.1,13,13.1,13.6,13.3,13.5,13.6,13.8,13.8,13.5,14,14.1,15.6,15.6,14.8,15.5,15.3,15.3,15.7,16.3,16.3,16.1,16,16.7,17.7,17.8,17.8,18.7,18.7,18.4,18.4,19.2,18.7,17.1,17.1,17.7,18.2,19.7,18.8,19.2,19.4,18.7,19.1,19.4,19.2,18.3,18.5,18.3,18,18.8,19.2,19.3,19.4,21.3,22.8,23.1,23.8,23.5,22.7,23.8,23.2,23.7,24.7,26.5,26.3,27.1,27.4,28.9,28.9,29.3,32.2,33,32,34,36.8,39.4,40.6,40.1,38.1,35.4,34.1,37.4,39.1,36.7,36,35.8,36.6,35.9,35.5,30.9,32.9,32.1,32.3,32.3,32.5,30.4,33.4,34.3,34.3,33.1,33.5,35.5,37.6,36.9,38.3,39.2,38.8,46.4,46.4,44.8,48,47.3,47.2,48.6,47.9,49.1,52.1,51.6,55.9,55.8,57.4,54.1,48.9,49.7,47.1,46.3,46.1,45.1,49.6,48.4,50.3,48.4,48.8,48.9,51,52.4,54.9,55.9,57.8,57.2,61.2,59,55.6,56.9,58.9,57.6,58,58.1,57.4,54.1,54.3,52.3,51.3,55,55.8,55.8,57.6,58.7,58.7,58.7,59,57.1,58.2,59.1,58,56,58.1,58.1,59.8,60,59.9,63.6,63,63.2,61.3,60,56.1,55.6,56.4,53.8,51.7,51.1,50,49.1,54,55,54.8,53.6,57.7,57.8,56.6,57.2,53.2,57.4,56.4,57.3,58.9,58.2,55.8,56.7,49.6,49.7,49.8,46.8,46.4,43.5,42.9,36.7,40.5,37.3,37.5,34.7,38.8,38.3,39.2,38.5,35.7,34.6,35.6,37.3,36.7,37.6,39.2,36.8,35.5,35.8,33.6,33.4,37.4,36.7,37.3,35.5,39,40.5,40.1,38.3,38.1,35.8,35.5,35.6,31.6,32.5,33.7,34.7,31.6,32.3,34.7,34.5,35.9,35,33.5,33.8,34.7,35.3,33.7,34.2,33.9,32.9,33.8,33.5,34.3,33.1,32.7,32.8,31.9,31.4,31.5,31.8,30.8,29.8,32.1,32.3,33.6,34.3,35.4,37.2,39.5,40,40,42.2,41.5,39.8,39.1,38.2,39.7,40.9,42.8,44.6,43.8,46.3,45.6,45.5,44.4,47.8,47.1,47,45.9,44.7,44.7,46.8,49.3,48.8,49.2,49.5,47.7,49,46.8,49.1,48.9,48.8,47,47.1,48.8,49.2,50,49.9,51.8,52.7,46.9,46,46.4,44.9,45.2,46,44.9,47.1,48.1,47.7,47.3,48.3,47.2,43,40.7,43.5,44.9,42.8,42.7,43.2,42.1,41,41.5,43.8,48.1,47.6,48.2,49.2,51.5,55.3,53.8,54,55,54.7,57.5,56,57.4,57.3,61.7,60.9,61.5,62,64.3,66,62.2,60.7,61.3,60.9,63.1,60.3,58.4,60.6,62.3,61.9,61.3,60.9,63.2,62.9,61.4,60.9,61.5,63.3,67.5,66.9,64.9,64.8,64.1,64.4,65.5,63.6,60.1,60.3,56.9,58.1,59.7,58.6,56.2,57.5,57.1,59,53.7,54.7,57.3,57.8,57,57.2,56.5,53.6,49.2,49.4,50.4,50.6,50.5,47.5,47.1,49.4,50.1,46.7,48.3,48.9,47.6,46.1,46.8,46.7,46.9,48.9,48.6,50.8,50.8,50.4,50.8,50.7,47.5,46.5,47.1,46.2,47.7,47.3,46.4,45.8,43.5,43.1,41.6,41.7,41.9,41.8,42.7,43.9,42.6,43.1,43.1,43.1,42.2,42.4,41.7,40.7,36.4,35.1,36.2,36.7,37,36.8,37.2,37.7,38.2,37.9,38.5,38.7,36.9,37.3,41.6,41.4,42.4,43.8,44,44.4,43.5,42.4,42.2,42.1,42.5,44.5,43.9,40.5,40,40.1,38.4,37,38.2,37.2,38.3,39.2,39.1,37.7,43.2,44.4,43.9,42.5,39.1,39.4,38.4,38,38.7,41.9,39.4,38.7,38.8,37.8,39.7,39.3,41.1,40.9,41.8,42.2,41.3,41,42.4,42.9,44,44.3,44.5,46.8,47.1,47.4,47.1,45.5,46.3,45.8,46.4,46.6,45.5,43.2,43.4,42.3,42.8,42.2,39.5,40.1,41.1,39.9,40.6,40.4,39.7,40.8,41.5,41.4,40.5,39.7,39.4,39.5,40.4,38.1,39.2,39.7,38.6,37.6,38.5,38.5,37.7,39.7,36.6,36,35.5,34,30.1,31,29.1,29,29.3,30.1,31.3,29.9,30.4,28.7,30.3,29.2,29.4,30.3,29.1,29.7,29.5,29.2,28.6,29,29.5,31.7,31.8,29.8,30.5,29.7,29.9,29.9,31.4,31.1,30.2,30.1,29.1,28.4,26.6,22.5,22.1,22.6,20.4,20.5,19,20.6,20.6,20.7,20,21.1,21.2,21.5,21,20.7,20.3,20.1,19.9,19.3,19.3,19.3,20.2,20.2,20.6,21.6,21.6,21.6,20.9,20,19.3,20.2,20.6,20.8,21.2,20.8,22.4,23.4,23.2,23.2,22.7,22.5,22.6,21.3,21.3,23,23.8,23.8,23.6,23.3,23.3,23,22.8,22.6,23.3,23,23.2,23.8,23.1,24,23.9,24.4,24.4,24.3,24.1,23.9,23.3,23.2,20.8,21.1,21.5,21.4,21.5,21.4,21.6,20.2,20,19.6,20.3,19.8,20.1,20.1,20,19.8,20,19.8,18.8,19.3,19.3,21.4,21.6,21.8,22.4,20.2,20.2,19.7,19.8,20.1,19.4,19.5,18.9,18.5,19.4,19.3,18.9,18.8,19.2,19.1,19.4,19.6,19.4,19.3,19.1,19.6,20.3,20.2,20,19.5,19.4,19.4,19.1,19.1,19.2,19.4,19.2,19.1,19.3,19.6,19.3,19.1,19,19.2,19.2,19.6,19.3,20.1,20.8,20.3,20.6,20.8,20.6,20.5,20.5,20.2,20.2,21.1,21.3,20.9,20.6,18.5,15.9,17.6,17.1,16.8,16.3,16.6,16.9,16.7,16.7,16.7,16.7,16.3,15.8,16.2,16.6,16.6,16.5,16.5,16.4,16.2,16.4,17.2,17,17.1,16.9,17.1,17,17.1,16.8,17.2,17.1,17.1,17.1,17.2,17.8,17.8,17.4,16.6,16.8,16.7,16.4,16.9,16.8,16.8,16.8,16.8,16.8,16.9,16.7,16.5,16.6,16.6,16.5,16.6,16.7,16.7,16.9,16.8,17,16.9,17.1,17.2,17.4,17.9,18.8,19.9,21,20.9,21.2,21.1,20.7,21.1,22.7,22.8,22.7,22.9,22.6,23.1,23,23.1,23,23.7,22.8,23.1,23.7,23.5,23.4,23.3,22.9,22.8,23.2,23,21.8,21.6,21.9,21.8,21.8,22.2,24.3,23.5,24.6,24.6,24.3,24.8,24.5,24.2,23.9,23.2,23.2,23.6,23.5,23.1,23.6,23.5,22.4,22.3,22.4,22.4,22.2,21.7,20.4,20.2,20.5,22,24.1,24.7,24.3,25,27.4,26.9,28,27.7,28.1,27.3,28.3,27.5,27.5,28,27.1,27.3,28.3,28,28.5,28.5,28.2,27.8,28.2,28.2,28,27.9,27.9,28.3,29.6,30.2,29.9,30.4,30.5,30.3,30.3,29.4,30.4,28.8,28.2,27.3,27.8,27.6,27.5,28.3,28.4,29.5,29.3,29.2,29.2,28.1,28.7,29,28.8,29.5,28.8,28.4,27.7,27.6,27.6,27,26.8,26.8,26.9,27.2,27,27.4,26.8,26.9,27.1,26.7,26.8,27.2,26.3,26.5,26.7,26.9,28.1,27.7,27.7,27.2,26.8,27.2,27.1,27.1,25.7,27.2,26.3,26.5,26.5,25.8,25.9,25.9,25.9,25.1,25.6,26.3,26.5,26.3,26.8,28.3,30,29.9,30.7,30.5,30.5,30.3,30.7,30.1,30.4,30.5,30.6,30.6,31.2,30.8,30.5,29.9,30.3,30.3,30.2,30.4,30.6,30.4,31.5,30.3,30.3,30.2,30.1,29.9,29.9,29.8,29.9,29.8,30.1,29.2,29.2,29.4,29.2,29.3,29.4,29.3,29.2,29.7,29.2,29.2,29.1,29.1,29.1,29.2,29.8,29.6,29.5,29.4,29.4,29.3,29.4,29.2,28.7,26.6,26.1,26.1,26.2,26.1,26.1,26.4,26.2,26.1,26,26.1,26.1,27.7,27.3,25.9,25.8,25.9,26,25.8,25.8,25.8,26.3,25.9,25.9,25.8,25.2,25.8,26.2,26.5,26.6,26.6,26.5,26.8,27.2,27.1,26.6,26.6,26.6,26.2,26.3,26.2,26.4,27,26.9,27,28,27.5,27.4,27.8,27.4,27.9,28,27.9,27.6,27.4,26.9,26.8,26.9,26.9,27.2,28.5,28.4,28.3,28.7,29.7,29.9,30,33.1,33.9,34.5,34.2,33.9,34.1,34.5,34.5,34.6,35.4,34.9,34.7,35.1,35,35,35.4,35.6,36.7,37.3,37.1,37.1,36.5,35.6,37.9,36.2,36.6,36.6,37.4,37.4,35.7,37.4,37.3,37.7,37.8,37.4,37.2,37.8,37.9,37.7,38.7,39.5,40,42,44.1,43.8,43.3,44.2,43.7,43.8,41.3,41.5,42.9,43,41.9,42.3,41.4,42.7,42.3,43.7,43.9,44,43.7,43,43.6,42.5,43.4,42.6,42.1,42.1,42.3,44.2,44.9,42.8,44.2,44.1,44,43.9,47,46.1,46.7,46.3,42.8,42.8,41.7,42.5,43.1,42.8,41.3,41.7,41.7,41.6,39.6,39.9,40.1,40,41.8,42.1,42,43.3,42.9,42.6,43.1,43.2,43,42.6,42.7,43.1,44.4,45.3,47.1,47.8,48.3,49.9,49.7,51.8,51.9,52.1,51.6,52.1,51.8,52.3,51.8,51.3,50.7,51.6,51.7,54.5,57,62.4,61.1,62.4,62,63.1,68.2,63.7,66.1,66.8,68.1,68.3,69,72.1,71.5,73.1,71.4,69.5,65.3,68.4,67.6,61.9,67.8,65.5,63.8,64,67.2,69.9,70,69.5,70.8,69.9,69.6,71.3,69.7,65.5,66,68.5,67.8,68.9,69.4,71.6,69.1,70.6,70,67.1,63.9,65.7,63.4,63.8,61.3,63.5,63.8,64.9,64.9,66.8,66.4,64.3,64.5,63.8,63.5,63.1,63.9,60.7,58.4,59.1,62.9,63.9,64,63.2,62.3,61.2,63.1,60.8,60.8,61.5,62.9,61.6,66.2,65.2,67,66.9,66.3,71.4,70.1,69.2,68,68.5,69.3,68.5,69.4,68.4,67.7,68.4,67.5,67.8,67.8,68.8,70.5,71.1,70.8,69.4,69.3,69.6,69.5,67.3,68.3,66.8,66,66.2,66.7,66.5,65.2,65,64.9,64.1,64.3,63.2,60.3,61.8,60.9,61.7,60.4,61,62.8,62.9,62.1,60.2,57,56.6,58.2,55.9,56.7,58,57.7,57.3,57.9,59.2,60.8,64.7,65,64.1,64,66.7,67.1,68.2,67.5,65.9,65.4,65.8,67.9,67.9,68.2,66.8,66.2,64.6,65.4,61.5,60.7,58.2,54,56,55.1,61.7,60.8,60.9,58.7,59.3,60.6,58.7,57.5,58.9,59.5,58.4,59.4,59,61.2,60.4,64,64.2,64.2,62.8,59.4,59,59.4,59.1,59,57.3,59.1,57.5,58,56.2,54,54.2,54.9,57,57.6,57.3,58.1,60.5,60,59.1,58.2,60.3,61.8,62.9,63.2,63.3,63.6,63.3,64.3,63.2,65.2,65.8,65.9,65.6,63.3,60.8,60.6,60.8,62.1,62.1,62.8,62.2,62.2,60.6,60.3,62.5,63.2,62.9,66.1,67.1,67.6,67.4,68.4,68.4,69,67.4,67.4,66.7,68.2,66.7,67.1,68,70,72.7,72.3,70.3,69.5,69.4,68.8,67.8,69.4,75.6,75.9,76.5,76.7,80.4,88.6,88,90.4,87.3,91,90.6,89.9,90.5,92.3,94.3,98.3,98.9,97.7,97.9,93,92,95.9,95.6,97.5,96.4,97.2,95.8,95.8,98.6,96.9,99.7,99.8,101.1,97.3,96.6,101.1,100,101.4,101.4,104.5,106.1,106.1,100.2,97.5,97.8,97.3,95.2,94.9,98.7,99.4,95.8,94.3,95.3,93.7,92.8,93.6,94.6,97,98.2,98.2,98.4,102.2,97,95.1,92.6,94.7,94.6,94.5,94.5,96.6,100.5,100,104.1,104.6,101.3,102.3,106.1,103.7,103.9,104.9,104.8,102.6,102.1,101.3,103.7,104.7,102.4,100.6,97.7,101.3,97.8,96.6,96.6,96.5,96.4,96.5,97.4,95.8,97.9,96.6,97.5,97.6,96.1,95.8,95.7,96.6,98.3,96.2,96.6,96.3,91.6,88.7,84.2,84.7,84.3,86.1,94.3,86.2,87.3,90.6,89.9,86.8,86.2,80.7,78.6,82.9,83.7,81.1,84,84.3,82.6,84,82.7,86.8,84.2,84.1,83.8,86.1,87.5,87.4,86.9,87.2,84.4,82.6,82.4,82.5,85.2,82.5,83.2,83.9,83.5,78.4,79.2,76.3,82.6,79.6,83.4,85.3,83.8,84.6,83.6,84,84.9,84.5,85.1,85.2,87.5,93.4,93.7,94,94.6,94.6,93.7,95,94.3,94.2,96.5,96.9,95.9,94.3,94.7,96.8,97,103.3,103,104.8,104.1,102.8,104.1,103.5,103.8,103.5,103.1,106.5,105.6,106.8,109.6,111.7,107.3,107.8,109,109.4,108.9,107.8,105.6,104,104.6,105.6,105.9,105.4,104.7,101.5,104.3,105.5,105.7,110.3,110.3,108.7,105.7,106.1,105.4,105.6,106.8,104.5,104.9,104.7,103.3,102.1,101,105.3,106.1,107.3,107,107,107.3,108.4,107.2,105.7,108.8,109.6,108,108.2,109.2,108.3,108.9,111.2,116,117.5,117.4,119.1,119.8,117.8,118.6,119.2,117.9,117.8,117.3,117.4,120,118.8,118.3,117.6,117.9,119.4,118.1,118,117.8,115.8,113.3,112.5,114.2,115.1,114.1,115,117.5,116.7,116.5,119.3,118.7,120.1,123.3,118.3,117.3,117.4,117.4,116.2,112.9,114.3,112.5,116.9,115.4,113.5,110.1,111.8,111.3,112.6,108.4,108.8,108.2,109.2,111.2,111.7,110.7,110.7,110.2,111.1,112.1,111.5,114,115.5,116,115.9,115.3,115.3,116.8,116.5,117.1,115.6,115.7,115.2,112.7,112,113.3,109,109.6,109.6,112.2,114.3,114,118.6,120.5,122.2,122.4,123.5,124.7,121.3,123.3,121.7,112.8,110.6,115,115.2,113,110.8,108.2,106.4,107.2,108.6,110.5,108.3,107.6,110.1,111,111.7,114.6,114.1,112.9,110,108.3,109.6,110.1,110.5,106.6,101.5,103.9,101.3,103.3,102.3,104.7,106,103.1,101.7,99.7,94.6,95.6,94.3,92.2,93,91.6,86.6,85.1,84.7,86.8,88.3,87.4,90.5,91.3,90.9,90.8,90.4,86.3,91.3,93.4,92.1,89.3,89.2,90.4,90.6,92.7,92,92.5,90.3,90.2,88.2,86.4,87.9,86.2,85.5,88.1,88.4,88.7,88.6,87.5,87.7,87.2,87.4,87.9,88,87.2,88.5,87.6,88.8,90,90.6,91.5,93.9,93.7,91.4,91.1,90.6,90.5,91,91.3,95.4,97,95.6,95.6,95.1,93.7,92.6,88.4,89.5,89.6,89.6,89.2,86.7,88.3,89.2,89.3,84.7,84.3,78.7,77,78.7,75.8,73.2,62.9,70.6,69.3,70.3,70.1,68.8,67.1,66.3,68.9,69.8,68.8,68.9,67.5,66.5,67,68,68,67.6,64.7,64.1,68,67.5,65.9,67,65.8,68.8,68.3,72.7,70.9,68.1,67.3,66,68.4,69.9,70.2,70.5,70.9,71.2,72.8,74.9,73.9,71.2,69.9,70.5,68.9,67.9,70.9,70.6,71.3,68.8,66.4,66.4,66,66.8,68.3,68.1,66.9,67,67.3,69,68.9,71.9,71.1,71.8,73,73,70.7,74.4,74.1,74.8,75.2,77.1,75.7,73.8,75.8,76.3,78.2,78.3,77.4,77.6,78.7,77.4,76.3,75.8,76.3,78.2,78.7,78.6,79.9,80.9,81.4,80,80.2,80.7,82.2,81.7,80.5,79.3,81.1,79.1,78.1,77.5,77,76.8,77.6,77.6,75.5,76.8,77.1,77.3,75.9,74.4,73.6,73.5,73.9,73.7,71.4,66.8,64.1,63.9,61.1,60.9,63.3,63.1,61.7,61.5,63.6,63.6,64.5,65.7,66.3,65.7,64.5,63,63.5,64.3,63.3,64,62.7,61.1,59.8,60.1,60,59.6,60.3,58.6,60,61.6,62.6,63.1,63.6,64,63.4,62.3,63.2,64.2,63.8,63.8,62.3,65,64.8,63.8,63.9,64.8,64.7,65.3,66.6,66.1,65.1,64.1,64.4,65.4,63.8,63.9,64,64.8,62.9,62.8,63.6,63.5,64.1,64.7,64.3,64.9,65,64.9,64,63.6,63.5,63.5,63,63.1,62.9,64.5,64.7,69.3,73,78.3,77.1,77.7,79,78.5,79,80.2,77.8,78.2,77.7,78.6,77.4,77.3,81.27037,79.66077,79.83175,80.34183,79.11201,78.4558,78.30643,76.56872,77.2257,77.27873,76.84201,78.18921,75.64448,76.20601,76.41701,80.88387,81.24999,81.178,86.62,86.20856,84.3976,84.41024,84.09999,84.4331,84.472,83.50001,83.66366,83.6236,84.88005,84.51801,84.75356,86.53,85.76687,85.54993,83.32181,81.75445,82.63555,82.98836,83.77312,81.85,83.169,81.68201,82.24593,81.61564,81.49104,82.116,81.9384,83.02815,84.09342,81.41609,81.18943,80.88816,80.15409,80.15056,80.90977,81.3435,77.99189,77.36877,77.58202,78.354,76.816,77.45386,80.50401,76.08801',
    dom: '4.504,4.423,4.461,4.348,4.108,4.013,4.249,4.802,4.737,5.062,4.944,5.019,5.147,5.142,5.085,5.059,5.010,5.221,4.822,5.186,5.211,5.223,5.269,5.304,5.436,5.775,5.708,5.968,5.654,5.631,5.625,5.597,5.626,5.555,5.574,5.713,5.796,5.814,5.743,5.704,5.861,5.828,5.777,5.687,5.585,5.548,5.480,5.527,5.542,5.511,5.619,5.596,5.535,5.505,5.609,5.305,5.231,5.250,5.191,5.240,5.285,5.128,5.314,5.306,5.340,5.283,5.278,5.371,5.318,5.235,4.929,4.846,5.063,4.863,4.903,4.926,4.870,4.802,4.750,4.830,4.885,4.719,4.481,4.475,4.511,4.380,4.245,4.310,4.187,4.064,4.188,4.601,4.586,4.436,4.328,4.110,4.324,4.244,4.202,4.446,4.326,4.293,4.317,4.540,4.458,4.571,4.653,4.523,4.434,4.436,4.453,4.109,3.926,3.905,3.833,3.893,4.052,3.928,4.188,4.084,3.968,3.779,3.768,3.678,3.664,3.552,3.576,3.653,3.508,3.357,3.382,3.261,3.093,2.961,2.967,2.961,3.074,3.347,3.531,3.230,3.084,3.259,3.256,3.283,3.255,3.261,3.296,3.816,3.585,3.648,3.557,3.591,3.599,3.930,3.682,3.641,3.610,3.753,3.693,3.345,3.378,3.459,3.392,3.357,3.509,3.076,3.121,3.173,3.027,3.052,3.079,3.053,3.127,3.128,2.979,2.989,2.861,2.900,2.832,3.018,3.393,3.319,3.517,3.599,3.576,3.749,3.444,3.624,3.468,3.596,3.598,3.576,3.420,3.329,3.247,3.270,3.196,3.259,3.061,3.210,3.405,3.347,3.244,3.316,3.277,3.344,3.384,3.562,3.551,3.714,3.753,3.585,3.556,3.562,3.421,3.366,3.396,3.360,3.413,3.551,3.446,3.461,3.449,3.672,3.518,3.532,3.428,3.430,3.417,3.350,3.338,3.307,3.435,3.519,3.923,4.009,3.937,4.108,4.277,4.331,4.513,4.531,4.118,4.002,4.009,4.022,3.854,3.806,3.915,3.750,4.093,3.760,3.806,3.792,3.685,3.751,3.967,3.775,4.284,4.225,4.067,4.370,4.389,4.777,4.720,6.048,5.426,6.218,6.431,7.120,6.107,6.139,5.878,6.155,6.742,7.038,6.639,6.377,6.487,6.283,6.045,6.450,6.656,6.577,7.016,7.088,6.633,6.829,6.947,7.110,6.631,6.464,6.550,6.804,6.794,7.212,7.331,7.280,8.534,8.504,8.079,7.864,8.588,8.482,7.972,7.853,7.542,7.595,7.947,7.903,7.718,7.550,7.871,7.689,7.726,8.123,7.938,8.032,7.896,8.171,8.342,8.295,8.602,8.776,8.910,8.679,9.014,9.318,8.602,8.505,8.226,8.070,7.954,7.707,7.405,7.343,7.252,6.988,6.978,7.102,7.136,7.305,6.916,6.750,6.541,6.265,6.473,6.151,6.126,6.023,6.172,5.715,5.786,5.736,5.883,6.092,6.040,5.737,5.533,5.605,5.600,5.392,5.749,5.609,5.895,5.575,5.606,5.625,5.774,5.658,5.361,5.386,5.283,5.289,5.163,5.199,5.920,5.913,5.860,6.065,5.989,5.834,6.035,5.815,5.655,5.735,5.902,5.787,5.930,6.583,6.964,6.385,6.235,6.616,6.680,6.636,6.794,6.989,6.884,6.568,6.025,6.002,5.942,5.925,5.724,5.554,5.614,5.631,5.546,5.693,5.519,5.604,5.457,5.414,5.198,5.235,5.208,5.225,5.085,4.905,5.092,5.336,5.071,5.150,4.957,5.066,5.320,5.059,4.934,4.993,5.022,5.041,4.875,4.863,4.983,5.053,4.994,4.916,4.691,4.799,4.975,4.907,4.963,4.964,4.938,5.114,5.465,5.445,5.798,5.574,5.476,5.571,5.771,5.596,5.695,5.536,6.104,6.022,5.795,5.688,5.718,5.714,5.755,6.127,6.563,6.692,6.517,6.577,6.383,6.933,7.141,6.867,6.780,7.382,7.191,7.015,7.171,7.344,7.207,7.278,7.270,7.050,6.987,6.691,6.798,6.747,6.742,6.781,7.205,7.390,7.315,7.403,7.373,7.357,7.466,7.545,8.012,8.074,8.459,8.582,8.444,8.644,8.342,8.069,8.360,8.204,8.188,8.162,8.416,8.474,8.688,8.979,10.005,10.720,10.255,10.456,10.265,10.357,10.373,10.115,10.003,10.086,9.924,9.771,10.228,10.200,9.369,9.299,9.124,8.796,8.877,8.763,9.090,9.486,9.489,9.574,9.459,8.995,9.094,9.811,9.979,10.005,10.455,10.853,10.572,10.794,10.692,10.259,10.279,10.737,9.604,9.433,9.520,9.792,10.475,10.344,10.661,10.749,10.573,9.986,10.482,10.643,10.629,10.881,10.515,10.542,10.109,10.116,9.902,9.795,10.037,9.977,9.714,9.521,9.320,9.320,9.236,8.831,8.798,8.698,8.719,8.944,8.744,8.781,8.630,8.655,8.860,9.396,9.253,9.530,9.397,9.547,10.186,9.987,9.721,9.987,9.862,9.861,10.071,9.816,9.659,9.725,9.970,10.093,10.176,10.230,10.018,10.611,10.363,10.259,10.642,11.035,10.757,10.747,10.933,10.327,11.115,11.220,11.453,11.799,13.105,12.575,12.725,,12.591,12.253,11.796,12.491,12.082,12.935,12.396,12.701,12.590,12.256,12.684,12.522,12.628,13.048,13.352,13.102,12.925,12.085,12.172,12.990,12.678,13.021,12.924,12.914,12.473,12.613,12.842,12.862,13.367,13.909,14.623,16.616,16.539,16.024,17.558,17.295,18.372,17.089,16.925,16.801,17.371,16.466,16.023,15.879,16.272,16.378,16.833,17.047,17.271,17.673,17.618,17.545,16.826,16.935,16.574,15.948,15.997,15.989,16.470,17.209,17.676,16.964,16.530,16.273,15.759,15.988,14.711,14.445,14.707,14.526,14.814,14.856,14.701,15.627,15.654,14.498,13.944,13.910,13.986,14.118,14.223,14.369,14.383,14.394,13.895,14.072,13.947,13.588,13.949,13.420,13.387,13.092,13.069,13.125,13.295,13.381,13.700,13.805,15.145,15.108,14.797,14.835,14.689,14.765,14.593,15.641,15.742,16.095,15.445,15.766,15.593,15.454,15.522,15.589,15.426,15.393,16.063,15.605,15.488,14.553,14.344,14.361,14.285,15.425,15.201,15.812,15.802,15.506,16.319,16.079,16.503,16.872,16.099,16.060,16.272,16.390,16.039,16.125,15.931,15.781,15.744,15.848,16.098,15.687,15.276,15.368,15.488,15.668,15.788,15.713,16.021,16.131,16.005,15.932,15.956,16.078,15.815,15.633,15.717,15.922,15.963,15.825,15.771,15.466,15.611,14.967,14.498,14.777,14.508,14.214,14.345,14.305,14.308,14.611,14.516,13.790,13.771,14.178,14.351,16.005,18.318,16.497,16.904,17.180,17.582,17.306,17.118,17.335,17.359,17.308,17.273,17.891,18.209,17.791,17.157,17.118,17.132,17.121,17.138,17.305,16.950,16.309,16.511,16.384,16.681,16.454,16.565,16.463,16.757,16.390,16.500,16.492,16.579,16.516,16.136,16.157,16.545,17.439,17.244,17.255,17.600,17.087,17.166,17.114,17.062,17.052,17.081,16.980,17.083,17.350,17.274,17.303,17.302,17.249,17.089,17.045,,16.769,16.577,16.600,16.338,16.104,15.937,15.546,15.105,14.548,13.892,13.942,13.829,13.818,14.189,13.901,13.099,13.194,13.162,13.035,13.352,13.044,13.074,12.986,13.079,12.682,13.179,13.005,12.678,12.756,12.610,12.629,12.845,12.960,12.567,12.725,13.435,13.519,13.356,13.447,13.550,13.230,12.311,12.674,12.202,12.172,12.259,12.023,12.230,12.288,12.344,12.704,12.771,12.531,12.560,12.747,12.439,12.585,13.103,13.179,13.157,13.144,13.238,13.537,14.255,14.263,14.025,13.279,12.417,12.142,12.436,12.165,11.365,11.570,11.261,11.473,11.219,11.568,11.201,11.531,11.570,11.382,11.683,11.480,11.175,11.232,11.068,11.075,11.205,11.304,11.081,11.006,11.127,11.168,11.199,11.094,10.749,10.663,10.698,10.454,10.307,10.336,10.262,10.485,10.234,10.852,10.980,11.254,11.120,11.216,11.259,11.030,11.048,10.749,10.795,10.784,10.835,11.202,11.029,10.881,10.969,10.686,10.983,11.115,11.410,11.407,11.405,11.656,11.590,11.619,11.560,11.463,11.522,11.391,11.572,11.530,11.465,11.608,11.540,11.380,11.677,11.637,11.535,11.475,11.082,11.190,11.166,11.309,11.424,11.220,11.285,11.269,11.831,11.353,11.709,11.635,11.649,12.163,12.142,12.154,12.105,12.451,12.407,12.129,12.001,12.071,11.937,11.503,10.968,11.040,10.801,10.873,10.832,10.945,10.796,11.055,10.908,10.667,10.621,10.591,10.473,10.600,10.713,10.916,10.764,10.780,10.821,10.714,10.658,10.713,10.089,10.437,10.446,10.489,10.499,10.564,10.518,10.532,10.496,10.584,10.481,10.747,10.703,10.628,10.665,10.592,10.594,10.627,10.673,10.527,10.696,10.724,10.753,10.739,10.754,10.715,10.544,10.581,10.604,10.598,10.592,10.640,10.563,10.676,10.862,11.593,11.704,11.665,11.609,11.802,11.881,11.670,11.797,11.842,11.872,11.830,11.837,11.336,11.516,11.973,12.036,12.003,11.985,12.007,11.955,11.942,11.777,11.897,11.908,12.008,12.334,12.080,11.941,11.813,11.719,11.726,11.794,11.689,11.535,11.597,11.825,11.790,11.794,11.919,11.859,11.874,11.817,11.562,11.522,11.502,11.153,11.407,11.419,11.350,11.503,11.334,11.361,11.384,11.602,11.648,11.765,11.839,11.771,11.756,11.677,11.301,11.410,11.466,11.405,11.105,10.971,10.885,10.132,9.948,9.845,9.883,9.952,9.903,9.786,9.726,9.689,9.501,9.635,9.638,9.533,9.457,9.374,9.381,9.305,8.969,8.852,8.891,8.891,9.026,9.221,8.760,9.143,9.097,9.110,8.926,8.967,9.413,8.980,8.989,8.933,8.886,8.966,9.057,8.990,9.009,9.012,8.845,8.648,8.576,8.285,8.032,8.104,8.026,7.857,7.933,7.876,8.274,8.215,8.002,7.931,8.169,8.085,8.245,8.090,8.185,7.991,7.836,7.770,7.778,7.876,7.734,7.862,7.670,7.804,7.894,7.894,7.896,7.609,7.595,8.021,7.825,7.923,8.031,8.113,7.691,7.804,7.536,7.529,7.945,7.911,8.120,7.979,7.853,7.966,8.187,8.150,8.151,8.177,8.586,8.653,8.606,8.663,8.363,8.312,8.338,8.126,8.169,8.309,8.221,8.183,8.221,8.295,8.274,8.189,7.998,7.907,7.669,7.606,7.568,7.295,7.342,7.076,7.044,7.051,7.108,7.000,6.973,6.927,7.008,7.060,7.146,7.015,6.941,6.685,6.501,6.126,6.218,6.068,6.035,5.960,5.647,5.968,5.723,5.619,5.577,5.544,5.549,5.348,5.393,5.293,5.400,5.554,5.913,5.654,5.793,6.310,5.767,5.920,6.081,6.056,5.811,5.652,5.651,5.714,5.626,5.674,5.703,5.549,5.739,6.130,6.138,6.010,6.108,6.019,5.949,5.732,5.941,5.853,5.911,6.318,6.771,6.509,6.735,6.769,6.910,6.817,6.739,6.546,6.662,6.503,6.514,6.738,6.722,6.811,6.783,6.808,6.784,7.146,7.286,7.215,6.878,6.818,6.789,6.880,6.988,7.084,6.885,7.116,7.118,7.076,6.979,7.132,6.715,6.823,6.633,6.640,6.734,6.153,6.181,6.263,6.327,6.319,6.256,6.290,6.195,6.263,6.344,6.323,6.373,6.339,6.354,6.302,6.154,6.106,6.155,6.347,6.382,6.345,6.398,6.619,6.499,6.678,6.739,6.674,6.613,6.722,6.868,6.832,6.861,6.906,6.910,7.035,7.246,7.097,7.189,7.056,7.205,7.176,6.988,6.982,7.020,7.278,7.737,7.831,7.577,7.938,7.774,7.633,7.633,7.679,7.559,7.451,7.284,6.861,6.876,6.974,6.978,6.759,6.729,6.631,6.752,6.873,6.961,7.007,6.803,6.822,6.801,6.860,6.916,7.057,7.028,7.478,7.625,7.999,8.605,8.333,8.521,7.683,7.820,7.802,8.087,7.910,7.827,8.030,8.219,8.130,8.050,8.133,8.006,8.065,7.864,7.907,7.528,7.510,7.534,7.725,8.136,8.158,8.162,8.179,8.218,8.469,8.199,8.448,8.385,8.606,8.938,8.865,8.748,8.474,8.399,8.465,8.331,8.096,8.181,8.327,8.441,8.236,8.081,7.903,7.830,7.752,7.782,7.749,7.641,7.790,7.571,7.465,7.477,7.506,7.728,8.079,8.185,8.196,8.003,8.013,7.907,7.982,7.978,8.170,8.176,7.939,7.849,7.887,7.519,7.477,7.440,7.476,7.371,7.367,7.253,7.405,7.427,7.520,7.388,7.642,7.563,7.467,7.294,7.075,7.122,7.340,7.417,7.468,7.562,7.724,7.563,6.998,7.067,6.893,6.776,6.565,6.042,6.133,6.086,6.350,6.116,6.079,6.136,6.029,6.013,6.031,5.757,5.731,5.748,5.749,5.969,6.040,5.794,5.837,5.727,5.666,5.583,5.605,5.554,5.460,5.554,5.394,5.427,5.368,5.743,5.807,5.587,5.618,5.578,5.637,5.501,5.480,5.516,5.872,6.109,6.032,6.138,6.250,6.148,5.954,5.950,6.210,6.271,6.166,6.292,6.305,6.270,6.138,6.016,5.895,5.887,5.900,5.756,6.104,6.205,6.384,6.254,6.220,6.263,6.317,6.172,5.878,5.926,5.741,5.771,6.027,5.963,5.850,5.996,6.004,6.013,6.006,6.142,6.192,6.307,6.194,6.091,6.186,6.391,6.719,6.526,6.879,7.008,7.096,7.139,7.094,7.107,7.042,7.129,6.947,7.032,6.946,6.973,7.062,7.084,7.171,7.088,6.977,7.173,7.087,7.106,7.595,7.693,8.018,7.980,8.055,7.917,7.135,7.952,7.835,7.623,7.684,7.983,8.022,8.575,8.864,8.485,8.407,8.618,8.368,8.294,8.499,8.353,8.467,8.103,8.336,8.390,8.425,8.269,8.139,8.168,8.267,8.223,8.513,8.725,8.763,8.763,8.528,8.865,8.803,8.709,8.744,9.387,9.298,9.607,8.860,9.179,8.819,8.584,8.762,8.702,8.831,8.813,8.747,8.746,8.669,8.680,8.532,8.051,8.027,8.033,8.000,8.002,8.102,8.028,8.152,8.170,8.015,8.003,8.107,8.232,8.195,8.051,8.046,7.479,7.391,7.166,7.260,7.270,7.117,7.223,7.316,7.356,7.416,7.208,7.274,7.226,7.087,6.942,7.253,7.215,7.150,7.148,7.123,7.185,7.334,7.535,7.498,7.437,7.407,7.454,7.523,7.794,7.624,7.531,7.516,7.230,7.158,7.287,7.504,7.555,7.618,7.588,7.527,7.683,7.668,7.676,7.810,7.947,8.066,7.659,7.664,7.621,7.679,7.659,7.620,7.522,7.600,7.750,7.514,7.469,7.610,7.595,7.508,7.577,7.504,7.327,7.052,6.979,6.998,6.896,6.831,6.841,6.777,6.677,6.729,6.715,6.671,6.644,6.554,6.750,6.805,6.795,6.786,6.669,6.797,6.812,6.849,7.005,7.200,7.305,7.169,7.040,7.151,7.078,6.881,6.889,6.835,6.728,6.810,6.635,6.492,6.810,6.906,6.887,6.891,7.006,7.258,7.081,7.194,6.780,6.886,6.966,7.334,7.156,7.222,7.196,7.454,7.437,7.493,7.486,7.331,7.318,7.506,7.447,7.478,7.390,7.316,7.341,7.211,7.119,7.033,7.049,7.123,7.176,7.125,7.076,7.068,7.211,7.193,7.226,7.489,7.555,7.515,7.870,7.768,7.778,7.610,7.517,7.606,7.331,7.200,7.151,7.197,7.143,7.038,7.256,7.150,7.281,8.058,8.175,7.734,7.686,7.900,8.124,8.320,8.472,8.385,8.300,8.164,8.372,8.438,8.258,8.183,8.127,7.902,7.936,8.059,8.191,8.372,8.266,8.226,8.189,8.623,9.011,8.778,9.001,8.744,8.818,8.601,8.511,8.792,8.881,9.049,9.431,9.313,9.445,9.636,9.482,9.667,10.144,10.344,10.386,10.165,9.946,10.025,9.776,9.754,9.812,9.848,9.891,10.392,9.868,9.599,9.764,10.059,10.049,9.971,9.919,9.683,9.754,9.793,10.031,9.996,10.209,10.409,10.292,10.556,10.639,10.289,10.290,10.231,10.246,10.363,10.345,10.429,10.380,10.285,10.273,10.358,10.222,10.283,10.129,9.941,9.877,9.781,9.535,9.507,9.765,9.820,9.883,9.894,9.842,9.818,9.417,9.343,9.525,9.547,9.568,9.723,9.855,10.270,10.118,10.114,10.122,10.155,10.473,10.225,10.076,10.075,10.530,10.632,11.344,11.657,11.408,11.817,12.213,13.940,12.589,12.737,12.702,12.706,12.947,13.245,13.304,12.881,12.646,12.914,12.868,13.040,13.266,13.212,13.004,13.001,13.148,13.668,13.745,12.990,13.087,13.409,13.230,13.420,12.981,13.101,12.486,12.790,13.222,13.354,13.566,13.228,13.003,12.947,12.900,12.845,12.802,12.533,12.140,12.284,12.678,12.921,12.842,13.123,13.284,12.776,12.834,12.710,13.122,13.502,13.489,13.574,13.452,13.207,13.196,13.458,13.461,13.388,13.151,13.173,12.673,12.854,12.770,12.623,12.591,12.949,12.369,12.478,12.362,12.271,12.048,12.306,12.568,12.301,12.253,12.023,12.026,12.107,12.101,11.951,12.141,12.274,12.333,12.310,12.097,12.049,12.058,11.923,11.782,11.696,11.891,11.756,11.738,11.536,11.602,11.776,11.909,11.702,12.007,12.160,12.282,12.328,12.389,12.212,12.194,12.507,12.321,12.298,12.241,12.438,12.628,12.702,12.679,12.567,12.573,12.842,13.585,13.930,14.056,14.753,14.764,14.206,14.249,14.507,14.609,14.158,14.163,13.994,13.742,13.588,13.696,13.878,14.178,14.107,13.974,14.164,14.052,14.308,14.620,14.900,14.740,14.793,14.859,14.642,14.935,14.654,14.284,14.009,13.906,13.864,13.791,13.855,14.061,13.970,13.787,13.855,13.850,14.063,13.553,13.541,13.763,13.775,13.650,13.653,13.529,13.336,13.388,13.645,13.795,13.734,13.494,13.781,13.716,13.717,13.542,13.859,13.899,13.724,13.750,13.683,13.592,13.666,13.583,13.539,13.566,13.676,13.740,13.786,13.766,13.848,13.846,13.882,13.621,13.604,12.708,12.193,11.413,11.565,11.448,11.354,11.468,11.359,11.217,11.527,11.454,11.578,11.452,11.605,11.622,11.144,11.336,11.249,11.154,11.299,11.353,11.425,11.650,11.515,11.501,11.599,11.419,11.780,11.670,11.576,10.990,10.943,10.929,10.381,10.390,10.640,10.598,10.583,10.560,10.596,10.708,10.718,10.690,10.617,10.688,10.631,10.468,10.538,10.582,10.869,11.124,10.995,10.935,10.832,11.138,10.978,11.170,11.087,11.162,11.204,11.139,11.115,10.956,10.842,11.162,11.180,11.217,11.300,11.273,11.163,11.063,11.516,11.512,11.485,11.379,11.543,11.414,11.005,11.582',
    mark: { hype: 1554, lit: 1942, now: 2260 }
  };
  var MACRO_CACHE = null;
  function macro() {
    if (MACRO_CACHE) return MACRO_CACHE;
    var btc = MACRO.btc.split(',').map(Number);
    var dom = MACRO.dom.split(',').map(function (v) { return v === '' ? null : Number(v); });
    /* 200-day simple mean, derived from the same closes as the price line */
    var ma = [], run = 0;
    for (var i = 0; i < btc.length; i++) {
      run += btc[i];
      if (i >= 200) run -= btc[i - 200];
      ma.push(i >= 199 ? run / 200 : null);
    }
    /* weekly MACD 12/26 with a 9-period signal, using completed UTC weeks (Sunday closes) */
    var wk = [], wi = [];
    for (var j = 2; j < btc.length; j += 7) { wk.push(btc[j]); wi.push(j); }
    var ema = function (a, p) {
      var k = 2 / (p + 1), out = [], prev = a[0];
      a.forEach(function (v, n) { prev = n ? v * k + prev * (1 - k) : v; out.push(prev); });
      return out;
    };
    var e12 = ema(wk, 12), e26 = ema(wk, 26);
    var line = wk.map(function (_, n) { return e12[n] - e26[n]; });
    var sig = ema(line, 9);
    var hist = line.map(function (v, n) { return v - sig[n]; });
    MACRO_CACHE = { btc: btc, dom: dom, ma: ma, wi: wi, hist: hist };
    return MACRO_CACHE;
  }


  /* ---- four-year cycle ----------------------------------------------------
     Bitcoin calendar-year returns, K33 Research / BitQuant. The cycle claim is
     that year 1 recovers, year 2 expands into the halving, year 3 peaks and
     year 4 resets - and that where a token lists inside that clock matters as
     much as the token. 2026 is year to date, not a closed year.

     VAR_LISTING is an ASSUMPTION, not an announcement. Every "days to the next
     year 1" figure below is only as good as that date, which is why it is
     labelled on the chart rather than buried. */
  var VAR_LISTING = '2026-12-01';
  var NEXT_Y1 = '2027-01-01';

  var PHASES = {
    1: { k: 'Y1', name: 'Recovery · accumulation' },
    2: { k: 'Y2', name: 'Expansion · halving' },
    3: { k: 'Y3', name: 'Peak · distribution' },
    4: { k: 'Y4', name: 'Bear · reset' }
  };

  var CYCLE_YEARS = [
    { y: 2011, p: 1, r: 1319 }, { y: 2012, p: 2, r: 218 },
    { y: 2013, p: 3, r: 5537 }, { y: 2014, p: 4, r: -57.7 },
    { y: 2015, p: 1, r: 33.7 }, { y: 2016, p: 2, r: 123 },
    { y: 2017, p: 3, r: 1414 }, { y: 2018, p: 4, r: -74.7 },
    { y: 2019, p: 1, r: 94.0 }, { y: 2020, p: 2, r: 308 },
    { y: 2021, p: 3, r: 57.5 }, { y: 2022, p: 4, r: -63.9 },
    { y: 2023, p: 1, r: 157 },  { y: 2024, p: 2, r: 121 },
    { y: 2025, p: 3, r: -6.3 }, { y: 2026, p: 4, r: -13.14, ytd: true },
    { y: 2027, p: 1, r: null }
  ];

  function cycleMarks() { return [
    { k: 'hype', label: 'HYPE', d: '2024-11-29' },
    { k: 'lit',  label: 'LIT',  d: LIT_TGE },
    { k: 'var',  label: 'VAR',  d: state.varListing }
  ]; }

  var dayNum = function (iso) { return Date.parse(iso + 'T00:00:00Z') / 86400000; };
  var daysTo = function (iso, to) { return Math.round(dayNum(to) - dayNum(iso)); };

  /* Same rounding the source tables use: thousands keep a separator and no
     decimal, three figures stay whole, anything under 100 keeps one decimal. */
  function cyclePct(v, ytd) {
    if (v == null) return '—';
    var a = Math.abs(v), body;
    if (a >= 1000) body = Math.round(a).toLocaleString('en-US');
    else if (a >= 100) body = String(Math.round(a));
    else body = a.toFixed(1);
    return (v >= 0 ? '+' : '−') + body + '%' + (ytd ? ' YTD' : '');
  }

  function yearOf(iso) { return Number(iso.slice(0, 4)); }
  function phaseOfYear(y) {
    for (var i = 0; i < CYCLE_YEARS.length; i++) if (CYCLE_YEARS[i].y === y) return CYCLE_YEARS[i].p;
    return 0;
  }

  /* Signed log, one scale for both directions. A linear axis would make +5,537%
     the only visible bar; two different scales for gains and losses would be
     worse than either. Every bar carries its exact figure regardless. */
  function cycleChart() {
    var W = 960, pt = 40, pb = 44, plotH = 190, H = pt + plotH + pb;
    var n = CYCLE_YEARS.length, slot = W / n;
    var mag = function (v) { return Math.log10(1 + Math.abs(v)) * (v < 0 ? -1 : 1); };
    var top = mag(5537), bot = mag(-74.7) * 1.2;
    var zeroY = pt + plotH * (top / (top - bot));
    var Y = function (v) { return pt + plotH * ((top - mag(v)) / (top - bot)); };
    var xMid = function (i) { return slot * (i + 0.5); };

    var groups = '', bars = '', axis = '';
    for (var i = 0; i < n; i++) {
      var c = CYCLE_YEARS[i], x = slot * i, cx = xMid(i);

      /* One tint per four-year block instead of a boxed frame each. The block is a
         grouping cue, not a thing to read, so it stays behind everything. */
      if (c.p === 1 && i + 3 < n && CYCLE_YEARS[i + 3].r != null) {
        if ((i / 4) % 2 === 1) {
          groups += '<rect class="cy-group" x="' + x.toFixed(1) + '" y="' + pt +
            '" width="' + (slot * 4).toFixed(1) + '" height="' + plotH + '"/>';
        }
        groups += '<text class="cy-group-t" x="' + (x + 6).toFixed(1) + '" y="' + (pt - 8) + '">' +
          c.y + '–' + (c.y + 3) + '</text>';
      }

      /* The trailing year has no bar yet; the axis beneath it already says 2027 · Y1, so
         there is nothing worth writing into the plot. */
      if (c.r != null) {
        var y0 = Y(c.r), bw = slot * 0.5, up = c.r >= 0;
        /* Colour carries the outcome, not the phase. Four phase colours meant decoding a
           legend to see the point; two means the pattern - every red bar is a Y4 - is the
           first thing you see, and the one exception in 2025 shows up just as fast. */
        bars += '<rect class="cy-bar ' + (up ? 'gain' : 'loss') + '" x="' + (cx - bw / 2).toFixed(1) +
          '" y="' + Math.min(y0, zeroY).toFixed(1) + '" width="' + bw.toFixed(1) +
          '" height="' + Math.max(1.5, Math.abs(zeroY - y0)).toFixed(1) + '" rx="2">' +
          '<title>' + c.y + ' · ' + PHASES[c.p].k + ' ' + PHASES[c.p].name + ' · ' +
          cyclePct(c.r, c.ytd) + '</title></rect>' +
          '<text class="cy-val' + (up ? '' : ' dn') + '" x="' + cx.toFixed(1) + '" y="' +
          (up ? y0 - 6 : y0 + 13).toFixed(1) + '" text-anchor="middle">' +
          cyclePct(c.r) + (c.ytd ? '*' : '') + '</text>';
      }

      axis += '<text class="cy-year" x="' + cx.toFixed(1) + '" y="' + (H - pb + 17) +
        '" text-anchor="middle">' + c.y + '</text>' +
        '<text class="cy-phase p' + c.p + '" x="' + cx.toFixed(1) + '" y="' + (H - pb + 33) +
        '" text-anchor="middle">' + PHASES[c.p].k + '</text>';
    }

    /* Just the ticker. The exact dates are on the three cards directly below, so repeating
       them here only made three long labels fight for the same corner. */
    var marks = cycleMarks().map(function (m) {
      var y = yearOf(m.d), ix = -1;
      for (var i = 0; i < n; i++) if (CYCLE_YEARS[i].y === y) ix = i;
      if (ix < 0) return '';
      var frac = (dayNum(m.d) - dayNum(y + '-01-01')) / 365;
      var mx = slot * (ix + frac);
      return '<line class="cy-mark ' + m.k + '" x1="' + mx.toFixed(1) + '" y1="' + (pt - 4) +
        '" x2="' + mx.toFixed(1) + '" y2="' + (pt + plotH) + '"/>' +
        '<text class="cy-mark-t ' + m.k + '" x="' + mx.toFixed(1) + '" y="' + (pt - 10) +
        '" text-anchor="middle">' + m.label + '</text>';
    }).join('');

    return '<svg class="tge-chart cycle-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="Bitcoin calendar-year returns grouped into four-year cycles, with the three listing dates marked">' +
      groups +
      '<line class="tge-grid" x1="0" y1="' + zeroY.toFixed(1) + '" x2="' + W + '" y2="' + zeroY.toFixed(1) + '"/>' +
      bars + marks + axis + '</svg>';
  }

  function addDays(iso, n) {
    return new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10);
  }

  function launchWindow(date) {
    var runs = [];
    for (var d = 1; d <= 30; d++) {
      var day = addDays(date, d), phase = phaseOfYear(yearOf(day));
      var prev = runs[runs.length - 1];
      if (prev && prev.phase === phase) prev.count++;
      else runs.push({ phase: phase, count: 1 });
    }
    return runs;
  }

  function cycleScenario() {
    var date = state.varListing;
    var left = daysTo(date, NEXT_Y1);
    var compare = function (label, start) {
      var runs = launchWindow(start);
      return '<div class="cy-window"><div><b>' + label + '</b><small>TGE ' + start + ' · Y' + phaseOfYear(yearOf(start)) + '</small></div>' +
        '<div><div class="cy-window-track" aria-hidden="true">' + runs.map(function (r) {
          return '<span class="cy-window-segment p' + r.phase + '" style="grid-column:span ' + r.count + '"></span>';
        }).join('') + '</div><small>' + addDays(start, 1) + ' → ' + addDays(start, 30) + ' · ' +
        runs.map(function (r) { return 'Y' + r.phase + ': ' + r.count + 'd'; }).join(' / ') + '</small></div></div>';
    };
    return '<section class="cy-scenario" aria-label="VAR TGE cycle position"><div class="cy-scenario-head"><div>' +
      '<span class="tp-eyebrow">VAR TGE · BITCOIN CYCLE</span><h3>Where would VAR launch?</h3></div>' +
      '<div class="tp-chips" aria-label="Assumed VAR TGE date">' +
      [['2026-12-01','Dec 1'],['2026-12-31','Dec 31']].map(function (v) {
        return '<button type="button" data-var-listing="' + v[0] + '" aria-pressed="' + (date === v[0]) +
          '" class="' + (date === v[0] ? 'on' : '') + '">' + v[1] + '</button>';
      }).join('') + '</div></div><p class="cy-scenario-status"><strong>Late Y4</strong> · ' + date +
      ' → <strong>' + left + (left === 1 ? ' day' : ' days') + '</strong> to Y1 · 2027-01-01</p>' +
      '<p class="cy-scenario-note">D+1 to D+30 · same window after each launch</p>' +
      compare('VAR scenario', date) + compare('LIT actual TGE', LIT_TGE) +
      '<p class="cy-scenario-note">VAR dates are scenarios. Y1 is a calendar classification; it does not predict a rebound.</p></section>';
  }

  function cycleCards() {
    return cycleMarks().map(function (m) {
      var y = yearOf(m.d), p = phaseOfYear(y), left = daysTo(m.d, NEXT_Y1);
      var late = left <= 60 ? 'Late ' : '';
      return '<article class="cy-card ' + m.k + '">' +
        '<span class="tp-tag">' + m.label + ' · ' + m.d + '</span>' +
        '<b>' + late + 'Year ' + p + '</b>' +
        '<em>' + left + ' days to the next Year 1</em></article>';
    }).join('');
  }

  function cycleTable() {
    var rows = '';
    for (var i = 0; i + 3 < CYCLE_YEARS.length; i += 4) {
      var g = CYCLE_YEARS.slice(i, i + 4);
      if (g[3].r == null) break;
      rows += '<tr><td class="tp-k"><b>' + g[0].y + '–' + String(g[3].y).slice(2) + '</b></td>' +
        g.map(function (c) {
          return '<td class="tp-v' + (c.r < 0 ? ' loss' : ' gain') + '">' + cyclePct(c.r, c.ytd) + '</td>';
        }).join('') + '</tr>';
    }
    return '<div class="tp-tablewrap"><table class="tp-table cy-table"><thead><tr><th>Cycle</th>' +
      '<th>Year 1</th><th>Year 2</th><th>Year 3</th><th>Year 4</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function cycleLegend() {
    return '<div class="cy-legend">' + [1, 2, 3, 4].map(function (p) {
      return '<span class="p' + p + '"><i></i><b>' + PHASES[p].k + '</b>' + PHASES[p].name + '</span>';
    }).join('') + '</div>';
  }

  var ZOOMS = [
    { k: 'all', label: 'All' },
    { k: 'hype', label: 'Around HYPE listing' },
    { k: 'lit', label: 'Around LIT listing' },
    { k: 'now', label: 'Now' }
  ];

  /* The assumed VAR listing sits past the end of the price history, so the axis has to
     run further than the data does. The price path simply stops where the data stops. */
  function macroSpan() {
    var n = macro().btc.length;
    var vi = Math.round(dayNum(state.varListing) - dayNum(MACRO.start));
    return { n: n, varIx: vi, end: Math.max(n - 1, vi + 14) };
  }

  function zoomRange(k) {
    var S = macroSpan();
    if (k === 'all') return [0, S.end];
    var c = k === 'lit' ? daysTo(MACRO.start, LIT_TGE) : MACRO.mark[k];
    return [Math.max(0, c - 180), Math.min(S.end, c + 180)];
  }

  function macroChart() {
    var M = macro(), R = zoomRange(state.zoom);
    var a = R[0], b = R[1], span = b - a;
    var W = 960, pl = 54, pr = 58;
    /* pt carries two rows of marker labels now: today and the assumed VAR listing are
       only weeks apart and cannot share one. */
    var priceH = 210, domH = 62, macdH = 54, gap = 12, pt = 34, pb = 26;
    var H = pt + priceH + gap + domH + gap + macdH + pb;
    var X = function (i) { return pl + ((i - a) / Math.max(1, span)) * (W - pl - pr); };

    var slice = M.btc.slice(a, Math.min(b, M.btc.length - 1) + 1);
    var lo = Math.min.apply(null, slice), hi = Math.max.apply(null, slice);
    var L = Math.log10(lo * 0.92), Hh = Math.log10(hi * 1.08);
    var Yp = function (v) { return pt + (1 - (Math.log10(v) - L) / (Hh - L)) * priceH; };
    var line = function (arr, from) {
      var d = '', started = false;
      for (var i = a; i <= b; i++) {
        var v = arr[i];
        if (v == null || !isFinite(v)) { started = false; continue; }
        d += (started ? 'L' : 'M') + X(i).toFixed(1) + ' ' + from(v).toFixed(1) + ' ';
        started = true;
      }
      return d;
    };
    var money = function (v) { return '$' + (v >= 100 ? Math.round(v) : v.toFixed(1)) + 'K'; };
    var priceAxis = [lo, (lo + hi) / 2, hi].map(function (v, i) {
      return '<text class="tge-axis" x="' + (pl - 7) + '" y="' + (Yp(v) + (i === 0 ? 0 : 4)).toFixed(1) +
        '" text-anchor="end">' + money(v) + '</text>';
    }).join('');

    var dTop = pt + priceH + gap;
    var ds = M.dom.slice(a, b + 1).filter(Number.isFinite);
    if (!ds.length) ds = [0, 1];
    var lastDom = Math.min(b, M.dom.length - 1);
    while (lastDom >= a && M.dom[lastDom] == null) lastDom--;
    var dlo = Math.min.apply(null, ds), dhi = Math.max.apply(null, ds);
    var Yd = function (v) { return dTop + (1 - (v - dlo) / Math.max(0.01, dhi - dlo)) * domH; };

    var mTop = dTop + domH + gap;
    var hw = M.hist.filter(function (_, n) { return M.wi[n] >= a && M.wi[n] <= b; });
    var hmax = Math.max.apply(null, [1e-9].concat(hw.map(Math.abs)));
    var zeroY = mTop + macdH / 2;
    var bars = M.wi.map(function (day, n) {
      if (day < a || day > b) return '';
      var v = M.hist[n], h = (Math.abs(v) / hmax) * (macdH / 2 - 2);
      var w = Math.max(1.4, (W - pl - pr) / Math.max(1, span / 7) * 0.6);
      return '<rect class="mc-hist ' + (v >= 0 ? 'up' : 'dn') + '" x="' + (X(day) - w / 2).toFixed(1) +
        '" y="' + (v >= 0 ? zeroY - h : zeroY).toFixed(1) + '" width="' + w.toFixed(1) +
        '" height="' + Math.max(0.8, h).toFixed(1) + '"/>';
    }).join('');

    /* Cycle bands behind the price, one tint per phase year. This is the same clock the
       cycle panel below scores; drawing it here is what makes "LIT listed into a year 4"
       something you can see rather than something you have to take on trust. */
    var d0m = dayNum(MACRO.start), cyc = '';
    CYCLE_YEARS.forEach(function (c) {
      var s0 = Math.round(dayNum(c.y + '-01-01') - d0m);
      var s1 = Math.round(dayNum((c.y + 1) + '-01-01') - d0m);
      var from = Math.max(s0, a), to = Math.min(s1, b);
      if (to <= from) return;
      var x0 = X(from), x1 = X(to), w = x1 - x0;
      cyc += '<rect class="mc-cyc p' + c.p + '" x="' + x0.toFixed(1) + '" y="' + pt +
        '" width="' + w.toFixed(1) + '" height="' + priceH + '"/>';
      /* the first band is a part-year at the left edge, where the row tag already sits */
      if (w < 34 || x0 + w / 2 < pl + 48) return;
      cyc += '<text class="mc-cyc-k p' + c.p + '" x="' + (x0 + w / 2).toFixed(1) + '" y="' + (pt + 12) +
        '" text-anchor="middle">' + PHASES[c.p].k + '</text>';
      if (w < 78) return;
      cyc += '<text class="mc-cyc-n p' + c.p + '" x="' + (x0 + w / 2).toFixed(1) + '" y="' + (pt + 24) +
        '" text-anchor="middle">' + PHASES[c.p].name + '</text>';
    });

    var VIX = macroSpan().varIx;
    var boundary = daysTo(MACRO.start, NEXT_Y1);
    var phaseEdge = boundary >= a && boundary <= b ?
      '<line class="mc-mark hype" stroke-dasharray="2 3" x1="' + X(boundary) + '" x2="' + X(boundary) +
      '" y1="' + pt + '" y2="' + (pt + priceH) + '"/>' : '';
    var marks = ['hype', 'lit', 'now', 'var'].map(function (k) {
      var i = k === 'var' ? VIX : k === 'lit' ? daysTo(MACRO.start, LIT_TGE) : MACRO.mark[k];
      if (i < a || i > b) return '';
      var lbl = k === 'now' ? BTC_ASOF.slice(5) + ' BTC close' : k === 'var' ? 'VAR scenario' : k === 'lit' ? 'LIT TGE' : k.toUpperCase();
      return '<line class="mc-mark ' + k + '" x1="' + X(i).toFixed(1) + '" y1="' + pt +
        '" x2="' + X(i).toFixed(1) + '" y2="' + (mTop + macdH) + '"/>' +
        '<text class="mc-mark-t ' + k + '" x="' + X(i).toFixed(1) + '" y="' +
        (k === 'var' ? pt - 20 : pt - 5) + '" text-anchor="' + (k === 'now' ? 'end' : 'middle') + '">' + lbl + '</text>';
    }).join('');

    var years = '';
    var d0 = new Date(MACRO.start + 'T00:00:00Z');
    for (var y = 2021; y <= 2027; y++) {
      var di = Math.round((Date.UTC(y, 0, 1) - d0.getTime()) / 86400000);
      if (di < a || di > b) continue;
      years += '<text class="tge-axis" x="' + X(di).toFixed(1) + '" y="' + (H - 8) +
        '" text-anchor="middle">\u2019' + String(y).slice(2) + '</text>';
    }

    return '<svg class="tge-chart macro-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="Bitcoin, stablecoin dominance and weekly MACD with listing and data-date markers">' +
      '<text class="mc-tag" x="' + pl + '" y="' + (pt + 10) + '">BTC</text>' +
      '<path class="mc-price" d="' + line(M.btc, Yp) + '"/>' +
      '<path class="mc-ma" d="' + line(M.ma, Yp) + '"/>' + priceAxis +
      '<text class="mc-tag" x="' + pl + '" y="' + (dTop + 10) + '">STABLE.D</text>' +
      '<path class="mc-dom" d="' + line(M.dom, Yd) + '"/>' +
      (lastDom < a ? '' : '<text class="tge-axis" x="' + X(lastDom).toFixed(1) +
        '" y="' + (Yd(M.dom[lastDom]) - 6).toFixed(1) + '" text-anchor="end">' +
        M.dom[lastDom].toFixed(2) + '%</text>') +
      '<text class="mc-tag" x="' + pl + '" y="' + (mTop + 10) + '">MACD</text>' +
      '<line class="tge-grid" x1="' + pl + '" y1="' + zeroY + '" x2="' + (W - pr) + '" y2="' + zeroY + '"/>' +
      cyc + bars + phaseEdge + marks + years + '</svg>';
  }

  var state = { fdv: 3.0e9, zoom: 'all', varListing: '2026-12-31', btcUnit: 'usd' };

  function bigUsd(v) {
    return v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : '$' + Math.round(v / 1e6) + 'M';
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function bandFor(fdv) {
    for (var i = 0; i < BANDS.length; i++) if (fdv <= BANDS[i].max) return BANDS[i];
    return BANDS[BANDS.length - 1];
  }
  function tally() {
    var h = 0, l = 0;
    METRICS.forEach(function (m) {
      if (Math.abs(m.n - m.h) <= Math.abs(m.n - m.l)) h += m.w; else l += m.w;
    });
    return { hype: h, lit: l };
  }

  function render() {
    var host = document.querySelector('[data-tg="paths"]');
    if (!host) return;
    var t = tally();
    var band = bandFor(state.fdv);
    var lean = t.lit > t.hype ? 'LIT' : 'HYPE';
    var total = t.hype + t.lit;

    var rows = METRICS.map(function (m) {
      var dh = Math.abs(m.n - m.h), dl = Math.abs(m.n - m.l);
      var side = dh <= dl ? 'hype' : 'lit';
      return '<tr class="tp-row ' + side + '">' +
        '<td class="tp-k"><b>' + esc(m.k) + '</b><small>' + esc(m.why) + '</small></td>' +
        '<td class="tp-v' + (side === 'hype' ? ' win' : '') + '">' + esc(m.f(m.h)) + '</td>' +
        '<td class="tp-v' + (side === 'lit' ? ' win' : '') + '">' + esc(m.f(m.l)) + '</td>' +
        '<td class="tp-v now">' + esc(m.f(m.n)) + '</td>' +
        '<td class="tp-side ' + side + '">' + (side === 'hype' ? 'HYPE' : 'LIT') +
          (m.w > 1 ? '<i>×' + m.w + '</i>' : '') + '</td></tr>';
    }).join('');

    var chips = FDV_CHIPS.map(function (c) {
      return '<button type="button" data-fdv="' + c.v + '"' +
        (Math.abs(c.v - state.fdv) < 1 ? ' class="on"' : '') + '>' + esc(c.label) + '</button>';
    }).join('');

    var listings = ['hype', 'lit'].map(function (k) {
      var L = LISTINGS[k];
      var F = L.founder;
      /* the face sits on its initials: if the photo is missing the initials show through */
      return '<article class="tp-listing ' + k + '">' +
        '<div class="tp-id"><img class="tp-logo" src="' + esc(L.logo) + '" alt="' + esc(L.who) + ' logo" width="40" height="40">' +
        '<span class="tp-tag">' + esc(L.label) + ' · ' + esc(L.who) + '</span>' +
        '<a class="tp-founder" href="https://x.com/' + esc(F.handle) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="tp-face"><i>' + esc(F.initials) + '</i><img src="' + esc(F.img) + '" alt="' + esc(F.name) + '" width="44" height="44"></span>' +
        '<span class="tp-fname"><strong>' + esc(F.name) + '</strong><small>' + esc(F.role) + ' · @' + esc(F.handle) + '</small></span></a></div>' +
        '<b>' + bigUsd(L.fdv) + '</b><em><i>FDV at listing</i> · ' + esc(L.tge) + '</em>' +
        '<p>' + esc(L.shape) + '</p><small>' + esc(L.note) + '</small></article>';
    }).join('');

    host.innerHTML =
      '<div class="cmp-heading"><span class="cmp-eyebrow">TWO PATHS</span>' +
      '<h2>Does it go like HYPE, or like LIT?</h2>' +
      '<p>Only two comparable exchanges have actually listed a token. This reads Variational against both and says which shape the listing is more likely to rhyme with. It carries no plan and no recommended action — just the odds and what they rest on.</p></div>' +

      cycleScenario() +
      '<section class="tp-verdict"><div class="tp-verdict-main">' +
      '<span class="tp-eyebrow">The call</span>' +
      '<h3><em>The business looks like</em> <b class="h">HYPE</b>. ' +
      '<em>The early listing price looks like</em> <b class="l">LIT</b>.</h3>' +
      '<p>Volume, open interest, listed markets and disclosed profit are all growing together — that is the HYPE shape. But $61.8M raised, roughly 50% of supply to insiders, and an unannounced day-one float make a straight HYPE-style run hard to assume. Those two readings point in different directions, so they are scored separately below.</p>' +
      '</div><div class="tp-verdict-side">' +
      '<div class="tp-score"><span>September 5 macro snapshot resembled</span><strong>' + lean + '</strong>' +
      '<small>' + t.hype + ' – ' + t.lit + ' / ' + total + ' <i>weighted points</i></small></div>' +
      '<div class="tp-score"><span><i>Listing FDV</i> ' + bigUsd(state.fdv) + '</span><strong>' + band.hype + '% / ' + band.lit + '%</strong>' +
      '<small>HYPE shape / LIT shape</small></div></div></section>' +

      '<div class="bw-head"><b>The Two Listings, On The Record</b><span>what actually happened to each</span></div>' +
      '<div class="tp-listings">' + listings + '</div>' +

      '<div class="bw-head"><b>What Each One Actually Did</b><span><i>change from its own listing price · first 258 days · log scale</i></span></div>' +
      '<div class="tge-legend"><span class="hype"><i></i>HYPE · Hyperliquid</span><span class="lit"><i></i>LIT · Lighter</span>' +
      '<span class="ref"><i></i><em>0% = listing price</em></span>' +
      '<span class="swing"><b class="dn">\u25bc</b><em>swing high</em><b class="up">\u25b2</b><em>swing low</em></span>' +
      '<span class="band up"><i></i><em>above listing price</em></span>' +
      '<span class="band dn"><i></i><em>below listing price</em></span></div>' +
      tgeChart() + milestones() +
      '<div class="bw-head"><b>Each One Against Bitcoin</b><span><i>both indexed to 1.00 on the listing day \u00b7 same 258-day window</i></span></div>' +
      '<div class="tge-legend"><span class="btcref"><i></i>Bitcoin</span>' +
      '<span class="hype"><i></i>HYPE</span><span class="lit"><i></i>LIT</span></div>' +
      overlayChart() +
      '<div class="tp-note"><b>Beta</b> is how much the token moved per 1% Bitcoin move, <b>correlation</b> how tightly the two moved together, both from daily log returns over the window. This is what separates the two listings: one rose while Bitcoin fell, the other did not.</div>' +
      '<div class="tp-note"><b>Arrows mark the swing turns</b> — down above a high, up below a low — and each carries the run of the previous 30 days, so every figure on the plot is the same kind of number and none of them can be mistaken for the axis, which reads change since listing. Inside the first 30 days the label measures from the listing price and says the span it covers. A turn is only recorded once the price reversed more than 28% from its running extreme, so noise never becomes a signal. Hover any arrow for its exact day and level. Both curves are cut to 258 days — Lighter\'s full life so far — so the two are read over the same window. Over its own longer run HYPE went on to ×27.5. Day 0 is each listing day, not a shared calendar date: the macro table above is what puts them on the same clock.</div>' +

      '<div class="bw-head"><b>The Three Listings On One Bitcoin Chart</b><span><i>where each listing sits in Bitcoin\'s own history</i></span></div>' +
      '<div class="tp-chips zoomchips"><span>Zoom</span>' + ZOOMS.map(function (z) {
        return '<button type="button" data-zoom="' + z.k + '"' +
          (state.zoom === z.k ? ' class="on"' : '') + '>' + z.label + '</button>';
      }).join('') + '</div>' +
      macroChart() +
      '<div class="tp-note"><b>BTC close &amp; 200-day average: ' + BTC_ASOF + ' UTC · STABLE.D: ' + DOM_ASOF + ' UTC · weekly MACD: ' +
      new Date((dayNum(MACRO.start) + macro().wi.slice(-1)[0]) * 86400000).toISOString().slice(0, 10) + ' UTC.</b> ' +
      'Recent BTC closes: <a href="https://www.binance.com/en/trade/BTC_USDT" target="_blank" rel="noopener noreferrer">Binance BTCUSDT</a>. ' +
      'STABLE.D = <a href="https://defillama.com/stablecoins" target="_blank" rel="noopener noreferrer">DefiLlama USD-pegged circulating supply</a> / ' +
      '<a href="https://coinmarketcap.com/charts/" target="_blank" rel="noopener noreferrer">CoinMarketCap total crypto market cap</a> at UTC midnight. Missing dates are left blank.</div>' +
      '<div class="tp-note"><b>Orange</b> is Bitcoin on a log scale, <b>dashed grey</b> the 200-day line, <b>the middle strip</b> the share of the market sitting in stablecoins, and the bottom strip is the weekly MACD. The tinted bands behind the price are the four-year cycle years scored below. The vertical lines are HYPE\'s listing, LIT\'s TGE, the latest BTC close, and the assumed VAR listing on ' + state.varListing + '. Zoom to either listing to see the shape each one launched into.</div>' +

      '<section class="cy-claim"><span class="tp-eyebrow">The cycle claim</span>' +
      '<h3>LIT\'s post-listing path should not be copied onto VAR</h3>' +
      '<p>LIT listed at the end of a Year 3 and walked straight into the Year 4 that has historically been the weak one. VAR would list at the end of a Year 4, with the next recovery Year 1 in front of it. The four-year-cycle argument is simply that the two listings start pointed in opposite directions.</p></section>' +
      cycleLegend() + cycleChart() +
      '<div class="cy-foot">* 2026 is year to date, not a closed year.</div>' +
      '<div class="cy-cards">' + cycleCards() + '</div>' +
      '<div class="tp-note"><b>How to read it.</b> All three completed Year 4s were negative — \u221257.7%, \u221274.7%, \u221263.9%. But 2025 was a Year 3 and closed at \u22126.3%, which breaks the "years one to three always rise" half of the pattern, so this is a tendency and not a rule. Bars use one signed log scale in both directions, because a linear axis would leave +5,537% as the only bar you could see; every bar carries its own figure. VAR\'s listing date is an assumption, not an announcement — the countdown moves with it. The claim that VAR lists closer to a recovery than LIT did is defensible on this evidence. It is not a guarantee, and four observations is not a sample. <i>Annual returns: K33 Research · BitQuant.</i></div>' +

      '<div class="bw-head"><b>Bitcoin At Each Listing</b><span><i>Daily UTC close · D−90 to D+120</i></span></div>' +
      '<div class="tp-chips" aria-label="Bitcoin chart units"><span>BTC price</span>' +
      [['usd','USDT price'],['index','Indexed ×']].map(function (v) {
        return '<button type="button" data-btc-unit="' + v[0] + '" aria-pressed="' + (state.btcUnit === v[0]) +
          '" class="' + (state.btcUnit === v[0] ? 'on' : '') + '">' + v[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="tge-legend"><span class="hype"><i></i>BTC around HYPE listing</span>' +
      '<span class="lit"><i></i>BTC around LIT listing</span>' +
      '<span class="now"><i></i>BTC into latest close · ' + BTC_ASOF + '</span></div>' +
      btcChart() + btcRunup() +
      '<div class="tp-note">Hover any day for each series’ actual <a href="https://www.binance.com/en/trade/BTC_USDT" target="_blank" rel="noopener noreferrer">Binance BTCUSDT</a> close. The blue series ends at the latest observed close; VAR’s assumed TGE price is not available.</div>' +

      '<div class="bw-head"><b>Macro Conditions: Historical Snapshot</b><span><i>each row goes to the listing the September snapshot sat closer to</i> · ' + ASOF + '</span></div>' +
      '<div class="tp-tablewrap"><table class="tp-table hl-cols"><thead><tr>' +
      '<th>Condition</th><th>HYPE listing day</th><th>LIT listing day</th><th>Snapshot</th><th>Closer to</th>' +
      '</tr></thead><tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td>Weighted tally</td><td class="tp-v' + (t.hype > t.lit ? ' win' : '') + '">' + t.hype + '</td>' +
      '<td class="tp-v' + (t.lit > t.hype ? ' win' : '') + '">' + t.lit + '</td><td colspan="2">' +
      esc(lean) + ' by ' + Math.abs(t.hype - t.lit) + '</td></tr></tfoot></table></div>' +
      '<div class="tp-note">Momentum and the stablecoin trend carry double weight because they moved the most between the two listings. The September snapshot did not closely match either environment.</div>' +

      '<div class="bw-head"><b>Where The Listing Price Lands</b><span>the higher it opens, the less room is left above it</span></div>' +
      '<div class="tp-chips"><span>Listing FDV</span>' + chips + '</div>' +
      '<div class="tp-bands">' + BANDS.map(function (b) {
        var on = b === band;
        var ceil = b.max === Infinity ? '<i>above</i> $4.5B' : '<i>up to</i> ' + bigUsd(b.max);
        return '<article class="tp-band' + (on ? ' on' : '') + '">' +
          '<span>' + ceil + '</span><b>' + b.hype + '% / ' + b.lit + '%</b>' +
          '<em>' + esc(b.label) + '</em><p>' + esc(b.why) + '</p></article>';
      }).join('') + '</div>' +

      '<div class="tp-caveat"><b>What would change this call</b>' +
      '<p>Token allocation, lockup schedule and day-one float are not published yet. All three move the listing-price side directly, and the split above has to be recomputed once they are known. The macro side is a snapshot and drifts with the market. Nothing here is a price target.</p></div>';

    /* CSP has script-src-attr 'none', so a missing photo is dropped here rather than by onerror */
    host.querySelectorAll('.tp-face img').forEach(function (img) {
      img.addEventListener('error', function () { img.remove(); });
      if (img.complete && !img.naturalWidth) img.remove();
    });
    host.querySelectorAll('.tp-chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.varListing) state.varListing = b.dataset.varListing;
        else if (b.dataset.btcUnit) state.btcUnit = b.dataset.btcUnit;
        else if (b.dataset.zoom) state.zoom = b.dataset.zoom;
        else state.fdv = Number(b.dataset.fdv) || 3.0e9;
        render();
        if (b.dataset.varListing) host.querySelector('[data-var-listing="' + state.varListing + '"]').focus({ preventScroll: true });
        if (b.dataset.btcUnit) host.querySelector('[data-btc-unit="' + state.btcUnit + '"]').focus({ preventScroll: true });
      });
    });
  }

  function mount() {
    if (document.querySelector('[data-tg="paths"]')) return;
    var main = document.querySelector('#main');
    if (!main) return;
    var sec = document.createElement('section');
    sec.className = 'paths-report tsec tg-hide';
    sec.setAttribute('data-tg', 'paths');
    var anchor = document.querySelector('[data-tg="roadmap"]');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else main.appendChild(sec);
    mountTabButton();
    mountRail();
  }

  /* #tabs is the actual source of tab state: showTab() reads it, and the side rail only
     delegates to it (rail click -> document.getElementById('tab-<name>').click()). Without
     a #tab-paths button the rail button resolves to nothing and the section never unhides,
     which is exactly how this tab first shipped empty. pretge and tradfi get their buttons
     from their build patchers; this file has none, so it makes its own. */
  function mountTabButton() {
    if (document.getElementById('tab-paths')) return;
    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    var after = document.getElementById('tab-roadmap');
    var b = document.createElement('button');
    b.id = 'tab-paths';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.dataset.tab = 'paths';
    b.textContent = 'Two Paths';
    /* #tabs already has a delegated click handler in dashboard.js, so the button needs
       no listener of its own — adding one would call showTab twice. */
    if (after && after.parentNode === tabs) tabs.insertBefore(b, after);
    else tabs.appendChild(b);
  }

  /* The rail lives in the HTML and is renumbered by the pretge/tradfi build patchers,
     so its numbers differ between the build source and the built page. Injecting the
     button here and renumbering every rail top-to-bottom keeps both correct without
     this file having to know which numbering it landed in. */
  function mountRail() {
    var rails = {};
    document.querySelectorAll('[data-open-tab="roadmap"]').forEach(function (btn) {
      var rail = btn.parentNode;
      if (!rail || rail.querySelector('[data-open-tab="paths"]')) return;
      var mine = btn.cloneNode(true);
      mine.setAttribute('data-open-tab', 'paths');
      var strong = mine.querySelector('strong') || mine.querySelector('b');
      if (strong) strong.textContent = 'Two Paths';
      var small = mine.querySelector('small');
      if (small) small.textContent = 'HYPE shape or LIT shape';
      rail.insertBefore(mine, btn);
      rails[rail.className || 'rail'] = rail;
    });
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
    /* dashboard.js declares these as top-level consts: reachable by name from this
       file, not as window properties. Both are mutable. */
    try {
      if (typeof VALID_TABS !== 'undefined' && VALID_TABS.indexOf('paths') < 0) VALID_TABS.push('paths');
      if (typeof DEFAULT_TAB_ORDER !== 'undefined' && DEFAULT_TAB_ORDER.indexOf('paths') < 0) {
        var i = DEFAULT_TAB_ORDER.indexOf('biweekly');
        DEFAULT_TAB_ORDER.splice(i < 0 ? DEFAULT_TAB_ORDER.length : i + 1, 0, 'paths');
      }
      if (typeof SECTION_COPY !== 'undefined') SECTION_COPY.paths = {
        eyebrow: 'Scenario read',
        title: 'Two Paths',
        description: 'Whether the TGE is more likely to rhyme with Hyperliquid or with Lighter, scored on macro conditions and on where the listing price lands.',
        chip: 'odds'
      };
    } catch (_) {}
  }

  function boot() {
    mount();
    registerTab();
    render();
    if (location.hash === '#paths' && typeof showTab === 'function') {
      try { showTab('paths', { push: false }); } catch (_) {}
    }
  }

  /* Shared with playbook-panels.js (Tab 13). That tab runs the same two price paths
     through a leveraged TWAP, and reading them from here is what stops the two tabs
     from quietly diverging the way the LIT anchor already has elsewhere. */
  window.__VPATHS = { series: SERIES, window: WINDOW, listings: LISTINGS, varListing: VAR_LISTING };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
