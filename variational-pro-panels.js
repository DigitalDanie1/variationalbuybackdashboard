/* Post-TGE placeholder. Mount before tge-groups.js arranges the navigation. */
(function () {
  'use strict';
  var TAB = 'variational-pro';
  var TITLE = 'Variational Pro';
  var MUSIC_VIDEO = 'SFHW_Tl5P24';

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
    '.vps-dots{display:flex;gap:7px}.vps-dots button{width:10px;height:10px;padding:0;border:1px solid #6695d2;background:transparent;cursor:pointer}.vps-dots button.on{background:#4c9af8;border-color:#4c9af8;box-shadow:0 0 10px #4c9af8}' +
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
      eyebrow: 'Post-TGE', title: TITLE, description: 'OTC derivatives for advanced traders: RFQ, competing quotes, on-chain settlement pools. Coming soon.', chip: 'coming soon'
    };

    var section = document.createElement('section');
    section.className = 'tsec tg-hide';
    section.setAttribute('data-tg', TAB);
    section.innerHTML = '<div class="vp-game-layout"><figure class="vp-game">' +
      '<div class="vp-game-toolbar"><span><i></i> THE NEXT CHAPTER OF VARIATIONAL</span>' +
      '<button class="vp-sound-toggle" type="button" aria-pressed="false" aria-label="Play music">▶ Play music</button></div>' +
      '<div class="vp-title-screen"><div class="vp-brand"><img class="vp-wordmark" src="assets/pro/variational-wordmark.png" width="1275" height="400" alt="Variational"><span>PRO</span></div>' +
      '<div class="vp-hero-copy"><p class="vp-kicker">A NEW HORIZON</p><h2>BIGGER MARKETS.<br><em>BIGGER AMBITION.</em></h2>' +
      '<p class="vp-intro">For traders looking beyond the next trade.<br>The next chapter of Variational is on the horizon.</p></div>' +
      '<div class="vp-horizon" aria-hidden="true"><span class="vp-giant-pro">PRO</span><img class="vp-landscape" src="assets/pro/pro-version-title.svg?v=compact" width="512" height="296" alt=""></div>' +
      '</div>' + screens() + navBar() +
      '<figcaption>Variational Pro · The next chapter.</figcaption></figure>' +
      '<aside class="vp-sound" aria-label="Title screen soundtrack">' +
      '<p class="vp-sound-status" role="status" aria-live="polite">Press play to start the title theme.</p>' +
      '<div class="vp-sound-player" hidden></div>' +
      '<a href="https://www.youtube.com/watch?v=' + MUSIC_VIDEO + '" target="_blank" rel="noopener noreferrer">Pokémon Gold &amp; Silver · Title Screen ↗</a></aside></div>';
    main.appendChild(section);
    wireScreens(section);

    var soundToggle = section.querySelector('.vp-sound-toggle');
    var soundPlayer = section.querySelector('.vp-sound-player');
    var soundStatus = section.querySelector('.vp-sound-status');
    function stopMusic() {
      soundPlayer.replaceChildren(); // Removing the player also stops audio immediately.
      soundPlayer.hidden = true;
      soundToggle.setAttribute('aria-pressed', 'false');
      soundToggle.textContent = '▶ Play music';
      soundToggle.setAttribute('aria-label', 'Play music');
      soundStatus.textContent = 'Press play to start the title theme.';
    }
    function isProActive() {
      return location.hash === '#' + TAB && !section.classList.contains('tg-hide');
    }
    soundToggle.addEventListener('click', function () {
      if (soundPlayer.firstChild) { stopMusic(); return; }
      if (!isProActive()) return;
      var frame = document.createElement('iframe');
      frame.title = 'Pokémon Gold & Silver — Title Screen soundtrack';
      frame.src = 'https://www.youtube-nocookie.com/embed/' + MUSIC_VIDEO + '?autoplay=1&playsinline=1&loop=1&playlist=' + MUSIC_VIDEO + '&origin=' + encodeURIComponent(location.origin);
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.width = '360';
      frame.height = '203';
      soundPlayer.hidden = false;
      soundPlayer.appendChild(frame);
      soundToggle.setAttribute('aria-pressed', 'true');
      soundToggle.textContent = '■ Stop music';
      soundToggle.setAttribute('aria-label', 'Stop music');
      soundStatus.textContent = 'Use Stop music above to turn the soundtrack off.';
    });
    // Observe navigation visibility only. Playback must not change this class list,
    // otherwise stopping audio while hidden would trigger this observer again.
    new MutationObserver(function () { if (!isProActive()) stopMusic(); }).observe(section, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('hashchange', function () { if (!isProActive()) stopMusic(); });
    window.addEventListener('pagehide', stopMusic);

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
.tsec[data-tg="variational-pro"]{padding-top:18px}
.vp-game-layout{display:grid;gap:14px;width:100%;margin:0}
.vp-game{position:relative;margin:0;border:1px solid #334768;background:#111a2c;overflow:hidden;color:#fff}
.vp-game-toolbar{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 28px;border-bottom:1px solid #344767;color:#b9c9e5;font:10px/1.5 var(--mono);letter-spacing:1.5px}
.vp-game-toolbar>span{display:flex;align-items:center;gap:10px}.vp-game-toolbar i{width:6px;height:6px;background:#4c9af8;box-shadow:0 0 16px #4c9af8;border-radius:50%;flex:none}
.vp-title-screen{position:relative;isolation:isolate;display:flex;flex-direction:column;min-height:660px;min-height:max(660px,calc(100svh - 245px));background:radial-gradient(ellipse at 90% 65%,#224677 0,transparent 58%),linear-gradient(135deg,#1b2032 30%,#101d34 100%);overflow:hidden}
.vp-title-screen:after{content:"";position:absolute;inset:0;z-index:-1;opacity:.12;background-image:linear-gradient(#8bacda 1px,transparent 1px),linear-gradient(90deg,#8bacda 1px,transparent 1px);background-size:64px 64px;mask-image:linear-gradient(transparent,#000)}
.vp-brand{display:flex;align-items:center;gap:8px;padding:12px 30px 0;position:relative;z-index:2}.vp-wordmark{display:block;width:min(52%,390px);height:auto;mix-blend-mode:screen}.vp-brand>span{font:700 13px/1 var(--mono);letter-spacing:3px;border:1px solid #588fda;padding:8px 10px;color:#a6cbff;margin-left:-12px}
.vp-hero-copy{position:relative;z-index:2;padding:5px 44px 0}.vp-kicker{color:#83b7ff!important;font:11px/1.5 var(--mono)!important;letter-spacing:4px;margin:0 0 22px!important}
body.v2-dashboard .vp-hero-copy h2{font:900 clamp(36px,5.4vw,86px)/.99 var(--sans,Arial,sans-serif)!important;letter-spacing:-.065em!important;color:#fff!important;margin:0!important;text-transform:uppercase;max-width:100%}
.vp-hero-copy h2 em{font-style:normal;color:#68a8ff;text-shadow:0 0 50px #4c9af822}
.vp-intro{font:14px/1.8 var(--sans,Arial,sans-serif)!important;color:#bdcde6!important;margin:26px 0 0!important;max-width:460px}
.vp-horizon{position:relative;min-height:150px;flex:1;margin-top:10px;overflow:hidden}
.vp-giant-pro{position:absolute;right:18px;bottom:-32px;font:900 clamp(150px,25vw,340px)/.8 var(--sans,Arial,sans-serif);letter-spacing:-.08em;color:transparent;-webkit-text-stroke:1px #6298e43d;user-select:none}
.vp-landscape{position:absolute;inset:auto 0 0;display:block;width:100%;height:110px;object-fit:fill;image-rendering:pixelated;opacity:.28;mix-blend-mode:screen;mask-image:linear-gradient(transparent,#000 40%)}
.vp-coming{position:relative;z-index:2;display:flex;align-items:center;flex-wrap:wrap;gap:12px 22px;padding:24px 44px;background:#0a1220d9;border-top:1px solid #527bae66}
.vp-coming-label{color:#fff;font:800 15px/1.3 var(--mono);letter-spacing:3px}.vp-coming-note{color:#8da7cb;font:9px/1.5 var(--mono);letter-spacing:1.5px}.vp-coming-index{margin-left:auto;color:#6695d2;font:9px/1.5 var(--mono);letter-spacing:1px}
.vp-game figcaption{display:none}
.vp-sound{padding:0 2px;min-width:0}.vp-sound .vp-sound-status{color:var(--muted)!important;font:11px/1.5 var(--mono);margin:0 0 8px}
.vp-sound-toggle{padding:10px 14px;min-height:42px;border:1px solid #5d83b5;border-radius:2px;background:#1c304d;color:#e2edff;font:700 11px var(--mono);cursor:pointer;white-space:nowrap;letter-spacing:0}
.vp-sound-toggle[aria-pressed="true"]{background:#4c9af8;color:#081326}.vp-sound-toggle:hover{border-color:#acd0ff}.vp-sound-toggle:focus-visible{outline:2px solid #acd0ff;outline-offset:3px}
.vp-sound a{color:var(--v2-accent,#4c9af8);font:10px var(--mono)}.vp-sound-player[hidden]{display:none!important}.vp-sound-player{margin:12px 0;max-width:360px}.vp-sound-player iframe{display:block;width:100%;height:203px;min-width:200px;min-height:200px;border:0;background:#000}
@media(min-width:1500px){body.v2-dashboard .vp-hero-copy h2{font-size:clamp(86px,5.6vw,128px)!important}.vp-title-screen{min-height:740px}}
@media(max-width:900px){.vp-hero-copy{padding:12px 26px 0}body.v2-dashboard .vp-hero-copy h2{font-size:clamp(34px,6.2vw,62px)!important}.vp-coming{padding:22px 26px}.vp-brand{padding-left:18px}.vp-title-screen{min-height:620px}}
@media(max-width:600px){.vp-game-toolbar{padding:12px 16px;font-size:8px;letter-spacing:.5px}.vp-game-toolbar>span{max-width:155px}.vp-sound-toggle{padding:9px;font-size:10px}.vp-brand{padding:16px 4px 12px}.vp-wordmark{width:70%}.vp-brand>span{font-size:10px;padding:6px;margin-left:-6px}.vp-hero-copy{padding:5px 20px 0}body.v2-dashboard .vp-hero-copy h2{font-size:clamp(30px,8.2vw,48px)!important;letter-spacing:-.06em!important}.vp-kicker{font-size:9px!important;letter-spacing:2px;margin-bottom:20px!important}.vp-intro{font-size:12px!important;margin-top:22px!important}.vp-title-screen{min-height:580px}.vp-coming{padding:20px;gap:12px}.vp-coming-label{font-size:13px}.vp-coming-note{font-size:8px}.vp-coming-index{display:none}.vp-giant-pro{font-size:200px;right:10px;bottom:-16px}}
`;
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
