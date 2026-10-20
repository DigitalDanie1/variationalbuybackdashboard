/* Post-TGE placeholder. Mount before tge-groups.js arranges the navigation. */
(function () {
  'use strict';
  var TAB = 'variational-pro';
  var TITLE = 'Variational Pro';
  var MUSIC_VIDEO = 'SFHW_Tl5P24';

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
      '<a href="https://www.youtube.com/watch?v=' + MUSIC_VIDEO + '" target="_blank" rel="noopener noreferrer">Pokémon Gold &amp; Silver · Title Screen ↗</a></aside></div>';
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
