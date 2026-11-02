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
var faqs=[
  {
    "group": "model",
    "qKo": "Omni는 거래소인가요, 브로커인가요?",
    "qEn": "Is Omni an exchange or a broker?",
    "aKo": "Edward는 Omni를 단일 딜러 기반의 브로커형 서비스로 설명합니다. 사용자는 OLP를 상대방으로 거래하고, OLP가 외부 유동성을 통합·헤징합니다. Pro의 멀티딜러 구조와는 구분해야 합니다.",
    "aEn": "Edward describes Omni as a single-dealer brokerage model. Users trade against OLP, which aggregates external liquidity and hedges exposure. This differs from the multi-dealer design described for Pro.",
    "labelEn": "Founder explanation",
    "labelKo": "창업자 설명",
    "refs": [
      2,
      4
    ]
  },
  {
    "group": "model",
    "qKo": "OLP·Perps·Swaps는 세 가지 별도 매출인가요?",
    "qEn": "Are OLP, Perps and Swaps three separate revenue streams?",
    "aKo": "아닙니다. Perps와 Swaps는 상품이고, OLP는 두 상품의 거래 상대방·운영 주체입니다. 상품의 스프레드에 OLP 손익을 다시 더하면 중복 집계할 수 있습니다. 상품별 매출·비용 분리 수치는 이 자료 묶음에서 확인되지 않습니다.",
    "aEn": "No. Perps and Swaps are products; OLP is the counterparty and operating engine for both. Adding OLP PnL to product spreads can double-count the same economics. These sources do not establish separate product-level revenue and cost totals.",
    "labelEn": "Product structure",
    "labelKo": "상품 구조",
    "refs": [
      5,
      4
    ]
  },
  {
    "group": "model",
    "qKo": "왜 단일 딜러를 쓰며, 가격 발견은 누가 하나요?",
    "qEn": "Why use one dealer, and where does price discovery happen?",
    "aKo": "Edward의 설명은 여러 외부 거래소의 포지션을 사용자가 따로 관리하지 않도록 OLP가 유동성을 통합한다는 것입니다. 그는 가격 발견 자체보다 최선의 체결을 우선한다고 말합니다. 이는 설계 철학이며, 모든 상황에서 더 좋은 체결을 보장한다는 뜻은 아닙니다.",
    "aEn": "Edward says OLP aggregates liquidity so users do not manage separate positions across external venues. He prioritizes execution quality over hosting price discovery. This is a design philosophy, not proof of superior execution in every condition.",
    "labelEn": "Founder explanation",
    "labelKo": "창업자 설명",
    "refs": [
      2
    ]
  },
  {
    "group": "model",
    "qKo": "Perps와 Swaps는 무엇이 다른가요?",
    "qEn": "How do Perps and Swaps differ?",
    "aKo": "공식 비교 문서에서 두 상품 모두 USDC 정산 선형 파생상품이며 OLP가 상대방입니다. 펀딩 방식, 유동성 원천, 거래 시간과 증거금 조건이 다릅니다. Swaps의 금융비용·배당 조정을 프로토콜 매출로 자동 합산하면 안 됩니다.",
    "aEn": "Official documentation describes both as USDC-settled linear derivatives with OLP as counterparty. Funding, liquidity sources, trading hours and margin differ. Swap financing and dividend adjustments should not automatically be treated as protocol revenue.",
    "labelEn": "Official guide",
    "labelKo": "공식 가이드",
    "refs": [
      5
    ]
  },
  {
    "group": "money",
    "qKo": "Fees·Protocol Revenue·Holders Revenue는 어떻게 구분하나요?",
    "qEn": "What is the difference between Fees, Protocol Revenue and Holders Revenue?",
    "aKo": "DeFiLlama 기준 Fees는 사용자 지불 총액, Revenue는 LP 몫을 제외한 프로토콜 귀속분, Holders Revenue는 배분·토큰 매입·소각으로 홀더에게 귀속되는 부분입니다. 서로 포함 관계이므로 세 금액을 합산하지 않습니다. Fees 전체가 프로젝트 순이익인 것도 아닙니다.",
    "aEn": "DeFiLlama defines Fees as total user payments, Revenue as the protocol-retained share excluding LP distributions, and Holders Revenue as the part accruing through distributions, buybacks or burns. These are nested amounts, not additive totals. Fees are not company net profit.",
    "labelEn": "Metric definition",
    "labelKo": "지표 정의",
    "refs": [
      6
    ]
  },
  {
    "group": "money",
    "qKo": "트레저리 순유입은 이미 집행된 바이백인가요?",
    "qEn": "Does treasury inflow mean buybacks have already happened?",
    "aKo": "아닙니다. 트레저리 잔액 증감은 지갑 순유입의 대용 지표입니다. 바이백 배정 계획과 실제 매입·소각은 별도입니다. OLP 손익도 제외해야 하며, 홀더 귀속 실적은 실제 집행 데이터나 해당 지표의 집계 방식으로 확인해야 합니다.",
    "aEn": "No. A treasury balance change is a wallet-inflow proxy. An intended allocation is separate from an executed purchase or burn, and OLP PnL is separate again. Actual holder accrual requires execution evidence or the relevant adapter methodology.",
    "labelEn": "Metric distinction",
    "labelKo": "지표 구분",
    "refs": [
      6,
      4
    ]
  },
  {
    "group": "money",
    "qKo": "OLP 측 자금과 OLP 순이익은 같은가요?",
    "qEn": "Is the OLP-side pool the same as OLP net profit?",
    "aKo": "아닙니다. OLP 측 몫에서 헤징·마켓메이킹 비용과 보상 등을 반영해야 순손익이 됩니다. 사이트의 25주 평균 비용률은 보고서 비용 합계 ÷ 총 스프레드 합계인 가중평균입니다. 이를 오늘의 스프레드에 대입한 잔여액은 추정치이며, 보상 차감 전이라 실제 일일 순이익이 아닙니다.",
    "aEn": "No. Hedging, market-making costs and rewards affect OLP net PnL. This site estimates costs using total report costs divided by total gross spreads over a 25-week report-date lookback. Applying that rate to current spreads produces an estimate before rewards, not actual daily OLP net profit.",
    "labelEn": "Report vs estimate",
    "labelKo": "보고 실적 / 사이트 추정",
    "refs": [
      4,
      6
    ]
  },
  {
    "group": "valuation",
    "qKo": "VAR는 어떤 비교기업과 배수로 평가해야 하나요?",
    "qEn": "Which comparables and multiples should be used for VAR?",
    "aKo": "KoolKrypto는 HYPE·LIT 대비 수익 배수와 브로커 모델의 할인 가능성을 질문합니다. hansolar는 IG Group에만 고정하지 말고 Robinhood·Interactive Brokers도 보자고 주장합니다. 비교기업 선택은 의견이며, 이 자료들만으로 VAR의 적정 배수나 목표가격이 확정되지는 않습니다.",
    "aEn": "KoolKrypto questions relative revenue multiples and potential brokerage discounts. Hansolar argues for considering Robinhood and Interactive Brokers rather than anchoring only on IG Group. These are competing valuation views, not an established fair multiple or target price for VAR.",
    "labelEn": "Author opinions",
    "labelKo": "작성자 의견",
    "refs": [
      0,
      1
    ]
  },
  {
    "group": "valuation",
    "qKo": "거래량이 늘면 스프레드 수익도 같은 비율로 늘까요?",
    "qEn": "Does spread revenue grow proportionally with trading volume?",
    "aKo": "자동으로 그렇지는 않습니다. KoolKrypto가 제기한 핵심 변수는 변동성, 상품 구성, 스프레드 압축과 비용입니다. 거래량 증가만으로 수익 증가율이나 이익률을 단정할 수 없고, 이 게시물들은 수익 민감도를 검증한 계량 모델을 제공하지 않습니다.",
    "aEn": "Not automatically. KoolKrypto highlights volatility, product mix, spread compression and costs. Higher volume alone does not establish revenue growth or margins, and these posts do not provide a validated sensitivity model.",
    "labelEn": "Open question",
    "labelKo": "미해결 질문",
    "refs": [
      0,
      4
    ]
  },
  {
    "group": "valuation",
    "qKo": "CFTC 승인과 미국 시장 개방은 VAR에 호재인가요?",
    "qEn": "Would CFTC approval and US market access benefit VAR?",
    "aKo": "이 자료에서는 확정된 답이 아니라 투자 논점으로 제기됩니다. 접근 가능한 시장이 넓어지는 효과와 경쟁 심화를 함께 봐야 합니다. VAR가 HYPE·LIT보다 더 수혜를 받는다는 결론이나 특정 규제 승인 사실을 이 게시물만으로 확정하지 않습니다.",
    "aEn": "The supplied discussion raises this as an investment question, not a settled conclusion. Market access and increased competition both matter. These posts do not establish a specific approval or prove that VAR benefits more than HYPE or LIT.",
    "labelEn": "Open question",
    "labelKo": "미해결 질문",
    "refs": [
      0
    ]
  },
  {
    "group": "valuation",
    "qKo": "변동성이 낮으면 OLP가 더 큰 위험을 떠안아야 하나요?",
    "qEn": "Must OLP take more market risk when volatility falls?",
    "aKo": "KoolKrypto는 낮은 변동성과 스프레드 환경에서 OLP의 매력과 위험 부담이 어떻게 바뀔지 질문합니다. 이는 가능성에 대한 질문이지, OLP가 이미 위험을 늘렸다는 증거가 아닙니다. 수익 감소기에 VAR가 더 큰 할인율을 받을지도 별도로 검증해야 합니다.",
    "aEn": "KoolKrypto asks how low volatility and spreads could affect OLP attractiveness and risk-taking. This is a hypothesis, not evidence that OLP has increased risk. Any larger valuation discount during revenue downturns also remains unproven.",
    "labelEn": "Open question",
    "labelKo": "미해결 질문",
    "refs": [
      0
    ]
  },
  {
    "group": "pro",
    "qKo": "Omni와 Pro는 어떤 역할로 나뉘나요?",
    "qEn": "How do Omni and Pro differ?",
    "aKo": "Edward는 Omni를 OLP가 상대방인 단일 딜러 경험으로, Pro를 여러 딜러에 견적을 요청할 수 있는 구조로 설명합니다. Pro에서는 OLP가 관여하지 않는 시장, 맞춤형 오라클·파생계약도 가능하다는 방향을 제시합니다. 옵션 등 확장 가능성과 실제 출시·채택 성과는 구분해야 합니다.",
    "aEn": "Edward describes Omni as an OLP-backed single-dealer experience and Pro as a system for requesting quotes from multiple dealers. He discusses markets without OLP and bespoke oracles and contracts. Possible options exposure is a discussion point, not proof of launch status or adoption.",
    "labelEn": "Founder plans",
    "labelKo": "창업자 계획",
    "refs": [
      2,
      3,
      0
    ]
  },
  {
    "group": "pro",
    "qKo": "Variational의 해자는 무엇이라는 주장인가요?",
    "qEn": "What moat does the team claim?",
    "aKo": "Edward는 사용자 접점과 유동성 파트너십을 강조하고, hansolar는 팀의 오랜 유동성 소싱·운영 경험을 강조합니다. 양쪽 모두 작성자의 주장입니다. 복제 난이도, 사용자 유지율과 Pro의 수요는 실제 운영 지표로 계속 확인해야 합니다.",
    "aEn": "Edward emphasizes end-user relationships and liquidity partnerships; Hansolar emphasizes the team’s liquidity experience. Both are attributed claims. Replication difficulty, retention and demand for Pro still need operating evidence.",
    "labelEn": "Attributed claims",
    "labelKo": "작성자 주장",
    "refs": [
      1,
      2,
      3
    ]
  },
  {
    "group": "pro",
    "qKo": "OLP의 외부 거래소 손실이 사용자 자금 손실과 같은가요?",
    "qEn": "Are OLP exchange losses the same as losses of user settlement funds?",
    "aKo": "Edward는 OLP가 자체 자본을 헤징에 사용하고 사용자 기존 자금은 온체인 정산 풀에 분리된다고 설명합니다. 후속 답변에서는 OLP가 지급불능이면 그 이후 발생한 미실현·실현 손익이 지급되지 못할 수 있다고 명시합니다. 따라서 자금 분리가 모든 거래상대방 위험을 없앤다는 뜻은 아닙니다.",
    "aEn": "Edward says OLP hedges with its own capital while existing user funds remain in segregated onchain settlement pools. His follow-up explicitly warns that PnL arising after OLP insolvency may not be paid. Segregation therefore does not eliminate all counterparty risk.",
    "labelEn": "Founder risk explanation",
    "labelKo": "창업자 위험 설명",
    "refs": [
      2,
      3
    ]
  }
];
var host;
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
function render(){
 var ko=(document.documentElement.lang||'').startsWith('ko'),t=function(en,kr){return ko?kr:en;};
 var groups=[['model','Model & products','모델·상품'],['money','Money & metrics','돈의 흐름·지표'],['valuation','Valuation & open questions','가치평가·미해결 질문'],['pro','Pro, moat & risk','Pro·해자·위험']];
 var sourceLink=function(i){var x=items[i];return '<a href="'+x.url+'" target="_blank" rel="noopener noreferrer">'+esc(x.publisher)+' ↗</a>';};
 var faqHtml=groups.map(function(g){return '<section class="gc-faq-group"><h3>'+t(g[1],g[2])+'</h3><div class="gc-faq-grid">'+faqs.filter(function(f){return f.group===g[0];}).map(function(f,i){return '<details class="gc-faq"'+(g[0]==='model'&&i<2?' open':'')+'><summary>'+esc(ko?f.qKo:f.qEn)+'</summary><div class="gc-answer"><span class="gc-evidence">'+esc(ko?f.labelKo:f.labelEn)+'</span><p>'+esc(ko?f.aKo:f.aEn)+'</p><div class="gc-answer-sources">'+f.refs.map(sourceLink).join('')+'</div></div></details>';}).join('')+'</div></section>';}).join('');
 var sources=items.map(function(x,i){return '<article class="gc-item"><span class="gc-number">'+String(i+1).padStart(2,'0')+'</span><div><div class="gc-meta"><b>'+esc(x.publisher)+'</b><span>'+esc(x.type)+'</span>'+(x.date?'<time datetime="'+x.date+'">'+x.date+'</time>':'')+'</div><h3><a href="'+x.url+'" target="_blank" rel="noopener noreferrer">'+esc(x.title)+' <span aria-hidden="true">↗</span></a></h3><p>'+esc(ko?x.ko:x.en)+'</p></div></article>';}).join('');
 host.innerHTML='<h2>Good Content <span class="gc-faq-tag">FAQ</span></h2><p class="gc-intro">'+t('A topic-by-topic synthesis of the seven linked sources. Founder statements, opinions and unanswered questions are labeled separately. Editorial summary as of 2 Nov 2026.','연결된 원문 7개를 주제별로 통합했습니다. 창업자 설명·작성자 의견·미해결 질문을 구분했습니다. 2026년 11월 2일 기준 편집 요약입니다.')+'</p>'+faqHtml+'<details class="gc-originals"><summary>'+t('Original sources · 7 links','원문 모음 · 7개 링크')+'</summary><div class="gc-list">'+sources+'</div></details>';
}

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
