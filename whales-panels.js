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
  var PROFILES = {};

  function profileFor(w) { return PROFILES[w.handle.toLowerCase()] || w; }

  function profileAvatar(w) {
    var p = profileFor(w);
    return p.avatar
      ? '<img src="' + esc(p.avatar) + '" alt="' + esc(p.name || w.name) + ' profile" width="56" height="56" loading="lazy">'
      : '<span class="wh-avatar" aria-hidden="true">' + esc(w.name.slice(0, 2).toUpperCase()) + '</span>';
  }

  function loadProfiles() {
    fetch('assets/whales/profiles.json').then(function (response) {
      if (!response.ok) throw new Error('Profiles unavailable');
      return response.json();
    }).then(function (profiles) {
      PROFILES = profiles;
      render();
      renderNext();
    }).catch(function () { /* Existing names and links remain usable. */ });
  }

  var WHALES = [
    {
      handle: 'corgil', name: 'CorgiI',
      points: 10000, approximate: true, rank: null, tier: 'Self-reported', asOf: '2026-10-09',
      post: 'https://x.com/corgil/status/2108398853141508484',
      cardSource: 'https://x.com/corgil/status/2083904756980883565',
      cardImage: 'assets/whales/corgil-2026-08-02-card.jpg',
      said: ['Oct 9: self-reported ~10k points after 15 months', 'Earlier Aug 2 card: 9,143 points · rank 90 · Silver', 'Current rank not disclosed; the Aug 2 rank is historical']
    },
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

  /* Missing dated balances use an explicit Top 100 scenario, never a verified rank. */
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
      pointsLabel: '30,000+ band', rankLabel: '~6',
      minimumEstimate: 30000,
      pointsSource: 'https://ngntipkolamrenang.twstalker.com/poorlydrNFT',
      note: 'An indexed repost of Lynn03’s earlier public list places Lynn03 around #6 and describes the top 10 as holding 30k+ points. This is an indirect range, not an exact balance. Original date unverified; account now protected.'
    },
    {
      handle: 'choffstein', name: 'Corey Hoffstein',
      profile: 'https://x.com/choffstein',
      post: 'https://x.com/choffstein/status/2099488773985775639',
      asOf: '2026-09-14',
      note: 'Hosted a discussion with Variational co-founder Lucas Scheurmann on Omni, RFQ liquidity and swaps. No personal points total verified; the interview is not evidence of a points holding.'
    },
    {
      handle: 'JUDEAU_1', name: 'Judeau.Var',
      profile: 'https://x.com/JUDEAU_1',
      pointsLabel: '~10,500',
      pointsSource: 'https://w.twstalker.com/RlEylKAy17',
      note: 'An indexed repost attributes a historical self-report of about 8k points on the main account and 2.5k on an alt to JUDEAU_1 (~10.5k combined). Original post date and current balances unverified; no rank inferred. Excluded from dated totals and valuation.'
    },
    {
      handle: 'Mennodeg', name: 'Menno 族',
      profile: 'https://x.com/Mennodeg',
      post: 'https://x.com/Mennodeg/status/2090876949463728467',
      asOf: '2026-08-22',
      note: 'Discusses an investment thesis for Variational and backing the team. No personal points total or points rank verified in the public material reviewed.'
    },
    {
      handle: 'whitesocks256', name: 'whitesocks 💜',
      profile: 'https://x.com/whitesocks256',
      note: 'Korean crypto commentator. Lists Variational among the perp DEX projects followed in the public profile.'
    },
    {
      handle: 'ElNachoCrypto', name: 'Nacho',
      profile: 'https://x.com/ElNachoCrypto',
      note: 'Added to the tracked people list. Points not researched.'
    },
    {
      handle: 'SystemicStratHL', name: 'SystemicStratHL',
      profile: 'https://x.com/SystemicStratHL',
      note: 'Added to the tracked people list. Points not researched.'
    },
    {
      handle: 'izebel_eth', name: 'izebel_eth',
      profile: 'https://x.com/izebel_eth',
      note: 'Added to the tracked people list. Points not researched.'
    },
    {
      handle: '0xdetweiler', name: '0xdetweiler',
      profile: 'https://x.com/0xdetweiler',
      note: 'Added to the tracked people list. Points not researched.'
    },
    {
      handle: 'TaikiMaeda2', name: 'Taiki Maeda',
      profile: 'https://x.com/TaikiMaeda2',
      note: 'Added to the tracked people list. Points not researched.'
    },
    {
      handle: 'shadowofintent3', name: 'shadowofintent3',
      profile: 'https://x.com/shadowofintent3',
      note: 'Added to the tracked people list. Points not researched.'
    },
    {
      handle: 'derteil00', name: 'derteil00',
      profile: 'https://x.com/derteil00',
      note: 'Added to the tracked people list. Points not researched.'
    },
    {
      handle: 'MomentumKevin', name: 'MomentumKevin',
      profile: 'https://x.com/MomentumKevin',
      note: 'Added to the tracked people list. Points not researched.'
    }
  ];

  var FDVS = [1e9, 2.5e9, 5e9, 10e9];
  var fdv = 5e9;
  var sellFraction = 0.5;
  var whaleSort = 'points';
  var whaleSortDirection = 'desc';
  var WHALE_SORT_FIELDS = { points: 'Points', value: 'Value', rank: 'Disclosed rank', name: 'Name', date: 'Disclosure date' };

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
  /* Week 42 community snapshot. Projection boundaries use Singapore midnight.
     Keep source observations separate from the weekly scenario. */
  var DISTRIBUTION_BASE_TS = Date.parse('2026-10-04T00:00:00+08:00');
  var DISTRIBUTION_BASE_POOL = 9440000;
  var DISTRIBUTION_WEEKLY = 150000;
  function distributionAt(now) {
    var weeks = Math.max(0, Math.floor((now - DISTRIBUTION_BASE_TS) / (7 * 864e5)));
    var pool = DISTRIBUTION_BASE_POOL + weeks * DISTRIBUTION_WEEKLY;
    return { weeks: weeks, pool: pool, scale: pool / DISTRIBUTION_BASE_POOL,
      top100: 9340 * pool / DISTRIBUTION_BASE_POOL,
      asOf: new Date(DISTRIBUTION_BASE_TS + weeks * 7 * 864e5 + 8 * 36e5).toISOString().slice(0, 10),
      next: new Date(DISTRIBUTION_BASE_TS + (weeks + 1) * 7 * 864e5 + 8 * 36e5).toISOString().slice(0, 10) };
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
    return '<li class="wh-row" data-wh-handle="' + esc(w.handle) + '">' +
      (w.rank ? '<span class="wh-rank"><i>#</i>' + w.rank + '</span>'
              : '<span class="wh-rank none" title="rank not shown on the posted card">—<small>not shown</small></span>') +
      '<div class="wh-who">' +
        profileAvatar(w) +
        '<div><b>' + esc(profileFor(w).name || w.name) + '</b>' +
        '<a href="' + esc(w.post) + '" target="_blank" rel="noopener noreferrer">@' + esc(w.handle) + '</a>' +
        '<span class="wh-tier">' + esc(w.tier) + '</span></div>' +
      '</div>' +
      '<div class="wh-pts"><b>' + (w.approximate ? '~' : '') + int(w.points) + '</b>' +
        '<span class="wh-bar" aria-hidden="true"><i style="width:' + bar.toFixed(1) + '%"></i></span>' +
        '<em>' + (w.approximate ? 'approximate self-report · ' : '') + (r.share * 100).toFixed(2) + '% of all points</em></div>' +
      '<div class="wh-val"><b>' + esc(usd(r.value)) + '</b><em>at ' + esc(fdvLabel(fdv)) + ' FDV</em></div>' +
      '<div class="wh-asof' + (stale ? ' stale' : '') + '"><b>' + esc(dateLabel(w.asOf)) + '</b>' +
        '<em>' + (stale ? r.age + 'd old · stale' : (r.age <= 0 ? 'today' : r.age + 'd ago')) + '</em>' +
        '<a href="' + esc(w.post) + '" target="_blank" rel="noopener noreferrer">source ↗</a>' +
        (w.cardSource ? '<br><a href="' + esc(w.cardSource) + '" target="_blank" rel="noopener noreferrer">earlier card post ↗</a><br><a href="' + esc(w.cardImage) + '" target="_blank" rel="noopener noreferrer">view Aug 2 card ↗</a>' : '') + '</div>' +
      (said || weekly ? '<div class="wh-said">' + (said ? '<ul>' + said + '</ul>' : '') + weekly + '</div>' : '') +
      '</li>';
  }

  var MIN_20K_HANDLES = ['systemicstrathl', 'izebel_eth', '0xdetweiler', 'taikimaeda2', 'shadowofintent3', 'derteil00', 'momentumkevin'];
  function has20kFloor(w) { return MIN_20K_HANDLES.indexOf(w.handle.toLowerCase()) >= 0; }
  function estimatedPoints(w, projection) {
    if (w.minimumEstimate) return Math.max(w.minimumEstimate, projection.top100);
    return has20kFloor(w) ? Math.max(20000, projection.top100) : projection.top100;
  }

  function pendingRow(w) {
    var evidence = w.pointsSource || w.post;
    var projection = distributionAt(Date.now());
    var points = estimatedPoints(w, projection);
    var floor = has20kFloor(w);
    var indirect = !!w.minimumEstimate;
    var share = points / projection.pool;
    return '<li class="wh-row wh-pending" data-wh-handle="' + esc(w.handle) + '">' +
      '<span class="wh-rank">' + (indirect ? esc(w.rankLabel || '—') : '≤100') + '<small>' + (indirect ? 'indirect report' : 'assumed') + '</small></span>' +
      '<div class="wh-who">' + profileAvatar(w) +
      '<div><b>' + esc(profileFor(w).name || w.name) + '</b><a href="' + esc(w.profile) + '" target="_blank" rel="noopener noreferrer">@' + esc(w.handle) + '</a></div></div>' +
      '<div class="wh-pts"><b>' + (floor || indirect ? '≥' : '~') + int(points) + '</b><em>' + (indirect ? '30,000+ band · indirect report' : floor ? '20,000-point minimum scenario' : 'Top 100 cutoff scenario') + '</em><em>' + (share * 100).toFixed(3) + '% of projected points</em></div>' +
      '<div class="wh-val"><b>~' + esc(usd(share * AIRDROP_SHARE * fdv)) + '</b><em>at ' + esc(fdvLabel(fdv)) + ' FDV</em></div>' +
      '<div class="wh-asof"><b>' + esc(dateLabel(projection.asOf)) + '</b><em>model week · not a disclosure</em>' +
      (evidence ? '<a href="' + esc(evidence) + '" target="_blank" rel="noopener noreferrer">' + (indirect ? 'indexed report ↗' : 'context only ↗') + '</a>' : '') + '</div>' +
      (indirect ? '<div class="wh-said"><p>30,000+ band from an indexed repost; original date and exact balance unverified.</p></div>' :
        w.pointsLabel ? '<div class="wh-said"><p>Earlier indirect report: ' + esc(w.pointsLabel) + ' points; not used in this scenario.</p></div>' : '') + '</li>';

  }

  var RANK_BANDS = [['Top 10',6.1],['11–50',8.7],['51–100',6.0],['101–250',10.6],['251–500',9.2],['501–1,000',10.1],['1,001–2,000',11.1],['2,001–5,000',15.3],['5,001–10,000',10.9],['10,001–25,000',10.0],['25,001–74,000',2.0]];
  var RANK_CUTOFFS = [[2,89111],[5,52500],[10,35200],[50,13900],[100,9340],[150,7250],[500,2570],[1000,1430],[2000,770],[5000,290],[10000,150],[15000,70],[25000,22],[29000,15]];
  /* The Playbook tab places a reader's own points on this same distribution, so it reads
     the snapshot from here rather than carrying a second copy that could drift. tops = the
     last rank in each RANK_BANDS row; 74,000 is the source's own last band edge. */
  var RANK_TOPS = [10, 50, 100, 250, 500, 1000, 2000, 5000, 10000, 25000, 74000];
  var RANK_ACCOUNTS = 74000;
  window.__VDIST = {
    at: distributionAt, bands: RANK_BANDS, cutoffs: RANK_CUTOFFS, basePool: DISTRIBUTION_BASE_POOL,
    tops: RANK_TOPS, accounts: RANK_ACCOUNTS,
    source: 'https://x.com/yh_0x/status/2106449057933857025'
  };

  /* ---------- where a reader's own points sit ----------
     Rank is interpolated log-log between the Week 42 cutoffs, scaled to this week's
     projected pool; cumulative share comes off the rank bands. A projection of a community
     snapshot, not a leaderboard lookup. The Playbook tab reads the same answer through
     window.__VRANK, and both tabs keep one saved points value, so the two cannot disagree. */
  var PTS_KEY = 'varMyPointsV1';
  var PTS_CHIPS = [1000, 5000, 10000, 25000, 50000];
  var myPts = 10000;
  try { var savedPts = Number(localStorage.getItem(PTS_KEY)); if (savedPts > 0) myPts = savedPts; } catch (_) {}
  function setMyPts(v) {
    myPts = v;
    try { localStorage.setItem(PTS_KEY, String(v)); } catch (_) {}
    try { document.dispatchEvent(new CustomEvent('var:points', { detail: v })); } catch (_) {}
  }
  function rankModel() {
    var d = distributionAt(Date.now());
    var cut = RANK_CUTOFFS.map(function (c) { return [c[0], c[1] * d.scale]; });
    cut.push([RANK_ACCOUNTS, 1]);
    var c0 = RANK_CUTOFFS[0][1], c1 = RANK_CUTOFFS[1][1];
    var cum = [[2, 2 * c0 / DISTRIBUTION_BASE_POOL * 100], [5, (2 * c0 + 3 * c1) / DISTRIBUTION_BASE_POOL * 100]];
    var run = 0;
    RANK_BANDS.forEach(function (b, i) { run += b[1]; cum.push([RANK_TOPS[i], run]); });
    return { pool: d.pool, asOf: d.asOf, N: RANK_ACCOUNTS, cut: cut, cum: cum };
  }
  function rankFor(P, D) {
    var c = D.cut;
    if (P >= c[0][1]) return 2;
    if (P <= c[c.length - 1][1]) return D.N;
    for (var i = 0; i < c.length - 1; i++) {
      if (P <= c[i][1] && P > c[i + 1][1]) {
        var t = Math.log(c[i][1] / P) / Math.log(c[i][1] / c[i + 1][1]);
        return Math.exp(Math.log(c[i][0]) + t * Math.log(c[i + 1][0] / c[i][0]));
      }
    }
    return D.N;
  }
  function ptsAtRank(r, D) {
    var c = D.cut;
    if (r <= c[0][0]) return c[0][1];
    for (var i = 0; i < c.length - 1; i++) {
      if (r >= c[i][0] && r <= c[i + 1][0]) {
        var t = Math.log(r / c[i][0]) / Math.log(c[i + 1][0] / c[i][0]);
        return Math.exp(Math.log(c[i][1]) + t * Math.log(c[i + 1][1] / c[i][1]));
      }
    }
    return 1;
  }
  function cumAt(r, D) {
    var a = D.cum;
    if (r <= a[0][0]) return a[0][1] * r / a[0][0];
    for (var i = 0; i < a.length - 1; i++) {
      if (r >= a[i][0] && r <= a[i + 1][0]) {
        var t = Math.log(r / a[i][0]) / Math.log(a[i + 1][0] / a[i][0]);
        return a[i][1] + t * (a[i + 1][1] - a[i][1]);
      }
    }
    return 100;
  }
  function rankStr(r) { return r <= 2 ? '#1–2' : '#' + int(r); }
  function topPct(r, N) {
    var v = r / N * 100;
    return v < 0.01 ? '<0.01%' : v < 1 ? v.toFixed(2) + '%' : v < 10 ? v.toFixed(1) + '%' : v.toFixed(0) + '%';
  }
  window.__VRANK = {
    at: function (P) {
      var D = rankModel(), R = rankFor(P, D);
      return { rank: R, rankStr: rankStr(R), top: topPct(R, D.N), N: D.N, share: P / D.pool * 100, pool: D.pool };
    },
    points: function () { return myPts; },
    set: setMyPts
  };

  function rankReport() {
    var D = rankModel(), N = D.N;
    var P = Math.max(0, myPts);
    var R = rankFor(P, D);
    var share = P / D.pool * 100;
    var above = cumAt(R, D);
    var median = ptsAtRank(N / 2, D);
    var value = P / D.pool * AIRDROP_SHARE * fdv;
    var steps = [10, 50, 100, 250, 500, 1000, 2000, 5000, 10000, 25000];
    var nextR = null;
    for (var si = steps.length - 1; si >= 0; si--) if (steps[si] < R - 0.5) { nextR = steps[si]; break; }
    var nextNeed = nextR ? Math.max(0, ptsAtRank(nextR, D) - P) : 0;

    var groups = [
      { k: 'g1', name: 'Top 100',        acc: 100,       pts: cumAt(100, D),                   lo: 1,     hi: 100 },
      { k: 'g2', name: '101 – 1,000',    acc: 900,       pts: cumAt(1000, D) - cumAt(100, D),   lo: 101,   hi: 1000 },
      { k: 'g3', name: '1,001 – 10,000', acc: 9000,      pts: cumAt(10000, D) - cumAt(1000, D), lo: 1001,  hi: 10000 },
      { k: 'g4', name: '10,001 +',       acc: N - 10000, pts: 100 - cumAt(10000, D),            lo: 10001, hi: N }
    ];
    var mine = groups.filter(function (g) { return R >= g.lo - 0.5 && R <= g.hi + 0.5; })[0] || groups[3];
    var per = function (g) { return g.pts / g.acc; };
    var bar = function (field) {
      return groups.map(function (g) {
        var w = field === 'acc' ? g.acc / N * 100 : g.pts;
        return '<span class="' + g.k + (g === mine ? ' me' : '') + '" style="width:' + w.toFixed(3) + '%" title="' +
          esc(g.name) + ' · ' + (field === 'acc' ? topPct(g.acc, N) + ' of accounts' : g.pts.toFixed(1) + '% of points') + '"></span>';
      }).join('');
    };
    var legend = groups.map(function (g) {
      return '<div class="rk-lg ' + g.k + (g === mine ? ' me' : '') + '"><i></i><b>' + esc(g.name) +
        (g === mine ? ' <em>you</em>' : '') + '</b><span>' + topPct(g.acc, N) + ' of accounts → <strong>' +
        g.pts.toFixed(1) + '%</strong> of points</span><small>~' + int(D.pool * g.pts / 100 / g.acc) + ' pts each</small></div>';
    }).join('');
    /* the same bands read cumulatively: what the top N hold between them */
    var cumLine = [10, 100, 1000, 10000].map(function (r) {
      return '<span>Top ' + int(r) + ' <b>' + cumAt(r, D).toFixed(1) + '%</b></span>';
    }).join('');

    var top1k = cumAt(1000, D), top10k = cumAt(10000, D);
    var mults = [
      { h: 'Top 100 vs 101–1,000', v: per(groups[0]) / per(groups[1]), s: 'points per account' },
      { h: 'Top 1,000 vs everyone else', v: (top1k / 1000) / ((100 - top1k) / (N - 1000)), s: int(N - 1000) + ' accounts below' },
      { h: 'Top 10,000 vs the rest', v: (top10k / 10000) / ((100 - top10k) / (N - 10000)), s: int(N - 10000) + ' accounts below' },
      { h: 'You vs the median account', v: P / median, s: 'median ≈ ' + int(median) + ' pts (rank ' + int(N / 2) + ')' }
    ].map(function (m) {
      return '<div><span>' + esc(m.h) + '</span><b>' + (m.v >= 100 ? int(m.v) : m.v.toFixed(1)) + '×</b><em>' + esc(m.s) + '</em></div>';
    }).join('');

    /* the rank ruler is log-scaled: on a linear one the top 1,000 is 1% of the width */
    var lp = function (r) { return Math.log(Math.max(r, 1)) / Math.log(N) * 100; };
    var ticks = [1, 10, 100, 1000, 10000, N].map(function (r) {
      return '<span style="left:' + lp(r).toFixed(2) + '%"><b>#' + int(r) + '</b><small>' +
        (r === 1 ? '' : '≥' + int(ptsAtRank(r, D))) + '</small></span>';
    }).join('');

    var chips = PTS_CHIPS.map(function (v) {
      return '<button type="button" data-wh-pts="' + v + '" aria-pressed="' + (v === P) + '"' + (v === P ? ' class="on"' : '') + '>' + int(v) + '</button>';
    }).join('');

    return '<article class="wh-rank" id="wh-rank" aria-labelledby="wh-rank-title">' +
      '<span class="cmp-eyebrow">03 · YOUR RANK</span><h3 id="wh-rank-title">Where do your points sit?</h3>' +
      '<div class="tp-chips wh-chips" role="group" aria-label="Your points"><span>Your points</span>' + chips +
      '<label class="rk-inp">custom <input type="number" step="100" min="0" value="' + Math.round(P) + '" data-wh-pts-input aria-label="Your points"></label></div>' +
      '<div class="rk-hero"><div><span class="cmp-eyebrow">' + int(P) + ' points</span>' +
      '<h4>≈ rank ' + rankStr(R) + '.<br>Top ' + topPct(R, N) + ' of ~' + int(N) + ' accounts.</h4></div>' +
      '<b class="rk-big">' + share.toFixed(share < 0.01 ? 4 : 3) + '%<small>of all points</small></b></div>' +
      '<div class="rk-ruler" aria-label="Estimated rank on a log scale">' +
      '<div class="rk-track"><i style="left:' + lp(R).toFixed(2) + '%"><em>you · ' + rankStr(R) + '</em></i></div>' +
      '<div class="rk-ticks">' + ticks + '</div></div>' +
      '<div class="wh-readouts rk-four">' +
      '<div><span>Estimated rank</span><b>' + rankStr(R) + '</b><em>ahead of ~' + (100 - R / N * 100).toFixed(R / N < 0.01 ? 2 : 1) + '% of accounts</em></div>' +
      '<div><span>Accounts at or above you hold</span><b>' + above.toFixed(1) + '%</b><em>of all points, ~' + int(Math.max(R, 1)) + ' accounts</em></div>' +
      '<div><span>Next tier</span><b>' + (nextR ? '+' + int(nextNeed) : '—') + '</b><em>' + (nextR ? 'points to reach the top ' + int(nextR) : 'already in the top 10') + '</em></div>' +
      '<div><span>Airdrop at ' + esc(fdvLabel(fdv)) + ' FDV</span><b>' + esc(usd(value)) + '</b><em>$' + (AIRDROP_SHARE * fdv / D.pool).toFixed(2) + ' per point · 32% ÷ ' + (D.pool / 1e6).toFixed(2) + 'M pts</em></div>' +
      '</div>' +
      '<div class="rk-bars"><div class="rk-brow"><span>Accounts</span><div class="rk-bar">' + bar('acc') + '</div></div>' +
      '<div class="rk-brow"><span>Points</span><div class="rk-bar">' + bar('pts') + '</div></div></div>' +
      '<div class="rk-cum">' + cumLine + '</div>' +
      '<div class="rk-legend">' + legend + '</div>' +
      '<div class="wh-readouts wh-economic rk-four">' + mults + '</div>' +
      '<p class="wh-caption">Rank is interpolated between the <a class="wh-inline-source" href="' + esc(window.__VDIST.source) + '" target="_blank" rel="noopener noreferrer">yh_0x Week 42</a> cutoffs, scaled to this week’s projected ' +
        (D.pool / 1e6).toFixed(2) + 'M-point pool (model week ' + D.asOf + '). A projection, not a leaderboard lookup: below rank 29,000 the source gives no cutoffs, so the tail is extrapolated. Airdrop value follows the FDV chips above.</p>' +
      '</article>';
  }

  function sellPressureGroups() {
    return [
      { rank: 2, share: 2 * 89111 / DISTRIBUTION_BASE_POOL, lowerBound: true },
      { rank: 5, share: (2 * 89111 + 3 * 52500) / DISTRIBUTION_BASE_POOL, lowerBound: true },
      { rank: 10, share: 0.061 },
      { rank: 50, share: 0.148 },
      { rank: 100, share: 0.208 },
      { rank: 150, share: 0.208 + 50 * 7250 / DISTRIBUTION_BASE_POOL, lowerBound: true }
    ];
  }

  function sellPressureReport() {
    var d = distributionAt(Date.now());
    return '<p class="wh-top100-comparison"><b>Top 100 holds ~' + int(d.pool * 0.208) + ' points</b> out of ' + int(d.pool) + ' total (20.8%). Average: ~' + int(d.pool * 0.208 / 100) + ' per account; the #100 cutoff is ~' + int(d.top100) + '.</p>' +
      '<div class="wh-sell-scroll"><table class="wh-projection-table wh-sell-table"><thead><tr><th scope="col">Cumulative rank</th><th scope="col">Group points</th><th scope="col">Cutoff / account</th><th scope="col">Airdrop share</th><th scope="col">Total supply</th><th scope="col">Sell ' + int(sellFraction * 100) + '% · ' + fdvLabel(fdv) + ' FDV</th></tr></thead><tbody>' +
      sellPressureGroups().map(function (g, i) {
        var prefix = g.lowerBound ? '≥' : '~';
        return '<tr' + (g.rank === 100 ? ' class="wh-cutoff-selected"' : '') + '><th scope="row">Top ' + g.rank + (g.lowerBound ? '<small>lower bound</small>' : '') + '</th>' +
          '<td class="wh-group-points"><b>' + prefix + int(g.share * d.pool) + '</b><span aria-hidden="true"><i style="width:' + (g.share * 100).toFixed(2) + '%"></i></span></td>' +
          '<td>~' + int(RANK_CUTOFFS[i][1] * d.scale) + '</td><td>' + prefix + (g.share * 100).toFixed(2) + '%</td><td>' + prefix + (g.share * AIRDROP_SHARE * 100).toFixed(2) + '%</td>' +
          '<td>' + prefix + usd(g.share * AIRDROP_SHARE * fdv * sellFraction) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="wh-caption">Group points are the combined holdings of all accounts in that rank group; cutoff is the minimum per-account balance at its boundary. Cumulative groups overlap; do not add rows. Bars use the same total-points scale. ≥ indicates an indicative lower bound.</p>';
  }

  function totalSellPressureReport() {
    var allocationValue = AIRDROP_SHARE * fdv;
    var chips = FDVS.map(function (v) {
      return '<button type="button" data-wh-fdv="' + v + '" aria-pressed="' + (v === fdv) + '"' + (v === fdv ? ' class="on"' : '') + '>' + fdvLabel(v) + '</button>';
    }).join('');
    var saleChips = [0.25, 0.5, 1].map(function (rate) {
      return '<button type="button" data-wh-sell="' + rate + '" aria-pressed="' + (rate === sellFraction) + '"' + (rate === sellFraction ? ' class="on"' : '') + '>' + int(rate * 100) + '%</button>';
    }).join('');
    return '<article class="wh-total-pressure" aria-labelledby="wh-total-title">' +
      '<span class="cmp-eyebrow">01 · AIRDROP &amp; SELL PRESSURE</span><h3 id="wh-total-title">32% of supply. How much could be sold?</h3>' +
      '<div class="wh-scenario-controls"><div class="tp-chips wh-chips" role="group" aria-label="FDV scenario"><span>FDV</span>' + chips + '</div>' +
      '<div class="tp-chips wh-chips" role="group" aria-label="Fraction of airdrop sold"><span>Airdrop sold</span>' + saleChips + '</div></div>' +
      '<div class="wh-readouts wh-economic"><div><span>Total airdrop value</span><b>' + usd(allocationValue) + '</b><em>' + fdvLabel(fdv) + ' FDV × 32% of supply</em></div>' +
      '<div><span>Potential sell pressure</span><b>' + usd(allocationValue * sellFraction) + '</b><em>' + int(sellFraction * 100) + '% of the airdrop sold</em></div>' +
      '<div><span>Total supply sold</span><b>' + int(AIRDROP_SHARE * sellFraction * 100) + '%</b><em>32% allocation × ' + int(sellFraction * 100) + '% sold</em></div></div>' +
      '<p class="wh-caption">Nominal selling scenario at the selected FDV, assuming the full Genesis allocation is available. Actual proceeds and price impact depend on holders and liquidity.</p></article>';
  }

  function concentrationModel(d) {
    var topShare = RANK_BANDS.slice(0, 3).reduce(function (sum, b) { return sum + b[1]; }, 0) / 100;
    var nextShare = RANK_BANDS.slice(3, 6).reduce(function (sum, b) { return sum + b[1]; }, 0) / 100;
    return { topShare: topShare, nextShare: nextShare, topPoints: d.pool * topShare, nextPoints: d.pool * nextShare,
      equivalentAccounts: topShare / nextShare * 900,
      perAccountMultiple: (topShare / 100) / (nextShare / 900),
      circleDiameterRatio: Math.sqrt(topShare / nextShare),
      top1000Share: topShare / (topShare + nextShare) };
  }

  function concentrationReport(d) {
    var c = concentrationModel(d);
    return '<figure class="wh-concentration" aria-labelledby="wh-concentration-title">' +
      '<div class="wh-concentration-heading"><div><span class="cmp-eyebrow">THE CONCENTRATION GAP</span>' +
      '<h4 id="wh-concentration-title">100 accounts.<br>The points of ~' + int(c.equivalentAccounts) + '.</h4></div>' +
      '<b class="wh-concentration-multiple">' + c.perAccountMultiple.toFixed(2) + '×<small>points per account</small></b></div>' +
      '<p class="wh-caption">Compared with the average account ranked 101–1,000. Circle area represents points held; the numbers inside are account counts.</p>' +
      '<div class="wh-bubble-grid"><div class="wh-bubble-cohort"><div class="wh-bubble-stage"><div class="wh-point-bubble wh-top-bubble" style="width:' + (c.circleDiameterRatio * 100).toFixed(4) + '%"><b>100</b><span>accounts</span></div></div>' +
      '<b class="wh-cohort-label">TOP 100</b><strong>~' + int(c.topPoints) + ' points</strong><span>' + (c.topShare * 100).toFixed(1) + '% of all points · ~' + int(c.topPoints / 100) + ' each</span></div>' +
      '<div class="wh-bubble-cohort"><div class="wh-bubble-stage"><div class="wh-point-bubble wh-next-bubble"><b>900</b><span>accounts</span></div></div>' +
      '<b class="wh-cohort-label">RANKS 101–1,000</b><strong>~' + int(c.nextPoints) + ' points</strong><span>' + (c.nextShare * 100).toFixed(1) + '% of all points · ~' + int(c.nextPoints / 900) + ' each</span></div></div>' +
      '<figcaption>Within the Top 1,000, <b>10% of accounts hold ' + (c.top1000Share * 100).toFixed(1) + '% of the points.</b> The ~' + int(c.equivalentAccounts) + '-account comparison uses the next 900 accounts’ average, not ' + int(c.equivalentAccounts) + ' identified wallets. Based on the projected rank-band distribution.</figcaption></figure>';
  }

  function distributionReport() {
    var source = 'https://x.com/yh_0x/status/2106449057933857025';
    var d = distributionAt(Date.now());
    return '<article class="wh-distribution" aria-labelledby="wh-distribution-title">' +
      '<span class="cmp-eyebrow">02 · DISTRIBUTION</span><h3 id="wh-distribution-title">Where could the selling come from?</h3>' +
      '<p class="wh-caption">' + (d.pool / 1e6).toFixed(2) + 'M projected points · model week ' + d.asOf + ' · +150,000 per week · next update ' + d.next + ' (00:00 SGT).</p>' +
      concentrationReport(d) +
      '<div class="wh-band-bar" role="img" aria-label="Airdrop distribution: Top 100 holds 20.8 percent, ranks 101 to 1000 hold 29.9 percent, ranks 1001 and below hold 49.3 percent"><span style="width:20.8%"></span><span style="width:29.9%"></span><span style="width:49.3%"></span></div>' +
      '<div class="wh-band-legend"><span>Top 100 <b>20.8%</b></span><span>101–1,000 <b>29.9%</b></span><span>1,001+ <b>49.3%</b></span></div>' +
      sellPressureReport() +
      '<details class="wh-baseline"><summary>Full distribution &amp; rank cutoffs</summary><div class="wh-projection-grid"><div><h4>Non-overlapping rank bands</h4><table class="wh-projection-table"><thead><tr><th>Rank band</th><th>Airdrop share</th><th>Points</th></tr></thead><tbody>' +
      RANK_BANDS.map(function (b) { return '<tr><td>' + b[0] + '</td><td>' + b[1].toFixed(1) + '%</td><td>' + int(d.pool * b[1] / 100) + '</td></tr>'; }).join('') +
      '</tbody></table></div><div><h4>Per-account cutoffs</h4><table class="wh-projection-table"><thead><tr><th>Rank</th><th>Points</th></tr></thead><tbody>' +
      RANK_CUTOFFS.map(function (c) { return '<tr><td>Top ' + int(c[0]) + '</td><td>~' + int(c[1] * d.scale) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div></details>' +
      '<details class="wh-baseline"><summary>Source &amp; projection method</summary><p>Baseline: <a class="wh-inline-source" href="' + source + '" target="_blank" rel="noopener noreferrer">yh_0x · Week 42 analysis ↗</a>, posted Oct 4, 2026 (SGT). Community-sourced, unofficial figures: 9.44M points; 31,693 weekly earners.</p>' +
      '<p>Pool = 9.44M + completed weeks × 150,000. Cutoffs grow proportionally; rank-band shares stay fixed. This is a projection, not a refreshed leaderboard. Group supply share = points share × 32%; nominal sale value = supply share × FDV × fraction sold.</p>' +
      '<p>Top 10 / 50 / 100 cumulative shares are 6.1% / 14.8% / 20.8%. Other group totals are unavailable: Top 2 floor = 2 × 89,111 points; Top 5 floor = Top 2 floor + 3 × 52,500; Top 150 floor = Top 100 band share + 50 × 7,250 ÷ 9.44M. Rounded baseline figures make these indicative bounds.</p>' +
      '<div class="wh-distribution-images"><figure><a href="assets/whales/yh-week42-1.jpg" target="_blank" rel="noopener noreferrer"><img src="assets/whales/yh-week42-1.jpg" alt="Original Week 42 points distribution" width="1080" height="1350" loading="lazy"></a><figcaption>Original rank-band shares</figcaption></figure>' +
      '<figure><a href="assets/whales/yh-week42-2.jpg" target="_blank" rel="noopener noreferrer"><img src="assets/whales/yh-week42-2.jpg" alt="Original Week 42 rank cutoffs" width="1080" height="1350" loading="lazy"></a><figcaption>Original cutoffs</figcaption></figure></div></details></article>';
  }

  function sortedWhaleRows() {
    var projection = distributionAt(Date.now());
    var all = rows().map(function (r) {
      return { w: r.w, disclosed: r, points: r.w.points, value: r.value,
        rank: r.w.rank || null, date: r.w.asOf || null, name: profileFor(r.w).name || r.w.name };
    }).concat(WATCHLIST.map(function (w) {
      var points = estimatedPoints(w, projection);
      return { w: w, disclosed: null, points: points, value: points / projection.pool * AIRDROP_SHARE * fdv,
        rank: null, date: null, name: profileFor(w).name || w.name };
    }));
    return all.sort(function (a, b) {
      var av = a[whaleSort], bv = b[whaleSort];
      // A scenario rank or model week is not a disclosed rank or balance date.
      // Missing disclosure fields stay last in either direction.
      if (av == null && bv != null) return 1;
      if (bv == null && av != null) return -1;
      var result = av == null ? 0 : typeof av === 'number' ? av - bv : av.localeCompare(bv, 'en', { sensitivity: 'base' });
      return (whaleSortDirection === 'asc' ? result : -result) || a.w.handle.localeCompare(b.w.handle);
    });
  }

  function whaleListHtml() {
    var all = sortedWhaleRows();
    var top = Math.max.apply(null, all.map(function (r) { return r.points; }).concat([1]));
    return all.map(function (r) { return r.disclosed ? row(r.disclosed, top) : pendingRow(r.w); }).join('');
  }

  function whaleSortStatus() {
    return (WHALES.length + WATCHLIST.length) + ' accounts · ' + WHALE_SORT_FIELDS[whaleSort] + ' · ' + whaleSortDirection + 'ending' +
      (whaleSort === 'rank' || whaleSort === 'date' ? ' · undisclosed last' : '');
  }

  function whaleSortControls() {
    return '<div class="wh-sort"><label for="wh-sort-field">Sort by</label>' +
      '<select id="wh-sort-field" data-wh-sort>' + Object.keys(WHALE_SORT_FIELDS).map(function (key) {
        return '<option value="' + key + '"' + (key === whaleSort ? ' selected' : '') + '>' + WHALE_SORT_FIELDS[key] + '</option>';
      }).join('') + '</select>' +
      '<button type="button" data-wh-sort-direction aria-label="Switch to ' + (whaleSortDirection === 'asc' ? 'descending' : 'ascending') + ' order">' +
        (whaleSortDirection === 'asc' ? 'Ascending ↑' : 'Descending ↓') + '</button>' +
      '<span class="wh-sort-status" role="status" aria-live="polite">' + esc(whaleSortStatus()) + '</span></div>';
  }

  function updateWhaleSort() {
    var host = document.querySelector('[data-tg="whales"]');
    if (!host) return;
    var list = host.querySelector('.wh-list');
    if (list) list.innerHTML = whaleListHtml();
    var button = host.querySelector('[data-wh-sort-direction]');
    if (button) {
      button.textContent = whaleSortDirection === 'asc' ? 'Ascending ↑' : 'Descending ↓';
      button.setAttribute('aria-label', 'Switch to ' + (whaleSortDirection === 'asc' ? 'descending' : 'ascending') + ' order');
    }
    var status = host.querySelector('.wh-sort-status');
    if (status) status.textContent = whaleSortStatus();
  }

  function render() {
    var host = document.querySelector('[data-tg="whales"]');
    if (!host) return;
    var rs = rows();
    var total = rs.reduce(function (a, r) { return a + r.w.points; }, 0);
    var projection = distributionAt(Date.now());
    var pool = projection.pool;
    var estimatedTotal = WATCHLIST.reduce(function (sum, w) { return sum + estimatedPoints(w, projection); }, 0);
    var combinedPoints = total + estimatedTotal;
    var airdropWeight = combinedPoints / pool;
    var supplyWeight = airdropWeight * AIRDROP_SHARE;

    host.innerHTML =
      '<div class="cmp-heading"><span class="cmp-eyebrow">WHALES</span>' +
      '<h2>From FDV to airdrop sell pressure</h2>' +
      '<p>Value the 32% Genesis allocation, size the potential selling, then see how the allocation is distributed across rank groups and tracked whales.</p></div>' +
      totalSellPressureReport() +
      distributionReport() +
      rankReport() +
      '<div class="cmp-heading"><span class="cmp-eyebrow">04 · TRACKED WHALES</span><h3>The people behind the points</h3>' +
      '<p>' + (rs.length + WATCHLIST.length) + ' tracked accounts · ' + rs.length + ' dated disclosures · ' + WATCHLIST.length + ' scenario balances.</p></div>' +
      '<div class="wh-readouts wh-economic" aria-label="Tracked whale summary">' +
        '<div><span>Combined points</span><b>~' + int(combinedPoints) + '</b><em>' + int(total) + ' disclosed + ' + int(estimatedTotal) + ' scenario points</em></div>' +
        '<div><span>Share of airdrop</span><b>~' + (airdropWeight * 100).toFixed(2) + '%</b><em>~' + (supplyWeight * 100).toFixed(2) + '% of total token supply</em></div>' +
        '<div><span>Potential selling · ' + int(sellFraction * 100) + '% sold</span><b>~' + esc(usd(supplyWeight * fdv * sellFraction)) + '</b><em>~' + esc(usd(supplyWeight * fdv)) + ' allocation at ' + esc(fdvLabel(fdv)) + ' FDV</em></div>' +
      '</div>' +
      '<details class="wh-baseline wh-account-notes"><summary>Account data &amp; valuation notes</summary>' +
      '<p>Disclosures are self-reported and dated; records older than two weeks are marked stale. CorgiI’s Oct 9 balance is approximate. Scenario accounts have no verified current balance or rank: nine use the projected Top 100 cutoff; seven have a user-specified 20,000-point floor; Lynn03 has an indirect 30,000-point floor. The higher of a floor or the Top 100 cutoff is used.</p>' +
      '<p>Combined points mix dated disclosures with scenario balances. Aggregate value uses one current projected pool: combined points ÷ pool × 32% × selected FDV. Dated rows retain card-date pools; scenario rows use the current pool. Sale scenarios multiply value by the selected fraction sold. Context links do not establish an account’s points balance.</p></details>' +
      whaleSortControls() +
      '<ol class="wh-list">' + whaleListHtml() + '</ol>';
  }

  var STYLE =
    '.wh-concentration{margin:24px 0;padding:24px;border:1px solid var(--line);background:color-mix(in srgb,var(--v2-accent,#4c9af8) 4%,var(--panel));border-radius:6px}.wh-concentration-heading{display:flex;justify-content:space-between;align-items:center;gap:20px}.wh-concentration-heading h4{margin:10px 0 0;color:var(--text);font:800 clamp(24px,3vw,34px)/1.15 var(--sans);letter-spacing:-.8px}.wh-concentration-multiple{flex-shrink:0;color:var(--v2-accent,#4c9af8);font:800 38px/1 var(--mono);text-align:right}.wh-concentration-multiple small{display:block;margin-top:8px;color:var(--muted);font:11px/1.4 var(--mono)}.wh-bubble-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;max-width:650px;margin:18px auto 22px}.wh-bubble-cohort{text-align:center;min-width:0}.wh-bubble-stage{display:grid;place-items:center;aspect-ratio:1;max-width:240px;margin:auto;width:100%}.wh-point-bubble{width:100%;aspect-ratio:1;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}.wh-top-bubble{background:#2866bb}.wh-next-bubble{background:#665db3}.wh-point-bubble b{font:800 clamp(28px,4vw,54px)/1 var(--mono);color:#fff!important}.wh-point-bubble span{margin-top:8px;font:12px var(--mono);color:#fff!important}.wh-cohort-label{display:block;margin:14px 0 8px;color:var(--v2-accent,#4c9af8);font:800 10px var(--mono);letter-spacing:.7px}.wh-bubble-cohort:nth-child(2) .wh-cohort-label{color:#8f80d9}.wh-bubble-cohort>strong{display:block;color:var(--text);font:800 clamp(14px,1.8vw,20px)/1.5 var(--mono)}.wh-bubble-cohort>span{display:block;margin-top:4px;color:var(--muted);font:11px/1.6 var(--mono)}.wh-concentration figcaption{border-top:1px solid var(--line);padding-top:16px;color:var(--muted);font:12px/1.7 var(--sans)}.wh-concentration figcaption b{color:var(--text)}@media(max-width:600px){.wh-concentration{padding:16px}.wh-concentration-heading{gap:10px}.wh-concentration-heading h4{font-size:23px}.wh-concentration-multiple{font-size:28px}.wh-concentration-multiple small{font-size:9px}.wh-bubble-grid{gap:16px}.wh-point-bubble span{font-size:10px;margin-top:5px}.wh-bubble-cohort>span{font-size:10px}}' +
    '.wh-distribution .wh-top100-comparison{margin:18px 0 0;font-size:12px;line-height:1.7}.wh-top100-comparison b{color:var(--text)}.wh-group-points b{color:var(--text);font:700 12px var(--mono)}.wh-group-points>span{display:block;height:4px;margin-top:7px;background:color-mix(in srgb,var(--muted) 18%,transparent)}.wh-group-points i{display:block;height:100%;background:var(--v2-accent,#4c9af8)}' +
    '.wh-scenario-controls{display:flex;flex-wrap:wrap;gap:12px 28px;margin:18px 0}.wh-scenario-controls .wh-chips{margin:0}.wh-total-pressure .wh-readouts{margin:20px 0 14px}.wh-total-pressure .wh-caption,.wh-distribution .wh-caption{font-size:12px;margin:12px 0 0;line-height:1.6}.wh-band-bar{display:flex;height:20px;overflow:hidden;border-radius:3px;margin:22px 0 12px;gap:2px;background:var(--panel)}.wh-band-bar>span:nth-child(1){background:#4c9af8}.wh-band-bar>span:nth-child(2){background:#aaa2e8}.wh-band-bar>span:nth-child(3){background:#688099}.wh-band-legend{display:flex;flex-wrap:wrap;gap:10px 24px;font:11px/1.5 var(--mono);color:var(--muted)}.wh-band-legend>span::before{content:"";display:inline-block;width:8px;height:8px;margin-right:7px;background:#4c9af8}.wh-band-legend>span:nth-child(2)::before{background:#aaa2e8}.wh-band-legend>span:nth-child(3)::before{background:#688099}.wh-band-legend b{color:var(--text);margin-left:5px}.wh-inline-source{color:var(--v2-accent,#4c9af8)!important}.wh-account-notes{margin:0 0 18px}.wh-account-notes p{font-size:12px;line-height:1.7;color:var(--muted)!important}' +
    '.wh-sort{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:20px 0 14px}.wh-sort label{font:700 11px var(--mono);color:var(--muted)}.wh-sort select,.wh-sort button{min-height:40px;padding:9px 12px;border:1px solid var(--line);border-radius:4px;background:var(--panel);color:var(--text);font:700 12px var(--mono);cursor:pointer}.wh-sort select:focus-visible,.wh-sort button:focus-visible{outline:2px solid var(--v2-accent,#4c9af8);outline-offset:2px}.wh-sort-status{margin-left:auto;color:var(--muted);font:11px/1.5 var(--mono)}@media(max-width:600px){.wh-sort-status{flex-basis:100%;margin-left:0}.wh-sort select{max-width:50%}}' +
    '.wh-total-pressure{padding:22px;margin:0 0 28px;border:1px solid var(--line);background:var(--panel)}.wh-total-pressure h3{margin:12px 0 18px;color:var(--text);font-size:22px}.wh-total-pressure p{color:var(--muted)!important;font-size:13px;line-height:1.7}.wh-total-pressure .wh-readouts{margin:20px 0 30px}.wh-total-table{margin:20px 0}.wh-total-table tbody th{color:var(--text);font-size:12px}.wh-total-formula{font:12px/1.7 var(--mono)}.wh-flow-step{display:block;margin-top:24px}@media(max-width:700px){.wh-total-pressure{padding:16px}.wh-total-table th,.wh-total-table td{font-size:10px;padding:10px 4px}}' +
    '.wh-sell-pressure{border-top:1px solid var(--line);padding-top:22px;margin-top:24px}.wh-sell-pressure>h4{margin:0;color:var(--text);font:800 18px var(--sans)}.wh-sell-scroll{overflow-x:auto;margin:18px 0}.wh-sell-table{min-width:690px}.wh-sell-table tbody th{color:var(--text);font-size:12px;font-weight:700}.wh-sell-table small{display:block;margin-top:4px;color:var(--muted);font-size:9px;font-weight:400}.wh-sell-table td{white-space:nowrap}' +
    '.wh-economic>div{border-color:color-mix(in srgb,var(--v2-accent,#4c9af8) 40%,var(--line))}.wh-economic b{color:var(--v2-accent,#4c9af8)!important}' +
    '.wh-distribution{margin:0 0 28px;padding:22px;border:1px solid var(--line);background:var(--panel)}' +
    '.wh-rank{margin:0 0 28px;padding:22px;border:1px solid var(--line);background:var(--panel)}.wh-rank h3{margin:12px 0 16px;color:var(--text);font-size:22px}.wh-rank .wh-chips{margin:0 0 20px}' +
    '.rk-inp{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font:700 10px var(--mono);letter-spacing:.5px;text-transform:uppercase}.rk-inp input{width:96px;padding:6px 8px;border:1px solid var(--line);border-radius:4px;background:var(--panel2,var(--panel));color:var(--text);font:700 12px var(--mono)}' +
    '.rk-hero{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;padding:20px 22px 0;margin:0 -22px;border-top:1px solid var(--line)}.rk-hero h4{margin:8px 0 0;color:var(--text);font:800 clamp(22px,2.8vw,32px)/1.15 var(--sans);letter-spacing:-.8px}' +
    '.rk-big{flex-shrink:0;color:var(--v2-accent,#4c9af8);font:800 36px/1 var(--mono);text-align:right}.rk-big small{display:block;margin-top:8px;color:var(--muted);font:11px/1.4 var(--mono)}' +
    '.rk-ruler{margin:34px 0 22px;padding:0 8px}.rk-track{position:relative;height:8px;border-radius:4px;background:linear-gradient(90deg,#2866bb,#665db3 40%,#3f8f86 70%,var(--line))}' +
    '.rk-track>i{position:absolute;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:var(--text);border:3px solid var(--v2-bg,#0b0f14);box-shadow:0 0 0 2px var(--v2-accent,#4c9af8)}' +
    '.rk-track>i>em{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:3px 7px;border-radius:4px;background:var(--v2-accent,#4c9af8);color:#04101d;font:800 10px var(--mono);font-style:normal}' +
    '.rk-ticks{position:relative;height:30px;margin-top:8px}.rk-ticks>span{position:absolute;transform:translateX(-50%);text-align:center;white-space:nowrap}.rk-ticks>span:first-child{transform:none}.rk-ticks>span:last-child{transform:translateX(-100%);text-align:right}' +
    '.rk-ticks b{display:block;color:var(--muted);font:800 9.5px var(--mono)}.rk-ticks small{display:block;color:var(--dim,var(--muted));font:9px var(--mono)}' +
    '.wh-readouts.rk-four{grid-template-columns:repeat(4,minmax(0,1fr))}' +
    '.rk-bars{display:grid;gap:6px;margin:6px 0 10px}.rk-brow{display:grid;grid-template-columns:70px minmax(0,1fr);align-items:center;gap:10px}.rk-brow>span{color:var(--muted);font:800 9px var(--mono);letter-spacing:.8px;text-transform:uppercase}' +
    '.rk-bar{display:flex;gap:2px;height:22px}.rk-bar>span{display:block;min-width:4px;border-radius:3px;opacity:.55}.rk-bar>span.me{opacity:1;box-shadow:0 0 0 2px var(--text)}' +
    '.wh-rank .g1{background:#2866bb}.wh-rank .g2{background:#665db3}.wh-rank .g3{background:#3f8f86}.wh-rank .g4{background:#7b8794}' +
    '.rk-cum{display:flex;flex-wrap:wrap;gap:6px 22px;margin:4px 0 0 80px;color:var(--muted);font:11px/1.5 var(--mono)}.rk-cum b{margin-left:5px;color:var(--text)}' +
    '.rk-legend{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0 16px}.rk-lg{padding:10px 12px;border:1px solid var(--line);border-radius:4px;background:var(--panel);min-width:0}.rk-lg.me{border-color:var(--text)}' +
    '.rk-lg>i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:7px;vertical-align:middle}.wh-rank .rk-lg{background:var(--panel)}.rk-lg.g1>i{background:#2866bb}.rk-lg.g2>i{background:#665db3}.rk-lg.g3>i{background:#3f8f86}.rk-lg.g4>i{background:#7b8794}' +
    '.rk-lg>b{color:var(--text);font:800 11px var(--mono)}.rk-lg>b em{margin-left:4px;padding:1px 5px;border-radius:3px;background:var(--v2-accent,#4c9af8);color:#04101d;font:800 9px var(--mono);font-style:normal}' +
    '.rk-lg>span{display:block;margin-top:6px;color:var(--muted);font:10.5px/1.5 var(--mono)}.rk-lg strong{color:var(--text)}.rk-lg>small{display:block;margin-top:2px;color:var(--dim,var(--muted));font:10px var(--mono)}' +
    '@media(max-width:700px){.wh-rank{padding:16px}.rk-hero{flex-direction:column;align-items:flex-start;padding:16px 16px 0;margin:0 -16px}.rk-big{text-align:left;font-size:28px}.wh-readouts.rk-four,.rk-legend{grid-template-columns:repeat(2,minmax(0,1fr))}.rk-ticks small{display:none}.rk-ticks>span:nth-child(5){display:none}.rk-cum{margin-left:0}}' +
    '.wh-distribution h3{margin:20px 0 10px;color:var(--text);font-size:22px}' +
    '.wh-distribution p{margin:10px 0 18px;color:var(--muted)!important;font-size:13px;line-height:1.7}' +
    '.wh-projection-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:24px 0}.wh-projection-grid h4{color:var(--text);margin:0 0 12px;font-size:14px}.wh-projection-table{width:100%;border-collapse:collapse;font:12px var(--mono);color:var(--text)}.wh-projection-table th,.wh-projection-table td{padding:10px 6px;text-align:right;border-bottom:1px solid var(--line)}.wh-projection-table th:first-child,.wh-projection-table td:first-child{text-align:left}.wh-projection-table th{color:var(--muted);font-size:10px}.wh-cutoff-selected{background:color-mix(in srgb,var(--v2-accent,#4c9af8) 15%,transparent);font-weight:800}.wh-baseline{margin-top:20px}.wh-baseline summary{cursor:pointer;color:var(--muted);font:12px var(--mono)}' +
    '.wh-distribution-images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}' +
    '.wh-distribution-images figure{margin:0;min-width:0}.wh-distribution-images img{display:block;width:100%;height:auto;border:1px solid var(--line)}' +
    '.wh-distribution-images figcaption{margin-top:8px;color:var(--muted)!important;font-size:11px}' +
    '@media(max-width:700px){.wh-distribution{padding:16px}.wh-distribution-images,.wh-projection-grid{grid-template-columns:1fr}}' +
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
    '.wh-avatar{display:grid;place-items:center;flex:0 0 auto;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);color:var(--muted);font:700 12px var(--mono)}' +
    '.wh-pending .wh-said p{margin:0;color:var(--muted)!important;font-size:12px;line-height:1.6;overflow-wrap:anywhere}' +
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

  var NEXT_TITLE = 'Next Farm by Varriors';
  /* Perp DEX farms, in the order given. Logos are local (img-src 'self'): official X avatars,
     RISEx's own site icon since it links no X account. ref: true means the link already
     carries a referral code; the others link plain until one is supplied. Blurbs are read
     from each project's own site; HelloTrade has none on record, so it shows none. */
  var FARMS_PERP = [
    { k: 'truenorth', name: 'TrueNorth', logo: 'assets/farms/truenorth.jpg', x: 'get_truenorth', ref: true,
      url: 'https://app.truenorth.xyz/ref/KOREAN',
      what: 'Agentic brokerage: AI agents scan the market, set up trades and watch the portfolio.' },
    { k: 'entropy', name: 'Entropy', logo: 'assets/farms/entropy.jpg', x: 'entropyIO', ref: false,
      url: 'https://entropy.io/leaderboard?filter=7d',
      what: 'Perps on private-market assets and other hard-to-access markets.' },
    { k: 'risex', name: 'RISEx', logo: 'assets/farms/risex.png', x: null, ref: true,
      url: 'https://www.rise.trade/invite/x04cfg1y',
      what: 'Fully onchain orderbook perps on RISE, with yield on idle collateral.' },
    { k: 'derpetual', name: 'Derpetual', logo: 'assets/farms/derpetual.jpg', x: 'derpetual', ref: false,
      url: 'https://www.derpetual.com/',
      what: 'Abstract futures: markets on measurable quantities beyond traditional assets.' },
    { k: 'hellotrade', name: 'HelloTrade', logo: 'assets/farms/hellotrade.jpg', x: 'hellotradeapp', ref: false,
      url: 'https://x.com/hellotradeapp', what: '' }
  ];

  function farmCard(f) {
    return '<article class="nf-farm">' +
      '<a class="nf-farm-id" href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">' +
        '<img src="' + esc(f.logo) + '" alt="' + esc(f.name) + ' logo" width="56" height="56">' +
        '<b>' + esc(f.name) + '</b></a>' +
      (f.what ? '<p>' + esc(f.what) + '</p>' : '<p class="nf-farm-none"></p>') +
      '<div class="nf-farm-links">' +
        '<a class="nf-farm-go' + (f.ref ? ' ref' : '') + '" href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">' +
          (f.ref ? 'Join with referral ↗' : 'Open ↗') + '</a>' +
        (f.x ? '<a class="nf-farm-x" href="https://x.com/' + esc(f.x) + '" target="_blank" rel="noopener noreferrer">@' + esc(f.x) + '</a>' : '') +
      '</div></article>';
  }


  function renderNext() {
    var host = document.querySelector('[data-tg="whales-next"]');
    if (!host) return;
    host.innerHTML = '<div class="cmp-heading"><span class="cmp-eyebrow">POST-TGE · NEXT FARMS</span>' +
      '<h2>' + NEXT_TITLE + '</h2><p>Farming projects, with Varriors’ picks and reasons to farm.</p></div>' +
      '<div class="nf-categories" aria-label="Upcoming farming projects">' +
      '<section class="nf-category" aria-labelledby="nf-non-perp"><span class="nf-part">PART 01</span><h3 id="nf-non-perp">Non Perp DEX</h3><div class="nf-empty"><h4>Coming soon</h4></div></section>' +
      '<section class="nf-category" aria-labelledby="nf-perp"><span class="nf-part">PART 02</span><h3 id="nf-perp">Perp DEX</h3>' +
      '<div class="nf-farms">' + FARMS_PERP.map(farmCard).join('') + '</div></section></div>';
  }

  function mountNext() {
    var main = document.querySelector('#main');
    if (!main || document.querySelector('[data-tg="whales-next"]')) return;
    var sec = document.createElement('section');
    sec.className = 'whales-next-report tsec tg-hide';
    sec.setAttribute('data-tg', 'whales-next');
    main.appendChild(sec);
    var tabs = document.getElementById('tabs');
    if (tabs && !document.getElementById('tab-whales-next')) {
      var button = document.createElement('button');
      button.id = 'tab-whales-next';
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', 'false');
      button.dataset.tab = 'whales-next';
      button.textContent = NEXT_TITLE;
      tabs.appendChild(button);
    }
    document.querySelectorAll('[data-open-tab="whales"]').forEach(function (btn) {
      var rail = btn.parentNode;
      if (!rail || rail.querySelector('[data-open-tab="whales-next"]')) return;
      var next = btn.cloneNode(true);
      next.setAttribute('data-open-tab', 'whales-next');
      next.classList.remove('on');
      var title = next.querySelector('strong') || next.querySelector('b');
      if (title) title.textContent = NEXT_TITLE;
      var small = next.querySelector('small');
      if (small) small.textContent = 'projects & Varriors’ picks';
      rail.insertBefore(next, btn.nextSibling);
    });
    var style = document.createElement('style');
    style.textContent = '.nf-empty{border:1px dashed var(--line);padding:20px;background:var(--panel)}' +
      '.nf-categories{margin:28px 0 36px}.nf-category{padding:24px 0}.nf-category+.nf-category{border-top:1px solid var(--line);margin-top:8px;padding-top:32px}.nf-part{color:var(--v2-accent,#4c9af8);font:800 10px var(--mono);letter-spacing:1px}.nf-category>h3{margin:10px 0 18px;color:var(--text);font-size:24px}.nf-empty{border-style:dashed}.nf-empty h4{margin:0 0 8px;color:var(--text);font-size:18px}.nf-empty p{margin:0;color:var(--muted)!important;font-size:13px;line-height:1.6}' +
      '[data-open-tab="whales-next"]{height:auto!important;min-height:54px;white-space:normal!important;padding-top:10px!important;padding-bottom:10px!important}' +
      '[data-open-tab="whales-next"] strong,[data-open-tab="whales-next"] b{white-space:normal!important;line-height:1.4!important}' +
      '@media(max-width:1000px){[data-open-tab="whales-next"]{max-width:235px}}' +
      '.nf-farms{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-top:16px}' +
      '.nf-farm{display:flex;flex-direction:column;gap:12px;padding:18px;border:1px solid var(--line);background:var(--panel);min-width:0}' +
      '.nf-farm:hover{border-color:var(--v2-accent,#4c9af8)}' +
      '.nf-farm-id{display:flex;align-items:center;gap:12px;color:var(--text)!important;text-decoration:none}' +
      '.nf-farm-id img{flex:0 0 56px;width:56px;height:56px;border-radius:14px;object-fit:cover;border:1px solid var(--line);background:var(--panel2,var(--panel))}' +
      '.nf-farm-id b{font:800 17px/1.2 var(--sans);letter-spacing:-.2px}' +
      '.nf-farm p{flex:1;margin:0;color:var(--muted)!important;font-size:12px;line-height:1.55}' +
      '.nf-farm-links{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}' +
      '.nf-farm-go{padding:7px 11px;border:1px solid var(--line);border-radius:4px;color:var(--text)!important;font:800 10.5px var(--mono);text-decoration:none}' +
      '.nf-farm-go.ref{border-color:var(--v2-accent,#4c9af8);color:var(--v2-accent,#4c9af8)!important}' +
      '.nf-farm-go:hover{background:var(--v2-accent,#4c9af8);border-color:var(--v2-accent,#4c9af8);color:#04101d!important}' +
      '.nf-farm-x{color:var(--muted)!important;font:700 10.5px var(--mono);text-decoration:none}.nf-farm-x:hover{color:var(--text)!important}' +
      '@media(max-width:600px){.nf-empty{padding:16px}.nf-farms{grid-template-columns:repeat(2,minmax(0,1fr))}.nf-farm{padding:14px}.nf-farm-id img{flex-basis:44px;width:44px;height:44px;border-radius:11px}}';
    document.head.appendChild(style);
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
      if (typeof VALID_TABS !== 'undefined' && VALID_TABS.indexOf('whales-next') < 0) VALID_TABS.push('whales-next');
      if (typeof DEFAULT_TAB_ORDER !== 'undefined' && DEFAULT_TAB_ORDER.indexOf('whales-next') < 0) DEFAULT_TAB_ORDER.push('whales-next');
      if (typeof SECTION_COPY !== 'undefined') SECTION_COPY['whales-next'] = {
        eyebrow: 'Post-TGE', title: NEXT_TITLE,
        description: 'Farming projects, with Varriors’ picks and reasons to farm.', chip: 'next farms'
      };
      if (typeof VALID_TABS !== 'undefined' && VALID_TABS.indexOf('whales') < 0) VALID_TABS.push('whales');
      if (typeof DEFAULT_TAB_ORDER !== 'undefined' && DEFAULT_TAB_ORDER.indexOf('whales') < 0) {
        var i = DEFAULT_TAB_ORDER.indexOf('monitors');
        DEFAULT_TAB_ORDER.splice(i < 0 ? DEFAULT_TAB_ORDER.length : i + 1, 0, 'whales');
      }
      if (typeof SECTION_COPY !== 'undefined') SECTION_COPY.whales = {
        eyebrow: 'Whales',
        title: 'Whales',
        description: 'FDV, total airdrop sell pressure, rank distribution and tracked whales.',
        chip: 'disclosed + estimates'
      };
    } catch (_) {}
  }

  function boot() {
    injectStyle();
    registerTab();
    mount();
    render();
    mountNext();
    renderNext();
    loadProfiles();
    /* the Playbook tab can change the same points value */
    document.addEventListener('var:points', function (e) {
      if (e.detail !== myPts) { myPts = e.detail; render(); }
    });
    var renderedWeek = distributionAt(Date.now()).weeks;
    setInterval(function () {
      var week = distributionAt(Date.now()).weeks;
      if (week !== renderedWeek) { renderedWeek = week; render(); }
    }, 60000);
    /* dashboard.js resolves the opening hash before this tab exists, so a shared
       #whales link would land on Overview without this */
    if ((location.hash === '#whales' || location.hash === '#whales-next') && typeof showTab === 'function') {
      try { showTab(location.hash.slice(1), { push: false }); } catch (_) {}
    }
    document.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('[data-wh-sort-direction]')) {
        whaleSortDirection = whaleSortDirection === 'asc' ? 'desc' : 'asc';
        updateWhaleSort();
        return;
      }
      var sale = e.target && e.target.closest && e.target.closest('[data-wh-sell]');
      if (sale && [0.25, 0.5, 1].indexOf(+sale.dataset.whSell) >= 0) {
        sellFraction = +sale.dataset.whSell;
        render();
        return;
      }
      var pt = e.target && e.target.closest && e.target.closest('[data-wh-pts]');
      if (pt) {
        setMyPts(+pt.getAttribute('data-wh-pts'));
        render();
        return;
      }
      var b = e.target && e.target.closest && e.target.closest('[data-wh-fdv]');
      if (!b) return;
      fdv = +b.getAttribute('data-wh-fdv');
      render();
    });
    document.addEventListener('change', function (e) {
      if (e.target && e.target.matches && e.target.matches('[data-wh-pts-input]')) {
        var v = Number(e.target.value);
        if (isFinite(v) && v >= 0) { setMyPts(v); render(); }
        return;
      }
      if (!e.target || !e.target.matches('[data-wh-sort]') || !Object.prototype.hasOwnProperty.call(WHALE_SORT_FIELDS, e.target.value)) return;
      whaleSort = e.target.value;
      whaleSortDirection = whaleSort === 'rank' || whaleSort === 'name' ? 'asc' : 'desc';
      updateWhaleSort();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
