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
    section.innerHTML = '<div class="cmp-heading"><span class="cmp-eyebrow">POST-TGE</span>' +
      '<h2>Variational Pro</h2></div>' +
      '<div class="vp-game-layout"><figure class="vp-game"><div class="vp-game-toolbar"><span>PRO VERSION · COMING SOON</span>' +
      '<button class="vp-sound-toggle" type="button" aria-pressed="false" aria-label="Play music">▶ MUSIC OFF</button></div>' +
      '<div class="vp-title-screen"><img class="vp-wordmark" src="assets/pro/variational-wordmark.png" width="1275" height="400" alt="Variational">' +
      '<div class="vp-version"><span>PRO</span><small>THE NEXT CHAPTER</small></div>' +
      '<img class="vp-landscape" src="assets/pro/pro-version-title.svg?v=brand" width="512" height="296" alt="A mysterious flying silhouette above a retro pixel landscape. Coming soon."></div>' +
      '<figcaption>The next chapter. Coming soon.</figcaption></figure>' +
      '<aside class="vp-sound" aria-label="Title screen soundtrack"><span class="cmp-eyebrow">GAME BOY CLASSICS</span>' +
      '<h3 class="vp-sound-title">Pokémon Gold &amp; Silver</h3><p>Title Screen</p>' +
      '<p class="vp-sound-status" role="status" aria-live="polite">Press play to start the title theme.</p>' +
      '<div class="vp-sound-player" hidden></div>' +
      '<a href="https://www.youtube.com/watch?v=' + MUSIC_VIDEO + '" target="_blank" rel="noopener noreferrer">Soundtrack on YouTube ↗</a></aside></div>';
    main.appendChild(section);

    var soundToggle = section.querySelector('.vp-sound-toggle');
    var soundPlayer = section.querySelector('.vp-sound-player');
    var soundStatus = section.querySelector('.vp-sound-status');
    function stopMusic() {
      soundPlayer.replaceChildren(); // Removing the player also stops audio immediately.
      soundPlayer.hidden = true;
      soundToggle.setAttribute('aria-pressed', 'false');
      soundToggle.textContent = '▶ MUSIC OFF';
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
      soundToggle.textContent = '■ MUSIC ON';
      soundToggle.setAttribute('aria-label', 'Stop music');
      soundStatus.textContent = 'Music on. Press MUSIC ON to turn it off. Volume controls are below.';
    });
    // showTab uses replaceState, so section visibility must also be observed.
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
    style.textContent = '.vp-game-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,340px);gap:20px;align-items:start;margin-top:24px}.vp-game{margin:0;padding:24px;border:1px solid var(--line);background:var(--panel);display:grid;justify-items:center;gap:16px}' +
      '.vp-game-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;color:var(--muted);font:10px/1.6 var(--mono);letter-spacing:1px}.vp-title-screen{width:100%;max-width:560px;background:#1b2133;border:4px solid #111827;box-shadow:0 0 0 1px #44516b;box-sizing:border-box;overflow:hidden}.vp-title-screen .vp-wordmark{display:block;width:100%;height:auto;margin:16px 0 0}.vp-version{display:grid;justify-items:center;gap:12px;padding:0 20px 24px;color:#fff}.vp-version>span{font:900 32px/1 var(--mono);letter-spacing:14px;padding:8px 8px 8px 22px;color:#4c9af8;border-block:2px solid #4c9af8;text-shadow:3px 3px #080d1e}.vp-version small{font:10px/1.4 var(--mono);letter-spacing:3px;color:#a7b9d9}.vp-landscape{display:block;width:100%;height:auto;image-rendering:pixelated}' +
      '.vp-game figcaption{color:var(--muted);font:11px/1.5 var(--mono);letter-spacing:.5px;text-align:center}' +
      '.vp-sound{padding:22px;border:1px solid var(--line);background:var(--panel);min-width:0}.vp-sound .vp-sound-title{margin:14px 0 6px;color:var(--text);font-size:16px!important}.vp-sound p{color:var(--muted)!important;font:12px/1.6 var(--mono);margin:0 0 18px}.vp-sound-toggle{padding:12px 16px;min-height:44px;border:1px solid var(--v2-accent,#4c9af8);border-radius:3px;background:var(--panel);color:var(--text);font:700 12px var(--mono);cursor:pointer}.vp-sound-toggle[aria-pressed="true"]{background:#4c9af8;color:#081326}.vp-sound-toggle:hover{border-color:#91c4ff}.vp-sound-toggle:focus-visible{outline:2px solid var(--v2-accent,#4c9af8);outline-offset:3px}.vp-sound .vp-sound-status{font-size:11px;margin:14px 0}.vp-sound a{color:var(--v2-accent,#4c9af8);font:11px var(--mono)}.vp-sound-player[hidden]{display:none!important}.vp-sound-player{margin:0 0 16px}.vp-sound-player iframe{display:block;width:100%;height:203px;min-width:200px;min-height:200px;border:0;background:#000}' +
      '@media(max-width:900px){.vp-game-layout{grid-template-columns:1fr}.vp-sound{width:100%;box-sizing:border-box}.vp-sound-player{max-width:480px}}' +
      '@media(max-width:600px){.vp-game,.vp-sound{padding:16px}.vp-title-screen{border-width:3px}.vp-game-toolbar{font-size:9px;letter-spacing:0}.vp-sound-toggle{padding:10px;font-size:10px}}';
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
