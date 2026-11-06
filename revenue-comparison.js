(function(){
'use strict';
var TAB='comparing-revenue',BASE='https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=';
var METRICS=[['fees','Fees','User payments','dailyFees'],['revenue','Protocol Revenue','Protocol share · excludes LPs','dailyRevenue'],['holders','Holders Revenue','Tokenholder accrual','dailyHoldersRevenue']];
var state={rows:[],at:null,live:false,error:null,period:'total24h',sort:'revenue',query:''},host;
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var money=function(v){return typeof v==='number'&&isFinite(v)?'$'+Math.round(v).toLocaleString('en-US'):'—';};
function value(r,k){var v=r[k]&&r[k][state.period];return typeof v==='number'&&isFinite(v)?v:null;}
function logo(r){if(r.isVar)return '<span class="rc-logo"><img src="variational-symbol-transparent.png" alt="" width="28" height="28"></span>';var url=/^https:\/\/icons\.llamao\.fi\//.test(r.logo||'')?r.logo:'https://icons.llamao.fi/icons/protocols/'+encodeURIComponent(r.slug);return '<span class="rc-logo"><span>'+esc(r.name.slice(0,2))+'</span><img src="'+esc(url)+'" alt="" loading="lazy" width="28" height="28"></span>';}
function isDerivative(r){return r.category==='Derivatives';}
function scoped(){return state.rows.filter(isDerivative);}
function rankOf(v,key,peers){if(v==null)return null;return 1+peers.filter(function(r){var x=value(r,key);return x!=null&&x>v;}).length;}
function ranking(){
 var peers=scoped(),official=peers.find(function(r){return /^(variational)(?:-|$)/.test(r.slug);});
 var model=null;try{if(typeof moneyFlowWindow==='function')model=moneyFlowWindow(state.period==='total24h'?'1d':state.period==='total7d'?'7d':'30d');}catch(_){}
 var row=Object.assign({slug:'variational',name:'Variational',category:'Derivatives',definitions:{}},official||{},{isVar:true,estimated:{}});
 METRICS.forEach(function(m){
   var key=m[0],actual=official?value(official,key):null;
   if(actual==null&&model&&!model.error){
     var estimate=key==='fees'?model.gross:key==='holders'?model.gross*0.20:model.treasury;
     if(Number.isFinite(estimate)){row[key]={[state.period]:estimate};row.estimated[key]=true;}
   }
 });
 return {rows:peers.filter(function(r){return r!==official;}).concat(row),row:row,model:model};
}
function walletSignature(r){
 return JSON.stringify([r.model&&r.model.start,r.model&&r.model.end].concat(METRICS.map(function(m){return value(r.row,m[0]);})));
}
var lastWalletSignature;
function draw(){
 if(!host)return;
 var compared=ranking(),universe=compared.rows;lastWalletSignature=walletSignature(compared);
 var rows=universe.filter(function(r){return !state.query||r.name.toLowerCase().indexOf(state.query.toLowerCase())>=0;}).sort(function(a,b){var av=value(a,state.sort),bv=value(b,state.sort);return (bv==null?-Infinity:bv)-(av==null?-Infinity:av)||a.name.localeCompare(b.name);});
 var body=rows.map(function(r){return '<tr'+(r.isVar?' class="rc-var-row"':'')+'><td class="rc-rank">'+(value(r,state.sort)==null?'—':rankOf(value(r,state.sort),state.sort,universe))+'</td><th scope="row"><div class="rc-identity">'+logo(r)+'<div><a href="https://defillama.com/protocol/'+encodeURIComponent(r.slug)+'" target="_blank" rel="noopener">'+esc(r.name)+'</a><small>'+esc(r.category)+(r.isVar&&Object.keys(r.estimated).length?' · wallet estimates':'')+'</small></div></div><details><summary>Definition & source</summary>'+METRICS.map(function(m){return '<p><b>'+m[1]+': </b>'+esc(r.isVar&&r.estimated[m[0]]?(m[0]==='fees'?'Gross spreads estimated from the treasury share.':m[0]==='holders'?'Planned buy & burn, estimated as 20% of gross spreads.':'Net USDC inflow to the treasury wallet.'):r.definitions&&r.definitions[m[0]]||'No definition published for this metric. Missing data is not zero.')+'</p>';}).join('')+(r.methodologyURL&&/^https:\/\//.test(r.methodologyURL)?'<a href="'+esc(r.methodologyURL)+'" target="_blank" rel="noopener">Adapter methodology ↗</a>':'')+'</details></th>'+METRICS.map(function(m){return '<td class="rc-num rc-'+m[0]+(m[0]===state.sort?' rc-selected':'')+'">'+money(value(r,m[0]))+(r.isVar&&r.estimated[m[0]]?(m[0]==='holders'?' <small title="20% of estimated spreads">planned est.</small>':' <small title="Wallet estimate">est.</small>'):'')+'</td>';}).join('')+'</tr>';}).join('');
 host.innerHTML='<header class="rc-head"><h2>Comparing Revenue</h2><a href="https://enterprise.defillama.com/data-definitions" target="_blank" rel="noopener">DeFiLlama definitions ↗</a></header><div class="rc-meaning"><span><b>Fees</b> User payments</span><i>⊇</i><span><b>Protocol Revenue</b> Protocol share · excludes LPs</span><i>⊇</i><span><b>Holders Revenue</b> Tokenholder accrual</span><small>Nested amounts, not three amounts to add. Holder accrual includes distributions and token buybacks / burns.</small></div><div class="rc-tools"><span class="rc-scope">Perp DEX / derivatives only</span><label>Period <select data-rc-period>'+[['total24h','24H'],['total7d','7D'],['total30d','30D']].map(function(x){return '<option value="'+x[0]+'"'+(state.period===x[0]?' selected':'')+'>'+x[1]+'</option>';}).join('')+'</select></label><label>Rank by <select data-rc-sort>'+METRICS.map(function(m){return '<option value="'+m[0]+'"'+(state.sort===m[0]?' selected':'')+'>'+m[1]+'</option>';}).join('')+'</select></label><input type="search" data-rc-search placeholder="Search protocols" aria-label="Search revenue protocols" value="'+esc(state.query)+'"><button type="button" data-rc-refresh>Refresh</button></div><div class="rc-status">'+(state.rows.length?(state.live?'API refreshed':'Saved snapshot')+' · '+esc(state.at?new Date(state.at).toLocaleString('en-GB',{timeZone:'UTC',hour12:false})+' UTC':'')+' · '+rows.length+' protocols':'Loading DeFiLlama data…')+(state.error?' · Some metrics could not refresh; retained snapshot':'')+'</div><div class="rc-proxy" id="rc-var-proxy"></div><div class="rc-table-wrap"><table class="rc-table"><colgroup><col class="rc-col-rank"><col class="rc-col-name"><col><col><col></colgroup><thead><tr><th>#</th><th>Protocol</th>'+METRICS.map(function(m){return '<th class="rc-num rc-'+m[0]+'"><span>'+m[1]+'</span><small>'+m[2]+'</small></th>';}).join('')+'</tr></thead><tbody>'+body+'</tbody></table></div>'+(!rows.length&&state.rows.length?'<p>No matching protocols.</p>':'')+'<p class="rc-note">Same selected reporting window across all three columns. “—” means not reported; $0 means reported zero. Individual adapters only; parent totals are not added again. Universe: DeFiLlama Derivatives category. Adapter totals can include ancillary fees; see each venue’s definition.</p><div class="rc-source-links"><a href="https://defillama.com/fees" target="_blank" rel="noopener">Fees source ↗</a><a href="https://defillama.com/revenue" target="_blank" rel="noopener">Revenue source ↗</a><a href="https://defillama.com/holders-revenue" target="_blank" rel="noopener">Holders Revenue source ↗</a></div>';
 var head=host.querySelector('.rc-head'),tools=host.querySelector('.rc-tools'),status=host.querySelector('.rc-status'),standing=host.querySelector('.rc-proxy'),meaning=host.querySelector('.rc-meaning');
 head.after(tools,status,standing);
 var definitions=document.createElement('details');definitions.className='rc-definition-fold';definitions.innerHTML='<summary>What each revenue metric means</summary>';standing.after(definitions);definitions.appendChild(meaning);
 proxy(compared);
}
function proxy(compared){
 var el=document.getElementById('rc-var-proxy');if(!el)return;
 var peers=compared.rows,row=compared.row,model=compared.model;
 var period=state.period==='total24h'?'24H':state.period==='total7d'?'7D':'30D';
 el.innerHTML='<div class="rc-standing-head"><div class="rc-var-name"><img src="variational-symbol-transparent.png" width="28" height="28" alt=""><strong>Where Variational stands</strong></div><span>'+period+' · '+'derivatives peers'+'</span></div><div class="rc-standings">'+METRICS.map(function(m){
   var v=value(row,m[0]),isProxy=row.estimated[m[0]];
   var eligible=peers.filter(function(r){return value(r,m[0])!=null;}),rank=rankOf(v,m[0],eligible);
   var basis=isProxy?(m[0]==='fees'?'Estimated gross spreads':m[0]==='holders'?'Planned buy &amp; burn · 20% of estimated spreads':'Treasury wallet proxy'):v==null?'Not reported':'DeFiLlama reported';
   return '<div class="rc-standing'+(state.sort===m[0]?' is-ranked':'')+'"><span>'+m[1]+'</span><strong>'+(rank==null?'—':'<small>#</small>'+rank)+'</strong><em>'+(rank==null?(v==null?'Not ranked':'Waiting for peer data'):'of '+eligible.length+' with data'+(isProxy?' · indicative':''))+'</em><b title="'+money(v)+'">'+(v==null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:2}).format(v))+'</b><p>'+basis+'</p></div>';
 }).join('')+'</div><p class="rc-standing-basis">'+(model&&!model.error?'Wallet window: '+esc(model.start)+' → '+esc(model.end)+' · completed ET days. ':'')+'Indicative positions compare wallet-derived figures with DeFiLlama rolling windows; they are not official DeFiLlama ranks. VAR’s planned buy &amp; burn uses the treasury allocation and serves as its Holders Revenue estimate until DeFiLlama reports a value. The ranks use the same Perp DEX / derivatives rows as the table. Change “Rank by” to find Variational in that column. Search does not recalculate ranks.</p>'+
   '<details class="rc-definition-fold"><summary>VAR holder value: buy &amp; burn vs OLP returns</summary><p><a href="https://docs.variational.io/omni/the-omni-liquidity-provider-olp" target="_blank" rel="noopener">Variational’s current 20% treasury policy</a> × estimated gross spreads × <a href="https://www.variational.io/blog/var-tokenomics-and-tge-timing" target="_blank" rel="noopener">100% intended buy &amp; burn allocation</a>. This is a policy estimate; the realized cash flow and executed buybacks are separate.</p><p>Even if staking VAR becomes a condition for OLP access, returns on deposited USDC are LP returns and can be negative. The staking condition has not been confirmed in the published terms we reviewed. Only a separate distribution tied to VAR holding or staking, or verified buybacks, would count in <a href="https://enterprise.defillama.com/holders-revenue/chain/open" target="_blank" rel="noopener">Holders Revenue</a>.</p></details>';
}

async function refresh(){
 var results=await Promise.allSettled(METRICS.map(async function(m){var r=await fetch(BASE+m[3],{cache:'no-store'});if(!r.ok)throw Error('HTTP');var j=await r.json();if(!Array.isArray(j.protocols))throw Error('schema');return {kind:m[0],rows:j.protocols};}));
 var map=new Map(state.rows.map(function(r){return [r.slug,r];})),success=0;
 results.forEach(function(result){if(result.status!=='fulfilled')return;success++;var k=result.value.kind;map.forEach(function(r){r[k]=null;});result.value.rows.forEach(function(x){if(!x.slug)return;var r=map.get(x.slug)||{slug:x.slug,name:x.name,category:x.category,logo:x.logo,methodologyURL:x.methodologyURL,definitions:{}};if(x.logo)r.logo=x.logo;if(x.category)r.category=x.category;r[k]={total24h:x.total24h,total7d:x.total7d,total30d:x.total30d};var method=x.methodology||{};r.definitions=r.definitions||{};r.definitions[k]=typeof method==='string'?method:method[k==='fees'?'Fees':k==='revenue'?'Revenue':'HoldersRevenue'];map.set(x.slug,r);});});
 state.rows=Array.from(map.values()).filter(function(r){return isDerivative(r)&&METRICS.some(function(m){return ['total24h','total7d','total30d'].some(function(p){return typeof (r[m[0]]&&r[m[0]][p])==='number';});});});if(success===3){state.at=new Date().toISOString();state.live=true;}state.error=success<3;draw();
}
function boot(){
 VALID_TABS.push(TAB);DEFAULT_TAB_ORDER.push(TAB);SECTION_COPY[TAB]={eyebrow:'Revenue comparison',title:'Comparing Revenue',description:'Perp DEX and derivatives peers from DeFiLlama, with Variational treasury inflow shown separately.',chip:'DeFiLlama'};
 host=document.createElement('section');host.className='rc-section tsec tg-hide';host.dataset.tg=TAB;document.getElementById('main').appendChild(host);
 var b=document.createElement('button');b.type='button';b.id='tab-'+TAB;b.dataset.tab=TAB;b.setAttribute('role','tab');b.textContent='Comparing Revenue';document.getElementById('tabs').appendChild(b);
 document.querySelectorAll('[data-open-tab="monitors"]').forEach(function(anchor){var mine=anchor.cloneNode(true);mine.dataset.openTab=TAB;var text=mine.querySelector('strong')||mine.querySelector('b');if(text)text.textContent='Comparing Revenue';mine.setAttribute('aria-label','Comparing Revenue');anchor.parentNode.insertBefore(mine,anchor.nextSibling);});
 host.addEventListener('change',function(e){if(e.target.matches('[data-rc-period]'))state.period=e.target.value;else if(e.target.matches('[data-rc-sort]'))state.sort=e.target.value;else return;draw();});
 host.addEventListener('input',function(e){if(!e.target.matches('[data-rc-search]'))return;state.query=e.target.value;var pos=e.target.selectionStart;draw();var input=host.querySelector('[data-rc-search]');input.focus({preventScroll:true});input.setSelectionRange(pos,pos);});
 host.addEventListener('click',function(e){if(e.target.closest('[data-rc-refresh]'))refresh();});
 draw();fetch('data/revenue-snapshot.json',{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){state.rows=j.protocols.filter(isDerivative);state.at=j.fetchedAt;draw();}).catch(function(){}).finally(refresh);
 host.addEventListener('error',function(e){if(e.target.tagName==='IMG')e.target.style.visibility='hidden';},true);
 var n=0,timer=setInterval(function(){if(walletSignature(ranking())!==lastWalletSignature&&!host.contains(document.activeElement))draw();if(++n>=20)clearInterval(timer);},1500);
 if(location.hash==='#'+TAB)showTab(TAB,{push:false});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
