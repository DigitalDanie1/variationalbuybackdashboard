/* Post-TGE placeholder. Mount before tge-groups.js arranges the navigation. */
(function () {
  'use strict';
  var TAB = 'variational-pro';
  var TITLE = 'Variational Pro';

  /* ---------- what Pro is, inside the title screen ----------
     The explainer lives in the game frame itself: the title is screen 0 and four more
     screens follow, stepped with the bar at the bottom (◀ ▶, dots, or the arrow keys).
     No intro copy: each screen is one picture with the fewest words that carry it.
     Built from Variational's "About Pro" docs, paraphrased. The frame is always dark, so
     colours here are fixed rather than theme tokens. */
  var DOCS = 'https://docs.variational.io/pro/about-pro';
  var TAGS = { chat: 'Chat', legal: 'Legal', money: 'Money', manual: 'Manual', risk: 'Risk', auto: 'Auto' };
  var OLD = [
    ['Fund wants an altcoin option', ''],
    ['Deribit doesn’t list it → DM a desk on Telegram', 'chat'],
    ['ISDA + KYC first; other desks say no', 'legal'],
    ['One desk left: describe the structure in chat', 'chat'],
    ['Desk prices it in a spreadsheet', 'manual'],
    ['Quote and terms come back', 'chat'],
    ['Haggle on price and terms', 'chat'],
    ['Email confirm → legal + ops review', 'legal'],
    ['Test transfer to the desk', 'money'],
    ['Send collateral straight to the desk', 'risk'],
    ['Trade cleared', ''],
    ['Margin checked “every so often”; desk never posts back', 'risk']
  ];
  var PRO = [
    ['Fund wants an altcoin option', ''],
    ['Build an RFQ — UI or API', 'auto'],
    ['Every market maker sees it and quotes', 'auto'],
    ['Compare price, margin terms, counterparty', ''],
    ['Accept → both deposit into an on-chain pool', 'auto'],
    ['Cleared. Margin, funding, liquidations run themselves', 'auto']
  ];
  var SCREENS = ['Title', 'The same trade', 'One RFQ', 'Bosses beaten', 'Power-ups'];

  function lane(steps, cls, title, foot) {
    return '<div class="vps-lane ' + cls + '"><div class="vps-lane-h"><b>' + title + '</b>' +
      '<strong>' + steps.length + '<small>steps</small></strong></div><ol>' +
      steps.map(function (s, i) {
        return '<li' + (s[1] ? ' class="t-' + s[1] + '"' : '') + '><i>' + (i + 1) + '</i><p>' + s[0] + '</p>' +
          (s[1] ? '<em>' + TAGS[s[1]] + '</em>' : '') + '</li>';
      }).join('') + '</ol><div class="vps-lane-f">' + foot + '</div></div>';
  }

  /* RFQ → quotes → one accepted → both sides into one pool → the protocol runs the trade */
  function flowSvg() {
    var mm = [['Market maker A', '$412'], ['Market maker B', '$405'], ['Market maker C', '$419']];
    var s = '<svg class="vps-flow" viewBox="0 0 960 360" role="img" aria-label="A fund sends one RFQ, three market makers quote, the fund accepts market maker B, both deposit into an on-chain settlement pool, and the protocol tracks margin, settles funding and liquidates">' +
      '<defs><marker id="vps-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#8da7cb"/></marker></defs>';
    s += '<rect x="10" y="115" width="170" height="80" rx="8" class="n taker"/>' +
      '<text x="95" y="149" class="t">Hedge fund</text><text x="95" y="171" class="s">sends one RFQ</text>';
    mm.forEach(function (m, i) {
      var y = 20 + i * 100, on = i === 1;
      s += '<path d="M180 155 C 230 155, 230 ' + (y + 35) + ', 285 ' + (y + 35) + '" class="e" marker-end="url(#vps-ar)"/>' +
        '<rect x="290" y="' + y + '" width="190" height="70" rx="8" class="n mm' + (on ? ' on' : '') + '"/>' +
        '<text x="385" y="' + (y + 30) + '" class="t">' + m[0] + '</text>' +
        '<text x="385" y="' + (y + 52) + '" class="s' + (on ? ' hi' : '') + '">quotes ' + m[1] + (on ? ' · accepted' : '') + '</text>';
    });
    s += '<path d="M480 155 L 585 155" class="e on" marker-end="url(#vps-ar)"/>' +
      '<path d="M95 195 C 95 350, 675 350, 675 214" class="e on" marker-end="url(#vps-ar)"/>' +
      '<text x="385" y="346" class="s">both deposit collateral into the pool</text>' +
      '<rect x="590" y="100" width="170" height="110" rx="10" class="n pool"/>' +
      '<text x="675" y="140" class="t">Settlement pool</text><text x="675" y="162" class="s">on-chain escrow</text>' +
      '<text x="675" y="182" class="s">fund ↔ MM B only</text>';
    ['Tracks margin', 'Settles funding', 'Auto-liquidates'].forEach(function (t, i) {
      var y = 60 + i * 70;
      s += '<path d="M760 155 C 790 155, 790 ' + (y + 25) + ', 815 ' + (y + 25) + '" class="e auto" marker-end="url(#vps-ar)"/>' +
        '<rect x="820" y="' + y + '" width="135" height="50" rx="8" class="n auto"/>' +
        '<text x="887" y="' + (y + 30) + '" class="s strong">' + t + '</text>';
    });
    return s + '</svg>';
  }

  function screens() {
    var bosses = [
      ['Few players', 'KYC and manual quoting keep most desks and funds out', 'One RFQ reaches every market maker at once'],
      ['Human error', 'Margin, collateral and liquidations done by hand', 'The protocol runs all three'],
      ['Counterparty risk', 'Collateral sits with the desk — the FTX lesson', 'Both sides post on-chain, isolated per pair']
    ].map(function (b, i) {
      return '<div class="vps-boss"><span class="vps-hp"><i></i></span><b>BOSS ' + (i + 1) + ' · ' + b[0] + '</b>' +
        '<p class="was">' + b[1] + '</p><p class="ko">K.O. → ' + b[2] + '</p></div>';
    }).join('');
    var pools = '<svg class="vps-pools" viewBox="0 0 300 110" aria-hidden="true">' +
      [['Fund', 'MM A', 6], ['Fund', 'MM B', 62]].map(function (r) {
        return '<rect x="4" y="' + r[2] + '" width="70" height="40" rx="6" class="n taker"/><text x="39" y="' + (r[2] + 25) + '" class="s">' + r[0] + '</text>' +
          '<rect x="112" y="' + r[2] + '" width="76" height="40" rx="6" class="n pool"/><text x="150" y="' + (r[2] + 25) + '" class="s">pool</text>' +
          '<rect x="226" y="' + r[2] + '" width="70" height="40" rx="6" class="n mm"/><text x="261" y="' + (r[2] + 25) + '" class="s">' + r[1] + '</text>' +
          '<line x1="74" y1="' + (r[2] + 20) + '" x2="112" y2="' + (r[2] + 20) + '" class="e on"/><line x1="188" y1="' + (r[2] + 20) + '" x2="226" y2="' + (r[2] + 20) + '" class="e on"/>';
      }).join('') + '</svg>';
    var powers = [
      ['★', 'RFQ', 'Ask for any structure; makers compete with quotes. Answer others’ RFQs too.', ''],
      ['◆', 'Bilateral', 'Peer-to-peer, one settlement pool per pair. Nothing mixes between pools.', pools],
      ['✚', 'Custom terms', 'Whitelist who quotes you, margin per pool, auto-liquidation and penalty.', '']
    ].map(function (p) {
      return '<div class="vps-power"><span>' + p[0] + '</span><b>' + p[1] + '</b><p>' + p[2] + '</p>' + p[3] + '</div>';
    }).join('');
    return '<div class="vps-scr" data-scr="1" hidden><div class="vps-head"><span>STAGE 1</span><b>The same altcoin option trade</b></div>' +
        '<div class="vps-lanes">' + lane(OLD, 'old', 'Today', '1 desk · lawyers · wires · your collateral at their desk') +
        '<div class="vps-vs">VS</div>' + lane(PRO, 'pro', 'On Pro', 'every desk quotes · 1 person or a bot · collateral on-chain') + '</div></div>' +
      '<div class="vps-scr" data-scr="2" hidden><div class="vps-head"><span>STAGE 2</span><b>One RFQ, then the protocol takes over</b></div>' +
        '<div class="vps-flowwrap">' + flowSvg() + '</div></div>' +
      '<div class="vps-scr" data-scr="3" hidden><div class="vps-head"><span>STAGE 3</span><b>What it knocks out</b></div>' +
        '<div class="vps-grid3">' + bosses + '</div></div>' +
      '<div class="vps-scr" data-scr="4" hidden><div class="vps-head"><span>STAGE 4</span><b>What every Pro trade gets</b></div>' +
        '<div class="vps-grid3">' + powers + '</div></div>';
  }

  function navBar() {
    return '<div class="vp-coming vps-nav">' +
      '<button type="button" class="vps-btn" data-vps="prev" aria-label="Previous screen">◀</button>' +
      '<span class="vp-coming-label" data-vps-label>COMING SOON</span>' +
      '<span class="vps-dots">' + SCREENS.map(function (n, i) {
        return '<button type="button" data-vps-go="' + i + '" aria-label="' + n + '"' + (i ? '' : ' class="on"') + '></button>';
      }).join('') + '</span>' +
      '<a class="vps-src" href="' + DOCS + '" target="_blank" rel="noopener noreferrer">docs ↗</a>' +
      '<span class="vp-coming-index" data-vps-index>01 / 05</span>' +
      '<button type="button" class="vps-btn vps-start" data-vps="next" aria-label="Next screen">PRESS START ▶</button></div>';
  }

  function wireScreens(section) {
    var cur = 0;
    var scrs = [section.querySelector('.vp-title-screen')].concat([].slice.call(section.querySelectorAll('.vps-scr')));
    var label = section.querySelector('[data-vps-label]'), index = section.querySelector('[data-vps-index]');
    var next = section.querySelector('.vps-start');
    function go(i) {
      cur = (i + scrs.length) % scrs.length;
      scrs.forEach(function (el, k) { el.hidden = k !== cur; });
      section.querySelectorAll('[data-vps-go]').forEach(function (d, k) { d.classList.toggle('on', k === cur); });
      label.textContent = cur ? SCREENS[cur].toUpperCase() : 'COMING SOON';
      index.textContent = ('0' + (cur + 1)).slice(-2) + ' / 0' + scrs.length;
      next.textContent = cur ? (cur === scrs.length - 1 ? 'TITLE ↺' : 'NEXT ▶') : 'PRESS START ▶';
    }
    section.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-vps],[data-vps-go]');
      if (!b) return;
      if (b.hasAttribute('data-vps-go')) go(+b.getAttribute('data-vps-go'));
      else go(cur + (b.getAttribute('data-vps') === 'next' ? 1 : -1));
    });
    document.addEventListener('keydown', function (e) {
      if (section.classList.contains('tg-hide') || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) return;
      if (e.key === 'ArrowRight') go(cur + 1);
      else if (e.key === 'ArrowLeft') go(cur - 1);
    });
  }

  var VPS_CSS =
    '.vp-title-screen[hidden],.vps-scr[hidden]{display:none!important}' +
    '.vps-scr{position:relative;isolation:isolate;display:flex;flex-direction:column;gap:18px;min-height:660px;min-height:max(660px,calc(100svh - 245px));padding:26px 34px 30px;background:radial-gradient(ellipse at 90% 65%,#224677 0,transparent 58%),linear-gradient(135deg,#1b2032 30%,#101d34 100%);color:#fff;overflow:hidden}' +
    '.vps-scr:after{content:"";position:absolute;inset:0;z-index:-1;opacity:.1;background-image:linear-gradient(#8bacda 1px,transparent 1px),linear-gradient(90deg,#8bacda 1px,transparent 1px);background-size:64px 64px}' +
    '.vps-head span{display:block;color:#83b7ff;font:800 10px var(--mono);letter-spacing:4px}.vps-head b{display:block;margin-top:6px;font:900 clamp(22px,2.8vw,34px)/1.05 var(--sans,Arial,sans-serif);letter-spacing:-.04em;text-transform:uppercase}' +
    '.vps-lanes{display:grid;grid-template-columns:minmax(0,1.15fr) auto minmax(0,1fr);gap:14px;align-items:start}' +
    '.vps-vs{align-self:center;color:#68a8ff;font:900 26px var(--sans,Arial,sans-serif);text-shadow:0 0 24px #4c9af8aa}' +
    '.vps-lane{border:1px solid #344767;background:#0a1220cc}.vps-lane.pro{border-color:#4c9af8;box-shadow:0 0 40px #4c9af822}' +
    '.vps-lane-h{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #344767}.vps-lane-h b{font:800 16px var(--sans,Arial,sans-serif)}' +
    '.vps-lane-h strong{color:#ff5d7a;font:900 30px/1 var(--mono);text-align:right}.vps-lane.pro .vps-lane-h strong{color:#68a8ff}.vps-lane-h small{display:block;color:#8da7cb;font:700 8px var(--mono);letter-spacing:1px;text-transform:uppercase}' +
    '.vps-lane ol{list-style:none;margin:0;padding:6px 0}.vps-lane li{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:9px;align-items:center;padding:4px 14px}' +
    '.vps-lane li i{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid #4a5f82;color:#8da7cb;font:800 9px var(--mono);font-style:normal}' +
    '.vps-lane li p{margin:0;color:#dbe6f7!important;font:12px/1.35 var(--sans,Arial,sans-serif)!important}' +
    '.vps-lane li em{padding:1px 6px;border-radius:3px;border:1px solid currentColor;font:800 8px var(--mono);font-style:normal;letter-spacing:.5px;text-transform:uppercase}' +
    '.vps-lane .t-chat em{color:#5aa9e6}.vps-lane .t-legal em{color:#b08cf0}.vps-lane .t-manual em{color:#e0a43a}.vps-lane .t-money em{color:#9fb1c8}.vps-lane .t-risk em{color:#ff5d7a}.vps-lane .t-auto em{color:#3fd69a}' +
    '.vps-lane li.t-risk i{border-color:#ff5d7a;color:#ff5d7a}.vps-lane.pro li i{border-color:#4c9af8;color:#68a8ff}' +
    '.vps-lane-f{padding:9px 16px;border-top:1px solid #344767;color:#8da7cb;font:10px/1.5 var(--mono)}.vps-lane.pro .vps-lane-f{color:#dbe6f7}' +
    '.vps-flowwrap{flex:1;display:flex;align-items:center;overflow-x:auto}.vps-flow{display:block;width:100%;min-width:640px;height:auto}' +
    '.vps-flow .n,.vps-pools .n{fill:#0a1220;stroke:#4a5f82;stroke-width:1.5}.vps-flow .n.taker,.vps-pools .n.taker{stroke:#9fb1c8}.vps-flow .n.mm.on{stroke:#4c9af8;stroke-width:2.5;filter:drop-shadow(0 0 10px #4c9af877)}' +
    '.vps-flow .n.pool,.vps-pools .n.pool{stroke:#3fd69a;stroke-width:2.5;fill:#0f2a26}.vps-flow .n.auto{stroke:#3fd69a;stroke-dasharray:4 3}' +
    '.vps-flow .t{fill:#fff;font:800 15px var(--sans,Arial,sans-serif);text-anchor:middle}.vps-flow .s,.vps-pools .s{fill:#8da7cb;font:600 11.5px var(--mono);text-anchor:middle}.vps-flow .s.hi{fill:#68a8ff}.vps-flow .s.strong{fill:#fff;font-weight:800}' +
    '.vps-flow .e,.vps-pools .e{fill:none;stroke:#8da7cb;stroke-width:1.5;opacity:.6}.vps-flow .e.on,.vps-pools .e.on{stroke:#4c9af8;opacity:1;stroke-width:2}.vps-flow .e.auto{stroke:#3fd69a;opacity:.9}' +
    '.vps-grid3{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-content:center}' +
    '.vps-boss,.vps-power{padding:18px;border:1px solid #344767;background:#0a1220cc;min-width:0}' +
    '.vps-hp{display:block;height:8px;margin:0 0 14px;border:1px solid #ff5d7a;background:#2a1220}.vps-hp i{display:block;width:0;height:100%;background:#ff5d7a}' +
    '.vps-boss b,.vps-power b{display:block;margin:0 0 12px;font:800 14px var(--mono);letter-spacing:.5px;text-transform:uppercase}' +
    '.vps-boss p{margin:0;font:12.5px/1.5 var(--sans,Arial,sans-serif)!important}.vps-boss p.was{color:#8da7cb!important;text-decoration:line-through;text-decoration-color:#ff5d7a99;margin-bottom:12px}.vps-boss p.ko{color:#3fd69a!important;font-weight:700!important}' +
    '.vps-power span{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;margin-bottom:12px;border-radius:10px;background:#4c9af8;color:#081326;font:900 20px var(--sans,Arial,sans-serif);box-shadow:0 0 24px #4c9af866}' +
    '.vps-power p{margin:0;color:#dbe6f7!important;font:12.5px/1.55 var(--sans,Arial,sans-serif)!important}.vps-pools{display:block;width:100%;max-width:300px;margin-top:14px}' +
    '.vps-nav{gap:12px 16px}.vps-btn{padding:8px 12px;border:1px solid #5d83b5;border-radius:2px;background:#1c304d;color:#e2edff;font:800 11px var(--mono);cursor:pointer;letter-spacing:1px}.vps-btn:hover{border-color:#acd0ff}' +
    '.vps-start{background:#4c9af8;border-color:#4c9af8;color:#081326;animation:vpsblink 1.4s steps(2) infinite}.vps-start:hover{animation:none}@keyframes vpsblink{50%{opacity:.55}}' +
    '.vps-press{position:absolute;left:50%;bottom:15%;z-index:4;transform:translateX(-50%);display:inline-flex;align-items:center;gap:16px;padding:20px 44px;border:2px solid #68a8ff;border-radius:4px;background:#0a1220e6;color:#fff;font:900 clamp(22px,3vw,40px)/1 var(--mono);letter-spacing:.18em;cursor:pointer;white-space:nowrap;box-shadow:0 0 0 6px #4c9af81f,0 0 60px #4c9af866;text-shadow:0 0 18px #68a8ff;animation:vpsblink 1.1s steps(2) infinite}' +
    '.vps-press span{color:#68a8ff;font-size:.8em}.vps-press:hover,.vps-press:focus-visible{animation:none;background:#4c9af8;color:#081326;text-shadow:none;transform:translateX(-50%) scale(1.04);outline:none}.vps-press:hover span,.vps-press:focus-visible span{color:#081326}' +
    '@media(max-width:600px){.vps-press{bottom:12%;padding:14px 22px;gap:10px;font-size:18px;letter-spacing:.12em}}' +
    '.vps-dots{display:flex;gap:7px}.vps-dots button{flex:none;width:10px;height:10px;min-width:0;min-height:0!important;padding:0;border:1px solid #6695d2;background:transparent;cursor:pointer}.vps-dots button.on{background:#4c9af8;border-color:#4c9af8;box-shadow:0 0 10px #4c9af8}' +
    '.vps-src{color:#6695d2!important;font:9px var(--mono);letter-spacing:1px;text-decoration:none}.vps-nav .vp-coming-index{margin-left:auto}' +
    '@media(max-width:900px){.vps-lanes{grid-template-columns:minmax(0,1fr)}.vps-vs{justify-self:center}.vps-grid3{grid-template-columns:minmax(0,1fr)}.vps-scr{padding:20px 18px 24px}}' +
    '@media(max-width:600px){.vps-nav{padding:14px 16px!important}.vps-src{display:none}.vps-lane li{grid-template-columns:20px minmax(0,1fr)}.vps-lane li em{grid-column:2;justify-self:start}}';
  function injectVpsStyle() {
    if (document.getElementById('vps-style')) return;
    var st = document.createElement('style');
    st.id = 'vps-style';
    st.textContent = VPS_CSS;
    document.head.appendChild(st);
  }

  function boot() {
    injectVpsStyle();
    var main = document.getElementById('main');
    var tabs = document.getElementById('tabs');
    if (!main || !tabs || document.getElementById('tab-' + TAB)) return;

    VALID_TABS.push(TAB);
    DEFAULT_TAB_ORDER.push(TAB);
    SECTION_COPY[TAB] = {
      eyebrow: 'Post-TGE', title: TITLE, description: 'Coming soon', chip: 'coming soon'
    };

    var section = document.createElement('section');
    section.className = 'tsec tg-hide';
    section.setAttribute('data-tg', TAB);
    section.innerHTML = '<div class="vp-reveal vp-title-screen">' +
      '<div class="vp-topline"><span>VARIATIONAL</span><span>THE NEXT CHAPTER</span></div>' +
      '<div class="vp-atmosphere" aria-hidden="true"><div class="vp-orbit"></div><div class="vp-horizon"></div></div>' +
      '<div class="vp-identity"><div class="vp-brand"><span class="vp-mark"><svg viewBox="320 450 1360 960" aria-hidden="true"><defs><filter id="vp-mark-color" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .298 0 0 0 0 .608 0 0 0 0 .973 0 0 2 0 -.3"/></filter></defs><image href="variational-logo.png" width="2000" height="2000" filter="url(#vp-mark-color)"/></svg></span><span>Variational</span></div>' +
      '<h2 class="vp-pro">PRO</h2><div class="vp-caption"><span></span><p>A bigger arena awaits.</p><span></span></div><button class="vps-press" type="button" data-vps="next">PRESS START <span>▶</span></button></div>' +
      '<div class="vp-bottom"><span class="vp-status"><i></i> COMING SOON</span><p>Something bigger is on the horizon.</p><span class="vp-edition">A NEW ERA / PRO</span></div></div>' + screens() + navBar();
    main.appendChild(section);
    wireScreens(section);

    var button = document.createElement('button');
    button.id = 'tab-' + TAB;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', 'false');
    button.dataset.tab = TAB;
    button.textContent = TITLE;
    tabs.appendChild(button);

    document.querySelectorAll('[data-open-tab="whales-next"]').forEach(function (source) {
      var next = source.cloneNode(true);
      next.setAttribute('data-open-tab', TAB);
      next.classList.remove('on');
      var title = next.querySelector('strong') || next.querySelector('b');
      if (title) title.textContent = TITLE;
      var small = next.querySelector('small');
      if (small) small.textContent = 'Coming soon';
      source.parentNode.insertBefore(next, source.nextSibling);
    });

    var style = document.createElement('style');
    style.textContent = `
.tsec[data-tg="variational-pro"]{padding-top:16px}
.vp-reveal{position:relative;isolation:isolate;display:flex;flex-direction:column;min-height:680px;min-height:max(680px,calc(100svh - 170px));overflow:hidden;background:#080e1b;border:1px solid #273953;color:#fff}
.vp-topline{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 32px;border-bottom:1px solid #92baff18;color:#7f96b9;font:9px/1.5 var(--mono);letter-spacing:3px}
.vp-topline>span:first-child{color:#b8c9e4;letter-spacing:4px}
.vp-atmosphere{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:radial-gradient(ellipse at 50% 76%,#2458a343,transparent 60%),radial-gradient(ellipse at 50% 120%,#509dff40,transparent 55%)}
.vp-orbit{position:absolute;width:145%;height:80%;left:-22.5%;top:54%;border-radius:50%;border-top:1px solid #85baff99;box-shadow:0 -2px 24px #4b9aff40,0 -35px 90px #417dce18;background:radial-gradient(ellipse at 50% 0,#2b65b326,transparent 60%)}
.vp-horizon{position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.9%,#85baff0d 50%,transparent 50.1%);opacity:.7}
.vp-identity{position:relative;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;padding:42px 24px 70px}
.vp-brand{display:flex;align-items:center;justify-content:center;gap:14px;color:#f2f6ff;font:400 clamp(28px,4.3vw,64px)/1.2 Arial,sans-serif;letter-spacing:-2px}
.vp-mark{position:relative;width:1.35em;height:.95em;overflow:hidden;display:block;flex:none}.vp-mark svg{display:block;width:100%;height:100%;overflow:visible}
body.v2-dashboard h2.vp-pro{font:900 clamp(140px,23vw,340px)/.87 var(--sans,Arial,sans-serif)!important;letter-spacing:-.045em!important;padding-right:.045em;margin:24px 0 34px!important;color:#b9d7ff!important;background:linear-gradient(180deg,#fff 5%,#d9e7fc 28%,#80aff0 68%,#315887 100%);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 12px 40px #1f6fcc28)}
.vp-caption{display:flex;align-items:center;gap:20px;width:min(100%,540px);justify-content:center}.vp-caption>span{height:1px;flex:1;background:linear-gradient(90deg,transparent,#5f83b8)}.vp-caption>span:last-child{transform:rotate(180deg)}.vp-caption p{margin:0!important;color:#a9c3e6!important;font:400 clamp(13px,1.5vw,18px)/1.5 var(--sans,Arial,sans-serif)!important;letter-spacing:1px;white-space:nowrap}
.vp-bottom{position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:26px 32px;border-top:1px solid #92baff20;background:#060c15aa;z-index:2}
.vp-status{display:flex;align-items:center;gap:9px;color:#d0e4ff;font:700 10px/1.5 var(--mono);letter-spacing:2px;white-space:nowrap}.vp-status i{height:5px;width:5px;border-radius:50%;background:#74b5ff;box-shadow:0 0 12px #4c9af8}
.vp-bottom p{margin:0!important;color:#8a9db8!important;font:11px/1.5 var(--sans,Arial,sans-serif)!important}.vp-edition{color:#536b8b;font:8px/1.5 var(--mono);letter-spacing:2px;white-space:nowrap}
@media(min-width:1600px){body.v2-dashboard h2.vp-pro{font-size:clamp(340px,23vw,470px)!important}.vp-reveal{min-height:800px}}
@media(max-width:900px){.vp-reveal{min-height:630px}.vp-topline,.vp-bottom{padding:22px}.vp-edition{display:none}.vp-brand{font-size:clamp(28px,5vw,48px)}body.v2-dashboard h2.vp-pro{font-size:clamp(140px,24vw,230px)!important}.vp-identity{padding:65px 20px 80px}}
@media(max-width:600px){.vp-reveal{min-height:max(570px,calc(100svh - 185px))}.vp-topline{padding:20px 16px;font-size:7px;letter-spacing:1px}.vp-topline>span:first-child{letter-spacing:2px}.vp-brand{font-size:34px;gap:10px;letter-spacing:-1.5px}body.v2-dashboard h2.vp-pro{font-size:clamp(115px,34vw,200px)!important;margin:25px 0 32px!important}.vp-identity{padding:70px 18px 90px}.vp-caption{gap:12px}.vp-caption p{font-size:12px!important;letter-spacing:.3px}.vp-bottom{flex-direction:column;align-items:center;padding:22px 12px;gap:10px}.vp-bottom p{font-size:10px!important}.vp-orbit{top:58%;width:200%;left:-50%}}
`;
    style.textContent += '.vps-nav{display:flex;align-items:center;flex-wrap:wrap;padding:18px 24px;background:#0a1220;border:1px solid #273953;color:#b7ccea}.vps-nav .vp-coming-label{font:700 10px var(--mono);letter-spacing:1px}.vps-nav .vp-coming-index{font:10px var(--mono);color:#6695d2}.vps-btn:focus-visible,.vps-dots button:focus-visible{outline:2px solid #acd0ff;outline-offset:4px}.vp-identity>.vps-press{position:relative;left:auto;bottom:auto;transform:none;margin-top:32px;padding:16px 28px;font-size:20px;letter-spacing:3px;animation:none;box-shadow:0 0 24px #4c9af822}.vp-identity>.vps-press:hover,.vp-identity>.vps-press:focus-visible{transform:none}.vp-identity{padding-bottom:48px}.vps-scr{box-sizing:border-box}@media(max-width:600px){.vp-identity>.vps-press{font-size:15px;padding:14px 20px;margin-top:28px}.vp-identity{padding:54px 18px 56px}.vps-nav{gap:12px}.vps-nav .vp-coming-label{font-size:8px}.vps-btn{font-size:9px;padding:8px}.vps-dots{gap:5px}.vps-dots button{width:8px;height:8px}}@media(prefers-reduced-motion:reduce){.vps-start,.vps-press{animation:none}}';
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
