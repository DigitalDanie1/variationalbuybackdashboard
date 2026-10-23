/* Nested Pro market reference page. Mount after Pro and before navigation grouping. */
(function () {
  'use strict';
  var data = window.PRO_DERIVATIVES;
  var state = { query: '', asset: '', unit: 'usd', sort: 'adv' };

  function safe(value) {
    return String(value).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function value(n) {
    return state.unit === 'usd'
      ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'B'
      : n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  function contractEmoji(r) {
    var bySymbol = {
      SR3:'🏦', ZQ:'🏛️', ZN:'📜', ZT:'📜', ZF:'📜', TN:'📜', ZB:'📜', UB:'📜', YIY:'🔁', YIW:'🔁',
      FEU3:'🇪🇺', FST3:'🇪🇺', FGBL:'🇩🇪', FGBM:'🇩🇪', FGBS:'🇩🇪', FGBX:'🇩🇪', FOAT:'🇫🇷', FBTP:'🇮🇹',
      ES:'📈', MES:'📈', NQ:'⚡', MNQ:'⚡', RTY:'📊', M2K:'📊', YM:'🏭', MYM:'🏭',
      CL:'🛢️', HO:'⛽', RB:'⛽', NG:'🔥',
      GC:'🥇', MGC:'🥇', QO:'🥇', SI:'🥈', SIL:'🥈', HG:'🔌', MHG:'🔌', PL:'⚙️',
      '6E':'🇪🇺', '6J':'🇯🇵', '6B':'🇬🇧', '6A':'🇦🇺', '6C':'🇨🇦', '6S':'🇨🇭', '6N':'🇳🇿', '6M':'🇲🇽', '6L':'🇧🇷',
      ZS:'🫘', XK:'🫘', ZM:'🫘', ZL:'🫘', ZC:'🌽', XC:'🌽', LE:'🐄', GF:'🐄', ZW:'🌾', ZO:'🌾', HE:'🐖'
    };
    return bySymbol[r.symbol] || '📊';
  }
  function ranked(metric) {
    var field = metric + (state.unit === 'usd' ? 'B' : 'Contracts');
    return data.rows.slice().sort(function(a,b) { return b[field] - a[field] || a.symbol.localeCompare(b.symbol); });
  }
  function page() {
    return '<div class="vd-page"><header class="vd-heading"><div class="vd-eyebrow">VARIATIONAL / MARKET REFERENCE</div>' +
      '<h2>Top 50 derivatives<span>Volume &amp; open interest.</span></h2>' +
      '<p>Compare activity and outstanding positions across traditional markets. A scale reference for Variational’s longer-term opportunity.</p>' +
      '<div class="vd-coverage"><b>CME GROUP + EUREX FUTURES</b><span>50 selected contracts · includes European rates · not a global top-50 ranking</span><a href="pro-derivatives-data.json" download>Source data ↓</a></div></header>' +
      '<div class="vd-summary"><div><span>COVERED UNIVERSE</span><strong>50 <small>contracts</small></strong><p>6 asset classes · rates, FX, equities &amp; commodities</p></div>' +
      '<div><span>#1 BY DAILY VOLUME</span><strong data-vd-leader-adv></strong><p data-vd-leader-adv-name></p></div>' +
      '<div><span>#1 BY OPEN INTEREST</span><strong data-vd-leader-oi></strong><p data-vd-leader-oi-name></p></div></div>' +
      '<div class="vps-benchmark-toolbar"><div class="vd-rank-control"><span>Rank by</span><div class="vd-rank-tabs" role="group" aria-label="Ranking order"><button type="button" data-vd-sort="adv" aria-pressed="true">Volume</button><button type="button" data-vd-sort="oi" aria-pressed="false">Open interest</button></div></div><label>Search<input type="search" aria-label="Search derivatives" data-vd-search placeholder="Contract, symbol or asset class"></label>' +
      '<label>Asset class<select aria-label="Asset class" data-vd-asset><option value="">All asset classes</option>' + ['Rates','FX','Equity index','Metals','Energy','Agriculture'].map(function(a) { return '<option>'+safe(a)+'</option>'; }).join('') + '</select></label>' +
      '<label>Display<select aria-label="Display" data-vd-unit><option value="usd">USD B · reference notional</option><option value="contracts">Original contract counts</option></select></label></div>' +
      '<div class="vps-benchmark-period"><span>ADV: SEP 2026 · OI: 30 SEP 2026 · USD MARKS: CME 21 OCT / EUR 30 SEP</span><span data-vd-count aria-live="polite"></span></div>' +
      '<div class="vps-benchmark-scroll" tabindex="0" aria-label="Scrollable top 50 derivatives table"><table class="vps-benchmark-table vd-table"><caption>Volume and OI ranks cover all 50 selected contracts and stay fixed when filtering. USD figures are reference-notional estimates, not observed dollar turnover.</caption>' +
      '<thead><tr><th scope="col">Vol. rank</th><th scope="col">OI rank</th><th scope="col">Contract</th><th scope="col">Ticker</th><th scope="col">Asset class</th><th scope="col" data-vd-adv-heading>ADV (USD B)*</th><th scope="col" data-vd-oi-heading>OI (USD B)*</th><th scope="col">Variational scenario</th></tr></thead><tbody data-vd-rows></tbody></table></div>' +
      '<div class="vd-pro-link"><div><b>Translate market scale into a Variational scenario.</b><p>Use any contract to model assumed market share, margin and gross revenue. These benchmarks are external markets, not live Pro listings.</p></div><button type="button" data-vd-overview>Explore Variational Pro →</button></div>' +
      '<details class="vps-methodology"><summary>Sources, notional conversion and coverage</summary>' +
      '<p><b>*Reference notional.</b> September contract ADV / 30 September OI × contract principal, face value or selected settlement. CME non-rates use 21 October 2026 reference settlements; Eurex rates use principal or face value translated at the 30 September ECB EUR/USD rate (1.1355). Eurex ADV divides September volume by 22 trading days; its 1 October daily file reports 30 September OI as “previous day.” This is not observed dollar turnover, market value, DV01 or delta-adjusted exposure.</p>' +
      '<p><b>Coverage:</b> 50 selected CME Group and Eurex futures, including 3-month EURIBOR, 3-month €STR, Bund, Bobl, Schatz, Buxl, OAT and BTP. The rank is within this selection, not a global top 50. ICE, OTC and options are outside the dataset; the EURIBOR and €STR rows are specifically Eurex contracts, not all-venue market totals. FX rows are currency futures, not the entire OTC pair market. Contract sizes and risk profiles differ, so rankings do not establish risk equivalence.</p>' +
      '<p><a href="'+safe(data.sources.adv)+'" target="_blank" rel="noopener">CME ADV ↗</a> · <a href="'+safe(data.sources.oi)+'" target="_blank" rel="noopener">CME OI ↗</a> · <a href="'+safe(data.sources.eurexAdv)+'" target="_blank" rel="noopener">Eurex Sep volume ↗</a> · <a href="'+safe(data.sources.eurexOi)+'" target="_blank" rel="noopener">Eurex Sep 30 OI ↗</a> · <a href="'+safe(data.sources.eurexSpecs)+'" target="_blank" rel="noopener">Bond specs ↗</a> · <a href="'+safe(data.sources.eurexStirSpecs)+'" target="_blank" rel="noopener">STIR specs ↗</a> · <a href="'+safe(data.sources.eurUsd)+'" target="_blank" rel="noopener">ECB FX ↗</a> · <a href="pro-derivatives-data.json" target="_blank" rel="noopener">All inputs ↗</a></p></details></div>';
  }
  function wire(section) {
    function render() {
      var adv = ranked('adv'), oi = ranked('oi'), ranks = {adv:{},oi:{}};
      adv.forEach(function(r,i) { ranks.adv[r.symbol] = i+1; });
      oi.forEach(function(r,i) { ranks.oi[r.symbol] = i+1; });
      var list = (state.sort === 'adv' ? adv : oi).filter(function(r) {
        return (!state.asset || state.asset === r.asset) && (r.name+' '+r.symbol+' '+r.asset+' '+r.venue).toLowerCase().indexOf(state.query.toLowerCase().trim()) >= 0;
      });
      ['adv','oi'].forEach(function(metric) {
        var leader = metric === 'adv' ? adv[0] : oi[0];
        section.querySelector('[data-vd-leader-'+metric+']').textContent = value(leader[metric+(state.unit==='usd'?'B':'Contracts')]);
        section.querySelector('[data-vd-leader-'+metric+'-name]').textContent = leader.name+' · '+leader.symbol+(state.unit==='contracts'?' · contracts':' · reference notional');
        var heading = section.querySelector('[data-vd-'+metric+'-heading]');
        heading.textContent = metric.toUpperCase()+(state.unit==='usd'?' (USD B)*':' (contracts)');
        heading.setAttribute('aria-sort', state.sort===metric?'descending':'none');
      });
      section.querySelector('[data-vd-count]').textContent = list.length+' / '+data.rows.length+' contracts';
      section.querySelectorAll('[data-vd-sort]').forEach(function(b) { b.setAttribute('aria-pressed', String(b.dataset.vdSort===state.sort)); });
      section.querySelector('[data-vd-rows]').innerHTML = list.length ? list.map(function(r) {
        return '<tr><td class="'+(state.sort==='adv'?'vd-active-rank':'')+'">'+ranks.adv[r.symbol]+'</td><td class="'+(state.sort==='oi'?'vd-active-rank':'')+'">'+ranks.oi[r.symbol]+'</td><th scope="row"><span class="vd-contract"><span class="vd-contract-emoji" aria-hidden="true">'+contractEmoji(r)+'</span><span>'+safe(r.name)+' <small class="vd-venue">'+safe(r.venue)+'</small></span></span></th><td><span class="vd-ticker">'+safe(r.symbol)+'</span></td><td><span class="vd-asset">'+safe(r.asset)+'</span></td><td class="vd-number">'+value(r[state.unit==='usd'?'advB':'advContracts'])+'</td><td class="vd-number">'+value(r[state.unit==='usd'?'oiB':'oiContracts'])+'</td><td><button type="button" data-vd-model="'+safe(r.symbol)+'" aria-label="Model '+safe(r.name)+' ('+safe(r.symbol)+')">Model →</button></td></tr>';
      }).join('') : '<tr><td colspan="8">No matching contracts. Change the search or asset filter.</td></tr>';
    }
    section.addEventListener('input', function(e) {
      if (e.target.matches('[data-vd-search]')) { state.query=e.target.value; render(); }
    });
    section.addEventListener('change', function(e) {
      if(e.target.matches('[data-vd-asset]')) { state.asset=e.target.value; render(); }
      if(e.target.matches('[data-vd-unit]')) { state.unit=e.target.value; render(); }
    });
    section.addEventListener('click', function(e) {
      var sort = e.target.closest('[data-vd-sort]'), model = e.target.closest('[data-vd-model]');
      if(sort) { state.sort=sort.dataset.vdSort; render(); section.querySelector('.vps-benchmark-scroll').scrollTop=0; }
      if(model) {
        showTab('variational-pro');
        document.dispatchEvent(new CustomEvent('var:pro-model-market', { detail:{ symbol:model.dataset.vdModel } }));
      }
      if(e.target.closest('[data-vd-overview]')) document.dispatchEvent(new CustomEvent('var:pro-view', { detail:{ view:'overview' } }));
    });
    render();
  }
  function boot() {
    var pro=document.querySelector('[data-tg="variational-pro"]');
    if(!pro || !data || !data.rows.length || pro.querySelector('[data-vps-derivatives-panel]')) return;
    var section=document.createElement('div');
    section.setAttribute('data-vps-derivatives-panel',''); section.hidden=true; section.innerHTML=page();
    pro.appendChild(section); wire(section);
    var style=document.createElement('style'); style.textContent=CSS; document.head.appendChild(style);
    function followProHash() {
      if(location.hash==='#derivatives') {
        showTab('variational-pro',{push:false});
        document.dispatchEvent(new CustomEvent('var:pro-view',{detail:{view:'derivatives'}}));
      } else if(location.hash==='#variational-pro') {
        document.dispatchEvent(new CustomEvent('var:pro-view',{detail:{view:'overview'}}));
      }
    }
    followProHash();
    window.addEventListener('hashchange',followProHash);
  }
  var CSS = `
.vd-page{display:flex;flex-direction:column;gap:16px;padding:24px;border:1px solid #2d415c;background:radial-gradient(ellipse at 100% 0,#17345c40,transparent 55%),#080e1b;color:#e0eafa;min-width:0}
.vd-heading{display:block!important;text-align:left!important;padding:0!important;margin:0!important;border:0!important;background:none!important}.vd-eyebrow{font:9px/1.5 var(--mono);letter-spacing:2px;color:#9eb7d8}body.v2-dashboard .vd-heading h2{font:650 clamp(30px,3.1vw,42px)/1.1 var(--sans,Arial,sans-serif)!important;letter-spacing:-.04em!important;color:#f2f6ff!important;margin:12px 0!important}.vd-heading h2 span{display:inline-block;margin-left:18px;font-size:.57em;letter-spacing:-.02em;color:#8dbbfa}.vd-heading>p{max-width:780px;font:13px/1.75 var(--sans,Arial,sans-serif)!important;color:#aebfd7!important;margin:0!important}.vd-coverage{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin-top:12px;font:10px/1.6 var(--mono);color:#a6b8d0}.vd-coverage b{font-size:8px;letter-spacing:1px;padding:6px 9px;border:1px solid #3d587b;background:#13243a;color:#c4d8f2}
.vd-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #344861;background:#101c2c}.vd-summary>div{padding:12px 14px;min-width:0}.vd-summary>div+div{border-left:1px solid #344861}.vd-summary span{font:9px/1.5 var(--mono);letter-spacing:.5px;color:#9eb9db}.vd-summary strong{display:block;font:600 clamp(21px,2.2vw,29px)/1.1 var(--sans,Arial,sans-serif);letter-spacing:-.04em;margin:7px 0;color:#e6f0ff;white-space:nowrap;font-variant-numeric:tabular-nums}.vd-summary strong small{font:12px var(--sans,Arial,sans-serif);letter-spacing:0;color:#a9bfdb}.vd-summary p{font:11px/1.7 var(--sans,Arial,sans-serif)!important;color:#9eb4d1!important;margin:0!important}.vd-table-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px}.vd-table-top>a,.vd-pro-link>a{font:11px/1.6 var(--mono);color:#bdd7ff;text-decoration:none}.vd-coverage>a{margin-left:auto;color:#bdd7ff;text-decoration:none}.vd-page .vps-benchmark-toolbar label,.vd-rank-control{min-width:140px}.vd-rank-control{display:flex;flex:1;flex-direction:column;gap:10px;font:10px/1.5 var(--mono);color:#b9cce4}.vd-rank-tabs{display:flex;box-sizing:border-box;min-height:42px;gap:4px;padding:4px;border:1px solid #3c5270;background:#0d1726}.vd-rank-tabs button{padding:6px 9px;font:600 11px var(--sans,Arial,sans-serif);border:1px solid transparent;color:#a9bdd7;background:transparent;cursor:pointer}.vd-rank-tabs button[aria-pressed="true"]{background:#24466f;border-color:#5f8bc4;color:#f0f6ff}.vd-page button:focus-visible,.vd-page a:focus-visible,.vd-page .vps-benchmark-scroll:focus-visible{outline:2px solid #9dc6fa;outline-offset:3px}
.vd-page .vps-benchmark-toolbar{margin:0;padding:16px}.vd-page .vps-benchmark-scroll{max-height:740px;min-width:0}.vd-table{min-width:840px;font-variant-numeric:tabular-nums}.vd-table td:nth-child(4){font-family:var(--sans,Arial,sans-serif);text-align:left;white-space:normal}.vd-table td:nth-child(5),.vd-table td:nth-child(6){font-family:var(--mono);text-align:right;white-space:nowrap}.vd-table td:nth-child(1),.vd-table td:nth-child(2){font:11px var(--mono);color:#849ab8}.vd-table td.vd-active-rank{color:#b4d6ff;background:#1a304b66;font-weight:700}.vd-table th small{font-size:10px}.vd-table th[data-vd-adv-heading],.vd-table th[data-vd-oi-heading]{text-align:right}.vd-table th[aria-sort="descending"]{color:#e1efff;background:#264369}.vd-page .vps-methodology p{font:12px/1.8 var(--sans,Arial,sans-serif)!important;color:#aebfd7!important;margin:14px 0 0!important}.vd-pro-link{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px;border:1px solid #3b5577;background:#122238}.vd-pro-link b{font:600 14px/1.6 var(--sans,Arial,sans-serif);color:#dceaff}.vd-pro-link p{max-width:760px;font:12px/1.75 var(--sans,Arial,sans-serif)!important;color:#aebfd7!important;margin:8px 0 0!important}.vd-pro-link>button{flex-shrink:0;padding:12px 16px;border:1px solid #6589b9;background:#1e3d64;color:#bdd7ff;font:11px/1.6 var(--mono);cursor:pointer}
@media(max-width:900px){.vd-page{padding:24px}.vd-summary>div{padding:18px}.vd-summary strong{font-size:clamp(18px,3vw,26px)}.vd-pro-link{align-items:flex-start;flex-direction:column}.vd-table{min-width:840px}}
@media(max-width:600px){.vd-page{padding:20px 14px;gap:18px}body.v2-dashboard .vd-heading h2{font-size:32px!important}.vd-heading h2 span{display:block;margin:6px 0 0;font-size:22px}.vd-summary{grid-template-columns:1fr}.vd-summary>div+div{border-left:0;border-top:1px solid #344861}.vd-summary>div{padding:16px}.vd-summary strong{font-size:28px;margin:8px 0}.vd-page .vps-benchmark-toolbar label,.vd-rank-control{min-width:100%}.vd-rank-tabs button{padding:8px 14px}.vd-coverage>a{margin-left:0}.vd-pro-link{padding:18px}.vd-page .vps-benchmark-scroll{max-height:620px}}
.vps-show-derivatives .vps-view-nav{margin-bottom:0;border-bottom-color:#263953;background:#0b111c}.vps-show-derivatives .vps-view-nav button{min-height:48px}.vps-show-derivatives .vd-page{border-top:0;background:#0b111c}.vd-table{min-width:1020px}.vd-table thead th:nth-child(1),.vd-table thead th:nth-child(2){width:82px}.vd-table thead th:nth-child(3){min-width:210px}.vd-table thead th:nth-child(4){width:88px}.vd-table thead th:nth-child(5){width:125px}.vd-table thead th:nth-child(6),.vd-table thead th:nth-child(7){min-width:150px}.vd-table tbody th{font:600 12px/1.5 var(--sans,Arial,sans-serif);color:#e2ebf6;white-space:nowrap}.vd-ticker{display:inline-flex;align-items:center;min-width:40px;justify-content:center;padding:5px 8px;border:1px solid #466589;background:#152740;color:#a9cbf6;font:10px/1 var(--mono);letter-spacing:.3px}.vd-asset{display:inline-block;padding:4px 7px;border:1px solid #2c405a;color:#a9b9ce;font:9px/1.2 var(--sans,Arial,sans-serif);white-space:nowrap}.vd-table td:nth-child(5){text-align:left}.vd-table td.vd-number{font:11px var(--mono);color:#d5e4f7;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.vd-table tbody tr:hover .vd-ticker{border-color:#82b5f2;color:#e4f1ff}.vd-table tbody tr:hover th{color:#fff}.vd-page .vps-benchmark-scroll{border-color:#344861}.vd-page .vd-table caption{font:10px/1.6 var(--sans,Arial,sans-serif);color:#9eafc4}.vd-page .vd-table button{background:#1c3554;border-color:#5277a4;color:#cde1fa}.vd-page .vd-table button:hover{background:#2a4e79;border-color:#83b4ed}
 .vd-contract{display:inline-flex;align-items:center;gap:9px}.vd-contract-emoji{display:inline-flex;flex:none;align-items:center;justify-content:center;width:24px;font:18px/1 "Apple Color Emoji","Segoe UI Emoji",sans-serif}.vd-venue{display:block;margin-top:2px;color:#8fa7c6;font:9px/1.3 var(--mono);letter-spacing:.4px}
`;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
