/* Post-TGE placeholder. Mount before tge-groups.js arranges the navigation. */
(function () {
  'use strict';
  var TAB = 'variational-pro';
  var TITLE = 'Variational Pro';

  // Product descriptions follow the official About Pro documentation.
  var DOCS = 'https://docs.variational.io/pro/about-pro';
  var SCREENS = ['Title', 'The market', 'The shift', 'Trade flow', 'Settlement'];

  function slide(n, eyebrow, title, lead, content, foot) {
    return '<article class="vps-scr" data-scr="' + n + '" hidden aria-labelledby="vps-title-' + n + '">' +
      '<header class="vps-heading"><span>VARIATIONAL PRO <i>/</i> ' + eyebrow + '</span>' +
      '<h3 id="vps-title-' + n + '">' + title + '</h3><p>' + lead + '</p></header>' +
      '<div class="vps-body">' + content + '</div><footer class="vps-foot"><span>' + foot + '</span><b>0' + n + ' / 04</b></footer></article>';
  }
  function screens() {
    return slide(1, 'THE MARKET', 'Built for a different<br><em>scale of trading.</em>',
      'OTC derivatives for advanced and institutional traders.',
      '<div class="vps-market"><span class="vps-market-word">OTC</span><div><span class="vps-mini">THE ARENA</span><h4>Beyond standard<br>exchange products.</h4><p>Configurable derivatives.<br>Negotiated terms. Block trades.</p></div></div>' +
      '<div class="vps-audience"><span>Advanced traders</span><span>Institutional desks</span><span>Market makers</span></div>',
      'A market built around the trade you need.') +
    slide(2, 'THE SHIFT', 'Less coordination.<br><em>More execution.</em>',
      'The same example trade, with a different operating model.',
      '<div class="vps-compare"><div class="vps-comparison"><span class="vps-mini">MANUAL OTC EXAMPLE</span><div class="vps-count">12<small>steps</small></div><h4>A chain of handoffs.</h4><p>Chats, quoting, legal review,<br>transfers and manual margin checks.</p></div>' +
      '<div class="vps-comparison is-pro"><span class="vps-mini">WITH PRO</span><div class="vps-count">6<small>steps</small></div><h4>One connected workflow.</h4><p>Request a trade, compare quotes,<br>deposit collateral and clear on-chain.</p></div></div>',
      'Illustrative workflow in Variational’s documentation; step counts are not a speed benchmark.') +
    slide(3, 'TRADE FLOW', 'Request. Compare.<br><em>Settle.</em>',
      'One request for quote connects the trade to competing liquidity.',
      '<ol class="vps-flow-steps"><li><span>01</span><h4>Define the trade</h4><p>Specify the asset,<br>structure and terms.</p></li><li><span>02</span><h4>Receive quotes</h4><p>Market makers respond<br>through the UI or API.</p></li><li><span>03</span><h4>Choose an offer</h4><p>Compare price, margin<br>and counterparty.</p></li><li><span>04</span><h4>Fund &amp; clear</h4><p>Both sides deposit<br>into a settlement pool.</p></li></ol>' +
      '<div class="vps-protocol"><span>AFTER CLEARING</span><p>Protocol-managed margin, funding and liquidations.</p></div>',
      'Request quotes from the market or a chosen set of counterparties.') +
    slide(4, 'SETTLEMENT', 'Terms agreed.<br><em>On-chain collateral.</em>',
      'Bilateral trades, with settlement pools for each counterparty pair.',
      '<div class="vps-pool-map"><div class="vps-pool-line"><span>Your desk</span><div><b>Pool A</b><small>Positions + collateral</small></div><span>Maker A</span></div><div class="vps-pool-line"><span>Your desk</span><div><b>Pool B</b><small>Positions + collateral</small></div><span>Maker B</span></div></div>' +
      '<div class="vps-principles"><div><b>Separate pools</b><p>Assets are not commingled<br>between pools.</p></div><div><b>Custom terms</b><p>Agree on margin and<br>liquidation parameters.</p></div><div><b>Ongoing management</b><p>The protocol monitors<br>and manages the trade.</p></div></div>',
      'Product design per official documentation. Pro is not live yet.');
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
      next.textContent = cur ? (cur === scrs.length - 1 ? 'TITLE ↺' : 'NEXT →') : 'PRESS START ▶';
      section.querySelectorAll('[data-vps-go]').forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'step' : 'false'); });
      section.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    section.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-vps],[data-vps-go]');
      if (!b) return;
      if (b.hasAttribute('data-vps-go')) go(+b.getAttribute('data-vps-go'));
      else go(cur + (b.getAttribute('data-vps') === 'next' ? 1 : -1));
    });
    document.addEventListener('keydown', function (e) {
      if (section.classList.contains('tg-hide') || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
  }

  var VPS_CSS = `
.vp-title-screen[hidden],.vps-scr[hidden]{display:none!important}
.tsec[data-tg="variational-pro"]{scroll-margin-top:105px}
.vps-scr{box-sizing:border-box;display:flex;flex-direction:column;gap:38px;min-height:680px;padding:42px;background:radial-gradient(ellipse at 100% 100%,#17345c55,transparent 65%),#080e1b;color:#fff;border:1px solid #273953}
.vps-heading{display:block!important;text-align:left!important;padding:0!important;border:0!important;background:none!important}.vps-heading>span{font:9px/1.5 var(--mono);letter-spacing:2px;color:#a3badb}.vps-heading i{font-style:normal;margin:0 12px;color:#4c9af8}
body.v2-dashboard .vps-heading h3{font:700 clamp(32px,4.2vw,62px)/1.06 var(--sans,Arial,sans-serif)!important;letter-spacing:-.045em!important;color:#f4f7ff!important;margin:24px 0 18px!important}.vps-heading h3 em{font-style:normal;color:#7db4ff}
.vps-heading>p{font:14px/1.65 var(--sans,Arial,sans-serif)!important;color:#9dafc9!important;margin:0!important;max-width:640px}
.vps-body{display:flex;flex-direction:column;justify-content:center;gap:24px;flex:1;min-width:0}
.vps-mini{font:9px/1.5 var(--mono);letter-spacing:2px;color:#8ba9cf}
body.v2-dashboard .vps-body h4{font:600 22px/1.3 var(--sans,Arial,sans-serif)!important;color:#e3edfc!important;margin:12px 0!important;letter-spacing:-.025em}
.vps-body p{font:13px/1.7 var(--sans,Arial,sans-serif)!important;color:#9dafc9!important;margin:0!important}
.vps-market{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:36px;padding-bottom:22px}.vps-market-word{font:800 clamp(80px,12vw,170px)/1 var(--sans,Arial,sans-serif);letter-spacing:-.07em;color:#79b0ff}.vps-market>div{border-left:1px solid #2e4666;padding-left:34px}
.vps-audience{display:flex;flex-wrap:wrap;gap:12px}.vps-audience span{padding:12px 18px;border:1px solid #2a4261;border-radius:2px;font:11px/1.5 var(--mono);color:#bfd3ed}
.vps-compare{display:grid;grid-template-columns:1fr 1fr;gap:20px}.vps-comparison{padding:26px;border:1px solid #273a53;background:#0c1422}.vps-comparison.is-pro{border-color:#477dbd;background:#142b48}.vps-count{display:flex;align-items:baseline;gap:14px;margin:22px 0;font:600 84px/1 var(--sans,Arial,sans-serif);letter-spacing:-.06em;color:#61738d}.is-pro .vps-count{color:#8abdff}.vps-count small{font:11px var(--mono);letter-spacing:0;color:#8ca4c5}
.vps-flow-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));list-style:none;padding:0;margin:0;border:1px solid #2a4261}.vps-flow-steps li{padding:24px 18px;position:relative}.vps-flow-steps li+li{border-left:1px solid #2a4261}.vps-flow-steps li>span{font:12px/1 var(--mono);color:#69a7fc}.vps-flow-steps li:last-child{background:#142b48}body.v2-dashboard .vps-flow-steps h4{font-size:17px!important;margin:24px 0 10px!important}.vps-flow-steps p{font-size:12px!important}.vps-protocol{display:flex;align-items:center;gap:22px;padding:20px 0;border-bottom:1px solid #273a53}.vps-protocol>span{font:9px/1.5 var(--mono);letter-spacing:1px;color:#79b0ff;white-space:nowrap}
.vps-pool-map{display:grid;gap:16px}.vps-pool-line{display:grid;grid-template-columns:1fr 1.5fr 1fr;align-items:center;gap:34px}.vps-pool-line>span{text-align:center;padding:18px 8px;border:1px solid #273a53;font:12px var(--sans,Arial,sans-serif);color:#bdcde4}.vps-pool-line>div{position:relative;text-align:center;padding:18px 10px;border:1px solid #568fdb;background:#142b48}.vps-pool-line>div:before,.vps-pool-line>div:after{content:"";position:absolute;top:50%;width:35px;height:1px;background:#568fdb}.vps-pool-line>div:before{right:100%}.vps-pool-line>div:after{left:100%}.vps-pool-line b{font:600 14px var(--sans,Arial,sans-serif);color:#deebff}.vps-pool-line small{display:block;margin-top:6px;font:10px var(--mono);color:#8ba9cf}
.vps-principles{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding-top:12px}.vps-principles b{display:block;font:600 13px var(--sans,Arial,sans-serif);color:#deebff;margin-bottom:8px}.vps-principles p{font-size:12px!important}
.vps-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;padding-top:20px;border-top:1px solid #263850;color:#667d9d;font:10px/1.6 var(--mono)}.vps-foot b{font-weight:400;color:#90aacd;white-space:nowrap}
.vps-nav{gap:12px 16px}.vps-btn{padding:10px 14px;border:1px solid #3e5d84;border-radius:2px;background:#13243a;color:#dceaff;font:600 10px var(--mono);cursor:pointer;letter-spacing:1px}.vps-btn:hover{border-color:#acd0ff}.vps-start{background:#355f94;border-color:#497ebd;color:#fff}
.vps-press{display:inline-flex;align-items:center;gap:16px;padding:20px 36px;border:1px solid #68a8ff;border-radius:2px;background:#0e1d32;color:#fff;font:700 22px/1 var(--mono);letter-spacing:.16em;cursor:pointer}.vps-press span{color:#68a8ff}.vps-press:hover{background:#254e80}
.vps-dots{display:flex;gap:8px}.vps-dots button{flex:none;width:9px;height:9px;min-width:0;min-height:0!important;padding:0;border:1px solid #6695d2;background:transparent;cursor:pointer}.vps-dots button.on{background:#78b2ff;border-color:#78b2ff}
.vps-src{color:#6695d2!important;font:9px var(--mono);letter-spacing:1px;text-decoration:none}.vps-nav .vp-coming-index{margin-left:auto}
@media(max-width:1000px){.vps-scr{padding:30px;gap:28px}.vps-flow-steps{grid-template-columns:1fr 1fr}.vps-flow-steps li:nth-child(3){border-left:0}.vps-flow-steps li:nth-child(n+3){border-top:1px solid #2a4261}.vps-market{gap:24px}.vps-market>div{padding-left:24px}}
@media(max-width:600px){.vps-scr{padding:25px 20px;min-height:630px;gap:28px}.vps-heading>span{font-size:7px;letter-spacing:1px}.vps-heading i{margin:0 5px}body.v2-dashboard .vps-heading h3{font-size:32px!important;margin-top:22px!important}.vps-heading>p{font-size:12px!important}.vps-market{grid-template-columns:1fr;gap:18px}.vps-market-word{font-size:110px}.vps-market>div{padding:18px 0 0;border-left:0;border-top:1px solid #2e4666}.vps-audience{gap:8px}.vps-audience span{font-size:9px;padding:9px 12px}.vps-compare{grid-template-columns:1fr;gap:12px}.vps-comparison{padding:20px}.vps-count{font-size:66px;margin:18px 0}.vps-flow-steps{grid-template-columns:1fr}.vps-flow-steps li+li{border-left:0;border-top:1px solid #2a4261}.vps-flow-steps li{padding:20px}body.v2-dashboard .vps-flow-steps h4{margin-top:14px!important}.vps-protocol{align-items:flex-start;flex-direction:column;gap:10px}.vps-pool-line{gap:12px;grid-template-columns:1fr 1.4fr 1fr}.vps-pool-line>span{font-size:10px;padding:18px 4px}.vps-pool-line>div{padding:16px 4px}.vps-pool-line>div:before,.vps-pool-line>div:after{width:13px}.vps-pool-line b{font-size:11px}.vps-pool-line small{display:none}.vps-principles{grid-template-columns:1fr;gap:20px}.vps-foot{font-size:8px;gap:14px}.vps-nav{padding:16px!important}.vps-src{display:none}.vps-nav .vp-coming-label{font-size:8px}.vps-press{font-size:16px;padding:16px 20px}}
`;
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
