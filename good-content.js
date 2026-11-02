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
var readings=[
  {
    "labelKo": "질문 제기",
    "labelEn": "Questions, not answers",
    "questionKo": "VAR를 평가할 때 포인트 가격 외에 무엇을 검증해야 하나?",
    "questionEn": "What should investors investigate beyond the price of points?",
    "answerKo": "수익 배수·규제·변동성·스프레드 압축·OLP 위험·Pro의 기여라는 여섯 평가축을 제시합니다. 이 글 자체가 각 질문에 결론을 주지는 않습니다.",
    "answerEn": "It organizes six investigation areas: multiples, regulation, volatility and spread capture, OLP risk, cyclical discounts and Pro. It does not resolve those questions.",
    "openKo": "hansolar는 비교기업 관점을, Edward는 모델·Pro·자금 분리를 설명합니다. 적정 배수, CFTC 영향, 수익 민감도와 옵션 채택은 여전히 열려 있습니다.",
    "openEn": "Hansolar offers a valuation lens; Edward explains architecture, Pro and capital segregation. Fair multiples, regulatory effects, sensitivities and options adoption remain open.",
    "related": [
      1,
      2,
      3
    ]
  },
  {
    "labelKo": "비교 관점 제시",
    "labelEn": "Valuation perspective",
    "questionKo": "브로커형이라는 이유만으로 IG Group 수준의 낮은 배수를 적용해야 하나?",
    "questionEn": "Does a brokerage model necessarily imply an IG Group-like low multiple?",
    "answerKo": "hansolar는 Robinhood·Interactive Brokers도 비교해야 한다고 주장하고, 팀의 유동성 운영 경험을 차별화 근거로 제시합니다. 비교기업 선택의 논거를 보완하는 의견입니다.",
    "answerEn": "Hansolar argues for considering Robinhood and Interactive Brokers and highlights the team’s liquidity experience. This supplies an alternative comparison framework, not a valuation proof.",
    "openKo": "높은 비교기업 배수가 VAR에 그대로 적용된다는 근거는 아닙니다. 동일한 이익 정의·성장률·위험 조정과 실제 사용자 유지율 검증이 남습니다.",
    "openEn": "It does not establish that those multiples transfer to VAR. Comparable earnings definitions, growth, risk and evidence of user retention still matter.",
    "related": [
      0,
      2
    ]
  },
  {
    "labelKo": "설계 의도 설명",
    "labelEn": "Architecture explained",
    "questionKo": "왜 단일 딜러인가? 외부 유동성을 쓰면 차별성이 없나? Pro는 무엇을 바꾸나?",
    "questionEn": "Why one dealer, what differentiates routed liquidity, and what changes with Pro?",
    "answerKo": "Edward는 OLP가 유동성을 통합해 사용자에게 일관된 포지션·체결 경험을 제공한다고 설명합니다. Swaps의 TradFi 연결, 체결 우선 철학과 Pro의 멀티딜러 방향도 제시합니다.",
    "answerEn": "Edward explains OLP-mediated aggregation and execution, direct TradFi connectivity for swaps, and the multi-dealer direction for Pro.",
    "openKo": "이는 창업자의 설계 설명입니다. 경쟁사 대비 체결 우위, 지속적인 해자, VAR 적정가치와 Pro의 매출 기여를 독립적으로 증명하지는 않습니다.",
    "openEn": "These are founder explanations. They do not independently establish execution superiority, a durable moat, fair token value or Pro’s revenue contribution.",
    "related": [
      0,
      1,
      3
    ]
  },
  {
    "labelKo": "위험의 범위 구분",
    "labelEn": "Risk boundary clarified",
    "questionKo": "Pro가 필요한 구체적 이유는? OLP의 외부 거래소 손실이 사용자 자금에도 전가되나?",
    "questionEn": "Why is Pro needed, and how could external-venue losses affect users?",
    "answerKo": "Edward는 다른 상대방·맞춤형 계약이 Pro의 용도라고 설명합니다. 사용자 기존 정산 자금과 OLP 헤징 자본을 구분하면서도, OLP 지급불능 이후 생긴 손익은 지급되지 못할 수 있다고 명시합니다.",
    "answerEn": "Edward points to alternative counterparties and bespoke contracts for Pro. He separates existing settlement funds from OLP hedge capital while warning that PnL arising after OLP insolvency may not be paid.",
    "openKo": "자금 분리가 무위험을 뜻하지는 않습니다. 이 게시물은 OLP의 현재 전체 익스포저, 실시간 지급 능력이나 실제 회수 결과를 검증한 감사 보고서가 아닙니다.",
    "openEn": "Segregation is not risk elimination. This post is not an audit of current total exposure, real-time solvency or actual recoveries.",
    "related": [
      2
    ]
  },
  {
    "labelKo": "배경·보고 실적 분석",
    "labelEn": "Background research",
    "questionKo": "브로커리지 모델은 기존 DEX와 어떻게 다르며, 스프레드는 누구에게 남나?",
    "questionEn": "How does brokerage differ from other DEX designs, and who retains the spread?",
    "answerKo": "DeFiLlama Research가 RFQ·내부 마켓메이킹·온체인 정산 구조를 설명하고, 당시 격주 리포트를 이용해 비용·보상·트레저리·OLP 손익의 연결을 분석합니다.",
    "answerEn": "DeFiLlama Research explains RFQs, internal market making and onchain settlement, then traces costs, rewards, treasury and OLP PnL using reports available at publication.",
    "openKo": "2026년 6월 자료이므로 이후 Pro·Swaps 출시 상태나 11월의 손익을 보여주지는 않습니다. 현재 수치는 최신 보고서로 따로 확인해야 합니다.",
    "openEn": "Published in June 2026, it does not establish later Pro or Swaps launch status or November financial results. Current numbers need newer reports.",
    "related": [
      2,
      5,
      6
    ]
  },
  {
    "labelKo": "상품 차이 확인",
    "labelEn": "Product mechanics clarified",
    "questionKo": "Perps와 Swaps가 같은 OLP를 쓰는데 상품 차이는 무엇인가?",
    "questionEn": "What differentiates Perps and Swaps if both use OLP?",
    "answerKo": "공식 가이드는 둘 다 OLP가 상대방인 USDC 정산 파생상품임을 확인하고, 펀딩·유동성 원천·거래 시간·증거금 차이를 표로 비교합니다. 상품과 운영 주체를 구분하는 데 도움이 됩니다.",
    "answerEn": "The official guide identifies OLP as counterparty to both USDC-settled derivatives and compares funding, liquidity sources, trading hours and margin.",
    "openKo": "상품별 거래량·스프레드·비용·순이익의 분리 실적은 제공하지 않습니다. 문서의 조건과 실제 시장별 최신 운영 조건도 구분해야 합니다.",
    "openEn": "It does not provide separate product-level volume, spreads, costs or profits. Documented mechanics should also be distinguished from the latest conditions in each market.",
    "related": [
      4,
      6
    ]
  },
  {
    "labelKo": "용어 혼동 해소",
    "labelEn": "Metric definitions clarified",
    "questionKo": "Fees·Revenue·Holders Revenue를 같은 돈처럼 읽어도 되나?",
    "questionEn": "Can Fees, Revenue and Holders Revenue be treated as the same money?",
    "answerKo": "DeFiLlama는 사용자 지불 총액, 프로토콜 귀속분, 그중 홀더 귀속분으로 구분합니다. 포함 관계이므로 합산하면 안 되며, 바이백 예정 재원도 실제 Holders Revenue로 자동 인정되지 않습니다.",
    "answerEn": "DeFiLlama distinguishes user payments, the protocol-retained share and its tokenholder-accruing subset. They are nested, not additive; an intended buyback allocation is not automatically measured holder revenue.",
    "openKo": "용어 정의가 개별 거래소 데이터의 정확성이나 동일한 집계 시점을 보장하지는 않습니다. 비교할 때는 각 어댑터·기간·미공개 값을 확인해야 합니다.",
    "openEn": "Definitions do not guarantee adapter accuracy or identical reporting cutoffs. Venue methodology, reporting windows and missing values still require inspection.",
    "related": [
      4
    ]
  }
];
var currentView="summaries";
var host;
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
function render(){
 var ko=(document.documentElement.lang||'').startsWith('ko'),t=function(en,kr){return ko?kr:en;};
 var pad=function(i){return String(i+1).padStart(2,'0');};
 var groups=[['model','Model & products','모델·상품'],['money','Money & metrics','돈의 흐름·지표'],['valuation','Valuation & open questions','가치평가·미해결 질문'],['pro','Pro, moat & risk','Pro·해자·위험']];
 var chip=function(i){var x=items[i];return '<a href="'+x.url+'" target="_blank" rel="noopener noreferrer"><i>'+pad(i)+'</i>'+esc(x.publisher.split(' · ')[0])+' ↗</a>';};
 var meta=function(x){return '<p class="gc-meta"><b>'+esc(x.publisher)+'</b><span>'+esc(x.type)+'</span>'+(x.date?'<time datetime="'+x.date+'">'+x.date+'</time>':'')+'</p>';};
 var qn=0;
 var faqHtml=groups.map(function(g,gi){var list=faqs.filter(function(f){return f.group===g[0];});return '<section class="gc-faq-group"><div class="gc-group-head"><span class="gc-no">'+pad(gi)+'</span><h3>'+t(g[1],g[2])+'</h3><p>'+list.length+t(' questions','개 질문')+'</p></div><div class="gc-faq-list">'+list.map(function(f){qn++;return '<details class="gc-faq"'+(qn===1?' open':'')+'><summary><span class="gc-no">Q'+String(qn).padStart(2,'0')+'</span><strong>'+esc(ko?f.qKo:f.qEn)+'</strong><span class="gc-plus" aria-hidden="true"></span></summary><div class="gc-answer"><span class="gc-evidence">'+esc(ko?f.labelKo:f.labelEn)+'</span><p>'+esc(ko?f.aKo:f.aEn)+'</p><div class="gc-answer-sources">'+f.refs.map(chip).join('')+'</div></div></details>';}).join('')+'</div></section>';}).join('');
 var sources='<section class="gc-faq-group"><div class="gc-group-head"><span class="gc-no">'+pad(groups.length)+'</span><h3>'+t('Original sources','원문 모음')+'</h3><p>'+items.length+t(' links',' 개 링크')+'</p></div><ol class="gc-source-list">'+items.map(function(x,i){return '<li class="gc-source"><a href="'+x.url+'" target="_blank" rel="noopener noreferrer"><span class="gc-no">'+pad(i)+'</span><strong>'+esc(x.title)+' ↗</strong>'+'<span class="gc-meta"><b>'+esc(x.publisher)+'</b><span>'+esc(x.type)+'</span></span>'+(x.date?'<em>'+x.date+'</em>':'')+'</a></li>';}).join('')+'</ol></section>';
 var summaries=items.map(function(x,i){var d=readings[i];return '<li class="gc-reading"><div class="gc-reading-head"><div class="gc-reading-id"><span class="gc-no">'+pad(i)+'</span><span class="gc-tag">'+esc(ko?d.labelKo:d.labelEn)+'</span></div><h3><a href="'+x.url+'" target="_blank" rel="noopener noreferrer">'+esc(x.title)+' <span aria-hidden="true">↗</span></a></h3>'+meta(x)+(window.goodContentVisual?window.goodContentVisual(i,ko):'')+'</div><dl class="gc-triad"><div class="gc-q"><dt>'+t('Question','핵심 의문')+'</dt><dd>'+esc(ko?d.questionKo:d.questionEn)+'</dd></div><div class="gc-a"><dt>'+t('Clarifies','설명하는 것')+'</dt><dd>'+esc(ko?d.answerKo:d.answerEn)+'</dd></div><div class="gc-o"><dt>'+t('Still open','남는 질문')+'</dt><dd>'+esc(ko?d.openKo:d.openEn)+'</dd></div><div class="gc-related"><span>'+t('Read with','함께 읽기')+'</span>'+d.related.map(chip).join('')+'</div></dl></li>';}).join('');
 host.classList.toggle('is-ko',ko);
 host.innerHTML='<div class="gc-head"><span class="gc-eyebrow">'+t('Reading list · as of 2 Nov 2026','읽을거리 · 2026년 11월 2일 기준')+'</span><h2>'+t(items.length+' sources, read side by side','원문 '+items.length+'개, 나란히 읽기')+'</h2><p class="gc-lede">'+t('Each source is split into the question it raises, what it clarifies and what it leaves open. Founder explanations, author opinions and open questions stay distinct. Links are thematic, not necessarily replies in the same thread.','원문마다 던지는 질문, 설명하는 것, 남는 질문으로 나눴습니다. 창업자 설명·작성자 의견·미해결 질문은 구분합니다. 연결은 논점 기준이며 같은 스레드의 답글이라는 뜻은 아닙니다.')+'</p></div><div class="gc-toolbar"><div class="gc-view-tabs" role="tablist" aria-label="Good Content view"><button id="gc-summary-tab" role="tab" aria-controls="gc-summaries" aria-selected="'+(currentView==='summaries')+'" tabindex="'+(currentView==='summaries'?0:-1)+'" data-gc-view="summaries">'+t('By source','원문별')+' <b>'+String(items.length).padStart(2,'0')+'</b></button><button id="gc-faq-tab" role="tab" aria-controls="gc-faq-panel" aria-selected="'+(currentView==='faq')+'" tabindex="'+(currentView==='faq'?0:-1)+'" data-gc-view="faq">'+t('By topic · FAQ','주제별 FAQ')+' <b>'+faqs.length+'</b></button></div><p class="gc-toolbar-note">'+(currentView==='faq'?t('Answers combine several sources; chips link to each one.','여러 원문을 묶은 답이며, 칩이 각 원문으로 연결됩니다.'):t('Illustrations are concepts, not data.','그림은 개념도이며 데이터가 아닙니다.'))+'</p></div><section role="tabpanel" id="gc-summaries" aria-labelledby="gc-summary-tab"'+(currentView==='summaries'?'':' hidden')+'><ol class="gc-readings">'+summaries+'</ol></section><section role="tabpanel" id="gc-faq-panel" aria-labelledby="gc-faq-tab"'+(currentView==='faq'?'':' hidden')+'>'+faqHtml+sources+'</section>';
}

function boot(){
 VALID_TABS.push(TAB);DEFAULT_TAB_ORDER.push(TAB);SECTION_COPY[TAB]={eyebrow:'Reading list',title:'Good Content',description:'Research, official guides and references.',chip:'Reading'};
 host=document.createElement('section');host.className='gc-section tsec tg-hide';host.dataset.tg=TAB;document.getElementById('main').appendChild(host);render();
 host.addEventListener('click',function(e){var b=e.target.closest('[data-gc-view]');if(!b)return;currentView=b.dataset.gcView;render();var active=host.querySelector('[data-gc-view="'+currentView+'"]');if(active)active.focus({preventScroll:true});});
 host.addEventListener('keydown',function(e){if(!e.target.closest('[data-gc-view]')||['ArrowLeft','ArrowRight','Home','End'].indexOf(e.key)<0)return;e.preventDefault();currentView=e.key==='Home'?'summaries':e.key==='End'?'faq':currentView==='summaries'?'faq':'summaries';render();host.querySelector('[data-gc-view="'+currentView+'"]').focus({preventScroll:true});});
 var b=document.createElement('button');b.type='button';b.id='tab-'+TAB;b.dataset.tab=TAB;b.setAttribute('role','tab');b.textContent='Good Content';document.getElementById('tabs').appendChild(b);
 document.querySelectorAll('[data-open-tab="comparing-revenue"]').forEach(function(anchor){var mine=anchor.cloneNode(true);mine.dataset.openTab=TAB;var label=mine.querySelector('strong')||mine.querySelector('b');if(label)label.textContent='Good Content';mine.setAttribute('aria-label','Good Content');anchor.parentNode.insertBefore(mine,anchor.nextSibling);});
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 if(location.hash==='#'+TAB)showTab(TAB,{push:false});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
