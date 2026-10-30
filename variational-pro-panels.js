/* Pro explainer: a single scrolling one-pager (what Pro is + how big the market is).
   Mount before tge-groups.js arranges the navigation. */
(function () {
  'use strict';
  var TAB = 'variational-pro';
  var TITLE = 'Variational Pro';

  // Product descriptions follow the official About Pro documentation.
  var DOCS = 'https://docs.variational.io/pro/about-pro';
  var RFQ_DOC = 'https://docs.variational.io/variational-protocol/key-concepts/trading-via-rfq';
  var POOL_DOC = 'https://docs.variational.io/variational-protocol/key-concepts/settlement-pools';

  // Sections of the one-pager; drives the sticky in-page index.
  var SECTIONS = [
    { id: 'market', label: 'Market size' },
    { id: 'crypto', label: 'Crypto today' },
    { id: 'ladder', label: 'Market ladder' },
    { id: 'scenarios', label: 'Share scenarios' },
    { id: 'pro', label: 'What Pro is' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'sources', label: 'Sources' }
  ];

  // BIS values are USD millions. OCC Table 13 reports USD millions as of June 30, 2026.
  // Peer OTC = forwards + swaps + OTC options + credit derivatives; exchange-traded and spot FX excluded.
  // Risk-category rows: BIS OTC derivatives statistics, end-December 2025 (dataset WS_OTC_DERIV2, all
  // counterparties/maturities/instruments), fetched from the BIS SDMX API on 30 Oct 2026. Notional = DER_TYPE A,
  // gross market value = DER_TYPE D. Codes: D interest rate, B foreign exchange, E equity, T credit, J commodities,
  // U other derivatives. The six rows sum to the total in both measures.
  var BIS_PORTAL = 'https://data.bis.org/topics/OTC_DER/BIS,WS_OTC_DERIV2,1.0/';
  var BIS_API = 'https://stats.bis.org/api/v2/data/dataflow/BIS/WS_OTC_DERIV2/1.0/';
  var MARKET = {
    notionalMillions: 844577771.490,
    gmvMillions: 22802350.590,
    period: '31 DEC 2025',
    bis: BIS_PORTAL + 'H.A.A.A.5J.A.5J.A.TO1.TO1.A.A.3.C',
    bisGmv: BIS_PORTAL + 'H.D.A.A.5J.A.5J.A.TO1.TO1.A.A.3.C',
    bisTopic: 'https://data.bis.org/topics/OTC_DER',
    bisApiNotional: BIS_API + 'H.A.A..5J.A.5J.A.TO1.TO1.A.A.3.C?startPeriod=2025-S2',
    bisApiGmv: BIS_API + 'H.D.A..5J.A.5J.A.TO1.TO1.A.A.3.C?startPeriod=2025-S2',
    occ: 'https://www.occ.gov/publications-and-resources/publications/quarterly-report-on-bank-trading-and-derivatives-activities/files/pub-derivatives-quarterly-qtr2-2026.pdf#page=20',
    risk: [
      { name: 'Interest rate', code: 'D', notional: 669545338.239, gmv: 16326022.152 },
      { name: 'Foreign exchange', code: 'B', notional: 148653872.671, gmv: 4938863.460 },
      { name: 'Equity', code: 'E', notional: 11932563.530, gmv: 848957.284 },
      { name: 'Credit', code: 'T', notional: 11272169.557, gmv: 329166.514 },
      { name: 'Commodities', code: 'J', notional: 2786787.782, gmv: 331108.806 },
      { name: 'Other', code: 'U', notional: 387031.164, gmv: 28232.374 }
    ],
    peers: [
      { name: 'PNC Bank N.A.', components: [38143,629136,60487,14716] },
      { name: 'State Street Bank & Trust Co.', components: [3286077,57086,14363,0] },
      { name: 'Wells Fargo Bank N.A.', components: [3134875,10254240,2571379,169616] },
      { name: 'JPMorgan Chase Bank N.A.', components: [13810328,35180344,11568333,1649556] }
    ]
  };

  // Dated snapshot of crypto derivatives, hard-coded (never fetched on page load). Retrieved 30 Oct 2026 07:18 UTC.
  // CoinGecko: /derivatives/exchanges?order=open_interest_btc_desc&per_page=100, summed over the 100 rows; BTC/USD
  // from /simple/price. DeFiLlama: /overview/open-interest, total24h (open interest at end of day) summed by category.
  var CRYPTO = {
    date: '30 OCT 2026',
    venues: 100,
    btcUsd: 78348,
    btcOi: 2860954.29,
    btcVolume24h: 9263873.06,
    perpOi: 13362243902, perpProtocols: 110,
    optionsOi: 2209797257, deriveV3OptionsOi: 2083516911,
    cgPage: 'https://www.coingecko.com/en/exchanges/derivatives',
    cgApi: 'https://api.coingecko.com/api/v3/derivatives/exchanges?order=open_interest_btc_desc&per_page=100',
    llPage: 'https://defillama.com/open-interest',
    llApi: 'https://api.llama.fi/overview/open-interest'
  };

  function safe(v) { return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function trillions(m) { return '$' + (m / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'B'; }
  function peerTotal(p) { return p.components.reduce(function (a,b) { return a+b; },0); }
  // USD (not millions) -> "$844.6T" / "$224B" / "$13.4B".
  function usd(n) {
    if (n >= 1e12) return '$' + (n / 1e12).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'T';
    if (n >= 1e11) return '$' + Math.round(n / 1e9) + 'B';
    return '$' + (n / 1e9).toFixed(1) + 'B';
  }
  // USD millions -> "$669.5T" / "$0.85T".
  function tnM(m) { var t = m / 1e6; return '$' + t.toLocaleString('en-US', t >= 1 ? { minimumFractionDigits: 1, maximumFractionDigits: 1 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'T'; }
  function pctText(p) { return (p >= 1 ? p.toFixed(1) : p.toFixed(2)) + '%'; }
  function ext(href, text) { return '<a href="' + safe(href) + '" target="_blank" rel="noopener noreferrer">' + text + ' ↗</a>'; }

  var NOTIONAL_USD = MARKET.notionalMillions * 1e6;
  var CRYPTO_OI_USD = CRYPTO.btcOi * CRYPTO.btcUsd;
  var CRYPTO_VOL_USD = CRYPTO.btcVolume24h * CRYPTO.btcUsd;
  function benchmark() {
    var d = window.PRO_DERIVATIVES;
    if (!d || !d.rows || !d.rows.length) return null;
    return {
      data: d,
      adv: d.rows.reduce(function (a, r) { return a + r.advB; }, 0) * 1e9,
      oi: d.rows.reduce(function (a, r) { return a + r.oiB; }, 0) * 1e9,
      n: d.rows.length
    };
  }

  function section(id, num, eyebrow, title, lead, content, foot) {
    return '<section class="vps-sec" id="vps-sec-' + id + '" data-vps-sec="' + id + '" aria-labelledby="vps-title-' + id + '">' +
      '<header class="vps-heading"><span>VARIATIONAL PRO <i>/</i> ' + num + ' ' + eyebrow + '</span>' +
      '<h3 id="vps-title-' + id + '">' + title + '</h3><p>' + lead + '</p></header>' +
      '<div class="vps-body">' + content + '</div>' + (foot ? '<footer class="vps-foot"><span>' + foot + '</span></footer>' : '') + '</section>';
  }
  function sub(label, title, lead, inner, note) {
    return '<div class="vps-sub"><div class="vps-sub-head"><span>' + label + '</span><h4>' + title + '</h4></div>' +
      (lead ? '<p class="vps-sublead">' + lead + '</p>' : '') + inner + (note ? '<p class="vps-subnote">' + note + '</p>' : '') + '</div>';
  }

  // 01 ---------------------------------------------------------------
  function marketSection() {
    var total = MARKET.notionalMillions, gmvPct = MARKET.gmvMillions / total * 100;
    var small = MARKET.risk.filter(function (r) { return r.code !== 'D' && r.code !== 'B'; }).reduce(function (a, r) { return a + r.notional; }, 0) / total * 100;
    var rows = MARKET.risk.map(function (r) {
      var share = r.notional / total * 100;
      return '<div class="vps-risk-row"><div class="vps-risk-name"><b>' + safe(r.name) + '</b><span>' +
        ext(BIS_PORTAL + 'H.A.A.' + r.code + '.5J.A.5J.A.TO1.TO1.A.A.3.C', 'notional') + ' ' + ext(BIS_PORTAL + 'H.D.A.' + r.code + '.5J.A.5J.A.TO1.TO1.A.A.3.C', 'market value') + '</span></div>' +
        '<div class="vps-risk-bar" role="img" aria-label="' + safe(r.name) + ' ' + pctText(share) + ' of notional"><i style="width:' + Math.max(share, 0.4).toFixed(2) + '%"></i></div>' +
        '<div class="vps-risk-num"><small>NOTIONAL</small>' + tnM(r.notional) + '</div>' +
        '<div class="vps-risk-share"><small>SHARE</small>' + pctText(share) + '</div>' +
        '<div class="vps-risk-gmv"><small>MARKET VALUE</small>' + tnM(r.gmv) + '</div></div>';
    }).join('');
    var content =
      '<div class="vps-big"><div class="vps-big-main"><span class="vps-lab">GLOBAL OTC DERIVATIVES · NOTIONAL OUTSTANDING</span>' +
      '<strong>$' + Math.round(total / 1e6) + 'T<small>USD</small></strong><div class="vps-big-meta"><span>' + MARKET.period + '</span><span>+20.7% YEAR ON YEAR</span><span>$' + Math.round(total / 1000).toLocaleString('en-US') + 'B</span></div></div>' +
      '<div class="vps-big-side"><span class="vps-lab">NOTIONAL ≠ MARKET VALUE</span><strong>' + tnM(MARKET.gmvMillions) + '<small>GROSS MARKET VALUE</small></strong>' +
      '<p>Same BIS release: gross market value is about ' + gmvPct.toFixed(1) + '% of notional. Notional is the reference amount used to size contracts; market value is what the contracts are currently worth.</p></div></div>' +
      sub('A / BY RISK CATEGORY', 'What the notional is made of', 'BIS splits the same ' + MARKET.period + ' total by the risk the contract transfers. Interest-rate contracts carry ' + pctText(MARKET.risk[0].notional / total * 100) + ' of notional; equity, credit, commodities and other together are about ' + small.toFixed(1) + '%.',
        '<div class="vps-risk" role="table" aria-label="Global OTC derivatives by risk category, end-December 2025"><div class="vps-risk-head" role="row"><span>RISK CATEGORY</span><span>SHARE OF NOTIONAL</span><span>NOTIONAL</span><span>SHARE</span><span>GROSS MKT VALUE</span></div>' + rows +
        '<div class="vps-risk-row vps-risk-total"><div class="vps-risk-name"><b>All risk categories</b><span>' + ext(MARKET.bis, 'notional') + ' ' + ext(MARKET.bisGmv, 'market value') + '</span></div><div class="vps-risk-bar"><i style="width:100%"></i></div><div class="vps-risk-num"><small>NOTIONAL</small>' + tnM(total) + '</div><div class="vps-risk-share"><small>SHARE</small>100%</div><div class="vps-risk-gmv"><small>MARKET VALUE</small>' + tnM(MARKET.gmvMillions) + '</div></div></div>',
        'Source: BIS OTC derivatives statistics, end-December 2025 (' + MARKET.period + '), BIS data portal series linked per row, retrieved 30 Oct 2026. Foreign exchange excludes gold; commodities include gold. Percentages are computed from the published USD figures.') +
      sub('B / HOW THE MARKET CONNECTS', 'Three roles. One trade lifecycle.', 'Pro applies an RFQ model to configurable bilateral derivatives.',
        '<div class="vps-roles"><ol><li><span>01 / INSTITUTIONAL TAKER</span><b>Defines the exposure</b><p>Chooses the asset and structure, requests quotes and evaluates the offered terms.</p></li><li><span>02 / MARKET MAKER</span><b>Competes on price &amp; terms</b><p>Returns a bid or offer, agrees pool parameters and posts counterparty collateral.</p></li><li><span>03 / VARIATIONAL PROTOCOL</span><b>Administers the cleared trade</b><p>Records positions in the pool and manages margin, applicable funding and liquidations.</p></li></ol></div>') +
      '<div class="vps-data-sources"><a href="' + MARKET.bis + '" target="_blank" rel="noopener">Source: BIS · global OTC notional ↗</a><span>Notional is the contract reference amount; it is not capital invested, market value or revenue.</span></div>';
    return section('market', '01', 'MARKET SIZE', 'How big is the market.<br><em>Institutional OTC scale.</em>',
      'OTC derivatives are core infrastructure for institutional risk transfer. Global notional outstanding was $' + Math.round(total / 1e6) + 'T at end-2025.',
      content, 'BIS semiannual OTC derivatives statistics, end-2025. Independent analysis; not a market-share target from the Pro documentation.');
  }

  // 02 ---------------------------------------------------------------
  function stat(label, value, kind, text, badge) {
    return '<div class="vps-stat"><span class="vps-lab">' + label + '</span><b>' + value + '</b><em>' + kind + '</em><p>' + text + '</p><span class="vps-badge">' + badge + '</span></div>';
  }
  function cryptoSection() {
    var b = benchmark();
    var btc = '$' + CRYPTO.btcUsd.toLocaleString('en-US') + ' per BTC';
    var cg = 'COINGECKO · ' + CRYPTO.date, ll = 'DEFILLAMA · ' + CRYPTO.date;
    var content =
      '<div class="vps-defs"><b>Three different measures, not additive.</b> <span><em>Notional outstanding</em> (BIS) is the reference amount of all open OTC contracts.</span> <span><em>Open interest</em> (exchanges, DeFiLlama) is the value of exchange-listed contracts still open.</span> <span><em>Volume</em> is what traded in a period.</span></div>' +
      sub('A / CRYPTO DERIVATIVES SNAPSHOT · ' + CRYPTO.date, 'Where crypto derivatives stand today', 'Hard-coded snapshot retrieved ' + CRYPTO.date + '; the page does not fetch live data.',
        '<div class="vps-stats">' +
        stat('CRYPTO DERIVATIVES', usd(CRYPTO_OI_USD), 'OPEN INTEREST', (CRYPTO.btcOi / 1e6).toFixed(2) + 'M BTC across the ' + CRYPTO.venues + ' derivatives venues with the highest reported open interest (includes Hyperliquid), converted at ' + btc + '. Exchange-reported and unaudited.', cg) +
        stat('CRYPTO DERIVATIVES', usd(CRYPTO_VOL_USD), '24H TRADING VOLUME', (CRYPTO.btcVolume24h / 1e6).toFixed(2) + 'M BTC traded over 24 hours on the same ' + CRYPTO.venues + ' venues, same conversion. Volume is flow, not a stock, and exchange-reported volume can be overstated; treat it as an upper bound.', cg) +
        stat('ON-CHAIN PERPETUALS', usd(CRYPTO.perpOi), 'OPEN INTEREST', CRYPTO.perpProtocols + ' protocols in DeFiLlama’s Derivatives category. Overlaps with the venues above (Hyperliquid is in both), so the two cards are not additive.', ll) +
        stat('ON-CHAIN OPTIONS', usd(CRYPTO.optionsOi), 'OPEN INTEREST', 'DeFiLlama’s Options category; Derive V3 is ' + usd(CRYPTO.deriveV3OptionsOi) + ' of it. The closest on-chain reference for Pro’s options focus, not a Pro figure.', ll) + '</div>',
        'Sources: ' + ext(CRYPTO.cgPage, 'CoinGecko derivatives exchanges') + ' · ' + ext(CRYPTO.llPage, 'DeFiLlama open interest') + '. BTC conversion uses the CoinGecko BTC/USD price at retrieval (30 Oct 2026, 07:18 UTC).') +
      (b ? sub('B / EXCHANGE-TRADED FUTURES BENCHMARK · ' + safe(b.data.period).toUpperCase(), 'The 50 contracts behind the Top 50 view', 'The scale reference already used by the margin &amp; revenue calculator. It contains no crypto contracts.',
        '<div class="vps-stats vps-stats-2">' +
        stat('CME + EUREX TOP-50 FUTURES', usd(b.adv), 'AVERAGE DAILY VOLUME', safe(b.n) + ' selected contracts, ' + safe(b.data.period) + ' average daily volume, USD reference notional. Rates are ' + usd(b.data.rows.filter(function (r) { return r.asset === 'Rates'; }).reduce(function (a, r) { return a + r.advB; }, 0) * 1e9) + ' of it.', 'CME · EUREX · ' + safe(b.data.period).toUpperCase()) +
        stat('CME + EUREX TOP-50 FUTURES', usd(b.oi), 'OPEN INTEREST', 'Open interest at ' + safe(b.data.oiDate) + ', USD reference notional. Reference notional is not market value or risk-equivalent exposure. Crypto derivatives open interest above is ' + (CRYPTO_OI_USD / b.oi * 100).toFixed(1) + '% of this figure (indicative; different venues and definitions).', 'CME · EUREX · ' + safe(b.data.oiDate)) + '</div>' +
        '<div class="vps-data-sources"><button type="button" class="vps-linkbtn" data-vps-view="derivatives">Open the Top 50 derivatives table →</button></div>',
        'Selected CME Group and Eurex futures, not a global ranking; excludes OTC, options and ICE. Methodology and source files are in the Top 50 view.') : '');
    return section('crypto', '02', 'CRYPTO DERIVATIVES TODAY', 'Crypto derivatives.<br><em>The scale today.</em>',
      'For context: how large crypto derivatives are on exchanges and on-chain right now, next to the exchange-traded futures benchmark.',
      content, 'Snapshot of exchange-reported and protocol-reported data, ' + CRYPTO.date + '. Not live; not a forecast; not Pro data.');
  }

  // 03 ---------------------------------------------------------------
  function ladderSection() {
    function pos(v) { return Math.min(100, Math.max(1.5, (Math.log10(v) - 9) / 6 * 100)); }
    var rungs = [
      { n: '01', name: 'Global OTC derivatives', kind: 'NOTIONAL OUTSTANDING', v: NOTIONAL_USD, src: ext(MARKET.bis, 'BIS · ' + MARKET.period) },
      { n: '02', name: 'Crypto derivatives', kind: 'OPEN INTEREST · TOP ' + CRYPTO.venues + ' VENUES', v: CRYPTO_OI_USD, src: ext(CRYPTO.cgPage, 'CoinGecko · ' + CRYPTO.date) },
      { n: '03', name: 'On-chain perpetuals', kind: 'OPEN INTEREST', v: CRYPTO.perpOi, src: ext(CRYPTO.llPage, 'DeFiLlama · ' + CRYPTO.date) },
      { n: '04', name: 'On-chain options', kind: 'OPEN INTEREST', v: CRYPTO.optionsOi, src: ext(CRYPTO.llPage, 'DeFiLlama · ' + CRYPTO.date) }
    ];
    var html = rungs.map(function (r, i) {
      return '<div class="vps-rung"><div class="vps-rung-name"><span>' + r.n + ' / ' + r.kind + '</span><b>' + r.name + '</b><em>' + r.src + '</em></div>' +
        '<div class="vps-rung-track"><i style="width:' + pos(r.v).toFixed(1) + '%"></i></div>' +
        '<div class="vps-rung-val"><strong>' + usd(r.v) + '</strong>' + (i ? '<small>' + (r.v / NOTIONAL_USD * 100 < 0.1 ? (r.v / NOTIONAL_USD * 100).toFixed(3) : (r.v / NOTIONAL_USD * 100).toFixed(2)) + '% of rung 01</small>' : '<small>BIS · outstanding notional</small>') + '</div></div>';
    }).join('') +
      '<div class="vps-rung vps-rung-pro"><div class="vps-rung-name"><span>05 / PRO ENTRY POINT</span><b>Configurable crypto OTC derivatives &amp; options</b><em>' + ext(DOCS, 'Pro docs') + '</em></div>' +
      '<div class="vps-rung-track"><i></i><span>NO PUBLIC SIZING</span></div>' +
      '<div class="vps-rung-val"><strong>Unsized</strong><small>not measured by BIS or CME</small></div></div>';
    var content =
      '<div class="vps-ladder" role="group" aria-label="Market ladder, logarithmic scale"><div class="vps-ladder-axis"><span>BAR LENGTH IS LOGARITHMIC · EACH GRIDLINE = 10× · SCALE $1B (LEFT) TO $1,000T (RIGHT)</span></div>' + html + '</div>' +
      '<div class="vps-scale-context"><p><b>External market context.</b> Interest rate, FX, equity, commodity and credit derivatives. This broad benchmark is not Pro’s current addressable market.</p><p><b>Variational’s entry point.</b> Configurable crypto OTC derivatives for advanced and institutional traders. Capturing traditional markets would require a broader product and regulatory footprint.</p></div>' +
      '<div class="vps-data-sources"><span>Rungs mix measures (notional outstanding vs open interest) and dates (Dec 2025 vs Oct 2026), so ratios are indicative. The documentation describes advanced and institutional OTC traders, non-linear derivatives and block execution; no public dataset sizes that segment, so Pro’s rung is left unsized rather than estimated.</span></div>';
    return section('ladder', '03', 'MARKET LADDER', 'From a global market<br><em>to Pro’s entry point.</em>',
      'Each rung is a smaller, more specific market. The last one is where Pro starts.',
      content, 'Bar lengths are logarithmic. Sources per rung as linked; see Sources &amp; disclaimers. Not a forecast of Pro volume.');
  }

  // 04 ---------------------------------------------------------------
  function scenariosSection() {
    var shares = [0.01,0.1,0.5,1], selected = 0.1;
    var content = '<div class="vps-market-scenarios">' + [0.01,0.1,1].map(function(v) { return '<div><span>' + v + '% OF GLOBAL NOTIONAL</span><b>' + (v===0.01 ? '$' + (MARKET.notionalMillions*v/100/1000).toFixed(1) + 'B' : trillions(MARKET.notionalMillions*v/100)) + '</b><p>Hypothetical supported notional</p></div>'; }).join('') + '</div>' +
      '<div class="vps-share-controls" role="group" aria-label="Hypothetical global notional share">' + shares.map(function (v) { return '<button type="button" data-vps-share="' + v + '" aria-pressed="' + (v===selected) + '">' + v + '%</button>'; }).join('') + '</div>' +
      '<div class="vps-scale-result"><div><span>HYPOTHETICAL VARIATIONAL NOTIONAL</span><strong data-vps-notional>' + trillions(MARKET.notionalMillions * selected / 100) + '</strong></div><p data-vps-scale-summary aria-live="polite"></p></div>' +
      '<div class="vps-scale-chart" role="group" aria-label="Outstanding OTC notional, common linear scale in billions of US dollars"><div class="vps-scale-axis"><span>USD BILLIONS</span><span>0 — 65,000B · LINEAR SCALE</span></div><div class="vps-scale-row is-scenario"><span>Variational <small>HYPOTHETICAL</small></span><div><i data-vps-scale-bar></i></div><b data-vps-scale-value></b></div>' +
      MARKET.peers.map(function (p) { var v=peerTotal(p); return '<div class="vps-scale-row"><span>' + safe(p.name) + '</span><div><i style="width:' + (v/65000000*100).toFixed(4) + '%"></i></div><b>' + trillions(v) + '</b></div>'; }).join('') + '</div>' +
      '<div class="vps-scale-context"><p><b>Scale reference, not bank equivalence.</b> Protocol-supported notional is compared with bank OTC books. Reporting dates, netting and consolidation differ; this does not imply equal revenue, capital, risk or valuation.</p><p><b>Long-term scenario, not a forecast.</b> The global denominator includes traditional asset classes beyond Pro’s documented crypto focus. Adoption, regulation, product coverage and liquidity determine what is reachable.</p></div>' +
      '<div class="vps-data-sources"><a href="' + MARKET.bis + '" target="_blank" rel="noopener">BIS · global OTC · Dec 2025 ↗</a><a href="' + MARKET.occ + '" target="_blank" rel="noopener">OCC · bank OTC · Jun 2026 · Table 13 ↗</a><span>Formula: global notional × selected share. Bank OTC = forwards + swaps + OTC options + credit.</span></div>';
    return section('scenarios', '04', 'INSTITUTIONAL SCALE', 'A fractional share.<br><em>Institutional notional scale.</em>',
      'What if Variational supported a fraction of the global OTC outstanding notional?', content,
      'BIS semiannual data, end-2025. Shares are illustrative assumptions, not forecasts. Independent scenario analysis using BIS/OCC data; not a Variational forecast or an official market-share target.');
  }

  // 05 ---------------------------------------------------------------
  function steps(list) {
    return '<ol class="vps-detailed-steps">' + list.map(function (x) { return '<li><details><summary><b>' + x[0] + '</b></summary><p>' + x[1] + '</p></details></li>'; }).join('') + '</ol>';
  }
  function proSection() {
    var design = '<div class="vps-product-grid"><section><span class="vps-mini">01 / PRICE DISCOVERY</span><h4>RFQ-based execution</h4><p>Request quotes from all eligible makers or a chosen whitelist. Participants can also supply bids and offers; makers may respond through the UI or API.</p><a href="' + RFQ_DOC + '" target="_blank" rel="noopener">RFQ mechanics ↗</a></section>' +
      '<section><span class="vps-mini">02 / SETTLEMENT STRUCTURE</span><h4>Counterparty-specific pools</h4><p>Each pair can have one or more pools recording positions and collateral. Pool assets remain separate; positions cannot be transferred or netted across pools.</p><a href="' + POOL_DOC + '" target="_blank" rel="noopener">Settlement pools ↗</a></section>' +
      '<section><span class="vps-mini">03 / AGREED TERMS</span><h4>Configurable risk parameters</h4><p>Agree terms before execution: eligible counterparties, pool-level margin, liquidation thresholds and penalties. Price and terms both form part of the quote.</p><a href="' + DOCS + '" target="_blank" rel="noopener">Pro capabilities ↗</a></section></div>' +
      '<div class="vps-product-pools"><span class="vps-mini">PRO / BILATERAL POOL STRUCTURE</span><div class="vps-pool-map"><div class="vps-pool-line"><span>Your institution</span><div><b>Pool A</b><small>Positions + collateral</small></div><span>Counterparty A</span></div><div class="vps-pool-line"><span>Your institution</span><div><b>Pool B</b><small>Positions + collateral</small></div><span>Counterparty B</span></div></div><p>Separate pools isolate positions and collateral. A counterparty pair may maintain additional pools with different agreed terms.</p></div>' +
      '<div class="vps-product-status"><span>DEVELOPMENT STATUS</span><p>Pro remains pre-launch in the official documentation. The screens describe the documented design, not a live trading interface or a committed launch date.</p></div>';
    var workflow = '<div class="vps-legacy-columns"><section><div class="vps-legacy-title"><h4>Traditional OTC</h4><span>12 DOCUMENTED STEPS</span></div>' + steps([
        ['Investment mandate','The institution decides to trade an altcoin option.'],
        ['Dealer sourcing','The desired altcoin is unavailable on an exchange; the team contacts a market-making desk over Telegram.'],
        ['ISDA agreement &amp; KYC','Negotiate the ISDA derivatives agreement and complete know-your-customer onboarding. Other desks may reject the account or require additional forms.'],
        ['Structure specification','With one available desk, describe the requested option structure in chat.'],
        ['Dealer pricing','The desk calculates a quote, potentially using spreadsheets and manual infrastructure.'],
        ['Quote &amp; initial terms','The desk sends pricing and proposed contractual terms.'],
        ['Bilateral negotiation','Discuss price and terms until both parties agree.'],
        ['Trade confirmation &amp; review','Exchange an email trade confirmation for review by legal and operations teams.'],
        ['Test transfer','Operations sends a test transaction to the dealer’s wallet or bank account.'],
        ['Collateral transfer','Send collateral directly to the dealer, introducing exposure to the dealer’s financial condition.'],
        ['Trade clearing','The trade is marked as cleared.'],
        ['Ongoing margin administration','Periodic manual checks and Telegram/email margin calls. The example describes one-way collateral posting.']
      ]) + '</section>' +
      '<section class="vps-legacy-pro"><div class="vps-legacy-title"><h4>Variational Pro</h4><span>6 DOCUMENTED STEPS</span></div>' + steps([
        ['Investment mandate','Choose the altcoin option to trade.'],
        ['Build the RFQ','Log into Pro and define the desired structure in the UI.'],
        ['Competitive quotes','Eligible market makers receive the RFQ and can quote through the UI or API; the requester can select specific makers.'],
        ['Select a counterparty','Evaluate price, margin terms and counterparty reputation, then accept a quote or decline to trade.'],
        ['Bilateral collateral','Both counterparties are prompted to deposit into their on-chain escrow / settlement pool.'],
        ['Clear &amp; administer','After verified deposits, clearing is recorded automatically. The protocol manages margin, applicable funding and liquidations.']
      ]) + '<div class="vps-legacy-note"><b>What changes</b><p>Competitive quoting, bilateral on-chain collateral and integrated lifecycle management.</p><p>The example does not establish that ISDA, KYC or other legal requirements are waived for every user.</p></div></section></div>';
    var flow = '<ol class="vps-execution" aria-label="Trade execution workflow"><li class="vps-execution-request"><span class="vps-execution-label">01 / REQUEST</span><h4>Specify the trade.</h4><div class="vps-request-ticket"><span>YOUR DESK</span><b>One RFQ</b><p>Asset · structure · terms</p></div><p>Send to the market or a selected set of counterparties.</p></li>' +
      '<li class="vps-execution-quotes"><span class="vps-execution-label">02 / COMPARE &amp; CHOOSE</span><h4>Evaluate competing quotes.</h4><ul class="vps-maker-list"><li><span>Market maker A</span><small>Quote received</small></li><li class="is-selected"><span>Market maker B</span><small>Selected ✓</small></li><li><span>Market maker C</span><small>Quote received</small></li></ul><p>Compare price, margin terms and counterparty reputation. Accept an offer or decline to trade.</p></li>' +
      '<li class="vps-execution-pool"><span class="vps-execution-label">03 / FUND &amp; CLEAR</span><h4>Post bilateral collateral.</h4><div class="vps-pool-funders"><span>Your desk</span><span>Selected maker</span></div><div class="vps-settlement"><span>↓ &nbsp; BOTH DEPOSIT COLLATERAL &nbsp; ↓</span><b>Settlement pool</b><small>On-chain · bilateral</small></div><p>Following maker confirmation and verified deposits, the trade is booked in the agreed pool.</p></li></ol>' +
      '<div class="vps-protocol-detail"><p><b>Before clearing:</b> the protocol RFQ flow includes maker last look. Collateral moves after the maker confirms the agreed trade and smart-contract approvals.</p><a href="' + RFQ_DOC + '" target="_blank" rel="noopener">Protocol RFQ sequence ↗</a></div>' +
      '<div class="vps-managed"><div><span class="vps-execution-label">04 / AFTER CLEARING</span><h4>Protocol-managed lifecycle.</h4><p>Ongoing management under the agreed trade terms.</p></div><ul><li><span aria-hidden="true">✓</span> Tracks margin</li><li><span aria-hidden="true">✓</span> Settles funding, if applicable</li><li><span aria-hidden="true">✓</span> Handles liquidations</li></ul></div>';
    var risk = '<div class="vps-controls"><div class="vps-controls-head"><span>CONTROL AREA</span><span>TRADITIONAL OTC FRICTION</span><span>PROTOCOL DESIGN</span></div>' +
      '<section class="vps-control-row"><div class="vps-control-name"><span>01 / MARKET STRUCTURE</span><h4>Liquidity access</h4></div><div><span class="vps-control-mobile">OTC FRICTION</span><p>Manual onboarding and fragmented quoting can restrict the set of available counterparties.</p></div><div class="vps-control-design"><span class="vps-control-mobile">PROTOCOL DESIGN</span><h4>Competitive RFQ distribution</h4><p>Request competing quotes from multiple market makers, or restrict requests to selected counterparties.</p></div></section>' +
      '<section class="vps-control-row"><div class="vps-control-name"><span>02 / OPERATIONS</span><h4>Lifecycle management</h4></div><div><span class="vps-control-mobile">OTC FRICTION</span><p>Manual collateral checks, funding settlements and margin calls create operational dependencies.</p></div><div class="vps-control-design"><span class="vps-control-mobile">PROTOCOL DESIGN</span><h4>Rules-based trade administration</h4><p>Following clearing, the protocol tracks margin, settles applicable funding and handles liquidations.</p></div></section>' +
      '<section class="vps-control-row"><div class="vps-control-name"><span>03 / COLLATERAL</span><h4>Counterparty exposure</h4></div><div><span class="vps-control-mobile">OTC FRICTION</span><p>Collateral transferred directly to a dealer can introduce credit exposure and asymmetric margin arrangements.</p></div><div class="vps-control-design"><span class="vps-control-mobile">PROTOCOL DESIGN</span><h4>Bilateral settlement pools</h4><p>Both counterparties post collateral to their agreed pool. Positions and assets are isolated across pools; margin and liquidation parameters are agreed in the quote.</p></div></section></div>' +
      '<aside class="vps-risk-note"><span>RISK CONSIDERATIONS</span><p>These controls do not eliminate risk. Smart-contract, market, liquidity and counterparty risks remain; outcomes depend on collateral adequacy and the agreed trade parameters.</p></aside>';
    var content =
      sub('A / DOCUMENTED PRODUCT DESIGN', 'Configurable derivatives, bilateral by design', 'Pro is designed for advanced and institutional OTC traders, including non-linear derivatives and block execution.', design,
        'Sources: About Pro, Trading via RFQ and Settlement Pools. General protocol pools may be multilateral; Pro is described as bilateral.') +
      sub('B / WORKFLOW COMPARISON', 'The operational cost of an OTC trade', 'The official Pro documentation illustrates a 12-step manual process and a six-step Pro workflow.', workflow,
        'Source: About Pro · illustrative workflow, not a universal onboarding checklist or a measured speed benchmark.') +
      sub('C / TRADE FLOW', 'From price discovery to on-chain clearing', 'You choose the quote. Both sides fund the pool. The protocol manages the cleared trade.', flow,
        'Illustrative maker selection; no live quotes shown. Product design per official docs. Pro is not live yet.') +
      sub('D / RISK &amp; CONTROLS', 'Execution controls. Collateral discipline.', 'A structured framework for price discovery, trade operations and bilateral collateral.', risk,
        'Design overview based on official Pro documentation. Pro is not live yet.');
    return section('pro', '05', 'WHAT PRO IS', 'What Pro is<br><em>and how it works.</em>',
      'Pro is a pre-launch product for configurable, bilateral derivatives: price by RFQ, settle in counterparty-specific on-chain pools.',
      content, 'Product design per the official About Pro documentation. Pro is not live yet.');
  }

  // 06 ---------------------------------------------------------------
  function calculatorSection() {
    var content = '<div class="vps-economics-inputs"><label>Benchmark market<select aria-label="Benchmark market" data-vps-model-market></select></label><label>Assumed capture (%)<input aria-label="Assumed capture (%)" data-vps-model="share" type="number" min="0" max="100" step="0.01" value="0.1"></label><label>Initial margin per side (%)<input aria-label="Initial margin per side (%)" data-vps-model="margin" type="number" min="0" max="100" step="1" value="10"></label><label>Gross revenue capture (bps)<input aria-label="Gross revenue capture (bps)" data-vps-model="bps" type="number" min="0" max="1000" step="0.1" value="1"></label><label>Trading days / year<input aria-label="Trading days per year" data-vps-model="days" type="number" min="1" max="366" step="1" value="252"></label></div>' +
      '<p class="vps-model-baseline" data-vps-model-baseline></p><div class="vps-economic-metrics" aria-live="polite"><div><span>CAPTURED ADV · USD B</span><b data-vps-economic="adv"></b><small>Benchmark ADV × capture rate</small></div><div><span>CAPTURED OI · USD B</span><b data-vps-economic="oi"></b><small>Benchmark OI × capture rate</small></div><div><span>INITIAL MARGIN / SIDE · USD B</span><b data-vps-economic="margin"></b><small>Captured OI × assumed margin rate</small></div><div><span>BOTH SIDES’ MARGIN · USD B</span><b data-vps-economic="bilateral"></b><small>Symmetric gross assumption: 2 × margin</small></div><div><span>GROSS DAILY REVENUE · USD B</span><b data-vps-economic="daily"></b><small>Captured ADV × assumed bps / 10,000</small></div><div><span>GROSS ANNUAL REVENUE · USD B</span><b data-vps-economic="annual"></b><small>Daily revenue × selected trading days</small></div></div>' +
      '<div class="vps-model-assumptions"><b>Illustrative economics · Pro is not live</b><p>Capture share, margin and revenue bps are user assumptions, not documented Pro fee schedules, required margins or revenue guidance. Revenue is a gross fee-equivalent before costs or allocations; it is not net income, OLP spread earnings or token-holder distributions.</p><p>The margin model assumes equal initial-margin rates on both sides, without netting, offsets, variation margin, collateral haircuts or liquidation losses. Actual pool terms are negotiated and may be asymmetric. Reference notional is not a risk-equivalent measure.</p></div>' +
      '<div class="vps-data-sources"><button type="button" class="vps-linkbtn" data-vps-view="derivatives">Pick a market in the Top 50 derivatives table →</button></div>';
    return section('calculator', '06', 'MARGIN &amp; REVENUE', 'Volume drives revenue.<br><em>Open interest drives collateral.</em>',
      'An adjustable Variational opportunity model, based on a selected external market benchmark.', content,
      'Scenario only. No measured Pro revenue or collateral is implied. Select a market on the Top 50 derivatives page to load its inputs here.');
  }

  // 07 ---------------------------------------------------------------
  function sourcesSection() {
    var b = benchmark(), s = b && b.data.sources ? b.data.sources : null;
    function li(href, text) { return '<li>' + ext(href, text) + '</li>'; }
    var cme = s ? li(s.adv, 'CME Group · monthly ADV report') + li(s.oi, 'CME Group · monthly open interest report') + li(s.settlements, 'CME Group · daily bulletin (reference settlements)') +
      li(s.eurexAdv, 'Eurex · September volume file') + li(s.eurexOi, 'Eurex · 30 September open interest file') + li(s.eurUsd, 'ECB EUR/USD reference rate, 30 Sep 2026') : '';
    var content = '<div class="vps-src-grid">' +
      '<div><span class="vps-mini">PRODUCT DOCUMENTATION</span><ul>' + li(DOCS, 'About Pro · Variational docs') + li(RFQ_DOC, 'Trading via RFQ · protocol docs') + li(POOL_DOC, 'Settlement pools · protocol docs') + '</ul></div>' +
      '<div><span class="vps-mini">GLOBAL &amp; BANK OTC MARKETS</span><ul>' + li(MARKET.bis, 'BIS · global OTC notional · ' + MARKET.period) + li(MARKET.bisGmv, 'BIS · gross market value · ' + MARKET.period) + li(MARKET.bisTopic, 'BIS data portal · OTC derivatives statistics') +
      li(MARKET.bisApiNotional, 'BIS SDMX API · notional by risk category (retrieved 30 Oct 2026)') + li(MARKET.bisApiGmv, 'BIS SDMX API · gross market value by risk category (retrieved 30 Oct 2026)') + li(MARKET.occ, 'OCC · bank OTC books · Jun 2026 · Table 13') + '</ul></div>' +
      '<div><span class="vps-mini">CRYPTO DERIVATIVES SNAPSHOT · ' + CRYPTO.date + '</span><ul>' + li(CRYPTO.cgPage, 'CoinGecko · derivatives exchanges') + li(CRYPTO.cgApi, 'CoinGecko API · top ' + CRYPTO.venues + ' by open interest') + li(CRYPTO.llPage, 'DeFiLlama · open interest') + li(CRYPTO.llApi, 'DeFiLlama API · open-interest overview') + '</ul></div>' +
      '<div><span class="vps-mini">EXCHANGE-TRADED BENCHMARK · SEP 2026</span><ul>' + cme + li('pro-derivatives-data.json', 'Top 50 source data (JSON)') + '</ul></div></div>' +
      '<div class="vps-disclaimers"><span class="vps-mini">DISCLAIMERS</span><ul>' +
      '<li><b>Pro is not live yet.</b> Pro remains pre-launch in the official documentation. This page describes the documented design, not a live trading interface or a committed launch date.</li>' +
      '<li><b>Illustrative, not a forecast.</b> Share scenarios and calculator outputs are independent illustrations with user-set assumptions. They are not Variational forecasts, market-share targets, fee schedules or revenue guidance.</li>' +
      '<li><b>Different measures.</b> BIS notional outstanding, exchange open interest and trading volume are not additive and not directly comparable. Notional is not capital invested, market value or revenue.</li>' +
      '<li><b>Snapshot data.</b> Crypto figures are a hard-coded ' + CRYPTO.date + ' snapshot of exchange-reported or protocol-reported data; they are unaudited, may change materially and are not live.</li>' +
      '<li><b>Scale reference, not bank equivalence.</b> Bank OTC books differ in reporting date, netting and consolidation from protocol-supported notional.</li>' +
      '<li><b>Risk.</b> Pro controls do not eliminate smart-contract, market, liquidity or counterparty risk. Nothing here is investment advice.</li></ul></div>';
    return section('sources', '07', 'SOURCES &amp; DISCLAIMERS', 'Sources.<br><em>And what this page is not.</em>',
      'Every figure on this page links to its source; dated snapshots are labelled.', content,
      'Independent analysis using public sources; not an official Variational document.');
  }

  function indexBar() {
    return '<nav class="vps-index" aria-label="On this page">' + SECTIONS.map(function (s, i) {
      return '<button type="button" data-vps-jump="' + s.id + '" aria-current="' + (i ? 'false' : 'true') + '"><span>0' + (i + 1) + '</span> ' + s.label + '</button>';
    }).join('') + '</nav>';
  }
  function hero() {
    return '<div class="vp-reveal vp-title-screen vps-hero">' +
      '<div class="vp-topline"><span>VARIATIONAL</span><span>INSTITUTIONAL OTC DERIVATIVES</span></div>' +
      '<div class="vp-atmosphere" aria-hidden="true"><div class="vp-orbit"></div><div class="vp-horizon"></div></div>' +
      '<div class="vp-identity"><div class="vp-brand"><span class="vp-mark"><svg viewBox="320 450 1360 960" aria-hidden="true"><defs><filter id="vp-mark-color" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .298 0 0 0 0 .608 0 0 0 0 .973 0 0 2 0 -.3"/></filter></defs><image href="variational-logo.png" width="2000" height="2000" filter="url(#vp-mark-color)"/></svg></span><span>Variational</span></div>' +
      '<h2 class="vp-pro">PRO</h2><div class="vp-caption"><span></span><p>Configurable execution. On-chain settlement.</p><span></span></div>' +
      '<p class="vps-thesis">Pro brings RFQ execution and bilateral on-chain settlement to configurable derivatives — the structure of an $' + Math.round(NOTIONAL_USD / 1e12) + 'T institutional OTC market.</p></div>' +
      '<div class="vp-bottom"><span class="vp-status"><i></i> COMING SOON</span><span class="vps-chip">NOT LIVE YET · ILLUSTRATIVE</span><p>Infrastructure for advanced derivatives trading.</p><a class="vps-docs-link" href="' + DOCS + '" target="_blank" rel="noopener noreferrer">DOCS ↗</a></div></div>';
  }
  function page() {
    return hero() + indexBar() + '<div class="vps-doc">' + marketSection() + cryptoSection() + ladderSection() + scenariosSection() + proSection() + calculatorSection() + sourcesSection() + '<div class="vps-end" data-vps-end aria-hidden="true"></div></div>';
  }

  function wireDoc(section, panel) {
    var indexEl = section.querySelector('.vps-index');
    var btns = [].slice.call(section.querySelectorAll('[data-vps-jump]'));
    var secs = [].slice.call(section.querySelectorAll('[data-vps-sec]'));
    var endEl = section.querySelector('[data-vps-end]');
    var active = btns.length ? btns[0].getAttribute('data-vps-jump') : '';
    var lock = 0, endVisible = false, io = null, ioEnd = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Height of the app's fixed top bars (desktop: top bar; narrow: top bar + horizontal rail) so the index never hides under them.
    function stickyTop() {
      var h = 0;
      ['.srv2-global-top', '.srv2-global-nav'].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (!el) return;
        var cs = getComputedStyle(el);
        if (cs.position !== 'fixed' || cs.display === 'none') return;
        var r = el.getBoundingClientRect();
        if (r.top < 120 && r.width > window.innerWidth * 0.5) h = Math.max(h, r.bottom);
      });
      return h || 68;
    }
    function mark(id) {
      if (id === active) return;
      active = id;
      btns.forEach(function (b) {
        var on = b.getAttribute('data-vps-jump') === id;
        b.setAttribute('aria-current', on ? 'true' : 'false');
        if (on && indexEl.scrollWidth > indexEl.clientWidth) indexEl.scrollLeft = b.offsetLeft - (indexEl.clientWidth - b.offsetWidth) / 2;
      });
    }
    function compute() {
      if (lock || panel.hidden || section.classList.contains('tg-hide')) return;
      var line = stickyTop() + indexEl.offsetHeight + 24, cur = secs[0];
      secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s; });
      var last = secs[secs.length - 1];
      if (endVisible && last.getBoundingClientRect().top < window.innerHeight * 0.7) cur = last;
      mark(cur.getAttribute('data-vps-sec'));
    }
    var curTop = -1;
    // Keep --vps-top in step with the app shell (it only exists once the dashboard layout is applied, and changes on resize).
    function syncTop() {
      var t = stickyTop();
      if (t === curTop) return false;
      curTop = t;
      section.style.setProperty('--vps-top', t + 'px');
      return true;
    }
    function observe() {
      syncTop();
      if (io) io.disconnect();
      if (ioEnd) ioEnd.disconnect();
      if (!('IntersectionObserver' in window)) { window.addEventListener('scroll', compute, { passive: true }); return; }
      var line = Math.round(curTop + indexEl.offsetHeight + 24), vh = window.innerHeight;
      // A 2px band at the activation line: a section intersects it exactly while it contains that line.
      io = new IntersectionObserver(compute, { rootMargin: '-' + line + 'px 0px -' + Math.max(0, vh - line - 2) + 'px 0px', threshold: 0 });
      secs.forEach(function (s) { io.observe(s); });
      ioEnd = new IntersectionObserver(function (en) { endVisible = en[en.length - 1].isIntersecting; compute(); }, { threshold: 0 });
      ioEnd.observe(endEl);
      compute();
    }
    function jump(id, instant) {
      var el = section.querySelector('[data-vps-sec="' + id + '"]');
      if (!el) return;
      mark(id);
      // Land just under the sticky index. Explicit offset (not scroll-margin) so page-level scroll-padding cannot add to it.
      var top = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - (stickyTop() + indexEl.offsetHeight + 8));
      // Smooth only for short hops; a long document would otherwise scroll for seconds.
      var smooth = !instant && !reduce && Math.abs(top - window.pageYOffset) < window.innerHeight * 2.5;
      var done = function () { clearTimeout(lock); lock = 0; compute(); };
      clearTimeout(lock);
      lock = setTimeout(done, smooth ? 1200 : 80);
      if (smooth && 'onscrollend' in window) window.addEventListener('scrollend', done, { once: true });
      window.scrollTo({ top: top, behavior: smooth ? 'smooth' : 'instant' });
    }
    var resizeTimer = 0;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(observe, 120); });
    // The shell bars can appear after boot (tab opened later, fonts, rail layout): re-sync on load and while scrolling, re-aim the observer if they moved.
    window.addEventListener('load', observe);
    window.addEventListener('scroll', function () { if (!panel.hidden && stickyTop() !== curTop) observe(); }, { passive: true });
    observe();
    section.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-vps-jump]');
      if (b) jump(b.getAttribute('data-vps-jump'));
    });

    function updateScale(share) {
      var amount = MARKET.notionalMillions * share / 100;
      section.querySelector('[data-vps-notional]').textContent = trillions(amount);
      section.querySelector('[data-vps-scale-value]').textContent = trillions(amount);
      section.querySelector('[data-vps-scale-bar]').style.width = (amount / 65000000 * 100) + '%';
      var pnc = amount / peerTotal(MARKET.peers[0]), jpm = amount / peerTotal(MARKET.peers[3]) * 100;
      section.querySelector('[data-vps-scale-summary]').textContent = share + '% of the global benchmark = ' + pnc.toFixed(2) + '× PNC’s OTC book; ' + (amount / peerTotal(MARKET.peers[2]) * 100).toFixed(1) + '% of Wells Fargo Bank’s and ' + jpm.toFixed(1) + '% of JPMorgan Chase Bank’s OTC book.';
      section.querySelectorAll('[data-vps-share]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.vpsShare === share ? 'true' : 'false'); });
    }
    updateScale(0.1);
    var benchmarkData = (window.PRO_DERIVATIVES && window.PRO_DERIVATIVES.rows) || [];
    function moneyB(n) { var digits = n > 0 && n < 1 ? Math.min(10, Math.max(2, 2 - Math.floor(Math.log10(n)))) : 2; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + 'B'; }
    var marketSelect = section.querySelector('[data-vps-model-market]');
    marketSelect.innerHTML = benchmarkData.map(function(r) {return '<option value="'+safe(r.symbol)+'">'+safe(r.name)+' ('+safe(r.symbol)+')</option>';}).join('');
    function renderEconomics() {
      var market = benchmarkData.filter(function(r){return r.symbol===marketSelect.value;})[0];
      if (!market) return;
      var inputs = {}; var valid = true;
      section.querySelectorAll('[data-vps-model]').forEach(function(el) { var n=Number(el.value); if(el.value==='' || !Number.isFinite(n) || n<+el.min || n>+el.max){ valid=false;el.setAttribute('aria-invalid','true'); }else el.removeAttribute('aria-invalid'); inputs[el.dataset.vpsModel]=n; });
      if (!valid) { section.querySelector('[data-vps-model-baseline]').textContent='Enter values within the stated input ranges to calculate this scenario.';section.querySelectorAll('[data-vps-economic]').forEach(function(el){el.textContent='—';});return; }
      var adv=market.advB*inputs.share/100, oi=market.oiB*inputs.share/100, margin=oi*inputs.margin/100, daily=adv*inputs.bps/10000;
      var values={adv:adv,oi:oi,margin:margin,bilateral:margin*2,daily:daily,annual:daily*inputs.days};
      section.querySelector('[data-vps-model-baseline]').textContent=market.name+' reference benchmark: ADV '+moneyB(market.advB)+' / OI '+moneyB(market.oiB)+'. All outputs below are scenario estimates.';
      Object.keys(values).forEach(function(k){section.querySelector('[data-vps-economic="'+k+'"]').textContent=moneyB(values[k]);});
    }
    section.addEventListener('input', function(e) {
      if(e.target.matches('[data-vps-model]')) renderEconomics();
    });
    section.addEventListener('change', function(e) {
      if(e.target.matches('[data-vps-model-market]')) renderEconomics();
    });
    // The Top 50 table sends a market here: show the overview and land on the calculator section.
    document.addEventListener('var:pro-model-market', function(e) {
      var symbol = e.detail && e.detail.symbol;
      if (!benchmarkData.some(function(r) { return r.symbol === symbol; })) return;
      document.dispatchEvent(new CustomEvent('var:pro-view', { detail: { view: 'overview' } }));
      marketSelect.value = symbol;
      renderEconomics();
      observe();
      jump('calculator', true);
    });
    renderEconomics();

    section.addEventListener('click', function (e) {
      var shareButton = e.target.closest && e.target.closest('[data-vps-share]');
      if (shareButton) updateScale(+shareButton.dataset.vpsShare);
    });
  }

  var VPS_CSS = `
.tsec[data-tg="variational-pro"]{scroll-margin-top:105px}
.vps-heading{display:block!important;text-align:left!important;padding:0!important;border:0!important;background:none!important}
.vps-heading>span{font:9px/1.5 var(--mono);letter-spacing:2px;color:#a3badb}
.vps-heading i{font-style:normal;margin:0 12px;color:#4c9af8}
body.v2-dashboard .vps-heading h3{font:700 clamp(32px,4.2vw,62px)/1.06 var(--sans,Arial,sans-serif)!important;letter-spacing:-.045em!important;color:#f4f7ff!important;margin:24px 0 18px!important}
.vps-heading h3 em{font-style:normal;color:#7db4ff}
.vps-heading>p{font:14px/1.65 var(--sans,Arial,sans-serif)!important;color:#9dafc9!important;margin:0!important;max-width:640px}
.vps-body{display:flex;flex-direction:column;justify-content:center;gap:24px;flex:1;min-width:0}
.vps-mini{font:9px/1.5 var(--mono);letter-spacing:2px;color:#8ba9cf}
body.v2-dashboard .vps-body h4{font:600 22px/1.3 var(--sans,Arial,sans-serif)!important;color:#e3edfc!important;margin:12px 0!important;letter-spacing:-.025em}
.vps-body p{font:13px/1.7 var(--sans,Arial,sans-serif)!important;color:#9dafc9!important;margin:0!important}
.vps-execution{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));list-style:none;padding:0;margin:0;gap:20px}
.vps-execution>li{position:relative;display:flex;flex-direction:column;gap:18px;min-width:0;padding:24px;border:1px solid #3b5270;background:#0c1727}
.vps-execution>li+li:before{content:"→";position:absolute;left:-18px;top:45%;font:18px var(--mono);color:#9dc7ff}
.vps-execution-label{font:9px/1.6 var(--mono);letter-spacing:1px;color:#a7c9f6}
body.v2-dashboard .vps-execution h4{font-size:20px!important;margin:0!important;line-height:1.3!important}
.vps-execution>li>p{margin-top:auto!important;font-size:12px!important;line-height:1.65!important;color:#b6c5d9!important}
.vps-request-ticket{display:flex;flex:1;min-height:142px;flex-direction:column;justify-content:center;gap:14px;padding:20px;border:1px solid #526b8c;background:#101f33}
.vps-request-ticket>span{font:9px var(--mono);letter-spacing:1px;color:#b5c8e2}
.vps-request-ticket>b{font:600 30px/1.2 var(--sans,Arial,sans-serif);color:#e7f1ff}
.vps-request-ticket p{font-size:11px!important;color:#bed1ec!important}
.vps-maker-list{display:grid;list-style:none;margin:0;padding:0;gap:8px}
.vps-maker-list li{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:14px 12px;border:1px solid #405570;background:#101d2e}
.vps-maker-list span{font:500 12px/1.5 var(--sans,Arial,sans-serif);color:#d4e3f7}
.vps-maker-list small{font:9px/1.5 var(--mono);color:#afc1db}
.vps-maker-list .is-selected{border-color:#78b3ff;background:#18395f}
.vps-maker-list .is-selected small{color:#b9daff}
.vps-pool-funders{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.vps-pool-funders span{padding:12px 6px;text-align:center;border:1px solid #426b68;font:11px/1.5 var(--sans,Arial,sans-serif);color:#d4eee8}
.vps-settlement{display:flex;flex:1;min-height:110px;flex-direction:column;justify-content:center;text-align:center;gap:12px;padding:16px 8px;border:1px solid #72d4b2;background:#102e2b}
.vps-settlement>span{font:8px/1.5 var(--mono);letter-spacing:.3px;color:#a4dfcc}
.vps-settlement>b{font:600 23px/1.3 var(--sans,Arial,sans-serif);color:#defff3}
.vps-settlement>small{font:10px/1.5 var(--mono);color:#b5e0d3}
.vps-managed{display:grid;grid-template-columns:1fr 1fr;gap:28px;padding:26px;border:1px solid #426c65;background:#0e2526}
.vps-managed .vps-execution-label{color:#a2ddca}
body.v2-dashboard .vps-managed h4{font-size:23px!important;margin:12px 0 8px!important;color:#e0fff4!important}
.vps-managed p{font-size:12px!important;color:#b8d2cb!important}
.vps-managed ul{list-style:none;display:grid;align-content:center;gap:14px;padding:0;margin:0}
.vps-managed li{display:flex;gap:12px;font:13px/1.5 var(--sans,Arial,sans-serif);color:#d9f0e9}
.vps-managed li>span{color:#97e5c9}
@media(max-width:1100px){.vps-execution{gap:14px}
.vps-execution>li{padding:18px;gap:16px}
.vps-execution>li+li:before{left:-14px;font-size:14px}
.vps-maker-list li{padding:12px 8px}
.vps-maker-list span{font-size:11px}
.vps-pool-funders{grid-template-columns:1fr}
.vps-settlement>b{font-size:20px}}
@media(max-width:760px){.vps-execution{grid-template-columns:1fr;gap:26px}
.vps-execution>li{padding:22px;gap:18px}
.vps-execution>li+li:before{content:"↓";left:50%;top:-23px;font-size:18px}
.vps-request-ticket{min-height:120px}
.vps-pool-funders{grid-template-columns:1fr 1fr}
.vps-managed{grid-template-columns:1fr;gap:24px;padding:22px}
.vps-maker-list span{font-size:13px}
.vps-maker-list small{font-size:10px}}
.vps-pool-map{display:grid;gap:16px}
.vps-pool-line{display:grid;grid-template-columns:1fr 1.5fr 1fr;align-items:center;gap:34px}
.vps-pool-line>span{text-align:center;padding:18px 8px;border:1px solid #273a53;font:12px var(--sans,Arial,sans-serif);color:#bdcde4}
.vps-pool-line>div{position:relative;text-align:center;padding:18px 10px;border:1px solid #568fdb;background:#142b48}
.vps-pool-line>div:before,.vps-pool-line>div:after{content:"";position:absolute;top:50%;width:35px;height:1px;background:#568fdb}
.vps-pool-line>div:before{right:100%}
.vps-pool-line>div:after{left:100%}
.vps-pool-line b{font:600 14px var(--sans,Arial,sans-serif);color:#deebff}
.vps-pool-line small{display:block;margin-top:6px;font:10px var(--mono);color:#8ba9cf}
.vps-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;padding-top:20px;border-top:1px solid #263850;color:#667d9d;font:10px/1.6 var(--mono)}
.vps-foot b{font-weight:400;color:#90aacd;white-space:nowrap}
@media(max-width:600px){.vps-heading>span{font-size:7px;letter-spacing:1px}
.vps-heading i{margin:0 5px}
body.v2-dashboard .vps-heading h3{font-size:32px!important;margin-top:22px!important}
.vps-heading>p{font-size:12px!important}
.vps-pool-line{gap:12px;grid-template-columns:1fr 1.4fr 1fr}
.vps-pool-line>span{font-size:10px;padding:18px 4px}
.vps-pool-line>div{padding:16px 4px}
.vps-pool-line>div:before,.vps-pool-line>div:after{width:13px}
.vps-pool-line b{font-size:11px}
.vps-pool-line small{display:none}
.vps-foot{font-size:8px;gap:14px}}
body.v2-dashboard .vps-heading h3{font-size:clamp(30px,3.2vw,46px)!important;line-height:1.12!important;letter-spacing:-.035em!important}
.vps-heading h3 em{color:#a4bfdf}
.vps-body{justify-content:flex-start}
.vps-heading>span{color:#9caec5}
.vps-controls{border:1px solid #354358;background:#0d1623}
.vps-controls-head,.vps-control-row{display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1fr) minmax(0,1.25fr)}
.vps-controls-head{background:#131f30}
.vps-controls-head>span{padding:17px 22px;font:9px/1.6 var(--mono);letter-spacing:1px;color:#b4c3d7}
.vps-controls-head>span+span{border-left:1px solid #354358}
.vps-control-row{border-top:1px solid #354358}
.vps-control-row>div{padding:26px 22px;min-width:0}
.vps-control-row>div+div{border-left:1px solid #354358}
.vps-control-name>span{font:8px/1.6 var(--mono);letter-spacing:.7px;color:#9fb4ce}
body.v2-dashboard .vps-control-name h4{font-size:18px!important;line-height:1.4!important;margin:12px 0 0!important}
body.v2-dashboard .vps-control-design h4{font-size:16px!important;line-height:1.45!important;margin:0 0 10px!important;color:#dbe7f6!important}
.vps-control-row p{font-size:13px!important;line-height:1.75!important;color:#b0bfd2!important}
.vps-control-design{background:#132033}
.vps-control-mobile{display:none}
.vps-risk-note{display:grid;grid-template-columns:160px 1fr;gap:24px;padding:20px 22px;border-left:2px solid #8297b1;background:#101a28}
.vps-risk-note>span{font:9px/1.7 var(--mono);letter-spacing:1px;color:#b6c5d8}
.vps-risk-note>p{font-size:12px!important;line-height:1.7!important;color:#b5c2d4!important}
.vps-request-ticket,.vps-maker-list .is-selected{background:#16253a;border-color:#6687b0}
.vps-execution-label{color:#b2c4dc}
.vps-settlement,.vps-managed{background:#132328;border-color:#5f7e85}
.vps-settlement>b,.vps-managed li{color:#dcebed}
.vps-settlement>span,.vps-managed .vps-execution-label,.vps-managed li>span{color:#a7c8cc}
body.v2-dashboard .vps-managed h4{color:#dcebed!important}
.vps-foot{color:#94a6bd}
.vps-execution>li>p,.vps-heading>p{color:#b3c0d2!important}
@media(max-width:760px){.vps-controls-head{display:none}
.vps-control-row{grid-template-columns:1fr}
.vps-control-row>div{padding:20px}
.vps-control-row>div+div{border-left:0;border-top:1px solid #2b394b}
.vps-control-name{background:#131f30}
.vps-control-mobile{display:block;font:8px/1.6 var(--mono);letter-spacing:1px;color:#9fb4ce;margin-bottom:12px}
.vps-risk-note{grid-template-columns:1fr;gap:12px;padding:20px}}
.vps-market-scenarios>div>span{font:9px/1.7 var(--mono);letter-spacing:1px;color:#afc4df}
.vps-market-scenarios{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #354358}
.vps-market-scenarios>div{padding:24px}
.vps-market-scenarios>div+div{border-left:1px solid #354358}
.vps-market-scenarios b{display:block;margin:14px 0;font:600 36px/1.1 var(--sans,Arial,sans-serif);letter-spacing:-1px;color:#dceaff}
.vps-market-scenarios p{font-size:11px!important}
.vps-scale-context{display:grid;grid-template-columns:1fr 1fr;gap:26px}
.vps-scale-context p{font-size:12px!important;line-height:1.7!important}
.vps-scale-context b{color:#dce7f6;font-weight:600}
.vps-data-sources{display:flex;flex-wrap:wrap;gap:12px 24px;font:9px/1.7 var(--mono);color:#9baec8}
.vps-data-sources a{color:#b7d2f7!important;text-decoration:underline;text-underline-offset:4px}
.vps-data-sources>span{flex-basis:100%}
.vps-share-controls{display:flex;flex-wrap:wrap;gap:8px}
.vps-share-controls button{padding:12px 22px;border:1px solid #4d6482;border-radius:2px;background:#101b2b;color:#c5d6ed;font:12px var(--mono);cursor:pointer}
.vps-share-controls button[aria-pressed="true"]{background:#28486d;border-color:#9bbfe9;color:#fff}
.vps-share-controls button:focus-visible{outline:2px solid #b4d5ff;outline-offset:3px}
.vps-scale-result{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center;border-top:1px solid #354358;border-bottom:1px solid #354358;padding:24px 0}
.vps-scale-result span{font:9px/1.7 var(--mono);letter-spacing:1px;color:#afc4df}
.vps-scale-result strong{display:block;margin-top:12px;font:600 60px/1 var(--sans,Arial,sans-serif);letter-spacing:-.05em;color:#d6e8ff}
.vps-scale-result p{font-size:14px!important;color:#ccdaec!important}
.vps-scale-axis{display:flex;justify-content:space-between;gap:12px;margin-bottom:18px;font:8px/1.6 var(--mono);letter-spacing:.5px;color:#9aaecb}
.vps-scale-row{display:grid;grid-template-columns:210px minmax(0,1fr) 72px;gap:16px;align-items:center;padding:12px 0}
.vps-scale-row>span{font:12px/1.5 var(--sans,Arial,sans-serif);color:#c5d2e5}
.vps-scale-row small{display:block;font:8px/1.7 var(--mono);color:#9abbe4}
.vps-scale-row>div{height:14px;background:#162135;border-right:1px solid #405472}
.vps-scale-row i{display:block;min-width:0;height:100%;background:#637e9e}
.vps-scale-row b{font:11px var(--mono);text-align:right;color:#cad8eb;white-space:nowrap}
.vps-scale-row.is-scenario i{background:#a2c9ff}
.vps-scale-row.is-scenario>span,.vps-scale-row.is-scenario b{color:#c4deff}
@media(max-width:760px){.vps-market-scenarios{grid-template-columns:1fr}
.vps-market-scenarios>div+div{border-left:0;border-top:1px solid #354358}
.vps-market-scenarios>div{padding:20px}
.vps-scale-context,.vps-scale-result{grid-template-columns:1fr;gap:18px}
.vps-scale-result strong{font-size:52px}
.vps-scale-row{grid-template-columns:1fr 66px;gap:8px}
.vps-scale-row>span{grid-column:1/-1}
.vps-share-controls button{padding:12px 16px}
.vps-scale-axis{font-size:7px}
.vps-data-sources{font-size:8px}}
.vps-product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #354358}
.vps-product-grid>section{display:flex;flex-direction:column;gap:16px;padding:24px;min-width:0}
.vps-product-grid>section+section{border-left:1px solid #354358}
body.v2-dashboard .vps-product-grid h4{font-size:19px!important;line-height:1.4!important;margin:0!important}
.vps-product-grid p{font-size:12px!important;line-height:1.75!important}
.vps-product-grid a,.vps-protocol-detail a{margin-top:auto;font:9px/1.6 var(--mono);color:#b6d0f4!important;text-decoration:underline;text-underline-offset:4px}
.vps-product-pools{display:grid;gap:20px;padding:26px;border:1px solid #354358;background:#101b2b}
.vps-product-pools>p{font-size:12px!important}
.vps-product-status{display:grid;grid-template-columns:160px 1fr;gap:24px;padding:20px 22px;border-left:2px solid #8ba4c2;background:#111b29}
.vps-product-status>span{font:9px/1.6 var(--mono);letter-spacing:1px;color:#b4c7de}
.vps-product-status p{font-size:12px!important}
.vps-protocol-detail{display:flex;align-items:center;gap:24px;padding:18px 22px;background:#111d2c;border-left:2px solid #7893b4}
.vps-protocol-detail p{font-size:12px!important;line-height:1.7!important}
.vps-protocol-detail b{color:#d2e1f4}
.vps-protocol-detail a{flex:none;max-width:150px;margin-top:0}
@media(max-width:760px){.vps-product-grid{grid-template-columns:1fr}
.vps-product-grid>section{padding:22px}
.vps-product-grid>section+section{border-left:0;border-top:1px solid #354358}
.vps-product-pools{padding:20px 14px}
.vps-product-status{grid-template-columns:1fr;gap:12px}
.vps-protocol-detail{flex-direction:column;align-items:flex-start;gap:12px}
.vps-protocol-detail a{max-width:none}}
.vps-legacy-columns{display:grid;grid-template-columns:1fr 1fr;border:1px solid #354358}
.vps-legacy-columns>section{padding:24px}
.vps-legacy-pro{border-left:1px solid #354358;background:#111f31}
.vps-legacy-title{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-bottom:20px;border-bottom:1px solid #354358}
.vps-legacy-title h4{margin:0!important}
.vps-legacy-title>span{font:9px var(--mono);color:#adc4df}
.vps-detailed-steps{list-style:none;counter-reset:otc;padding:0;margin:0}
.vps-detailed-steps li{position:relative;padding:18px 0 18px 36px;counter-increment:otc;border-bottom:1px solid #29384b}
.vps-detailed-steps li:before{content:counter(otc,decimal-leading-zero);position:absolute;left:0;top:20px;font:10px var(--mono);color:#9abce8}
.vps-detailed-steps b{font:600 14px/1.5 var(--sans,Arial,sans-serif);color:#deebfb}
.vps-detailed-steps p{font-size:12px!important;line-height:1.75!important;margin-top:7px!important}
.vps-legacy-note,.vps-model-assumptions{padding:22px;margin-top:24px;background:#172638;border-left:2px solid #89a8cc}
.vps-legacy-note>b,.vps-model-assumptions>b{font:600 13px var(--sans,Arial,sans-serif);color:#d9e7fb}
.vps-legacy-note p,.vps-model-assumptions p{font-size:12px!important;line-height:1.75!important;margin-top:12px!important}
.vps-benchmark-toolbar,.vps-economics-inputs{display:flex;flex-wrap:wrap;gap:16px;padding:20px;border:1px solid #354358;background:#101c2c}
.vps-benchmark-toolbar label,.vps-economics-inputs label{display:flex;flex:1;min-width:150px;flex-direction:column;gap:10px;font:10px/1.5 var(--mono);color:#b9cce4}
.vps-benchmark-toolbar input,.vps-benchmark-toolbar select,.vps-economics-inputs input,.vps-economics-inputs select{box-sizing:border-box;width:100%;min-height:42px;padding:10px;border:1px solid #4d6481;border-radius:2px;background:#0b1320;color:#e2edfc;font:12px var(--sans,Arial,sans-serif);color-scheme:dark}
.vps-benchmark-toolbar input:focus-visible,.vps-benchmark-toolbar select:focus-visible,.vps-economics-inputs input:focus-visible,.vps-economics-inputs select:focus-visible{outline:2px solid #9dc6fa;outline-offset:2px}
.vps-economics-inputs input[aria-invalid="true"]{border-color:#ef9f9f}
.vps-benchmark-period{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font:9px var(--mono);color:#a4bbd8}
.vps-benchmark-scroll{max-height:640px;overflow:auto;border:1px solid #354358;scrollbar-color:#506987 #111b29}
.vps-benchmark-table{width:100%;border-collapse:separate;border-spacing:0;min-width:720px;font:12px/1.5 var(--sans,Arial,sans-serif);color:#d4e0f1}
.vps-benchmark-table caption{text-align:left;padding:16px 18px;background:#111d2d;font-size:11px;color:#aebfd5}
.vps-benchmark-table thead th{position:sticky;top:0;z-index:1;background:#1b2a3e;color:#bdd1ec;font:10px/1.5 var(--mono);white-space:nowrap}
.vps-benchmark-table td,.vps-benchmark-table th{text-align:left;padding:14px 18px;border-bottom:1px solid #29384b}
.vps-benchmark-table td:nth-child(4),.vps-benchmark-table td:nth-child(5){font-family:var(--mono);white-space:nowrap;text-align:right}
.vps-benchmark-table th small{display:block;font:9px/1.6 var(--mono);color:#8fafda;margin-top:3px}
.vps-benchmark-table tbody tr:hover{background:#16263d}
.vps-benchmark-table button{padding:7px 10px;border:1px solid #47678c;background:#1a304b;color:#cce1ff;font:10px var(--mono);cursor:pointer;white-space:nowrap}
.vps-methodology{border:1px solid #354358;padding:18px 22px}
.vps-methodology summary{font:12px/1.6 var(--sans,Arial,sans-serif);color:#dce9fb;cursor:pointer}
.vps-methodology p{font-size:12px!important;margin-top:16px!important}
.vps-methodology a{color:#b6d1f7!important;text-decoration:underline}
.vps-economic-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #354358;border-left:1px solid #354358}
.vps-economic-metrics>div{padding:24px;border-bottom:1px solid #354358;border-right:1px solid #354358;background:#101c2c;min-width:0}
.vps-economic-metrics span{font:8px/1.7 var(--mono);letter-spacing:.5px;color:#b0c7e5}
.vps-economic-metrics b{display:block;margin:16px 0;font:600 clamp(22px,2.5vw,36px)/1.2 var(--sans,Arial,sans-serif);letter-spacing:-.03em;color:#e2efff;overflow-wrap:anywhere}
.vps-economic-metrics small{display:block;font:10px/1.6 var(--sans,Arial,sans-serif);color:#9db2cf}
.vps-model-baseline{font-size:12px!important}
@media(max-width:760px){.vps-legacy-columns{grid-template-columns:1fr}
.vps-legacy-pro{border-left:0;border-top:1px solid #354358}
.vps-legacy-columns>section{padding:20px}
.vps-economic-metrics{grid-template-columns:1fr 1fr}
.vps-economic-metrics>div{padding:18px}
.vps-benchmark-toolbar,.vps-economics-inputs{padding:16px}
.vps-benchmark-toolbar label,.vps-economics-inputs label{min-width:130px}
.vps-benchmark-scroll{max-height:560px}
.vps-benchmark-table td,.vps-benchmark-table th{padding:12px}}
@media(max-width:400px){.vps-economic-metrics{grid-template-columns:1fr}}
`;

  // One-pager layout. Injected last so it wins the cascade over the component rules above.
  var VPS_COMPACT_CSS = `
.vps-heading>span{line-height:1.4}
body.v2-dashboard .vps-sec .vps-heading h3{font-size:clamp(26px,2.5vw,36px)!important;line-height:1.1!important;margin:8px 0 8px!important}
.vps-heading>p{font-size:14px!important;line-height:1.5!important;max-width:760px}
.vps-sec .vps-body{gap:12px}
.vps-foot{padding-top:12px;gap:20px}
.vps-product-grid>section{gap:8px;padding:16px 18px}
body.v2-dashboard .vps-product-grid h4{font-size:17px!important}
.vps-product-grid p{line-height:1.6!important}
.vps-product-pools{gap:12px;padding:16px 18px}
.vps-pool-map{gap:10px}
.vps-pool-line{gap:26px}
.vps-pool-line>span{padding:10px 8px}
.vps-pool-line>div{padding:10px}
.vps-pool-line small{margin-top:3px}
.vps-product-status{gap:18px;padding:12px 18px}
.vps-market-scenarios>div{padding:14px 18px}
.vps-market-scenarios b{margin:6px 0;font-size:28px}
.vps-scale-context{gap:20px}
.vps-scale-context p,.vps-protocol-detail p{line-height:1.6!important}
.vps-data-sources{gap:6px 24px}
.vps-legacy-columns>section{padding:14px 20px 16px}
.vps-legacy-title{padding-bottom:10px}
.vps-detailed-steps li{padding:0}
.vps-detailed-steps li:before{top:0;height:38px;display:flex;align-items:center;pointer-events:none}
.vps-detailed-steps summary{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:38px;padding:7px 4px 7px 34px;list-style:none;cursor:pointer}
.vps-detailed-steps summary::-webkit-details-marker{display:none}
.vps-detailed-steps summary::marker{content:""}
.vps-detailed-steps summary::after{content:"+";flex:none;width:16px;text-align:center;font:15px/1 var(--mono);color:#7fb0ee}
.vps-detailed-steps details[open]>summary::after{content:"\\2212"}
.vps-detailed-steps summary:hover b{color:#fff}
.vps-detailed-steps summary:focus-visible{outline:2px solid #9dc6fa;outline-offset:-2px}
.vps-detailed-steps details[open]{background:#142236}
.vps-detailed-steps details>p{margin:0!important;padding:0 32px 12px 34px;line-height:1.6!important}
.vps-legacy-note,.vps-model-assumptions{padding:14px 18px;margin-top:14px}
.vps-legacy-note p,.vps-model-assumptions p{margin-top:8px!important;line-height:1.6!important}
.vps-execution{gap:18px}
.vps-execution>li{gap:10px;padding:16px}
body.v2-dashboard .vps-execution h4{font-size:18px!important}
.vps-execution>li>p{line-height:1.55!important}
.vps-request-ticket{min-height:92px;gap:8px;padding:14px}
.vps-request-ticket>b{font-size:24px}
.vps-maker-list{gap:6px}
.vps-maker-list li{padding:8px 10px}
.vps-settlement{min-height:84px;gap:6px;padding:10px 8px}
.vps-settlement>b{font-size:20px}
.vps-pool-funders span{padding:8px 6px}
.vps-protocol-detail{gap:20px;padding:10px 18px}
.vps-managed{gap:20px;padding:14px 18px}
body.v2-dashboard .vps-managed h4{font-size:19px!important;margin:6px 0 4px!important}
.vps-managed ul{gap:8px}
.vps-controls-head>span{padding:10px 18px}
.vps-control-row>div{padding:14px 18px}
body.v2-dashboard .vps-control-name h4{font-size:16px!important;margin:6px 0 0!important}
body.v2-dashboard .vps-control-design h4{font-size:15px!important;margin:0 0 4px!important}
.vps-control-row p{line-height:1.6!important}
.vps-risk-note{gap:18px;padding:12px 18px}
.vps-share-controls button{padding:8px 18px}
.vps-scale-result{gap:20px;padding:14px 0}
.vps-scale-result strong{margin-top:6px;font-size:44px}
.vps-scale-axis{margin-bottom:6px}
.vps-scale-row{padding:6px 0}
.vps-economics-inputs{gap:10px 12px;padding:12px 14px}
.vps-economics-inputs label{gap:5px;min-width:140px}
.vps-economics-inputs input,.vps-economics-inputs select{min-height:36px;padding:7px 10px}
.vps-economic-metrics>div{padding:14px 16px}
.vps-economic-metrics b{margin:8px 0;font-size:clamp(20px,2vw,28px)}
.vps-model-assumptions{margin-top:0}
@media(max-width:760px){.vps-execution{gap:22px}
.vps-execution>li+li:before{top:-20px}
.vps-market-scenarios>div{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:12px;align-items:center;padding:8px 14px}
.vps-market-scenarios>div>span{grid-column:1;grid-row:1}
.vps-market-scenarios>div>p{grid-column:1;grid-row:2}
.vps-market-scenarios b{grid-column:2;grid-row:1/3;margin:0;font-size:24px}
.vps-legacy-columns>section{padding:10px 12px 12px}
.vps-legacy-title{flex-wrap:nowrap;gap:8px;padding-bottom:8px}
.vps-legacy-title>span{font-size:8px;text-align:right}
.vps-control-name{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px}
.vps-control-row>div{padding:10px 14px}
.vps-control-mobile{margin-bottom:6px}
.vps-managed{gap:12px}}
@media(max-width:600px){.vps-sec .vps-body{gap:10px}
body.v2-dashboard .vps-sec .vps-heading h3{font-size:25px!important;margin:6px 0!important}
.vps-heading>p{font-size:13px!important}
.vps-foot{padding-top:10px;gap:12px}
.vps-product-grid a,.vps-protocol-detail a,.vps-data-sources a{display:inline-flex;align-items:center;align-self:flex-start;min-height:30px}
.vps-sec .vps-body p,.vps-detailed-steps details>p,.vps-product-grid p,.vps-control-row p,.vps-scale-context p,.vps-protocol-detail p,.vps-legacy-note p,.vps-model-assumptions p,.vps-execution>li>p{line-height:1.5!important}
.vps-product-grid>section{padding:12px}
.vps-product-pools{padding:14px 12px}
.vps-product-status{gap:6px;padding:12px 14px}
.vps-scale-context{gap:10px}
.vps-detailed-steps li:before,.vps-detailed-steps summary{min-height:34px}
.vps-detailed-steps li:before{height:34px}
.vps-detailed-steps summary{padding-top:5px;padding-bottom:5px;padding-left:30px}
.vps-detailed-steps details>p{padding-left:30px;padding-right:20px}
.vps-protocol-detail{gap:6px;padding:10px 14px}
.vps-execution>li{padding:12px;gap:8px}
.vps-request-ticket{min-height:0;padding:12px}
.vps-request-ticket>b{font-size:22px}
.vps-settlement{min-height:0}
.vps-managed{padding:14px}
.vps-risk-note{gap:6px;padding:12px 14px}
.vps-scale-result{gap:8px;padding:12px 0}
.vps-scale-result strong{font-size:38px}
.vps-share-controls{gap:6px}
.vps-share-controls button{padding:10px 14px}
.vps-scale-row{padding:4px 0;gap:4px 8px}
.vps-economics-inputs{padding:10px;gap:8px}
.vps-economics-inputs label{min-width:100px;font-size:9px}
.vps-economic-metrics>div{padding:12px}
.vps-economic-metrics b{margin:6px 0;font-size:19px}
.vps-economic-metrics span{line-height:1.5}
.vps-economic-metrics small{font-size:11px;line-height:1.4}
.vps-legacy-note,.vps-model-assumptions{padding:12px 14px}}
@media(max-width:400px){.vps-economic-metrics{grid-template-columns:1fr 1fr}}
/* ---- one-pager frame ---- */
[data-vps-overview-panel]{min-width:0;max-width:1240px}
.vps-index{position:sticky;top:var(--vps-top,68px);z-index:40;display:flex;align-items:stretch;gap:2px;min-height:46px;padding:0 8px;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scrollbar-width:none;background:#0a1220;border:1px solid #273953;border-top:0;box-shadow:0 8px 18px #02060d88}
:root[data-theme="light"] .vps-index{box-shadow:0 6px 14px #0a122033}
.vps-index::-webkit-scrollbar{display:none}
.vps-index button{flex:none;display:inline-flex;align-items:center;gap:8px;padding:0 14px;border:0;border-bottom:2px solid transparent;background:transparent;color:#9eb3d0;font:600 12px var(--sans,Arial,sans-serif);white-space:nowrap;cursor:pointer}
.vps-index button span{font:10px var(--mono);color:#699de0}
.vps-index button:hover{color:#e8f2ff}
.vps-index button[aria-current="true"]{color:#e8f2ff;border-bottom-color:#77b3ff;background:#142a46}
.vps-index button:focus-visible,.vps-linkbtn:focus-visible{outline:2px solid #9dc6fa;outline-offset:-2px}
.vps-doc{box-sizing:border-box;min-width:0;border:1px solid #273953;border-top:0;background:#0b111c;color:#fff}
.vps-sec{box-sizing:border-box;display:flex;flex-direction:column;gap:16px;min-width:0;min-height:0;padding:34px 32px 20px;border:0;background:none}
.vps-sec+.vps-sec{border-top:1px solid #273953}
.vps-sec .vps-body{flex:none;justify-content:flex-start;gap:20px}
.vps-heading{max-width:780px}
body.v2-dashboard .vps-sec .vps-heading h3{font-size:clamp(28px,3vw,40px)!important;line-height:1.1!important;margin:10px 0 10px!important}
.vps-heading>span{font-size:10px}
.vps-foot{margin-top:4px;padding-top:12px;font-size:11px}
.vps-end{height:1px}
.tsec[data-tg="variational-pro"]{scroll-margin-top:105px}
.vps-lab{display:block;font:10px/1.6 var(--mono);letter-spacing:1px;color:#afc4df}
.vps-badge{align-self:flex-start;padding:2px 8px;border:1px solid #3a5272;border-radius:2px;font:9px/1.6 var(--mono);letter-spacing:.8px;color:#9fb8da}

/* sub-blocks inside a section */
.vps-sub{display:flex;flex-direction:column;gap:14px;min-width:0}
.vps-sub+.vps-sub{padding-top:22px;border-top:1px solid #263850}
.vps-sub-head{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px 16px}
.vps-sub-head>span{font:10px/1.5 var(--mono);letter-spacing:1.5px;color:#8ba9cf}
body.v2-dashboard .vps-body .vps-sub-head h4{margin:0!important;font:600 20px/1.3 var(--sans,Arial,sans-serif)!important;color:#e3edfc!important;letter-spacing:-.02em}
body.v2-dashboard .vps-body .vps-sublead{max-width:760px;font-size:13px!important;line-height:1.65!important;color:#b3c0d2!important}
body.v2-dashboard .vps-body .vps-subnote{font:11px/1.7 var(--mono)!important;color:#94a6bd!important}
.vps-subnote a,.vps-stat a,.vps-risk a{color:#b7d2f7!important}

/* 01 market size */
.vps-big{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);border:1px solid #435776;background:#101e30}
.vps-big-main,.vps-big-side{padding:22px 28px;min-width:0}
.vps-big-side{border-left:1px solid #435776;background:#0f1b2b}
.vps-big strong{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px 14px;margin:10px 0;font:600 clamp(54px,6.2vw,84px)/1 var(--sans,Arial,sans-serif);letter-spacing:-.05em;color:#e3efff}
.vps-big-side strong{font-size:clamp(34px,3.6vw,48px);color:#c9dcf5}
body.v2-dashboard .vps-big strong small{font:10px var(--mono)!important;letter-spacing:2px;color:#afc4df!important}
.vps-big-meta{display:flex;flex-wrap:wrap;gap:4px 20px;font:10px/1.7 var(--mono);letter-spacing:1px;color:#afc4df}
body.v2-dashboard .vps-big-side p{margin:0!important;font-size:12px!important;line-height:1.65!important;color:#b3c0d2!important}
.vps-risk{border:1px solid #354358;background:#0f1928}
.vps-risk-head,.vps-risk-row{display:grid;grid-template-columns:minmax(150px,1.15fr) minmax(100px,2fr) 92px 64px 100px;align-items:center;gap:16px;padding:11px 18px}
.vps-risk-head{background:#131f30;padding-top:10px;padding-bottom:10px}
.vps-risk-head span{font:9px/1.5 var(--mono);letter-spacing:1px;color:#b4c3d7}
.vps-risk-head span:nth-child(n+3),.vps-risk-num,.vps-risk-share,.vps-risk-gmv{text-align:right}
.vps-risk-row{border-top:1px solid #29384b}
.vps-risk-name{display:flex;flex-direction:column;gap:2px;min-width:0}
.vps-risk-name b{font:600 14px/1.4 var(--sans,Arial,sans-serif);color:#deebfb}
.vps-risk-name span{display:flex;flex-wrap:wrap;gap:0 12px;font:9px/1.7 var(--mono)}
.vps-risk-bar{height:12px;background:#162135;border-right:1px solid #405472}
.vps-risk-bar i{display:block;height:100%;background:#637e9e}
.vps-risk-row:first-of-type .vps-risk-bar i,.vps-risk-head+.vps-risk-row .vps-risk-bar i{background:#9cc4f5}
.vps-risk-num,.vps-risk-share,.vps-risk-gmv{font:12px var(--mono);color:#d4e0f1;white-space:nowrap}
body.v2-dashboard .vps-risk-row small{display:none}
.vps-risk-gmv{color:#aebfd5}
.vps-risk-total{background:#101c2c}
.vps-risk-total .vps-risk-bar i{background:#4d6481}
.vps-risk-total .vps-risk-name b{color:#fff}

/* roles */
.vps-roles ol{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;padding:0;list-style:none;border:1px solid #354358;background:#0f1928}
.vps-roles li{display:flex;flex-direction:column;gap:8px;min-width:0;padding:16px 18px}
.vps-roles li+li{border-left:1px solid #354358}
.vps-roles li>span{font:9px/1.7 var(--mono);letter-spacing:.6px;color:#adc4df}
.vps-roles li>b{font:600 16px/1.45 var(--sans,Arial,sans-serif);color:#d8e8fb}
.vps-roles li>p{font-size:12px!important;line-height:1.65!important}

/* 02 crypto */
body.v2-dashboard .vps-defs{display:block;padding:14px 18px;border-left:2px solid #7893b4;background:#111d2c;font-size:12px;line-height:1.7;color:#b3c0d2}
.vps-defs b{color:#dce7f6;font-weight:600}.vps-defs em{font-style:normal;color:#cfe0f6}.vps-defs span{margin-left:6px}
.vps-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));border-top:1px solid #354358;border-left:1px solid #354358}
.vps-stats-2{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}
.vps-stat{display:flex;flex-direction:column;gap:6px;min-width:0;padding:16px 18px;border-right:1px solid #354358;border-bottom:1px solid #354358;background:#101c2c}
.vps-stat>b{display:block;margin:4px 0 0;font:600 clamp(28px,2.8vw,40px)/1.1 var(--sans,Arial,sans-serif);letter-spacing:-.04em;color:#e2efff}
.vps-stat>em{font:normal 10px/1.5 var(--mono);letter-spacing:1px;color:#8fb7ee}
body.v2-dashboard .vps-stat p{margin:2px 0 6px!important;font-size:12px!important;line-height:1.6!important;color:#a9b9cf!important}
.vps-stat .vps-badge{margin-top:auto}
.vps-linkbtn{padding:0;border:0;background:none;color:#b7d2f7;font:10px var(--mono);letter-spacing:.8px;text-decoration:underline;text-underline-offset:4px;cursor:pointer}

/* 03 ladder */
.vps-ladder{border:1px solid #354358;background:#0f1928}
.vps-ladder-axis{padding:10px 18px;background:#131f30;font:9px/1.5 var(--mono);letter-spacing:.6px;color:#9fb4ce}
.vps-rung{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1.5fr) minmax(0,.6fr);align-items:center;gap:18px;padding:14px 18px;border-top:1px solid #29384b}
.vps-rung-name{display:flex;flex-direction:column;gap:3px;min-width:0}
.vps-rung-name>span{font:9px/1.5 var(--mono);letter-spacing:.6px;color:#9fb4ce}
.vps-rung-name>b{font:600 15px/1.4 var(--sans,Arial,sans-serif);color:#deebfb}
.vps-rung-name>em{font:normal 10px/1.6 var(--mono)}
.vps-rung-name a{color:#b7d2f7!important}
.vps-rung-track{position:relative;height:22px;background:linear-gradient(90deg,#2a3b54 0 1px,transparent 1px) 0 0/16.6667% 100%,#131e30;border-right:1px solid #405472}
.vps-rung-track i{position:absolute;left:0;top:4px;bottom:4px;background:#6f93c0}
.vps-rung:first-of-type .vps-rung-track i{background:#a8cbf7}
.vps-rung-val{display:flex;flex-direction:column;align-items:flex-end;gap:2px;text-align:right}
.vps-rung-val strong{font:600 22px/1.2 var(--sans,Arial,sans-serif);letter-spacing:-.03em;color:#e2efff}
body.v2-dashboard .vps-rung-val small{font:9px/1.5 var(--mono)!important;color:#9fb4ce!important}
.vps-rung-pro{background:#101b2b}
.vps-rung-pro .vps-rung-track i{left:0;right:0;top:3px;bottom:3px;width:auto;background:none;border:1px dashed #78b3ff}
.vps-rung-pro .vps-rung-track span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:9px var(--mono);letter-spacing:1.5px;color:#a9c9f7}
.vps-rung-pro .vps-rung-val strong{color:#a9c9f7}

/* scenarios: keep the share cards as a bordered strip */
.vps-market-scenarios{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #354358}
.vps-market-scenarios>div{padding:14px 18px}
.vps-market-scenarios>div+div{border-left:1px solid #354358}
.vps-market-scenarios>div>span{font:9px/1.7 var(--mono);letter-spacing:1px;color:#afc4df}
.vps-market-scenarios b{display:block;margin:6px 0;font:600 28px/1.1 var(--sans,Arial,sans-serif);letter-spacing:-1px;color:#dceaff}
.vps-market-scenarios p{font-size:12px!important}
.vps-scale-row b{font-size:12px}
.vps-scale-axis{font-size:9px}
.vps-scale-row small{font-size:9px}
.vps-linkbtn{margin-top:2px}

/* sources */
.vps-src-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:22px 28px}
.vps-src-grid ul,.vps-disclaimers ul{margin:10px 0 0;padding:0;list-style:none;display:grid;gap:8px}
.vps-src-grid li{font:12px/1.55 var(--mono);overflow-wrap:anywhere}
.vps-src-grid a{color:#b7d2f7!important;text-decoration:underline;text-underline-offset:3px}
.vps-risk-name a,.vps-rung-name a,.vps-stat a,.vps-subnote a,.vps-disclaimers a,.vps-src-grid a{min-height:0}.vps-src-grid a{display:inline-block;padding:3px 0}.vps-risk-name span a{display:inline-block;padding:2px 0}
.vps-disclaimers{padding:16px 18px;border-left:2px solid #8ba4c2;background:#111b29}
.vps-disclaimers li{font:12px/1.65 var(--sans,Arial,sans-serif);color:#b3c0d2}
.vps-disclaimers li b{color:#dce7f6;font-weight:600}

@media(max-width:1000px){
.vps-sec{padding:28px 24px 18px}
.vps-risk-head,.vps-risk-row{grid-template-columns:minmax(130px,1.1fr) minmax(70px,1.4fr) 84px 56px 90px;gap:12px;padding-left:14px;padding-right:14px}
.vps-rung{grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) minmax(0,.7fr);gap:14px}
}
@media(max-width:760px){
.vps-big{grid-template-columns:1fr}.vps-big-side{border-left:0;border-top:1px solid #435776}
.vps-roles ol{grid-template-columns:1fr}.vps-roles li+li{border-left:0;border-top:1px solid #354358}
.vps-risk-head{display:none}
.vps-risk-row{grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);grid-template-areas:"name share" "bar bar" "num gmv";gap:8px 12px;padding:12px 14px}
.vps-risk-name{grid-area:name}.vps-risk-share{grid-area:share;text-align:right;font-size:14px;color:#e2efff}.vps-risk-bar{grid-area:bar}.vps-risk-num{grid-area:num;text-align:left}.vps-risk-gmv{grid-area:gmv;text-align:right}
body.v2-dashboard .vps-risk-row small{display:block;margin:0 0 2px;font:8px/1.4 var(--mono)!important;letter-spacing:.8px;color:#8ba9cf!important}
body.v2-dashboard .vps-risk-row .vps-risk-share small{display:none}
.vps-risk-total{background:#101c2c}
.vps-rung{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"name val" "track track";gap:10px 12px;padding:14px}
.vps-rung-name{grid-area:name}.vps-rung-val{grid-area:val}.vps-rung-track{grid-area:track}
.vps-market-scenarios{grid-template-columns:1fr}.vps-market-scenarios>div+div{border-left:0;border-top:1px solid #354358}
}
@media(max-width:600px){
.vps-index{min-height:44px;padding:0 4px}.vps-index button{padding:0 10px}
.vps-sec{padding:22px 14px 14px;gap:12px}
.vps-sec .vps-body{gap:16px}
body.v2-dashboard .vps-sec .vps-heading h3{font-size:27px!important}
.vps-heading>span{font-size:9px;letter-spacing:1px}
.vps-big-main,.vps-big-side{padding:16px}
body.v2-dashboard .vps-body .vps-sub-head h4{font-size:18px!important}
.vps-foot{font-size:11px}
.vps-stat{padding:14px}
.vps-economics-inputs label{font-size:10px}
.vps-economic-metrics small{font-size:11px}
}
.vps-doc .vps-data-sources{font-size:11px}

`;
  function injectVpsStyle() {
    if (document.getElementById('vps-style')) return;
    var st = document.createElement('style');
    st.id = 'vps-style';
    st.textContent = VPS_CSS;
    document.head.appendChild(st);
  }

  function boot() {
    injectVpsStyle();
    var main = document.getElementById('main');
    var tabs = document.getElementById('tabs');
    if (!main || !tabs || document.getElementById('tab-' + TAB)) return;

    VALID_TABS.push(TAB);
    DEFAULT_TAB_ORDER.push(TAB);
    SECTION_COPY[TAB] = {
      eyebrow: 'Post-TGE', title: TITLE, description: 'Coming soon', chip: 'coming soon'
    };

    var section = document.createElement('section');
    section.className = 'tsec tg-hide';
    section.setAttribute('data-tg', TAB);
    section.innerHTML = page();
    var overviewPanel = document.createElement('div');
    overviewPanel.setAttribute('data-vps-overview-panel', '');
    while (section.firstChild) overviewPanel.appendChild(section.firstChild);
    var viewNav = document.createElement('nav');
    viewNav.className = 'vps-view-nav';
    viewNav.setAttribute('aria-label', 'Variational Pro pages');
    viewNav.innerHTML = '<button type="button" data-vps-view="overview" aria-current="page"><span>01</span> Pro overview</button>' +
      '<button type="button" data-vps-view="derivatives" aria-current="false"><span>02</span> Top 50 derivatives</button>';
    section.appendChild(viewNav);
    section.appendChild(overviewPanel);
    function setView(view) {
      var derivativesPanel = section.querySelector('[data-vps-derivatives-panel]');
      if (view === 'derivatives' && !derivativesPanel) return;
      overviewPanel.hidden = view !== 'overview';
      section.classList.toggle('vps-show-derivatives', view === 'derivatives');
      if (derivativesPanel) derivativesPanel.hidden = view !== 'derivatives';
      viewNav.querySelectorAll('[data-vps-view]').forEach(function (button) {
        button.setAttribute('aria-current', button.dataset.vpsView === view ? 'page' : 'false');
      });
      if (!section.classList.contains('tg-hide')) history.replaceState(null, '', view === 'derivatives' ? '#derivatives' : '#variational-pro');
      section.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    section.addEventListener('click', function (e) {
      var target = e.target.closest && e.target.closest('[data-vps-view]');
      if (target) setView(target.dataset.vpsView);
    });
    document.addEventListener('var:pro-view', function (e) {
      if (e.detail && e.detail.view) setView(e.detail.view);
    });
    main.appendChild(section);
    wireDoc(section, overviewPanel);

    var button = document.createElement('button');
    button.id = 'tab-' + TAB;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', 'false');
    button.dataset.tab = TAB;
    button.textContent = TITLE;
    tabs.appendChild(button);

    document.querySelectorAll('[data-open-tab="whales"]').forEach(function (source) {
      var next = source.cloneNode(true);
      next.setAttribute('data-open-tab', TAB);
      next.classList.remove('on');
      var title = next.querySelector('strong') || next.querySelector('b');
      if (title) title.textContent = TITLE;
      var small = next.querySelector('small');
      if (small) small.textContent = 'Coming soon';
      source.parentNode.insertBefore(next, source.nextSibling);
    });

    var style = document.createElement('style');
    style.textContent = `
.tsec[data-tg="variational-pro"]{padding-top:16px}
.vps-view-nav{display:flex;flex-wrap:wrap;gap:0;margin-bottom:12px;border:1px solid #314561;background:#0a1422}.vps-view-nav button{display:flex;align-items:center;gap:12px;min-height:50px;padding:12px 20px;border:0;border-right:1px solid #314561;background:transparent;color:#9eb3d0;font:600 12px var(--sans,Arial,sans-serif);cursor:pointer}.vps-view-nav button span{font:10px var(--mono);color:#699de0}.vps-view-nav button[aria-current="page"]{background:#1b3c65;color:#e8f2ff;box-shadow:inset 0 -2px #77b3ff}.vps-view-nav button:focus-visible{outline:2px solid #9dc6fa;outline-offset:2px}[data-vps-overview-panel][hidden],[data-vps-derivatives-panel][hidden]{display:none!important}@media(max-width:600px){.vps-view-nav button{min-height:44px;padding:10px 12px;font-size:10px;gap:7px}}
.vp-reveal{position:relative;isolation:isolate;display:flex;flex-direction:column;overflow:hidden;background:#080e1b;border:1px solid #273953;color:#fff}
.vp-topline{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 24px;border-bottom:1px solid #92baff18;color:#7f96b9;font:9px/1.5 var(--mono);letter-spacing:3px}
.vp-topline>span:first-child{color:#b8c9e4;letter-spacing:4px}
.vp-atmosphere{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:radial-gradient(ellipse at 50% 76%,#2458a343,transparent 60%),radial-gradient(ellipse at 50% 120%,#509dff40,transparent 55%)}
.vp-orbit{position:absolute;width:145%;height:80%;left:-22.5%;top:54%;border-radius:50%;border-top:1px solid #85baff99;box-shadow:0 -2px 24px #4b9aff40,0 -35px 90px #417dce18;background:radial-gradient(ellipse at 50% 0,#2b65b326,transparent 60%)}
.vp-horizon{position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.9%,#85baff0d 50%,transparent 50.1%);opacity:.7}
.vp-identity{position:relative;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;padding:20px 24px 24px;text-align:center}
.vp-brand{display:flex;align-items:center;justify-content:center;gap:14px;color:#f2f6ff;font:400 clamp(24px,2.8vw,38px)/1.2 Arial,sans-serif;letter-spacing:-1.5px}
.vp-mark{position:relative;width:1.35em;height:.95em;overflow:hidden;display:block;flex:none}.vp-mark svg{display:block;width:100%;height:100%;overflow:visible}
body.v2-dashboard h2.vp-pro{font:900 clamp(84px,9.5vw,132px)/.87 var(--sans,Arial,sans-serif)!important;letter-spacing:-.045em!important;padding-right:.045em;margin:10px 0 14px!important;color:#b9d7ff!important;background:linear-gradient(180deg,#fff 5%,#d9e7fc 28%,#80aff0 68%,#315887 100%);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 12px 40px #1f6fcc28)}
.vp-caption{display:flex;align-items:center;gap:20px;width:min(100%,540px);justify-content:center}.vp-caption>span{height:1px;flex:1;background:linear-gradient(90deg,transparent,#5f83b8)}.vp-caption>span:last-child{transform:rotate(180deg)}body.v2-dashboard .vp-caption p{margin:0!important;color:#a9c3e6!important;font:400 clamp(12px,1.2vw,15px)/1.5 var(--sans,Arial,sans-serif)!important;letter-spacing:1px;white-space:nowrap}
body.v2-dashboard .vps-thesis{max-width:740px;margin:14px auto 0!important;color:#d3e1f4!important;font:400 clamp(14px,1.3vw,17px)/1.55 var(--sans,Arial,sans-serif)!important;text-align:center}
.vp-bottom{position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 24px;border-top:1px solid #92baff20;background:#060c15aa;z-index:2}
.vp-status{display:flex;align-items:center;gap:9px;color:#d0e4ff;font:700 10px/1.5 var(--mono);letter-spacing:2px;white-space:nowrap}.vp-status i{height:5px;width:5px;border-radius:50%;background:#74b5ff;box-shadow:0 0 12px #4c9af8}
.vps-chip{padding:3px 9px;border:1px solid #4a6a96;border-radius:2px;color:#a9c3e6;font:9px/1.5 var(--mono);letter-spacing:1.5px;white-space:nowrap}
body.v2-dashboard .vp-bottom p{margin:0 auto 0 0!important;color:#8fa3c0!important;font:11px/1.5 var(--sans,Arial,sans-serif)!important}.vps-docs-link{color:#8fb7ee!important;font:10px var(--mono);letter-spacing:1.5px;text-decoration:none;white-space:nowrap}.vps-docs-link:hover{text-decoration:underline}
@media(max-width:900px){.vp-bottom p{display:none}.vps-docs-link{margin-left:auto}}
@media(max-width:600px){.vp-topline{padding:12px 14px;font-size:8px;letter-spacing:1px}.vp-topline>span:first-child{letter-spacing:2px}.vp-brand{font-size:26px;gap:10px;letter-spacing:-1px}body.v2-dashboard h2.vp-pro{font-size:clamp(84px,28vw,118px)!important;margin:8px 0 10px!important}.vp-identity{padding:20px 16px 22px}.vp-caption{gap:12px}body.v2-dashboard .vp-caption p{font-size:11px!important;letter-spacing:.3px;white-space:normal;text-align:center}.vp-caption>span{display:none}body.v2-dashboard .vps-thesis{font-size:14px!important}.vp-bottom{flex-wrap:wrap;padding:10px 14px;gap:8px 12px}.vp-orbit{top:58%;width:200%;left:-50%}}
@media(prefers-reduced-motion:reduce){.vps-index button{transition:none}}
`;
    style.textContent += VPS_COMPACT_CSS;
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
