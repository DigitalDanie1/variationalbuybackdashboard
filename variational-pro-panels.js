/* Post-TGE placeholder. Mount before tge-groups.js arranges the navigation. */
(function () {
  'use strict';
  var TAB = 'variational-pro';
  var TITLE = 'Variational Pro';
  var MUSIC_VIDEO = 'SFHW_Tl5P24';

  /* ---------- what Pro is, as pictures ----------
     Built from Variational's own "About Pro" docs, paraphrased. The core of it is one
     comparison — the same altcoin option trade booked the way desks do it today and the
     way Pro does it — so the steps are kept side by side and tagged by what each one costs:
     a chat thread, legal work, a manual money movement, or risk left with one side. */
  var DOCS = 'https://docs.variational.io/pro/about-pro';
  var TAGS = { chat: 'Chat', legal: 'Legal', money: 'Money', manual: 'Manual', risk: 'Risk', auto: 'Automatic' };
  var OLD = [
    ['Fund wants an altcoin option', ''],
    ['Deribit doesn’t list it, so they DM a desk on Telegram', 'chat'],
    ['ISDA + KYC first; other desks said no or never replied', 'legal'],
    ['One desk left: describe the structure in the chat', 'chat'],
    ['The desk prices it, often in a spreadsheet', 'manual'],
    ['Quote and terms come back', 'chat'],
    ['Haggle on price and terms', 'chat'],
    ['Email trade confirm, reviewed by legal and ops', 'legal'],
    ['Test transfer to the desk', 'money'],
    ['Send collateral straight to the desk', 'risk'],
    ['Trade cleared', ''],
    ['Margin checked “every so often”; calls by Telegram; the desk never posts back', 'risk']
  ];
  var PRO = [
    ['Fund wants an altcoin option', ''],
    ['Build an RFQ in the Pro UI or over the API', 'auto'],
    ['Every market maker sees it and quotes — or only the ones you pick', 'auto'],
    ['Compare quotes: price, margin terms, counterparty', ''],
    ['Accept one; both sides deposit into an on-chain settlement pool', 'auto'],
    ['Deposits verified → cleared. Margin, funding and liquidations run themselves', 'auto']
  ];

  function lane(steps, cls, title, sub, foot) {
    return '<div class="vpx-lane ' + cls + '"><header><b>' + title + '</b><span>' + sub + '</span>' +
      '<strong>' + steps.length + '<small>steps</small></strong></header><ol>' +
      steps.map(function (s, i) {
        return '<li' + (s[1] ? ' class="t-' + s[1] + '"' : '') + '><i>' + (i + 1) + '</i><p>' + s[0] + '</p>' +
          (s[1] ? '<em>' + TAGS[s[1]] + '</em>' : '') + '</li>';
      }).join('') + '</ol><footer>' + foot + '</footer></div>';
  }

  /* RFQ → quotes → one accepted → both sides into one pool → the protocol runs the trade */
  function flowSvg() {
    var mm = [['Market maker A', '$412'], ['Market maker B', '$405'], ['Market maker C', '$419']];
    var s = '<svg class="vpx-flow" viewBox="0 0 960 360" role="img" aria-label="A fund sends one RFQ, three market makers quote, the fund accepts market maker B, both deposit into an on-chain settlement pool, and the protocol tracks margin, settles funding and liquidates">' +
      '<defs><marker id="vpx-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="vpx-arh"/></marker></defs>';
    /* fund, level with the accepted quote */
    s += '<rect x="10" y="115" width="170" height="80" rx="8" class="vpx-node taker"/>' +
      '<text x="95" y="149" class="vpx-t">Hedge fund</text><text x="95" y="171" class="vpx-s">sends one RFQ</text>';
    mm.forEach(function (m, i) {
      var y = 20 + i * 100, on = i === 1;
      s += '<path d="M180 155 C 230 155, 230 ' + (y + 35) + ', 285 ' + (y + 35) + '" class="vpx-edge" marker-end="url(#vpx-ar)"/>' +
        '<rect x="290" y="' + y + '" width="190" height="70" rx="8" class="vpx-node mm' + (on ? ' on' : '') + '"/>' +
        '<text x="385" y="' + (y + 30) + '" class="vpx-t">' + m[0] + '</text>' +
        '<text x="385" y="' + (y + 52) + '" class="vpx-s">quotes ' + m[1] + (on ? ' · accepted' : '') + '</text>';
    });
    /* both sides into the pool: the fund's leg runs under every quote box */
    s += '<path d="M480 155 L 585 155" class="vpx-edge on" marker-end="url(#vpx-ar)"/>' +
      '<path d="M95 195 C 95 350, 675 350, 675 214" class="vpx-edge on" marker-end="url(#vpx-ar)"/>' +
      '<text x="385" y="346" class="vpx-s">both deposit collateral into the pool</text>' +
      '<rect x="590" y="100" width="170" height="110" rx="10" class="vpx-node pool"/>' +
      '<text x="675" y="140" class="vpx-t">Settlement pool</text><text x="675" y="162" class="vpx-s">on-chain escrow</text>' +
      '<text x="675" y="182" class="vpx-s">fund ↔ MM B only</text>';
    /* what the protocol then runs by itself */
    ['Tracks margin', 'Settles funding', 'Auto-liquidates'].forEach(function (t, i) {
      var y = 60 + i * 70;
      s += '<path d="M760 155 C 790 155, 790 ' + (y + 25) + ', 815 ' + (y + 25) + '" class="vpx-edge auto" marker-end="url(#vpx-ar)"/>' +
        '<rect x="820" y="' + y + '" width="135" height="50" rx="8" class="vpx-node auto"/>' +
        '<text x="887" y="' + (y + 30) + '" class="vpx-s strong">' + t + '</text>';
    });
    return s + '</svg>';
  }

  function explainer() {
    var problems = [
      ['Few players', 'Onboarding, KYC and manual quoting keep most market makers and funds out.', 'One RFQ reaches every market maker on Pro at once, so quotes compete.'],
      ['Human error', 'Margin checks, collateral moves and liquidations are done by hand.', 'The protocol tracks margin, funding and liquidations itself.'],
      ['Counterparty risk', 'Collateral sits with the desk, checked rarely and one-way — the assumption that failed with FTX.', 'Both sides post into an on-chain pool with set rules, isolated per counterparty pair.']
    ].map(function (p) {
      return '<article class="vpx-prob"><b>' + p[0] + '</b><p class="was"><span>Today</span>' + p[1] + '</p><p class="now"><span>On Pro</span>' + p[2] + '</p></article>';
    }).join('');

    /* two pairs, two pools: positions and collateral never mix between them */
    var pools = '<svg class="vpx-pools" viewBox="0 0 300 120" aria-hidden="true">' +
      [['Fund', 'MM A', 10], ['Fund', 'MM B', 66]].map(function (r) {
        return '<rect x="6" y="' + r[2] + '" width="70" height="40" rx="6" class="vpx-node taker"/><text x="41" y="' + (r[2] + 25) + '" class="vpx-s">' + r[0] + '</text>' +
          '<rect x="112" y="' + r[2] + '" width="76" height="40" rx="6" class="vpx-node pool"/><text x="150" y="' + (r[2] + 25) + '" class="vpx-s">pool</text>' +
          '<rect x="224" y="' + r[2] + '" width="70" height="40" rx="6" class="vpx-node mm"/><text x="259" y="' + (r[2] + 25) + '" class="vpx-s">' + r[1] + '</text>' +
          '<line x1="76" y1="' + (r[2] + 20) + '" x2="112" y2="' + (r[2] + 20) + '" class="vpx-edge on"/><line x1="188" y1="' + (r[2] + 20) + '" x2="224" y2="' + (r[2] + 20) + '" class="vpx-edge on"/>';
      }).join('') + '</svg>';

    var features = [
      ['RFQ-based', 'Ask for a market or structure; liquidity providers answer with quotes and you take the best. You can also answer other people’s RFQs.', ''],
      ['Bilateral', 'Every trade is peer-to-peer and booked in a settlement pool between exactly two parties. Nothing is shared between pools, so one counterparty’s problem stays in its pool.', pools],
      ['Fully customizable', 'Terms are agreed inside the quote: whitelist who may quote you, set margin per pool, choose auto-liquidation and a liquidation penalty.', '']
    ].map(function (f) {
      return '<article class="vpx-feat"><b>' + f[0] + '</b><p>' + f[1] + '</p>' + f[2] + '</article>';
    }).join('');

    return '<div class="vpx">' +
      '<div class="cmp-heading"><span class="cmp-eyebrow">WHAT IS VARIATIONAL PRO</span>' +
      '<h2>An OTC derivatives desk, rebuilt on-chain</h2>' +
      '<p>Pro is the institutional side of Variational: request quotes on options, non-linear structures and block trades on almost any token, take the best one, and let the protocol handle clearing and settlement on-chain.</p></div>' +
      '<div class="vpx-facts">' +
        '<div><span>For</span><b>Advanced &amp; institutional traders</b></div>' +
        '<div><span>Trades</span><b>OTC derivatives on any token: options, custom structures, blocks</b></div>' +
        '<div><span>How</span><b>RFQ → competing quotes → on-chain settlement pool</b></div>' +
      '</div>' +

      '<div class="bw-head"><b>The Same Trade, Two Ways</b><span><i>a fund booking an altcoin option today, and on Pro</i></span></div>' +
      '<div class="vpx-lanes">' +
        lane(OLD, 'old', 'Today', 'Telegram, lawyers, wires', 'One desk’s quote · ops and legal teams · collateral left with the desk') +
        lane(PRO, 'pro', 'On Variational Pro', 'one screen or one API client', 'Competing quotes · one person or a bot · collateral on-chain, both sides') +
      '</div>' +
      '<div class="vpx-key"><span class="t-chat">Chat</span><span class="t-legal">Legal</span><span class="t-manual">Manual</span><span class="t-money">Money</span><span class="t-risk">Risk</span><span class="t-auto">Automatic</span></div>' +

      '<div class="bw-head"><b>How A Pro Trade Moves</b><span><i>from one RFQ to a trade the protocol runs by itself</i></span></div>' +
      '<div class="vpx-flowwrap">' + flowSvg() + '</div>' +

      '<div class="bw-head"><b>What It Removes</b><span><i>the three costs of booking OTC by hand</i></span></div>' +
      '<div class="vpx-probs">' + problems + '</div>' +

      '<div class="bw-head"><b>How It Works</b><span><i>the three properties every Pro trade has</i></span></div>' +
      '<div class="vpx-feats">' + features + '</div>' +

      '<div class="tp-note"><b>Why it exists.</b> A large share of crypto derivatives volume trades OTC, and most of it is still booked by hand over chat. Venues like Deribit and tools like Paradigm cover basic options on the majors; anything more custom, or on an altcoin, falls back to the manual route. Source: <a href="' + DOCS + '" target="_blank" rel="noopener noreferrer">Variational docs · About Pro ↗</a>. Pro is not live yet.</div>' +
      '</div>';
  }

  var VPX_CSS =
    '.vpx{max-width:1180px;margin:40px auto 34px}.vpx .tp-note a{color:var(--v2-accent,#4c9af8)}' +
    '.vpx-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 30px}' +
    '.vpx-facts>div{padding:14px 16px;border:1px solid var(--line);background:var(--panel)}' +
    '.vpx-facts span{display:block;color:var(--muted);font:800 9px var(--mono);letter-spacing:1px;text-transform:uppercase}.vpx-facts b{display:block;margin-top:7px;color:var(--text);font:700 14px/1.45 var(--sans)}' +
    '.vpx-lanes{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px;margin:0 0 10px;align-items:start}' +
    '.vpx-lane{border:1px solid var(--line);background:var(--panel)}.vpx-lane.pro{border-color:var(--v2-accent,#4c9af8)}' +
    '.vpx-lane header{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:16px 18px;border-bottom:1px solid var(--line)}' +
    '.vpx-lane header b{color:var(--text);font:800 17px var(--sans)}.vpx-lane header span{grid-row:2;color:var(--muted);font:11px var(--mono)}' +
    '.vpx-lane header strong{grid-row:1/3;grid-column:2;align-self:center;color:#e2546f;font:800 34px/1 var(--mono);text-align:right}.vpx-lane.pro header strong{color:var(--v2-accent,#4c9af8)}' +
    '.vpx-lane header strong small{display:block;margin-top:4px;color:var(--muted);font:700 9px var(--mono);letter-spacing:1px;text-transform:uppercase}' +
    '.vpx-lane ol{list-style:none;margin:0;padding:8px 0}.vpx-lane li{display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:10px;align-items:center;padding:7px 18px}' +
    '.vpx-lane li i{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);color:var(--muted);font:800 10px var(--mono);font-style:normal}' +
    '.vpx-lane li p{margin:0;color:var(--text);font-size:12.5px;line-height:1.45}' +
    '.vpx-lane li em,.vpx-key span{padding:2px 7px;border-radius:3px;font:800 8.5px var(--mono);font-style:normal;letter-spacing:.6px;text-transform:uppercase;white-space:nowrap;border:1px solid currentColor}' +
    '.t-chat em,.vpx-key .t-chat{color:#5aa9e6}.t-legal em,.vpx-key .t-legal{color:#b08cf0}.t-manual em,.vpx-key .t-manual{color:#d99a2b}.t-money em,.vpx-key .t-money{color:#8a9bb0}.t-risk em,.vpx-key .t-risk{color:#e2546f}.t-auto em,.vpx-key .t-auto{color:#2fb37e}' +
    '.vpx-lane li.t-risk i{border-color:#e2546f;color:#e2546f}.vpx-lane.pro li i{border-color:var(--v2-accent,#4c9af8);color:var(--v2-accent,#4c9af8)}' +
    '.vpx-lane footer{padding:12px 18px;border-top:1px solid var(--line);color:var(--muted);font:11px/1.5 var(--mono)}.vpx-lane.pro footer{color:var(--text)}' +
    '.vpx-key{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 30px}' +
    '.vpx-flowwrap{padding:18px;border:1px solid var(--line);background:var(--panel);margin:0 0 30px;overflow-x:auto}.vpx-flow{display:block;width:100%;min-width:640px;height:auto}' +
    '.vpx-node{fill:var(--panel2,var(--panel));stroke:var(--line);stroke-width:1.5}.vpx-node.taker{stroke:#8a9bb0}.vpx-node.mm.on{stroke:var(--v2-accent,#4c9af8);stroke-width:2.5}' +
    '.vpx-node.pool{stroke:#2fb37e;stroke-width:2.5;fill:color-mix(in srgb,#2fb37e 10%,var(--panel))}.vpx-node.auto{stroke:#2fb37e;stroke-dasharray:4 3}' +
    '.vpx-t{fill:var(--text);font:800 15px var(--sans);text-anchor:middle}.vpx-s{fill:var(--muted);font:600 11.5px var(--mono);text-anchor:middle}.vpx-s.strong{fill:var(--text);font-weight:800}' +
    '.vpx-edge{fill:none;stroke:var(--muted);stroke-width:1.5;opacity:.6}.vpx-edge.on{stroke:var(--v2-accent,#4c9af8);opacity:1;stroke-width:2}.vpx-edge.auto{stroke:#2fb37e;opacity:.9}.vpx-arh{fill:var(--muted)}' +
    '.vpx-probs,.vpx-feats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 30px}' +
    '.vpx-prob,.vpx-feat{padding:16px 18px;border:1px solid var(--line);background:var(--panel);min-width:0}' +
    '.vpx-prob>b,.vpx-feat>b{display:block;margin:0 0 10px;color:var(--text);font:800 15px var(--sans)}' +
    '.vpx-prob p{margin:0;font-size:12.5px;line-height:1.55}.vpx-prob p span{display:block;margin-bottom:3px;font:800 9px var(--mono);letter-spacing:1px;text-transform:uppercase}' +
    '.vpx-prob p.was{color:var(--muted);padding-bottom:10px;border-bottom:1px dashed var(--line);margin-bottom:10px}.vpx-prob p.was span{color:#e2546f}.vpx-prob p.now{color:var(--text)}.vpx-prob p.now span{color:#2fb37e}' +
    '.vpx-feat p{margin:0;color:var(--muted);font-size:12.5px;line-height:1.6}.vpx-pools{display:block;width:100%;max-width:300px;margin-top:14px}' +
    '@media(max-width:900px){.vpx-lanes,.vpx-probs,.vpx-feats,.vpx-facts{grid-template-columns:minmax(0,1fr)}}' +
    '@media(max-width:520px){.vpx-lane li{grid-template-columns:24px minmax(0,1fr);padding:7px 14px}.vpx-lane li em{grid-column:2;justify-self:start}.vpx-flowwrap{padding:10px}}';
  function injectVpxStyle() {
    if (document.getElementById('vpx-style')) return;
    var st = document.createElement('style');
    st.id = 'vpx-style';
    st.textContent = VPX_CSS;
    document.head.appendChild(st);
  }

  function boot() {
    injectVpxStyle();
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
      '<div class="vp-coming"><span class="vp-coming-label">COMING SOON</span><span class="vp-coming-note">SOMETHING BIGGER IS TAKING SHAPE.</span><span class="vp-coming-index">01 / A NEW ERA</span></div></div>' +
      '<figcaption>Variational Pro · The next chapter.</figcaption></figure>' +
      '<aside class="vp-sound" aria-label="Title screen soundtrack">' +
      '<p class="vp-sound-status" role="status" aria-live="polite">Press play to start the title theme.</p>' +
      '<div class="vp-sound-player" hidden></div>' +
      '<a href="https://www.youtube.com/watch?v=' + MUSIC_VIDEO + '" target="_blank" rel="noopener noreferrer">Pokémon Gold &amp; Silver · Title Screen ↗</a></aside></div>' + explainer();
    main.appendChild(section);

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
