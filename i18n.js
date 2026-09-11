/* ---------- language layer · 한국어 / English / 简体中文 ----------
   English is the source of truth. Every label stays in the DOM in English and is swapped
   in place when another language is picked, so any entry missing from a dictionary simply
   degrades to English instead of blanking out.

   Scope is deliberately chrome only — navigation, buttons, table headers, metric labels,
   chart legends, section eyebrows. Analytical prose stays English: the revenue and payout
   explanations carry the "Variational is not failing to earn, it routes 80% to OLP"
   argument, and a loose translation there would create exactly the misreading the page
   exists to prevent.

   Matching is whole-text-node and exact. That is what keeps the blast radius small: a
   standalone <strong>Overview</strong> is translated, the word "overview" inside a
   sentence is not, because the sentence is one text node and never matches a key.

   The deploy CSP is script-src 'self', so this has to stay an external file loaded with
   defer after dashboard.js. */
(function () {
  'use strict';

  var LANG_KEY = 'variationalLang';
  var LANGS = [
    { code: 'en', short: 'EN', name: 'English' },
    { code: 'ko', short: '한', name: '한국어' },
    { code: 'zh', short: '中', name: '简体中文' }
  ];

  /* Proper nouns, tickers and venue names are never translated. */
  var KEEP = ['Variational', 'Hyperliquid', 'Lighter', 'Extended', 'Aster', 'Jupiter',
    'edgeX', 'dYdX', 'GMX', 'ApeX Protocol', 'Avantis', 'Orderly', 'Gains Network',
    'Drift', 'Omni', 'OLP', 'TVL', 'FDV', 'MCAP', 'DAU', 'WAU', 'USDC', 'API', 'CSV',
    'DeFiLlama', 'CoinGecko', 'Arbitrum', 'TGE', 'RWA', 'TP/SL', 'PnL', '$VAR'];

  var DICT = {
    ko: {
      'The Three Listings On One Bitcoin Chart': '하나의 비트코인 차트 위 세 상장',
      "where each listing sits in Bitcoin's own history": '각 상장이 비트코인 역사 어디에 놓이는지',
      'Zoom': '구간',
      'All': '전체',
      'Around HYPE listing': 'HYPE 상장 전후',
      'Around LIT listing': 'LIT 상장 전후',
      'Now': '지금',
      'Bitcoin At Each Listing': '각 상장 시점의 비트코인',
      'indexed to 1.00 on the listing day · 90 days before, 120 days after': '상장일을 1.00으로 지수화 · 이전 90일, 이후 120일',
      'BTC around HYPE listing': 'HYPE 상장 전후 BTC',
      'BTC around LIT listing': 'LIT 상장 전후 BTC',
      'BTC into today': '오늘까지의 BTC',
      'Backdrop': '배경',
      'Bitcoin, 90 days into it': '직전 90일 비트코인 변화',
      'Bitcoin on the day': '그날의 비트코인',
      'HYPE listing': 'HYPE 상장',
      'LIT listing': 'LIT 상장',
      'Variational today': 'Variational 현재',
      'Hyperliquid listed into a Bitcoin that had run hard for three months. Lighter listed into one that had been falling. Today sits between them — rising, but from a lower base and with less force. That is the same reading the table below scores metric by metric; this is what it looks like.': 'Hyperliquid은 비트코인이 석 달 내리 강하게 오른 뒤에 상장했습니다. Lighter는 비트코인이 빠지던 국면에 상장했습니다. 지금은 그 사이입니다 — 오르고는 있지만 더 낮은 자리에서, 더 약한 힘으로. 아래 표가 지표별로 채점하는 것과 같은 내용이고, 이건 그 그림입니다.',
      'above listing price': '상장가 위 · 강세',
      'below listing price': '상장가 아래 · 약세',
      'swing high': '고점 전환',
      'swing low': '저점 전환',
      'Each One Against Bitcoin': '각각 비트코인 대비',
      'both indexed to 1.00 on the listing day · same 258-day window': '둘 다 상장일 1.00 지수화 · 동일 258일 구간',
      'Bitcoin': '비트코인',
      'What Each One Actually Did': '각각 실제로 어떻게 됐나',
      'change from its own listing price · first 258 days · log scale': '자기 상장가 대비 등락 · 상장 후 258일 · 로그 눈금',
      '0% = listing price': '0% = 상장가',
      'Token': '토큰',
      'Turn': '전환',
      'Day': '일차',
      'From listing': '상장가 대비',
      'Leg move': '구간 등락',
      'Days in leg': '구간 일수',
      'high': '고점',
      'low': '저점',
      'Milestone': '분기점',
      'Day 22': '22일차',
      'where HYPE had already run +901%': 'HYPE가 이미 +901%를 찍은 시점',
      'Worst point': '최저점',
      'lowest close in the window': '해당 구간 최저 종가',
      'Best point': '최고점',
      'highest close in the window': '해당 구간 최고 종가',
      'Day 257': '257일차',
      'end of the shared window': '공통 구간의 끝',
      'weighted points': '가중 점수',
      'Listing FDV': '상장 FDV',
      'above': '초과',
      'up to': '이하',
      /* Two Paths · prose */
      'Only two comparable exchanges have actually listed a token. This reads Variational against both and says which shape the listing is more likely to rhyme with. It carries no plan and no recommended action — just the odds and what they rest on.': '토큰을 실제로 상장한 비교 대상 거래소는 둘뿐입니다. 이 탭은 Variational을 두 사례에 나란히 놓고, 상장이 어느 쪽 모양을 따라갈 확률이 높은지만 말합니다. 계획이나 권장 행동은 없습니다 — 확률과 그 근거뿐입니다.',
      'The business looks like': '사업은 이쪽을 닮았습니다',
      'The early listing price looks like': '상장 초반 가격은 이쪽을 닮았습니다',
      'Volume, open interest, listed markets and disclosed profit are all growing together — that is the HYPE shape. But $61.8M raised, roughly 50% of supply to insiders, and an unannounced day-one float make a straight HYPE-style run hard to assume. Those two readings point in different directions, so they are scored separately below.': '거래량·미결제약정·상장 마켓 수·공시 순이익이 함께 커지고 있습니다 — HYPE의 모양입니다. 다만 투자금 $61.8M, 관계자 몫 약 50%, 그리고 아직 공개되지 않은 초기 유통량 때문에 HYPE처럼 곧장 직선으로 오른다고 보기는 어렵습니다. 두 판단이 서로 다른 방향을 가리키므로 아래에서 따로 채점합니다.',
      'FDV at listing': '상장 시점 FDV',
      '+901% within 22 days of listing, then a deep retrace': '상장 22일 만에 +901%, 그 뒤 큰 되돌림',
      'First print on listing day $3.20 × total supply 952.31M': '상장일 최초가 $3.20 × 총공급 952.31M',
      'Top right at listing, −80% to the bottom, back to listing price 8 months later': '상장 직후가 고점, 바닥까지 −80%, 8개월 만에 상장가 회복',
      'First listing candle open $4.00 × total supply 1B · first close $3.89': '상장 첫 캔들 시가 $4.00 × 총공급 10억 · 첫 종가 $3.89',
      'each row goes to the listing today sits closer to': '각 행은 지금이 더 가까운 상장 쪽으로 갑니다',
      'Momentum and the stablecoin trend carry double weight because they moved the most between the two listings. The tally is close, and a close tally is the finding: today is not clearly either environment.': '모멘텀과 스테이블코인 추세는 두 상장 사이에 가장 크게 움직인 값이라 가중치가 두 배입니다. 합계가 근소하다는 것 자체가 결론입니다 — 지금은 어느 쪽 환경도 뚜렷하지 않습니다.',
      'Well below where HYPE ($3.05B) and Lighter ($4.00B) actually listed, so there is real room above.': 'HYPE($3.05B)와 Lighter($4.00B)가 실제로 상장한 자리보다 훨씬 낮아, 위쪽 여지가 실제로 있습니다.',
      'Inside the band where the comparable coins actually listed — the base case, with both directions open.': '비교 코인들이 실제로 상장한 밴드 안입니다 — 기본 시나리오이고, 양방향 모두 열려 있습니다.',
      'Starting at or above where Lighter listed, into a macro that is worse than Lighter had.': 'Lighter 상장가 이상에서 시작하는데, 매크로는 그때보다 나쁩니다.',
      'Above where either comparable listed. Priced for the HYPE outcome before it has been earned.': '두 비교 대상의 상장가보다 위입니다. HYPE 결과를 증명하기도 전에 그 값을 매긴 셈입니다.',
      'Token allocation, lockup schedule and day-one float are not published yet. All three move the listing-price side directly, and the split above has to be recomputed once they are known. The macro side is a snapshot and drifts with the market. Nothing here is a price target.': '토큰 배분, 락업 일정, 초기 유통량이 아직 공개되지 않았습니다. 셋 다 상장가 쪽을 직접 움직이므로, 공개되면 위 확률은 다시 계산해야 합니다. 매크로 쪽은 스냅샷이라 시장에 따라 변합니다. 여기 어떤 숫자도 목표가가 아닙니다.',
      /* Two Paths tab */
      'TWO PATHS': '두 갈래',
      'Two Paths': '두 갈래',
      'HYPE shape or LIT shape': 'HYPE형 vs LIT형',
      'Does it go like HYPE, or like LIT?': 'HYPE처럼 가나, LIT처럼 가나?',
      'The call': '판단',
      'Macro conditions today resemble': '지금 매크로가 닮은 쪽',
      'HYPE shape / LIT shape': 'HYPE형 / LIT형',
      'The Two Listings, On The Record': '실제로 일어난 두 상장',
      'what actually happened to each': '각각 어떻게 됐나',
      'Macro Conditions: Then vs Now': '매크로 조건 · 그때와 지금',
      'Where The Listing Price Lands': '상장가가 어디에 찍히나',
      'the higher it opens, the less room is left above it': '높게 시작할수록 위쪽 여지가 줄어든다',
      'What would change this call': '이 판단이 바뀌는 조건',
      'Condition': '조건',
      'HYPE listing day': 'HYPE 상장일',
      'LIT listing day': 'LIT 상장일',
      'Today': '지금',
      'Closer to': '가까운 쪽',
      'Weighted tally': '가중 합계',
      'Bear $1.5B': '약세 $1.5B',
      'Base $3.0B': '기본 $3.0B',
      'Bull $5.0B': '강세 $5.0B',
      'Bitcoin, last two months': '비트코인, 최근 두 달',
      'up or down': '올랐나 빠졌나',
      'Bitcoin vs its highest price': '비트코인, 최고가 대비',
      'how far below the peak': '고점에서 얼마나 내려왔나',
      'Bitcoin vs its recent average': '비트코인, 최근 평균 대비',
      'above or below the 200-day average': '200일 평균 위인가 아래인가',
      'Bitcoin weekly MACD': '비트코인 주봉 MACD',
      'whether medium-term momentum is building or fading': '중기 상승 힘이 붙는지 빠지는지',
      'Share of the market sitting in cash': '현금으로 대기 중인 비율',
      'what % of crypto money is parked in stablecoins': '코인 시장 자금 중 스테이블코인 비중',
      'That cash, change over 3 months': '그 현금, 3개월 변화',
      'falling means people are buying coins with it': '줄면 코인을 사고 있다는 뜻',
      "Bitcoin's share of the market": '비트코인 시장 점유율',
      'high means money is crowding into BTC alone — a hard place for alts': '높으면 돈이 비트코인에만 몰린 것 — 알트에 불리',
      'That share, change over 3 months': '그 점유율, 3개월 변화',
      'falling means money is rotating into alts': '내려가면 돈이 알트로 도는 중',
      'Total altcoin market size': '알트코인 전체 시총',
      'every coin except BTC and ETH, added up': 'BTC·ETH 제외 전체 합',
      'Alt market, change over 3 months': '알트 시장, 3개월 변화',
      'growing makes it easier for a new coin to rise': '커지는 중이면 신규 코인도 오르기 쉽다',
      'Is the cash pile itself growing': '현금 자체가 늘고 있나',
      'USDT+USDC supply — whether new money is arriving': 'USDT+USDC 발행량 — 새 돈이 들어오는지',
      'HYPE outcome is live too': 'HYPE 시나리오도 열려 있음',
      'LIT-style fade slightly favoured': 'LIT형 조정 약간 우세',
      'LIT-style fade favoured': 'LIT형 조정 우세',
      'LIT-style fade strongly favoured': 'LIT형 조정 강하게 우세',
      /* common section labels */
      'Latest Report Verdict': '최신 리포트 판정',
      'How $1 Became Profit': '$1이 이익이 되기까지',
      'Same-report operating snapshot': '같은 리포트 운영 스냅샷',
      'Eight Numbers That Tell the Story': '핵심 8개 숫자',
      'What Changed Since the Last Report': '지난 리포트 대비 변화',
      'Full Research Atlas': '전체 리서치 아틀라스',
      'Better than last report': '지난 리포트보다 나아짐',
      'Worse, or worth watching': '나빠짐 또는 관찰 필요',
      'Colour code': '색 범례',
      'Higher is better': '높을수록 좋음',
      'Lower is better': '낮을수록 좋음',
      'No single good direction': '좋은 방향이 정해져 있지 않음',
      'Roadmap Tracker': '로드맵 트래커',
      'Living roadmap': '살아있는 로드맵',
      'Official Operating Reports': '공식 운영 리포트',
      'published every 2 weeks': '2주마다 발행',
      'Implied Valuation': '추정 밸류에이션',
      'Bottom line': '결론',
      'Market rank': '시장 순위',
      'scale, users, OLP, and treasury': '규모·사용자·OLP·트레저리',
      /* navigation + shell */
      'Overview': '개요',
      'Live Overview': '실시간 개요',
      'Daily Earnings': '일별 수익',
      'Fundamentals': '펀더멘털',
      'Comparison': '비교',
      'Pre-TGE': 'TGE 이전',
      'Pre-TGE Comparison': 'TGE 이전 비교',
      'TradFi': '전통 금융',
      'Historical Data': '과거 데이터',
      'Official Reports': '공식 리포트',
      'Money Mechanic': '자금 구조',
      'Roadmap': '로드맵',
      'Points Calculator': '포인트 계산기',
      'Back to Home': '홈으로',
      'Dashboard': '대시보드',
      'Valuation': '밸류에이션',
      'Limits': '한계',
      'Metric': '지표',
      'VIEW': '보기',
      'Decision': '결론',
      'Peer metrics': '동종 지표',
      'Efficiency': '효율',
      'Verdict': '판정',
      /* header */
      '24H VOLUME': '24시간 거래량',
      'OPEN INTEREST': '미결제약정',
      'TREASURY': '트레저리',
      'LIVE DATA': '실시간 데이터',
      'Dark': '다크',
      'Light': '라이트',
      /* ranges + periods */
      'Daily': '일별', 'Weekly': '주별', 'Monthly': '월별',
      'All': '전체', 'Latest': '최신', 'Copy': '복사', '⧉ Copy': '⧉ 복사',
      'Trailing 7 days': '최근 7일',
      'Trailing 30 days': '최근 30일',
      'Rolling 12 hours': '롤링 12시간',
      'Rolling 24 hours': '롤링 24시간',
      'Rolling 7 days': '롤링 7일',
      'Latest completed day': '마지막 마감일',
      'Month to date': '이번 달 누적',
      'Current treasury balance': '현재 트레저리 잔고',
      /* chart */
      'Perp Volume · daily bars': '무기한 거래량 · 일별 막대',
      'Open Interest · daily close line': '미결제약정 · 일별 종가 선',
      'left axis': '왼쪽 축', 'right axis': '오른쪽 축',
      'Treasury inflow': '트레저리 유입',
      'Gross spreads*': '총 스프레드*',
      'Open interest': '미결제약정',
      'Live open interest': '실시간 미결제약정',
      /* official reports */
      'Money paid by traders': '트레이더가 낸 돈',
      'Cost to run the market': '시장 운영 비용',
      'Money after market cost': '시장 비용 차감 후',
      'Rewards paid to users': '사용자 리워드 지급',
      'Final money left over': '최종 남은 돈',
      'Net profit': '순이익',
      'Treasury holdings': '트레저리 보유고',
      'Markets listed': '상장 마켓 수',
      'Total volume traded': '누적 거래량',
      'Dual-sided OI': '양방향 미결제약정',
      'TVL (ex-hedging)': 'TVL (헤징 제외)',
      'Lifetime OLP PnL': 'OLP 누적 손익',
      'Rewards claimed · life': '누적 리워드 청구',
      'Losses refunded · Sunset': '손실 환급 · Sunset',
      'Long-run direction check': '장기 방향 점검',
      'Exchange scale': '거래소 규모',
      'Latest pulse': '최신 흐름',
      'Current watchlist': '현재 관찰 항목',
      'Latest product release': '최신 제품 릴리스',
      'OLP profit': 'OLP 이익',
      'New volume traded': '신규 거래량',
      'Kept per $1 of spreads': '스프레드 1달러당 남는 몫',
      'Money in open trades (open interest)': '열린 포지션의 돈 (미결제약정)',
      'All trading ever (total volume)': '역대 전체 거래 (누적 거래량)',
      'Money deposited in the system (TVL)': '시스템에 예치된 돈 (TVL)',
      /* comparison + valuation */
      'Model-implied FDV': '모델 추정 FDV',
      'Model-implied MCAP': '모델 추정 시가총액',
      'Gap to Hyperliquid': 'Hyperliquid와의 격차',
      'PROTOCOL': '프로토콜', 'FDV': 'FDV', 'MCAP': '시가총액',
      'VS MODEL': '모델 대비',
      'ACTUAL MCAP': '실제 시가총액',
      'PREMIUM': '프리미엄', 'DISCOUNT': '할인',
      'BASE CASE': '기준 시나리오',
      'ONE SHARED ESTIMATE': '공통 추정치',
      'TOKENS AT TGE': 'TGE 시점 유통 물량',
      'IMPLIED FDV': '추정 FDV',
      'Rank · exchange': '순위 · 거래소',
      'Open interest · 24H volume': '미결제약정 · 24시간 거래량',
      'MARKET DECISION ROOM': '시장 판단',
      'NORMALIZED COMPARISON': '정규화 비교',
      'TRADITIONAL MARKETS': '전통 금융 시장',
      'PRE-TGE VALUATION ROOM': 'TGE 이전 밸류에이션',
      'WHAT MUST BE TRUE?': '무엇이 전제되어야 하나?',
      'Float × Model Scenario': '유통량 × 모델 시나리오',
      /* weekdays */
      'Sun': '일', 'Mon': '월', 'Tue': '화', 'Wed': '수', 'Thu': '목', 'Fri': '금', 'Sat': '토',
      'SUN': '일', 'MON': '월', 'TUE': '화', 'WED': '수', 'THU': '목', 'FRI': '금', 'SAT': '토'
    },
    zh: {
      'The Three Listings On One Bitcoin Chart': '同一张比特币图上的三次上市',
      "where each listing sits in Bitcoin's own history": '每次上市在比特币自身历史中的位置',
      'Zoom': '区间',
      'All': '全部',
      'Around HYPE listing': 'HYPE 上市前后',
      'Around LIT listing': 'LIT 上市前后',
      'Now': '当前',
      'Bitcoin At Each Listing': '各次上市时的比特币',
      'indexed to 1.00 on the listing day · 90 days before, 120 days after': '以上市日为 1.00 指数化 · 前 90 天，后 120 天',
      'BTC around HYPE listing': 'HYPE 上市前后的 BTC',
      'BTC around LIT listing': 'LIT 上市前后的 BTC',
      'BTC into today': '截至今日的 BTC',
      'Backdrop': '背景',
      'Bitcoin, 90 days into it': '此前 90 天比特币涨跌',
      'Bitcoin on the day': '当日比特币',
      'HYPE listing': 'HYPE 上市',
      'LIT listing': 'LIT 上市',
      'Variational today': 'Variational 当前',
      'Hyperliquid listed into a Bitcoin that had run hard for three months. Lighter listed into one that had been falling. Today sits between them — rising, but from a lower base and with less force. That is the same reading the table below scores metric by metric; this is what it looks like.': 'Hyperliquid 上市时，比特币已连涨三个月。Lighter 上市时，比特币正在下跌。当前介于两者之间 — 在涨，但起点更低、力度更弱。这与下方表格逐项打分的结论一致，此处是它的图像。',
      'above listing price': '高于上市价 · 强势',
      'below listing price': '低于上市价 · 弱势',
      'swing high': '高点拐点',
      'swing low': '低点拐点',
      'Each One Against Bitcoin': '各自与比特币对比',
      'both indexed to 1.00 on the listing day · same 258-day window': '两者均以上市日为 1.00 指数化 · 相同 258 天区间',
      'Bitcoin': '比特币',
      'What Each One Actually Did': '各自实际走势如何',
      'change from its own listing price · first 258 days · log scale': '相对自身上市价的涨跌 · 上市后 258 天 · 对数刻度',
      '0% = listing price': '0% = 上市价',
      'Token': '代币',
      'Turn': '拐点',
      'Day': '天数',
      'From listing': '相对上市价',
      'Leg move': '区间涨跌',
      'Days in leg': '区间天数',
      'high': '高点',
      'low': '低点',
      'Milestone': '关键节点',
      'Day 22': '第 22 天',
      'where HYPE had already run +901%': 'HYPE 此时已 +901%',
      'Worst point': '最低点',
      'lowest close in the window': '该区间最低收盘',
      'Best point': '最高点',
      'highest close in the window': '该区间最高收盘',
      'Day 257': '第 257 天',
      'end of the shared window': '共同区间结束',
      'weighted points': '加权分',
      'Listing FDV': '上市 FDV',
      'above': '以上',
      'up to': '以下',
      /* Two Paths · prose */
      'Only two comparable exchanges have actually listed a token. This reads Variational against both and says which shape the listing is more likely to rhyme with. It carries no plan and no recommended action — just the odds and what they rest on.': '真正发行过代币的可比交易所只有两家。本页把 Variational 与这两个案例并列，只回答上市更可能走哪一种形态。这里没有计划，也没有推荐操作 — 只有概率及其依据。',
      'The business looks like': '业务面更像',
      'The early listing price looks like': '上市初期价格更像',
      'Volume, open interest, listed markets and disclosed profit are all growing together — that is the HYPE shape. But $61.8M raised, roughly 50% of supply to insiders, and an unannounced day-one float make a straight HYPE-style run hard to assume. Those two readings point in different directions, so they are scored separately below.': '交易量、未平仓合约、上线市场数与披露利润同步增长 — 这是 HYPE 的形态。但已融资 $61.8M、约 50% 供应量归内部人、且首日流通量尚未公布，因此很难假设会像 HYPE 那样一路直线上涨。两项判断方向相反，故在下方分开计分。',
      'FDV at listing': '上市时 FDV',
      '+901% within 22 days of listing, then a deep retrace': '上市 22 天内 +901%，随后大幅回撤',
      'First print on listing day $3.20 × total supply 952.31M': '上市日首笔成交 $3.20 × 总供应 952.31M',
      'Top right at listing, −80% to the bottom, back to listing price 8 months later': '上市即为顶部，最低下跌 80%，8 个月后回到上市价',
      'First listing candle open $4.00 × total supply 1B · first close $3.89': '上市首根K线开盘 $4.00 × 总供应 10 亿 · 首日收盘 $3.89',
      'each row goes to the listing today sits closer to': '每一行归入当前更接近的那次上市',
      'Momentum and the stablecoin trend carry double weight because they moved the most between the two listings. The tally is close, and a close tally is the finding: today is not clearly either environment.': '动能与稳定币趋势权重加倍，因为它们在两次上市之间变化最大。合计非常接近，而接近本身就是结论：当前并不明确属于任何一种环境。',
      'Well below where HYPE ($3.05B) and Lighter ($4.00B) actually listed, so there is real room above.': '远低于 HYPE（$3.05B）与 Lighter（$4.00B）实际上市的位置，上方确有空间。',
      'Inside the band where the comparable coins actually listed — the base case, with both directions open.': '处于可比代币实际上市的区间内 — 属基准情形，上下两个方向都开放。',
      'Starting at or above where Lighter listed, into a macro that is worse than Lighter had.': '起点等于或高于 Lighter 上市价，而宏观环境比当时更差。',
      'Above where either comparable listed. Priced for the HYPE outcome before it has been earned.': '高于两个可比对象的上市价。在尚未兑现之前就已按 HYPE 结果定价。',
      'Token allocation, lockup schedule and day-one float are not published yet. All three move the listing-price side directly, and the split above has to be recomputed once they are known. The macro side is a snapshot and drifts with the market. Nothing here is a price target.': '代币分配、锁仓安排与首日流通量尚未公布。三者都会直接影响上市价一侧，公布后上述概率需要重新计算。宏观一侧为快照，会随市场变化。此处没有任何数字是价格目标。',
      /* Two Paths tab */
      'TWO PATHS': '两条路',
      'Two Paths': '两条路',
      'HYPE shape or LIT shape': 'HYPE 型 vs LIT 型',
      'Does it go like HYPE, or like LIT?': '会像 HYPE，还是像 LIT？',
      'The call': '判断',
      'Macro conditions today resemble': '当前宏观更接近',
      'HYPE shape / LIT shape': 'HYPE 型 / LIT 型',
      'The Two Listings, On The Record': '真实发生过的两次上市',
      'what actually happened to each': '各自后来如何',
      'Macro Conditions: Then vs Now': '宏观条件 · 当时与现在',
      'Where The Listing Price Lands': '上市价落在哪里',
      'the higher it opens, the less room is left above it': '开得越高，上方空间越小',
      'What would change this call': '什么会改变这个判断',
      'Condition': '条件',
      'HYPE listing day': 'HYPE 上市日',
      'LIT listing day': 'LIT 上市日',
      'Today': '当前',
      'Closer to': '更接近',
      'Weighted tally': '加权合计',
      'Bear $1.5B': '看跌 $1.5B',
      'Base $3.0B': '基准 $3.0B',
      'Bull $5.0B': '看涨 $5.0B',
      'Bitcoin, last two months': '比特币，近两个月',
      'up or down': '涨还是跌',
      'Bitcoin vs its highest price': '比特币，相对最高价',
      'how far below the peak': '距离峰值多远',
      'Bitcoin vs its recent average': '比特币，相对近期均价',
      'above or below the 200-day average': '在 200 日均线上方还是下方',
      'Bitcoin weekly MACD': '比特币周线 MACD',
      'whether medium-term momentum is building or fading': '中期动能在积聚还是衰减',
      'Share of the market sitting in cash': '以现金形式停留的比例',
      'what % of crypto money is parked in stablecoins': '加密资金中稳定币占比',
      'That cash, change over 3 months': '该现金，3 个月变化',
      'falling means people are buying coins with it': '下降意味着资金正在买币',
      "Bitcoin's share of the market": '比特币市占率',
      'high means money is crowding into BTC alone — a hard place for alts': '偏高说明资金只挤在 BTC — 对山寨不利',
      'That share, change over 3 months': '该占比，3 个月变化',
      'falling means money is rotating into alts': '下降意味着资金正流向山寨',
      'Total altcoin market size': '山寨币总市值',
      'every coin except BTC and ETH, added up': 'BTC 与 ETH 之外全部相加',
      'Alt market, change over 3 months': '山寨市场，3 个月变化',
      'growing makes it easier for a new coin to rise': '在扩张期新币更容易上涨',
      'Is the cash pile itself growing': '现金池本身是否在增长',
      'USDT+USDC supply — whether new money is arriving': 'USDT+USDC 发行量 — 是否有新钱进场',
      'HYPE outcome is live too': 'HYPE 情形同样成立',
      'LIT-style fade slightly favoured': 'LIT 式回落略占优',
      'LIT-style fade favoured': 'LIT 式回落占优',
      'LIT-style fade strongly favoured': 'LIT 式回落明显占优',
      /* common section labels */
      'Latest Report Verdict': '最新报告判定',
      'How $1 Became Profit': '1 美元如何变成利润',
      'Same-report operating snapshot': '同期运营快照',
      'Eight Numbers That Tell the Story': '关键八个数字',
      'What Changed Since the Last Report': '相比上次报告的变化',
      'Full Research Atlas': '完整研究图集',
      'Better than last report': '优于上次报告',
      'Worse, or worth watching': '变差或需关注',
      'Colour code': '颜色说明',
      'Higher is better': '越高越好',
      'Lower is better': '越低越好',
      'No single good direction': '没有单一的好方向',
      'Roadmap Tracker': '路线图追踪',
      'Living roadmap': '动态路线图',
      'Official Operating Reports': '官方运营报告',
      'published every 2 weeks': '每两周发布',
      'Implied Valuation': '推算估值',
      'Bottom line': '结论',
      'Market rank': '市场排名',
      'scale, users, OLP, and treasury': '规模·用户·OLP·金库',
      'Overview': '总览',
      'Live Overview': '实时总览',
      'Daily Earnings': '每日收益',
      'Fundamentals': '基本面',
      'Comparison': '对比',
      'Pre-TGE': 'TGE 前',
      'Pre-TGE Comparison': 'TGE 前对比',
      'TradFi': '传统金融',
      'Historical Data': '历史数据',
      'Official Reports': '官方报告',
      'Money Mechanic': '资金结构',
      'Roadmap': '路线图',
      'Points Calculator': '积分计算器',
      'Back to Home': '返回首页',
      'Dashboard': '仪表盘',
      'Valuation': '估值',
      'Limits': '局限',
      'Metric': '指标',
      'VIEW': '视图',
      'Decision': '结论',
      'Peer metrics': '同业指标',
      'Efficiency': '效率',
      'Verdict': '判定',
      '24H VOLUME': '24小时交易量',
      'OPEN INTEREST': '未平仓合约',
      'TREASURY': '金库',
      'LIVE DATA': '实时数据',
      'Dark': '深色',
      'Light': '浅色',
      'Daily': '每日', 'Weekly': '每周', 'Monthly': '每月',
      'All': '全部', 'Latest': '最新', 'Copy': '复制', '⧉ Copy': '⧉ 复制',
      'Trailing 7 days': '过去 7 天',
      'Trailing 30 days': '过去 30 天',
      'Rolling 12 hours': '滚动 12 小时',
      'Rolling 24 hours': '滚动 24 小时',
      'Rolling 7 days': '滚动 7 天',
      'Latest completed day': '最近完整交易日',
      'Month to date': '本月累计',
      'Current treasury balance': '当前金库余额',
      'Perp Volume · daily bars': '永续交易量 · 每日柱状',
      'Open Interest · daily close line': '未平仓合约 · 每日收盘折线',
      'left axis': '左轴', 'right axis': '右轴',
      'Treasury inflow': '金库流入',
      'Gross spreads*': '总点差*',
      'Open interest': '未平仓合约',
      'Live open interest': '实时未平仓合约',
      'Money paid by traders': '交易者支付的钱',
      'Cost to run the market': '做市成本',
      'Money after market cost': '扣除做市成本后',
      'Rewards paid to users': '发放给用户的奖励',
      'Final money left over': '最终剩余',
      'Net profit': '净利润',
      'Treasury holdings': '金库持有量',
      'Markets listed': '已上线市场数',
      'Total volume traded': '累计交易量',
      'Dual-sided OI': '双边未平仓合约',
      'TVL (ex-hedging)': 'TVL（不含对冲）',
      'Lifetime OLP PnL': 'OLP 累计盈亏',
      'Rewards claimed · life': '累计已领奖励',
      'Losses refunded · Sunset': '亏损返还 · Sunset',
      'Long-run direction check': '长期方向检查',
      'Exchange scale': '交易所规模',
      'Latest pulse': '最新动向',
      'Current watchlist': '当前观察项',
      'Latest product release': '最新产品版本',
      'OLP profit': 'OLP 利润',
      'New volume traded': '新增交易量',
      'Kept per $1 of spreads': '每 1 美元点差留存',
      'Money in open trades (open interest)': '未平仓头寸中的资金（未平仓合约）',
      'All trading ever (total volume)': '历史全部交易（累计交易量）',
      'Money deposited in the system (TVL)': '存入系统的资金（TVL）',
      'Model-implied FDV': '模型推算 FDV',
      'Model-implied MCAP': '模型推算市值',
      'Gap to Hyperliquid': '与 Hyperliquid 的差距',
      'PROTOCOL': '协议', 'MCAP': '市值',
      'VS MODEL': '对比模型',
      'ACTUAL MCAP': '实际市值',
      'PREMIUM': '溢价', 'DISCOUNT': '折价',
      'BASE CASE': '基准情形',
      'ONE SHARED ESTIMATE': '共用估算',
      'TOKENS AT TGE': 'TGE 流通量',
      'IMPLIED FDV': '推算 FDV',
      'Rank · exchange': '排名 · 交易所',
      'Open interest · 24H volume': '未平仓合约 · 24小时交易量',
      'MARKET DECISION ROOM': '市场判断',
      'NORMALIZED COMPARISON': '标准化对比',
      'TRADITIONAL MARKETS': '传统市场',
      'PRE-TGE VALUATION ROOM': 'TGE 前估值',
      'WHAT MUST BE TRUE?': '需要成立的前提是什么？',
      'Float × Model Scenario': '流通量 × 模型情景',
      'Sun': '日', 'Mon': '一', 'Tue': '二', 'Wed': '三', 'Thu': '四', 'Fri': '五', 'Sat': '六',
      'SUN': '日', 'MON': '一', 'TUE': '二', 'WED': '三', 'THU': '四', 'FRI': '五', 'SAT': '六'
    }
  };

  /* The bulk content dictionary ships in i18n-dict.js (loaded just before this file) so
     the engine stays readable. Missing file simply means chrome-only coverage. */
  var BULK = (typeof window !== 'undefined' && window.__VDICT) || null;
  if (BULK) {
    ['ko', 'zh'].forEach(function (code) {
      var add = BULK[code];
      if (!add) return;
      for (var k in add) if (!DICT[code][k]) DICT[code][k] = add[k];
    });
  }

  /* Numbers move. "Variational is 1.29x the larger" becomes 1.31x on the next data drop,
     and "Aug 14, 2026" becomes tomorrow's date every day. An exact-match table would go
     silently back to English at that point, so every entry whose translation reuses the
     source's own figures is ALSO registered under a token-blind key, with the live values
     spliced back in at apply time.

     Month names count as tokens because Korean and Chinese write them as digits and put
     them in a different order: "Aug 14, 2026" becomes "2026 8 14". Each figure in the
     translation is matched back to the source token it came from, so order is free. An
     entry is registered only when that mapping is total and unambiguous - anything that
     drops, duplicates or invents a figure is skipped rather than guessed at. */
  /* Built rather than written out because the page uses "Aug", "August" and "AUG" in
     different panels, and a case-sensitive list silently misses two of the three. Lowercase
     is deliberately NOT accepted: "may" and "march" are ordinary words in the prose. */
  function casedAlternation(words) {
    var alts = [];
    words.forEach(function (w) {
      [w, w.slice(0, 3)].forEach(function (f) {
        if (alts.indexOf(f) < 0) alts.push(f);
        if (alts.indexOf(f.toUpperCase()) < 0) alts.push(f.toUpperCase());
      });
    });
    return alts.sort(function (a, b) { return b.length - a.length; }).join('|');
  }
  var MONTHS = casedAlternation(['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'Sept', 'October', 'November', 'December']);
  var MONTH_IX = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  /* The sign is part of the token: a page that reads "+3.6% DoD" today reads
     "-0.3% DoD" tomorrow, and leaving + and - in the literal text would make those
     two different shapes. */
  var NUM = '[\\u2212+-]?\\d+(?:,\\d+)*(?:\\.\\d+)?';
  /* The up/down arrows in the share post flip with the data exactly like the figures
     they sit beside, so they are tokens too - otherwise one metric turning red is
     enough to make the whole post read as a string nobody translated. */
  var TREND = '\\u2191|\\u2193|\\u25b2|\\u25bc|\\ud83d\\udcc8|\\ud83d\\udcc9';
  var TOKRE = new RegExp(NUM + '|' + TREND + '|\\b(?:' + MONTHS + ')\\b', 'g');
  var NUMRE = new RegExp(NUM + '|' + TREND, 'g');
  var TRENDRE = new RegExp('^(?:' + TREND + ')$');
  var BLIND = '\u0001';
  var WBLIND = '\u0002';
  var MBLIND = '\u0003';
  var YBLIND = '\u0004';
  var TBLIND = '\u0005';

  /* Weekday names are not figures, so the number machinery cannot carry them and a
     hard-coded "Monday" in a translation would be wrong by tomorrow. A translation writes
     %W wherever the source had a weekday; each one is filled from the live string in
     order, so "Wed / ... Wed" stays consistent when the day rolls over. */
  var WDRE = new RegExp('\\b(?:' + casedAlternation(['Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday']) + ')\\b', 'g');
  var WD_IX = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
  var WD_NAMES = {
    ko: ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'],
    zh: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  };

  function fillWeekdays(text, src, code) {
    if (text.indexOf('%W') < 0) return text;
    WDRE.lastIndex = 0;
    var found = src.match(WDRE) || [], names = WD_NAMES[code] || [], i = 0;
    return text.replace(/%W/g, function () {
      var raw = found[i] || found[0];
      i++;
      if (!raw) return '';
      var ix = WD_IX[raw.slice(0, 3).toLowerCase()];
      return (ix === undefined || !names[ix]) ? raw : names[ix];
    });
  }

  function monthOf(tok) {
    if (/^\d/.test(tok)) return 0;
    return MONTH_IX[tok.slice(0, 3).toLowerCase()] || 0;
  }
  function unpad(t) { return t.replace(/^([\u2212+-]?)0+(?=\d)/, '$1'); }
  function tokensOf(str, re) { re.lastIndex = 0; return str.match(re) || []; }
  /* Three markers, not one. "AUG 5" and "Jul 2026" are the same shape if every token
     blinds alike, so the pair poisons each other and both stop generalising. Separating
     month names and four-digit years from ordinary figures keeps a day label a day label. */
  function markerFor(tok) {
    if (TRENDRE.test(tok)) return TBLIND;
    if (monthOf(tok)) return MBLIND;
    return /^\d{4}$/.test(tok) && +tok >= 1900 && +tok <= 2199 ? YBLIND : BLIND;
  }
  function blind(str) {
    TOKRE.lastIndex = 0; WDRE.lastIndex = 0;
    return str.replace(TOKRE, markerFor).replace(WDRE, WBLIND);
  }

  var PATTERNS = { ko: null, zh: null };

  function patternsFor(code) {
    if (PATTERNS[code]) return PATTERNS[code];
    var table = DICT[code] || {}, out = Object.create(null);
    for (var k in table) {
      var src = tokensOf(k, TOKRE);
      if (!src.length) continue;
      var v = table[k], got = tokensOf(v, NUMRE);
      if (got.length !== src.length) continue;

      /* Match every figure in the translation back to one source token, left to right,
         taking the first token not already claimed. The greedy pass is what makes repeated
         figures work: "08:00-09:00" has two 00s and "MCAP $88M ... FDV $88M" two $88Ms,
         and demanding a unique match would throw both entries away. An entry whose figures
         cannot all be accounted for is still skipped rather than guessed at. */
      var slot = [], used = {}, ok = true;
      for (var g = 0; g < got.length && ok; g++) {
        var hit = -1;
        for (var i = 0; i < src.length; i++) {
          if (used[i]) continue;
          var mo = monthOf(src[i]);
          /* "Sep 09" is written "9월 09일" or "9 月 9 日" depending on the translator's
             ear, so leading zeros are ignored on both sides of the comparison. The live
             token is what gets substituted back, so its own formatting survives. */
          var same = mo ? (String(mo) === unpad(got[g])) : (unpad(src[i]) === unpad(got[g]));
          if (same) { hit = i; break; }
        }
        if (hit < 0) ok = false; else { used[hit] = 1; slot.push(hit); }
      }
      if (!ok) continue;

      var shape = blind(k);
      /* A shape made of nothing but placeholders would match any bare figure on the page.
         Every month name is already in the dictionary by name, so there is nothing to gain
         and a "2026" rendered as "2026월" to lose. */
      if (!/[^\u0001-\u0005]/.test(shape)) continue;
      var tpl = [], last = 0, mm, gi = 0;
      NUMRE.lastIndex = 0;
      while ((mm = NUMRE.exec(v))) { tpl.push(v.slice(last, mm.index), slot[gi++]); last = mm.index + mm[0].length; }
      tpl.push(v.slice(last));

      /* Two entries can blind to the same shape. Usually that is exactly what we want -
         185 separate "+5.4% vs prior" entries collapse into one reusable template. But
         "Aug 14" and "Aug 2026" also collide, and there the two templates disagree. So a
         repeat that matches the stored template is kept and a repeat that contradicts it
         poisons the shape, leaving both keys on exact matching only. */
      if (shape in out) {
        var prev = out[shape];
        if (prev && prev.length === tpl.length && prev.join('\u0002') === tpl.join('\u0002')) continue;
        out[shape] = null;
        continue;
      }
      out[shape] = tpl;
    }
    PATTERNS[code] = out;
    return out;
  }

  function lookup(key, code) {
    var table = DICT[code];
    if (!table) return null;
    if (table[key]) return fillWeekdays(table[key], key, code);
    TOKRE.lastIndex = 0;
    if (!TOKRE.test(key)) { TOKRE.lastIndex = 0; return null; }
    var tpl = patternsFor(code)[blind(key)];
    if (!tpl) return null;
    var live = tokensOf(key, TOKRE), out = '';
    for (var i = 0; i < tpl.length; i++) {
      if (typeof tpl[i] !== 'number') { out += tpl[i]; continue; }
      var t = live[tpl[i]], mo = monthOf(t);
      out += mo ? String(mo) : t;
    }
    return fillWeekdays(out, key, code);
  }

  var lang = 'en';
  try { lang = localStorage.getItem(LANG_KEY) || 'en'; } catch (e) {}
  if (!DICT[lang] && lang !== 'en') lang = 'en';

  /* Original English is kept per text node so switching back is lossless, and so a node
     that has already been translated is never used as a lookup key. */
  var originals = new WeakMap();
  var applying = false;

  function translateNode(node) {
    var base = originals.get(node);
    if (base === undefined) {
      base = node.nodeValue;
      if (!/[A-Za-z]/.test(base)) return;
      originals.set(node, base);
    }
    var flat = base.trim();
    /* Markup wraps long paragraphs, so the same sentence reaches here with newlines and
       runs of spaces inside it. Keys are stored flattened; the node's own leading and
       trailing whitespace is preserved on write so layout is untouched. */
    var key = flat.replace(/\s+/g, ' ');
    if (!key || KEEP.indexOf(key) >= 0) return;
    var hit = lang === 'en' ? null : lookup(key, lang);
    var next = hit ? base.replace(flat, hit) : base;
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  /* Tooltips and screen-reader labels carry as much explanation as the visible copy on the
     chart panels, so they get the same treatment. Originals are held per element. */
  var ATTRS = ['title', 'aria-label', 'placeholder'];
  var attrOriginals = new WeakMap();

  function translateAttrs(el) {
    var store = attrOriginals.get(el);
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute(a)) continue;
      var base = store && store[a];
      if (base === undefined) {
        base = el.getAttribute(a);
        if (!/[A-Za-z]/.test(base)) continue;
        if (!store) { store = {}; attrOriginals.set(el, store); }
        store[a] = base;
      }
      var flat = base.trim(), key = flat.replace(/\s+/g, ' ');
      if (!key || KEEP.indexOf(key) >= 0) continue;
      var hit = lang === 'en' ? null : lookup(key, lang);
      var next = hit ? base.replace(flat, hit) : base;
      if (el.getAttribute(a) !== next) el.setAttribute(a, next);
    }
  }

  function apply(root) {
    var host = root || document.querySelector('.dashboard-shell') || document.body;
    if (!host) return;
    applying = true;
    var walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = walker.nextNode())) translateNode(n);
    var sel = ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
    [].forEach.call(host.querySelectorAll(sel), translateAttrs);
    if (host.matches && host.matches(sel)) translateAttrs(host);
    applying = false;
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : lang);
    [].forEach.call(document.querySelectorAll('.lang-picker button'), function (b) {
      var on = b.dataset.lang === lang;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setLang(next) {
    if (!next || next === lang) return;
    if (next !== 'en' && !DICT[next]) return;
    lang = next;
    try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
    apply();
  }

  function mountPicker() {
    if (document.querySelector('.lang-picker')) return;
    var hosts = document.querySelectorAll('.srv2-head-right');
    if (!hosts.length) return;
    [].forEach.call(hosts, function (host) {
      var box = document.createElement('div');
      box.className = 'lang-picker';
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', 'Language / 언어 / 语言');
      LANGS.forEach(function (l) {
        var b = document.createElement('button');
        b.type = 'button';
        b.dataset.lang = l.code;
        b.textContent = l.short;
        b.title = l.name;
        b.setAttribute('aria-label', l.name);
        if (l.code === lang) { b.className = 'on'; b.setAttribute('aria-pressed', 'true'); }
        b.addEventListener('click', function () { setLang(l.code); });
        box.appendChild(b);
      });
      host.insertBefore(box, host.firstChild);
    });
  }

  /* The dashboard re-renders panels whenever live data lands, which puts fresh English
     back into the DOM. A debounced full-document pass is the wrong tool here: the money
     map and the comparison board repaint many times a second, so the debounce either never
     settles or lands after the reader has already seen English flash through. Instead each
     mutation record is translated on the spot - only the nodes that actually changed - with
     a coarse trailing sweep behind it to catch anything a record could not describe.

     Re-entry is safe: writes made while `applying` is set are ignored on the way back in,
     and a node that is already translated compares equal and is left alone. */
  function translateTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { translateNode(root); return; }
    if (root.nodeType !== 1) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var tag = n.parentNode && n.parentNode.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = walker.nextNode())) translateNode(n);
    var sel = ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
    if (root.matches && root.matches(sel)) translateAttrs(root);
    if (root.querySelectorAll) [].forEach.call(root.querySelectorAll(sel), translateAttrs);
  }

  function watch() {
    var host = document.querySelector('.dashboard-shell') || document.body;
    if (!host || typeof MutationObserver !== 'function') return;
    var timer = null;
    new MutationObserver(function (records) {
      if (applying || lang === 'en') return;
      applying = true;
      try {
        for (var i = 0; i < records.length; i++) {
          var r = records[i];
          if (r.type === 'characterData') { translateNode(r.target); continue; }
          if (r.type === 'attributes') { translateAttrs(r.target); continue; }
          for (var j = 0; j < r.addedNodes.length; j++) translateTree(r.addedNodes[j]);
        }
      } finally { applying = false; }
      clearTimeout(timer);
      timer = setTimeout(function () { apply(); }, 400);
    }).observe(host, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS
    });
  }

  function boot() { mountPicker(); apply(); watch(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.setDashboardLanguage = setLang;
})();
