(() => {
  const $ = id => document.getElementById(id);
  if (!$('ptsSellPlan')) return;
  const fields = ['ptsSellShare0', 'ptsSellShare1', 'ptsSellShare2', 'ptsSellFdv1', 'ptsSellFdv2', 'ptsSellCost', 'ptsSellFee'];
  const defaults = ['33.33', '33.33', '33.34', '5', '10', '0', '0'];
  const key = 'var-metrics-sell-plan-v2';
  let scenario;
  const usd = n => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:2}).format(n);
  const points = n => new Intl.NumberFormat('en-US', {maximumFractionDigits:2}).format(n);
  try {
    let saved = JSON.parse(localStorage.getItem(key));
    if (!saved) {
      const legacy = JSON.parse(localStorage.getItem('var-metrics-sell-plan-v1'));
      if (Array.isArray(legacy) && legacy.length === fields.length && legacy.every(v => typeof v === 'string')) {
        saved = legacy.slice();
        let oldTotal = 0;
        for (let i=0;i<3;i++) {
          const parts = legacy[i].split('/');
          const percent = parts.length === 2 ? Number(parts[0]) / Number(parts[1]) * 100 : Number(legacy[i].replace('%',''));
          oldTotal += percent;
          saved[i] = Number.isFinite(percent) ? String(Math.round(percent*100)/100) : defaults[i];
        }
        if (Math.abs(oldTotal-100) < 1e-8) saved[2] = String(Math.round((100-Number(saved[0])-Number(saved[1]))*100)/100);
      }
    }
    if (Array.isArray(saved) && saved.length === fields.length) saved.forEach((v,i) => { if (typeof v === 'string') $(fields[i]).value = v; });
  } catch {}
  function render() {
    if (!scenario) return;
    const {mine,pool,fdv} = scenario;
    // Allocate sequentially; the final stage always takes the remaining balance.
    const first = Math.min(100, Math.max(0, Number($('ptsSellShare0').value) || 0));
    const available = Math.max(0, 100-first);
    const second = Math.min(available, Math.max(0, Number($('ptsSellShare1').value) || 0));
    if ($('ptsSellShare0').value !== '' && Number($('ptsSellShare0').value) !== first) $('ptsSellShare0').value = String(first);
    if ($('ptsSellShare1').value !== '' && Number($('ptsSellShare1').value) !== second) $('ptsSellShare1').value = String(second);
    $('ptsSellShare1').max = String(available);
    const last = Math.round((100-first-second)*1e10)/1e10;
    $('ptsSellShare2').value = String(last);
    const shares = [first,second,last].map(v => v/100);
    const numeric = fields.slice(3).map(id => $(id).value.trim() === '' ? NaN : Number($(id).value));
    const [target1,target2,cost,fee] = numeric;
    const valid = [...shares.map(v => Number.isFinite(v) && v >= 0 && v <= 1), ...numeric.map((v,i) => Number.isFinite(v) && (i < 2 ? v > 0 : v >= 0) && (i !== 3 || v <= 100))];
    fields.forEach((id,i) => $(id).setAttribute('aria-invalid', String(!valid[i])));
    const total = shares.reduce((a,b) => a+b,0);
    const ok = valid.every(Boolean) && total <= 1 + 1e-9 && Number.isFinite(mine / pool * fdv);
    const status = $('ptsSellStatus');
    status.dataset.invalid = String(!ok);
    status.textContent = !valid.every(Boolean) ? 'Enter valid sell percentages (0–100%), positive FDVs and non-negative costs. Fees must be 0–100%.' : total > 1 + 1e-9 ? 'Sell shares exceed 100%. Reduce the plan to your original airdrop.' : `${(Math.min(total,1)*100).toFixed(2)}% planned for sale · ${(Math.max(0,1-total)*100).toFixed(2)}% left unsold · ${points(mine*Math.max(0,1-total))} points remaining (equivalent). Unsold tokens are excluded from proceeds.`;
    $('ptsSellTgeFdv').textContent = usd(fdv / 1e9) + 'B';
    const amounts = shares.map((s,i) => s === 0 ? 0 : mine / pool * .32 * [fdv,target1*1e9,target2*1e9][i] * s);
    const gross = amounts.reduce((a,b) => a+b,0), net = gross*(1-fee/100), profit = net-cost;
    if (ok && ![...amounts,gross,net,profit].every(Number.isFinite)) {
      status.textContent = 'Values are too large to calculate. Enter smaller amounts.';
      status.dataset.invalid = 'true';
    }
    const show = ok && [...amounts,gross,net,profit].every(Number.isFinite);
    amounts.forEach((n,i) => $('ptsSellAmount'+i).textContent = Number.isFinite(n) ? usd(n) : '—');
    let sold = 0;
    shares.forEach((s,i) => {
      sold += s;
      const remaining = Math.max(0,1-sold);
      $('ptsSellBalance'+i).textContent = `${(s*100).toFixed(2)}% of original tokens sold · ${(remaining*100).toFixed(2)}% remain`;
      $('ptsSellPoints'+i).textContent = `After sale: ${(remaining*100).toFixed(2)}% · ${points(mine*remaining)} points remaining`;
    });
    ['ptsSellGross','ptsSellNet','ptsSellProfit'].forEach((id,i) => $(id).textContent = show ? usd([gross,net,profit][i]) : '—');
  }
  function save() { try {localStorage.setItem(key,JSON.stringify(fields.map(id => $(id).value)));} catch {} }
  fields.forEach(id => $(id).addEventListener('input', () => {render();save();}));
  $('ptsSellThirds').addEventListener('click', () => {fields.forEach((id,i) => $(id).value = defaults[i]);render();save();});
  window.addEventListener('points-scenario-change', e => {scenario = e.detail;render();});
  // dashboard.js loads first; render once to pick up its initialized scenario.
  if (typeof renderPointsCalc === 'function') renderPointsCalc();
})();
