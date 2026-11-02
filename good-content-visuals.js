/* Concept illustrations only: no invented market values or proportional flow widths. */
(function(){
'use strict';
window.goodContentVisual=function(index,ko){
 var t=function(en,kr){return ko?kr:en;};
 var box=function(x,y,w,h,label,kind){return '<rect class="gcv-box '+(kind||'')+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8"/><text x="'+(x+w/2)+'" y="'+(y+h/2+4)+'" text-anchor="middle">'+label+'</text>';};
 var line=function(d,kind){return '<path class="gcv-link '+(kind||'')+'" d="'+d+'" marker-end="url(#gcv-arrow-'+index+')"/>';};
 var note=function(x,y,label){return '<text class="gcv-note" x="'+x+'" y="'+y+'" text-anchor="middle">'+label+'</text>';};
 var title='',body='',caption='';
 if(index===0){
 title=t('Six questions to investigate','검증할 여섯 가지 질문');
 var labels=[t('Valuation','가치평가'),t('Regulation','규제'),t('Spread sensitivity','스프레드 민감도'),t('OLP risk','OLP 위험'),t('Revenue cycles','수익의 경기 민감도'),'Pro'];
 body=labels.map(function(label,i){return box(8+i%3*132,12+Math.floor(i/3)*55,120,43,label,i===3?'gcv-warm':'');}).join('');
 caption=t('A question framework, not six proven answers.','여섯 가지 답이 아닌, 검증할 질문의 틀입니다.');
 }else if(index===1){
 title=t('Different valuation comparison lenses','가치평가 비교기업의 두 관점');
 body=box(8,27,104,60,'VAR','gcv-blue')+line('M 114 56 C 132 56 132 30 152 30')+line('M 114 56 C 132 56 132 98 152 98')+box(160,8,232,45,'Robinhood · IBKR','gcv-blue')+box(160,76,232,45,'CME · ICE · IG Group');
 caption=t('Comparison candidates; no implied fair multiple or target price.','비교 관점이며, 적정 배수·목표가격을 의미하지 않습니다.');
 }else if(index===2){
 title=t('Omni single-dealer liquidity aggregation','Omni의 단일 딜러 유동성 통합');
 body=box(8,42,90,45,t('Trader','사용자'))+line('M 100 64 H 142')+box(150,36,95,58,'OLP','gcv-blue')+line('M 247 57 C 270 57 266 25 290 25')+line('M 247 70 C 270 70 266 102 290 102')+box(298,6,94,40,t('Crypto venues','암호화폐 시장'))+box(298,82,94,40,'TradFi');
 caption=t('OLP aggregates and hedges; venue availability depends on the product.','OLP가 통합·헤징하며, 연결 시장은 상품에 따라 다릅니다.');
 }else if(index===3){
 title=t('User settlement funds and OLP hedge capital are separate','사용자 정산 자금과 OLP 헤징 자본의 분리');
 body=box(8,6,136,40,t('User funds','사용자 자금'),'gcv-blue')+line('M 146 26 H 200')+box(208,6,184,40,t('Onchain settlement','온체인 정산 풀'),'gcv-blue')+'<path class="gcv-divider" d="M 8 66 H 392"/>'+box(8,85,136,40,t('OLP capital','OLP 자체 자본'),'gcv-warm')+line('M 146 105 H 200')+box(208,85,184,40,t('External hedging','외부 거래소 헤징'),'gcv-warm');
 caption=t('Segregation does not eliminate unpaid-PnL risk after OLP insolvency.','자금 분리와 별개로, OLP 지급불능 이후 손익의 미지급 위험은 남습니다.');
 }else if(index===4){
 title=t('Gross spreads have different destinations','총 스프레드의 서로 다른 도착지');
 body=box(124,4,152,36,t('Gross spreads','총 스프레드'),'gcv-blue')+line('M 200 42 V 57 H 70 V 75')+line('M 200 42 V 75')+line('M 200 42 V 57 H 330 V 75')+box(8,81,124,42,t('Treasury','트레저리'),'gcv-blue')+box(140,81,120,42,t('Costs','비용'),'gcv-warm')+box(268,81,124,42,t('OLP remainder','OLP 잔여액'));
 caption=t('Concept only · OLP remainder is before rewards; widths are not proportions.','개념도 · OLP는 보상 차감 전 잔여액이며, 도형 크기는 비율이 아닙니다.');
 }else if(index===5){
 title=t('Two products, one OLP counterparty','두 상품의 공통 거래 상대방 OLP');
 body=box(8,8,144,42,'Perps','gcv-blue')+box(8,86,144,42,'Swaps','gcv-warm')+line('M 154 30 C 225 30 218 68 258 68')+line('M 154 107 C 225 107 218 68 258 68')+box(266,43,126,50,'OLP');
 caption=t('Funding, liquidity, market hours and margin differ between products.','펀딩·유동성·거래 시간·증거금 조건은 상품별로 다릅니다.');
 }else{
 title=t('Fees contain protocol revenue and its tokenholder subset','Fees와 프로토콜·홀더 귀속 수익의 포함 관계');
 body='<rect class="gcv-box" x="8" y="5" width="384" height="124" rx="9"/><text x="24" y="27">Fees</text><rect class="gcv-box gcv-blue" x="24" y="39" width="352" height="78" rx="7"/><text x="38" y="59">Protocol Revenue</text><rect class="gcv-box gcv-green" x="43" y="72" width="315" height="34" rx="6"/><text x="200" y="94" text-anchor="middle">Holders Revenue</text>';
 caption=t('Nested definitions · do not add them; box sizes do not show actual shares.','포함 관계 · 합산하지 않습니다. 도형 크기는 실제 배분 비율이 아닙니다.');
 }
 return '<figure class="gc-visual"><svg viewBox="0 0 400 138" role="img" aria-labelledby="gcv-title-'+index+'"><title id="gcv-title-'+index+'">'+title+'</title><defs><marker id="gcv-arrow-'+index+'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>'+body+'</svg><figcaption>'+caption+'</figcaption></figure>';
};
})();
