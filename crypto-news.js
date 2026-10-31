/* Historical Data archive: source-linked project events, official reports, and a separate market-context filter. Calendar news markers open the matching context in this archive. */
(function () {
  'use strict';

  const CRYPTO_NEWS_ASOF = '2026-10-30';

  const CRYPTO_NEWS = [
    {
      date: '2026-10-29', tag: 'SECURITY', level: 'critical',
      title: 'Binance hit by suspected hot-wallet hack',
      detail: 'On-chain outflow estimates run from $3.3B (Blockaid) to $5.8B. Deposits and withdrawals are suspended; Binance says it will cover losses. Tether froze 1.567B USDT and Circle 800M+ USDC. BTC slid below $77K.',
      sources: [
        { label: 'The Block', url: 'https://www.theblock.co/news/markets/2026-10-29-binance-investigating-hack-suspicious-outflows-5-billion-432171' },
        { label: 'TechCrunch', url: 'https://techcrunch.com/2026/10/29/binance-pauses-withdrawals-as-hackers-suspected-of-stealing-billions-in-crypto' }
      ]
    },
    {
      date: '2026-10-29', tag: 'PERP DEX', level: 'high',
      title: 'NYSE owner ICE brings Hyperliquid perps to the US; Druckenmiller backs trade[XYZ]',
      detail: 'ICE is partnering with trade[XYZ] on a US-regulated perpetual futures market built on Hyperliquid infrastructure, pending CFTC approval. Stanley Druckenmiller disclosed an investment in trade[XYZ]. HYPE rose 12%+ on the day.',
      sources: [
        { label: 'Motley Fool', url: 'https://www.fool.com/coverage/stock-market-today/2026/10/29/stock-market-today-oct-29-hyperliquid-strategies-stock-surges-23-as-wall-street-giant-ice-and-billionaire-stanley-druckenmiller-back-hyperliquid/' },
        { label: 'BeInCrypto', url: 'https://beincrypto.com/hype-token-surges-nyse-owner-hyperliquid/' }
      ]
    },
    {
      date: '2026-10-28', tag: 'MACRO', level: 'high',
      title: 'Fed holds rates at 3.75–4.00%',
      detail: 'The October decision held policy steady, with dissents in favour of a hike. BTC hovered around $80K into the decision.',
      sources: [
        { label: 'Motley Fool', url: 'https://www.fool.com/coverage/stock-market-today/2026/10/28/crypto-market-today-oct-28-bitcoin-and-altcoins-gain-as-fed-decision-clears-the-way-for-big-tech-earnings/' }
      ]
    },
    {
      date: '2026-10-21', tag: 'REGULATION', level: 'high',
      title: 'OCC finalizes GENIUS Act stablecoin rules',
      detail: 'Rules on reserves, redemptions, custody and risk management for US payment stablecoins take effect January 18, 2027.',
      sources: [
        { label: 'Caleb & Brown', url: 'https://calebandbrown.com/blog/weekly-rollup-october-26-2026/' }
      ]
    },
    {
      date: '2026-10-21', tag: 'INFRA', level: 'normal',
      title: 'Solana activates Alpenglow',
      detail: 'The new consensus protocol replaces TowerBFT, which Solana had run since 2020.',
      sources: [
        { label: 'Towards Finance', url: 'https://blog.towardsfinance.com/last-week-in-crypto-key-stories-from-october-19-25-2026-d04a5644cdde' }
      ]
    },
    {
      date: '2026-10-09', tag: 'SECURITY', level: 'high',
      title: 'Ledger halts reseller CryptoBilis after wallet drains',
      detail: 'Buyers in Indonesia, Malaysia and the Philippines reported drained wallets; on-chain estimates run $72M–$93M. Ledger told recent buyers not to set up their devices.',
      sources: [
        { label: 'The Defiant', url: 'https://thedefiant.io/news/hacks/ledger-asks-cryptobilis-to-halt-sales-amid-reports-of-lost-funds' },
        { label: 'Decrypt', url: 'https://decrypt.co/380582/ledger-probes-87mft-crypto-wallet-reseller' }
      ]
    },
    {
      date: '2026-10-02', tag: 'PRODUCTS', level: 'normal',
      title: 'SEC clears the first 3x bitcoin and ether ETFs',
      detail: 'A Cboe rule change lets Volatility Shares list 3x daily funds; trading waits on an effective registration.',
      sources: [
        { label: 'CoinDesk', url: 'https://www.coindesk.com/daybook-us/2026/10/05/sec-approves-a-3x-fix-for-bitcoin-and-ether-traders-who-miss-the-wild-swings' }
      ]
    },
    {
      date: '2026-10-02', tag: 'SECURITY', level: 'normal',
      title: 'Bitget expects to recover little of its $388M hack',
      detail: 'The September 24 exploit used stolen internal credentials; Bitget refilled its $300M Protection Fund from reserves.',
      sources: [
        { label: 'CNBC', url: 'https://www.cnbc.com/2026/10/02/bitget-crypto-stolen-hack-recovery.html' }
      ]
    },
    {
      date: '2026-10-01', tag: 'REGULATION', level: 'normal',
      title: 'SEC proposes a new crypto custody rule',
      detail: 'Advisers and funds could self-custody when no qualified custodian is available, and state trust companies could act as custodians. 60-day comment period.',
      sources: [
        { label: 'Willkie', url: 'https://www.willkie.com/publications/2026/10/sec-proposes-a-new-crypto-asset-self-custody-rule-and-other-amendments-to-modernize-custody-rules' },
        { label: 'Finance Magnates', url: 'https://www.financemagnates.com/cryptocurrency/regulation/sec-proposes-last-resort-crypto-self-custody-for-advisers-and-funds/' }
      ]
    }
  ];

  const DAY_MS = 86400000;

  let historyFilter='variational',historyYear='all',historyOrder='oldest';
  const HISTORY_EVENTS = [
    {date:'2021-12-01',dateLabel:'Late 2021',category:'funding',tag:'ORIGINS',title:'The trading firm behind Variational',detail:'The founders raised about $10M for a market-making firm in late 2021. Its 2021–2023 trading profits later funded nearly all protocol development. Month-level timing; not a protocol launch date.',sources:[{label:'Founder retrospective',url:'https://x.com/variational_lvs/status/1925607454957871570'}]},
    {date:'2024-10-23',category:'funding',tag:'FUNDING',title:'$10.3M seed round announced',detail:'Bain Capital Crypto and Peak XV co-led the seed round. This is the public announcement date; the original financing closed in late 2021.',sources:[{label:'Founder announcement',url:'https://x.com/variational_lvs/status/1849121013285691820'}]},
    {date:'2025-01-01',dateLabel:'Jan 2025',category:'products',tag:'OMNI',title:'Omni enters invite-only private beta',detail:'Variational’s later Series A announcement dates the invite-only release to January 2025. An exact day is not specified in that source.',sources:[{label:'Variational · Business Wire',url:'https://www.businesswire.com/news/home/20260520402312/en/'}]},
    {date:'2025-06-04',category:'funding',tag:'PARTNERS',title:'$1.5M strategic round announced',detail:'Strategic partners were brought in to help institutional market-making, exotic-market quoting and OLP liquidity. The founder describes partner alignment rather than a need for runway.',sources:[{label:'Founder announcement',url:'https://x.com/variational_lvs/status/1930301466905870725'}]},
    {date:'2026-05-20',category:'funding',tag:'SERIES A',title:'$50M to bring TradFi liquidity on-chain',detail:'A roughly $50M Series A led by Dragonfly, with Bain Capital Crypto, Coinbase Ventures and other strategic investors. Financing and product rollout were announced together.',sources:[{label:'Variational · Business Wire',url:'https://www.businesswire.com/news/home/20260520402312/en/'}]},
    {date:'2026-05-20',category:'products',tag:'RWA PERPS',title:'The first RWA markets go live',detail:'Gold, silver, copper and WTI crude launch as Phase 1 RWA perpetuals, initially using aggregated crypto-native liquidity.',sources:[{label:'Variational · Business Wire',url:'https://www.businesswire.com/news/home/20260520402312/en/'}]},
    {date:'2026-08-22',category:'products',tag:'RELEASE REPORT',title:'Isolated margin is reported shipped',detail:'The v0.25.4 biweekly update lists isolated margin, dividends information and final preparations for swaps. This is the report date, not a verified exact launch day.',sources:[{label:'Official report archive',url:'https://x.com/search?q=from%3Avariational_io%20%22isolated%20margin%22&src=typed_query'}]},
    {date:'2026-09-01',category:'products',tag:'SWAPS',title:'Swaps launch: XAU and US100',detail:'The first swap markets route exposure to TradFi liquidity, with carry costs largely benchmarked to USD borrowing rather than volatile perp funding.',sources:[{label:'Variational launch article',url:'https://www.linkedin.com/pulse/swaps-live-tradfi-liquidity-now-on-chain-variational-ibcse'}]}
  ];
  function projectHistory(){
    const events=HISTORY_EVENTS.slice();
    if(typeof SERIES!=='undefined') [1e6,5e6,1e7].forEach(amount=>{
      const day=SERIES.find(p=>p.v>=amount);if(!day)return;
      events.push({date:day.d,category:'growth',tag:'TREASURY',title:'Treasury crosses $'+(amount/1e6)+'M',detail:'First daily balance in the tracked on-chain series at or above this threshold. Treasury USDC holdings are accumulated funds, not executed token buybacks or burns.',sources:[{label:'Treasury · Arbiscan',url:'https://arbiscan.io/address/0x5e91b40467fb8902c46a7b6cb90482363188d645'}]});
    });
    if(typeof BIWEEKLY_HISTORY!=='undefined'){
      [100e9,200e9,300e9,400e9].forEach(amount=>{const r=BIWEEKLY_HISTORY.find(r=>r.totalVolume>=amount);if(!r)return;events.push({date:r.asOf,category:'growth',tag:'VOLUME · REPORTED',title:'Reported volume passes $'+(amount/1e9)+'B',detail:'The first report in this archive showing cumulative trading volume above this threshold. This marks a reporting date, not the exact crossing time.',sources:[{label:'Official report',url:r.src}]});});
      BIWEEKLY_HISTORY.forEach(r=>events.push({date:r.asOf,category:'reports',tag:'OFFICIAL REPORT',title:'Biweekly update · '+r.asOf,detail:[r.totalVolume!=null?'Cumulative volume $'+(r.totalVolume/1e9).toFixed(2)+'B':null,r.spreads2w!=null?'2W gross spreads $'+Math.round(r.spreads2w).toLocaleString('en-US'):null,r.treasury2w!=null?'Treasury allocation $'+Math.round(r.treasury2w).toLocaleString('en-US'):null].filter(Boolean).join(' · ')+'. Period disclosures retain their original definitions; early allocation reports are not directly comparable to later P&L reports.',sources:[{label:'Official report',url:r.src}]}));
    }
    return events.map(e=>({...e,level:'high'}));
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function safeUrl(u) { return /^https?:\/\//i.test(u) ? u : '#'; }

  function utcMs(ymd) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
  }

  /* Format a YYYY-MM-DD calendar date. UTC is used on both sides so the label can never
     slip a day with the viewer's own time zone. */
  function fmt(ymd, opts) {
    var ms = utcMs(ymd);
    if (isNaN(ms)) return ymd;
    opts.timeZone = 'UTC';
    try { return new Intl.DateTimeFormat('en-US', opts).format(new Date(ms)); }
    catch (e) { return ymd; }
  }

  /* Today's calendar date in New York, as YYYY-MM-DD. Falls back to the viewer's own
     clock if the runtime has no time-zone database. */
  function todayET() {
    try {
      var p = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date());
      if (utcMs(p) === utcMs(p)) return p;
    } catch (e) {}
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function relLabel(ymd, today) {
    var n = Math.round((utcMs(today) - utcMs(ymd)) / DAY_MS);
    if (isNaN(n) || n <= 0) return 'Today';
    if (n === 1) return 'Yesterday';
    return n + ' days ago';
  }

  function levelClass(level) {
    return level === 'critical' ? ' is-critical' : (level === 'high' ? ' is-high' : '');
  }

  function whenHtml(date, today) {
    var rel = historyFilter==='market'?relLabel(date, today):'';
    return '<div class="srv2-news-when">' +
      '<span class="srv2-news-wd">' + esc(fmt(date, { weekday: 'long' })) + '</span>' +
      '<span class="srv2-news-dl"><b class="srv2-news-date">' + esc(fmt(date, { month: 'short', day: 'numeric', year:'numeric' })) + '</b>' +
      '<span class="srv2-news-rel' + (rel === 'Today' ? ' is-today' : '') + '">' + esc(rel) + '</span></span>' +
      '</div>';
  }

  /* showDate is true only for the first card of each date, so same-day cards read as a group. */
  function itemHtml(it, showDate, today) {
    var srcs = (it.sources || []).map(function (s) {
      return '<a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>';
    }).join('');
    var label = (it.sources || []).length > 1 ? 'Sources' : 'Source';
    return '<article class="srv2-news-item' + levelClass(it.level) + (showDate ? ' has-date' : '') + '" data-d="' + esc(it.date) + '">' +
      (it.dateLabel ? '<div class="srv2-news-when"><b class="srv2-news-date">'+esc(it.dateLabel)+'</b></div>' : showDate ? whenHtml(it.date, today) : '<div class="srv2-news-when"></div>') +
      '<div class="srv2-news-pin" aria-hidden="true"></div>' +
      '<div class="srv2-news-card">' +
      '<span class="srv2-news-tag">' + esc(it.tag) + '</span>' +
      '<strong class="srv2-news-hl">' + esc(it.title) + '</strong>' +
      '<p class="srv2-news-detail" title="' + esc(it.detail) + '">' + esc(it.detail) + '</p>' +
      (srcs ? '<div class="srv2-news-src"><span>' + label + '</span>' + srcs + '</div>' : '') +
      '</div></article>';
  }

  function render() {
    var root = document.getElementById('v2CryptoNews');
    if (!root) return;

    /* Newest first regardless of how the array was edited; ties keep authored order. */
    const project=projectHistory();
    const all=project.concat(CRYPTO_NEWS.map(e=>({...e,category:'market'})));
    const selected=all.filter(e=>(historyFilter==='variational'?e.category!=='market'&&e.category!=='reports':e.category===historyFilter)&&(historyYear==='all'||e.date.slice(0,4)===historyYear));
    var items = selected.map(function (it, i) { return { it: it, i: i }; })
      .sort(function (a, b) {
        return a.it.date===b.it.date?a.i-b.i:(a.it.date<b.it.date?-1:1)*(historyOrder==='oldest'?1:-1);
      });

    var today = todayET();
    var prevDate = null;

    var html = '<div class="srv2-news-head">' +
      '<div><span class="srv2-news-kicker">VARIATIONAL ARCHIVE</span>' +
      '<h2 class="srv2-news-title">The Variational story</h2></div>' +
      '<div class="srv2-news-tools">' +
      '<span class="srv2-news-stamp">As of ' + esc(fmt(historyFilter==='market'?CRYPTO_NEWS_ASOF:'2026-10-31', { month: 'short', day: 'numeric', year: 'numeric' })) + ' · curated</span>' +
      '<span class="srv2-news-nav">' +
      '<button type="button" class="srv2-news-arrow" data-dir="-1" aria-label="Previous news" disabled>‹</button>' +
      '<button type="button" class="srv2-news-arrow" data-dir="1" aria-label="Next news" disabled>›</button>' +
      '</span></div></div>' +
      '<div class="srv2-news-wrap"><div class="srv2-news-track" id="v2CryptoNewsList" role="region" aria-label="Crypto key news" tabindex="0">';

    items.forEach(function (o) {
      html += itemHtml(o.it, o.it.date !== prevDate, today);
      prevDate = o.it.date;
    });

    html += '</div></div>';
    const years=[...new Set(all.map(e=>e.date.slice(0,4)))].sort();
    const controls='<div class="history-controls"><div class="history-filters" role="group" aria-label="History category">'+[['variational','Milestones'],['products','Products'],['funding','Funding'],['growth','Growth'],['reports','Official reports'],['market','Market context']].map(([key,label])=>'<button type="button" data-history-filter="'+key+'" aria-pressed="'+(key===historyFilter)+'">'+label+'</button>').join('')+'</div><div class="history-selects"><label>Year <select data-history-year><option value="all">All years</option>'+years.map(y=>'<option value="'+y+'" '+(y===historyYear?'selected':'')+'>'+y+'</option>').join('')+'</select></label><label>Order <select data-history-order><option value="oldest" '+(historyOrder==='oldest'?'selected':'')+'>Oldest first</option><option value="newest" '+(historyOrder==='newest'?'selected':'')+'>Newest first</option></select></label><span>'+items.length+' events</span></div></div><p class="history-scope">Launches, funding and growth, linked to original sources. Dates retain their published precision.</p>';
    html=html.replace('<div class="srv2-news-wrap">',controls+'<div class="srv2-news-wrap">');
    if(!items.length)html+='<p class="history-empty">No archived events match this year and category.</p>';
    if(root._historyObserver)root._historyObserver.disconnect();
    if(root._historyResize)window.removeEventListener('resize',root._historyResize);
    root.innerHTML = html;

    var track = root.querySelector('.srv2-news-track');
    var wrap = root.querySelector('.srv2-news-wrap');
    var prev = root.querySelector('.srv2-news-arrow[data-dir="-1"]');
    var next = root.querySelector('.srv2-news-arrow[data-dir="1"]');

    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      var x = track.scrollLeft;
      prev.disabled = x <= 1;
      next.disabled = x >= max - 1;
      wrap.setAttribute('data-more', max > 1 && x < max - 1 ? '1' : '0');
    }

    function step(dir) {
      var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      track.scrollBy({ left: dir * Math.max(200, track.clientWidth * 0.9), behavior: smooth ? 'smooth' : 'auto' });
    }

    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', sync, { passive: true });
    root._historyResize=sync;window.addEventListener('resize', sync);
    /* The Overview starts hidden (display:none), so sizes are 0 until it is shown. */
    if (window.ResizeObserver){root._historyObserver=new ResizeObserver(sync);root._historyObserver.observe(track);}
    sync();
  }

  /* ---------- Calendar day-cell markers ---------------------------------------------------
     dashboard.js rebuilds #calGrid.innerHTML on every month / mode switch and refresh, so the
     markers are re-applied from a MutationObserver. The observer watches only the grid's own
     children (no subtree), so appending a marker inside a cell can never re-trigger it, and a
     cell that already carries one is skipped. */
  function newsByDate() {
    var map = {};
    CRYPTO_NEWS.forEach(function (it) { (map[it.date] = map[it.date] || []).push(it); });
    return map;
  }

  function markerHtml(list) {
    var rows = list.slice(0, 1).map(function (it) {
      return '<button type="button" class="cal-news-row' + levelClass(it.level) + '" title="' + esc(it.title) + '">' +
        '<span class="cal-news-dot"></span><span class="cal-news-hl">' + esc(it.title) + '</span></button>';
    }).join('');
    if (list.length > 1) {
      var rest = list.slice(1);
      rows += '<button type="button" class="cal-news-more" title="' + esc(rest.map(function (it) { return it.title; }).join('\n')) + '">' +
        rest.map(function (it) { return '<span class="cal-news-dot cal-news-xdot' + levelClass(it.level) + '"></span>'; }).join('') +
        '<span class="cal-news-mt">+' + rest.length + ' more</span></button>';
    }
    return '<div class="cal-news-in">' + rows + '</div>';
  }

  function decorateCalendar() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;
    var map = newsByDate();
    var cells = grid.querySelectorAll('.cal-cell[data-d]');
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var list = map[cell.getAttribute('data-d')];
      if (!list || !list.length) continue;
      var have = false;
      for (var c = cell.firstElementChild; c; c = c.nextElementSibling) {
        if (c.classList.contains('cal-news')) { have = true; break; }
      }
      if (have) continue;
      var box = document.createElement('div');
      box.className = 'cal-news';
      box.setAttribute('data-d', cell.getAttribute('data-d'));
      box.innerHTML = markerHtml(list);
      cell.appendChild(box);
    }
  }

  var flashTimer = null;
  function jumpToNews(ymd) {
    historyFilter='market';historyYear='all';historyOrder='newest';render();
    if(typeof showTab==='function')showTab('historical');
    var root = document.getElementById('v2CryptoNews');
    if (!root) return;
    var card = root.querySelector('.srv2-news-item[data-d="' + ymd + '"]');
    if (!card) return;
    var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    card.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'start', block: 'nearest' });
    var prev = root.querySelector('.srv2-news-item.is-flash');
    if (prev) prev.classList.remove('is-flash');
    card.classList.add('is-flash');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { card.classList.remove('is-flash'); }, 1200);
  }

  function bindCalendar() {
    var grid = document.getElementById('calGrid');
    if (!grid || grid.__newsBound) return !!grid;
    grid.__newsBound = true;
    /* Capture phase: runs before dashboard.js's own click handler on the grid, and
       stopPropagation keeps the marker click from selecting the day cell. */
    grid.addEventListener('click', function (e) {
      var box = e.target.closest ? e.target.closest('.cal-news') : null;
      if (!box) return;
      e.stopPropagation();
      jumpToNews(box.getAttribute('data-d'));
    }, true);
    if (window.MutationObserver) new MutationObserver(decorateCalendar).observe(grid, { childList: true });
    decorateCalendar();
    return true;
  }

  function initCalendar() {
    if (bindCalendar() || !window.MutationObserver) return;
    /* The grid is not in the DOM yet: wait for it, then hand over to the grid observer. */
    var wait = new MutationObserver(function () {
      if (bindCalendar()) wait.disconnect();
    });
    wait.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    const root=document.getElementById('v2CryptoNews');
    root.addEventListener('click',e=>{const b=e.target.closest('[data-history-filter]');if(b){historyFilter=b.dataset.historyFilter;render();}});
    root.addEventListener('change',e=>{if(e.target.matches('[data-history-year]'))historyYear=e.target.value;else if(e.target.matches('[data-history-order]'))historyOrder=e.target.value;else return;render();});
    render();initCalendar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
