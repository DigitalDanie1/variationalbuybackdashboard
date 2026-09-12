/* ---------- Tab 13 · Post-TGE Playbook ----------
   Two Paths (tab 12) deliberately carries no plan. This is the plan, and only the plan:
   the owner's own written post-TGE playbook turned into numbers that can be executed on
   listing day and, where possible, falsified before it.

   The playbook as written, verbatim, is in PLAYBOOK below. Everything this file adds on
   top of that text is marked. Two kinds of number appear here:

     · quoted   — stated in the playbook itself (the five FDV bands, "1 month",
                  "over a month or more", "the first week", "low leverage")
     · filled   — not stated, needed to compute anything, and adjustable in the UI.
                  Rendered with a ° so it is never mistaken for the author's own figure.

   The one thing this tab does that a written plan cannot: it runs the chosen size and
   leverage through what HYPE and Lighter actually did after listing, day by day, and
   reports whether the position would still have been alive. "Low leverage to survive the
   initial volatility" is the only line in the playbook that can be tested today, so it is
   tested. The price paths come from window.__VPATHS, set by paths-panels.js, so the two
   tabs cannot disagree about what those listings did. */
(function () {
  'use strict';

  var ASOF = '2026-09-11';
  var STORE = 'varPlaybookV1';

  /* ---------- the playbook, as written ---------- */
  var PLAYBOOK = [
    { k: 'wallets', n: 1, t: 'Monitor the top 100 airdropped wallets for distribution behaviour.' },
    { k: 'twap',    n: 2, t: 'TWAP into VAR perp longs over the first week on low leverage to survive through the initial volatility.' },
    { k: 'collat',  n: 3, t: 'Once the large wallets have finished dumping, consider converting part of the spot VAR allocation into collateral for additional leveraged exposure.' },
    { k: 'olp',     n: 4, t: 'If public OLP is live, track deposits against VAR staked. That ratio is the cleanest read on whether the flywheel is actually working.' },
    { k: 'lp',      n: 5, t: 'Watch for on-chain VAR pools with early-stage LP yields, partially hedged with perp longs.' }
  ];

  /* ---------- the five FDV bands ----------
     max / label / quote are the playbook verbatim. size, days and lev are filled in: the
     text gives a duration for two bands ("1 month", "over a month or more") and a window
     for the entry ("the first week"), and gives no sizes or leverage at all. Defaults are
     a straight reading of the words and every one of them is editable below. */
  var BANDS = [
    { k: 'agg',  min: 0,     max: 1.0e9,     label: 'Aggressive',
      quote: 'Will aggressively TWAP into my desired size.',
      size: 100, days: 7,  lev: 2,   quotedDays: false },
    { k: 'base', min: 1.0e9, max: 2.0e9,     label: 'Base case',
      quote: 'My base case. TWAP in, no urgency.',
      size: 100, days: 14, lev: 2,   quotedDays: false },
    { k: 'cut',  min: 2.0e9, max: 3.0e9,     label: 'Reduced size',
      quote: 'Reduced size, longer TWAP (1 month).',
      size: 60,  days: 30, lev: 1.5, quotedDays: true },
    { k: 'str',  min: 3.0e9, max: 5.0e9,     label: 'Stretch bids',
      quote: 'Stretch bids over a month or more.',
      size: 35,  days: 45, lev: 1.5, quotedDays: true },
    { k: 'off',  min: 5.0e9, max: Infinity,  label: 'Stand down',
      quote: 'Hold off from adding and consider trimming positions slightly.',
      size: 0,   days: 0,  lev: 0,   quotedDays: false }
  ];

  /* ---------- where this site's own estimates land on that ladder ----------
     Two anchors, because the site currently holds two. The Pre-TGE tab prices Lighter's
     TGE at $2.73B, which is CoinGecko's first recorded point — eight days after Lighter
     actually listed. Two Paths uses the listing candle itself, $4.00B. Every multiple
     derived from the comparable scales by 4.00 / 2.7264 = 1.465×, which is the difference
     between landing in band 3 and landing in band 4. Both are shown; neither is hidden. */
  var MARKS = [
    { v: 0.64e9, label: 'Flow',  who: 'Pre-TGE · FDV per $B of volume',        anchor: 'cg',   alt: 0.94e9 },
    { v: 2.81e9, label: 'Book',  who: 'Pre-TGE · FDV per $ of open interest',  anchor: 'cg',   alt: 4.12e9 },
    { v: 4.22e9, label: 'Mark',  who: "Pre-TGE · Lighter's price today",       anchor: 'now',  alt: null   }
  ];
  var LISTED = [
    { v: 3.05e9, label: 'HYPE listed', cls: 'hype' },
    { v: 4.00e9, label: 'LIT listed',  cls: 'lit'  }
  ];

  /* One list for the beads on the ladder and the chips under it, so a valuation cannot be
     drawn in one place and named differently in the other. */
  var MARKLIST = [
    { v: MARKS[0].v, alt: MARKS[0].alt, label: 'by volume',        cls: 'est'  },
    { v: MARKS[1].v, alt: MARKS[1].alt, label: 'by open interest', cls: 'est'  },
    { v: MARKS[2].v, alt: null,         label: 'LIT price today',  cls: 'est'  },
    { v: LISTED[0].v, alt: null,        label: 'HYPE listed',      cls: 'hype' },
    { v: LISTED[1].v, alt: null,        label: 'LIT listed',       cls: 'lit'  }
  ];

  var FDV_CHIPS = [
    { v: 0.94e9, label: '$0.94B' }, { v: 1.5e9, label: '$1.5B' }, { v: 2.81e9, label: '$2.81B' },
    { v: 3.0e9,  label: '$3.0B'  }, { v: 4.12e9, label: '$4.12B' }, { v: 5.0e9, label: '$5.0B' },
    { v: 6.5e9,  label: '$6.5B'  }
  ];
  var SIZE_CHIPS = [100e3, 250e3, 500e3, 1e6];
  /* How much of that size the entry actually deploys. state.sizePct existed from the start
     but nothing could ever set it — only clear it — so the share was locked to whatever the
     band said. At Stand down the band says 0%, which left every figure in the panel reading
     $0 with no control that could change it: the panel looked broken rather than empty. */
  var PCT_CHIPS = [25, 35, 60, 100];
  var LEV_CHIPS  = [1, 1.5, 2, 3, 5];

  /* Maintenance margin on a freshly listed perp. Nothing published for a token that does
     not exist, so this is a working figure from where new listings usually sit. It only
     moves the liquidation price by a fraction of a percent at these leverages. */
  var MM = 0.025;
  /* Perp funding, charged daily on live notional. Two rates rather than one: a new listing
     runs hot while everyone is long and then settles, and charging the launch rate for eight
     months would overstate the drag by roughly 3×. Launch-week funding on a genuinely hot
     listing routinely runs several times the first figure. It is modelled at all because a
     month of levered longs is a very different cost from a month of spot bids, and the
     playbook's two longest bands are both a month. */
  var FUND_HOT = 0.0015, FUND_COOL = 0.0003, FUND_HOT_DAYS = 30;
  function fundingAt(day) { return day < FUND_HOT_DAYS ? FUND_HOT : FUND_COOL; }
  /* cumulative funding on 1 unit of notional held from listing day through `day` */
  function fundingThrough(day) {
    var hot = Math.min(day + 1, FUND_HOT_DAYS);
    return hot * FUND_HOT + Math.max(day + 1 - FUND_HOT_DAYS, 0) * FUND_COOL;
  }

  var state = {
    /* A round placeholder, not a position — the reader sets their own size in The Entry. */
    fdv: 2.81e9, size: 100e3, lev: null, days: null, sizePct: null, path: 'both'
  };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || '{}');
    Object.keys(saved).forEach(function (k) { if (k in state) state[k] = saved[k]; });
  } catch (_) {}
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) {} }

  /* ---------- formatting ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function usdB(v) { return '$' + (v / 1e9).toFixed(2).replace(/\.00$/, '') + 'B'; }
  function usd(v) {
    if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (Math.abs(v) >= 1e3) return '$' + Math.round(v / 1e3) + 'K';
    return '$' + Math.round(v);
  }
  function usdExact(v) { return '$' + Math.round(v).toLocaleString('en-US'); }
  function pct(v, d) { return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d == null ? 1 : d) + '%'; }
  /* Equity is reported as profit and loss on the margin, never as a multiple of it. ×0.23
     is a 77% loss and ×0.08 is a 92% loss, but both read as small positive numbers unless
     the reader subtracts one and multiplies by a hundred in their head. A signed percentage
     puts the sign where it belongs — a loss looks like a loss. */
  function pnl(mult) {
    var v = (mult - 1) * 100;
    if (Math.abs(v) < 0.5) return '0%';
    return (v > 0 ? '+' : '−') + Math.abs(v).toFixed(0) + '%';
  }
  var DEG = '<i class="pb-fill" title="filled in — not stated in the playbook">°</i>';

  function bandFor(fdv) {
    for (var i = 0; i < BANDS.length; i++) if (fdv < BANDS[i].max) return BANDS[i];
    return BANDS[BANDS.length - 1];
  }
  /* The band carries the defaults; state overrides them once the reader touches a chip.
     Clearing the override is what the "reset" control does. */
  function plan() {
    var b = bandFor(state.fdv);
    return {
      band: b,
      size: state.sizePct == null ? b.size : state.sizePct,
      days: state.days == null ? b.days : state.days,
      lev:  state.lev  == null ? b.lev  : state.lev
    };
  }

  /* ---------- price paths, from paths-panels.js ---------- */
  function paths() {
    var V = window.__VPATHS;
    if (!V || !V.series) return null;
    /* HYPE has 646 days on record and Lighter 258. Everything here is cut to the shorter
       one so the two are judged over the same window — a HYPE liquidation on day 417 is
       not a fact about the first 258 days and must not be reported as one. */
    var win = V.window || 258;
    return {
      hype: V.series.hype.split(',').map(Number).slice(0, win),
      lit:  V.series.lit.split(',').map(Number).slice(0, win),
      win:  win
    };
  }

  /* ---------- the simulation ----------
     Margin is in the account from day one and notional is scaled in over `days` equal
     daily clips, so effective leverage ramps from 0 to the target rather than sitting at
     the target from the first clip. That is both the safer way to TWAP into a levered
     long and the more forgiving assumption, so a liquidation reported here is not an
     artefact of a harsh model.

       equity(p) = M + tokens·p − cost        cost = M · lev after the ramp completes
       liquidated when equity ≤ MM · tokens·p

     Funding is charged daily on live notional. Checks run on daily closes only: an
     intraday wick can liquidate a position this model still shows alive. */
  function simulate(px, days, lev, withFunding) {
    var M = 1, tokens = 0, cost = 0, fees = 0;
    var eq = [], lev_ = [], liqDay = -1, i, p, value, e;
    var clipN = days > 0 ? (M * lev) / days : 0;
    for (i = 0; i < px.length; i++) {
      p = px[i];
      if (i < days && lev > 0) { tokens += clipN / p; cost += clipN; }
      value = tokens * p;
      if (withFunding) fees += value * fundingAt(i);
      e = M + value - cost - fees;
      eq.push(e);
      lev_.push(value > 0 ? value / Math.max(e, 1e-9) : 0);
      if (liqDay < 0 && tokens > 0 && e <= MM * value) { liqDay = i; }
    }
    var avgEntry = tokens > 0 ? cost / tokens : 0;
    var liqPx = tokens > 0 && lev > 1 ? (cost - M) / (tokens * (1 - MM)) : 0;
    var alive = liqDay < 0;
    return {
      eq: eq, liqDay: liqDay, alive: alive, tokens: tokens, cost: cost, fees: fees,
      avgEntry: avgEntry, liqPx: liqPx,
      liqFromEntry: avgEntry > 0 ? (liqPx / avgEntry - 1) * 100 : 0,
      peak: Math.max.apply(null, eq.slice(0, liqDay < 0 ? eq.length : liqDay + 1)),
      trough: alive ? Math.min.apply(null, eq.slice(days || 1)) : 0,
      finalEq: alive ? eq[eq.length - 1] : 0
    };
  }

  /* Which of the two listings a (days, lev) pair survives. The chips are the control the
     reader actually uses to answer "what do I have to do to survive this", so the answer
     belongs on the chips — not on a chart below, found one trial at a time. */
  function survives(P, days, lev) {
    if (!P || days <= 0 || lev <= 0) return '';
    var h = simulate(P.hype, days, lev, true).alive;
    var l = simulate(P.lit, days, lev, true).alive;
    return h && l ? 'surv-ok' : (h || l) ? 'surv-warn' : 'surv-dead';
  }

  /* Largest leverage, to one decimal, that survives the whole window on a given path.
     This is the number the playbook's "low leverage" line actually resolves to. */
  function maxSurvivable(px, days) {
    var lo = 1, hi = 10, mid, i;
    for (i = 0; i < 22; i++) {
      mid = (lo + hi) / 2;
      if (simulate(px, days, mid, true).alive) lo = mid; else hi = mid;
    }
    return Math.floor(lo * 10) / 10;
  }

  /* ---------- postures ----------
     The leverage table answers "what would this setting have done". It does not answer the
     question underneath it: which settings are worth taking at all. So the whole grid of
     schedules and leverages is run and four postures are picked out of it by rule, not by
     opinion — each one is the argmax of a stated metric over the two paths that exist.

     Deploy share is deliberately not in the grid. It scales every dollar and changes no
     multiple and no liquidation, so it is the one lever that cuts exposure without touching
     the shape; it belongs next to the postures as a separate decision, not inside them. */
  var DAY_GRID = [7, 14, 21, 30, 45, 60];

  function postures(P) {
    if (!P) return null;
    var all = [];
    DAY_GRID.forEach(function (d) {
      LEV_CHIPS.forEach(function (lv) {
        var h = simulate(P.hype, d, lv, true), l = simulate(P.lit, d, lv, true);
        var alive = (h.alive ? 1 : 0) + (l.alive ? 1 : 0);
        all.push({
          days: d, lev: lv, h: h, l: l, alive: alive,
          /* the worse of the two endings, and the deeper of the two holes to sit through */
          worstEnd: Math.min(h.alive ? h.finalEq : 0, l.alive ? l.finalEq : 0),
          bestEnd: Math.max(h.alive ? h.finalEq : 0, l.alive ? l.finalEq : 0),
          worstDip: Math.min(h.alive ? h.trough : 0, l.alive ? l.trough : 0),
          firstDeath: Math.min(h.alive ? 1e9 : h.liqDay, l.alive ? 1e9 : l.liqDay)
        });
      });
    });
    var both = all.filter(function (r) { return r.alive === 2; });
    var one = all.filter(function (r) { return r.alive === 1; });
    var none = all.filter(function (r) { return r.alive === 0; });
    function pick(list, score) {
      if (!list.length) return null;
      return list.reduce(function (a, b) { return score(b) > score(a) ? b : a; });
    }
    /* The two shapes do not want the same thing, and "survive both" hides that by only
       ever showing the intersection. Read one path at a time and the demands come out
       opposite: one is a falling market you average into, the other is a vertical one you
       have to already be in. Both summaries are argmax over the same grid. */
    function perPath(k) {
      var live = all.filter(function (r) { return r[k].alive; });
      if (!live.length) return null;
      var ceilLev = Math.max.apply(null, live.map(function (r) { return r.lev; }));
      var atDays = function (d) {
        var f = live.filter(function (r) { return r.days === d; });
        return f.length ? Math.max.apply(null, f.map(function (r) { return r.lev; })) : 0;
      };
      return {
        /* the most leverage this shape tolerated anywhere, and the schedule that did it */
        ceil: live.filter(function (r) { return r.lev === ceilLev; })
                  .reduce(function (a, b) { return b[k].finalEq > a[k].finalEq ? b : a; }),
        /* the biggest ending it gave up while still alive */
        best: live.reduce(function (a, b) { return b[k].finalEq > a[k].finalEq ? b : a; }),
        fast: atDays(DAY_GRID[0]),
        slow: atDays(DAY_GRID[DAY_GRID.length - 1]),
        fastD: DAY_GRID[0], slowD: DAY_GRID[DAY_GRID.length - 1]
      };
    }

    return {
      hypeOnly: perPath('h'), litOnly: perPath('l'),
      /* shallowest hole you would have had to sit through, of the ones that lived */
      calm: pick(both, function (r) { return r.worstDip * 1e3 + r.worstEnd; }),
      /* most worst-case gain per unit of worst-case drawdown */
      ratio: pick(both, function (r) { return (r.worstEnd - 1) / Math.max(1 - r.worstDip, 0.02); }),
      /* biggest upside among settings that died on one path — the shape bet, priced */
      swing: pick(one, function (r) { return r.bestEnd; }),
      /* died on both: no shape in this data pays for it */
      avoid: pick(none, function (r) { return -r.firstDeath; }),
      counts: { both: both.length, one: one.length, none: none.length, all: all.length }
    };
  }

  /* ---------- svg helpers ---------- */
  function ln(x1, y1, x2, y2, cls) {
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) +
      '" y2="' + y2.toFixed(1) + '" class="' + cls + '"/>';
  }
  function tx(x, y, s, cls, anchor) {
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" class="' + cls + '"' +
      (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>';
  }
  function poly(pts, cls) {
    return '<polyline points="' + pts.map(function (p) {
      return p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ') + '" class="' + cls + '"/>';
  }

  /* ---------- the FDV ladder ----------
     A descending staircase, not a row of blocks. The one thing this chart exists to say —
     the richer the listing, the less the plan buys — was previously five equal rectangles
     with the figures printed inside them, so the reader had to collect four numbers and
     infer the slope for themselves. Putting size on y makes the slope the picture: the
     steps fall 100 → 100 → 60 → 35 → 0 and the shape is the rule.

     Everything that used to float above the bands (three one-word marks, two dotted
     connectors, two dot styles) now sits in a labelled lane under the axis, where a long
     label has room and where two rows of alternation keep neighbours apart. The needle's
     own readout is gone: the FDV is already on the selected chip, in the custom input and
     in the verdict card overhead, and its plate was landing on the axis numbers. */
  function ladder() {
    var W = 960, H = 256, L = 46, R = 20, T = 40, B = 48;
    var lo = 0, hi = 6.5e9;
    var x = function (v) { return L + (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo) * (W - L - R); };
    var y0 = T, y1 = H - B;
    var ys = function (pc) { return y1 - (pc / 100) * (y1 - y0); };
    var bn = function (v) { return (v / 1e9).toFixed(2); };
    var s = '<svg class="pb-ladder" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="How much of the intended size the plan buys at each listing FDV, as a descending staircase">';
    var cur = bandFor(state.fdv);

    s += tx(4, 15, '% of intended size', 'pb-cap', 'start');

    /* Gridlines are the four sizes the plan actually uses, so a step's height is readable
       as a number without counting pixels against an arbitrary scale. */
    [0, 35, 60, 100].forEach(function (v) {
      s += ln(L, ys(v), W - R, ys(v), 'pb-lgrid' + (v === 0 ? ' base' : ''));
      s += tx(L - 8, ys(v) + 3.5, v + '%', 'pb-ytick', 'end');
    });

    /* The chosen band is lit floor to ceiling. Colouring only the step itself left the
       answer invisible at the one band where it matters most — Stand down is 0% tall, so
       "where am I" had nothing to point at but a hairline needle. */
    var cxa = x(cur.min), cxb = x(cur.max === Infinity ? hi : cur.max);
    s += '<rect x="' + cxa.toFixed(1) + '" y="' + y0 + '" width="' + Math.max(cxb - cxa, 1).toFixed(1) +
      '" height="' + (y1 - y0) + '" class="pb-sel"/>';

    /* steps */
    var stair = [];
    BANDS.forEach(function (b, i) {
      var xa = x(b.min), xb = x(b.max === Infinity ? hi : b.max), yt = ys(b.size);
      var on = b === cur, mid = (xa + xb) / 2;
      if (b.size > 0) {
        s += '<rect x="' + xa.toFixed(1) + '" y="' + yt.toFixed(1) + '" width="' +
          Math.max(xb - xa, 1).toFixed(1) + '" height="' + (y1 - yt).toFixed(1) +
          '" class="pb-step b' + (i + 1) + (on ? ' on' : '') + '"/>';
      }
      /* A riser already draws the boundary wherever the size changes. The only boundary
         that needs a line of its own is the one between two bands of the same height. */
      if (i && BANDS[i - 1].size === b.size) s += ln(xa, y0, xa, y1, 'pb-band-sep');
      stair.push([xa, yt], [xb, yt]);

      /* A step shorter than its own label stack gets the stack above the baseline instead;
         at 0% there is no step at all to write inside. */
      var tall = (y1 - yt) >= 54;
      var ly = tall ? yt : y1 - 40;
      s += tx(mid, ly - 9, b.label, 'pb-step-l' + (on ? ' on' : ''), 'middle');
      s += tx(mid, ly + (tall ? 26 : 16), b.size + '%', 'pb-step-n' + (on ? ' on' : ''), 'middle');
      s += tx(mid, ly + (tall ? 43 : 34), b.days ? 'over ' + b.days + 'd' : 'no add',
        'pb-step-d', 'middle');
    });
    s += poly(stair, 'pb-stair');

    /* ---------- where every valuation this page holds lands on the ladder ----------
       A bead resting on the step it falls on. Seven full-height lines ruled between $2.8B
       and $4.2B were most of what made this chart busy, and a bead answers the actual
       question — which step does this estimate land on — without crossing anything. The
       names, the figures and the band each one lands in moved out to chips under the
       chart, where a long label has room and where clicking one moves the needle. */
    var beadY = function (v) { return ys(bandFor(v).size); };
    MARKLIST.forEach(function (m) {
      [m.v, m.alt].forEach(function (v) {
        if (!v) return;
        s += '<circle cx="' + x(v).toFixed(1) + '" cy="' + beadY(v).toFixed(1) +
          '" r="4.5" class="pb-bead ' + m.cls + '"/>';
      });
      if (m.alt) {
        s += ln(x(m.v), beadY(m.v), x(m.alt), beadY(m.alt), 'pb-bead-span ' + m.cls);
      }
    });

    /* the needle */
    var xn = x(state.fdv);
    s += ln(xn, y0 - 10, xn, y1 + 9, 'pb-needle');
    s += '<path d="M' + (xn - 6) + ',' + (y1 + 12) + ' L' + (xn + 6) + ',' + (y1 + 12) +
      ' L' + xn + ',' + (y1 + 2) + ' Z" class="pb-needle-h"/>';

    [0, 1e9, 2e9, 3e9, 4e9, 5e9, 6e9].forEach(function (v) {
      s += tx(x(v), y1 + 26, '$' + (v / 1e9) + 'B', 'pb-axis', v === 0 ? 'start' : 'middle');
    });
    s += tx(W - R, y1 + 42, 'Listing FDV', 'pb-cap', 'end');

    /* Hit areas last and full height, so the 0% band is as clickable as the tall ones. */
    BANDS.forEach(function (b) {
      var xa = x(b.min), xb = x(b.max === Infinity ? hi : b.max);
      s += '<rect x="' + xa.toFixed(1) + '" y="' + y0 + '" width="' + Math.max(xb - xa, 1).toFixed(1) +
        '" height="' + (y1 - y0) + '" class="pb-hit" data-band="' + b.k + '"><title>' +
        esc(b.label + ' — ' + b.size + '% of intended size' +
          (b.days ? ' over ' + b.days + ' days' : ', no add')) + '</title></rect>';
    });
    return s + '</svg>';
  }

  /* ---------- the survivability chart ---------- */
  /* The axis is the money that was typed in, not a percentage of it. A simulator that
     answers "put this in, get this out" has to put the out on the chart — a reader should
     be able to point at the line and read dollars off the side. Percent is kept as the
     fallback for the one case with no money in it (a 0% deploy), where a dollar axis would
     be a column of zeroes. */
  /* ---------- one chart per listing: the market on top, the money underneath ----------
     This was two sections — a price chart and an equity chart — and reading them meant
     holding one in your head while looking at the other. They share a day axis and a cause,
     so they share a column here: the top row is what that listing's FDV did, the bottom row
     is what the money put in was worth while it did that.

     The top row is where the entry is judged. Your average entry and your liquidation price
     are horizontal lines on the same scale as the price, so "TWAP it as well as you can"
     stops being advice and becomes a picture: the gap between those two lines is all the
     room the position has, and the schedule is what moves the upper one. */
  function equityChart(P, p, budget) {
    var W = 960, H = 392, PAD = 62, GAP = 96;
    var panelW = (W - PAD * 2 - GAP) / 2;
    var pT = 34, pB = 176, mT = 218, mB = 344;     /* price row, money row */
    var sims = {
      hype: simulate(P.hype, p.days, p.lev, true),
      lit:  simulate(P.lit,  p.days, p.lev, true)
    };
    var n = Math.min(P.hype.length, P.lit.length, P.win);
    var money = budget > 0;
    var LI = (window.__VPATHS || {}).listings || {};
    var s = '<svg class="pb-eq" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="Each listing: FDV with the average entry and liquidation price, and what the money put in was worth">';

    function niceStep(span, want) {
      var raw = span / want, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
      var k = raw / mag;
      return (k <= 1 ? 1 : k <= 2 ? 2 : k <= 2.5 ? 2.5 : k <= 5 ? 5 : 10) * mag;
    }
    var bn = function (v) { return '$' + (v / 1e9 >= 10 ? (v / 1e9).toFixed(0) : (v / 1e9).toFixed(1)) + 'B'; };

    ['hype', 'lit'].forEach(function (k, idx) {
      var sim = sims[k], x0 = PAD + idx * (panelW + GAP);
      var fdv0 = (LI[k] && LI[k].fdv) || (k === 'hype' ? 3.05e9 : 4.00e9);
      var end = sim.alive ? n - 1 : Math.min(sim.liqDay, n - 1);
      var x = function (i) { return x0 + i / (n - 1) * panelW; };

      s += tx(x0, pT - 15, k === 'hype' ? 'HYPE · Hyperliquid' : 'LIT · Lighter',
        'pb-px-tag ' + (k === 'lit' ? 'lit' : ''), 'start');
      s += tx(x0 + panelW, pT - 15, 'listed at ' + bn(fdv0), 'pb-px-span', 'end');

      /* ---- row 1 · the market, in FDV ---- */
      var hi = 0, i;
      for (i = 0; i < n; i++) if (P[k][i] > hi) hi = P[k][i];
      var topF = hi * fdv0 * 1.06;
      var yF = function (v) { return pB - Math.min(Math.max(v, 0), topF) / topF * (pB - pT); };
      var stF = niceStep(topF, 3), g;
      for (g = 0; g <= topF + 1e-9; g += stF) {
        s += ln(x0, yF(g), x0 + panelW, yF(g), 'pb-grid');
        s += tx(x0 - 7, yF(g) + 3.5, bn(g), 'pb-ax', 'end');
      }
      if (p.days > 0) s += '<rect x="' + x0 + '" y="' + pT + '" width="' +
        (x(Math.min(p.days, n - 1)) - x0).toFixed(1) + '" height="' + (pB - pT) + '" class="pb-twapwin"/>';

      var pts = [];
      for (i = 0; i < n; i++) pts.push([x(i), yF(P[k][i] * fdv0)]);
      s += poly(pts, 'pb-pxline ' + k);

      /* the two lines the entry lives between */
      if (sim.avgEntry > 0) {
        var ya = yF(sim.avgEntry * fdv0);
        s += ln(x0, ya, x0 + panelW, ya, 'pb-entry');
        s += tx(x0 + panelW, ya - 5, 'avg entry ' + bn(sim.avgEntry * fdv0), 'pb-entry-t', 'end');
      }
      if (p.lev > 1 && sim.liqPx > 0) {
        var yl = yF(sim.liqPx * fdv0);
        s += ln(x0, yl, x0 + panelW, yl, 'pb-liqline');
        s += tx(x0 + panelW, yl + 12, 'liquidation ' + bn(sim.liqPx * fdv0), 'pb-liqline-t', 'end');
      }
      s += tx(x0 + 6, pT + 13, p.days > 0 ? 'TWAP ' + p.days + 'd' : '', 'pb-twapwin-t');

      /* ---- row 2 · the money ---- */
      var top = 1.15;
      for (i = 0; i <= end; i++) if (sim.eq[i] > top) top = sim.eq[i];
      top = Math.ceil(top * 1.06 * 4) / 4;
      var yM = function (v) { return mB - Math.min(Math.max(v, 0), top) / top * (mB - mT); };
      var lab = function (m) { return money ? usd(m * budget) : pnl(m); };

      s += '<rect x="' + x0 + '" y="' + mT + '" width="' + panelW.toFixed(1) + '" height="' +
        (yM(1) - mT).toFixed(1) + '" class="pb-zone up"/>';
      s += '<rect x="' + x0 + '" y="' + yM(1).toFixed(1) + '" width="' + panelW.toFixed(1) +
        '" height="' + (mB - yM(1)).toFixed(1) + '" class="pb-zone down"/>';
      var stM = top > 8 ? 2 : top > 4 ? 1 : top > 2 ? 0.5 : 0.25;
      for (g = 0; g <= top + 1e-9; g += stM) {
        if (Math.abs(g - 1) < 1e-9) continue;
        s += ln(x0, yM(g), x0 + panelW, yM(g), 'pb-grid');
        s += tx(x0 - 7, yM(g) + 3.5, lab(g), 'pb-ax', 'end');
      }
      s += ln(x0, yM(1), x0 + panelW, yM(1), 'pb-grid one');
      s += tx(x0 - 7, yM(1) + 3.5, lab(1), 'pb-ax one', 'end');
      s += tx(x0 + 6, yM(1) - 5, money ? 'what went in' : 'break even', 'pb-eqbase', 'start');
      if (p.days > 0) s += '<rect x="' + x0 + '" y="' + mT + '" width="' +
        (x(Math.min(p.days, n - 1)) - x0).toFixed(1) + '" height="' + (mB - mT) + '" class="pb-twapwin"/>';

      var ep = [];
      for (i = 0; i <= end; i++) ep.push([x(i), yM(sim.eq[i])]);
      if (!sim.alive) ep.push([x(end), yM(0)]);
      s += poly(ep, 'pb-eqline ' + k);

      if (!sim.alive) {
        s += '<g class="pb-liq ' + k + '"><circle cx="' + x(end).toFixed(1) + '" cy="' + yM(0) +
          '" r="5"/><path d="M' + (x(end) - 3.4) + ',' + (yM(0) - 3.4) + ' l6.8,6.8 M' +
          (x(end) + 3.4) + ',' + (yM(0) - 3.4) + ' l-6.8,6.8"/></g>';
        s += tx(Math.min(x(end) + 9, x0 + panelW), yM(0) - 10, 'wiped out D+' + end,
          'pb-eqlab ' + k, x(end) + 74 > x0 + panelW ? 'end' : 'start');
      } else {
        s += tx(x0 + panelW, yM(sim.eq[end]) - 18, lab(sim.eq[end]), 'pb-eqlab ' + k, 'end');
        s += tx(x0 + panelW, yM(sim.eq[end]) - 4, pnl(sim.eq[end]), 'pb-eqsub ' + k, 'end');
      }

      [0, 60, 120, 180, 240].forEach(function (d) {
        if (d < n) s += tx(x(d), H - 10, 'D+' + d, 'pb-ax', d === 0 ? 'start' : 'middle');
      });
    });
    return { svg: s + '</svg>', sims: sims, n: n };
  }

  /* ---------- render ---------- */
  function render() {
    var host = document.querySelector('[data-tg="plan"]');
    if (!host) return;
    var P = paths(), p = plan(), b = p.band;
    /* Hoisted above the chips: the survivable ceiling is what they are marked against, and
       it is the number this whole tab is pointed at. */
    var maxLev = P && p.days > 0 ? {
      hype: maxSurvivable(P.hype, p.days), lit: maxSurvivable(P.lit, p.days)
    } : null;
    var safeLev = maxLev ? Math.min(maxLev.hype, maxLev.lit) : null;
    var budget = state.size * (p.size / 100);
    var clip = p.days > 0 ? budget / p.days : 0;
    var notional = budget * p.lev;
    /* The plan is a shape, not a cheque. Everything above the entry calculator is stated as a
       share of whatever size the reader brings, so the page reads the same for a $5K book and
       a $5M one; dollars start at "The Entry", where the reader sets the size themselves. */
    var perDay = p.days > 0 ? p.size / p.days : 0;
    var perDayStr = (perDay >= 10 ? perDay.toFixed(0) : perDay.toFixed(1)) + '%';
    var notionalMult = (p.size / 100) * p.lev;

    var fdvChips = FDV_CHIPS.map(function (c) {
      return '<button type="button" data-fdv="' + c.v + '"' +
        (Math.abs(c.v - state.fdv) < 1e6 ? ' class="on"' : '') + '>' + esc(c.label) + '</button>';
    }).join('');
    var sizeChips = SIZE_CHIPS.map(function (v) {
      return '<button type="button" data-size="' + v + '"' +
        (Math.abs(v - state.size) < 1 ? ' class="on"' : '') + '>' + usd(v) + '</button>';
    }).join('');
    var pctChips = PCT_CHIPS.map(function (v) {
      return '<button type="button" data-sizepct="' + v + '"' +
        (v === p.size ? ' class="on"' : '') + '>' + v + '%</button>';
    }).join('');
    var levChips = LEV_CHIPS.map(function (v) {
      var cls = ((Math.abs(v - p.lev) < .01 ? 'on ' : '') + survives(P, p.days, v)).trim();
      return '<button type="button" data-lev="' + v + '"' +
        (cls ? ' class="' + cls + '"' : '') + '>' + v + '×</button>';
    }).join('');
    /* The schedule moves the answer as much as the leverage does — a longer TWAP averages
       the entry down — so the day chips carry the same mark, read at the chosen leverage. */
    var dayChips = [7, 14, 21, 30, 45, 60].map(function (v) {
      var cls = ((v === p.days ? 'on ' : '') + survives(P, v, p.lev)).trim();
      return '<button type="button" data-days="' + v + '"' +
        (cls ? ' class="' + cls + '"' : '') + '>' + v + 'd</button>';
    }).join('');
    /* One click to the edge of what held. When nothing above spot survived both, the button
       says that rather than offering a leverage that does not exist. */
    var bestChip = safeLev == null ? '' :
      '<button type="button" class="pb-best" data-lev="' + Math.max(safeLev, 1) + '">' +
      (safeLev > 1 ? 'strongest that survived both · ' + safeLev + '×'
                   : 'only unlevered survived both · 1×') + '</button>';

    /* Each valuation, named, priced, and told which step it lands on — the sentence the
       beads on the ladder can only gesture at. Clicking one moves the needle there, so the
       whole panel below re-reads for that valuation. */
    var markChips = MARKLIST.map(function (m) {
      var lands = bandFor(m.v).label;
      if (m.alt && bandFor(m.alt) !== bandFor(m.v)) lands += ' → ' + bandFor(m.alt).label;
      return '<button type="button" class="pb-mark ' + m.cls + '" data-fdv="' + m.v + '">' +
        '<i></i><span>' + esc(m.label) + '</span>' +
        '<b>$' + (m.v / 1e9).toFixed(2) + (m.alt ? '–' + (m.alt / 1e9).toFixed(2) : '') + 'B</b>' +
        '<em>' + esc(lands) + '</em></button>';
    }).join('');

    var bandRows = BANDS.map(function (x2) {
      var lo = x2.min === 0 ? 'Below' : usdB(x2.min);
      var hi = x2.max === Infinity ? '' : ' – ' + usdB(x2.max);
      var rng = x2.min === 0 ? 'Below ' + usdB(x2.max) : (x2.max === Infinity ? 'Above ' + usdB(x2.min) : lo + hi);
      var on = x2 === b;
      return '<tr class="pb-row' + (on ? ' on' : '') + '" data-band="' + x2.k + '">' +
        '<td class="pb-rng"><b>' + esc(rng) + '</b><small>' + esc(x2.label) + '</small></td>' +
        /* Size and duration are the staircase above; reprinting them here made three
           copies of 60% / 30d on one page. Leverage is the one figure the ladder cannot
           carry, so that column stays. */
        '<td class="pb-quote">“' + esc(x2.quote) + '”</td>' +
        '<td class="pb-n">' + (x2.lev ? x2.lev + '×' + DEG : '—') + '</td>' +
        '</tr>';
    }).join('');

    var chart = P && p.days > 0 && p.lev > 0 ? equityChart(P, p, budget) : null;
    /* Two opposite outcomes on one chart — rich on HYPE, wiped out on LIT — is a coin flip,
       not an answer: it says what happened on two paths and nothing about what to do. The
       decision is the trade between them, and that only shows up with the whole leverage
       ladder on screen at once: each step up buys HYPE upside and spends LIT survival. The
       last row that survives both is the entry this tab exists to find. */
    var levTable = '';
    if (P && p.days > 0 && budget > 0) {
      var rows = LEV_CHIPS.slice();
      if (safeLev && rows.indexOf(safeLev) < 0 && safeLev > 1) rows.push(safeLev);
      rows.sort(function (a, c) { return a - c; });
      levTable = rows.map(function (lv) {
        var s3 = { hype: simulate(P.hype, p.days, lv, true), lit: simulate(P.lit, p.days, lv, true) };
        var both = s3.hype.alive && s3.lit.alive;
        var cell = function (k) {
          var sm = s3[k];
          return sm.alive
            ? '<td class="pb-n"><b>' + usd(sm.finalEq * budget) + '</b><small>' +
              pnl(sm.finalEq) + ' · dipped to ' + usd(sm.trough * budget) + '</small></td>'
            : '<td class="pb-n dead"><b>liquidated</b><small>D+' + sm.liqDay + ' · lost ' +
              usd(budget) + '</small></td>';
        };
        return '<tr class="pb-row' + (Math.abs(lv - p.lev) < .01 ? ' on' : '') +
          '" data-lev="' + lv + '"><td class="pb-rng"><b>' + lv + '×</b>' +
          (safeLev && Math.abs(lv - safeLev) < .01 ? '<small>most that survived both</small>' : '') +
          '</td>' + cell('hype') + cell('lit') +
          '<td class="pb-n"><em class="pb-st ' + (both ? 'on' : 'wait') + '">' +
          (both ? 'survived both' : (s3.hype.alive || s3.lit.alive) ? 'one only' : 'neither') +
          '</em></td></tr>';
      }).join('');
      levTable = '<div class="bw-head"><b>What Each Leverage Would Have Done</b><span><i>same ' +
        usdExact(budget) + ' over ' + p.days + ' days · click a row to take it</i></span></div>' +
        '<div class="pb-tablewrap"><table class="pb-table pb-levtable"><thead><tr>' +
        '<th>Leverage</th><th>HYPE path</th><th>LIT path</th><th>Verdict</th>' +
        '</tr></thead><tbody>' + levTable + '</tbody></table></div>';
    }

    /* The four postures, rendered from the grid search. Each card states the rule it won
       under, so it reads as a measurement over two listings rather than a recommendation. */
    /* One model note for the whole section rather than one per chart, and it rides with the
       postures because that is the last thing read here. No ° inside it: the marker is an
       inline element and i18n matches whole text nodes. */
    var MODEL_NOTE = '<div class="pb-note"><b>The model.</b> Margin is in the account from day one and notional scales in over ' +
      p.days + ' equal clips, so leverage ramps to ' + p.lev + '× rather than starting there — the more forgiving reading. Funding runs ' +
      (FUND_HOT * 100).toFixed(2) + '% a day for ' + FUND_HOT_DAYS + ' days then ' +
      (FUND_COOL * 100).toFixed(2) + '%, maintenance margin ' + (MM * 100).toFixed(1) +
      '%, liquidation checked on daily closes — an intraday wick can kill a position these charts still show alive.</div>';

    /* ---------- four ways to play it ----------
       This was two sections: four "postures" picked by rule, and two cards for what each
       listing demanded. They overlapped almost exactly — the shape bet WAS HYPE's best
       surviving setting and the best-worst-case WAS LIT's, printed twice under two names.
       One section now, and each card is read action first: the setting to take, then what
       the two listings paid for it. */
    var actCards = '';
    if (budget > 0) {
      var PO = postures(P);
      if (PO && PO.calm && PO.hypeOnly && PO.litOnly && PO.avoid) {
        var res = function (r, k) {
          var sm = r[k];
          return '<div><dt>' + (k === 'h' ? 'HYPE' : 'LIT') + '</dt><dd' +
            (sm.alive ? '' : ' class="x"') + '>' +
            (sm.alive ? usd(sm.finalEq * budget) + ' <i>' + pnl(sm.finalEq) + '</i>'
                      : 'wiped out <i>D+' + sm.liqDay + '</i>') + '</dd></div>';
        };
        var lit = PO.litOnly.best, hyp = PO.hypeOnly.best, calm = PO.calm, bad = PO.avoid;
        actCards = [
          { r: calm, cls: 'ok', tag: 'Safest',
            foot: 'worst dip ' + pnl(calm.worstDip),
            why: 'Lives through both with the shallowest hole in the grid.' },
          { r: lit, cls: lit.alive === 2 ? 'ok' : 'warn', tag: 'What LIT demanded',
            foot: lit.alive === 2 ? 'worst dip ' + pnl(lit.worstDip) : 'dies on HYPE',
            why: 'Only at ' + lit.days + ' days — compress to ' + PO.litOnly.fastD +
                 ' and LIT tolerates no more than ' + PO.litOnly.fast + '×. ' +
                 (lit.alive === 2 ? 'HYPE takes it too, so this is where the two overlap.'
                                  : 'HYPE does not survive it.') },
          { r: hyp, cls: hyp.alive === 2 ? 'ok' : 'warn', tag: 'What HYPE demanded',
            foot: hyp.alive === 2 ? 'worst dip ' + pnl(hyp.worstDip) : 'dies on LIT',
            why: 'Only at ' + hyp.days + ' days — stretch to ' + PO.hypeOnly.slowD +
                 ' and HYPE tolerates no more than ' + PO.hypeOnly.slow + '×. ' +
                 (hyp.alive === 2 ? 'LIT takes it too.' : 'LIT does not survive it.') },
          { r: bad, cls: 'dead', tag: 'Never',
            foot: 'peaked at ' + usd(Math.max(bad.h.peak, bad.l.peak) * budget) + ', uncollected',
            why: 'Wiped out on both, faster than anything else in the grid.' }
        ].map(function (c) {
          return '<button type="button" class="pb-act ' + c.cls + '" data-lev="' + c.r.lev +
            '" data-days="' + c.r.days + '">' +
            '<span class="pb-act-tag">' + esc(c.tag) + '</span>' +
            '<b>' + c.r.lev + '× · ' + c.r.days + 'd</b>' +
            '<dl>' + res(c.r, 'h') + res(c.r, 'l') + '</dl>' +
            '<em>' + esc(c.foot) + '</em>' +
            '<p>' + esc(c.why) + '</p></button>';
        }).join('');
        actCards = '<div class="bw-head"><b>Four Ways To Play It</b><span><i>' +
          'every schedule × every leverage on both listings · ' + usdExact(budget) +
          ' deployed · click one to take it</i></span></div>' +
          '<div class="pb-acts">' + actCards + '</div>' +
          '<div class="pb-note"><b>The two shapes want opposite entries.</b> One has to be entered before it moves, the other averaged into while it falls — so nothing is tuned for both, and anything surviving both is a compromise. Deploy share is the lever none of these touch: it scales the dollars and changes no multiple and no liquidation day. Two listings, not a distribution.</div>' +
          MODEL_NOTE;
      }
    }

    var verdict = null;
    if (chart && p.days > 0 && p.lev > 0) {
      var sh = chart.sims.hype, sl = chart.sims.lit, dead = [], lived = [];
      (sh.alive ? lived : dead).push({ n: 'HYPE', d: sh.liqDay });
      (sl.alive ? lived : dead).push({ n: 'LIT',  d: sl.liqDay });
      var at = 'At ' + p.lev + '× over ' + p.days + ' days this entry was ';
      var closes = ' Liquidation is checked on daily closes, so an intraday wick is not modelled.';
      var where = function (m) { return 'on the ' + m.n + ' path on day ' + m.d; };
      var ceiling = safeLev == null ? ''
        : safeLev > 1
          ? ' The most leverage that survived both on this schedule is ' + safeLev + '×.'
          : ' Nothing above spot survived both on this schedule.';
      verdict = dead.length === 0
        ? { cls: 'ok',   head: 'Survived both paths',
            body: p.lev <= 1
              ? 'Unlevered, so there is no liquidation to survive — this is the spot-shaped version of the entry.'
              : at + 'never liquidated on either listing.' + ceiling }
        : dead.length === 1
        ? { cls: 'warn', head: 'Liquidated on the ' + dead[0].n + ' path',
            body: at + 'liquidated ' + where(dead[0]) + ', and survived ' + lived[0].n + '.' + ceiling + closes }
        : { cls: 'dead', head: 'Liquidated on both paths',
            body: at + 'liquidated ' + where(dead[0]) + ' and ' + where(dead[1]) + '.' + ceiling + closes };
    }

    /* The panel could tell you the position survived and what it made as a percentage, and
       still never say what the money did. That is the question the entry is being built to
       answer — put this in, get this out — so it gets stated in the currency it was put in,
       for both paths, next to the verdict. */
    var outcome = '';
    if (chart && budget > 0) {
      outcome = '<div class="pb-outrow"><span class="pb-glabel">Put in ' + usdExact(budget) +
        ' over ' + p.days + ' days, at ' + p.lev + '× — this is what came back</span>' +
        '<div class="pb-outs">' + ['hype', 'lit'].map(function (k) {
          var sm = chart.sims[k], name = k === 'hype' ? 'HYPE · Hyperliquid' : 'LIT · Lighter';
          var endUsd = sm.alive ? sm.finalEq * budget : 0;
          var d = endUsd - budget, up = d >= 0;
          return '<div class="pb-out ' + k + (sm.alive ? (up ? ' up' : ' down') : ' dead') + '">' +
            '<span>' + esc(name) + '</span>' +
            '<strong>' + usdExact(endUsd) + '</strong>' +
            '<em>' + (up ? '+' : '−') + usdExact(Math.abs(d)).replace('$', '$') + ' · ' +
            pnl(sm.alive ? sm.finalEq : 0) +
            (sm.alive ? '' : ' · liquidated D+' + sm.liqDay) + '</em></div>';
        }).join('') + '</div></div>';
    }

    var monitors = [
      { k: 'wallets', status: 'after TGE', statusCls: 'wait',
        head: 'Top 100 airdropped wallets',
        trigger: 'Net balance of the top 100 recipients stops falling — three consecutive days of flat-to-positive net flow.',
        why: 'This is the gate on step 3. Nothing in the playbook converts spot into collateral until this reads clear.',
        need: 'An indexer over the airdrop contract at TGE. No allocation list exists yet, so there is nothing to watch and no baseline to watch it against.' },
      { k: 'twap', status: 'planned', statusCls: 'on',
        head: 'Week-one TWAP, low leverage',
        /* Above $5B the plan has no entry, so the schedule reads as zeroes; say that instead. */
        trigger: p.days === 0
          ? 'Nothing to schedule at this FDV — above $5B the plan trims rather than adds.'
          : p.days + ' daily clips of ' + perDayStr + ' of the intended size, ' + p.lev + '× target, ' +
            (p.lev > 1
              ? 'liquidation ' + (chart ? pct(chart.sims.hype.liqFromEntry) : '—') + ' below average entry.'
              : 'unlevered — there is no liquidation price to clear.'),
        why: 'The only line in the playbook testable before listing — the panel above is that test.',
        need: 'A VAR perp that exists and is liquid on day one. Hyperliquid had its own perp from hour zero; where a VAR perp lists, and whether the book is deep enough to TWAP into, is unannounced.' },
      { k: 'collat', status: 'gated', statusCls: 'wait',
        head: 'Spot → collateral',
        trigger: 'Only after the wallet monitor reads clear. Posting spot as collateral raises the blended liquidation price on everything already open.',
        why: 'Adds leverage to a position that is already levered. The survivability panel is the check to run again, not once.',
        need: 'Variational accepting VAR as collateral, and a haircut. Neither is published.' },
      { k: 'olp', status: 'half live', statusCls: 'half',
        head: 'OLP deposits ÷ VAR staked',
        trigger: 'Rising ratio = deposits arriving faster than tokens are locked. Falling = the staking yield is being paid for by nothing.',
        why: 'The playbook calls this the cleanest read on the flywheel, and it is — it is the only one of the five that measures the business rather than the price.',
        need: 'The numerator is already on this site: OLP TVL is read on-chain in the Efficiency tab. The denominator does not exist until there is a token to stake.' },
      { k: 'lp', status: 'after TGE', statusCls: 'wait',
        head: 'On-chain VAR pools, hedged with perp longs',
        trigger: 'Early-stage LP yield above the funding cost of the hedge. Below it, the hedge eats the yield.',
        why: 'Worth stating plainly because it reads backwards at first: an LP position gives up upside as the price rises, and a perp long buys that upside back. It hedges the divergence loss, not the price.',
        need: 'A pool to LP into. Also the reason funding is charged in the panel above — the same funding rate sets whether this leg is profitable at all.' }
    ].map(function (m) {
      var src = PLAYBOOK.filter(function (q) { return q.k === m.k; })[0];
      /* One line each, not five cards. What a monitor is for is the trigger and its state —
         the quote and the two paragraphs of reasoning are reference, so they fold away and
         the five read as a board you can take in at a glance. */
      return '<div class="pb-sig">' +
        '<span class="pb-sig-n">' + ('0' + src.n).slice(-2) + '</span>' +
        '<b>' + esc(m.head) + '</b>' +
        '<em class="pb-st ' + m.statusCls + '">' + esc(m.status) + '</em>' +
        '<p>' + m.trigger + '</p>' +
        '<details class="pb-sig-more"><summary>context</summary>' +
        '<blockquote>' + esc(src.t) + '</blockquote>' +
        '<p>' + m.why + '</p><p>' + m.need + '</p></details>' +
        '</div>';
    }).join('');

    host.innerHTML =
      '<div class="cmp-heading"><span class="cmp-eyebrow">POST-TGE PLAYBOOK</span>' +
      '<h2>What happens once $VAR actually lists</h2>' +
      '<p>Two Paths reads the odds and stops there. This is the other half: a written plan, turned into the sizes, durations and leverage it implies, and run against what the two comparable listings actually did. Sizes are a share of whatever size you bring, not a position — this is a reference, not advice and not a forecast.</p></div>' +

      '<section class="pb-verdict">' +
      '<span class="pb-eyebrow">At ' + usdB(state.fdv) + ' the plan says</span>' +
      '<h3>' + esc(b.label) + '</h3>' +
      '<p class="pb-said">“' + esc(b.quote) + '”</p>' +
      '<p>' + (b.k === 'off'
        ? 'Above $5B the playbook stops buying and starts trimming. Every panel below is inert at this FDV by design — there is no entry to schedule.'
        /* No ° markers inside this sentence: i18n matches whole text nodes, so an inline
           element splits one sentence into three unmatchable fragments. The markers live on
           the three figures below, where each is a node of its own. */
        : 'That is ' + p.size + '% of the intended size, spread over ' + p.days + ' day' +
          (p.days === 1 ? '' : 's') + ' at ' + p.lev + '× — ' + perDayStr +
          ' of the size a day, and ' + notionalMult.toFixed(2).replace(/0$/, '') +
          '× the size in notional once the entry is complete.') + '</p>' +
      /* The three figures used to be repeated as tiles here. They are already the lit row of
         the band table and the lit chips in The Entry — three copies of 60% / 30d / 1.5× on
         one page, and the sentence above states them anyway. */
      '</section>' +

      '<section class="pb-tension"><span class="pb-eyebrow">Worth noticing</span>' +
      '<h4>The stated base case sits two bands below this site’s own estimate</h4>' +
      /* The rest of this used to spell out the two anchors and which bands they land in.
         The mark chips under the ladder now print exactly that, as data. */
      '<p>The playbook calls $1–2B its base case. This site’s own book multiple puts the listing at $2.81–4.12B — two bands above it, where the plan is cutting size rather than taking it.</p></section>' +

      '<div class="bw-head"><b>The Sizing Ladder</b><span><i>the five bands, and where every estimate this site holds lands on them</i></span></div>' +
      '<div class="pb-chips"><span>Listing FDV</span>' + fdvChips +
      '<label class="pb-inp">custom <input type="number" step="0.05" min="0" max="12" value="' +
      (state.fdv / 1e9).toFixed(2) + '" data-fdv-input> <em>B</em></label></div>' +
      ladder() +
      '<div class="pb-marks">' + markChips + '</div>' +
      '<div class="pb-note pb-marks-note">A range is one estimate priced off both of Lighter’s TGE anchors — the listing candle at $4.00B and CoinGecko’s first point eight days later. One number, two readings; not two estimates.</div>' +

      '<div class="pb-tablewrap"><table class="pb-table"><thead><tr>' +
      '<th>Listing FDV</th><th>The playbook, in its own words</th><th>Leverage</th>' +
      '</tr></thead><tbody>' + bandRows + '</tbody></table></div>' +
      '<div class="pb-note">Figures marked ' + DEG +
      ' are not in the playbook: it gives the five FDV boundaries, &ldquo;1 month&rdquo;, &ldquo;over a month or more&rdquo;, &ldquo;the first week&rdquo; and &ldquo;low leverage&rdquo;, nothing else. Sizes, days and leverage are read from those words and are adjustable below.</div>' +

      '<div class="bw-head"><b>The Entry</b><span><i>what &ldquo;TWAP in on low leverage&rdquo; costs, commits, and survives</i></span></div>' +
      '<div class="pb-chips"><span>Intended size</span>' + sizeChips +
      '<label class="pb-inp">custom $<input type="number" step="10000" min="0" value="' +
      Math.round(state.size) + '" data-size-input></label>' +
      '<span class="pb-sep">Deploy</span>' + pctChips + '</div>' +
      (p.size === 0 ? '<div class="pb-note pb-nodeploy">The plan deploys nothing at this FDV, so every figure below is zero. Pick a deploy share to simulate one anyway — the survivability marks on the chips are already live.</div>' : '') +
      '<div class="pb-chips"><span>Leverage</span>' + levChips +
      '<span class="pb-sep">Over</span>' + dayChips +
      '<button type="button" class="pb-reset" data-reset>reset to band</button></div>' +
      (bestChip ? '<div class="pb-chips pb-bestrow">' + bestChip +
        '<span class="pb-key"><i class="surv-ok"></i>survived both</span>' +
        '<span class="pb-key"><i class="surv-warn"></i>one only</span>' +
        '<span class="pb-key"><i class="surv-dead"></i>neither</span>' +
        '</div>' : '') +

      /* Five equal tiles said nothing about which three are arithmetic and which two are
         risk. Splitting them names the difference, and each tile's sub-line now states the
         operator that produced it, so the chain from the chips above is followed rather
         than inferred: intended × size = margin, margin ÷ days = clip, margin × lev =
         notional. */
      '<div class="pb-group">' +
      '<div class="pb-gcol"><span class="pb-glabel">What it commits</span>' +
      '<div class="pb-readout">' +
      '<div class="pb-ro"><span>Margin committed</span><strong>' + usdExact(budget) + '</strong><small>' +
        usd(state.size) + ' × ' + p.size + '%</small></div>' +
      '<div class="pb-ro"><span>Daily clip</span><strong>' + usdExact(clip) + '</strong><small>÷ ' +
        p.days + ' days</small></div>' +
      '<div class="pb-ro"><span>Notional at target</span><strong>' + usdExact(notional) + '</strong><small>× ' +
        p.lev + ' leverage</small></div>' +
      '</div></div>' +
      '<div class="pb-gcol"><span class="pb-glabel">What it risks</span>' +
      '<div class="pb-readout">' +
      '<div class="pb-ro' + (p.lev > 1 ? ' risk' : '') + '"><span>Liquidation</span><strong>' +
        (chart && p.lev > 1 ? pct(chart.sims.hype.liqFromEntry) : 'none') + '</strong><small>' +
        (p.lev > 1 ? 'below average entry' : 'unlevered — cannot be liquidated') + '</small></div>' +
      '<div class="pb-ro"><span>Funding drag</span><strong>' +
        usdExact(notional * fundingThrough(29)) + '</strong><small>30d at ' + (FUND_HOT * 100).toFixed(2) + '%' + DEG + '/day</small></div>' +
      '</div></div></div>' +

      (verdict ? '<div class="pb-verd ' + verdict.cls + '"><b>' + esc(verdict.head) + '</b>' +
        '<p>' + esc(verdict.body) + '</p></div>' : '') +
      outcome +
      /* No ° inside this paragraph: the marker is an inline element, i18n matches whole text
         nodes, and it was cutting the sentence in two so the tail stayed English. The same
         rate is marked in the Funding drag tile, which is a node of its own. */
      /* Nothing deployed means nothing to fund; the paragraph would be a row of $0. */
      (budget > 0 ? '<div class="pb-note"><b>Funding is why the long bands are the expensive ones.</b> A month at ' +
      (FUND_HOT * 100).toFixed(2) + '% a day costs ' + usdExact(notional * fundingThrough(29)) + ' on ' +
      /* usdExact, not usd: the compact form flips its suffix from K to M as the number grows
         and the translated key is matched on the shape around the figures, so "$300K" and
         "$1.50M" are two different shapes and the second one falls back to English. */
      usdExact(notional) + ' of notional before the price moves, and launch week on a hot listing runs several times that. Spot bids over the same month cost nothing to hold.</div>' : '') +


      (chart ?
        '<div class="bw-head"><b>Would It Have Survived?</b><span><i>each listing on its own: what its FDV did, and what the money put in was worth while it did</i></span></div>' +
        '<div class="pb-legend"><span class="mk entry"><i></i>your average entry</span>' +
        '<span class="mk liq"><i></i>your liquidation price</span>' +
        '<span class="up"><i></i>money above what went in</span>' +
        '<span class="down"><i></i>below it</span>' +
        '<span class="win"><i></i>the TWAP window</span></div>' +
        chart.svg +
        levTable +
        actCards +
        ''
        : '<div class="pb-note">' + (P
            ? 'There is no entry to simulate at this FDV — above $5B the plan trims rather than adds, so there is nothing to survive. The two listings above are what it would have been riding.'
            : 'The two price paths could not be read from the Two Paths tab, so the survivability panel is not shown.') + '</div>') +

      '<div class="bw-head"><b>The Five Monitors</b><span><i>what each one watches, and what would have to exist first</i></span></div>' +
      '<div class="pb-sigs">' + monitors + '</div>' +

      '<div class="pb-caveat"><b>What is still unknown</b>' +
      '<p>Total supply, day-one float, the unlock schedule and the listing date are all unannounced, and every one of them moves the FDV this whole ladder is indexed on. So does whether a VAR perp exists and is liquid at listing, whether public OLP is live, and whether VAR is accepted as collateral — steps 2, 3 and 4 of the playbook each assume one of those. The two anchors for Lighter’s own TGE differ by 47% and this site currently carries both. Nothing here is a price target, and none of it is advice. As of ' + ASOF + '.</p></div>';

    /* ---------- events ---------- */
    host.querySelectorAll('.pb-chips button,.pb-marks button,.pb-act,tr[data-lev]').forEach(function (el) {
      el.addEventListener('click', function () {
        var d = el.dataset;
        if (d.fdv) { state.fdv = Number(d.fdv); state.lev = state.days = state.sizePct = null; }
        else if (d.sizepct) state.sizePct = Number(d.sizepct);
        else if (d.size) state.size = Number(d.size);
        else if ('reset' in d) { state.lev = state.days = state.sizePct = null; }
        /* not else-if: a posture card carries both, and setting one without the other would
           land the reader on a pair that was never the one the card measured. */
        else { if (d.lev) state.lev = Number(d.lev); if (d.days) state.days = Number(d.days); }
        save(); render();
      });
    });
    var fi = host.querySelector('[data-fdv-input]');
    if (fi) fi.addEventListener('change', function () {
      var v = Number(fi.value);
      if (isFinite(v) && v > 0) { state.fdv = v * 1e9; state.lev = state.days = state.sizePct = null; save(); render(); }
    });
    var si = host.querySelector('[data-size-input]');
    if (si) si.addEventListener('change', function () {
      var v = Number(si.value);
      if (isFinite(v) && v > 0) { state.size = v; save(); render(); }
    });
    /* The staircase hit areas carry the same data-band contract as the table rows. */
    host.querySelectorAll('[data-band]').forEach(function (tr) {
      tr.addEventListener('click', function () {
        var band = BANDS.filter(function (x2) { return x2.k === tr.dataset.band; })[0];
        if (!band) return;
        state.fdv = band.max === Infinity ? 6.0e9 : (band.min + band.max) / 2;
        state.lev = state.days = state.sizePct = null;
        save(); render();
      });
    });
  }

  /* ---------- style ----------
     Injected rather than added to the page's stylesheet because this file ships on its
     own; the deploy CSP allows style-src 'unsafe-inline', which covers a <style> node.
     Tokens are the shell's own, so light and dark both follow without a second palette. */
  var CSS = [
    '.plan-report{padding:0 0 34px}',
    '.pb-fill{font-style:normal;color:var(--v2-accent,#4c9af8);font-weight:800;cursor:help;padding-left:1px}',
    '.pb-eyebrow{display:block;color:var(--dim)!important;font:800 9px var(--mono);letter-spacing:1.5px;text-transform:uppercase}',

    '.pb-verdict{display:block;',
    'margin:0 0 16px;padding:20px;border:1px solid var(--line);border-left:3px solid var(--v2-accent,#4c9af8);',
    'background:rgba(255,255,255,.02);background:color-mix(in srgb,var(--panel) 88%,transparent)}',
    '.pb-verdict h3{margin:9px 0 8px;color:var(--text);font:800 30px/1.15 var(--sans);letter-spacing:-.02em}',
    '.pb-verdict p{margin:0;color:var(--muted)!important;font-size:12.5px;line-height:1.7}',
    '.pb-verdict p.pb-said{margin:0 0 10px;padding-left:11px;border-left:2px solid var(--line);',
    'color:var(--text)!important;font-size:13.5px;font-style:italic;line-height:1.6}',

    '.pb-tension{margin:0 0 26px;padding:15px 18px;border:1px solid var(--line);border-left:3px solid #f7b955;',
    'background:rgba(255,255,255,.015);background:color-mix(in srgb,var(--panel) 70%,transparent)}',
    '.pb-tension h4{margin:6px 0 8px;color:var(--text);font:800 16px/1.35 var(--sans);letter-spacing:-.01em}',
    '.pb-tension p{margin:0;color:var(--muted)!important;font-size:12.5px;line-height:1.72}',
    '.pb-tension b{color:var(--text)!important;font-weight:800}',

    '.pb-chips{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 14px}',
    '.pb-chips>span{color:var(--muted)!important;font:800 9.5px var(--mono);letter-spacing:.8px;text-transform:uppercase}',
    '.pb-chips>span.pb-sep{margin-left:10px}',
    '.pb-chips button{padding:6px 12px;border:1px solid var(--line);background:var(--panel);cursor:pointer;',
    'color:var(--muted);font:700 11px var(--mono);border-radius:6px}',
    '.pb-chips button:hover{color:var(--text)}',
    '.pb-chips button.on{background:var(--v2-accent,#4c9af8);border-color:var(--v2-accent,#4c9af8);color:#04101d}',
    'body.theme-light .pb-chips button.on{color:#fff}',
    '.pb-chips button.pb-reset{margin-left:auto;border-style:dashed;font-size:10px}',
    /* The chip is the control and the bar under it is the answer, so the reader can see the
       whole survivable range at once instead of clicking through it one value at a time. */
    '.pb-chips button.surv-ok,.pb-chips button.surv-warn,.pb-chips button.surv-dead',
    '{position:relative;padding-bottom:9px}',
    '.pb-chips button[class*="surv-"]::after{content:"";position:absolute;left:7px;right:7px;',
    'bottom:4px;height:2px;border-radius:1px}',
    '.pb-chips button.surv-ok::after{background:#4fd39a}',
    '.pb-chips button.surv-warn::after{background:#f7b955}',
    '.pb-chips button.surv-dead::after{background:#ff6b8b}',
    '.pb-bestrow{margin-top:-2px;align-items:center}',
    '.pb-nodeploy{margin:-2px 0 12px}',
    '.pb-chips button.pb-best{border-color:var(--v2-accent,#4c9af8);color:var(--v2-accent,#4c9af8);',
    'font-weight:800;letter-spacing:.3px}',
    '.pb-chips button.pb-best:hover{background:var(--v2-accent,#4c9af8);color:var(--v2-bg)}',
    '.pb-key{display:inline-flex;align-items:center;gap:5px;color:var(--dim)!important;',
    'font:700 9px var(--mono);letter-spacing:.6px;text-transform:uppercase}',
    '.pb-key>i{width:12px;height:2px;border-radius:1px;flex:0 0 auto}',
    '.pb-key>i.surv-ok{background:#4fd39a}.pb-key>i.surv-warn{background:#f7b955}',
    '.pb-key>i.surv-dead{background:#ff6b8b}',
    '.pb-inp{display:inline-flex;align-items:center;gap:5px;color:var(--muted)!important;',
    'font:700 10px var(--mono);letter-spacing:.5px;text-transform:uppercase}',
    '.pb-inp input{width:82px;padding:5px 7px;border:1px solid var(--line);border-radius:6px;',
    'background:var(--panel2);color:var(--text);font:700 11px var(--mono);font-family:var(--mono)}',
    '.pb-inp em{font-style:normal}',

    '.pb-ladder{width:100%;height:auto;margin:0 0 8px;overflow:visible}',
    '.pb-cap{fill:var(--dim);font:700 9px var(--mono);letter-spacing:1.2px;text-transform:uppercase}',
    /* pb-lgrid, not pb-grid: the survivability chart further down already owns .pb-grid
       and its rule sits later in this stylesheet, so sharing the name silently restyled
       this one. */
    '.pb-lgrid{stroke:var(--line);stroke-width:1;stroke-dasharray:2 4}',
    '.pb-lgrid.base{stroke-dasharray:none;stroke:var(--muted);opacity:.6}',
    '.pb-ytick{fill:var(--dim);font:700 9.5px var(--mono);letter-spacing:.3px}',
    /* The fill is the step, so it carries the band colour; the outline traces the whole
       staircase in one stroke, which is the line the eye follows. */
    '.pb-step{stroke:none}',
    '.pb-step.b1{fill:#4fd6c3;fill-opacity:.13}.pb-step.b2{fill:#4fd6c3;fill-opacity:.09}',
    '.pb-step.b3{fill:#f7b955;fill-opacity:.12}.pb-step.b4{fill:#f7b955;fill-opacity:.17}',
    '.pb-step.b5{fill:#ff6b8b;fill-opacity:.16}',
    '.pb-step.on{fill-opacity:.34}',
    '.pb-stair{fill:none;stroke:var(--v2-accent,#4c9af8);stroke-width:2;stroke-linejoin:round}',
    '.pb-band-sep{stroke:var(--line);stroke-width:1;opacity:.7}',
    /* the lit column behind the chosen band */
    '.pb-sel{fill:var(--v2-accent,#4c9af8);fill-opacity:.07}',
    /* a bead sits on the accent staircase, so it needs a ring of the page behind it to
       stay a dot rather than a bulge in the line */
    '.pb-bead{fill:var(--v2-accent,#4c9af8);stroke:var(--panel);stroke-width:2.5}',
    '.pb-bead.hype{fill:#4fd6c3}.pb-bead.lit{fill:#b98cff}',
    'body.theme-light .pb-bead{stroke:#fbfcfe}',
    'body.theme-light .pb-bead.hype{fill:#0e7a6b}body.theme-light .pb-bead.lit{fill:#6b3fd0}',
    '.pb-step-l{fill:var(--muted);font:800 11.5px var(--mono);letter-spacing:.4px}',
    /* The selected step is named in the accent, the same colour as the staircase stroke and
       the lit chip above it. In dark theme --text would do the job, but the shell flattens
       every svg text in light theme to one dark blue with !important, so without a colour of
       its own the chosen step would look exactly like the four that are not chosen. */
    '.pb-step-l.on{fill:var(--v2-accent,#4c9af8);font-size:12.5px}',
    '.pb-step-n{fill:var(--muted);font:800 19px var(--mono);letter-spacing:-.5px;opacity:.8}',
    '.pb-step-n.on{fill:var(--v2-accent,#4c9af8);opacity:1;font-size:22px}',
    '.pb-step-d{fill:var(--dim);font:700 10px var(--mono);letter-spacing:.3px}',
    '.pb-hit{fill:transparent;cursor:pointer}',
    '.pb-hit:hover{fill:var(--v2-accent,#4c9af8);fill-opacity:.07}',
    /* lane */
    /* the two ends of one estimate, joined across the steps they land on */
    '.pb-bead-span{stroke:var(--v2-accent,#4c9af8);stroke-width:1.5;stroke-dasharray:3 3;opacity:.6}',
    /* body.theme-light svg text{fill:#153b67!important} is a shell-wide rule, so every fill
       that still has to mean something in light theme has to say !important back. */
    'body.theme-light .pb-ladder .pb-step-l.on,body.theme-light .pb-ladder .pb-step-n.on',
    '{fill:var(--v2-accent)!important}',
    'body.theme-light .pb-ladder .pb-cap,body.theme-light .pb-ladder .pb-ytick,',
    'body.theme-light .pb-ladder .pb-axis,body.theme-light .pb-ladder .pb-step-d{fill:#55687f!important}',
    '.pb-needle{stroke:var(--text);stroke-width:1.8}',
    '.pb-needle-h{fill:var(--text)}',
    '.pb-axis{fill:var(--dim);font:700 10px var(--mono);letter-spacing:.4px}',

    /* the valuations, as things you can click rather than labels crowding an axis */
    '.pb-marks{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;',
    'margin:4px 0 10px}',
    '.pb-mark{display:grid;grid-template-columns:10px minmax(0,1fr);gap:2px 8px;align-items:baseline;',
    'padding:9px 11px;border:1px solid var(--line);border-radius:3px;background:var(--panel);',
    'text-align:left;cursor:pointer;min-width:0;transition:border-color .15s ease,background .15s ease}',
    '.pb-mark:hover{border-color:var(--v2-accent,#4c9af8);background:var(--panel2)}',
    '.pb-mark>i{grid-row:1/3;width:8px;height:8px;border-radius:50%;align-self:center;',
    'background:var(--v2-accent,#4c9af8)}',
    '.pb-mark.hype>i{background:#4fd6c3}.pb-mark.lit>i{background:#b98cff}',
    'body.theme-light .pb-mark.hype>i{background:#0e7a6b}body.theme-light .pb-mark.lit>i{background:#6b3fd0}',
    '.pb-mark>span{color:var(--muted)!important;font:700 9.5px var(--mono);letter-spacing:.5px;',
    'text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.pb-mark>b{grid-column:2;color:var(--text);font:800 14px var(--mono);letter-spacing:-.4px}',
    '.pb-mark>em{grid-column:2;color:var(--dim)!important;font:600 10.5px var(--sans);',
    'font-style:normal;line-height:1.35}',
    '.pb-marks-note{margin:0 0 20px}',
    '.pb-legend{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 18px;padding:8px 11px;',
    'border:1px solid var(--line);background:rgba(255,255,255,.015);background:color-mix(in srgb,var(--panel) 60%,transparent)}',
    '.pb-legend span{display:inline-flex;align-items:center;gap:7px;color:var(--muted)!important;font-size:11px;line-height:1.5}',
    '.pb-legend i{width:14px;height:3px;border-radius:2px;flex:0 0 auto;background:var(--v2-accent,#4c9af8)}',
    '.pb-legend .hype i{background:#4fd6c3}.pb-legend .lit i{background:#b98cff}',
    '.pb-legend .one i{background:var(--muted);height:1px}',
    '.pb-legend .win i{background:var(--v2-accent,#4c9af8);opacity:.18;height:12px;width:18px;border-radius:0}',

    '.pb-tablewrap{overflow-x:auto;margin:0 0 10px}',
    '.pb-table{width:100%;min-width:0!important;border-collapse:collapse;font-size:14px}',
    '.pb-table th{padding:12px;border-bottom:1px solid var(--line);color:var(--muted)!important;',
    'font:800 11px var(--mono);letter-spacing:.8px;text-transform:uppercase;text-align:right}',
    '.pb-table th:first-child,.pb-table th:nth-child(2){text-align:left}',
    '.pb-table td{padding:14px 12px;border-bottom:1px solid var(--line);text-align:right;vertical-align:top}',
    '.pb-row{cursor:pointer}',
    '.pb-row:hover td{background:rgba(255,255,255,.03)}',
    'body.theme-light .pb-row:hover td{background:rgba(0,0,0,.03)}',
    '.pb-row.on td{background:rgba(76,154,248,.09)}',
    '.pb-rng{text-align:left!important;min-width:150px}',
    '.pb-rng>b{display:block;color:var(--text);font:800 14px var(--mono);letter-spacing:-.2px}',
    '.pb-rng>small{display:block;margin-top:3px;color:var(--muted)!important;font-size:11.5px}',
    '.pb-quote{text-align:left!important;color:var(--muted)!important;font-size:12.5px;line-height:1.6;min-width:240px}',
    '.pb-row.on .pb-quote{color:var(--text)!important}',
    '.pb-n{font:700 14px var(--mono);color:var(--muted)!important;white-space:nowrap}',
    '.pb-row.on .pb-n{color:var(--text)!important;font-weight:800}',
    '.pb-n>small{color:var(--muted)!important;font-size:10px;margin-left:3px}',

    '.pb-note{margin:0 0 26px;color:var(--muted)!important;font-size:11px;line-height:1.7}',
    '.pb-note b{color:var(--text)!important;font-weight:800}',

    '.pb-group{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:16px;margin:2px 0 12px}',
    '.pb-gcol{min-width:0}',
    '.pb-glabel{display:block;margin:0 0 7px;color:var(--dim)!important;font:800 9px var(--mono);',
    'letter-spacing:1.2px;text-transform:uppercase}',
    '.pb-group .pb-readout{grid-template-columns:repeat(auto-fit,minmax(0,1fr));margin:0}',
    '.pb-ro.risk>strong{color:#f7b955}',
    'body.theme-light .pb-ro.risk>strong{color:#9a6300}',
    /* the verdict on exactly the entry the chips above describe */
    '.pb-verd{margin:0 0 16px;padding:11px 14px;border:1px solid var(--line);',
    'border-left:3px solid var(--muted);background:var(--panel)}',
    '.pb-verd>b{display:block;color:var(--text);font:800 12px var(--sans);letter-spacing:-.01em}',
    '.pb-verd>p{margin:4px 0 0;color:var(--muted)!important;font-size:11.5px;line-height:1.6}',
    '.pb-outrow{margin:0 0 18px}',
    '.pb-outs{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}',
    '.pb-out{padding:12px 15px;border:1px solid var(--line);border-left:3px solid var(--muted);',
    'background:var(--panel);min-width:0}',
    '.pb-out>span{display:block;color:var(--muted)!important;font:800 9px var(--mono);',
    'letter-spacing:.9px;text-transform:uppercase}',
    '.pb-out>strong{display:block;margin:6px 0 3px;color:var(--text);font:800 26px/1 var(--mono);',
    'letter-spacing:-.8px}',
    '.pb-out>em{display:block;color:var(--muted)!important;font:700 11.5px var(--mono);',
    'font-style:normal;letter-spacing:-.1px}',
    '.pb-out.up{border-left-color:#4fd39a}.pb-out.up>em{color:#4fd39a!important}',
    '.pb-out.down{border-left-color:#f7b955}.pb-out.down>em{color:#f7b955!important}',
    '.pb-out.dead{border-left-color:#ff6b8b}.pb-out.dead>strong{color:var(--muted)}',
    '.pb-out.dead>em{color:#ff6b8b!important}',
    'body.theme-light .pb-out.up>em{color:#0e7a52!important}',
    'body.theme-light .pb-out.down>em{color:#9a6300!important}',
    'body.theme-light .pb-out.dead>em{color:#c22a4c!important}',
    '.pb-verd.ok{border-left-color:#4fd39a}.pb-verd.ok>b{color:#4fd39a}',
    '.pb-verd.warn{border-left-color:#f7b955}.pb-verd.warn>b{color:#f7b955}',
    '.pb-verd.dead{border-left-color:#ff6b8b}.pb-verd.dead>b{color:#ff6b8b}',
    'body.theme-light .pb-verd.ok>b{color:#0e7a52}body.theme-light .pb-verd.warn>b{color:#9a6300}',
    'body.theme-light .pb-verd.dead>b{color:#c22a4c}',
    '@media(max-width:820px){.pb-group{grid-template-columns:1fr}}',
    '.pb-readout{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:2px 0 14px}',
    '.pb-ro{padding:13px 15px;border:1px solid var(--line);background:var(--panel);min-width:0}',
    '.pb-ro>span{display:block;color:var(--muted)!important;font:800 9px var(--mono);letter-spacing:.8px;text-transform:uppercase}',
    '.pb-ro>strong{display:block;margin:8px 0 4px;color:var(--text);font:800 21px/1 var(--mono);letter-spacing:-.6px}',
    '.pb-ro>small{color:var(--muted)!important;font-size:10.5px;line-height:1.45}',

    'background:rgba(255,255,255,.015);background:color-mix(in srgb,var(--panel) 74%,transparent)}',

    /* the two real price paths */
    '.pb-px{width:100%;height:auto;margin:2px 0 10px;overflow:visible}',
    '.pb-px-tag{fill:#4fd6c3;font:800 10px var(--mono);letter-spacing:.9px;text-transform:uppercase}',
    '.pb-px-tag.lit{fill:#b98cff}',
    '.pb-px-span{fill:var(--dim);font:700 9px var(--mono);letter-spacing:.4px}',
    'body.theme-light .pb-px .pb-px-span{fill:#55687f!important}',
    'body.theme-light .pb-px .pb-px-tag{fill:#0e7a6b!important}',
    'body.theme-light .pb-px .pb-px-tag.lit{fill:#6b3fd0!important}',
    '.pb-pxline{fill:none;stroke:#4fd6c3;stroke-width:1.8;stroke-linejoin:round}',
    '.pb-pxline.lit{stroke:#b98cff}',
    'body.theme-light .pb-pxline{stroke:#0e7a6b}body.theme-light .pb-pxline.lit{stroke:#6b3fd0}',
    '.pb-px-liq{stroke:#ff6b8b;stroke-width:1.2;stroke-dasharray:3 3}',
    '.pb-px-liq-t{fill:#ff6b8b;font:800 9px var(--mono);letter-spacing:.5px}',
    'body.theme-light .pb-px .pb-px-liq-t{fill:#c22a4c!important}',
    'body.theme-light .pb-px-liq{stroke:#c22a4c}',
    '.pb-px-end{fill:#4fd6c3;font:800 11px var(--mono);letter-spacing:-.2px}',
    '.pb-px-end.lit{fill:#b98cff}',
    'body.theme-light .pb-px .pb-px-end{fill:#0e7a6b!important}',
    'body.theme-light .pb-px .pb-px-end.lit{fill:#6b3fd0!important}',
    '.pb-eq{width:100%;height:auto;margin:0 0 14px}',
    '.pb-eqsub{fill:var(--muted);font:700 10px var(--mono);letter-spacing:-.1px}',
    /* up and down read before any number does */
    '.pb-zone.up{fill:#4fd39a;fill-opacity:.05}.pb-zone.down{fill:#ff6b8b;fill-opacity:.06}',
    'body.theme-light .pb-zone.up{fill-opacity:.07}body.theme-light .pb-zone.down{fill-opacity:.07}',
    '.pb-eqbase{fill:var(--dim);font:700 9px var(--mono);letter-spacing:.6px;text-transform:uppercase}',
    /* the two lines the entry lives between, on the price row */
    '.pb-entry{stroke:var(--v2-accent,#4c9af8);stroke-width:1.4;stroke-dasharray:5 3}',
    '.pb-entry-t{fill:var(--v2-accent,#4c9af8);font:800 9.5px var(--mono);letter-spacing:-.1px}',
    'body.theme-light .pb-eq .pb-entry-t{fill:var(--v2-accent)!important}',
    '.pb-liqline{stroke:#ff6b8b;stroke-width:1.4;stroke-dasharray:3 3}',
    '.pb-liqline-t{fill:#ff6b8b;font:800 9.5px var(--mono);letter-spacing:-.1px}',
    'body.theme-light .pb-liqline{stroke:#c22a4c}',
    'body.theme-light .pb-eq .pb-liqline-t{fill:#c22a4c!important}',
    '.pb-legend .entry i{background:var(--v2-accent,#4c9af8);height:2px}',
    '.pb-legend .liq i{background:#ff6b8b;height:2px}',
    'body.theme-light .pb-legend .liq i{background:#c22a4c}',
    'body.theme-light .pb-eq .pb-eqbase{fill:#55687f!important}',
    '.pb-eqlow{fill:var(--v2-accent,#4c9af8);stroke:var(--panel);stroke-width:2}',
    'body.theme-light .pb-eqlow{stroke:#fbfcfe}',
    '.pb-eqlow-t{fill:var(--v2-accent,#4c9af8);font:800 9.5px var(--mono);letter-spacing:-.1px}',
    'body.theme-light .pb-eq .pb-eqlow-t{fill:var(--v2-accent)!important}',
    '.pb-legend .up i{background:#4fd39a;opacity:.5;height:12px;width:18px;border-radius:0}',
    '.pb-legend .down i{background:#ff6b8b;opacity:.5;height:12px;width:18px;border-radius:0}',
    '.pb-eqsub.hype{fill:#4fd6c3}.pb-eqsub.lit{fill:#b98cff}',
    'body.theme-light .pb-eq .pb-eqsub.hype{fill:#0e7a6b!important}',
    'body.theme-light .pb-eq .pb-eqsub.lit{fill:#6b3fd0!important}',
    '.pb-grid{stroke:var(--line);stroke-width:1;opacity:.55}',
    '.pb-grid.one{opacity:1;stroke-dasharray:4 3}',
    '.pb-zero{stroke:var(--line);stroke-width:1.2}',
    '.pb-ax{fill:var(--dim);font:700 10px var(--mono);letter-spacing:.3px}',
    '.pb-ax.one{fill:var(--muted);font-weight:800}',
    '.pb-twapwin{fill:var(--v2-accent,#4c9af8);opacity:.08}',
    '.pb-twapwin-t{fill:var(--v2-accent,#4c9af8);font:800 9.5px var(--mono);letter-spacing:.6px}',
    '.pb-eqline{fill:none;stroke-width:2.1;stroke-linejoin:round}',
    '.pb-eqline.hype{stroke:#4fd6c3}.pb-eqline.lit{stroke:#b98cff}',
    '.pb-eqline.dead{stroke-dasharray:3 3;stroke-width:1.4;opacity:.7}',
    '.pb-eqlab{font:800 12px var(--mono);letter-spacing:.2px}',
    '.pb-eqlab.hype{fill:#4fd6c3}.pb-eqlab.lit{fill:#b98cff}',
    '.pb-liq circle{fill:none;stroke-width:1.6}',
    '.pb-liq path{stroke-width:1.8;stroke-linecap:round}',
    '.pb-liq.hype circle,.pb-liq.hype path{stroke:#4fd6c3}',
    '.pb-liq.lit circle,.pb-liq.lit path{stroke:#b98cff}',

    'background:var(--panel);min-width:0}',
    'text-transform:uppercase}',
    'line-height:1.4;letter-spacing:-.01em}',
    'background:transparent;color:var(--v2-accent,#4c9af8);font:800 10px var(--mono);',
    'letter-spacing:.4px;cursor:pointer}',
    'border-top:3px solid var(--muted);border-radius:0;background:var(--panel);text-align:left;',
    'cursor:pointer;min-width:0;transition:background .15s ease,border-color .15s ease}',
    '.pb-pos:hover{background:var(--panel2);border-color:var(--v2-accent,#4c9af8)}',
    '.pb-pos-tag{display:block;color:var(--dim)!important;font:800 8.5px var(--mono);',
    'letter-spacing:1.1px;text-transform:uppercase}',
    'letter-spacing:-.015em}',
    '.pb-pos-set{display:block;margin-bottom:9px;color:var(--v2-accent,#4c9af8)!important;',
    'font:800 12px var(--mono);font-style:normal;letter-spacing:-.2px}',
    /* action first: the setting is the headline, the two outcomes are the answer */
    '.pb-acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(226px,1fr));gap:12px;margin:0 0 14px}',
    '.pb-act{display:block;width:100%;padding:14px 16px;border:1px solid var(--line);',
    'border-top:3px solid var(--muted);border-radius:0;background:var(--panel);text-align:left;',
    'cursor:pointer;min-width:0;transition:background .15s ease,border-color .15s ease}',
    '.pb-act:hover{background:var(--panel2);border-color:var(--v2-accent,#4c9af8)}',
    '.pb-act.ok{border-top-color:#4fd39a}.pb-act.warn{border-top-color:#f7b955}',
    '.pb-act.dead{border-top-color:#ff6b8b}',
    '.pb-act-tag{display:block;color:var(--dim)!important;font:800 8.5px var(--mono);',
    'letter-spacing:1.1px;text-transform:uppercase}',
    '.pb-act.ok .pb-act-tag{color:#4fd39a!important}.pb-act.warn .pb-act-tag{color:#f7b955!important}',
    '.pb-act.dead .pb-act-tag{color:#ff6b8b!important}',
    'body.theme-light .pb-act.ok .pb-act-tag{color:#0e7a52!important}',
    'body.theme-light .pb-act.warn .pb-act-tag{color:#9a6300!important}',
    'body.theme-light .pb-act.dead .pb-act-tag{color:#c22a4c!important}',
    '.pb-act>b{display:block;margin:4px 0 10px;color:var(--text);font:800 22px/1 var(--mono);',
    'letter-spacing:-.8px}',
    '.pb-act dl{display:grid;gap:3px;margin:0 0 6px;padding:9px 0 0;border-top:1px solid var(--line)}',
    '.pb-act dl>div{display:flex;justify-content:space-between;gap:8px;align-items:baseline}',
    '.pb-act dt{color:var(--dim)!important;font:700 9px var(--mono);letter-spacing:.7px}',
    '.pb-act dd{margin:0;color:var(--text);font:800 13px var(--mono);letter-spacing:-.35px;text-align:right}',
    '.pb-act dd>i{font-style:normal;font-size:11px;color:var(--muted)!important;font-weight:700}',
    '.pb-act dd.x{color:#ff6b8b}body.theme-light .pb-act dd.x{color:#c22a4c}',
    '.pb-act>em{display:block;margin:0 0 9px;color:var(--muted)!important;font:700 10px var(--mono);',
    'font-style:normal;letter-spacing:-.1px}',
    '.pb-act>p{margin:0;color:var(--dim)!important;font-size:11px;line-height:1.55}',
    '.pb-levtable td.pb-n{text-align:right}',
    '.pb-levtable td.pb-n>b{display:block;color:var(--text);font:800 14px var(--mono);letter-spacing:-.4px}',
    '.pb-levtable td.pb-n>small{display:block;margin-top:2px;color:var(--muted)!important;',
    'font:600 10px var(--mono);letter-spacing:-.1px}',
    '.pb-levtable td.pb-n.dead>b{color:#ff6b8b}',
    'body.theme-light .pb-levtable td.pb-n.dead>b{color:#c22a4c}',
    '.pb-levtable td.pb-rng>b{font:800 15px var(--mono)}',
    '.pb-levtable td.pb-rng>small{display:block;margin-top:2px;color:var(--v2-accent,#4c9af8)!important;',
    'font:700 9px var(--mono);letter-spacing:.6px;text-transform:uppercase}',

    '.pb-sigs{margin:0 0 22px;border-top:1px solid var(--line)}',
    '.pb-sig{display:grid;grid-template-columns:26px minmax(0,1fr) auto;column-gap:12px;row-gap:5px;',
    'padding:11px 2px 12px;border-bottom:1px solid var(--line);align-items:baseline}',
    '.pb-sig-n{grid-column:1;grid-row:1;color:var(--dim)!important;font:800 9.5px var(--mono);letter-spacing:.5px}',
    '.pb-sig>b{grid-column:2;color:var(--text);font:800 12.5px var(--sans);letter-spacing:-.01em}',
    '.pb-sig>.pb-st{grid-column:3;justify-self:end}',
    '.pb-sig>p{grid-column:2/-1;margin:0;color:var(--muted)!important;font-size:11.5px;line-height:1.55}',
    '.pb-sig-more{grid-column:2/-1;margin:1px 0 0}',
    '.pb-sig-more>summary{display:inline-block;color:var(--dim)!important;font:700 9px var(--mono);',
    'letter-spacing:.7px;text-transform:uppercase;cursor:pointer;list-style:none}',
    '.pb-sig-more>summary::-webkit-details-marker{display:none}',
    '.pb-sig-more>summary::before{content:"+ "}',
    '.pb-sig-more[open]>summary::before{content:"− "}',
    '.pb-sig-more>summary:hover{color:var(--text)!important}',
    '.pb-sig-more blockquote{margin:8px 0 0;padding:0 0 0 10px;border-left:2px solid var(--line);',
    'color:var(--text)!important;font-size:11.5px;font-style:italic;line-height:1.55}',
    '.pb-sig-more>p{margin:7px 0 0;color:var(--muted)!important;font-size:11.5px;line-height:1.6}',
    '.pb-st{flex:0 0 auto;padding:2px 7px;border-radius:4px;font:800 8.5px var(--mono);letter-spacing:.7px;',
    'text-transform:uppercase;font-style:normal;border:1px solid var(--line)}',
    '.pb-st.on{color:#4fd39a!important;border-color:#4fd39a66}',
    '.pb-st.half{color:#f7b955!important;border-color:#f7b95566}',
    '.pb-st.wait{color:var(--dim)!important}',
    'body.theme-light .pb-st.on{color:#0e7a52!important}body.theme-light .pb-st.half{color:#9a6300!important}',

    '.pb-caveat{padding:15px 17px;border:1px dashed var(--line);background:rgba(255,255,255,.012);',
    'background:color-mix(in srgb,var(--panel) 70%,transparent)}',
    '.pb-caveat>b{display:block;margin-bottom:7px;color:var(--text);font:800 11px var(--mono);letter-spacing:.7px;text-transform:uppercase}',
    '.pb-caveat p{margin:0;color:var(--muted)!important;font-size:11.5px;line-height:1.7}',

    '@media(max-width:1150px){.pb-readout{grid-template-columns:repeat(3,minmax(0,1fr))}}',
    '@media(max-width:860px){.pb-readout{grid-template-columns:repeat(2,minmax(0,1fr))}',
    '.pb-verdict h3{font-size:24px}}'
  ].join('');

  function injectCss() {
    if (document.getElementById('playbook-style')) return;
    var st = document.createElement('style');
    st.id = 'playbook-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- tab plumbing ----------
     Same shape as paths-panels.js: #tabs is the real source of tab state and the side rail
     only delegates to it, so a section without a matching #tab-<name> button never unhides. */
  function mount() {
    if (document.querySelector('[data-tg="plan"]')) return;
    var main = document.querySelector('#main');
    if (!main) return;
    var sec = document.createElement('section');
    sec.className = 'plan-report tsec tg-hide';
    sec.setAttribute('data-tg', 'plan');
    var anchor = document.querySelector('[data-tg="roadmap"]');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else main.appendChild(sec);
    mountTabButton();
    mountRail();
  }

  function mountTabButton() {
    if (document.getElementById('tab-plan')) return;
    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    var after = document.getElementById('tab-roadmap');
    var b = document.createElement('button');
    b.id = 'tab-plan';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.dataset.tab = 'plan';
    b.textContent = 'Playbook';
    if (after && after.parentNode === tabs) tabs.insertBefore(b, after);
    else tabs.appendChild(b);
  }

  /* Cloned from the roadmap rail button and inserted before it, then every rail is
     renumbered top to bottom — the same trick Two Paths uses, and the reason both stay
     correct whether or not the pretge/tradfi build patchers have run. */
  function mountRail() {
    var rails = {};
    document.querySelectorAll('[data-open-tab="roadmap"]').forEach(function (btn) {
      var rail = btn.parentNode;
      if (!rail || rail.querySelector('[data-open-tab="plan"]')) return;
      var mine = btn.cloneNode(true);
      mine.setAttribute('data-open-tab', 'plan');
      var strong = mine.querySelector('strong') || mine.querySelector('b');
      if (strong) strong.textContent = 'Playbook';
      var small = mine.querySelector('small');
      if (small) small.textContent = 'what to do on listing day';
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
    try {
      if (typeof VALID_TABS !== 'undefined' && VALID_TABS.indexOf('plan') < 0) VALID_TABS.push('plan');
      if (typeof DEFAULT_TAB_ORDER !== 'undefined' && DEFAULT_TAB_ORDER.indexOf('plan') < 0) {
        var i = DEFAULT_TAB_ORDER.indexOf('paths');
        DEFAULT_TAB_ORDER.splice(i < 0 ? DEFAULT_TAB_ORDER.length : i + 1, 0, 'plan');
      }
      if (typeof SECTION_COPY !== 'undefined') SECTION_COPY.plan = {
        eyebrow: 'Execution',
        title: 'Post-TGE Playbook',
        description: 'The written post-TGE plan turned into sizes, durations and leverage, and run against what HYPE and Lighter actually did after listing.',
        chip: 'the plan'
      };
    } catch (_) {}
  }

  function boot() {
    injectCss();
    mount();
    registerTab();
    render();
    if (location.hash === '#plan' && typeof showTab === 'function') {
      try { showTab('plan', { push: false }); } catch (_) {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
