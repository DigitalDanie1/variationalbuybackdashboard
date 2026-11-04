// Shared parsing/formatting for the Points share link (/s/points) and its card image (/api/pts-card).
// Only three numbers travel in the URL; everything shown is recomputed here, so a link can't inject text.
export const POOL_MIN = 1e6, POOL_MAX = 1e8, FDV_MIN_M = 10, FDV_MAX_M = 1e6, PTS_MAX = 1e9;

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : NaN; };
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function parseScenario(searchParams) {
  const m = num(searchParams.get('m'));
  const p = num(searchParams.get('p'));
  const f = num(searchParams.get('f'));
  if (!(m >= 0) || !(p > 0) || !(f > 0)) return null;
  const mine = Math.round(clamp(m, 0, PTS_MAX));
  const pool = Math.round(clamp(p, POOL_MIN, POOL_MAX));
  const fdvM = Math.round(clamp(f, FDV_MIN_M, FDV_MAX_M));
  return { mine, pool, fdvM, fdv: fdvM * 1e6 };
}

const usd = (n, dp = 0) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: dp, minimumFractionDigits: dp });

export function describe(s) {
  const share = s.mine / s.pool;
  return {
    value: usd(s.fdv * 0.32 * share),
    share: share === 0 ? '0%' : Number(share * 100).toPrecision(4) + '%',
    perPt: usd(s.fdv * 0.32 / s.pool, 2),
    fdvStr: '$' + (s.fdv / 1e9).toFixed(s.fdv >= 1e9 ? 1 : 3) + 'B',
    points: s.mine.toLocaleString('en-US'),
    pool: (s.pool / 1e6).toFixed(2) + 'M',
  };
}

export const query = (s) => `m=${s.mine}&p=${s.pool}&f=${s.fdvM}`;
