/* ---------- Overview · Crypto Key News -----------------------------------------
   A short, hand-curated list of the crypto events that actually moved the market, shown
   at the top of the Overview canvas (#v2CryptoNews inside .srv2-canvas).

   To update: add new items at the TOP of CRYPTO_NEWS (newest first) and bump
   CRYPTO_NEWS_ASOF. Rules for what goes in:
     - only market-moving events (hacks, regulation, macro decisions, major infrastructure
       or product launches). No price commentary, no opinion pieces.
     - every item needs at least one source link ({label, url}).
     - level: 'critical' = left rule in the negative colour (use sparingly, a live crisis);
              'high' = accent rule; 'normal' = neutral.
     - tag is one of SECURITY / PERP DEX / MACRO / REGULATION / INFRA / PRODUCTS.
   The newest 6 items show by default; the rest sit behind "Show older".

   Translations: the block's fixed strings, tags, headlines and details are keyed by their
   exact English text in i18n-dict.js. A new item needs its title and detail added there,
   or it simply stays English.

   The deploy CSP is script-src 'self', so this is an external file loaded with defer. */
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

  const VISIBLE = 6;
  const DAY_MS = 86400000;

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

  function itemHtml(it, extra) {
    var srcs = (it.sources || []).map(function (s) {
      return '<a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>';
    }).join('');
    var label = (it.sources || []).length > 1 ? 'Sources' : 'Source';
    return '<article class="srv2-news-item' + levelClass(it.level) + (extra ? ' is-extra' : '') + '">' +
      '<span class="srv2-news-tag">' + esc(it.tag) + '</span>' +
      '<strong class="srv2-news-hl">' + esc(it.title) + '</strong>' +
      '<p class="srv2-news-detail">' + esc(it.detail) + '</p>' +
      (srcs ? '<div class="srv2-news-src"><span>' + label + '</span>' + srcs + '</div>' : '') +
      '</article>';
  }

  function render() {
    var root = document.getElementById('v2CryptoNews');
    if (!root) return;

    /* Newest first regardless of how the array was edited; ties keep authored order. */
    var items = CRYPTO_NEWS.map(function (it, i) { return { it: it, i: i }; })
      .sort(function (a, b) {
        return a.it.date < b.it.date ? 1 : a.it.date > b.it.date ? -1 : a.i - b.i;
      });

    var groups = [];
    items.forEach(function (o, idx) {
      var g = groups[groups.length - 1];
      if (!g || g.date !== o.it.date) { g = { date: o.it.date, rows: [] }; groups.push(g); }
      g.rows.push({ it: o.it, extra: idx >= VISIBLE });
    });

    var today = todayET();
    var hasMore = items.length > VISIBLE;

    var html = '<div class="srv2-news-head">' +
      '<div><span class="srv2-news-kicker">CRYPTO KEY NEWS</span>' +
      '<h2 class="srv2-news-title">What actually moved the market</h2></div>' +
      '<span class="srv2-news-stamp">As of ' + esc(fmt(CRYPTO_NEWS_ASOF, { month: 'short', day: 'numeric', year: 'numeric' })) + ' · curated</span>' +
      '</div><div class="srv2-news-list" id="v2CryptoNewsList">';

    groups.forEach(function (g) {
      var allExtra = g.rows.every(function (r) { return r.extra; });
      var rel = relLabel(g.date, today);
      html += '<div class="srv2-news-group' + (allExtra ? ' is-extra' : '') + '">' +
        '<div class="srv2-news-rail">' +
        '<span class="srv2-news-wd">' + esc(fmt(g.date, { weekday: 'long' })) + '</span>' +
        '<b class="srv2-news-date">' + esc(fmt(g.date, { month: 'short', day: 'numeric' })) + '</b>' +
        '<span class="srv2-news-rel' + (rel === 'Today' ? ' is-today' : '') + '">' + esc(rel) + '</span>' +
        '</div><div class="srv2-news-items">' +
        g.rows.map(function (r) { return itemHtml(r.it, r.extra); }).join('') +
        '</div></div>';
    });

    html += '</div>';
    if (hasMore) {
      html += '<button type="button" class="srv2-news-more" aria-expanded="false" aria-controls="v2CryptoNewsList">' +
        '<span class="nw-open">Show older</span><span class="nw-close">Show fewer</span></button>';
    }

    root.setAttribute('data-open', '0');
    root.innerHTML = html;

    if (!root.__newsBound) {
      root.__newsBound = true;
      root.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.srv2-news-more') : null;
        if (!btn) return;
        var open = root.getAttribute('data-open') !== '1';
        root.setAttribute('data-open', open ? '1' : '0');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
