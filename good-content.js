(function(){
'use strict';
var TAB='good-content';
var items=[
 {"title": "Six questions for VAR bulls and bears", "publisher": "KoolKrypto · @koolkrypto223", "date": "2026-11-02", "type": "X · Discussion", "url": "https://x.com/koolkrypto223/status/2116989437808980169", "en": "Questions on valuation, regulation, spread compression, OLP risk and the role of Variational Pro.", "ko": "가치평가·규제·스프레드 압축·OLP 위험·Variational Pro의 역할을 묻는 여섯 가지 질문."},
 {"title": "Brokerage valuation and the competitive landscape", "publisher": "hansolar · @hansolar21", "date": "2026-11-02", "type": "X · Commentary", "url": "https://x.com/hansolar21/status/2117064367133085900", "en": "Hansolar compares brokerage valuation frameworks and discusses the team’s liquidity expertise.", "ko": "hansolar가 제시한 브로커리지 비교기업 관점과 팀의 유동성 운영 경험에 대한 의견."},
 {"title": "Why the single-dealer model—and where Pro fits", "publisher": "edward.var · @edward_yu_var", "date": "2026-11-02", "type": "X · Founder response", "url": "https://x.com/edward_yu_var/status/2117050271872487521", "en": "Edward explains the brokerage model, liquidity aggregation, execution priorities and multi-dealer plans for Pro.", "ko": "Edward가 설명하는 브로커리지 모델·유동성 통합·최선의 체결과 Pro의 멀티딜러 방향."},
 {"title": "Pro, the user moat and OLP counterparty risk", "publisher": "edward.var · @edward_yu_var", "date": "2026-11-02", "type": "X · Follow-up", "url": "https://x.com/edward_yu_var/status/2117088513766416453", "en": "Follow-up on custom derivatives, user relationships and the distinction between OLP capital risk and user settlement funds.", "ko": "맞춤형 파생상품·사용자 기반과 OLP 자본 위험 및 사용자 정산 자금의 차이에 대한 후속 답변."},
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
