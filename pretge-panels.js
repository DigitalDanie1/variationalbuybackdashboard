/* Pre-TGE Comparison panels — data snapshot 2026-08-26 */
(function(){
/* ------------------------------------------------------------------
   Pre-TGE Comparison — Lighter as the priced comparable.

   The only perp DEX that ran a comparable pre-TGE points program and
   then let a market price the result is Lighter. This module reads
   Variational against Lighter day-for-day over the same 252-day slice
   of each program, audits whether the two open-interest figures are
   even on the same basis, and then uses what the market actually paid
   for Lighter at its TGE to bound Variational's own.

   External file, not inline, because the deploy target runs
   script-src 'self'.

   Sources, all pulled 2026-08-26:
     Variational  omni-client-api…/metadata/stats      (own API, 544 listings)
     Lighter      mainnet.zklighter.elliot.ai/api/v1   (own API, 229 perps)
     Both books   api.llama.fi/v2/chart/{open-interest,derivatives}/protocol/…
     LIT price    api.coingecko.com/api/v3/coins/lighter
     BTC tape     api.binance.com/api/v3/klines BTCUSDT 1d

   Every figure below is a snapshot of that date and does not move with
   the "Refresh live" button.
   ------------------------------------------------------------------ */
'use strict';

const PT_AS_OF = '2026-08-26';

/* ---------- measured anchors ---------- */
const PT = {
  /* Variational — day 0 = Omni Points, 2025-12-17. Today is day 252. */
  v:{
    label:'Variational', short:'VAR', d0:'2025-12-17', day:252,
    oi:1440.6,           /* DeFiLlama 2026-08-26, matches the protocol API's 1,435.4 */
    oiApi:1435.4,        /* metadata/stats open_interest */
    oiLong:433.5, oiShort:284.2,   /* Σ taker long / short over 544 listings */
    avgOi:943.2, cumVol:211.3, cumVolAll:308.7,
    btcChg:-9.5, btcMdd:-39.5, off:82.2,
    markets:544, tvl:163.8, vol24:1271.1
  },
  /* Lighter — day 0 = first recorded trading day on DeFiLlama, 2025-01-18.
     TGE 2025-12-30 = day 346. Season 2 (public mainnet) 2025-10-02 = day 257. */
  l:{
    label:'Lighter', short:'LIT', d0:'2025-01-18', day:252, tgeDay:346, s2Day:257,
    oi252:1255.6, avgOi:302.3, cumVol:526.2,
    btcChg:4.9, btcMdd:-28.1, off:21.3,
    oiTge:1398.7, avgOiTge:666.2, cumVolTge:1311.3,
    oiNow:1120.0,        /* DeFiLlama 2026-08-26 */
    oiPage:1100.0,       /* app.lighter.xyz/stats, read the same day */
    oiOneSide:489.2,     /* Σ over 229 perps of open_interest × mark_price, own API */
    supply:1000, floatPct:0.25,
    pxTge:2.7264, pxHigh1:7.86, pxLow:0.8076, pxLowDate:'2026-03-31', pxNow:3.2833
  }
};

/* Variational's own API reports open interest at exactly 2.000000× the sum of
   taker long + short, because the OLP is the counterparty to every taker
   position and both sides are counted. Lighter's published book sits at the
   same ~2× multiple of the one-sided sum from its own API, so the two
   published figures are on the same basis. See the audit block. */
PT.v.oiOneSide = PT.v.oiLong + PT.v.oiShort;

/* ---------- derived: what the market paid for the comparable ---------- */
const FDV_TGE   = PT.l.pxTge  * PT.l.supply;   /* $M — 1B supply */
const FDV_NOW   = PT.l.pxNow  * PT.l.supply;
const FDV_HIGH1 = PT.l.pxHigh1* PT.l.supply;
const FDV_LOW   = PT.l.pxLow  * PT.l.supply;
const MCAP_TGE  = FDV_TGE * PT.l.floatPct;

/* ---------- the four multiples, each a different question ---------- */
const MULT = [
  {k:'oi',   name:'Book at TGE',        basis:'FDV ÷ open interest on TGE day',
   m:FDV_TGE/PT.l.oiTge,     applyTo:PT.v.oi,        unit:'×',
   litLeg:'$'+f2(FDV_TGE/1000)+'B ÷ $'+f1(PT.l.oiTge/1000)+'B',
   varLeg:'$'+f1(PT.v.oi/1000)+'B book',
   read:'The most direct like-for-like: what one dollar of book was worth at the moment a market first priced it.'},
  {k:'avg',  name:'Book carried',       basis:'FDV ÷ average book over the whole program',
   m:FDV_TGE/PT.l.avgOiTge,  applyTo:PT.v.avgOi,     unit:'×',
   litLeg:'$'+f2(FDV_TGE/1000)+'B ÷ $'+f0(PT.l.avgOiTge)+'M',
   varLeg:'$'+f0(PT.v.avgOi)+'M average',
   read:'Rewards a book held for the full run rather than one assembled near the end. Variational’s strongest frame.'},
  {k:'vol',  name:'Flow printed',       basis:'FDV ÷ cumulative pre-TGE volume',
   m:FDV_TGE/PT.l.cumVolTge, applyTo:PT.v.cumVolAll, unit:'%',
   litLeg:'$'+f2(FDV_TGE/1000)+'B ÷ $'+f0(PT.l.cumVolTge)+'B',
   varLeg:'$'+f0(PT.v.cumVolAll)+'B all-time',
   read:'The frame crypto usually ranks perps by, and the one Variational loses. Kept on the page for that reason.'},
  {k:'mark', name:'Lighter today',      basis:'FDV ÷ open interest, both current',
   m:FDV_NOW/PT.l.oiNow,     applyTo:PT.v.oi,        unit:'×',
   litLeg:'$'+f2(FDV_NOW/1000)+'B ÷ $'+f1(PT.l.oiNow/1000)+'B',
   varLeg:'$'+f1(PT.v.oi/1000)+'B book',
   read:'Eight months of price discovery later, the market pays more per dollar of book than it did on day one.'}
];
MULT.forEach(function(x){ x.implied = x.m * x.applyTo; });

const IMPL = {};
MULT.forEach(function(x){ IMPL[x.k] = x.implied; });
const BASE = IMPL.oi, LOWC = IMPL.vol, HIGHC = IMPL.mark;
const SPAN_LO = Math.min.apply(null, MULT.map(function(x){return x.implied;}));
const SPAN_HI = Math.max.apply(null, MULT.map(function(x){return x.implied;}));

/* ---------- formatting ---------- */
function f0(n){return n.toLocaleString('en-US',{maximumFractionDigits:0});}
function f1(n){return n.toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});}
function f2(n){return n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
/* every dollar figure in this module is carried in $M */
function usd(m){
  if(m>=1000) return '$'+f2(m/1000)+'B';
  return '$'+f0(m)+'M';
}
function usdB(m){return '$'+f2(m/1000)+'B';}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function el(id){return document.getElementById(id);}

/* ---------- svg helpers ---------- */
function path(pts){
  var d='',i;
  for(i=0;i<pts.length;i++) d+=(i?'L':'M')+pts[i][0].toFixed(1)+' '+pts[i][1].toFixed(1);
  return d;
}
function tick(v){ /* nice $ label for a $M value */
  if(!v) return '$0';
  if(v>=1000) return '$'+(v/1000).toFixed(v%1000===0?0:1)+'B';
  return '$'+Math.round(v)+'M';
}

/* ==================================================================
   2. THE TAPE — real BTCUSDT daily candles from Binance over each
   venue's own 252 days, with that venue's book directly underneath on
   the same day axis. Both price panels share one dollar scale and both
   book panels share another, so the two columns are read against each
   other and not just against themselves. Shaded columns are stretches
   Bitcoin spent more than 15% below its running high.
   ================================================================== */
var TAPE_PMIN=55000, TAPE_PMAX=128000, TAPE_OMAX=1600;
var TAPE_COLS=[
  {k:'v', cls:'var', candles:'varC', off:'varOff', oi:'varOi',
   btcId:'ptBtcV', oiId:'ptOiV', ohlcId:'ptOhlcV', ddDay:195},
  {k:'l', cls:'lit', candles:'litC', off:'litOff', oi:'litOi',
   btcId:'ptBtcL', oiId:'ptOiL', ohlcId:'ptOhlcL', ddDay:80}
];

function bands(flags,X,bw,top,h){
  var s='',i,run=null;
  for(i=0;i<=flags.length;i++){
    var on=i<flags.length&&flags[i]==='1';
    if(on&&run===null) run=i;
    if(!on&&run!==null){
      s+='<rect class="pt-band" x="'+X(run).toFixed(1)+'" y="'+top+'" width="'+Math.max(1,(i-run)*bw).toFixed(1)+'" height="'+h+'"/>';
      run=null;
    }
  }
  return s;
}

function drawCandles(col){
  var host=el(col.btcId); if(!host||!host.clientWidth) return;
  var W=host.clientWidth, H=210, padR=52, padL=2, padT=8, padB=4;
  var plotR=W-padR, plotB=H-padB, plotT=padT;
  var C=PT_S[col.candles], n=C.length;
  var bw=(plotR-padL)/n;
  var X=function(i){return padL+i*bw;};
  var Y=function(p){return plotB-(p-TAPE_PMIN)/(TAPE_PMAX-TAPE_PMIN)*(plotB-plotT);};
  var s='';

  s+=bands(PT_S[col.off],X,bw,plotT,plotB-plotT);

  [60000,80000,100000,120000].forEach(function(p){
    var y=Y(p);
    s+='<line class="pt-grid" x1="'+padL+'" x2="'+plotR.toFixed(1)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    s+='<text class="pt-px" x="'+(plotR+7)+'" y="'+(y+3.5).toFixed(1)+'">$'+(p/1000)+'K</text>';
  });

  /* candles. Bodies below 1px collapse to a hairline, which is what a
     253-day window in half a column width comes to. */
  var body=Math.max(1,bw*0.66), i, k, x, o, h, l, c, up, y1, y2;
  for(i=0;i<n;i++){
    k=C[i]; o=k[0]; h=k[1]; l=k[2]; c=k[3];
    if(!c) continue;
    up=c>=o;
    x=X(i)+bw/2;
    s+='<line class="pt-wick'+(up?'':' dn')+'" x1="'+x.toFixed(2)+'" x2="'+x.toFixed(2)+'" y1="'+Y(h).toFixed(1)+'" y2="'+Y(l).toFixed(1)+'"/>';
    y1=Y(Math.max(o,c)); y2=Y(Math.min(o,c));
    s+='<rect class="pt-body'+(up?'':' dn')+'" x="'+(x-body/2).toFixed(2)+'" y="'+y1.toFixed(1)+'" width="'+body.toFixed(2)+'" height="'+Math.max(0.8,y2-y1).toFixed(1)+'"/>';
  }

  /* markers: where it started, the trough, where it ended */
  var c0=C[0][3], cN=C[n-1][3], dd=C[col.ddDay];
  s+='<line class="pt-open" x1="'+padL+'" x2="'+plotR.toFixed(1)+'" y1="'+Y(c0).toFixed(1)+'" y2="'+Y(c0).toFixed(1)+'"/>';
  s+='<text class="pt-mark" x="'+(padL+6)+'" y="'+(Y(c0)-6).toFixed(1)+'">day 0 · $'+f0(c0)+'</text>';
  if(dd){
    var dx=X(col.ddDay)+bw/2, dy=Y(dd[2]);
    s+='<circle class="pt-trough" cx="'+dx.toFixed(1)+'" cy="'+dy.toFixed(1)+'" r="3"/>';
    s+='<text class="pt-mark dn" x="'+dx.toFixed(1)+'" y="'+(dy+15).toFixed(1)+'" text-anchor="middle">$'+f0(dd[3])+'</text>';
  }
  s+='<rect class="pt-last'+(cN>=c0?'':' dn')+'" x="'+(plotR+2)+'" y="'+(Y(cN)-8).toFixed(1)+'" width="'+(padR-4)+'" height="16" rx="2"/>';
  s+='<text class="pt-lastv" x="'+(plotR+7)+'" y="'+(Y(cN)+3.5).toFixed(1)+'">$'+f0(cN)+'</text>';

  s+='<line class="pt-cross" x1="0" x2="0" y1="'+plotT+'" y2="'+plotB+'" style="display:none"/>';

  host.setAttribute('viewBox','0 0 '+W+' '+H);
  host.setAttribute('height',H);
  host.innerHTML=s;
  host.__geo={padL:padL,bw:bw,n:n,plotT:plotT,plotB:plotB};
}

function drawOi(col){
  var host=el(col.oiId); if(!host||!host.clientWidth) return;
  var W=host.clientWidth, H=104, padR=52, padL=2, padT=10, padB=16;
  var plotR=W-padR, plotB=H-padB, plotT=padT;
  var V=PT_S[col.oi], n=V.length;
  var bw=(plotR-padL)/n;
  var X=function(i){return padL+i*bw;};
  var Y=function(v){return plotB-v/TAPE_OMAX*(plotB-plotT);};
  var s='';

  s+=bands(PT_S[col.off],X,bw,plotT,plotB-plotT);
  /* only the mid gridline is labelled — the top one sits within a few pixels
     of each venue's end-of-window value and the two labels collided. */
  [800,1600].forEach(function(v){
    var y=Y(v);
    s+='<line class="pt-grid" x1="'+padL+'" x2="'+plotR.toFixed(1)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    if(v===800) s+='<text class="pt-px" x="'+(plotR+7)+'" y="'+(y+3.5).toFixed(1)+'">'+tick(v)+'</text>';
  });

  var pts=V.map(function(v,i){return [X(i)+bw/2,Y(v)];});
  s+='<path class="pt-oi-area '+col.cls+'" d="'+path(pts)+'L'+(plotR).toFixed(1)+' '+plotB+'L'+padL+' '+plotB+'Z"/>';
  s+='<path class="pt-oi-line '+col.cls+'" d="'+path(pts)+'"/>';

  var last=V[n-1];
  s+='<circle class="pt-dot '+col.cls+'" cx="'+(X(n-1)+bw/2).toFixed(1)+'" cy="'+Y(last).toFixed(1)+'" r="3.2"/>';
  s+='<text class="pt-oiv '+col.cls+'" x="'+(plotR+7)+'" y="'+(Y(last)+3.5).toFixed(1)+'">'+usdB(last)+'</text>';
  s+='<text class="pt-mark" x="'+(padL+6)+'" y="'+(Y(V[0])-7).toFixed(1)+'">day 0 · '+usd(V[0])+'</text>';

  s+='<line class="pt-cross" x1="0" x2="0" y1="'+plotT+'" y2="'+plotB+'" style="display:none"/>';

  host.setAttribute('viewBox','0 0 '+W+' '+H);
  host.setAttribute('height',H);
  host.innerHTML=s;
  host.__geo={padL:padL,bw:bw,n:n};
}

function ohlcText(col,i){
  var C=PT_S[col.candles], V=PT_S[col.oi], k=C[i];
  if(!k) return '';
  var up=k[3]>=k[0];
  return '<i>day '+i+'</i>'+
    '<em>O</em><b>'+f0(k[0])+'</b>'+
    '<em>H</em><b>'+f0(k[1])+'</b>'+
    '<em>L</em><b>'+f0(k[2])+'</b>'+
    '<em>C</em><b class="'+(up?'up':'dn')+'">'+f0(k[3])+'</b>'+
    '<em>OI</em><b class="oi">'+usd(V[i])+'</b>';
}

function initCrosshair(){
  TAPE_COLS.forEach(function(col){
    var wrap=document.querySelector('[data-pt-col="'+col.k+'"]');
    if(!wrap||wrap.__wired) return;
    wrap.__wired=true;
    var set=function(i){
      var out=el(col.ohlcId); if(out) out.innerHTML=ohlcText(col,i);
      [col.btcId,col.oiId].forEach(function(id){
        var svg=el(id); if(!svg||!svg.__geo) return;
        var g=svg.__geo, line=svg.querySelector('.pt-cross');
        if(!line) return;
        var x=g.padL+i*g.bw+g.bw/2;
        line.setAttribute('x1',x.toFixed(1)); line.setAttribute('x2',x.toFixed(1));
        line.style.display='';
      });
    };
    var clear=function(){
      var out=el(col.ohlcId); if(out) out.innerHTML=ohlcText(col,PT_S[col.candles].length-1);
      [col.btcId,col.oiId].forEach(function(id){
        var svg=el(id), line=svg&&svg.querySelector('.pt-cross');
        if(line) line.style.display='none';
      });
    };
    wrap.addEventListener('mousemove',function(e){
      var svg=el(col.btcId); if(!svg||!svg.__geo) return;
      var r=svg.getBoundingClientRect(), g=svg.__geo;
      var i=Math.round((e.clientX-r.left-g.padL-g.bw/2)/g.bw);
      if(i<0) i=0; if(i>g.n-1) i=g.n-1;
      set(i);
    });
    wrap.addEventListener('mouseleave',clear);
    clear();
  });
}

function drawTape(){
  TAPE_COLS.forEach(function(col){ drawCandles(col); drawOi(col); });
  initCrosshair();
}

/* ==================================================================
   3. TABLES
   ================================================================== */
function row(cells,cls){
  return '<div class="pt-row'+(cls?' '+cls:'')+'">'+cells+'</div>';
}
function cell(v,sub,cls){
  return '<div class="pt-cell'+(cls?' '+cls:'')+'"><strong>'+v+'</strong>'+(sub?'<small>'+sub+'</small>':'')+'</div>';
}

function renderH2H(){
  var host=el('ptH2H'); if(!host)return;
  var R=[
    ['Window', 'Day 0 to day 252 of each points program',
     PT.v.d0+' → '+PT_AS_OF, 'Omni Points, still pre-TGE',
     PT.l.d0+' → 2025-09-27', 'Season 1, 94 days before its TGE', 'n'],
    ['Bitcoin over the window','Close to close inside each venue’s own 252 days',
     f1(PT.v.btcChg)+'%','peak-to-trough '+f1(PT.v.btcMdd)+'%',
     '+'+f1(PT.l.btcChg)+'%','peak-to-trough '+f1(PT.l.btcMdd)+'%','v'],
    ['Days below the tape’s high','Share of the program with BTC >15% off its running high',
     f1(PT.v.off)+'%','208 of 253 days',
     f1(PT.l.off)+'%','54 of 253 days','v'],
    ['Open interest at day 252','Both venues’ published basis — see the audit below',
     usdB(PT.v.oi),f2(PT.v.oi/PT.l.oi252)+'× Lighter’s day-252 book',
     usdB(PT.l.oi252),'reached with 94 days still to run','v'],
    ['Average book across the program','Mean daily open interest, day 0 to 252',
     usd(PT.v.avgOi),f1(PT.v.avgOi/PT.l.avgOi)+'× Lighter',
     usd(PT.l.avgOi),'built from zero','v'],
    ['Cumulative volume','Sum of daily volume inside the window',
     '$'+f0(PT.v.cumVol)+'B',f2(PT.l.cumVol/PT.v.cumVol)+'× less flow',
     '$'+f0(PT.l.cumVol)+'B','the frame Lighter wins','l'],
    ['Capital turnover','Average daily volume ÷ average book',
     f2((PT.v.cumVol*1000/253)/PT.v.avgOi)+'×/day','capital sits',
     f2((PT.l.cumVol*1000/253)/PT.l.avgOi)+'×/day','capital rotates','n']
  ];
  var h=row('<div class="pt-cell k"></div>'+
            '<div class="pt-cell var"><b><img src="'+VAR_LOGO+'" alt="" width="16" height="16">Variational</b><small>day 0 '+PT.v.d0+'</small></div>'+
            '<div class="pt-cell lit"><b><img src="'+LIT_LOGO+'" alt="" width="16" height="16">Lighter · Season 1</b><small>day 0 '+PT.l.d0+'</small></div>','head');
  R.forEach(function(r){
    h+=row('<div class="pt-cell k"><b>'+esc(r[0])+'</b><small>'+esc(r[1])+'</small></div>'+
           cell(r[2],esc(r[3]),r[6]==='v'?'win':'')+
           cell(r[4],esc(r[5]),r[6]==='l'?'win':''));
  });
  host.innerHTML=h;
}

function renderAudit(){
  var host=el('ptAuditGrid'); if(!host)return;
  var vRatio=PT.v.oiApi/PT.v.oiOneSide;
  var lRatio=PT.l.oiPage/PT.l.oiOneSide;
  host.innerHTML=
   '<article class="pt-proof">'+
     '<header><img src="variational-symbol-transparent.png?v=4" alt="" width="18" height="18"><b>Variational</b><span>metadata/stats · 544 listings</span></header>'+
     '<dl>'+
       '<div><dt>Σ taker long</dt><dd>'+usd(PT.v.oiLong)+'</dd></div>'+
       '<div><dt>Σ taker short</dt><dd>'+usd(PT.v.oiShort)+'</dd></div>'+
       '<div class="sum"><dt>one side of the book</dt><dd>'+usd(PT.v.oiOneSide)+'</dd></div>'+
       '<div><dt>reported by the API</dt><dd>'+usdB(PT.v.oiApi)+'</dd></div>'+
       '<div><dt>DeFiLlama print</dt><dd>'+usdB(PT.v.oi)+'</dd></div>'+
       '<div class="ratio"><dt>ratio to one side</dt><dd>'+vRatio.toFixed(3)+'×</dd></div>'+
     '</dl>'+
     '<p>Exactly 2.000000 at full precision. Long ≠ short because the OLP carries the imbalance as the counterparty to every taker position, so every position is counted on both sides.</p>'+
   '</article>'+
   '<article class="pt-proof">'+
     '<header><img src="lighter-logo.png" alt="" width="18" height="18"><b>Lighter</b><span>orderBookDetails · 229 perps</span></header>'+
     '<dl>'+
       '<div class="sum"><dt>Σ over 229 perps of open_interest × mark<br><i>one side of the book</i></dt><dd>'+usd(PT.l.oiOneSide)+'</dd></div>'+
       '<div><dt>published on app.lighter.xyz</dt><dd>'+usdB(PT.l.oiPage)+'</dd></div>'+
       '<div><dt>DeFiLlama print</dt><dd>'+usdB(PT.l.oiNow)+'</dd></div>'+
       '<div class="ratio"><dt>ratio to one side</dt><dd>'+lRatio.toFixed(2)+'×</dd></div>'+
     '</dl>'+
     '<p>Lighter states its stats page is recalculated every 24 hours, so the ratio lands between 2.0× and 2.25× per market rather than exactly 2.0 — BTC 2.13×, ETH 2.20×, LIT 2.03×, ZEC 1.99×. No market reads near 1.0×.</p>'+
   '</article>';
}

function renderMethods(){
  var host=el('ptMethods'); if(!host)return;
  var h=row('<div class="pt-cell k"><b>Method</b></div>'+
            '<div class="pt-cell"><b>What Lighter’s TGE priced</b></div>'+
            '<div class="pt-cell"><b>Applied to Variational</b></div>'+
            '<div class="pt-cell num"><b>Implied FDV</b></div>','head m');
  MULT.forEach(function(m){
    /* m is $M of FDV per $B of volume; /10 restates it as a percentage */
    var mult = m.unit==='%' ? (m.m/10).toFixed(3)+'% of volume' : f2(m.m)+'× book';
    h+=row('<div class="pt-cell k"><b>'+esc(m.name)+'</b><small>'+esc(m.basis)+'</small></div>'+
           '<div class="pt-cell"><strong>'+mult+'</strong><small>'+m.litLeg+'</small></div>'+
           '<div class="pt-cell"><strong>'+m.varLeg+'</strong><small>'+esc(m.read)+'</small></div>'+
           '<div class="pt-cell num'+(m.k==='oi'?' base':'')+'"><strong>'+usdB(m.implied)+'</strong><small>'+(m.k==='oi'?'base case':'')+'</small></div>','m');
  });
  host.innerHTML=h;
}

function renderScenarios(){
  var host=el('ptScenarios'); if(!host)return;
  var cases=[{k:'Conservative',v:LOWC,n:'flow multiple'},{k:'Base',v:BASE,n:'book at TGE'},{k:'Expansion',v:HIGHC,n:'Lighter’s current mark'}];
  var h='<div class="pt-scn head"><div><b>Float at TGE</b></div>'+cases.map(function(c){
    return '<div class="pt-scn-cell'+(c.k==='Base'?' base':'')+'"><b>'+c.k+'</b><small>'+c.n+' · '+usdB(c.v)+' FDV</small></div>';
  }).join('')+'</div>';
  [0.20,0.25,0.30].forEach(function(fl){
    h+='<div class="pt-scn"><div><b>'+Math.round(fl*100)+'% circulating</b><small>'+(fl===0.25?'what Lighter actually did':'FDV × float')+'</small></div>'+
      cases.map(function(c){
        return '<div class="pt-scn-cell'+(c.k==='Base'?' base':'')+'"><strong>'+usdB(c.v*fl)+'</strong><small>day-one market cap</small></div>';
      }).join('')+'</div>';
  });
  host.innerHTML=h;
}


/* A headline that carries both venues has to say which half is whose without
   the reader parsing the caption. Each side gets its own logo and colour. */
var VAR_LOGO='variational-symbol-transparent.png?v=4', LIT_LOGO='lighter-logo.png';
function venue(which,v){
  var lg=which==='var'?VAR_LOGO:LIT_LOGO, nm=which==='var'?'Variational':'Lighter';
  return '<span class="pt-vs-h '+which+'"><img src="'+lg+'" alt="'+nm+'" width="20" height="20">'+
         '<b>'+v+'</b></span>';
}
function versus(a,b){
  return '<span class="pt-vs">'+venue('var',a)+'<span class="pt-vs-x">vs</span>'+venue('lit',b)+'</span>';
}
function renderSignals(){
  var set=function(id,v){var e=el(id); if(e)e.textContent=v;};
  var html=function(id,v){var e=el(id); if(e)e.innerHTML=v;};
  /* The headline number carries the unit; the line under it says what the number
     is and whose it is; the paragraph is context, not a definition. */
  html('ptSigComparable', '<span class="pt-vs">'+venue('lit',usdB(FDV_TGE))+'</span>');
  set('ptSigComparableK','LIT fully diluted, on its TGE day');
  set('ptSigComparableSub','One billion tokens, 25% unlocked on day one, no vesting. It printed '+usdB(FDV_HIGH1)+' in the first hours and bottomed at '+usdB(FDV_LOW)+' four months later.');

  html('ptSigBook', versus(usdB(PT.v.oi), usdB(PT.l.oiNow)));
  set('ptSigBookK','Variational’s open interest vs Lighter’s, today');
  set('ptSigBookSub','Variational is '+f2(PT.v.oi/PT.l.oiNow)+'× the larger. Both figures are the two-sided basis each venue publishes; one-sided, from each venue’s own API, it is '+usd(PT.v.oiOneSide)+' against '+usd(PT.l.oiOneSide)+'.');

  html('ptSigTape', versus(f0(PT.v.off)+'%', f0(PT.l.off)+'%'));
  set('ptSigTapeK','Days Bitcoin sat >15% below its high — VAR vs LIT');
  set('ptSigTapeSub','Out of 252 days each. Variational’s tape closed '+f1(PT.v.btcChg)+'% and fell '+f1(PT.v.btcMdd)+'% peak to trough; Lighter’s closed +'+f1(PT.l.btcChg)+'%.');

  html('ptSigImplied', '<span class="pt-vs">'+venue('var',usdB(BASE))+'</span>');
  set('ptSigImpliedK','Implied fully diluted for Variational, base case');
  set('ptSigImpliedSub','Lighter’s TGE book multiple carried onto Variational’s book. Three other methods put it between '+usdB(SPAN_LO)+' and '+usdB(SPAN_HI)+'.');

  set('ptAsOf','Snapshot '+PT_AS_OF+' · not live');
}

/* ---------- measured series (day-indexed) ---------- */
const PT_S = {"varOi":[859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.4,859.7,978.1,1015.5,1003.5,1035.5,1122.0,1180.4,1089.9,1056.5,1121.3,1049.1,1191.6,1255.6,1136.9,1186.7,1010.9,1025.3,1063.0,1087.2,1112.2,1005.1,1064.7,1080.2,1113.8,984.7,931.1,770.8,734.1,765.4,745.4,720.0,540.1,560.1,584.0,611.3,655.7,644.2,641.1,604.5,647.7,689.3,636.5,672.6,699.6,684.0,691.0,695.5,710.3,712.6,658.1,608.9,654.8,664.8,669.3,667.9,710.1,706.2,698.0,764.0,735.6,672.7,678.7,660.7,739.9,753.5,776.0,790.0,796.1,852.2,879.9,862.8,856.5,794.4,749.5,763.4,734.4,709.1,705.8,735.1,729.0,697.8,688.6,682.1,671.8,686.7,694.0,676.9,641.2,645.7,638.8,651.6,664.1,663.9,646.5,666.5,718.9,708.9,655.1,726.4,697.1,682.7,674.7,703.6,660.8,602.2,638.7,650.4,670.1,679.4,669.6,679.0,691.5,663.4,678.8,645.1,664.9,699.0,696.7,705.8,723.1,759.6,767.0,738.6,761.3,783.1,791.9,803.6,804.8,749.1,826.5,734.5,750.2,730.2,741.5,763.1,804.5,900.4,895.5,930.6,964.0,1014.9,1005.7,953.1,952.9,1015.0,1067.0,1081.8,1087.5,958.8,974.1,837.4,754.7,809.4,846.2,846.8,833.5,798.4,852.0,858.0,904.1,933.2,973.3,991.9,927.0,957.9,1026.6,1080.4,1062.3,1079.8,1056.5,1007.5,992.1,1024.0,1021.5,1022.8,1107.2,1145.4,1034.3,1065.7,1140.4,1173.9,1176.0,1196.1,1173.8,1165.9,1180.3,1264.9,1287.7,1282.0,1298.1,1281.9,1263.0,1222.1,1262.7,1321.1,1339.7,1342.3,1375.8,1357.7,1326.9,1333.0,1365.6,1369.6,1316.1,1294.9,1274.5,1252.6,1245.3,1264.9,1296.6,1334.3,1361.4,1385.5,1400.6,1413.2,1421.9,1442.3,1430.0,1425.7,1419.3,1441.2,1469.8,1498.7,1517.4,1570.7,1567.0,1368.0,1405.6,1448.9,1397.3,1429.2,1429.3,1405.7,1440.6],"litOi":[0.1,0.2,0.4,0.8,0.6,0.5,0.8,1.2,0.9,1.2,1.6,1.2,1.8,2.2,2.9,1.7,1.4,1.4,2.2,3.2,2.3,2.6,2.6,3.7,7.5,3.5,4.3,4.1,5.1,5.2,5.4,8.6,7.1,6.4,9.5,10.5,9.5,5.4,5.1,4.6,5.0,4.5,4.4,5.3,6.2,6.1,10.8,12.5,11.7,12.7,14.9,13.7,13.2,15.4,19.1,20.9,27.3,26.4,27.6,28.9,41.2,39.6,42.5,45.4,41.1,42.8,63.3,55.5,60.7,55.4,62.7,56.7,79.7,74.3,65.0,66.7,77.6,79.2,67.6,64.1,69.0,60.3,70.5,90.3,103.2,116.4,105.2,116.2,114.2,122.6,173.2,155.7,156.1,169.7,134.1,132.5,169.7,187.9,196.0,198.6,194.3,197.4,204.1,209.1,215.8,226.9,216.1,225.1,219.2,214.3,195.5,170.3,183.1,206.4,186.3,176.8,169.7,164.4,169.3,165.0,166.9,168.4,172.5,199.3,217.7,186.7,186.1,194.5,197.6,217.8,217.3,194.3,170.0,183.1,192.0,207.9,213.6,204.3,210.1,221.9,225.4,237.1,261.4,269.6,249.9,264.7,248.9,255.1,255.7,243.9,256.6,256.6,262.7,228.6,225.6,237.2,256.7,281.3,293.8,304.8,321.4,336.3,325.6,348.9,358.1,408.3,433.6,415.7,415.6,436.5,452.1,475.4,461.6,451.2,463.1,436.8,474.2,466.8,498.0,497.9,503.4,486.9,520.1,648.4,615.1,563.0,476.4,440.3,526.0,496.0,536.2,487.7,464.5,466.7,462.8,433.4,405.5,437.4,451.8,435.3,462.8,536.2,556.2,617.3,631.2,606.9,659.9,766.2,616.9,573.2,607.7,645.4,639.9,565.8,598.6,578.7,604.0,690.0,668.4,655.1,610.9,588.8,651.9,572.5,589.2,589.9,590.9,639.2,647.1,685.7,739.3,730.1,740.1,773.4,819.4,791.7,808.8,893.0,921.7,873.8,847.3,883.7,1019.9,1122.6,1107.8,1163.1,1211.5,1136.6,1206.8,1214.6,1061.7,1178.6,1255.6],"varOff":"0000000000000000000000000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111","litOff":"0000000000000000000000000000000000000011111011011111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","varC":[[87863,90366,85314,86243],[86243,89478,84450,85516],[85516,89400,85110,88137],[88137,88573,87796,88361],[88361,89082,87600,88659],[88659,90588,87900,88621],[88621,88940,86602,87486],[87486,88050,86420,87669],[87669,88593,86935,87225],[87225,89568,86655,87370],[87370,87984,87253,87877],[87877,88089,87435,87953],[87953,90406,86806,87237],[87237,89400,86846,88485],[88486,89200,87250,87648],[87648,88919,87550,88839],[88839,90962,88380,89995],[89995,90741,89314,90628],[90628,91810,90628,91530],[91530,94789,91515,93860],[93860,94444,91263,93748],[93748,93748,90676,91364],[91364,91688,89311,91100],[91100,92083,89695,90641],[90641,90832,90404,90505],[90505,91284,90236,91014],[91014,92520,90128,91296],[91296,96495,91043,95414],[95414,97924,94559,96952],[96952,97193,95134,95605],[95605,95871,94293,95551],[95551,95639,95022,95148],[95148,95531,93615,93673],[93673,93673,91910,92631],[92631,92870,87896,88428],[88428,90574,87264,89455],[89455,90360,88515,89560],[89560,91225,88578,89600],[89600,89957,89162,89225],[89225,89319,86075,86670],[86670,88860,86510,88347],[88347,89523,87304,89250],[89250,90600,88834,89300],[89300,89348,83383,84650],[84650,84736,81118,84260],[84260,84270,75720,78741],[78741,79424,75700,76968],[76968,79360,74604,78739],[78739,79187,72946,75770],[75770,76972,71888,73166],[73166,73341,62345,62910],[62910,71751,60000,70580],[70580,71690,67300,69289],[69289,72271,68888,70330],[70330,71454,68308,70138],[70138,70528,67800,68841],[68841,69293,65756,67083],[67083,68411,65118,66272],[66272,69483,65872,68854],[68854,70560,68730,69823],[69823,70983,68000,68833],[68833,70127,67294,68892],[68892,69242,66621,67504],[67504,68476,65870,66461],[66461,67320,65632,67004],[67004,68318,66280,68020],[68020,68699,67535,67976],[67976,68245,67190,67643],[67643,67685,63889,64656],[64656,65027,62510,64058],[64058,69989,63913,67988],[67988,68860,66500,67485],[67485,68217,64914,65872],[65872,67760,63030,66973],[66973,68200,65056,65776],[65776,70096,65259,68830],[68830,69258,66158,68338],[68338,74050,67400,72667],[72667,73558,70645,70891],[70891,71420,67745,68114],[68114,68551,66915,67263],[67263,68200,65618,65971],[65971,69517,65822,68432],[68432,71777,68391,69949],[69949,71321,68978,70192],[70192,70800,69206,70541],[70541,73914,70386,70930],[70930,71308,70317,71212],[71212,73199,70859,72815],[72815,74909,72270,74885],[74885,76000,73399,73909],[73909,74672,70500,71247],[71247,71614,68793,69930],[69930,71367,69388,70511],[70511,71101,68571,68918],[68918,69589,67361,67859],[67859,71817,67445,70906],[70906,71400,68923,70557],[70557,72026,70408,71337],[71337,71437,68153,68820],[68820,69179,65548,66407],[66407,67289,65932,66377],[66377,67130,65000,66011],[66011,68170,65801,66797],[66797,68589,65998,68284],[68284,69310,67579,68114],[68114,68653,65712,66902],[66902,67370,66282,66964],[66964,67563,66776,67300],[67300,69136,66612,69034],[69034,70351,68300,68854],[68854,72761,67732,71924],[71924,72857,70707,71070],[71070,73145,70466,71788],[71788,73434,71426,72963],[72963,73790,72513,73043],[73043,73137,70506,70741],[70742,74900,70567,74418],[74418,76038,73795,74132],[74132,75425,73514,74810],[74810,75535,73310,75154],[75154,78333,74529,77072],[77072,77420,75445,75692],[75692,76241,73763,73802],[73802,76559,73724,75841],[75841,76928,74822,76336],[76336,79473,76133,78178],[78178,78662,76960,78257],[78257,78582,77264,77437],[77437,77885,77140,77625],[77625,78961,77327,78658],[78658,79486,76460,77371],[77371,77478,75667,76343],[76343,77905,74938,75780],[75780,76669,75324,76347],[76347,78914,76320,78231],[78231,79199,78040,78687],[78687,79447,78084,78569],[78569,80777,78202,79861],[79861,81791,79809,80906],[80906,82850,80731,81447],[81447,81708,79500,80006],[80006,80500,79181,80193],[80193,81080,80130,80678],[80678,82479,80280,82210],[82210,82380,80463,81746],[81746,81788,79844,80504],[80504,81325,78755,79314],[79314,82048,78922,81090],[81090,81664,78659,79113],[79113,79228,77640,78148],[78148,78600,76735,77458],[77458,77800,76051,77002],[77002,77415,76145,76834],[76834,77853,76517,77552],[77552,78200,76719,77616],[77616,77900,75359,75540],[75540,77404,74290,76752],[76752,77543,76108,77065],[77065,77906,76914,77322],[77322,78080,75678,75930],[75930,76174,74244,74449],[74449,74591,72583,73618],[73618,74514,72512,73461],[73461,74144,73216,73884],[73884,74276,73400,73674],[73674,74092,70687,71409],[71409,71409,66193,66761],[66761,67516,64092,64143],[64143,64764,61384,63886],[63886,63978,59131,61056],[61056,61530,59500,60885],[60885,64235,60746,63332],[63332,64200,62408,63086],[63086,63526,60780,61730],[61730,62858,60755,61511],[61511,63933,61511,63626],[63626,64394,62830,63580],[63580,64763,63419,64458],[64458,65800,63679,65746],[65746,67292,65354,66329],[66329,66992,65361,65675],[65675,66446,63916,64509],[64509,64806,62272,62958],[62958,63666,62316,63544],[63544,64388,63184,64298],[64298,64588,63270,63312],[63312,65623,63312,64020],[64020,64275,61938,62735],[62735,63239,59103,61078],[61078,61962,58115,59794],[59795,60760,58337,60097],[60097,60941,59855,60029],[60029,60545,58905,59577],[59577,60781,58900,60260],[60260,60277,58201,58625],[58625,61334,57800,60024],[60024,62200,59588,61560],[61560,62980,61249,62583],[62583,63462,62328,63144],[63144,63999,62437,63650],[63650,64700,61307,64042],[64043,64314,62671,63364],[63364,63762,61545,62290],[62290,63500,61705,63230],[63230,64693,62926,64162],[64162,64504,63819,63819],[63819,64290,63641,63780],[63780,64425,61825,62335],[62335,65100,62272,65044],[65044,65600,64485,64756],[64756,64998,63749,63830],[63830,64388,62538,63932],[63932,64865,63887,64834],[64834,64967,64280,64723],[64723,65799,63100,65256],[65256,66956,65149,66556],[66556,66740,65554,66114],[66114,66313,64650,65099],[65099,65809,63740,64140],[64140,64475,63810,64375],[64375,65577,64294,65400],[65400,65745,63606,63756],[63756,64100,62742,63915],[63915,64745,63267,63984],[63984,65177,63604,64780],[64780,65410,62466,62888],[62888,63150,62275,62824],[62824,63796,62807,63570],[63570,64080,62300,63520],[63520,64549,63322,64107],[64107,65025,63880,64665],[64665,64999,64172,64324],[64324,65391,64166,64923],[64923,65193,64784,64963],[64963,65474,64730,64902],[64902,65391,63806,63970],[63970,64515,63238,63600],[63600,64500,63310,63480],[63480,64010,62802,63491],[63491,63617,62535,63044],[63044,63188,62920,63086],[63086,63390,62716,62900],[62900,64610,62751,64532],[64532,65059,64028,64725],[64725,70000,64166,69335],[69335,73400,68902,73025],[73027,79500,73027,78338],[78338,78828,76500,77075],[77075,78053,75546,77734],[77734,80000,76670,78993],[78993,81273,77851,78539],[78539,79252,77918,78034]],"litC":[[104077,104989,102278,104556],[104556,106422,99652,101332],[101332,109588,99550,102260],[102260,107241,100119,106144],[106144,106394,103339,103707],[103707,106850,101262,103910],[103910,107120,102750,104870],[104871,105287,104106,104747],[104747,105500,102520,102620],[102620,103260,97778,102083],[102083,103800,100273,101336],[101336,104783,101328,103733],[103733,106457,103279,104723],[104723,106012,101560,102430],[102430,102784,100280,100636],[100636,101457,96150,97701],[97701,102500,91231,101329],[101329,101732,96150,97763],[97763,99149,96155,96612],[96612,99120,95677,96554],[96554,100138,95620,96507],[96507,96880,95688,96445],[96445,97323,94713,96463],[96463,98345,95256,97431],[97431,98478,94877,95778],[95778,98120,94088,97870],[97870,98084,95217,96608],[96608,98826,96253,97500],[97500,97972,97224,97570],[97570,97704,96046,96118],[96118,97047,95205,95780],[95780,96754,93388,95672],[95672,96900,95030,96644],[96644,98711,96415,98305],[98305,99475,94872,96182],[96182,96980,95770,96551],[96551,96650,95228,96258],[96258,96500,91349,91553],[91553,92541,86051,88680],[88680,89414,82256,84250],[84250,87078,82716,84709],[84709,85120,78259,84350],[84350,86558,83825,86065],[86065,95000,85051,94270],[94270,94416,85117,86221],[86221,88968,81500,87282],[87282,91000,86335,90606],[90606,92811,87836,89932],[89932,91283,84667,86802],[86802,86897,85218,86222],[86222,86500,80000,80734],[80734,84123,77460,78596],[78596,83617,76606,82933],[82933,84540,80608,83680],[83680,84336,79940,81116],[81116,85310,80819,83983],[83983,84676,83618,84338],[84338,85117,81981,82575],[82575,84757,82456,84010],[84010,84022,81135,82715],[82715,87000,82547,86846],[86846,87454,83655,84223],[84223,84850,83175,84089],[84089,84539,83625,83841],[83841,86130,83810,86082],[86082,88765,85519,87498],[87498,88540,86310,87393],[87393,88275,85860,86909],[86909,87756,85800,87232],[87232,87516,83585,84424],[84424,84625,81645,82649],[82649,83535,81565,82390],[82390,83943,81279,82550],[82550,85579,82433,85158],[85158,88500,82320,82516],[82516,83998,81211,83213],[83213,84720,81659,83890],[83890,84266,82380,83538],[83538,83818,77154,78430],[78430,81244,74508,79163],[79163,80868,76240,76322],[76322,83588,74620,82615],[82615,82753,78464,79607],[79607,84300,78970,83424],[83424,85905,82793,85277],[85277,86100,83034,83760],[83760,85800,83678,84592],[84592,86496,83600,83644],[83644,85500,83112,84030],[84030,85470,83736,84948],[84948,85132,84304,84475],[84475,85678,84364,85077],[85077,85321,83950,85179],[85179,88466,85145,87516],[87516,93888,87076,93443],[93443,94696,91935,93691],[93691,94005,91660,93980],[93980,95758,92856,94639],[94639,95199,93871,94628],[94628,95369,93603,93749],[93749,95630,92800,95011],[95011,95462,93743,94257],[94257,95228,92910,94172],[94172,97424,94130,96490],[96490,97896,96350,96887],[96887,96936,95753,95856],[95856,96304,94151,94278],[94278,95199,93514,94734],[94734,96921,93377,96834],[96834,97732,95785,97030],[97030,104146,96876,103262],[103262,104361,102315,102972],[102972,104985,102819,104810],[104810,104972,103345,104118],[104118,105819,100718,102791],[102791,104976,101430,104104],[104104,104357,102602,103508],[103508,104193,101383,103764],[103764,104550,103100,103464],[103464,103710,102612,103127],[103127,106660,103105,106454],[106454,107109,102000,105574],[105574,107320,104185,106850],[106850,110797,106100,109644],[109644,111980,109177,111696],[111696,111800,106800,107318],[107318,109506,106875,107762],[107762,109300,106601,109004],[109004,110422,108671,109435],[109435,110718,107517,108938],[108938,109285,106769,107782],[107782,108892,105323,105590],[105590,106313,103621,103985],[103985,104900,103069,104592],[104592,105867,103752,105643],[105643,105936,103660,105858],[105858,106795,104872,105377],[105377,106000,104179,104697],[104697,105910,100372,101509],[101509,105333,101096,104288],[104288,105900,103871,105552],[105552,106488,104964,105734],[105734,110530,105318,110263],[110263,110400,108331,110274],[110274,110392,108064,108645],[108645,108814,105672,105672],[105672,106180,102664,106067],[106067,106252,104300,105415],[105415,106129,104495,105594],[105594,108952,104980,106795],[106795,107771,103371,104551],[104551,105550,103500,104887],[104887,105226,103929,104659],[104659,106525,102345,103298],[103298,103983,100838,102120],[102120,103400,98200,100964],[100964,106074,99613,105334],[105334,106290,104622,106083],[106083,108135,105808,107341],[107341,108272,106562,106947],[106947,107735,106357,107048],[107048,107578,106812,107297],[107297,108528,107173,108357],[108357,108790,106733,107146],[107147,107540,105251,105681],[105681,109730,105100,108850],[108850,110529,108530,109585],[109585,109768,107245,107984],[107984,108421,107756,108198],[108198,109700,107800,109204],[109204,109700,107513,108263],[108263,109217,107430,108923],[108923,112000,108325,111234],[111234,116868,110500,116010],[116010,118870,115222,117528],[117528,118200,116900,117420],[117420,119488,117225,119087],[119087,123218,118905,119841],[119841,119941,115737,117758],[117758,120064,117017,118630],[118630,120999,117454,119178],[119178,120821,116813,117925],[117925,118500,117277,117840],[117840,118857,116467,117265],[117265,119677,116515,117380],[117380,120248,116128,119954],[119954,120090,117301,118756],[118756,119450,117103,118341],[118341,118452,114723,117614],[117614,118297,117138,117920],[117920,119767,117826,119416],[119416,119800,117428,118062],[118062,119273,116951,117951],[117951,118792,115796,117840],[117840,118922,115500,115764],[115764,116052,112723,113298],[113298,114063,112003,112546],[112546,114800,111920,114209],[114209,115720,114108,115055],[115055,115128,112650,114130],[114130,115716,113355,114992],[114992,117621,114259,117472],[117472,117630,115879,116675],[116675,117944,116299,116462],[116462,119311,116461,119294],[119294,122335,118050,118686],[118686,120324,118207,120134],[120134,123668,118921,123306],[123306,124474,117180,118295],[118295,119217,116804,117342],[117342,117899,117144,117381],[117381,118575,117172,117405],[117405,117544,114640,116227],[116227,116726,112733,112873],[112873,114615,112380,114271],[114271,114822,112016,112500],[112500,117429,111685,116936],[116936,117030,114560,115438],[115438,115667,110680,113494],[113494,113667,109274,110112],[110112,112371,108667,111763],[111763,112625,110345,111262],[111262,113486,110862,112567],[112567,112639,107464,108377],[108377,108926,107350,108816],[108816,109480,108077,108246],[108246,109912,107255,109237],[109237,111772,108393,111240],[111240,112575,110529,111706],[111706,112180,109329,110731],[110731,113385,110207,110660],[110660,111308,109977,110188],[110188,111600,110180,111137],[111137,112924,110622,112065],[112065,113293,110767,111546],[111546,114313,110917,113960],[113960,115488,113430,115483],[115483,116666,114741,116029],[116029,116299,115127,115918],[115918,116165,115135,115268],[115268,116758,114384,115350],[115350,116964,114737,116789],[116789,117287,114721,116448],[116448,117900,116093,117074],[117074,117460,115100,115632],[115632,116122,115408,115686],[115686,115819,115188,115232],[115232,115379,111800,112651],[112651,113290,111459,111999],[111999,113940,111043,113307],[113307,113510,108632,108994],[108994,110300,108620,109643],[109643,109744,109064,109636]]};

/* ==================================================================
   4. WIRING
   ================================================================== */
function drawCharts(attempt){
  var n=attempt|0;
  var b=el('ptBtcV');
  var w=b?b.clientWidth:0;
  /* The panel is display:none until its tab opens, so a call can land one frame
     before layout gives the SVG a width. Each trigger gets its own budget —
     a shared counter would burn out on the first hidden render and never
     recover when the tab is finally opened. */
  if(!w){
    if(n<30) requestAnimationFrame(function(){drawCharts(n+1);});
    return;
  }
  try{ drawTape(); }
  catch(err){ console.warn('Pre-TGE chart render skipped:',err); }
}
function kick(){ drawCharts(0); }
window.__PT_draw=kick;
function renderAll(){
  renderSignals(); renderH2H(); renderAudit(); renderMethods(); renderScenarios();
  kick();
}

function initJump(){
  var bar=document.querySelector('[data-pt-command]'); if(!bar)return;
  bar.addEventListener('click',function(e){
    var b=e.target.closest('button[data-pt-jump]'); if(!b)return;
    var t=el(b.dataset.ptJump); if(!t)return;
    bar.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
    t.scrollIntoView({behavior:'smooth',block:'start'});
  });
}

function registerTab(){
  /* dashboard.js declares VALID_TABS / SECTION_COPY as top-level consts, which
     land in the global lexical scope — reachable by name from this file, but
     not as window properties. Both are mutable objects. */
  try{
    if(typeof VALID_TABS!=='undefined' && VALID_TABS.indexOf('pretge')<0) VALID_TABS.push('pretge');
    if(typeof DEFAULT_TAB_ORDER!=='undefined' && DEFAULT_TAB_ORDER.indexOf('pretge')<0){
      var i=DEFAULT_TAB_ORDER.indexOf('comparison');
      DEFAULT_TAB_ORDER.splice(i<0?DEFAULT_TAB_ORDER.length:i+1,0,'pretge');
    }
    if(typeof SECTION_COPY!=='undefined') SECTION_COPY.pretge={
      eyebrow:'Pre-TGE comparable',
      title:'Pre-TGE Comparison',
      description:'Lighter ran the same kind of pre-TGE points program and then let a market price it. This reads Variational against that run day-for-day and bounds what its own TGE implies.',
      chip:'valuation'
    };
  }catch(_){}
}

function boot(){
  registerTab();
  renderAll();
  initJump();

  var panel=document.querySelector('[data-tg="pretge"]');
  if(panel){
    /* showTab() toggles .tg-hide; redraw once the panel actually has a width */
    new MutationObserver(function(){
      if(!panel.classList.contains('tg-hide')) kick();
    }).observe(panel,{attributes:true,attributeFilter:['class']});
    if(typeof ResizeObserver!=='undefined'){
      var t=null;
      new ResizeObserver(function(){
        clearTimeout(t); t=setTimeout(function(){ if(!panel.classList.contains('tg-hide')) kick(); },120);
      }).observe(panel);
    }
  }

  /* dashboard.js already ran showTab() for the initial hash before this file
     registered the tab, so a direct #pretge link would have fallen back to
     Overview. Re-open it. */
  var wt=null;
  window.addEventListener('resize',function(){
    clearTimeout(wt); wt=setTimeout(function(){
      var pn=document.querySelector('[data-tg="pretge"]');
      if(pn&&!pn.classList.contains('tg-hide')) kick();
    },140);
  });

  if(location.hash==='#pretge'&&typeof showTab==='function'){
    try{showTab('pretge',{push:false});}catch(_){}
  }
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();

})();
