// 1200x630 PNG of a Points / FDV scenario — the X (Twitter) card image for /s/points links.
// Same art direction as the in-page canvas card (dashboard.js ptsCardDraw).
import { ImageResponse } from '@vercel/og';
import { parseScenario, describe } from './_scenario.js';

// Node runtime (Web-standard GET handler): the edge runtime refuses @vercel/og's embedded WebAssembly.
const BLUE = '#4c9af8', ICE = '#d6ecff';
const SANS = 'Geist', MONO = 'Geist Mono';

const h = (type, style, ...children) => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});
const img = (src, style) => ({ type: 'img', props: { src, style } });
const hair = (style) => h('div', { height: 1, background: 'rgba(76,154,248,.28)', ...style });
const sq = (style) => h('div', { position: 'absolute', width: 9, height: 9, background: BLUE, ...style });

const fontCache = new Map();
function font(origin, file) {
  if (!fontCache.has(file)) {
    fontCache.set(file, fetch(new URL('/assets/og/' + file, origin)).then((r) => {
      if (!r.ok) throw new Error('font ' + file);
      return r.arrayBuffer();
    }).catch((e) => { fontCache.delete(file); throw e; }));
  }
  return fontCache.get(file);
}

function valueSize(s) {
  const n = s.length;
  return n <= 8 ? 120 : n <= 10 ? 104 : n <= 12 ? 88 : n <= 14 ? 74 : 60;
}

export async function GET(req) {
  const url = new URL(req.url);
  const s = parseScenario(url.searchParams);
  if (!s) return new Response('bad scenario', { status: 400 });
  const d = describe(s);
  const origin = url.origin;

  const fonts = (await Promise.all([
    ['Geist-Bold.ttf', SANS, 700], ['Geist-SemiBold.ttf', SANS, 600], ['Geist-Medium.ttf', SANS, 500],
    ['GeistMono-SemiBold.ttf', MONO, 600], ['GeistMono-Medium.ttf', MONO, 500],
  ].map(([f, name, weight]) => font(origin, f).then((data) => ({ name, data, weight, style: 'normal' }), () => null))))
    .filter(Boolean);

  const stat = (k, v) => h('div', { flexDirection: 'column', width: 290 },
    hair({ width: 290 }),
    h('div', { fontFamily: MONO, fontWeight: 600, fontSize: 12, letterSpacing: 2.4, color: '#5f86bd', marginTop: 14 }, k),
    h('div', { fontFamily: SANS, fontWeight: 600, fontSize: v.length > 12 ? 30 : 38, color: '#fff', marginTop: 8 }, v),
  );

  const tree = h('div', {
    width: 1200, height: 630, position: 'relative', fontFamily: SANS, color: '#fff',
    backgroundColor: '#01040b',
    backgroundImage: 'radial-gradient(circle at 980px 90px, rgba(29,111,242,.24), rgba(29,111,242,0) 520px), linear-gradient(135deg, #01040b, #04122a)',
  },
    h('div', { position: 'absolute', left: 20, top: 20, width: 1160, height: 590, border: '1px solid rgba(76,154,248,.28)' }),
    sq({ left: 16, top: 16 }), sq({ right: 16, top: 16 }), sq({ left: 16, bottom: 16 }), sq({ right: 16, bottom: 16 }),
    // photo
    h('div', {
      position: 'absolute', left: 56, top: 56, width: 420, height: 518, borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(76,154,248,.45)', backgroundImage: 'linear-gradient(135deg,#0a2a5c,#04122a)',
    },
      img(origin + '/pepe-miami.jpg', { width: 420, height: 518, objectFit: 'cover', objectPosition: '50% 82%' }),
      h('div', { position: 'absolute', left: 0, bottom: 0, width: 420, height: 240, backgroundImage: 'linear-gradient(180deg, rgba(1,4,11,0), rgba(1,4,11,.55))' }),
    ),
    // right column
    h('div', { position: 'absolute', left: 528, top: 56, width: 616, height: 518, flexDirection: 'column' },
      h('div', { alignItems: 'center', justifyContent: 'space-between', height: 36 },
        h('div', { alignItems: 'center' },
          h('div', { width: 14, height: 14, background: BLUE, marginRight: 12 }),
          h('div', { fontWeight: 700, fontSize: 28 }, 'Var-metrics'),
        ),
        h('div', { fontFamily: MONO, fontWeight: 500, fontSize: 13, color: '#6f8fbd' }, 'The best dashboard for Variational.'),
      ),
      hair({ marginTop: 16 }),
      h('div', { fontFamily: MONO, fontWeight: 600, fontSize: 15, letterSpacing: 3.5, color: BLUE, marginTop: 36 }, 'MY $VAR AIRDROP SCENARIO'),
      h('div', {
        fontWeight: 700, fontSize: valueSize(d.value), lineHeight: 1.22, marginTop: 4, paddingBottom: 28, marginBottom: -14, letterSpacing: -2,
        backgroundImage: `linear-gradient(90deg, ${BLUE}, ${ICE})`, backgroundClip: 'text', color: 'transparent',
      }, d.value),
      h('div', { fontWeight: 500, fontSize: 26, color: '#9fb6d9', marginTop: 10 }, `at ${d.fdvStr} FDV · 32% genesis airdrop`),
      h('div', { flexWrap: 'wrap', marginTop: 30, rowGap: 18, columnGap: 32, width: 616 },
        stat('MY POINTS', d.points), stat('SHARE OF POOL', d.share),
        stat('TOTAL POOL', d.pool + ' pts'), stat('VALUE / POINT', d.perPt),
      ),
      h('div', { flexGrow: 1 }),
      hair({}),
      h('div', { justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontFamily: MONO },
        h('div', { fontWeight: 600, fontSize: 16, color: BLUE }, 'var-metrics.com'),
        h('div', { fontWeight: 500, fontSize: 12, color: '#4f6a93' }, 'TGE Q4 2026 · estimate, not advice'),
        h('div', { fontWeight: 500, fontSize: 15, color: '#8fa8cf' }, 'Built by @0xdefidaniel'),
      ),
    ),
  );

  // Render fully before answering: ImageResponse streams, so a render error would otherwise
  // reach X as an empty 200 (and get cached as a blank card).
  const render = (t) => new ImageResponse(t, { width: 1200, height: 630, fonts: fonts.length ? fonts : undefined }).arrayBuffer();
  let png, note = '';
  try { png = await render(tree); }
  catch (e) {
    note = String(e && e.message || e).slice(0, 200);
    // Retry without the photo (the only remote asset besides fonts).
    try { png = await render(JSON.parse(JSON.stringify(tree).replace(/\{"type":"img","props":\{[^}]*\}[^}]*\}\}/, '{"type":"div","props":{"style":{"display":"flex"}}}'))); }
    catch (e2) { return new Response('render failed: ' + note + ' | ' + String(e2 && e2.message || e2).slice(0, 200), { status: 500, headers: { 'Cache-Control': 'no-store' } }); }
  }
  if (!png || !png.byteLength) return new Response('render failed: empty', { status: 500, headers: { 'Cache-Control': 'no-store' } });
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': note ? 'public, max-age=300' : 'public, max-age=86400, s-maxage=31536000, immutable',
      ...(note ? { 'X-Card-Note': note.replace(/[^\x20-\x7e]/g, '') } : {}),
    },
  });
}
