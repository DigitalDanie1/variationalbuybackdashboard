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
    return '<li class="wh-row">' +
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
        '<em>' + (w.approximate ? '예상치 · approximate self-report · ' : '') + (r.share * 100).toFixed(2) + '% of all points</em></div>' +
      '<div class="wh-val"><b>' + esc(usd(r.value)) + '</b><em>at ' + esc(fdvLabel(fdv)) + ' FDV</em></div>' +
      '<div class="wh-asof' + (stale ? ' stale' : '') + '"><b>' + esc(dateLabel(w.asOf)) + '</b>' +
        '<em>' + (stale ? r.age + 'd old · stale' : (r.age <= 0 ? 'today' : r.age + 'd ago')) + '</em>' +
        '<a href="' + esc(w.post) + '" target="_blank" rel="noopener noreferrer">source ↗</a>' +
        (w.cardSource ? '<br><a href="' + esc(w.cardSource) + '" target="_blank" rel="noopener noreferrer">earlier card post ↗</a><br><a href="' + esc(w.cardImage) + '" target="_blank" rel="noopener noreferrer">view Aug 2 card ↗</a>' : '') + '</div>' +
      (said || weekly ? '<div class="wh-said">' + (said ? '<ul>' + said + '</ul>' : '') + weekly + '</div>' : '') +
      '</li>';
  }

  /* One sentence about the spread between the rows, worked out from them so it stays true
     as accounts are added. With fewer than two rows there is nothing to compare. */
  function spread(rs) {
    if (rs.length < 2) return '';
    var hi = rs[0], lo = rs[rs.length - 1];
    var mult = hi.w.points / lo.w.points;
    return '<p class="wh-spread"><b>' + esc(hi.w.name) + ' holds ' + (hi.w.approximate || lo.w.approximate ? 'about ' : '') + mult.toFixed(1) + '× the points of ' + esc(lo.w.name) + '.</b> ' +
      'The gap between them is ' + (hi.w.approximate || lo.w.approximate ? 'about ' : '') + int(hi.w.points - lo.w.points) + ' points — about ' +
      usd((hi.value - lo.value)) + ' of airdrop at ' + esc(fdvLabel(fdv)) + ' FDV.</p>';
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
    return '<li class="wh-row wh-pending">' +
      '<span class="wh-rank">' + (indirect ? esc(w.rankLabel || '—') : '≤100') + '<small>예상치 · ' + (indirect ? 'indirect report' : 'assumed') + '</small></span>' +
      '<div class="wh-who">' + profileAvatar(w) +
      '<div><b>' + esc(profileFor(w).name || w.name) + '</b><a href="' + esc(w.profile) + '" target="_blank" rel="noopener noreferrer">@' + esc(w.handle) + '</a></div></div>' +
      '<div class="wh-pts"><b>' + (floor || indirect ? '≥' : '~') + int(points) + '</b><em>예상치 · ' + (indirect ? '30,000+ band · indirect report' : floor ? '20,000-point minimum scenario' : 'Top 100 cutoff scenario') + '</em><em>' + (share * 100).toFixed(3) + '% of projected points</em></div>' +
      '<div class="wh-val"><b>~' + esc(usd(share * AIRDROP_SHARE * fdv)) + '</b><em>예상치 · at ' + esc(fdvLabel(fdv)) + ' FDV</em></div>' +
      '<div class="wh-asof"><b>' + esc(dateLabel(projection.asOf)) + '</b><em>model week · not a disclosure</em>' +
      (evidence ? '<a href="' + esc(evidence) + '" target="_blank" rel="noopener noreferrer">' + (indirect ? 'indexed report ↗' : 'context only ↗') + '</a>' : '') + '</div>' +
      '<div class="wh-said"><p>' + (indirect ? '예상치: an indexed repost places Lynn03 around #6 and the Top 10 in the 30,000+ points band. Valued at a 30,000-point floor; original post date and exact balance remain unverified.' : floor ? '예상치: user-specified minimum of 20,000 points; valued at the higher of that floor and the projected Top 100 cutoff.' : '예상치: assumed to be at least Top 100; valued at the projected #100 cutoff.') + ' Actual current balance and rank are unverified.' +
      (w.pointsLabel && !indirect ? ' Earlier indirect report: ' + esc(w.pointsLabel) + ' points; not used in this scenario.' : '') + '</p></div></li>';
  }

  function distributionReport() {
    var source = 'https://x.com/yh_0x/status/2106449057933857025';
    var d = distributionAt(Date.now());
    var bands = [['Top 10',6.1],['11–50',8.7],['51–100',6.0],['101–250',10.6],['251–500',9.2],['501–1,000',10.1],['1,001–2,000',11.1],['2,001–5,000',15.3],['5,001–10,000',10.9],['10,001–25,000',10.0],['25,001–74,000',2.0]];
    var cutoffs = [[2,89111],[5,52500],[10,35200],[50,13900],[100,9340],[150,7250],[500,2570],[1000,1430],[2000,770],[5000,290],[10000,150],[15000,70],[25000,22],[29000,15]];
    return '<article class="wh-distribution" aria-labelledby="wh-distribution-title">' +
      '<div class="wh-distribution-head"><div class="wh-who"><img src="assets/whales/yh_0x.jpg" alt="yh_0x profile" width="40" height="40">' +
      '<div><b>yh_0x · baseline source</b><a href="' + source + '" target="_blank" rel="noopener noreferrer">@yh_0x · original post ↗</a></div></div>' +
      '<span class="wh-tier">예상치 · weekly projection</span></div>' +
      '<h3 id="wh-distribution-title">How the points are distributed</h3>' +
      '<p>예상치 · Model week ' + esc(d.asOf) + ' (SGT), +' + d.weeks + ' completed weeks from the Oct 4, 2026 Week 42 snapshot. Next increase: ' + esc(d.next) + ' at 00:00 SGT.</p>' +
      '<div class="wh-distribution-metrics"><div><span>Issued points · 예상치</span><b>' + (d.pool / 1e6).toFixed(2) + 'M</b><em>9.44M + ' + d.weeks + ' × 150,000</em></div>' +
      '<div><span>Top 100 cutoff · 예상치</span><b>~' + int(d.top100) + '</b><em>9,340 × pool growth</em></div>' +
      '<div><span>Weekly increase · assumed</span><b>150,000</b><em>every Sunday · SGT</em></div>' +
      '<div><span>Top 1,000 share · assumed</span><b>~50.7%</b><em>baseline shares held constant</em></div></div>' +
      '<p>This scenario adds 150,000 points per completed week and scales rank cutoffs in proportion to the pool. Rank-band shares stay constant; this is a projection, not a refreshed leaderboard. The 31,693 weekly earners were observed in Week 42 only.</p>' +
      '<div class="wh-projection-grid"><div><h4>Points by rank band · 예상치</h4><table class="wh-projection-table"><thead><tr><th>Rank band</th><th>Share assumed</th><th>Points est.</th></tr></thead><tbody>' +
      bands.map(function (b) { return '<tr><td>' + b[0] + '</td><td>' + b[1].toFixed(1) + '%</td><td>' + int(d.pool * b[1] / 100) + '</td></tr>'; }).join('') +
      '</tbody></table></div><div><h4>Rank cutoffs · 예상치</h4><table class="wh-projection-table"><thead><tr><th>Rank</th><th>Points est.</th></tr></thead><tbody>' +
      cutoffs.map(function (c) { return '<tr' + (c[0] === 100 ? ' class="wh-cutoff-selected"' : '') + '><td>Top ' + int(c[0]) + '</td><td>~' + int(c[1] * d.scale) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>' +
      '<details class="wh-baseline"><summary>Original Week 42 snapshot · historical reference</summary><p>Oct 4, 2026 source images. These remain unchanged; the current scenario is shown above.</p>' +
      '<div class="wh-distribution-images"><figure><a href="assets/whales/yh-week42-1.jpg" target="_blank" rel="noopener noreferrer">' +
      '<img src="assets/whales/yh-week42-1.jpg" alt="Historical Week 42 points distribution, 9.44M points" width="1080" height="1350" loading="lazy"></a><figcaption>Historical distribution</figcaption></figure>' +
      '<figure><a href="assets/whales/yh-week42-2.jpg" target="_blank" rel="noopener noreferrer"><img src="assets/whales/yh-week42-2.jpg" alt="Historical Week 42 rank cutoffs, Top 100 at 9,340+" width="1080" height="1350" loading="lazy"></a><figcaption>Historical rank cutoffs</figcaption></figure></div></details>' +
      '<a class="wh-distribution-source" href="' + source + '" target="_blank" rel="noopener noreferrer">Read the baseline analysis on X ↗</a></article>';
  }

  function render() {
    var host = document.querySelector('[data-tg="whales"]');
    if (!host) return;
    var rs = rows();
    var top = rs.length ? rs[0].w.points : 1;
    var total = rs.reduce(function (a, r) { return a + r.w.points; }, 0);
    var projection = distributionAt(Date.now());
    var pool = projection.pool;
    var estimatedTotal = WATCHLIST.reduce(function (sum, w) { return sum + estimatedPoints(w, projection); }, 0);

    var chips = FDVS.map(function (v) {
      return '<button type="button" data-wh-fdv="' + v + '"' + (v === fdv ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' +
        esc(fdvLabel(v)) + '</button>';
    }).join('');

    host.innerHTML =
      '<div class="cmp-heading"><span class="cmp-eyebrow">WHALES</span>' +
      '<h2>Who sits at the top of the points board</h2>' +
      '<p>Publicly disclosed points and explicit scenarios. Dated cards are self-reported; cards older than two weeks are marked stale. Unverified accounts use a Top 100 cutoff scenario, with a 20,000-point minimum for seven selected accounts and a 30,000-point indirect estimate for Lynn03. CorgiI’s dated ~10,000 figure is an approximate self-report. All assumptions are labeled 예상치 (estimate).</p></div>' +
      distributionReport() +
      '<div class="wh-readouts">' +
        '<div><span>Accounts tracked</span><b>' + (rs.length + WATCHLIST.length) + '</b><em>' + rs.length + ' dated disclosures · ' + WATCHLIST.length + ' estimates (7 at 20k; Lynn03 at 30k)</em></div>' +
        '<div><span>Combined points · mixed / 예상치</span><b>~' + int(total + estimatedTotal) + '</b><em>' + int(total) + ' dated + ' + int(estimatedTotal) + ' estimated · ' + ((total + estimatedTotal) / pool * 100).toFixed(2) + '% of projected pool</em></div>' +
        '<div><span>All points issued, est.</span><b>' + (pool / 1e6).toFixed(2) + 'M</b><em>weekly distribution scenario</em></div>' +
      '</div>' +
      '<div class="tp-chips wh-chips"><span>Value at FDV</span>' + chips + '</div>' +
      '<ol class="wh-list">' + rs.map(function (r) { return row(r, top); }).join('') + WATCHLIST.map(pendingRow).join('') + '</ol>' +
      spread(rs) +
      '<p class="wh-spread">Scenario assumption: nine accounts use the projected Top 100 cutoff; seven use a user-specified 20,000-point minimum; Lynn03 uses a 30,000-point floor from an indirect report. Floors apply unless the projected Top 100 cutoff is higher. This is not evidence of their actual rank or balance. The combined figure mixes dated disclosures with these estimates; related posts are context only.</p>' +
      '<div class="tp-note"><b>How the value is worked out.</b> Dated disclosures (including CorgiI’s approximate self-report): points ÷ the Points Calculator pool at the card date × 32% Genesis airdrop × selected FDV. 예상치 rows: scenario points ÷ the projected distribution pool × 32% × selected FDV. Both models are estimates. The 20,000 and 30,000-point minimums stay fixed until revised; its projected share and value change as the pool grows.</div>';
  }

  var STYLE =
    '.wh-distribution{margin:0 0 28px;padding:22px;border:1px solid var(--line);background:var(--panel)}' +
    '.wh-distribution-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}' +
    '.wh-distribution h3{margin:20px 0 10px;color:var(--text);font-size:22px}' +
    '.wh-distribution p{margin:10px 0 18px;color:var(--muted)!important;font-size:13px;line-height:1.7}' +
    '.wh-distribution-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:20px 0}' +
    '.wh-distribution-metrics>div{padding:14px;border:1px solid var(--line);min-width:0}' +
    '.wh-distribution-metrics span{display:block;color:var(--muted)!important;font:800 10px var(--mono);text-transform:uppercase}' +
    '.wh-distribution-metrics b{display:block;margin-top:8px;color:var(--text);font:700 23px var(--mono)}' +
    '.wh-distribution-metrics em{display:block;margin-top:5px;color:var(--muted)!important;font-size:11px;font-style:normal}' +
    '.wh-projection-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:24px 0}.wh-projection-grid h4{color:var(--text);margin:0 0 12px;font-size:14px}.wh-projection-table{width:100%;border-collapse:collapse;font:12px var(--mono);color:var(--text)}.wh-projection-table th,.wh-projection-table td{padding:10px 6px;text-align:right;border-bottom:1px solid var(--line)}.wh-projection-table th:first-child,.wh-projection-table td:first-child{text-align:left}.wh-projection-table th{color:var(--muted);font-size:10px}.wh-cutoff-selected{background:color-mix(in srgb,var(--v2-accent,#4c9af8) 15%,transparent);font-weight:800}.wh-baseline{margin-top:20px}.wh-baseline summary{cursor:pointer;color:var(--muted);font:12px var(--mono)}' +
    '.wh-distribution-images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}' +
    '.wh-distribution-images figure{margin:0;min-width:0}.wh-distribution-images img{display:block;width:100%;height:auto;border:1px solid var(--line)}' +
    '.wh-distribution-images figcaption{margin-top:8px;color:var(--muted)!important;font-size:11px}' +
    '.wh-distribution-source{display:inline-block;margin-top:18px;color:var(--v2-accent,#4c9af8)!important;font:700 12px var(--mono)}' +
    '@media(max-width:700px){.wh-distribution{padding:16px}.wh-distribution-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.wh-distribution-images,.wh-projection-grid{grid-template-columns:1fr}}' +
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

  function renderNext() {
    var host = document.querySelector('[data-tg="whales-next"]');
    if (!host) return;
    host.innerHTML = '<div class="cmp-heading"><span class="cmp-eyebrow">POST-TGE · NEXT FARMS</span>' +
      '<h2>' + NEXT_TITLE + '</h2><p>Farming projects, with Varriors’ picks and reasons to farm.</p></div>' +
      '<div class="nf-categories" aria-label="Upcoming farming projects">' +
      '<section class="nf-category" aria-labelledby="nf-non-perp"><span class="nf-part">PART 01</span><h3 id="nf-non-perp">Non Perp DEX</h3><div class="nf-empty"><h4>Coming soon</h4></div></section>' +
      '<section class="nf-category" aria-labelledby="nf-perp"><span class="nf-part">PART 02</span><h3 id="nf-perp">Perp DEX</h3><div class="nf-empty"><h4>Coming soon</h4></div></section></div>';
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
      '@media(max-width:600px){.nf-empty{padding:16px}}';
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
        description: 'Public share cards and labeled Top 100 estimates, valued at a chosen FDV.',
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
      var b = e.target && e.target.closest && e.target.closest('[data-wh-fdv]');
      if (!b) return;
      fdv = +b.getAttribute('data-wh-fdv');
      render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
