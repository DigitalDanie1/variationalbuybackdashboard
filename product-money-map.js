(function(){
'use strict';
var box=document.createElement('section');box.className='product-money-map';box.id='product-money-map';box.setAttribute('translate','no');
function render(){
 var ko=(document.documentElement.lang||'').indexOf('ko')===0;
 var t=function(en,kr){return ko?kr:en;};
 var report=null;try{report=BIWEEKLY_HISTORY.filter(function(r){return r.spreads2w>0&&r.treasury2w!=null&&r.olpPnl2w!=null;}).slice(-1)[0];}catch(_){}
 // The source schema uses olpPnl; retain reported amounts, never derive product shares.
 try{if(!report)report=BIWEEKLY_HISTORY.filter(function(r){return r.spreads2w>0&&r.treasury2w!=null;}).slice(-1)[0];}catch(_){}
 var fmt=function(v){return typeof v==='number'&&isFinite(v)?'$'+Math.round(v).toLocaleString('en-US'):t('Not reported','미공개');};
 var unknown=t('PRODUCT SPLIT NOT AVAILABLE','상품별 분리 데이터 없음');
 box.innerHTML='<header><small>'+t('PRODUCTS → SHARED ENGINE → ALLOCATION','상품 → 공통 운영 주체 → 자금 배분')+'</small><h2>'+t('Two products. One OLP engine. Separate destinations.','두 상품, 하나의 OLP 운영 구조, 서로 다른 자금의 도착지')+'</h2></header>'+
 '<div class="pm-products"><article><h3>Perps</h3><b>'+unknown+'</b><span>'+t('Gross spreads / costs / treasury contribution','총 스프레드 / 비용 / 트레저리 기여액')+'</span></article><article><h3>Swaps</h3><b>'+unknown+'</b><span>'+t('Gross spreads / costs / treasury contribution','총 스프레드 / 비용 / 트레저리 기여액')+'</span></article></div>'+
 '<div class="pm-join">↘ &nbsp; '+t('OLP is the counterparty to BOTH products','두 상품 모두 OLP가 거래 상대방')+' &nbsp; ↙</div>'+
 '<div class="pm-engine"><strong>OLP</strong><span>'+t('Quotes prices · takes the other side · hedges exposure','가격 제시 · 거래 상대방 · 익스포저 헤징')+'</span><b>'+t('Not a third product revenue to add to Perps + Swaps','Perps + Swaps에 더하는 세 번째 상품 매출이 아님')+'</b></div>'+
 '<div class="pm-join">↓ '+t('Customer gross spreads · before costs','고객 총 스프레드 · 비용 차감 전')+'</div>'+
 '<div class="pm-destinations"><article class="pm-treasury"><small>'+t('PROTOCOL DESTINATION','프로토콜 측 도착지')+'</small><h3>'+t('Treasury share','트레저리 몫')+'</h3><strong>20%</strong><span>'+t('Current policy · subject to change','현재 정책 · 변경 가능')+'</span><b>↓ '+t('100% intended for VAR buy & burn','이 몫의 100%를 VAR 매입·소각에 사용할 계획')+'</b><em>'+t('Execution must be verified separately','실제 집행 여부는 별도 검증')+'</em></article><article class="pm-olp"><small>'+t('OLP DESTINATION','OLP 측 도착지')+'</small><h3>'+t('OLP-side pool','OLP 측 자금')+'</h3><strong>80%</strong><span>− '+t('Hedging / market-making costs','헤징·마켓메이킹 비용')+'</span><span>− '+t('Rewards / other reported deductions','보상·기타 보고된 차감 항목')+'</span><b>= '+t('OLP net PnL · may be positive or negative','OLP 순손익 · 이익 또는 손실 가능')+'</b></article></div>'+
 '<div class="pm-formula">'+t('Perps spreads + Swaps spreads = combined gross spreads','Perps 스프레드 + Swaps 스프레드 = 합산 총 스프레드')+'<br>'+t('Combined gross spreads − costs − rewards = treasury allocation + OLP net PnL','합산 총 스프레드 − 비용 − 보상 = 트레저리 배정액 + OLP 순손익')+'</div>'+
 '<div class="pm-report"><h3>'+t('Two-week aggregate report · not daily product estimates','2주 합산 보고 실적 · 일일 상품별 추정치가 아님')+(report?' · '+report.asOf:'')+'</h3><div>'+[
 [t('Gross spreads','총 스프레드'),report&&report.spreads2w],
 [t('Costs · gross minus reported net revenue','비용 · 총 스프레드 − 보고된 순매출'),report&&report.mmCosts2w],
 [t('Rewards','보상'),report&&report.rewards2w],
 [t('Treasury allocation','트레저리 배정액'),report&&report.treasury2w],
 [t('OLP PnL','OLP 순손익'),report&&(report.olpPnl2w!=null?report.olpPnl2w:report.olpPnl)]
 ].map(function(x){return '<article><span>'+x[0]+'</span><b>'+fmt(x[1])+'</b></article>';}).join('')+'</div></div>'+
 '<p class="pm-limits">'+t('The connected reports and aggregate treasury feed do not provide a matched Perps/Swaps revenue-and-cost breakdown. Missing is not zero. No volume-proportional allocation is invented. Swap funding, financing and dividend adjustments are not automatically protocol revenue.','연결된 보고서·합산 트레저리 데이터에서는 같은 기간의 Perps/Swaps별 매출·비용 분리가 제공되지 않습니다. 미공개는 0이 아닙니다. 거래량 비율로 수익을 임의 배분하지 않습니다. Swaps의 펀딩·금융비용·배당 조정을 프로토콜 매출에 자동 합산하지 않습니다.')+'</p>'+
 '<p class="pm-sources"><a href="https://help.variational.io/en/articles/16643437-swaps-perpetual-futures-comparison" target="_blank" rel="noopener">Perps / Swaps · official comparison ↗</a> · <a href="https://docs.variational.io/omni/the-omni-liquidity-provider-olp" target="_blank" rel="noopener">OLP & treasury policy ↗</a> · <a href="https://help.variational.io/en/articles/16643759-funding-for-swaps" target="_blank" rel="noopener">Swap funding ↗</a></p>';
}
function place(){var hash=location.hash||'#overview';box.hidden=['#implied','#efficiency'].indexOf(hash)<0;var host=document.body.classList.contains('v2-overview')?document.querySelector('.srv2-canvas'):document.getElementById('main');if(host&&box.parentNode!==host)host.prepend(box);}
function boot(){render();place();window.addEventListener('hashchange',place);new MutationObserver(place).observe(document.body,{attributes:true,attributeFilter:['class']});new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
