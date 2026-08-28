/* TradFi panels — data snapshot 2026-08-27 */
(function(){
/* ------------------------------------------------------------------
   TradFi — the traditional book, and who is on the other side of it.

   Rebuilt 2026-08-27 against arbdata.com/variational/tradfi, which
   publishes TradFi as a first-class section, and cross-checked market
   by market against the two venues' own APIs.

   Basis note, and it governs every figure here: open interest is
   carried on the GROSS basis — taker long + taker short — which is
   what arbdata's own table calls "gross OI" and what its per-market
   rows sum to. The platform headline figure ($1.45B) is twice this,
   because it also counts the OLP's mirror of every position. Lighter
   is measured the same way from its own book, so the two sides compare.

   Sources, all read 2026-08-27:
     Variational  omni-client-api…/metadata/stats        545 listings
     Lighter      mainnet.zklighter.elliot.ai/api/v1     230 perps
     Published    arbdata.com/variational/tradfi         Entropy Advisors
   ------------------------------------------------------------------ */
'use strict';

var TF_AS_OF='2026-08-27';

var TF={
  v:{ markets:545, gross:725.1, vol:1052.9,
      tMarkets:101, tGross:224.8, tVol:248.5, tSkew:20.7,
      cGross:500.3, cVol:804.4,
      pubMarkets:106, pubOiShare:31.2, pubVolShare:23.2 },  /* arbdata's own print */
  l:{ markets:230, gross:519.6, vol:1382.0,
      tMarkets:54, tGross:59.0, tVol:108.6 }
};
TF.v.tOiShare  = TF.v.tGross/TF.v.gross*100;
TF.v.tVolShare = TF.v.tVol/TF.v.vol*100;
TF.l.tOiShare  = TF.l.tGross/TF.l.gross*100;
TF.l.tVolShare = TF.l.tVol/TF.l.vol*100;
TF.v.tTurn = TF.v.tVol/TF.v.tGross;
TF.v.cTurn = TF.v.cVol/TF.v.cGross;

/* Lighter's published cost grid for a $100K BTC trade, read the same day.
   Slippage plus base fees — not the same measure as a quoted base spread. */
var TF_COST=[['Lighter',1.1,11.5],['Hyperliquid',5.1,50.7],['Binance',5.7,56.6],['Bybit',5.9,58.5]];

var TF_CLASS_COLOR={Commodity:'c1',ETF:'c2',Equity:'c3','Pre-IPO':'c4'};

function tfEl(id){return document.getElementById(id);}
function tfN(n,d){return n.toLocaleString('en-US',{minimumFractionDigits:d===undefined?1:d,maximumFractionDigits:d===undefined?1:d});}
function tfUsd(m){return m>=1000?'$'+tfN(m/1000,2)+'B':'$'+tfN(m,1)+'M';}
function tfEsc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ==================================================================
   1. THE BOOK — both venues on one dollar axis, traditional half
   separated out. Drawn to a real scale with gridlines, so the
   proportion can be checked rather than taken on trust.
   ================================================================== */
function tfDrawBook(){
  var host=tfEl('tfBookChart'); if(!host||!host.clientWidth) return;
  var W=host.clientWidth, H=316, padT=26, padB=66, padL=64, padR=14;
  var plotB=H-padB, plotT=padT, plotL=padL, plotR=W-padR;
  var MAX=800;                                   /* $M, covers both books */
  var Y=function(v){return plotB-v/MAX*(plotB-plotT);};
  var s='', i;
  /* Lighter's slab is hatched and Variational's is solid, so the two read apart
     in a screenshot, in greyscale, and to anyone who does not see hue well. */
  s+='<defs><pattern id="tfHatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">'+
     '<rect width="6" height="6" class="tf-hatch-bg"/><line x1="0" y1="0" x2="0" y2="6" class="tf-hatch-l"/></pattern></defs>';

  for(i=0;i<=MAX;i+=200){
    s+='<line class="tf-grid" x1="'+plotL+'" x2="'+plotR.toFixed(1)+'" y1="'+Y(i).toFixed(1)+'" y2="'+Y(i).toFixed(1)+'"/>';
    s+='<text class="tf-ax" x="'+(plotL-10)+'" y="'+(Y(i)+3.5).toFixed(1)+'" text-anchor="end">$'+i+'M</text>';
  }

  var cols=[
    {n:'Variational', logo:'variational-symbol-transparent.png?v=4', t:TF.v.tGross, c:TF.v.cGross, cls:'var', sub:TF.v.tMarkets+' traditional of '+TF.v.markets+' markets'},
    {n:'Lighter', logo:'lighter-logo.png',     t:TF.l.tGross, c:TF.l.cGross===undefined?TF.l.gross-TF.l.tGross:TF.l.gross-TF.l.tGross, cls:'lit', sub:TF.l.tMarkets+' traditional of '+TF.l.markets+' markets'}
  ];
  /* pull the pair toward the left of the plot so the value labels to the right
     of each column have room, and the two read as one comparison */
  var bw=Math.min(120,(plotR-plotL)*0.13), gap=(plotR-plotL)*0.40;
  var x0=plotL+(plotR-plotL)*0.10;

  cols.forEach(function(col,k){
    var x=x0+k*gap, cx=x+bw/2, tot=col.t+col.c;
    /* crypto sits underneath, traditional on top of it */
    s+='<rect class="tf-blk crypto '+col.cls+'" x="'+x.toFixed(1)+'" y="'+Y(col.c).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+(plotB-Y(col.c)).toFixed(1)+'"/>';
    s+='<rect class="tf-blk trad '+col.cls+'" x="'+x.toFixed(1)+'" y="'+Y(tot).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+(Y(col.c)-Y(tot)).toFixed(1)+'"'+
       (col.cls==='lit'?' fill="url(#tfHatch)"':'')+'/>';
    /* the traditional slab is the point, so it gets the label */
    s+='<text class="tf-blab '+col.cls+'" x="'+(x+bw+10).toFixed(1)+'" y="'+((Y(tot)+Y(col.c))/2+4).toFixed(1)+'">'+tfUsd(col.t)+'</text>';
    s+='<text class="tf-bsub" x="'+(x+bw+10).toFixed(1)+'" y="'+((Y(tot)+Y(col.c))/2+17).toFixed(1)+'">'+tfN(col.t/tot*100)+'% traditional</text>';
    s+='<text class="tf-bcry" x="'+(x+bw/2).toFixed(1)+'" y="'+(Y(col.c)+22).toFixed(1)+'" text-anchor="middle">crypto '+tfUsd(col.c)+'</text>';
    s+='<image href="'+col.logo+'" x="'+(cx-8).toFixed(1)+'" y="'+(plotB+8)+'" width="16" height="16" preserveAspectRatio="xMidYMid meet"/>';
    s+='<text class="tf-bname '+col.cls+'" x="'+cx.toFixed(1)+'" y="'+(plotB+38)+'" text-anchor="middle">'+col.n+'</text>';
    s+='<text class="tf-bnsub" x="'+cx.toFixed(1)+'" y="'+(plotB+51)+'" text-anchor="middle">'+tfEsc(col.sub)+'</text>';
  });
  s+='<text class="tf-cap" x="'+plotL+'" y="'+(plotT-12)+'">OPEN INTEREST, GROSS BASIS — TAKER LONG + TAKER SHORT — FROM EACH VENUE’S OWN API</text>';

  host.setAttribute('viewBox','0 0 '+W+' '+H); host.setAttribute('height',H); host.innerHTML=s;
}

/* ==================================================================
   2. WHAT IS IN IT — the traditional book by asset class
   ================================================================== */
function tfRenderClasses(){
  var host=tfEl('tfClasses'); if(!host)return;
  var tot=TF_D.classes.reduce(function(a,c){return a+c[2];},0);
  var bar=TF_D.classes.map(function(c){
    return '<i class="'+TF_CLASS_COLOR[c[0]]+'" style="width:'+(c[2]/tot*100).toFixed(2)+'%" title="'+tfEsc(c[0])+' '+tfUsd(c[2])+'"></i>';
  }).join('');
  var rows=TF_D.classes.map(function(c){
    return '<div class="tf-crow">'+
      '<span class="tf-cdot '+TF_CLASS_COLOR[c[0]]+'"></span>'+
      '<b>'+tfEsc(c[0])+'</b>'+
      '<em>'+c[1]+' markets</em>'+
      '<strong>'+tfUsd(c[2])+'</strong>'+
      '<u>'+tfN(c[2]/tot*100)+'% of the traditional book</u>'+
      '<i>'+tfUsd(c[3])+' traded in 24h</i>'+
      '</div>';
  }).join('');
  host.innerHTML='<div class="tf-cbar">'+bar+'</div>'+rows;
}

function tfRenderTop(){
  var host=tfEl('tfTop'); if(!host)return;
  var h='<div class="tf-trow head"><div>Market</div><div class="n">Open interest</div><div class="n">24h volume</div><div class="n">Net skew</div><div class="n">Base spread</div></div>';
  TF_D.top.forEach(function(r){
    var sk=r[5];
    h+='<div class="tf-trow">'+
       '<div><b>'+tfEsc(r[0])+'</b><small>'+tfEsc(r[1])+' · '+tfEsc(r[2])+'</small></div>'+
       '<div class="n"><strong>'+tfUsd(r[3])+'</strong></div>'+
       '<div class="n"><strong>'+tfUsd(r[4])+'</strong></div>'+
       '<div class="n"><strong class="'+(sk>=0?'lg':'sh')+'">'+(sk>0?'+':'')+tfN(sk)+'%</strong><small>'+(sk>=0?'net long':'net short')+'</small></div>'+
       '<div class="n"><strong>'+tfN(r[6],2)+'</strong><small>bps</small></div>'+
       '</div>';
  });
  host.innerHTML=h;
}

/* ==================================================================
   3. WHO TAKES THE OTHER SIDE — single-name demand is one-directional
   and the OLP is the counterparty to all of it.
   ================================================================== */
function tfDrawSkew(){
  var host=tfEl('tfSkewChart'); if(!host||!host.clientWidth) return;
  var D=TF_D.skew, n=D.length;
  var W=host.clientWidth, rowH=26, padT=24, padB=22, padL=64;
  var H=padT+n*rowH+padB;
  var mid=padL+(W-padL-14)*0.42, half=Math.min(mid-padL-8,(W-mid-14)-8);
  var MAX=Math.max.apply(null,D.map(function(d){return Math.max(d[1],d[2]);}));
  var X=function(v,dir){return mid+dir*v/MAX*half;};
  var s='';
  s+='<text class="tf-cap" x="'+padL+'" y="12">SHORT ← TAKER OPEN INTEREST → LONG</text>';
  s+='<line class="tf-mid" x1="'+mid.toFixed(1)+'" x2="'+mid.toFixed(1)+'" y1="'+(padT-6)+'" y2="'+(padT+n*rowH)+'"/>';
  D.forEach(function(d,i){
    var y=padT+i*rowH, bh=13, yy=y+(rowH-bh)/2;
    s+='<text class="tf-sk-t" x="'+(padL-10)+'" y="'+(yy+10)+'" text-anchor="end">'+tfEsc(d[0])+'</text>';
    s+='<rect class="tf-sk sh" x="'+X(d[2],-1).toFixed(1)+'" y="'+yy+'" width="'+(mid-X(d[2],-1)).toFixed(1)+'" height="'+bh+'"/>';
    s+='<rect class="tf-sk lg" x="'+mid.toFixed(1)+'" y="'+yy+'" width="'+(X(d[1],1)-mid).toFixed(1)+'" height="'+bh+'"/>';
    s+='<text class="tf-sk-v" x="'+(X(Math.max(d[1],d[2]),d[3]>=0?1:-1)+(d[3]>=0?8:-8)).toFixed(1)+'" y="'+(yy+10)+'" text-anchor="'+(d[3]>=0?'start':'end')+'">'+(d[3]>0?'+':'')+tfN(d[3])+'%</text>';
  });
  host.setAttribute('viewBox','0 0 '+W+' '+H); host.setAttribute('height',H); host.innerHTML=s;
}

/* ==================================================================
   4. EXECUTION
   ================================================================== */
function tfDrawSpreads(){
  var host=tfEl('tfSpreadChart'); if(!host||!host.clientWidth) return;
  var D=TF_D.spreads, n=D.length;
  var W=host.clientWidth, rowH=22, padT=26, padB=24, padL=58, padR=54;
  var H=padT+n*rowH+padB, plotR=W-padR;
  var MAX=6;
  var X=function(v){return padL+v/MAX*(plotR-padL);};
  var s='', i;
  for(i=0;i<=MAX;i+=2){
    s+='<line class="tf-grid" x1="'+X(i).toFixed(1)+'" x2="'+X(i).toFixed(1)+'" y1="'+(padT-8)+'" y2="'+(padT+n*rowH)+'"/>';
    s+='<text class="tf-ax" x="'+X(i).toFixed(1)+'" y="'+(padT+n*rowH+14)+'" text-anchor="middle">'+i+' bps</text>';
  }
  s+='<text class="tf-cap" x="'+padL+'" y="12">QUOTED BASE SPREAD · VARIATIONAL API</text>';
  D.forEach(function(d,i){
    var y=padT+i*rowH, bh=11, yy=y+(rowH-bh)/2;
    var crypto=['BTC','ETH','SOL'].indexOf(d[0])>=0;
    s+='<text class="tf-sk-t" x="'+(padL-10)+'" y="'+(yy+9)+'" text-anchor="end">'+tfEsc(d[0])+'</text>';
    s+='<rect class="tf-sp'+(crypto?' cr':'')+'" x="'+padL+'" y="'+yy+'" width="'+Math.max(1,X(d[1])-padL).toFixed(1)+'" height="'+bh+'"/>';
    s+='<text class="tf-sk-v" x="'+(X(d[1])+8).toFixed(1)+'" y="'+(yy+9)+'">'+tfN(d[1],2)+'</text>';
  });
  host.setAttribute('viewBox','0 0 '+W+' '+H); host.setAttribute('height',H); host.innerHTML=s;
}

function tfRenderCost(){
  var host=tfEl('tfCostGrid'); if(!host)return;
  var max=Math.max.apply(null,TF_COST.map(function(c){return c[1];}));
  host.innerHTML=TF_COST.map(function(c){
    return '<div class="tf-cost-row'+(c[0]==='Lighter'?' best':'')+'">'+
      '<b>'+tfEsc(c[0])+'</b>'+
      '<div class="tf-cost-bar"><i style="width:'+(c[1]/max*100).toFixed(1)+'%"></i></div>'+
      '<strong>'+tfN(c[1],1)+' bps</strong><small>$'+tfN(c[2],1)+'</small></div>';
  }).join('');
}

/* A single blue "31.0% vs 11.4%" string leaves the reader working out which
   half is whose. Each venue gets its own tagged, differently-coloured slot. */
var TF_VAR_LOGO='variational-symbol-transparent.png?v=4', TF_LIT_LOGO='lighter-logo.png';
function tfVenue(which,v){
  var lg=which==='var'?TF_VAR_LOGO:TF_LIT_LOGO, nm=which==='var'?'Variational':'Lighter';
  return '<span class="tf-vs-h '+which+'"><img src="'+lg+'" alt="'+nm+'" width="20" height="20"><b>'+v+'</b></span>';
}
function tfVs(a,b){
  return '<span class="tf-vs">'+tfVenue('var',a)+'<span class="tf-vs-x">vs</span>'+tfVenue('lit',b)+'</span>';
}
function tfRenderSignals(){
  var set=function(id,v){var e=tfEl(id); if(e)e.textContent=v;};
  var html=function(id,v){var e=tfEl(id); if(e)e.innerHTML=v;};
  html('tfSig1', tfVs(tfN(TF.v.tOiShare)+'%', tfN(TF.l.tOiShare)+'%'));
  set('tfSig1Sub','Variational holds '+tfUsd(TF.v.tGross)+' of traditional open interest against Lighter’s '+tfUsd(TF.l.tGross)+' — '+tfN(TF.v.tGross/TF.l.tGross,1)+'× as much, on a book only '+tfN(TF.v.gross/TF.l.gross,1)+'× the size.');
  html('tfSig2', tfVs(tfN(TF.v.tVolShare)+'%', tfN(TF.l.tVolShare)+'%'));
  set('tfSig2Sub','Nearly a quarter of everything traded on Variational in the last 24 hours was a traditional market. On Lighter it was under a tenth.');
  html('tfSig3', '<span class="tf-vs">'+tfVenue('var',TF.v.tMarkets+' of '+TF.v.markets)+'</span>');
  set('tfSig3Sub','Metals, energy, index ETFs, '+TF_D.classes.filter(function(c){return c[0]==='Equity';})[0][1]+' single names and three pre-IPO markets. Lighter lists '+TF.l.tMarkets+' traditional markets of '+TF.l.markets+'.');
  var eq=TF_D.classes.filter(function(c){return c[0]==='Equity';})[0];
  html('tfSig4', '<span class="tf-vs">'+tfVenue('var','+'+tfN(eq[4])+'%')+'</span>');
  set('tfSig4Sub','Single-name equity demand is one-directional — far more long than short. On a bilateral venue the OLP takes that side. An anonymous order book has nobody who can.');
  set('tfAsOf','Snapshot '+TF_AS_OF+' · not live');
  set('tfTurn', tfN(TF.v.tTurn,2)+'× vs '+tfN(TF.v.cTurn,2)+'×');
  set('tfXcheck','arbdata publishes '+TF.v.pubOiShare+'% of open interest and '+TF.v.pubVolShare+'% of volume across '+TF.v.pubMarkets+' traditional markets. Classifying all '+TF.v.markets+' listings independently, by ticker and instrument name, gives '+tfN(TF.v.tOiShare)+'% and '+tfN(TF.v.tVolShare)+'% across '+TF.v.tMarkets+'. Two definitions built separately, agreeing to within half a point.');
}

/* ---------- measured data ---------- */
var TF_D = {"classes":[["Commodity",8,102.1,108.5,18.1],["ETF",17,58.1,46.0,6.8],["Equity",73,53.6,79.0,41.8],["Pre-IPO",3,11.1,14.9,15.5]],"top":[["XAU","Gold","Commodity",61.11,74.63,15.3,2.57],["US500","State Street SPDR S&P 500 ETF Trus","ETF",28.75,7.28,10.4,3.16],["QQQ","Invesco QQQ Trust, Series 1","ETF",21.18,21.23,7.2,3.18],["CL","WTI Crude Oil","Commodity",14.73,13.75,19.4,3.94],["BZ","Brent Oil","Commodity",11.94,8.26,24.0,4.53],["XAG","Silver","Commodity",10.53,10.07,16.9,4.24],["SPCX","SPAC and New Issue ETF","Pre-IPO",8.22,14.4,2.2,4.0],["NVDA","NVIDIA Corporation","Equity",5.09,11.48,63.2,4.7],["MU","Micron Technology, Inc.","Equity",4.53,12.28,33.3,3.11],["SNDK","Sandisk Corporation","Equity",3.75,16.75,35.8,4.04],["GOOGL","Alphabet Inc.","Equity",3.53,1.54,77.1,4.4],["DRAM","Roundhill Memory ETF","ETF",3.28,6.66,17.2,5.3],["SKHY","SK hynix Inc.","Equity",2.69,7.18,38.0,3.83],["META","Meta Platforms, Inc.","Equity",2.64,2.84,56.7,5.09],["INTC","Intel Corporation","Equity",2.6,2.59,41.1,4.49],["MSTR","Strategy Inc","Equity",2.51,2.09,-70.8,5.32]],"skew":[["NVDA",4.15,0.94,63.2],["GOOGL",3.12,0.4,77.1],["MSTR",0.37,2.15,-70.8],["MU",3.02,1.51,33.3],["META",2.07,0.57,56.7],["SNDK",2.55,1.2,35.8],["NBIS",1.48,0.37,59.5],["INTC",1.83,0.77,41.1],["SKHY",1.86,0.84,38.0],["AMZN",1.67,0.82,34.4]],"spreads":[["BTC",1.08],["ETH",1.12],["SOL",1.24],["XAU",2.57],["MU",3.11],["US500",3.16],["QQQ",3.18],["SKHY",3.83],["CL",3.94],["SPCX",4.0],["SNDK",4.04],["XAG",4.24],["GOOGL",4.4],["NVDA",4.7]]};

/* ---------- wiring ---------- */
function tfDrawAll(attempt){
  var n=attempt|0, probe=tfEl('tfBookChart');
  if(!probe||!probe.clientWidth){
    if(n<30) requestAnimationFrame(function(){tfDrawAll(n+1);});
    return;
  }
  try{ tfDrawBook(); tfDrawSkew(); tfDrawSpreads(); }
  catch(err){ console.warn('TradFi chart render skipped:',err); }
}
function tfKick(){ tfDrawAll(0); }
window.__TF_draw=tfKick;

function tfRenderAll(){
  tfRenderSignals(); tfRenderClasses(); tfRenderTop(); tfRenderCost(); tfKick();
}

function tfInitJump(){
  var bar=document.querySelector('[data-tf-command]'); if(!bar)return;
  bar.addEventListener('click',function(e){
    var b=e.target.closest('button[data-tf-jump]'); if(!b)return;
    var t=tfEl(b.dataset.tfJump); if(!t)return;
    bar.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    t.scrollIntoView({behavior:'smooth',block:'start'});
  });
}

function tfRegister(){
  try{
    if(typeof VALID_TABS!=='undefined' && VALID_TABS.indexOf('tradfi')<0) VALID_TABS.push('tradfi');
    if(typeof DEFAULT_TAB_ORDER!=='undefined' && DEFAULT_TAB_ORDER.indexOf('tradfi')<0){
      var i=DEFAULT_TAB_ORDER.indexOf('pretge');
      if(i<0) i=DEFAULT_TAB_ORDER.indexOf('comparison');
      DEFAULT_TAB_ORDER.splice(i<0?DEFAULT_TAB_ORDER.length:i+1,0,'tradfi');
    }
    if(typeof SECTION_COPY!=='undefined') SECTION_COPY.tradfi={
      eyebrow:'Traditional markets',
      title:'TradFi',
      description:'How much of each venue is traditional rather than crypto — the book, what is in it, who takes the other side of it, and what it costs to trade.',
      chip:'the RWA book'
    };
  }catch(_){}
}

function tfBoot(){
  tfRegister();
  tfRenderAll();
  tfInitJump();
  var panel=document.querySelector('[data-tg="tradfi"]');
  if(panel){
    new MutationObserver(function(){
      if(!panel.classList.contains('tg-hide')) tfKick();
    }).observe(panel,{attributes:true,attributeFilter:['class']});
    if(typeof ResizeObserver!=='undefined'){
      var t=null;
      new ResizeObserver(function(){
        clearTimeout(t); t=setTimeout(function(){ if(!panel.classList.contains('tg-hide')) tfKick(); },120);
      }).observe(panel);
    }
  }
  var wt=null;
  window.addEventListener('resize',function(){
    clearTimeout(wt); wt=setTimeout(function(){
      var pn=document.querySelector('[data-tg="tradfi"]');
      if(pn&&!pn.classList.contains('tg-hide')) tfKick();
    },140);
  });
  if(location.hash==='#tradfi'&&typeof showTab==='function'){
    try{showTab('tradfi',{push:false});}catch(_){}
  }
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',tfBoot);
else tfBoot();

})();
