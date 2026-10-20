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
    section.innerHTML = '<div class="cmp-heading"><span class="cmp-eyebrow">POST-TGE</span>' +
      '<h2>Variational Pro</h2></div>' +
      '<div class="vp-mystery" aria-labelledby="vp-mystery-title">' +
        '<div class="vp-mystery-top"><span>UNKNOWN SIGNAL</span><span>NO. ???</span></div>' +
        '<div class="vp-mystery-art" aria-hidden="true"><div class="vp-mystery-orbit"></div>' +
          '<span class="vp-spark vp-spark-one">✦</span><span class="vp-spark vp-spark-two">✧</span><span class="vp-spark vp-spark-three">✦</span>' +
          '<svg class="vp-creature" viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg">' +
            '<ellipse cx="204" cy="326" rx="96" ry="12" fill="#040913" opacity=".45"/>' +
            '<g fill="#080e20" stroke="#a6b8ff" stroke-opacity=".45" stroke-width="2.5" stroke-linejoin="round">' +
              '<path d="M252 237C331 252 350 210 317 183C366 190 388 246 348 276C320 298 274 283 246 270Z"/>' +
              '<path d="M150 179L106 158L120 204L90 226L140 237L157 213ZM248 178L292 158L278 204L308 226L258 237L241 213Z"/>' +
              '<path d="M161 240L145 302L124 316L130 325L179 324L198 268L222 318L270 324L277 314L254 299L240 241Z"/>' +
              '<path d="M155 147C140 117 132 78 145 39L181 89L203 79L227 88L263 39C276 80 264 117 250 147C272 180 270 228 245 251C222 274 178 274 154 251C128 225 131 180 155 147Z"/>' +
              '<path d="M171 92L182 60L202 80L223 60L234 93"/>' +
            '</g>' +
          '</svg><span class="vp-mystery-mark">?</span></div>' +
        '<div class="vp-mystery-copy"><p class="vp-mystery-kicker">A NEW CHALLENGER IS APPROACHING</p>' +
          '<h3 id="vp-mystery-title">Who’s that<span>Pro?</span></h3>' +
          '<p class="vp-mystery-status"><span></span>Coming soon</p>' +
        '</div><div class="vp-mystery-bottom"><span>VARIATIONAL PRO</span><span>IDENTITY: CLASSIFIED</span></div>' +
      '</div>';
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
    style.textContent = '.vp-mystery{position:relative;isolation:isolate;overflow:hidden;margin:24px 0 0;border:1px solid #344466;border-radius:12px;background:radial-gradient(ellipse at 34% 48%,#28396b 0%,#171d3b 36%,#0a1021 75%);color:#edf1ff;min-height:430px;display:grid;grid-template-columns:1.15fr 1fr;align-items:center;padding:58px 42px}' +
      '.vp-mystery::before{content:"";position:absolute;z-index:-1;inset:0;background:repeating-conic-gradient(from 5deg at 32% 50%,transparent 0deg 17deg,#869eff0c 17deg 28deg);mask-image:radial-gradient(ellipse at 32% 50%,#000,transparent 75%)}' +
      '.vp-mystery-top,.vp-mystery-bottom{position:absolute;left:26px;right:26px;display:flex;justify-content:space-between;gap:12px;font:700 9px var(--mono);letter-spacing:1.8px;color:#a0add0}' +
      '.vp-mystery-top{top:22px}.vp-mystery-bottom{bottom:22px;border-top:1px solid #a1b7f326;padding-top:14px;font-size:8px}' +
      '.vp-mystery-art{position:relative;width:100%;max-width:390px;aspect-ratio:1;margin:auto;display:grid;place-items:center}' +
      '.vp-mystery-orbit{position:absolute;width:84%;height:84%;border:1px solid #9caeff45;border-radius:50%;background:radial-gradient(circle,#9d9fff26,transparent 67%);box-shadow:0 0 0 14px #a1b7ff05,0 0 0 15px #a1b7ff16}' +
      '.vp-creature{position:relative;width:100%;height:auto;filter:drop-shadow(0 0 24px #afb9ff22)}' +
      '.vp-mystery-mark{position:absolute;left:50%;top:49%;transform:translate(-50%,-50%) rotate(-9deg);font:900 clamp(80px,9vw,132px)/1 var(--sans);color:#eef0ff;text-shadow:4px 5px 0 #586bb3,0 0 34px #9eaaff66}' +
      '.vp-spark{position:absolute;color:#b7c6ff}.vp-spark-one{left:8%;top:24%;font-size:25px}.vp-spark-two{right:6%;top:20%;font-size:35px}.vp-spark-three{right:10%;bottom:18%;font-size:17px}' +
      '.vp-mystery-copy{position:relative;padding:12px 0 20px 20px}.vp-mystery-kicker{font:700 9px/1.7 var(--mono);letter-spacing:1.7px;color:#a6b9ee!important;margin:0 0 18px}' +
      '#vp-mystery-title{margin:0!important;font:900 clamp(36px,4.4vw,62px)/1.03 var(--sans)!important;letter-spacing:-2px!important;color:#f2f4ff!important}#vp-mystery-title>span{display:block;color:#b1b5ff;font-size:1.4em}' +
      '.vp-mystery-status{display:inline-flex;align-items:center;gap:9px;margin:26px 0 0;padding:10px 15px;border:1px solid #8eabf05c;border-radius:5px;background:#a6b9ee0a;color:#e2e9ff!important;font:700 12px var(--mono)}.vp-mystery-status>span{width:6px;height:6px;border-radius:50%;background:#b8c6ff;box-shadow:0 0 9px #b8c6ff88}' +
      '@media(max-width:700px){.vp-mystery{grid-template-columns:1fr;padding:48px 20px 68px}.vp-mystery-art{max-width:290px}.vp-mystery-copy{text-align:center;padding:6px 0 10px}#vp-mystery-title{font-size:42px!important}#vp-mystery-title>span{display:inline;margin-left:10px;font-size:1em}.vp-mystery-kicker{font-size:8px}.vp-mystery-top,.vp-mystery-bottom{left:18px;right:18px;font-size:8px;letter-spacing:1px}.vp-mystery-mark{font-size:106px}}';
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
