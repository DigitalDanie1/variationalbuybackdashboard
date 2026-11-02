(function(){
'use strict';
var TAB='good-content';
var items=[
 {title:'Variational and the Shift to Onchain Brokerage',publisher:'DeFiLlama Research',date:'2026-06-16',type:'Research',url:'https://investors.defillama.com/research/report/variational-and-the-shift-to-onchain-brokerage',en:'The brokerage model, OLP economics, revenue distribution and risks.',ko:'브로커리지 모델, OLP 경제 구조, 수익 배분과 위험을 다룬 리서치.'},
 {title:'Swaps & Perpetual Futures: Comparison',publisher:'Variational Help Center',date:'2026-09-09',type:'Official guide',url:'https://help.variational.io/en/articles/16643437-swaps-perpetual-futures-comparison',en:'How Perps and Swaps differ in funding, liquidity, trading hours and margin.',ko:'Perps와 Swaps의 펀딩·유동성·거래 시간·증거금 차이를 정리한 공식 가이드.'},
 {title:'Fees, Revenue & Holders Revenue',publisher:'DeFiLlama',date:null,type:'Reference',url:'https://enterprise.defillama.com/data-definitions',en:'The source definitions behind protocol and tokenholder revenue comparisons.',ko:'프로토콜 수익과 토큰 홀더 귀속 수익을 비교할 때 사용하는 원본 지표 정의.'}
];
var host;
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
function render(){var ko=(document.documentElement.lang||'').startsWith('ko');host.innerHTML='<h2>Good Content</h2><div class="gc-list">'+items.map(function(x,i){return '<article class="gc-item"><span class="gc-number">0'+(i+1)+'</span><div><div class="gc-meta"><b>'+esc(x.publisher)+'</b><span>'+esc(x.type)+'</span>'+(x.date?'<time datetime="'+x.date+'">'+x.date+'</time>':'')+'</div><h3><a href="'+x.url+'" target="_blank" rel="noopener noreferrer">'+esc(x.title)+' <span aria-hidden="true">↗</span></a></h3><p>'+esc(ko?x.ko:x.en)+'</p></div></article>';}).join('')+'</div>';}
function boot(){
 VALID_TABS.push(TAB);DEFAULT_TAB_ORDER.push(TAB);SECTION_COPY[TAB]={eyebrow:'Reading list',title:'Good Content',description:'Research, official guides and references.',chip:'Reading'};
 host=document.createElement('section');host.className='gc-section tsec tg-hide';host.dataset.tg=TAB;document.getElementById('main').appendChild(host);render();
 var b=document.createElement('button');b.type='button';b.id='tab-'+TAB;b.dataset.tab=TAB;b.setAttribute('role','tab');b.textContent='Good Content';document.getElementById('tabs').appendChild(b);
 document.querySelectorAll('[data-open-tab="comparing-revenue"]').forEach(function(anchor){var mine=anchor.cloneNode(true);mine.dataset.openTab=TAB;var label=mine.querySelector('strong')||mine.querySelector('b');if(label)label.textContent='Good Content';mine.setAttribute('aria-label','Good Content');anchor.parentNode.insertBefore(mine,anchor.nextSibling);});
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 if(location.hash==='#'+TAB)showTab(TAB,{push:false});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
