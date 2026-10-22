/* Pro explainer. Mount before tge-groups.js arranges the navigation. */
(function () {
  'use strict';
  var TAB = 'variational-pro';
  var TITLE = 'Variational Pro';

  // Product descriptions follow the official About Pro documentation.
  var DOCS = 'https://docs.variational.io/pro/about-pro';
  var SCREENS = ['Overview', 'Product design', 'Market context', 'Workflow comparison', 'Execution workflow', 'Risk & controls', 'Institutional scale', 'Derivatives benchmarks', 'Margin & revenue'];

  // BIS values are USD millions. OCC Table 13 reports USD millions as of June 30, 2026.
  // Peer OTC = forwards + swaps + OTC options + credit derivatives; exchange-traded and spot FX excluded.
  var MARKET = {
    notionalMillions: 844577771.490,
    period: '31 DEC 2025',
    bis: 'https://data.bis.org/topics/OTC_DER/BIS,WS_OTC_DERIV2,1.0/H.A.A.A.5J.A.5J.A.TO1.TO1.A.A.3.C',
    occ: 'https://www.occ.gov/publications-and-resources/publications/quarterly-report-on-bank-trading-and-derivatives-activities/files/pub-derivatives-quarterly-qtr2-2026.pdf#page=20',
    peers: [
      { name: 'PNC Bank N.A.', components: [38143,629136,60487,14716] },
      { name: 'State Street Bank & Trust Co.', components: [3286077,57086,14363,0] },
      { name: 'Wells Fargo Bank N.A.', components: [3134875,10254240,2571379,169616] },
      { name: 'JPMorgan Chase Bank N.A.', components: [13810328,35180344,11568333,1649556] }
    ]
  };
  function trillions(m) { return '$' + (m / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'B'; }
  function peerTotal(p) { return p.components.reduce(function (a,b) { return a+b; },0); }
  function scaleScreen() {
    var shares = [0.01,0.1,0.5,1], selected = 0.1;
    return slide(5, 'INSTITUTIONAL SCALE', 'A fractional share.<br><em>Institutional notional scale.</em>',
      'What if Variational supported a fraction of the global OTC outstanding notional?',
      '<div class="vps-share-controls" role="group" aria-label="Hypothetical global notional share">' + shares.map(function (v) { return '<button type="button" data-vps-share="' + v + '" aria-pressed="' + (v===selected) + '">' + v + '%</button>'; }).join('') + '</div>' +
      '<div class="vps-scale-result"><div><span>HYPOTHETICAL VARIATIONAL NOTIONAL</span><strong data-vps-notional>' + trillions(MARKET.notionalMillions * selected / 100) + '</strong></div><p data-vps-scale-summary aria-live="polite"></p></div>' +
      '<div class="vps-scale-chart" role="group" aria-label="Outstanding OTC notional, common linear scale in billions of US dollars"><div class="vps-scale-axis"><span>USD BILLIONS</span><span>0 — 65,000B · LINEAR SCALE</span></div><div class="vps-scale-row is-scenario"><span>Variational <small>HYPOTHETICAL</small></span><div><i data-vps-scale-bar></i></div><b data-vps-scale-value></b></div>' +
      MARKET.peers.map(function (p) { var v=peerTotal(p); return '<div class="vps-scale-row"><span>' + p.name + '</span><div><i style="width:' + (v/65000000*100).toFixed(4) + '%"></i></div><b>' + trillions(v) + '</b></div>'; }).join('') + '</div>' +
      '<div class="vps-scale-context"><p><b>Scale reference, not bank equivalence.</b> Protocol-supported notional is compared with bank OTC books. Reporting dates, netting and consolidation differ; this does not imply equal revenue, capital, risk or valuation.</p><p><b>Long-term scenario, not a forecast.</b> The global denominator includes traditional asset classes beyond Pro’s documented crypto focus. Adoption, regulation, product coverage and liquidity determine what is reachable.</p></div>' +
      '<div class="vps-data-sources"><a href="' + MARKET.bis + '" target="_blank" rel="noopener">BIS · global OTC · Dec 2025 ↗</a><a href="' + MARKET.occ + '" target="_blank" rel="noopener">OCC · bank OTC · Jun 2026 · Table 13 ↗</a><span>Formula: global notional × selected share. Bank OTC = forwards + swaps + OTC options + credit.</span></div>',
      'Independent scenario analysis using BIS/OCC data; not a Variational forecast or an official market-share target.');
  }

  function benchmarksScreen() {
    return slide(7, 'DERIVATIVES BENCHMARKS', 'Derivatives benchmarks.<em> USD billions.</em>',
      '50 selected CME Group futures across rates, FX, equities and commodities. A scale reference for Variational’s longer-term opportunity.',
      '<div class="vps-benchmark-toolbar"><label>Search<input type="search" aria-label="Search" data-vps-search placeholder="Contract, symbol or asset class"></label><label>Asset class<select aria-label="Asset class" data-vps-asset><option value="">All asset classes</option>' + ['Rates','FX','Equity index','Metals','Energy','Agriculture'].map(function (a) { return '<option>' + a + '</option>'; }).join('') + '</select></label><label>Display<select aria-label="Display" data-vps-unit><option value="usd">USD B · reference notional</option><option value="contracts">Original contract counts</option></select></label><label>Rank by<select aria-label="Rank by" data-vps-sort><option value="adv">Average daily volume</option><option value="oi">Open interest</option></select></label></div>' +
      '<div class="vps-benchmark-period"><span>ADV: SEP 2026 · OI: 30 SEP 2026</span><span data-vps-row-count></span></div><div class="vps-benchmark-scroll" tabindex="0" aria-label="Scrollable derivatives benchmark table"><table class="vps-benchmark-table"><caption>Rank within the selected 50-contract universe. USD figures are reference-notional estimates, not observed dollar turnover.</caption><thead><tr><th scope="col">Rank</th><th scope="col">Contract / symbol</th><th scope="col">Asset class</th><th scope="col" data-vps-adv-heading>ADV (USD B)*</th><th scope="col" data-vps-oi-heading>OI (USD B)*</th><th scope="col">Model</th></tr></thead><tbody data-vps-benchmark-rows></tbody></table></div>' +
      '<details class="vps-methodology"><summary>Sources, notional conversion and coverage</summary><p><b>*Reference notional.</b> September contract ADV / month-end OI × contract size × an explicitly selected 21 October 2026 CME settlement. Rates use contract principal or Treasury face value. The same reference price is applied across expiries. This is not actual daily dollar turnover, DV01 or delta-adjusted exposure.</p><p><b>Coverage:</b> 50 selected CME Group futures, not the global top 50. OTC, options, ICE and Eurex are excluded. FX rows are futures on currency pairs, not the entire OTC pair market. Traditional ADV uses exchange trading days; crypto’s 24-hour figures use calendar days.</p><p><a href="https://www.cmegroup.com/daily_bulletin/monthly_volume/Web_ADV_Report_CMEG.pdf" target="_blank" rel="noopener">CME monthly ADV ↗</a> · <a href="https://www.cmegroup.com/daily_bulletin/monthly_volume/Web_OI_Report_CMEG.pdf" target="_blank" rel="noopener">CME month-end OI ↗</a> · <a href="https://www.cmegroup.com/market-data/daily-bulletin.html" target="_blank" rel="noopener">CME reference settlements ↗</a> · <a href="pro-derivatives-data.json" target="_blank" rel="noopener">All inputs and conversions ↗</a></p></details>',
      'Source observations: CME Group, September 2026. Reference marks: 21 October 2026. These are external benchmarks, not live Pro listings.');
  }
  function economicsScreen() {
    return slide(8, 'MARGIN & REVENUE', 'Volume drives revenue.<br><em>Open interest drives collateral.</em>',
      'An adjustable Variational opportunity model, based on a selected external market benchmark.',
      '<div class="vps-economics-inputs"><label>Benchmark market<select aria-label="Benchmark market" data-vps-model-market></select></label><label>Assumed capture (%)<input aria-label="Assumed capture (%)" data-vps-model="share" type="number" min="0" max="100" step="0.01" value="0.1"></label><label>Initial margin per side (%)<input aria-label="Initial margin per side (%)" data-vps-model="margin" type="number" min="0" max="100" step="1" value="10"></label><label>Gross revenue capture (bps)<input aria-label="Gross revenue capture (bps)" data-vps-model="bps" type="number" min="0" max="1000" step="0.1" value="1"></label><label>Trading days / year<input aria-label="Trading days per year" data-vps-model="days" type="number" min="1" max="366" step="1" value="252"></label></div>' +
      '<p class="vps-model-baseline" data-vps-model-baseline></p><div class="vps-economic-metrics" aria-live="polite"><div><span>CAPTURED ADV · USD B</span><b data-vps-economic="adv"></b><small>Benchmark ADV × capture rate</small></div><div><span>CAPTURED OI · USD B</span><b data-vps-economic="oi"></b><small>Benchmark OI × capture rate</small></div><div><span>INITIAL MARGIN / SIDE · USD B</span><b data-vps-economic="margin"></b><small>Captured OI × assumed margin rate</small></div><div><span>BOTH SIDES’ MARGIN · USD B</span><b data-vps-economic="bilateral"></b><small>Symmetric gross assumption: 2 × margin</small></div><div><span>GROSS DAILY REVENUE · USD B</span><b data-vps-economic="daily"></b><small>Captured ADV × assumed bps / 10,000</small></div><div><span>GROSS ANNUAL REVENUE · USD B</span><b data-vps-economic="annual"></b><small>Daily revenue × selected trading days</small></div></div>' +
      '<div class="vps-model-assumptions"><b>Illustrative economics · Pro is not live</b><p>Capture share, margin and revenue bps are user assumptions, not documented Pro fee schedules, required margins or revenue guidance. Revenue is a gross fee-equivalent before costs or allocations; it is not net income, OLP spread earnings or token-holder distributions.</p><p>The margin model assumes equal initial-margin rates on both sides, without netting, offsets, variation margin, collateral haircuts or liquidation losses. Actual pool terms are negotiated and may be asymmetric. Reference notional is not a risk-equivalent measure.</p></div>',
      'Scenario only. No measured Pro revenue or collateral is implied. Select a market in the benchmarks table to load its inputs here.');
  }

  function slide(n, eyebrow, title, lead, content, foot) {
    return '<article class="vps-scr" data-scr="' + n + '" hidden aria-labelledby="vps-title-' + n + '">' +
      '<header class="vps-heading"><span>VARIATIONAL PRO <i>/</i> ' + eyebrow + '</span>' +
      '<h3 id="vps-title-' + n + '">' + title + '</h3><p>' + lead + '</p></header>' +
      '<div class="vps-body">' + content + '</div><footer class="vps-foot"><span>' + foot + '</span><b>0' + (n === 6 ? 1 : n <= 5 ? n + 1 : n) + ' / 08</b></footer></article>';
  }
  function productScreen() {
    return slide(6, 'DOCUMENTED PRODUCT DESIGN', 'Configurable derivatives.<br><em>Bilateral by design.</em>',
      'Pro is designed for advanced and institutional OTC traders, including non-linear derivatives and block execution.',
      '<div class="vps-product-grid"><section><span class="vps-mini">01 / PRICE DISCOVERY</span><h4>RFQ-based execution</h4><p>Request quotes from all eligible makers or a chosen whitelist. Participants can also supply bids and offers; makers may respond through the UI or API.</p><a href="https://docs.variational.io/variational-protocol/key-concepts/trading-via-rfq" target="_blank" rel="noopener">RFQ mechanics ↗</a></section>' +
      '<section><span class="vps-mini">02 / SETTLEMENT STRUCTURE</span><h4>Counterparty-specific pools</h4><p>Each pair can have one or more pools recording positions and collateral. Pool assets remain separate; positions cannot be transferred or netted across pools.</p><a href="https://docs.variational.io/variational-protocol/key-concepts/settlement-pools" target="_blank" rel="noopener">Settlement pools ↗</a></section>' +
      '<section><span class="vps-mini">03 / AGREED TERMS</span><h4>Configurable risk parameters</h4><p>Agree terms before execution: eligible counterparties, pool-level margin, liquidation thresholds and penalties. Price and terms both form part of the quote.</p><a href="' + DOCS + '" target="_blank" rel="noopener">Pro capabilities ↗</a></section></div>' +
      '<div class="vps-product-pools"><span class="vps-mini">PRO / BILATERAL POOL STRUCTURE</span><div class="vps-pool-map"><div class="vps-pool-line"><span>Your institution</span><div><b>Pool A</b><small>Positions + collateral</small></div><span>Counterparty A</span></div><div class="vps-pool-line"><span>Your institution</span><div><b>Pool B</b><small>Positions + collateral</small></div><span>Counterparty B</span></div></div><p>Separate pools isolate positions and collateral. A counterparty pair may maintain additional pools with different agreed terms.</p></div>' +
      '<div class="vps-product-status"><span>DEVELOPMENT STATUS</span><p>Pro remains pre-launch in the official documentation. The screens describe the documented design, not a live trading interface or a committed launch date.</p></div>',
      'Sources: About Pro, Trading via RFQ and Settlement Pools. General protocol pools may be multilateral; Pro is described as bilateral.');
  }

  function screens() {
    return productScreen() + slide(1, 'MARKET SCALE', 'Institutional OTC markets.<br><em>Scale. Structure. Participants.</em>',
      'OTC derivatives are core infrastructure for institutional risk transfer.',
      '<div class="vps-market-size"><span>GLOBAL OTC DERIVATIVES · NOTIONAL OUTSTANDING</span><strong>$' + (MARKET.notionalMillions/1000).toLocaleString('en-US', { maximumFractionDigits: 0 }) + '<small>USD BILLIONS</small></strong><div><span>31 DEC 2025</span><span>+20.7% YEAR ON YEAR</span></div></div>' +
      '<div class="vps-market-participants"><div class="vps-participants-title"><span class="vps-mini">HOW THE MARKET CONNECTS</span><h4>Three roles.<br>One trade lifecycle.</h4><p>Pro applies an RFQ model to configurable bilateral derivatives.</p></div><ol><li><span>01 / INSTITUTIONAL TAKER</span><b>Defines the exposure</b><p>Chooses the asset and structure, requests quotes and evaluates the offered terms.</p></li><li><span>02 / MARKET MAKER</span><b>Competes on price &amp; terms</b><p>Returns a bid or offer, agrees pool parameters and posts counterparty collateral.</p></li><li><span>03 / VARIATIONAL PROTOCOL</span><b>Administers the cleared trade</b><p>Records positions in the pool and manages margin, applicable funding and liquidations.</p></li></ol></div>' +
      '<div class="vps-market-scenarios">' + [0.01,0.1,1].map(function(v) { return '<div><span>' + v + '% OF GLOBAL NOTIONAL</span><b>' + (v===0.01 ? '$' + (MARKET.notionalMillions*v/100/1000).toFixed(1) + 'B' : trillions(MARKET.notionalMillions*v/100)) + '</b><p>Hypothetical supported notional</p></div>'; }).join('') + '</div>' +
      '<div class="vps-scale-context"><p><b>External market context.</b> Interest rate, FX, equity, commodity and credit derivatives. This broad benchmark is not Pro’s current addressable market.</p><p><b>Variational’s entry point.</b> Configurable crypto OTC derivatives for advanced and institutional traders. Capturing traditional markets would require a broader product and regulatory footprint.</p></div>' +
      '<div class="vps-data-sources"><a href="' + MARKET.bis + '" target="_blank" rel="noopener">Source: BIS · global OTC notional ↗</a><span>Notional is the contract reference amount; it is not capital invested, market value or revenue.</span></div>',
      'BIS semiannual data, end-2025. Shares are illustrative assumptions, not forecasts. Independent analysis; not a market-share target from the Pro documentation.') +
    slide(2, 'WORKFLOW COMPARISON', 'The operational cost<br><em>of an OTC trade.</em>',
      'The official Pro documentation illustrates a 12-step manual process and a six-step Pro workflow.',
      '<div class="vps-legacy-columns"><section><div class="vps-legacy-title"><h4>Traditional OTC</h4><span>12 DOCUMENTED STEPS</span></div><ol class="vps-detailed-steps">' +
      [
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
      ].map(function (x) { return '<li><b>' + x[0] + '</b><p>' + x[1] + '</p></li>'; }).join('') + '</ol></section>' +
      '<section class="vps-legacy-pro"><div class="vps-legacy-title"><h4>Variational Pro</h4><span>6 DOCUMENTED STEPS</span></div><ol class="vps-detailed-steps">' +
      [
        ['Investment mandate','Choose the altcoin option to trade.'],
        ['Build the RFQ','Log into Pro and define the desired structure in the UI.'],
        ['Competitive quotes','Eligible market makers receive the RFQ and can quote through the UI or API; the requester can select specific makers.'],
        ['Select a counterparty','Evaluate price, margin terms and counterparty reputation, then accept a quote or decline to trade.'],
        ['Bilateral collateral','Both counterparties are prompted to deposit into their on-chain escrow / settlement pool.'],
        ['Clear &amp; administer','After verified deposits, clearing is recorded automatically. The protocol manages margin, applicable funding and liquidations.']
      ].map(function (x) { return '<li><b>' + x[0] + '</b><p>' + x[1] + '</p></li>'; }).join('') + '</ol><div class="vps-legacy-note"><b>What changes</b><p>Competitive quoting, bilateral on-chain collateral and integrated lifecycle management.</p><p>The example does not establish that ISDA, KYC or other legal requirements are waived for every user.</p></div></section></div>',
      'Source: About Pro · illustrative workflow, not a universal onboarding checklist or a measured speed benchmark.') +
    slide(3, 'TRADE FLOW', 'From price discovery<br><em>to on-chain clearing.</em>',
      'You choose the quote. Both sides fund the pool. The protocol manages the cleared trade.',
      '<ol class="vps-execution" aria-label="Trade execution workflow"><li class="vps-execution-request"><span class="vps-execution-label">01 / REQUEST</span><h4>Specify the trade.</h4><div class="vps-request-ticket"><span>YOUR DESK</span><b>One RFQ</b><p>Asset · structure · terms</p></div><p>Send to the market or a selected set of counterparties.</p></li>' +
      '<li class="vps-execution-quotes"><span class="vps-execution-label">02 / COMPARE &amp; CHOOSE</span><h4>Evaluate competing quotes.</h4><ul class="vps-maker-list"><li><span>Market maker A</span><small>Quote received</small></li><li class="is-selected"><span>Market maker B</span><small>Selected ✓</small></li><li><span>Market maker C</span><small>Quote received</small></li></ul><p>Compare price, margin terms and counterparty reputation. Accept an offer or decline to trade.</p></li>' +
      '<li class="vps-execution-pool"><span class="vps-execution-label">03 / FUND &amp; CLEAR</span><h4>Post bilateral collateral.</h4><div class="vps-pool-funders"><span>Your desk</span><span>Selected maker</span></div><div class="vps-settlement"><span>↓ &nbsp; BOTH DEPOSIT COLLATERAL &nbsp; ↓</span><b>Settlement pool</b><small>On-chain · bilateral</small></div><p>Following maker confirmation and verified deposits, the trade is booked in the agreed pool.</p></li></ol>' +
      '<div class="vps-protocol-detail"><p><b>Before clearing:</b> the protocol RFQ flow includes maker last look. Collateral moves after the maker confirms the agreed trade and smart-contract approvals.</p><a href="https://docs.variational.io/variational-protocol/key-concepts/trading-via-rfq" target="_blank" rel="noopener">Protocol RFQ sequence ↗</a></div>' +
      '<div class="vps-managed"><div><span class="vps-execution-label">04 / AFTER CLEARING</span><h4>Protocol-managed lifecycle.</h4><p>Ongoing management under the agreed trade terms.</p></div><ul><li><span aria-hidden="true">✓</span> Tracks margin</li><li><span aria-hidden="true">✓</span> Settles funding, if applicable</li><li><span aria-hidden="true">✓</span> Handles liquidations</li></ul></div>',
      'Illustrative maker selection; no live quotes shown. Product design per official docs. Pro is not live yet.') +
    slide(4, 'RISK & CONTROLS', 'Execution controls.<br><em>Collateral discipline.</em>',
      'A structured framework for price discovery, trade operations and bilateral collateral.',
      '<div class="vps-controls"><div class="vps-controls-head"><span>CONTROL AREA</span><span>TRADITIONAL OTC FRICTION</span><span>PROTOCOL DESIGN</span></div>' +
      '<section class="vps-control-row"><div class="vps-control-name"><span>01 / MARKET STRUCTURE</span><h4>Liquidity access</h4></div><div><span class="vps-control-mobile">OTC FRICTION</span><p>Manual onboarding and fragmented quoting can restrict the set of available counterparties.</p></div><div class="vps-control-design"><span class="vps-control-mobile">PROTOCOL DESIGN</span><h4>Competitive RFQ distribution</h4><p>Request competing quotes from multiple market makers, or restrict requests to selected counterparties.</p></div></section>' +
      '<section class="vps-control-row"><div class="vps-control-name"><span>02 / OPERATIONS</span><h4>Lifecycle management</h4></div><div><span class="vps-control-mobile">OTC FRICTION</span><p>Manual collateral checks, funding settlements and margin calls create operational dependencies.</p></div><div class="vps-control-design"><span class="vps-control-mobile">PROTOCOL DESIGN</span><h4>Rules-based trade administration</h4><p>Following clearing, the protocol tracks margin, settles applicable funding and handles liquidations.</p></div></section>' +
      '<section class="vps-control-row"><div class="vps-control-name"><span>03 / COLLATERAL</span><h4>Counterparty exposure</h4></div><div><span class="vps-control-mobile">OTC FRICTION</span><p>Collateral transferred directly to a dealer can introduce credit exposure and asymmetric margin arrangements.</p></div><div class="vps-control-design"><span class="vps-control-mobile">PROTOCOL DESIGN</span><h4>Bilateral settlement pools</h4><p>Both counterparties post collateral to their agreed pool. Positions and assets are isolated across pools; margin and liquidation parameters are agreed in the quote.</p></div></section></div>' +
      '<aside class="vps-risk-note"><span>RISK CONSIDERATIONS</span><p>These controls do not eliminate risk. Smart-contract, market, liquidity and counterparty risks remain; outcomes depend on collateral adequacy and the agreed trade parameters.</p></aside>',
      'Design overview based on official Pro documentation. Pro is not live yet.') + scaleScreen() + benchmarksScreen() + economicsScreen();
  }

  function navBar() {
    return '<div class="vp-coming vps-nav">' +
      '<button type="button" class="vps-btn" data-vps="prev" aria-label="Previous screen">◀</button>' +
      '<span class="vp-coming-label" data-vps-label>PRODUCT OVERVIEW</span>' +
      '<span class="vps-dots">' + SCREENS.map(function (n, i) {
        return '<button type="button" data-vps-go="' + i + '" aria-label="' + n + '"' + (i ? '' : ' class="on"') + '></button>';
      }).join('') + '</span>' +
      '<a class="vps-src" href="' + DOCS + '" target="_blank" rel="noopener noreferrer">docs ↗</a>' +
      '<span class="vp-coming-index" data-vps-index>01 / 09</span>' +
      '<button type="button" class="vps-btn vps-start" data-vps="next" aria-label="Next screen">EXPLORE PRO →</button></div>';
  }

  function wireScreens(section) {
    var cur = 0;
    var scrs = [section.querySelector('.vp-title-screen')].concat([].slice.call(section.querySelectorAll('.vps-scr')));
    var label = section.querySelector('[data-vps-label]'), index = section.querySelector('[data-vps-index]');
    var next = section.querySelector('.vps-start');
    function go(i) {
      cur = (i + scrs.length) % scrs.length;
      scrs.forEach(function (el, k) { el.hidden = k !== cur; });
      section.querySelectorAll('[data-vps-go]').forEach(function (d, k) { d.classList.toggle('on', k === cur); });
      label.textContent = cur ? SCREENS[cur].toUpperCase() : 'PRODUCT OVERVIEW';
      index.textContent = ('0' + (cur + 1)).slice(-2) + ' / 0' + scrs.length;
      next.textContent = cur ? (cur === scrs.length - 1 ? 'OVERVIEW ↺' : 'NEXT →') : 'EXPLORE PRO →';
      section.querySelectorAll('[data-vps-go]').forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'step' : 'false'); });
      section.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
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
    var tableState = { query: '', asset: '', unit: 'usd', sort: 'adv' };
    function moneyB(n) { var digits = n > 0 && n < 1 ? Math.min(10, Math.max(2, 2 - Math.floor(Math.log10(n)))) : 2; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + 'B'; }
    function safe(v) { return String(v).replace(/[&<>"']/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
    function renderBenchmarks() {
      var list = benchmarkData.filter(function(r) { return (!tableState.asset || r.asset === tableState.asset) && (r.name+' '+r.symbol+' '+r.asset).toLowerCase().indexOf(tableState.query.toLowerCase()) >= 0; });
      var field = tableState.sort + (tableState.unit === 'usd' ? 'B' : 'Contracts');
      list.sort(function(a,b) { return b[field]-a[field]; });
      section.querySelector('[data-vps-row-count]').textContent = list.length + ' / ' + benchmarkData.length + ' markets';
      section.querySelector('[data-vps-adv-heading]').textContent = tableState.unit === 'usd' ? 'ADV (USD B)*' : 'ADV (contracts)';
      section.querySelector('[data-vps-oi-heading]').textContent = tableState.unit === 'usd' ? 'OI (USD B)*' : 'OI (contracts)';
      section.querySelector('[data-vps-benchmark-rows]').innerHTML = list.length ? list.map(function(r,i) { return '<tr><td>'+(i+1)+'</td><th scope="row">'+safe(r.name)+'<small>'+safe(r.symbol)+'</small></th><td>'+safe(r.asset)+'</td><td>'+ (tableState.unit === 'usd' ? moneyB(r.advB) : r.advContracts.toLocaleString('en-US')) +'</td><td>'+ (tableState.unit === 'usd' ? moneyB(r.oiB) : r.oiContracts.toLocaleString('en-US')) +'</td><td><button type="button" data-vps-load-market="'+safe(r.symbol)+'" aria-label="Model '+safe(r.name)+'">Use →</button></td></tr>'; }).join('') : '<tr><td colspan="6">No matching contracts. Change the search or asset filter.</td></tr>';
    }
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
    section.addEventListener('input', function(e){
      if (e.target.matches('[data-vps-search]')){tableState.query=e.target.value;renderBenchmarks();}
      if(e.target.matches('[data-vps-model]'))renderEconomics();
    });
    section.addEventListener('change',function(e){
      if(e.target.matches('[data-vps-asset]')){tableState.asset=e.target.value;renderBenchmarks();}
      if(e.target.matches('[data-vps-unit]')){tableState.unit=e.target.value;renderBenchmarks();}
      if(e.target.matches('[data-vps-sort]')){tableState.sort=e.target.value;renderBenchmarks();}
      if(e.target.matches('[data-vps-model-market]'))renderEconomics();
    });
    section.addEventListener('click',function(e){var b=e.target.closest && e.target.closest('[data-vps-load-market]');if(b){marketSelect.value=b.dataset.vpsLoadMarket;renderEconomics();go(SCREENS.indexOf('Margin & revenue'));}});
    renderBenchmarks(); renderEconomics();

    section.addEventListener('click', function (e) {
      var shareButton = e.target.closest && e.target.closest('[data-vps-share]');
      if (shareButton) updateScale(+shareButton.dataset.vpsShare);
    });
    section.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-vps],[data-vps-go]');
      if (!b) return;
      if (b.hasAttribute('data-vps-go')) go(+b.getAttribute('data-vps-go'));
      else go(cur + (b.getAttribute('data-vps') === 'next' ? 1 : -1));
    });
    document.addEventListener('keydown', function (e) {
      if (section.classList.contains('tg-hide') || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
  }

  var VPS_CSS = `
.vp-title-screen[hidden],.vps-scr[hidden]{display:none!important}
.tsec[data-tg="variational-pro"]{scroll-margin-top:105px}
.vps-scr{box-sizing:border-box;display:flex;flex-direction:column;gap:38px;min-height:680px;padding:42px;background:radial-gradient(ellipse at 100% 100%,#17345c55,transparent 65%),#080e1b;color:#fff;border:1px solid #273953}
.vps-heading{display:block!important;text-align:left!important;padding:0!important;border:0!important;background:none!important}.vps-heading>span{font:9px/1.5 var(--mono);letter-spacing:2px;color:#a3badb}.vps-heading i{font-style:normal;margin:0 12px;color:#4c9af8}
body.v2-dashboard .vps-heading h3{font:700 clamp(32px,4.2vw,62px)/1.06 var(--sans,Arial,sans-serif)!important;letter-spacing:-.045em!important;color:#f4f7ff!important;margin:24px 0 18px!important}.vps-heading h3 em{font-style:normal;color:#7db4ff}
.vps-heading>p{font:14px/1.65 var(--sans,Arial,sans-serif)!important;color:#9dafc9!important;margin:0!important;max-width:640px}
.vps-body{display:flex;flex-direction:column;justify-content:center;gap:24px;flex:1;min-width:0}
.vps-mini{font:9px/1.5 var(--mono);letter-spacing:2px;color:#8ba9cf}
body.v2-dashboard .vps-body h4{font:600 22px/1.3 var(--sans,Arial,sans-serif)!important;color:#e3edfc!important;margin:12px 0!important;letter-spacing:-.025em}
.vps-body p{font:13px/1.7 var(--sans,Arial,sans-serif)!important;color:#9dafc9!important;margin:0!important}
.vps-market{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:36px;padding-bottom:22px}.vps-market-word{font:800 clamp(80px,12vw,170px)/1 var(--sans,Arial,sans-serif);letter-spacing:-.07em;color:#79b0ff}.vps-market>div{border-left:1px solid #2e4666;padding-left:34px}
.vps-audience{display:flex;flex-wrap:wrap;gap:12px}.vps-audience span{padding:12px 18px;border:1px solid #2a4261;border-radius:2px;font:11px/1.5 var(--mono);color:#bfd3ed}
.vps-lifecycle{border:1px solid #304561;background:#0b1422}.vps-lifecycle-head,.vps-lifecycle-row{display:grid;grid-template-columns:minmax(110px,.55fr) minmax(0,1fr) minmax(0,1fr)}
.vps-lifecycle-head{align-items:stretch}.vps-lifecycle-head>span{align-self:end;padding:22px 20px;font:9px/1.6 var(--mono);letter-spacing:1px;color:#91a6c2}.vps-lifecycle-head>div{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 24px;border-left:1px solid #304561}.vps-lifecycle-head>div>span{font:10px/1.5 var(--mono);letter-spacing:1px;color:#acb9cd}.vps-lifecycle-head strong{white-space:nowrap;font:600 44px/1 var(--sans,Arial,sans-serif);letter-spacing:-2px;color:#bcc8d9}.vps-lifecycle-head small{font:10px var(--mono);letter-spacing:0;color:#92a7c4}.vps-lifecycle-head .is-pro{background:#132b48}.vps-lifecycle-head .is-pro>span,.vps-lifecycle-head .is-pro strong{color:#98c7ff}
.vps-lifecycle-row{border-top:1px solid #304561}.vps-phase{padding:24px 20px}.vps-phase>span{font:10px var(--mono);color:#88b9fa}body.v2-dashboard .vps-phase h4{font-size:15px!important;margin:10px 0 0!important}.vps-before,.vps-after{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:24px;border-left:1px solid #304561;min-width:0}.vps-after{background:#10243b}.vps-before{justify-content:center}body.v2-dashboard .vps-lifecycle-row .vps-before h4,body.v2-dashboard .vps-lifecycle-row .vps-after h4{font-size:18px!important;line-height:1.35!important;margin:0!important}.vps-lifecycle-row p{font-size:13px!important;line-height:1.6!important;max-width:48ch}.vps-benefit{font:9px/1.5 var(--mono);letter-spacing:1px;color:#98c7ff}.vps-step-ref{margin-top:auto;padding-top:4px;font:8px/1.5 var(--mono);letter-spacing:.6px;color:#8b9eb9}.vps-scr[data-scr="2"]{gap:28px}.vps-scr[data-scr="2"] .vps-body{justify-content:flex-start}.vps-scr[data-scr="2"] .vps-heading h3{font-size:clamp(32px,3.3vw,50px)!important}
@media(max-width:1000px){.vps-lifecycle-head,.vps-lifecycle-row{grid-template-columns:100px minmax(0,1fr) minmax(0,1fr)}.vps-lifecycle-head>div{align-items:flex-start;flex-direction:column}.vps-lifecycle-head>div,.vps-before,.vps-after{padding:20px}.vps-phase,.vps-lifecycle-head>span{padding:20px 12px}}
@media(max-width:680px){.vps-lifecycle-head,.vps-lifecycle-row{grid-template-columns:1fr}.vps-lifecycle-head>span{display:none}.vps-lifecycle-head{grid-template-columns:1fr 1fr}.vps-lifecycle-head>div{border-left:0;padding:16px}.vps-lifecycle-head>div+div{border-left:1px solid #304561}.vps-lifecycle-head>div>span{font-size:8px;letter-spacing:.5px}.vps-lifecycle-head strong{font-size:38px}.vps-phase{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#111d2e}body.v2-dashboard .vps-phase h4{font-size:14px!important;margin:0!important}.vps-before,.vps-after{padding:20px 16px;border-left:0}.vps-after{border-top:1px solid #304561}body.v2-dashboard .vps-lifecycle-row .vps-before h4,body.v2-dashboard .vps-lifecycle-row .vps-after h4{font-size:17px!important}.vps-before:before{content:"MANUAL OTC";font:8px/1.5 var(--mono);letter-spacing:1px;color:#a9b8ce}.vps-benefit:before{content:"PRO / "}.vps-scr[data-scr="2"] .vps-heading h3{font-size:32px!important}}
.vps-execution{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));list-style:none;padding:0;margin:0;gap:20px}.vps-execution>li{position:relative;display:flex;flex-direction:column;gap:18px;min-width:0;padding:24px;border:1px solid #3b5270;background:#0c1727}.vps-execution>li+li:before{content:"→";position:absolute;left:-18px;top:45%;font:18px var(--mono);color:#9dc7ff}.vps-execution-label{font:9px/1.6 var(--mono);letter-spacing:1px;color:#a7c9f6}body.v2-dashboard .vps-execution h4{font-size:20px!important;margin:0!important;line-height:1.3!important}.vps-execution>li>p{margin-top:auto!important;font-size:12px!important;line-height:1.65!important;color:#b6c5d9!important}.vps-request-ticket{display:flex;flex:1;min-height:142px;flex-direction:column;justify-content:center;gap:14px;padding:20px;border:1px solid #526b8c;background:#101f33}.vps-request-ticket>span{font:9px var(--mono);letter-spacing:1px;color:#b5c8e2}.vps-request-ticket>b{font:600 30px/1.2 var(--sans,Arial,sans-serif);color:#e7f1ff}.vps-request-ticket p{font-size:11px!important;color:#bed1ec!important}.vps-maker-list{display:grid;list-style:none;margin:0;padding:0;gap:8px}.vps-maker-list li{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:14px 12px;border:1px solid #405570;background:#101d2e}.vps-maker-list span{font:500 12px/1.5 var(--sans,Arial,sans-serif);color:#d4e3f7}.vps-maker-list small{font:9px/1.5 var(--mono);color:#afc1db}.vps-maker-list .is-selected{border-color:#78b3ff;background:#18395f}.vps-maker-list .is-selected small{color:#b9daff}.vps-pool-funders{display:grid;grid-template-columns:1fr 1fr;gap:8px}.vps-pool-funders span{padding:12px 6px;text-align:center;border:1px solid #426b68;font:11px/1.5 var(--sans,Arial,sans-serif);color:#d4eee8}.vps-settlement{display:flex;flex:1;min-height:110px;flex-direction:column;justify-content:center;text-align:center;gap:12px;padding:16px 8px;border:1px solid #72d4b2;background:#102e2b}.vps-settlement>span{font:8px/1.5 var(--mono);letter-spacing:.3px;color:#a4dfcc}.vps-settlement>b{font:600 23px/1.3 var(--sans,Arial,sans-serif);color:#defff3}.vps-settlement>small{font:10px/1.5 var(--mono);color:#b5e0d3}.vps-managed{display:grid;grid-template-columns:1fr 1fr;gap:28px;padding:26px;border:1px solid #426c65;background:#0e2526}.vps-managed .vps-execution-label{color:#a2ddca}body.v2-dashboard .vps-managed h4{font-size:23px!important;margin:12px 0 8px!important;color:#e0fff4!important}.vps-managed p{font-size:12px!important;color:#b8d2cb!important}.vps-managed ul{list-style:none;display:grid;align-content:center;gap:14px;padding:0;margin:0}.vps-managed li{display:flex;gap:12px;font:13px/1.5 var(--sans,Arial,sans-serif);color:#d9f0e9}.vps-managed li>span{color:#97e5c9}.vps-scr[data-scr="3"]{gap:28px}.vps-scr[data-scr="3"] .vps-heading h3{font-size:clamp(32px,3.3vw,50px)!important}
@media(max-width:1100px){.vps-execution{gap:14px}.vps-execution>li{padding:18px;gap:16px}.vps-execution>li+li:before{left:-14px;font-size:14px}.vps-maker-list li{padding:12px 8px}.vps-maker-list span{font-size:11px}.vps-pool-funders{grid-template-columns:1fr}.vps-settlement>b{font-size:20px}}
@media(max-width:760px){.vps-execution{grid-template-columns:1fr;gap:26px}.vps-execution>li{padding:22px;gap:18px}.vps-execution>li+li:before{content:"↓";left:50%;top:-23px;font-size:18px}.vps-request-ticket{min-height:120px}.vps-pool-funders{grid-template-columns:1fr 1fr}.vps-managed{grid-template-columns:1fr;gap:24px;padding:22px}.vps-maker-list span{font-size:13px}.vps-maker-list small{font-size:10px}.vps-scr[data-scr="3"] .vps-heading h3{font-size:32px!important}}
.vps-pool-map{display:grid;gap:16px}.vps-pool-line{display:grid;grid-template-columns:1fr 1.5fr 1fr;align-items:center;gap:34px}.vps-pool-line>span{text-align:center;padding:18px 8px;border:1px solid #273a53;font:12px var(--sans,Arial,sans-serif);color:#bdcde4}.vps-pool-line>div{position:relative;text-align:center;padding:18px 10px;border:1px solid #568fdb;background:#142b48}.vps-pool-line>div:before,.vps-pool-line>div:after{content:"";position:absolute;top:50%;width:35px;height:1px;background:#568fdb}.vps-pool-line>div:before{right:100%}.vps-pool-line>div:after{left:100%}.vps-pool-line b{font:600 14px var(--sans,Arial,sans-serif);color:#deebff}.vps-pool-line small{display:block;margin-top:6px;font:10px var(--mono);color:#8ba9cf}
.vps-principles{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding-top:12px}.vps-principles b{display:block;font:600 13px var(--sans,Arial,sans-serif);color:#deebff;margin-bottom:8px}.vps-principles p{font-size:12px!important}
.vps-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;padding-top:20px;border-top:1px solid #263850;color:#667d9d;font:10px/1.6 var(--mono)}.vps-foot b{font-weight:400;color:#90aacd;white-space:nowrap}
.vps-nav{gap:12px 16px}.vps-btn{padding:10px 14px;border:1px solid #3e5d84;border-radius:2px;background:#13243a;color:#dceaff;font:600 10px var(--mono);cursor:pointer;letter-spacing:1px}.vps-btn:hover{border-color:#acd0ff}.vps-start{background:#355f94;border-color:#497ebd;color:#fff}
.vps-press{display:inline-flex;align-items:center;gap:16px;padding:20px 36px;border:1px solid #68a8ff;border-radius:2px;background:#0e1d32;color:#fff;font:700 22px/1 var(--mono);letter-spacing:.16em;cursor:pointer}.vps-press span{color:#68a8ff}.vps-press:hover{background:#254e80}
.vps-dots{display:flex;gap:8px}.vps-dots button{flex:none;width:9px;height:9px;min-width:0;min-height:0!important;padding:0;border:1px solid #6695d2;background:transparent;cursor:pointer}.vps-dots button.on{background:#78b2ff;border-color:#78b2ff}
.vps-src{color:#6695d2!important;font:9px var(--mono);letter-spacing:1px;text-decoration:none}.vps-nav .vp-coming-index{margin-left:auto}
@media(max-width:1000px){.vps-scr{padding:30px;gap:28px}.vps-flow-steps{grid-template-columns:1fr 1fr}.vps-flow-steps li:nth-child(3){border-left:0}.vps-flow-steps li:nth-child(n+3){border-top:1px solid #2a4261}.vps-market{gap:24px}.vps-market>div{padding-left:24px}}
@media(max-width:600px){.vps-scr{padding:25px 20px;min-height:630px;gap:28px}.vps-heading>span{font-size:7px;letter-spacing:1px}.vps-heading i{margin:0 5px}body.v2-dashboard .vps-heading h3{font-size:32px!important;margin-top:22px!important}.vps-heading>p{font-size:12px!important}.vps-market{grid-template-columns:1fr;gap:18px}.vps-market-word{font-size:110px}.vps-market>div{padding:18px 0 0;border-left:0;border-top:1px solid #2e4666}.vps-audience{gap:8px}.vps-audience span{font-size:9px;padding:9px 12px}.vps-compare{grid-template-columns:1fr;gap:12px}.vps-comparison{padding:20px}.vps-count{font-size:66px;margin:18px 0}.vps-flow-steps{grid-template-columns:1fr}.vps-flow-steps li+li{border-left:0;border-top:1px solid #2a4261}.vps-flow-steps li{padding:20px}body.v2-dashboard .vps-flow-steps h4{margin-top:14px!important}.vps-protocol{align-items:flex-start;flex-direction:column;gap:10px}.vps-pool-line{gap:12px;grid-template-columns:1fr 1.4fr 1fr}.vps-pool-line>span{font-size:10px;padding:18px 4px}.vps-pool-line>div{padding:16px 4px}.vps-pool-line>div:before,.vps-pool-line>div:after{width:13px}.vps-pool-line b{font-size:11px}.vps-pool-line small{display:none}.vps-principles{grid-template-columns:1fr;gap:20px}.vps-foot{font-size:8px;gap:14px}.vps-nav{padding:16px!important}.vps-src{display:none}.vps-nav .vp-coming-label{font-size:8px}.vps-press{font-size:16px;padding:16px 20px}}

/* Institutional presentation: restrained typography and explicit control descriptions. */
body.v2-dashboard .vps-heading h3{font-size:clamp(30px,3.2vw,46px)!important;line-height:1.12!important;letter-spacing:-.035em!important}.vps-heading h3 em{color:#a4bfdf}.vps-scr{background:#0b111c;border-color:#334052}.vps-body{justify-content:flex-start}.vps-heading>span{color:#9caec5}.vps-controls{border:1px solid #354358;background:#0d1623}.vps-controls-head,.vps-control-row{display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1fr) minmax(0,1.25fr)}.vps-controls-head{background:#131f30}.vps-controls-head>span{padding:17px 22px;font:9px/1.6 var(--mono);letter-spacing:1px;color:#b4c3d7}.vps-controls-head>span+span{border-left:1px solid #354358}.vps-control-row{border-top:1px solid #354358}.vps-control-row>div{padding:26px 22px;min-width:0}.vps-control-row>div+div{border-left:1px solid #354358}.vps-control-name>span{font:8px/1.6 var(--mono);letter-spacing:.7px;color:#9fb4ce}body.v2-dashboard .vps-control-name h4{font-size:18px!important;line-height:1.4!important;margin:12px 0 0!important}body.v2-dashboard .vps-control-design h4{font-size:16px!important;line-height:1.45!important;margin:0 0 10px!important;color:#dbe7f6!important}.vps-control-row p{font-size:13px!important;line-height:1.75!important;color:#b0bfd2!important}.vps-control-design{background:#132033}.vps-control-mobile{display:none}.vps-risk-note{display:grid;grid-template-columns:160px 1fr;gap:24px;padding:20px 22px;border-left:2px solid #8297b1;background:#101a28}.vps-risk-note>span{font:9px/1.7 var(--mono);letter-spacing:1px;color:#b6c5d8}.vps-risk-note>p{font-size:12px!important;line-height:1.7!important;color:#b5c2d4!important}.vps-scr[data-scr="4"]{gap:28px}.vps-request-ticket,.vps-maker-list .is-selected{background:#16253a;border-color:#6687b0}.vps-execution-label{color:#b2c4dc}.vps-settlement,.vps-managed{background:#132328;border-color:#5f7e85}.vps-settlement>b,.vps-managed li{color:#dcebed}.vps-settlement>span,.vps-managed .vps-execution-label,.vps-managed li>span{color:#a7c8cc}body.v2-dashboard .vps-managed h4{color:#dcebed!important}.vps-btn{letter-spacing:.5px}.vps-foot{color:#94a6bd}.vps-execution>li>p,.vps-heading>p{color:#b3c0d2!important}
@media(max-width:760px){.vps-controls-head{display:none}.vps-control-row{grid-template-columns:1fr}.vps-control-row>div{padding:20px}.vps-control-row>div+div{border-left:0;border-top:1px solid #2b394b}.vps-control-name{background:#131f30}.vps-control-mobile{display:block;font:8px/1.6 var(--mono);letter-spacing:1px;color:#9fb4ce;margin-bottom:12px}.vps-risk-note{grid-template-columns:1fr;gap:12px;padding:20px}.vp-caption p{white-space:normal;text-align:center}.vp-caption>span{display:none}}

.vps-market-size{padding:30px;border:1px solid #435776;background:#101e30}.vps-market-size>span,.vps-market-size>div,.vps-market-scenarios>div>span{font:9px/1.7 var(--mono);letter-spacing:1px;color:#afc4df}.vps-market-size>strong{display:flex;align-items:baseline;flex-wrap:wrap;gap:20px;margin:20px 0;font:600 clamp(64px,7.5vw,112px)/1 var(--sans,Arial,sans-serif);letter-spacing:-.05em;color:#e3efff}.vps-market-size small{font:11px var(--mono);letter-spacing:2px}.vps-market-size>div{display:flex;flex-wrap:wrap;gap:20px}.vps-market-scenarios{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #354358}.vps-market-scenarios>div{padding:24px}.vps-market-scenarios>div+div{border-left:1px solid #354358}.vps-market-scenarios b{display:block;margin:14px 0;font:600 36px/1.1 var(--sans,Arial,sans-serif);letter-spacing:-1px;color:#dceaff}.vps-market-scenarios p{font-size:11px!important}.vps-scale-context{display:grid;grid-template-columns:1fr 1fr;gap:26px}.vps-scale-context p{font-size:12px!important;line-height:1.7!important}.vps-scale-context b{color:#dce7f6;font-weight:600}.vps-data-sources{display:flex;flex-wrap:wrap;gap:12px 24px;font:9px/1.7 var(--mono);color:#9baec8}.vps-data-sources a{color:#b7d2f7!important;text-decoration:underline;text-underline-offset:4px}.vps-data-sources>span{flex-basis:100%}.vps-share-controls{display:flex;flex-wrap:wrap;gap:8px}.vps-share-controls button{padding:12px 22px;border:1px solid #4d6482;border-radius:2px;background:#101b2b;color:#c5d6ed;font:12px var(--mono);cursor:pointer}.vps-share-controls button[aria-pressed="true"]{background:#28486d;border-color:#9bbfe9;color:#fff}.vps-share-controls button:focus-visible{outline:2px solid #b4d5ff;outline-offset:3px}.vps-scale-result{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center;border-top:1px solid #354358;border-bottom:1px solid #354358;padding:24px 0}.vps-scale-result span{font:9px/1.7 var(--mono);letter-spacing:1px;color:#afc4df}.vps-scale-result strong{display:block;margin-top:12px;font:600 60px/1 var(--sans,Arial,sans-serif);letter-spacing:-.05em;color:#d6e8ff}.vps-scale-result p{font-size:14px!important;color:#ccdaec!important}.vps-scale-axis{display:flex;justify-content:space-between;gap:12px;margin-bottom:18px;font:8px/1.6 var(--mono);letter-spacing:.5px;color:#9aaecb}.vps-scale-row{display:grid;grid-template-columns:210px minmax(0,1fr) 72px;gap:16px;align-items:center;padding:12px 0}.vps-scale-row>span{font:12px/1.5 var(--sans,Arial,sans-serif);color:#c5d2e5}.vps-scale-row small{display:block;font:8px/1.7 var(--mono);color:#9abbe4}.vps-scale-row>div{height:14px;background:#162135;border-right:1px solid #405472}.vps-scale-row i{display:block;min-width:0;height:100%;background:#637e9e}.vps-scale-row b{font:11px var(--mono);text-align:right;color:#cad8eb;white-space:nowrap}.vps-scale-row.is-scenario i{background:#a2c9ff}.vps-scale-row.is-scenario>span,.vps-scale-row.is-scenario b{color:#c4deff}
@media(max-width:760px){.vps-market-size{padding:24px 20px}.vps-market-size>strong{font-size:66px}.vps-market-scenarios{grid-template-columns:1fr}.vps-market-scenarios>div+div{border-left:0;border-top:1px solid #354358}.vps-market-scenarios>div{padding:20px}.vps-scale-context,.vps-scale-result{grid-template-columns:1fr;gap:18px}.vps-scale-result strong{font-size:52px}.vps-scale-row{grid-template-columns:1fr 66px;gap:8px}.vps-scale-row>span{grid-column:1/-1}.vps-share-controls button{padding:12px 16px}.vps-scale-axis{font-size:7px}.vps-data-sources{font-size:8px}}

.vps-product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #354358}.vps-product-grid>section{display:flex;flex-direction:column;gap:16px;padding:24px;min-width:0}.vps-product-grid>section+section{border-left:1px solid #354358}body.v2-dashboard .vps-product-grid h4{font-size:19px!important;line-height:1.4!important;margin:0!important}.vps-product-grid p{font-size:12px!important;line-height:1.75!important}.vps-product-grid a,.vps-protocol-detail a{margin-top:auto;font:9px/1.6 var(--mono);color:#b6d0f4!important;text-decoration:underline;text-underline-offset:4px}.vps-product-pools{display:grid;gap:20px;padding:26px;border:1px solid #354358;background:#101b2b}.vps-product-pools>p{font-size:12px!important}.vps-product-status{display:grid;grid-template-columns:160px 1fr;gap:24px;padding:20px 22px;border-left:2px solid #8ba4c2;background:#111b29}.vps-product-status>span{font:9px/1.6 var(--mono);letter-spacing:1px;color:#b4c7de}.vps-product-status p{font-size:12px!important}.vps-protocol-detail{display:flex;align-items:center;gap:24px;padding:18px 22px;background:#111d2c;border-left:2px solid #7893b4}.vps-protocol-detail p{font-size:12px!important;line-height:1.7!important}.vps-protocol-detail b{color:#d2e1f4}.vps-protocol-detail a{flex:none;max-width:150px;margin-top:0}.vps-scr[data-scr="6"]{gap:28px}
@media(max-width:760px){.vps-product-grid{grid-template-columns:1fr}.vps-product-grid>section{padding:22px}.vps-product-grid>section+section{border-left:0;border-top:1px solid #354358}.vps-product-pools{padding:20px 14px}.vps-product-status{grid-template-columns:1fr;gap:12px}.vps-protocol-detail{flex-direction:column;align-items:flex-start;gap:12px}.vps-protocol-detail a{max-width:none}}

.vps-market-participants{display:grid;grid-template-columns:minmax(180px,.7fr) minmax(0,2.3fr);border:1px solid #354358;background:#0f1928}.vps-participants-title{padding:24px;border-right:1px solid #354358}.vps-participants-title h4{font-size:21px!important}.vps-participants-title p{font-size:12px!important}.vps-market-participants ol{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;padding:0;list-style:none}.vps-market-participants li{display:flex;flex-direction:column;gap:14px;padding:24px;min-width:0}.vps-market-participants li+li{border-left:1px solid #354358}.vps-market-participants li>span{font:8px/1.7 var(--mono);letter-spacing:.6px;color:#adc4df}.vps-market-participants li>b{font:600 16px/1.45 var(--sans,Arial,sans-serif);color:#d8e8fb}.vps-market-participants li>p{font-size:12px!important;line-height:1.75!important}.vps-scr[data-scr="1"]{gap:26px}.vps-scr[data-scr="1"] .vps-body{gap:20px}.vps-market-size{padding:24px 28px}.vps-market-size>strong{margin:16px 0;font-size:clamp(60px,6vw,88px)}
@media(max-width:1000px){.vps-market-participants{grid-template-columns:1fr}.vps-participants-title{border-right:0;border-bottom:1px solid #354358}.vps-participants-title h4 br{display:none}.vps-market-participants li{padding:20px}}
@media(max-width:760px){.vps-market-participants ol{grid-template-columns:1fr}.vps-market-participants li+li{border-left:0;border-top:1px solid #354358}.vps-market-size{padding:22px 20px}.vps-market-size>strong{font-size:60px}}

.vps-legacy-columns{display:grid;grid-template-columns:1fr 1fr;border:1px solid #354358}.vps-legacy-columns>section{padding:24px}.vps-legacy-pro{border-left:1px solid #354358;background:#111f31}.vps-legacy-title{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-bottom:20px;border-bottom:1px solid #354358}.vps-legacy-title h4{margin:0!important}.vps-legacy-title>span{font:9px var(--mono);color:#adc4df}.vps-detailed-steps{list-style:none;counter-reset:otc;padding:0;margin:0}.vps-detailed-steps li{position:relative;padding:18px 0 18px 36px;counter-increment:otc;border-bottom:1px solid #29384b}.vps-detailed-steps li:before{content:counter(otc,decimal-leading-zero);position:absolute;left:0;top:20px;font:10px var(--mono);color:#9abce8}.vps-detailed-steps b{font:600 14px/1.5 var(--sans,Arial,sans-serif);color:#deebfb}.vps-detailed-steps p{font-size:12px!important;line-height:1.75!important;margin-top:7px!important}.vps-legacy-note,.vps-model-assumptions{padding:22px;margin-top:24px;background:#172638;border-left:2px solid #89a8cc}.vps-legacy-note>b,.vps-model-assumptions>b{font:600 13px var(--sans,Arial,sans-serif);color:#d9e7fb}.vps-legacy-note p,.vps-model-assumptions p{font-size:12px!important;line-height:1.75!important;margin-top:12px!important}.vps-benchmark-toolbar,.vps-economics-inputs{display:flex;flex-wrap:wrap;gap:16px;padding:20px;border:1px solid #354358;background:#101c2c}.vps-benchmark-toolbar label,.vps-economics-inputs label{display:flex;flex:1;min-width:150px;flex-direction:column;gap:10px;font:10px/1.5 var(--mono);color:#b9cce4}.vps-benchmark-toolbar input,.vps-benchmark-toolbar select,.vps-economics-inputs input,.vps-economics-inputs select{box-sizing:border-box;width:100%;min-height:42px;padding:10px;border:1px solid #4d6481;border-radius:2px;background:#0b1320;color:#e2edfc;font:12px var(--sans,Arial,sans-serif);color-scheme:dark}.vps-benchmark-toolbar input:focus-visible,.vps-benchmark-toolbar select:focus-visible,.vps-economics-inputs input:focus-visible,.vps-economics-inputs select:focus-visible{outline:2px solid #9dc6fa;outline-offset:2px}.vps-economics-inputs input[aria-invalid="true"]{border-color:#ef9f9f}.vps-benchmark-period{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font:9px var(--mono);color:#a4bbd8}.vps-benchmark-scroll{max-height:640px;overflow:auto;border:1px solid #354358;scrollbar-color:#506987 #111b29}.vps-benchmark-table{width:100%;border-collapse:separate;border-spacing:0;min-width:720px;font:12px/1.5 var(--sans,Arial,sans-serif);color:#d4e0f1}.vps-benchmark-table caption{text-align:left;padding:16px 18px;background:#111d2d;font-size:11px;color:#aebfd5}.vps-benchmark-table thead th{position:sticky;top:0;z-index:1;background:#1b2a3e;color:#bdd1ec;font:10px/1.5 var(--mono);white-space:nowrap}.vps-benchmark-table td,.vps-benchmark-table th{text-align:left;padding:14px 18px;border-bottom:1px solid #29384b}.vps-benchmark-table td:nth-child(4),.vps-benchmark-table td:nth-child(5){font-family:var(--mono);white-space:nowrap;text-align:right}.vps-benchmark-table th small{display:block;font:9px/1.6 var(--mono);color:#8fafda;margin-top:3px}.vps-benchmark-table tbody tr:hover{background:#16263d}.vps-benchmark-table button{padding:7px 10px;border:1px solid #47678c;background:#1a304b;color:#cce1ff;font:10px var(--mono);cursor:pointer;white-space:nowrap}.vps-methodology{border:1px solid #354358;padding:18px 22px}.vps-methodology summary{font:12px/1.6 var(--sans,Arial,sans-serif);color:#dce9fb;cursor:pointer}.vps-methodology p{font-size:12px!important;margin-top:16px!important}.vps-methodology a{color:#b6d1f7!important;text-decoration:underline}.vps-economic-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #354358;border-left:1px solid #354358}.vps-economic-metrics>div{padding:24px;border-bottom:1px solid #354358;border-right:1px solid #354358;background:#101c2c;min-width:0}.vps-economic-metrics span{font:8px/1.7 var(--mono);letter-spacing:.5px;color:#b0c7e5}.vps-economic-metrics b{display:block;margin:16px 0;font:600 clamp(22px,2.5vw,36px)/1.2 var(--sans,Arial,sans-serif);letter-spacing:-.03em;color:#e2efff;overflow-wrap:anywhere}.vps-economic-metrics small{display:block;font:10px/1.6 var(--sans,Arial,sans-serif);color:#9db2cf}.vps-model-baseline{font-size:12px!important}.vps-scr[data-scr="7"],.vps-scr[data-scr="8"]{gap:26px}.vps-market-size>strong{font-size:clamp(48px,6vw,82px)}
@media(max-width:760px){.vps-legacy-columns{grid-template-columns:1fr}.vps-legacy-pro{border-left:0;border-top:1px solid #354358}.vps-legacy-columns>section{padding:20px}.vps-economic-metrics{grid-template-columns:1fr 1fr}.vps-economic-metrics>div{padding:18px}.vps-benchmark-toolbar,.vps-economics-inputs{padding:16px}.vps-benchmark-toolbar label,.vps-economics-inputs label{min-width:130px}.vps-benchmark-scroll{max-height:560px}.vps-benchmark-table td,.vps-benchmark-table th{padding:12px}.vps-market-size>strong{font-size:50px}}@media(max-width:400px){.vps-economic-metrics{grid-template-columns:1fr}}

.vps-scr[data-scr="7"]{padding:28px;gap:18px}.vps-scr[data-scr="7"] .vps-heading h3{font-size:32px!important;line-height:1.15!important;margin:14px 0 12px!important}.vps-scr[data-scr="7"] .vps-heading>p{font-size:12px!important;max-width:900px}.vps-scr[data-scr="7"] .vps-body{gap:16px}.vps-benchmark-toolbar{padding:16px;gap:14px}.vps-benchmark-table td,.vps-benchmark-table th{padding:11px 14px}.vps-benchmark-table caption{padding:12px 14px}@media(max-width:600px){.vps-scr[data-scr="7"]{padding:22px 18px}.vps-scr[data-scr="7"] .vps-heading h3{font-size:28px!important}}
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
    section.innerHTML = '<div class="vp-reveal vp-title-screen">' +
      '<div class="vp-topline"><span>VARIATIONAL</span><span>INSTITUTIONAL OTC DERIVATIVES</span></div>' +
      '<div class="vp-atmosphere" aria-hidden="true"><div class="vp-orbit"></div><div class="vp-horizon"></div></div>' +
      '<div class="vp-identity"><div class="vp-brand"><span class="vp-mark"><svg viewBox="320 450 1360 960" aria-hidden="true"><defs><filter id="vp-mark-color" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .298 0 0 0 0 .608 0 0 0 0 .973 0 0 2 0 -.3"/></filter></defs><image href="variational-logo.png" width="2000" height="2000" filter="url(#vp-mark-color)"/></svg></span><span>Variational</span></div>' +
      '<h2 class="vp-pro">PRO</h2><div class="vp-caption"><span></span><p>Configurable execution. On-chain settlement.</p><span></span></div><button class="vps-press" type="button" data-vps="next">EXPLORE PRO <span>→</span></button></div>' +
      '<div class="vp-bottom"><span class="vp-status"><i></i> COMING SOON</span><p>Infrastructure for advanced derivatives trading.</p><span class="vp-edition">PRODUCT OVERVIEW</span></div></div>' + screens() + navBar();
    main.appendChild(section);
    wireScreens(section);

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
.vp-reveal{position:relative;isolation:isolate;display:flex;flex-direction:column;min-height:680px;min-height:max(680px,calc(100svh - 170px));overflow:hidden;background:#080e1b;border:1px solid #273953;color:#fff}
.vp-topline{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 32px;border-bottom:1px solid #92baff18;color:#7f96b9;font:9px/1.5 var(--mono);letter-spacing:3px}
.vp-topline>span:first-child{color:#b8c9e4;letter-spacing:4px}
.vp-atmosphere{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:radial-gradient(ellipse at 50% 76%,#2458a343,transparent 60%),radial-gradient(ellipse at 50% 120%,#509dff40,transparent 55%)}
.vp-orbit{position:absolute;width:145%;height:80%;left:-22.5%;top:54%;border-radius:50%;border-top:1px solid #85baff99;box-shadow:0 -2px 24px #4b9aff40,0 -35px 90px #417dce18;background:radial-gradient(ellipse at 50% 0,#2b65b326,transparent 60%)}
.vp-horizon{position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.9%,#85baff0d 50%,transparent 50.1%);opacity:.7}
.vp-identity{position:relative;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;padding:42px 24px 70px}
.vp-brand{display:flex;align-items:center;justify-content:center;gap:14px;color:#f2f6ff;font:400 clamp(28px,4.3vw,64px)/1.2 Arial,sans-serif;letter-spacing:-2px}
.vp-mark{position:relative;width:1.35em;height:.95em;overflow:hidden;display:block;flex:none}.vp-mark svg{display:block;width:100%;height:100%;overflow:visible}
body.v2-dashboard h2.vp-pro{font:900 clamp(140px,23vw,340px)/.87 var(--sans,Arial,sans-serif)!important;letter-spacing:-.045em!important;padding-right:.045em;margin:24px 0 34px!important;color:#b9d7ff!important;background:linear-gradient(180deg,#fff 5%,#d9e7fc 28%,#80aff0 68%,#315887 100%);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 12px 40px #1f6fcc28)}
.vp-caption{display:flex;align-items:center;gap:20px;width:min(100%,540px);justify-content:center}.vp-caption>span{height:1px;flex:1;background:linear-gradient(90deg,transparent,#5f83b8)}.vp-caption>span:last-child{transform:rotate(180deg)}.vp-caption p{margin:0!important;color:#a9c3e6!important;font:400 clamp(13px,1.5vw,18px)/1.5 var(--sans,Arial,sans-serif)!important;letter-spacing:1px;white-space:nowrap}
.vp-bottom{position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:26px 32px;border-top:1px solid #92baff20;background:#060c15aa;z-index:2}
.vp-status{display:flex;align-items:center;gap:9px;color:#d0e4ff;font:700 10px/1.5 var(--mono);letter-spacing:2px;white-space:nowrap}.vp-status i{height:5px;width:5px;border-radius:50%;background:#74b5ff;box-shadow:0 0 12px #4c9af8}
.vp-bottom p{margin:0!important;color:#8a9db8!important;font:11px/1.5 var(--sans,Arial,sans-serif)!important}.vp-edition{color:#536b8b;font:8px/1.5 var(--mono);letter-spacing:2px;white-space:nowrap}
@media(min-width:1600px){body.v2-dashboard h2.vp-pro{font-size:clamp(340px,23vw,470px)!important}.vp-reveal{min-height:800px}}
@media(max-width:900px){.vp-reveal{min-height:630px}.vp-topline,.vp-bottom{padding:22px}.vp-edition{display:none}.vp-brand{font-size:clamp(28px,5vw,48px)}body.v2-dashboard h2.vp-pro{font-size:clamp(140px,24vw,230px)!important}.vp-identity{padding:65px 20px 80px}}
@media(max-width:600px){.vp-reveal{min-height:max(570px,calc(100svh - 185px))}.vp-topline{padding:20px 16px;font-size:7px;letter-spacing:1px}.vp-topline>span:first-child{letter-spacing:2px}.vp-brand{font-size:34px;gap:10px;letter-spacing:-1.5px}body.v2-dashboard h2.vp-pro{font-size:clamp(115px,34vw,200px)!important;margin:25px 0 32px!important}.vp-identity{padding:70px 18px 90px}.vp-caption{gap:12px}.vp-caption p{font-size:12px!important;letter-spacing:.3px}.vp-bottom{flex-direction:column;align-items:center;padding:22px 12px;gap:10px}.vp-bottom p{font-size:10px!important}.vp-orbit{top:58%;width:200%;left:-50%}}
`;
    style.textContent += '.vps-nav{display:flex;align-items:center;flex-wrap:wrap;padding:18px 24px;background:#0a1220;border:1px solid #273953;color:#b7ccea}.vps-nav .vp-coming-label{font:700 10px var(--mono);letter-spacing:1px}.vps-nav .vp-coming-index{font:10px var(--mono);color:#6695d2}.vps-btn:focus-visible,.vps-dots button:focus-visible{outline:2px solid #acd0ff;outline-offset:4px}.vp-identity>.vps-press{position:relative;left:auto;bottom:auto;transform:none;margin-top:32px;padding:16px 28px;font-size:20px;letter-spacing:3px;animation:none;box-shadow:0 0 24px #4c9af822}.vp-identity>.vps-press:hover,.vp-identity>.vps-press:focus-visible{transform:none}.vp-identity{padding-bottom:48px}.vps-scr{box-sizing:border-box}@media(max-width:600px){.vp-identity>.vps-press{font-size:15px;padding:14px 20px;margin-top:28px}.vp-identity{padding:54px 18px 56px}.vps-nav{gap:12px}.vps-nav .vp-coming-label{font-size:8px}.vps-btn{font-size:9px;padding:8px}.vps-dots{gap:5px}.vps-dots button{width:8px;height:8px}}@media(prefers-reduced-motion:reduce){.vps-start,.vps-press{animation:none}}';
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
