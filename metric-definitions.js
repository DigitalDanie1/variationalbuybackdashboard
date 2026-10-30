/* Shared definitions on every dashboard tab; no change to source measurements. */
(function () {
  'use strict';
  var copy = {
    en: ['How to read the money figures', 'Protocol revenue ≠ gross spreads ≠ OLP profit ≠ executed buybacks',
      ['Protocol revenue / treasury net inflow', 'Peer revenue comparisons use the protocol-retained share, excluding OLP/LP trading PnL. Variational uses treasury USDC balance changes as an on-chain proxy: transfers and withdrawals can affect this measure.'],
      ['Gross spreads · estimated', 'Customer spread payments before costs. Daily estimates divide treasury net inflow by the period-specific treasury share. Current official Docs state 20%, subject to change. This is not protocol revenue.'],
      ['OLP side ≠ OLP profit', 'The non-treasury remainder still funds hedging, market-making costs and rewards. Use dated official reports for reported OLP PnL. Applying a historical margin to a day produces an estimate, not actual daily profit.'],
      ['Buyback allocation ≠ execution', 'The announced plan is to use 100% of treasury-directed revenue for VAR buy & burn, not 100% of gross spreads or OLP profit. Treasury inflow and balances do not prove a purchase or burn occurred.']],
    ko: ['숫자 읽는 법', '프로토콜 수익 ≠ 총 스프레드 ≠ OLP 순손익 ≠ 실제 바이백',
      ['프로토콜 수익 / 트레저리 순유입', '거래소 Revenue 비교에는 OLP·LP 매매손익을 제외한 프로토콜 몫을 사용합니다. Variational은 트레저리 USDC 잔액 증감을 온체인 대용 지표로 사용하므로, 매출 외 이체·출금이 영향을 줄 수 있습니다.'],
      ['총 스프레드 · 추정치', '비용 차감 전 고객의 스프레드 지불액입니다. 일일 값은 트레저리 순유입을 해당 기간의 배분율로 나눈 추정치입니다. 현재 공식 문서는 20%이며 변경될 수 있습니다. 프로토콜 몫과는 다릅니다.'],
      ['OLP 측 몫 ≠ OLP 순이익', '트레저리를 제외한 잔여분에서는 헤징·마켓메이킹 비용과 보상 등이 지출됩니다. 실제 OLP 순손익은 날짜가 명시된 공식 보고서 기준으로 확인합니다. 과거 이익률을 하루에 적용한 값은 실적이 아닌 추정치입니다.'],
      ['바이백 예정 재원 ≠ 실제 집행액', '발표된 계획은 트레저리로 배정되는 수익의 100%를 VAR 매입·소각에 사용하는 것입니다. 총 스프레드나 OLP 이익의 100%가 아닙니다. 지갑 유입·잔액만으로 매입·소각 실행을 확인할 수 없습니다.']],
    zh: ['如何理解这些金额', '协议收入 ≠ 总点差 ≠ OLP 净损益 ≠ 已执行回购',
      ['协议收入 / 金库净流入', '交易所收入比较应使用协议留存份额，不含 OLP/LP 交易损益。Variational 使用金库 USDC 余额变化作为链上代理指标，转账及提款可能影响该值。'],
      ['总点差 · 估算', '扣除成本前的用户点差支付。每日估算为金库净流入除以对应期间的分配比例。当前官方文档为 20%，可能调整。这不是协议收入。'],
      ['OLP 份额 ≠ OLP 净利润', '非金库部分还需承担对冲、做市成本及奖励。实际 OLP 损益应按有日期的官方报告读取。用历史利润率推算单日利润属于估算。'],
      ['回购计划资金 ≠ 已执行回购', '公布的计划是将金库收入的 100% 用于 VAR 回购销毁，不是总点差或 OLP 利润的 100%。金库流入与余额不能证明回购或销毁已经执行。']]
  };
  var box = document.createElement('details'); box.className = 'money-definitions'; box.id = 'money-definitions'; box.setAttribute('translate','no');
  function words() {
    var c = copy[(document.documentElement.lang || 'en').slice(0,2)] || copy.en;
    box.innerHTML = '<summary><b>' + c[0] + '</b><span>' + c[1] + '</span></summary><div class="money-def-grid">' + c.slice(2).map(function(x){return '<article><h3>'+x[0]+'</h3><p>'+x[1]+'</p></article>';}).join('') + '</div><p class="money-def-source"><a href="https://docs.variational.io/omni/the-omni-liquidity-provider-olp" target="_blank" rel="noopener">Official OLP Docs ↗</a> · <a href="https://x.com/variational_io/status/2102929439063765192" target="_blank" rel="noopener">VAR buy & burn announcement ↗</a></p>';
  }
  function place() {
    var host = document.body.classList.contains('v2-overview') ? document.querySelector('.srv2-canvas') : document.getElementById('main');
    if (host && box.parentNode !== host) host.prepend(box);
  }
  function boot() {words();place();new MutationObserver(place).observe(document.body,{attributes:true,attributeFilter:['class']});new MutationObserver(words).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});window.addEventListener('hashchange',place);}
  if(document.readyState === 'loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
