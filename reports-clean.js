/* Presentation only: all source metrics and original chart renderers stay intact. */
(function(){
  'use strict';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function init(){
    const root=document.querySelector('.reports-page');if(!root)return;
    function summary(){
      if(typeof BIWEEKLY==='undefined')return;
      const latest=BIWEEKLY,previous=BIWEEKLY_HISTORY.filter(r=>r.asOf<latest.asOf).slice(-1)[0];
      const money=v=>!Number.isFinite(v)?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:2}).format(v);
      const fields=[['spreads2w','Gross spreads','Before costs and rewards'],['mmCosts2w','Market-making costs','Reported operating costs'],['netProfit2w','Net profit','After reported costs and rewards'],['treasury2w','Treasury allocation','Protocol share of the same profit']];
      document.getElementById('reportsKpis').innerHTML=fields.map(([key,label,note])=>{
        const value=latest[key],base=previous?.[key],delta=Number.isFinite(value)&&Number.isFinite(base)&&base!==0?(value-base)/Math.abs(base)*100:null;
        return `<div class="reports-kpi"><span>${label}</span><strong>${money(value)}</strong><em>${delta==null?'No comparable previous value':(delta>=0?'+':'')+delta.toFixed(1)+'% vs previous'}</em></div>`;
      }).join('');
      root.querySelector('#reports-latest .reports-scope').textContent=(previous?'Changes vs '+previous.asOf+'. ':'')+'Net profit includes treasury and OLP allocations; the four figures are not additive.';
      const margin=latest.spreads2w>0&&Number.isFinite(latest.netProfit2w)?latest.netProfit2w/latest.spreads2w*100:null;
      document.getElementById('reportsMargin').textContent=margin==null?'Net margin not reported.':`${margin.toFixed(1)}% of gross spreads remained as net profit.`;
      const source=document.getElementById('reportsSource');source.textContent=latest.sourceType==='provided-transcript'?'Find original post ↗':'Latest source ↗';source.href=/^https:\/\//.test(latest.src)?latest.src:'https://x.com/variational_io';
    }
    function open(key){
      root.querySelectorAll('[data-report-view]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.reportView===key)));
      ['latest','archive','research'].forEach(k=>document.getElementById('reports-'+k).hidden=k!==key);
      window.dispatchEvent(new Event('resize'));
    }
    root.querySelector('.reports-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-report-view]');if(b)open(b.dataset.reportView);});
    root.querySelector('.reports-tabs').addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      const buttons=[...root.querySelectorAll('[data-report-view]')],i=buttons.indexOf(document.activeElement);if(i<0)return;
      e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
      buttons[next].focus();open(buttons[next].dataset.reportView);
    });
    // Hidden charts may have been laid out with no width. Reuse the existing resize flow.
    root.addEventListener('toggle',e=>{if(e.target.open)window.dispatchEvent(new Event('resize'));},true);
    function archiveSource(){const date=document.getElementById('bwReportSelect').value,r=BIWEEKLY_HISTORY.find(r=>r.asOf===date);const a=document.getElementById('reportsArchiveSource');a.href=r&&/^https:\/\//.test(r.src)?r.src:'https://x.com/variational_io';}
    document.getElementById('bwReportSelect').addEventListener('change',archiveSource);
    archiveSource();
    summary();
    new MutationObserver(summary).observe(document.getElementById('bwPnl'),{childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
