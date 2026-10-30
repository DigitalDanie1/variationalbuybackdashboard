/* Landing E: pixel chart of the on-chain treasury, one column per day, rising from launch to
   today's balance. Reads SERIES / currentTreasuryBalance() from dashboard.js, so the landing
   and the Historical tab draw the same numbers. */
(function () {
  const root = document.querySelector('.le-landing');
  if (!root) return;
  const host = root.querySelector('.le-tree'), cv = host.querySelector('canvas'), g = cv.getContext('2d'), tip = root.querySelector('.le-tip');
  const count = document.getElementById('leTreasury'), added = document.getElementById('leAdded30'), days = document.getElementById('leDays');

  const money = (v, digits) => {
    if (v == null || !isFinite(v)) return '—';
    const a = Math.abs(v);
    const [d, s] = a >= 1e9 ? [1e9, 'B'] : a >= 1e6 ? [1e6, 'M'] : a >= 1e3 ? [1e3, 'K'] : [1, ''];
    return '$' + (v / d).toFixed(digits ?? (a >= 1e6 ? 2 : 0)) + s;
  };
  const full = v => '$' + Math.round(v).toLocaleString('en-US');
  const isLanding = () => document.body.classList.contains('v2-landing');
  const series = () => (typeof SERIES !== 'undefined' && Array.isArray(SERIES) && SERIES.length > 1) ? SERIES : null;
  const balance = () => (typeof currentTreasuryBalance === 'function') ? currentTreasuryBalance() : (series() ? series()[series().length - 1].v : null);

  // pixel logo: the mark sampled to a 13x10 bitmap
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 13; c.height = 10;
    const x = c.getContext('2d', { willReadFrequently: true });
    const h = 13 * img.height / img.width; x.drawImage(img, 0, (10 - h) / 2, 13, h);
    const px = x.getImageData(0, 0, 13, 10).data, out = root.querySelector('.le-brand canvas').getContext('2d');
    for (let i = 0; i < 130; i++) if (px[i * 4 + 3] > 115) { out.fillStyle = '#4c9af8'; out.fillRect(i % 13, (i / 13) | 0, 1, 1); }
  };
  img.src = 'variational-symbol-transparent.png?v=4';

  const RAMP = [[8, 22, 60], [22, 70, 170], [40, 120, 240], [76, 154, 248], [130, 200, 255], [225, 242, 255]];
  const ramp = k => {
    k = Math.max(0, Math.min(1, k));
    const f = k * (RAMP.length - 1), i = Math.min(RAMP.length - 2, Math.floor(f)), t = f - i;
    return RAMP[i].map((c, n) => Math.round(c + (RAMP[i + 1][n] - c) * t)).join(',');
  };
  let rnd;
  const rand = () => (rnd = (rnd * 1664525 + 1013904223) % 4294967296) / 4294967296;

  let S = [], inflow = [], p90 = 1, MAX = 1, seen = 0;
  let W = 0, H = 0, dpr = 1, C = 9, cols = 0, rowsMax = 0, baseY = 0, colDay = [], lift = [], mx = -1e4;

  function readData() {
    const src = series();
    if (!src) return false;
    S = src.filter(p => p.v > 0).map(p => [p.d, p.v]);
    const live = balance();
    const today = new Date().toISOString().slice(0, 10);
    if (isFinite(live) && S[S.length - 1][0] < today) S.push([today, live]);
    inflow = S.map((p, i) => i ? Math.max(0, p[1] - S[i - 1][1]) : 0);
    const sorted = inflow.slice().sort((a, b) => a - b);
    p90 = sorted[Math.floor(sorted.length * .9)] || 1;
    MAX = S[S.length - 1][1];
    seen = src.length;
    const t30 = Date.now() - 30 * 864e5;
    let back = null; for (let i = S.length - 1; i >= 0; i--) if (Date.parse(S[i][0]) <= t30) { back = S[i][1]; break; }
    countUp(added, back == null ? null : MAX - back, v => '+' + money(v, 2));
    countUp(days, S.length, v => String(Math.round(v)));
    return true;
  }
  function countUp(el, target, fmt) {
    if (!el || target == null) return;
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1600); el.textContent = fmt(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function layout() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = host.getBoundingClientRect(); W = r.width; H = r.height;
    if (!W || !H || !S.length) return false;
    cv.width = W * dpr; cv.height = H * dpr;
    C = W < 820 ? 6 : 9;
    cols = Math.ceil(W / C);
    baseY = Math.floor((H - 8) / C) * C;
    rowsMax = Math.floor((baseY - Math.round(H * .16 / C) * C) / C);
    colDay = [];
    for (let c = 0; c < cols; c++) {
      const i = Math.round(c * (S.length - 1) / (cols - 1));
      // inflow over the days this column covers, so no big day is skipped
      const i0 = c ? Math.round((c - 1) * (S.length - 1) / (cols - 1)) + 1 : 0;
      let f = 0; for (let k = i0; k <= i; k++) f += inflow[k];
      colDay.push({ x: c * C, d: S[i][0], v: S[i][1], f, h: Math.max(1, Math.round(S[i][1] / MAX * rowsMax)) });
    }
    return true;
  }
  function draw(progress, t) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const fc = (cols - 1) * progress, upto = Math.max(0, Math.floor(fc)), frac = fc - upto;
    rnd = 20261030;
    const sweep = progress >= 1 ? ((t / 2600) % 1.5) - .25 : -9; // light band crossing the area once risen
    for (let c = 0; c <= Math.min(cols - 1, upto + 1); c++) {
      const col = colDay[c], heat = Math.min(1, col.f / p90);
      const near = Math.max(0, 1 - Math.abs(col.x + C / 2 - mx) / 140);
      lift[c] = (lift[c] || 0) + (near - (lift[c] || 0)) * .14;
      const glow = lift[c] + Math.max(0, 1 - Math.abs(c / cols - sweep) / .06) * .5;
      const h = c > upto ? Math.floor(col.h * frac) : col.h + Math.round(lift[c] * 3); // leading column grows up, cursor lifts
      for (let r = 0; r < h; r++) {
        const y = baseY - (r + 1) * C, fromTop = h - 1 - r;
        // body darkens toward the floor; the top few cells carry that day's heat
        const k = (fromTop === 0 ? .62 + heat * .38 : fromTop < 3 ? .45 + heat * .3 - fromTop * .06 : .34 * (r / rowsMax) + .1) + glow * .32;
        g.fillStyle = `rgb(${ramp(k)})`;
        g.fillRect(col.x + 1, y + 1, C - 2, C - 2);
      }
      const n = c > upto ? 0 : Math.round(heat * 4); // sparks above the big days
      for (let k = 0; k < n; k++) {
        const sx = col.x + Math.round((rand() - .5) * 4) * C, sy = baseY - (col.h + 1 + Math.floor(rand() * 4)) * C;
        g.fillStyle = `rgba(${ramp(.6 + rand() * .4)},${.25 + rand() * .45})`;
        g.fillRect(sx + 1, sy + 1, C - 2, C - 2);
      }
    }
    // milestones: plain chips above the column, skipped where they would sit on the NOW label
    g.font = '500 10.5px "Geist Mono", monospace'; g.textBaseline = 'alphabetic';
    [1e6, 5e6, 1e7].map(lv => colDay.find(c => c.v >= lv)).filter(m => m && colDay.indexOf(m) <= upto && colDay[upto].x - m.x > 200).forEach(m => {
      const txt = money(m.v, 0) + ' · ' + m.d.slice(5), w = g.measureText(txt).width + 12;
      const x = Math.max(4, Math.min(W - w - 4, m.x + C / 2 - w / 2)), y = baseY - m.h * C - 6 * C;
      g.fillStyle = 'rgba(1,4,11,.85)'; g.fillRect(x, y - 13, w, 18);
      g.fillStyle = '#bfe0ff'; g.fillText(txt, x + 6, y);
    });
    // live head: the current top cell pulses and carries the running balance
    const head = colDay[upto], hy = baseY - head.h * C, done = progress >= 1;
    const pulse = .55 + .45 * Math.sin(t / 220);
    g.fillStyle = `rgba(76,154,248,${.35 * pulse})`; g.fillRect(head.x - C, hy - C, C * 3, C * 3);
    g.fillStyle = `rgba(225,242,255,${pulse})`; g.fillRect(head.x - 1, hy - 1, C + 2, C + 2);
    const value = done ? (balance() ?? MAX) : head.v;
    const label = (done ? 'NOW ' : head.d.slice(5) + ' ') + money(value, 2);
    g.font = '500 12px "Geist Mono", monospace';
    const lw = g.measureText(label).width + 14;
    const lx = head.x + C + 10 + lw > W - 8 ? head.x - lw - 10 : head.x + C + 10; // flip left at the edge
    g.fillStyle = '#4c9af8'; g.fillRect(lx, hy - 22, lw, 20);
    g.fillStyle = '#00040d'; g.fillText(label, lx + 7, hy - 8);
    if (count) count.textContent = money(value, 2);
  }

  // rise for DUR, hold on today's balance for HOLD, replay; restarts whenever the landing is shown
  const DUR = 4200, HOLD = 6000;
  let t0 = performance.now(), ready = false, wasShown = false;
  function frame(t) {
    const shown = isLanding() && !document.hidden;
    if (shown) {
      const s = series();
      if (!ready || (s && s.length !== seen)) { ready = readData() && layout(); t0 = t; }
      else if (!wasShown) { layout(); t0 = t; }
      if (ready) {
        const k = Math.min(1, ((t - t0) % (DUR + HOLD)) / DUR);
        draw(k < 1 ? 1 - Math.pow(1 - k, 1.8) : 1, t);
      }
    }
    wasShown = shown;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  addEventListener('resize', () => { if (ready) layout(); });
  host.addEventListener('click', () => t0 = performance.now());
  host.addEventListener('pointermove', e => {
    if (!ready) return;
    const x = e.clientX - host.getBoundingClientRect().left;
    mx = x;
    const c = colDay[Math.max(0, Math.min(cols - 1, Math.round(x / C)))];
    tip.style.display = 'block'; tip.style.left = c.x + 'px'; tip.style.top = (baseY - c.h * C) + 'px';
    tip.innerHTML = `${c.d}<br>Treasury ${full(c.v)}<br>Added +${full(c.f)}`;
  });
  host.addEventListener('pointerleave', () => { tip.style.display = 'none'; mx = -1e4; });
})();
