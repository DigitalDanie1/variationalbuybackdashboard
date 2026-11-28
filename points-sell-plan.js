(() => {
  const $ = id => document.getElementById(id);
  if (!$('ptsSellPlan')) return;
  const fields = ['ptsSellShare0', 'ptsSellShare1', 'ptsSellShare2', 'ptsSellFdv1', 'ptsSellFdv2', 'ptsSellCost', 'ptsSellFee'];
  const defaults = ['1/3', '1/3', '1/3', '5', '10', '0', '0'];
  const key = 'var-metrics-sell-plan-v1';
  let scenario;
  const usd = n => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:2}).format(n);
  function share(value) {
    const s = value.trim();
    const fraction = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(s);
    if (fraction) return Number(fraction[2]) > 0 ? Number(fraction[1]) / Number(fraction[2]) : NaN;
    return /^(?:\d+(?:\.\d*)?|\.\d+)\s*%?$/.test(s) ? Number(s.replace('%','').trim()) / 100 : NaN;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved) && saved.length === fields.length) saved.forEach((v,i) => { if (typeof v === 'string') $(fields[i]).value = v; });
  } catch {}
  function render() {
    if (!scenario) return;
    const {mine,pool,fdv} = scenario;
    const shares = fields.slice(0,3).map(id => share($(id).value));
    const numeric = fields.slice(3).map(id => $(id).value.trim() === '' ? NaN : Number($(id).value));
    const [target1,target2,cost,fee] = numeric;
    const valid = [...shares.map(v => Number.isFinite(v) && v >= 0 && v <= 1), ...numeric.map((v,i) => Number.isFinite(v) && (i < 2 ? v > 0 : v >= 0) && (i !== 3 || v <= 100))];
    fields.forEach((id,i) => $(id).setAttribute('aria-invalid', String(!valid[i])));
    const total = shares.reduce((a,b) => a+b,0);
    const ok = valid.every(Boolean) && total <= 1 + 1e-9 && Number.isFinite(mine / pool * fdv);
    const status = $('ptsSellStatus');
    status.dataset.invalid = String(!ok);
    status.textContent = !valid.every(Boolean) ? 'Enter valid shares (0–100% or a fraction), positive FDVs and non-negative costs. Fees must be 0–100%.' : total > 1 + 1e-9 ? 'Sell shares exceed 100%. Reduce the plan to your original airdrop.' : `${(Math.min(total,1)*100).toFixed(2)}% planned for sale · ${(Math.max(0,1-total)*100).toFixed(2)}% left unsold. Unsold tokens are excluded from proceeds.`;
    $('ptsSellTgeFdv').textContent = usd(fdv / 1e9) + 'B';
    const amounts = shares.map((s,i) => mine / pool * .32 * [fdv,target1*1e9,target2*1e9][i] * s);
    const gross = amounts.reduce((a,b) => a+b,0), net = gross*(1-fee/100), profit = net-cost;
    if (![...amounts,gross,net,profit].every(Number.isFinite)) {
      status.textContent = 'Values are too large to calculate. Enter smaller amounts.';
      status.dataset.invalid = 'true';
    }
    const show = ok && [...amounts,gross,net,profit].every(Number.isFinite);
    amounts.forEach((n,i) => $('ptsSellAmount'+i).textContent = show ? usd(n) : '—');
    ['ptsSellGross','ptsSellNet','ptsSellProfit'].forEach((id,i) => $(id).textContent = show ? usd([gross,net,profit][i]) : '—');
  }
  function save() { try {localStorage.setItem(key,JSON.stringify(fields.map(id => $(id).value)));} catch {} }
  fields.forEach(id => $(id).addEventListener('input', () => {save();render();}));
  $('ptsSellThirds').addEventListener('click', () => {fields.forEach((id,i) => $(id).value = defaults[i]);save();render();});
  window.addEventListener('points-scenario-change', e => {scenario = e.detail;render();});
  // dashboard.js loads first; render once to pick up its initialized scenario.
  if (typeof renderPointsCalc === 'function') renderPointsCalc();
})();
