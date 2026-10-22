/* Dedicated market reference page. Mount after Pro and before navigation grouping. */
(function () {
  'use strict';
  var TAB = 'derivatives';
  var TITLE = 'Top 50 Derivatives';
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
      : n.toLocaleString('en-US');
  }
  function ranked(metric) {
    var field = metric + (state.unit === 'usd' ? 'B' : 'Contracts');
    return data.rows.slice().sort(function(a,b) { return b[field] - a[field] || a.symbol.localeCompare(b.symbol); });
  }
  function page() {
    return '<div class="vd-page"><header class="vd-heading"><div class="vd-eyebrow">VARIATIONAL / MARKET REFERENCE</div>' +
      '<h2>Top 50 derivatives<span>Volume &amp; open interest.</span></h2>' +
      '<p>Compare activity and outstanding positions across traditional markets. A scale reference for Variational’s longer-term opportunity.</p>' +
      '<div class="vd-coverage"><b>SELECTED CME GROUP FUTURES</b><span>50-contract coverage · not a global top-50 ranking</span><a href="pro-derivatives-data.json" download>Source data ↓</a></div></header>' +
      '<div class="vd-summary"><div><span>COVERED UNIVERSE</span><strong>50 <small>contracts</small></strong><p>6 asset classes · rates, FX, equities &amp; commodities</p></div>' +
      '<div><span>#1 BY DAILY VOLUME</span><strong data-vd-leader-adv></strong><p data-vd-leader-adv-name></p></div>' +
      '<div><span>#1 BY OPEN INTEREST</span><strong data-vd-leader-oi></strong><p data-vd-leader-oi-name></p></div></div>' +
      '<div class="vps-benchmark-toolbar"><div class="vd-rank-control"><span>Rank by</span><div class="vd-rank-tabs" role="group" aria-label="Ranking order"><button type="button" data-vd-sort="adv" aria-pressed="true">Volume</button><button type="button" data-vd-sort="oi" aria-pressed="false">Open interest</button></div></div><label>Search<input type="search" aria-label="Search derivatives" data-vd-search placeholder="Contract, symbol or asset class"></label>' +
      '<label>Asset class<select aria-label="Asset class" data-vd-asset><option value="">All asset classes</option>' + ['Rates','FX','Equity index','Metals','Energy','Agriculture'].map(function(a) { return '<option>'+safe(a)+'</option>'; }).join('') + '</select></label>' +
      '<label>Display<select aria-label="Display" data-vd-unit><option value="usd">USD B · reference notional</option><option value="contracts">Original contract counts</option></select></label></div>' +
      '<div class="vps-benchmark-period"><span>ADV: SEP 2026 · OI: 30 SEP 2026 · REFERENCE MARKS: 21 OCT 2026</span><span data-vd-count aria-live="polite"></span></div>' +
      '<div class="vps-benchmark-scroll" tabindex="0" aria-label="Scrollable top 50 derivatives table"><table class="vps-benchmark-table vd-table"><caption>Volume and OI ranks cover all 50 selected contracts and stay fixed when filtering. USD figures are reference-notional estimates, not observed dollar turnover.</caption>' +
      '<thead><tr><th scope="col">Vol. rank</th><th scope="col">OI rank</th><th scope="col">Contract / symbol</th><th scope="col">Asset class</th><th scope="col" data-vd-adv-heading>ADV (USD B)*</th><th scope="col" data-vd-oi-heading>OI (USD B)*</th><th scope="col">Variational scenario</th></tr></thead><tbody data-vd-rows></tbody></table></div>' +
      '<div class="vd-pro-link"><div><b>Translate market scale into a Variational scenario.</b><p>Use any contract to model assumed market share, margin and gross revenue. These benchmarks are external markets, not live Pro listings.</p></div><a href="#variational-pro">Explore Variational Pro →</a></div>' +
      '<details class="vps-methodology"><summary>Sources, notional conversion and coverage</summary>' +
      '<p><b>*Reference notional.</b> September contract ADV / month-end OI × contract size × an explicitly selected 21 October 2026 CME settlement. Rates use contract principal or Treasury face value. The same reference price is applied across expiries. This is not actual daily dollar turnover, DV01 or delta-adjusted exposure. Contract-count rankings are available in Display.</p>' +
      '<p><b>Coverage:</b> 50 selected CME Group futures, not the global top 50. OTC, options, ICE and Eurex are excluded. FX rows are futures on currency pairs, not the entire OTC pair market. Traditional ADV uses exchange trading days; crypto’s 24-hour figures use calendar days. Contract sizes and risk profiles differ, so rankings do not establish economic or risk equivalence.</p>' +
      '<p><a href="'+safe(data.sources.adv)+'" target="_blank" rel="noopener">CME monthly ADV ↗</a> · <a href="'+safe(data.sources.oi)+'" target="_blank" rel="noopener">CME month-end OI ↗</a> · <a href="'+safe(data.sources.settlements)+'" target="_blank" rel="noopener">CME reference settlements ↗</a> · <a href="pro-derivatives-data.json" target="_blank" rel="noopener">All inputs and conversions ↗</a></p></details></div>';
  }
  function wire(section) {
    function render() {
      var adv = ranked('adv'), oi = ranked('oi'), ranks = {adv:{},oi:{}};
      adv.forEach(function(r,i) { ranks.adv[r.symbol] = i+1; });
      oi.forEach(function(r,i) { ranks.oi[r.symbol] = i+1; });
      var list = (state.sort === 'adv' ? adv : oi).filter(function(r) {
        return (!state.asset || state.asset === r.asset) && (r.name+' '+r.symbol+' '+r.asset).toLowerCase().indexOf(state.query.toLowerCase().trim()) >= 0;
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
        return '<tr><td class="'+(state.sort==='adv'?'vd-active-rank':'')+'">'+ranks.adv[r.symbol]+'</td><td class="'+(state.sort==='oi'?'vd-active-rank':'')+'">'+ranks.oi[r.symbol]+'</td><th scope="row">'+safe(r.name)+'<small>'+safe(r.symbol)+'</small></th><td>'+safe(r.asset)+'</td><td>'+value(r[state.unit==='usd'?'advB':'advContracts'])+'</td><td>'+value(r[state.unit==='usd'?'oiB':'oiContracts'])+'</td><td><button type="button" data-vd-model="'+safe(r.symbol)+'" aria-label="Model '+safe(r.name)+'">Model →</button></td></tr>';
      }).join('') : '<tr><td colspan="7">No matching contracts. Change the search or asset filter.</td></tr>';
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
    });
    render();
  }
  function boot() {
    var main=document.getElementById('main'), tabs=document.getElementById('tabs');
    if(!main || !tabs || !data || !data.rows.length || document.getElementById('tab-'+TAB)) return;
    VALID_TABS.push(TAB);
    DEFAULT_TAB_ORDER.push(TAB);
    SECTION_COPY[TAB]={eyebrow:'Market reference',title:TITLE,description:'Volume & open interest',chip:'USD billions'};
    var section=document.createElement('section');
    section.className='tsec tg-hide'; section.dataset.tg=TAB; section.innerHTML=page();
    main.appendChild(section); wire(section);
    var button=document.createElement('button');
    button.id='tab-'+TAB; button.type='button'; button.setAttribute('role','tab'); button.setAttribute('aria-selected','false'); button.dataset.tab=TAB; button.textContent=TITLE; tabs.appendChild(button);
    document.querySelectorAll('[data-open-tab="variational-pro"]').forEach(function(source) {
      var next=source.cloneNode(true); next.dataset.openTab=TAB; next.classList.remove('on');
      var title=next.querySelector('strong') || next.querySelector('b'); if(title) title.textContent=TITLE;
      var small=next.querySelector('small'); if(small) small.textContent='Volume & open interest';
      source.parentNode.insertBefore(next,source.nextSibling);
    });
    var style=document.createElement('style'); style.textContent=CSS; document.head.appendChild(style);
    if(location.hash==='#'+TAB) showTab(TAB,{push:false});
  }
  var CSS = `
.vd-page{display:flex;flex-direction:column;gap:16px;padding:24px;border:1px solid #2d415c;background:radial-gradient(ellipse at 100% 0,#17345c40,transparent 55%),#080e1b;color:#e0eafa;min-width:0}
.vd-heading{display:block!important;text-align:left!important;padding:0!important;margin:0!important;border:0!important;background:none!important}.vd-eyebrow{font:9px/1.5 var(--mono);letter-spacing:2px;color:#9eb7d8}body.v2-dashboard .vd-heading h2{font:650 clamp(30px,3.1vw,42px)/1.1 var(--sans,Arial,sans-serif)!important;letter-spacing:-.04em!important;color:#f2f6ff!important;margin:12px 0!important}.vd-heading h2 span{display:inline-block;margin-left:18px;font-size:.57em;letter-spacing:-.02em;color:#8dbbfa}.vd-heading>p{max-width:780px;font:13px/1.75 var(--sans,Arial,sans-serif)!important;color:#aebfd7!important;margin:0!important}.vd-coverage{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin-top:12px;font:10px/1.6 var(--mono);color:#a6b8d0}.vd-coverage b{font-size:8px;letter-spacing:1px;padding:6px 9px;border:1px solid #3d587b;background:#13243a;color:#c4d8f2}
.vd-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #344861;background:#101c2c}.vd-summary>div{padding:12px 14px;min-width:0}.vd-summary>div+div{border-left:1px solid #344861}.vd-summary span{font:9px/1.5 var(--mono);letter-spacing:.5px;color:#9eb9db}.vd-summary strong{display:block;font:600 clamp(24px,2.2vw,29px)/1.1 var(--sans,Arial,sans-serif);letter-spacing:-.03em;margin:7px 0;color:#e6f0ff;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}.vd-summary strong small{font:12px var(--sans,Arial,sans-serif);letter-spacing:0;color:#a9bfdb}.vd-summary p{font:11px/1.7 var(--sans,Arial,sans-serif)!important;color:#9eb4d1!important;margin:0!important}.vd-table-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px}.vd-table-top>a,.vd-pro-link>a{font:11px/1.6 var(--mono);color:#bdd7ff;text-decoration:none}.vd-coverage>a{margin-left:auto;color:#bdd7ff;text-decoration:none}.vd-page .vps-benchmark-toolbar label,.vd-rank-control{min-width:140px}.vd-rank-control{display:flex;flex:1;flex-direction:column;gap:10px;font:10px/1.5 var(--mono);color:#b9cce4}.vd-rank-tabs{display:flex;box-sizing:border-box;min-height:42px;gap:4px;padding:4px;border:1px solid #3c5270;background:#0d1726}.vd-rank-tabs button{padding:6px 9px;font:600 11px var(--sans,Arial,sans-serif);border:1px solid transparent;color:#a9bdd7;background:transparent;cursor:pointer}.vd-rank-tabs button[aria-pressed="true"]{background:#24466f;border-color:#5f8bc4;color:#f0f6ff}.vd-page button:focus-visible,.vd-page a:focus-visible,.vd-page .vps-benchmark-scroll:focus-visible{outline:2px solid #9dc6fa;outline-offset:3px}
.vd-page .vps-benchmark-toolbar{margin:0;padding:16px}.vd-page .vps-benchmark-scroll{max-height:740px;min-width:0}.vd-table{min-width:840px;font-variant-numeric:tabular-nums}.vd-table td:nth-child(4){font-family:var(--sans,Arial,sans-serif);text-align:left;white-space:normal}.vd-table td:nth-child(5),.vd-table td:nth-child(6){font-family:var(--mono);text-align:right;white-space:nowrap}.vd-table td:nth-child(1),.vd-table td:nth-child(2){font:11px var(--mono);color:#849ab8}.vd-table td.vd-active-rank{color:#b4d6ff;background:#1a304b66;font-weight:700}.vd-table th small{font-size:10px}.vd-table th[data-vd-adv-heading],.vd-table th[data-vd-oi-heading]{text-align:right}.vd-table th[aria-sort="descending"]{color:#e1efff;background:#264369}.vd-page .vps-methodology p{font:12px/1.8 var(--sans,Arial,sans-serif)!important;color:#aebfd7!important;margin:14px 0 0!important}.vd-pro-link{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px;border:1px solid #3b5577;background:#122238}.vd-pro-link b{font:600 14px/1.6 var(--sans,Arial,sans-serif);color:#dceaff}.vd-pro-link p{max-width:760px;font:12px/1.75 var(--sans,Arial,sans-serif)!important;color:#aebfd7!important;margin:8px 0 0!important}.vd-pro-link>a{flex-shrink:0;padding:12px 16px;border:1px solid #6589b9;background:#1e3d64}
@media(max-width:900px){.vd-page{padding:24px}.vd-summary>div{padding:18px}.vd-summary strong{font-size:26px}.vd-pro-link{align-items:flex-start;flex-direction:column}.vd-table{min-width:840px}}
@media(max-width:600px){.vd-page{padding:20px 14px;gap:18px}body.v2-dashboard .vd-heading h2{font-size:32px!important}.vd-heading h2 span{display:block;margin:6px 0 0;font-size:22px}.vd-summary{grid-template-columns:1fr}.vd-summary>div+div{border-left:0;border-top:1px solid #344861}.vd-summary>div{padding:16px}.vd-summary strong{font-size:28px;margin:8px 0}.vd-page .vps-benchmark-toolbar label,.vd-rank-control{min-width:100%}.vd-rank-tabs button{padding:8px 14px}.vd-coverage>a{margin-left:0}.vd-pro-link{padding:18px}.vd-page .vps-benchmark-scroll{max-height:620px}}
`;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
