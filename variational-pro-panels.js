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
      '<div class="vp-game-layout"><figure class="vp-game"><img src="assets/pro/pro-version-title.svg" width="512" height="512" alt="Variational Pro — Pro Version. A gold pixel logo above a mysterious flying silhouette. Coming soon.">' +
      '<figcaption>The next chapter. Coming soon.</figcaption></figure>' +
      '<aside class="vp-sound" aria-label="Title screen soundtrack"><span class="cmp-eyebrow">GAME BOY CLASSICS</span>' +
      '<h3 class="vp-sound-title">Pokémon Gold &amp; Silver</h3><p>Title Screen</p>' +
      '<button class="vp-sound-toggle" type="button" aria-pressed="false">▶ Play music</button>' +
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
      soundToggle.textContent = '▶ Play music';
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
      soundStatus.textContent = 'Loop enabled. Use the player for playback and volume.';
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
      '.vp-game img{display:block;width:100%;max-width:440px;height:auto;aspect-ratio:1;image-rendering:pixelated;border:4px solid #111827;box-shadow:0 0 0 1px #44516b}' +
      '.vp-game figcaption{color:var(--muted);font:11px/1.5 var(--mono);letter-spacing:.5px;text-align:center}' +
      '.vp-sound{padding:22px;border:1px solid var(--line);background:var(--panel);min-width:0}.vp-sound .vp-sound-title{margin:14px 0 6px;color:var(--text);font-size:16px!important}.vp-sound p{color:var(--muted)!important;font:12px/1.6 var(--mono);margin:0 0 18px}.vp-sound-toggle{padding:12px 16px;min-height:44px;border:1px solid var(--v2-accent,#4c9af8);border-radius:3px;background:var(--panel);color:var(--text);font:700 12px var(--mono);cursor:pointer}.vp-sound-toggle:focus-visible{outline:2px solid var(--v2-accent,#4c9af8);outline-offset:3px}.vp-sound .vp-sound-status{font-size:11px;margin:14px 0}.vp-sound a{color:var(--v2-accent,#4c9af8);font:11px var(--mono)}.vp-sound-player[hidden]{display:none!important}.vp-sound-player{margin:0 0 16px}.vp-sound-player iframe{display:block;width:100%;height:203px;min-width:200px;min-height:200px;border:0;background:#000}' +
      '@media(max-width:900px){.vp-game-layout{grid-template-columns:1fr}.vp-sound{width:100%;box-sizing:border-box}.vp-sound-player{max-width:480px}}' +
      '@media(max-width:600px){.vp-game,.vp-sound{padding:16px}.vp-game img{border-width:3px}}';
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
