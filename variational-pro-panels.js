/* Post-TGE placeholder. Mount before tge-groups.js arranges the navigation. */
(function () {
  'use strict';
  var TAB = 'variational-pro';
  var TITLE = 'Variational Pro';

  function boot() {
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
    section.innerHTML = '<div class="vp-reveal">' +
      '<div class="vp-topline"><span>VARIATIONAL</span><span>THE NEXT CHAPTER</span></div>' +
      '<div class="vp-atmosphere" aria-hidden="true"><div class="vp-orbit"></div><div class="vp-horizon"></div></div>' +
      '<div class="vp-identity"><div class="vp-brand"><span class="vp-mark"><svg viewBox="320 450 1360 960" aria-hidden="true"><defs><filter id="vp-mark-color" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .298 0 0 0 0 .608 0 0 0 0 .973 0 0 2 0 -.3"/></filter></defs><image href="variational-logo.png" width="2000" height="2000" filter="url(#vp-mark-color)"/></svg></span><span>Variational</span></div>' +
      '<h2 class="vp-pro">PRO</h2><div class="vp-caption"><span></span><p>A bigger arena awaits.</p><span></span></div></div>' +
      '<div class="vp-bottom"><span class="vp-status"><i></i> COMING SOON</span><p>Something bigger is on the horizon.</p><span class="vp-edition">A NEW ERA / PRO</span></div></div>';
    main.appendChild(section);

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
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
