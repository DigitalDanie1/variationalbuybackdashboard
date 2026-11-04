// /s/points?m=&p=&f= — the link a "Share my scenario" tweet carries.
// Crawlers (Twitterbot) read the og/twitter tags and show the scenario card image;
// people are sent on to the calculator with the same scenario loaded.
import { parseScenario, describe, query } from './_scenario.js';

export const config = { runtime: 'edge' };

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default function handler(req) {
  const url = new URL(req.url);
  const s = parseScenario(url.searchParams);
  const origin = url.origin;
  if (!s) return Response.redirect(origin + '/#points', 302);
  const d = describe(s);
  const q = query(s);
  const target = `${origin}/?${q}#points`;
  const image = `${origin}/api/pts-card?${q}`;
  const title = `My $VAR airdrop scenario: ${d.value} at ${d.fdvStr} FDV`;
  const desc = `${d.points} points · ${d.share} of a ${d.pool} pts pool · ${d.perPt}/pt (32% genesis airdrop). Live Points / FDV calculator on var-metrics.com.`;
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Var-metrics">
<meta property="og:url" content="${esc(origin + '/s/points?' + q)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="@0xdefidaniel">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0;url=${esc(target)}">
<link rel="canonical" href="${esc(target)}">
<style>body{margin:0;background:#01040b;color:#d6ecff;font:16px/1.5 system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}a{color:#4c9af8}</style>
</head><body><p>Opening the calculator… <a href="${esc(target)}">Continue</a></p></body></html>`;
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300, s-maxage=86400' },
  });
}
