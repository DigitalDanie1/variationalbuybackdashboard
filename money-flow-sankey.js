/* Monetary flows use currency-valued bands, not population/count Sankey semantics. */
(function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cash = v => '$' + (Math.abs(v)>=1e6 ? (v/1e6).toFixed(2)+'M' : Math.abs(v)>=1e3 ? (v/1e3).toFixed(2)+'K' : v.toFixed(2));
  const exact = v => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v);
  window.renderProtocolFlow = function (host, data, select) {
    const ko=(document.documentElement.lang||'').startsWith('ko'), t=(en,kr)=>ko?kr:en;
    const priorPaths=[...host.querySelectorAll('.mf-band')].map(p=>p.getAttribute('d'));
    if (host._flowObserver) host._flowObserver.disconnect();
    host.setAttribute('aria-label',t('Protocol money flow','프로토콜 자금 흐름'));
    host.innerHTML=`<div class="mf-toolbar"><div><h3>${t('Income flow','자금 흐름')}</h3><p>${esc(data.start||'—')} — ${esc(data.end||'—')} · ${t('completed ET days','완료된 ET 일자')}</p></div><div class="mf-ranges" role="group" aria-label="${t('Reporting window','조회 기간')}">${[['30d','30D'],['7d','1W'],['1d','1D']].map(([key,label])=>`<button type="button" data-money-window="${key}" aria-pressed="${data.window===key}">${label}</button>`).join('')}</div></div><div class="mf-plot" aria-live="polite"></div>`;
    host.onclick=e=>{ const b=e.target.closest('[data-money-window]'); if(b){ const key=b.dataset.moneyWindow; select(key); host.querySelector('[data-money-window="'+key+'"]').focus({preventScroll:true}); } };
    delete host.dataset.flowValues;
    const plot=host.querySelector('.mf-plot');
    if(data.error){ plot.innerHTML=`<p class="mf-empty">${esc(data.error)}</p>`; return; }
    const {gross,treasury,cost,remaining}=data;
    host.dataset.flowValues=JSON.stringify({window:data.window,start:data.start,end:data.end,gross,treasury,cost,remaining});
    const pct=v=>(v/gross*100).toFixed(1)+'%';
    const names=[t('Treasury net inflow','트레저리 순유입'),t('Hedging / market making','헤징·마켓메이킹'),t('OLP · before rewards','OLP · 보상 차감 전')];
    const notes=[t('Observed wallet change','관측된 지갑 잔액 변화'),t('Estimated cost','추정 비용'),t('Estimated remainder','추정 잔여액')];
    const values=[treasury,cost,remaining];
    const summary=`${data.start}–${data.end}: ${t('Estimated gross spreads','추정 총 스프레드')} ${exact(gross)}. `+names.map((n,i)=>`${n} ${exact(values[i])} (${pct(values[i])})`).join('. ');
    function draw(animate){
      const W=Math.max(180,plot.clientWidth), narrow=W<620, H=narrow?480:440;
      const sourceX=12,sourceY=110,totalHeight=260,nodeWidth=8,targetX=Math.round(W*(narrow?.43:.63)),gap=40;
      const scale=totalHeight/gross, heights=values.map(v=>v*scale);
      const starts=[70,70+heights[0]+gap,70+heights[0]+heights[1]+gap*2];
      let consumed=0;
      const paths=values.map((v,i)=>{
        const top=sourceY+consumed*scale,bottom=top+heights[i],y=starts[i],x=sourceX+nodeWidth,m=(x+targetX)/2;
        consumed+=v;
        return `M ${x} ${top} C ${m} ${top} ${m} ${y} ${targetX} ${y} L ${targetX} ${y+heights[i]} C ${m} ${y+heights[i]} ${m} ${bottom} ${x} ${bottom} Z`;
      });
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      plot.innerHTML=`<svg class="mf-svg" width="100%" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="mf-title mf-desc"><title id="mf-title">${esc(t('Gross spreads allocation, USD','총 스프레드 배분, USD'))}</title><desc id="mf-desc">${esc(summary)}</desc><text class="mf-source-name" x="12" y="26">${t('Gross spreads · estimated','총 스프레드 · 추정')}</text><text class="mf-source-value" x="12" y="61">${cash(gross)}</text><text class="mf-source-unit" x="12" y="83">USD · ${data.label}</text><rect class="mf-source-node" x="${sourceX}" y="${sourceY}" width="${nodeWidth}" height="${totalHeight}"/>${paths.map((d,i)=>`<g class="mf-branch mf-branch-${i}"><path class="mf-band" d="${d}"><title>${esc(names[i]+': '+exact(values[i])+' · '+pct(values[i])+' · '+notes[i])}</title>${animate&&!reduced&&priorPaths[i]?`<animate attributeName="d" from="${priorPaths[i]}" to="${d}" dur="0.25s" fill="freeze"/>`:''}</path><rect class="mf-node" x="${targetX}" y="${starts[i]}" width="${nodeWidth}" height="${heights[i]}"/><text class="mf-node-name" x="${targetX+19}" y="${starts[i]+heights[i]/2-17}">${narrow?`<tspan x="${targetX+19}" dy="-8">${esc([t('Treasury','트레저리'),t('Hedging /','헤징·'),t('OLP','OLP')][i])}</tspan><tspan x="${targetX+19}" dy="16">${esc([t('net inflow','순유입'),t('market making','마켓메이킹'),t('before rewards','보상 차감 전')][i])}</tspan>`:esc(names[i])}</text><text class="mf-node-value" x="${targetX+19}" y="${starts[i]+heights[i]/2+6}">${cash(values[i])}</text><text class="mf-node-note" x="${targetX+19}" y="${starts[i]+heights[i]/2+25}">${pct(values[i])} · ${esc(narrow?t(i===0?'observed':'est.',i===0?'관측':'추정'):notes[i])}</text></g>`).join('')}</svg>`;
    }
    draw(true);
    if(window.ResizeObserver){host._flowObserver=new ResizeObserver(()=>draw(false));host._flowObserver.observe(plot);}
    host.insertAdjacentHTML('beforeend',`<div class="mf-foot"><span>${t('Treasury → 100% intended for VAR buy & burn. Planned; not executed.','트레저리 → 전액 VAR 매입·소각에 사용할 계획. 실제 집행액 아님.')}</span><span>${t('Costs modeled using the trailing 25-week report-weighted rate','비용: 직전 25주 리포트 가중평균 비용률 적용')} ${data.rate==null?'—':(data.rate*100).toFixed(2)+'%'} · ${t('Before rewards; OLP remainder is not net profit.','보상 차감 전 · OLP 잔여액은 순이익 아님.')}</span></div><details class="mf-evidence"><summary>${t('Calculations & sources','계산 및 출처')}</summary><p>${esc(summary)}</p><p>${t('Treasury = end-of-window balance − opening balance. Gross spreads = sum of daily positive treasury inflows ÷ the report-observed share in effect on each date. Costs = gross spreads × weighted cost rate. OLP remainder = gross spreads − treasury − costs.','트레저리 = 기말 잔액 − 기초 잔액. 총 스프레드 = 날짜별 양의 트레저리 유입 ÷ 해당 날짜의 보고 배분율 합계. 비용 = 총 스프레드 × 가중 비용률. OLP 잔여액 = 총 스프레드 − 트레저리 − 비용.')}</p><p>${t('Opening balance','기초 잔액')} (${data.baseDate}): ${exact(data.base)} · ${t('Closing balance','기말 잔액')} (${data.end}): ${exact(data.close)}</p><p><a href="https://arbiscan.io/address/0x5e91b40467fb8902c46a7b6cb90482363188d645" target="_blank" rel="noopener">${t('Treasury wallet ↗','트레저리 지갑 ↗')}</a> · <a href="https://docs.variational.io/omni/the-omni-liquidity-provider-olp" target="_blank" rel="noopener">${t('Allocation policy ↗','배분 정책 ↗')}</a></p><p>${t('Cost basis reports','비용 추정 기준 리포트')}: ${data.reports.map(r=>`<a href="${esc(r.src)}" target="_blank" rel="noopener">${r.asOf}</a>`).join(' · ')}</p></details>`);
  };
})();
