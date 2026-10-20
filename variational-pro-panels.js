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
      '<div class="vp-game-layout"><figure class="vp-game"><div class="vp-game-toolbar"><span>VARIATIONAL PRO · TITLE SCREEN</span>' +
      '<button class="vp-sound-toggle" type="button" aria-pressed="false" aria-label="Play music">▶ Play music</button></div>' +
      '<div class="vp-title-screen"><img class="vp-wordmark" src="assets/pro/variational-wordmark.png" width="1275" height="400" alt="Variational">' +
      '<div class="vp-version"><span>PRO VERSION</span><small>A NEW CHAPTER AWAITS</small></div>' +
      '<img class="vp-landscape" src="assets/pro/pro-version-title.svg?v=compact" width="512" height="296" alt="A mysterious flying silhouette above a retro pixel landscape. Coming soon."><div class="vp-coming">COMING SOON<span>UNKNOWN TERRITORY. FAMILIAR INSTINCT.</span></div></div>' +
      '<figcaption>Variational Pro · The next chapter.</figcaption></figure>' +
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
      section.classList.remove('vp-music-active');
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
      section.classList.add('vp-music-active');
      soundPlayer.appendChild(frame);
      soundToggle.setAttribute('aria-pressed', 'true');
      soundToggle.textContent = '■ Stop music';
      soundToggle.setAttribute('aria-label', 'Stop music');
      soundStatus.textContent = 'Use Stop music above to turn the soundtrack off.';
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
    style.textContent = `
.vp-game-layout{display:grid;gap:16px;max-width:680px;margin:24px auto 0}
.vp-game{margin:0;padding:14px;border:1px solid var(--line);background:var(--panel)}
.vp-game-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;color:var(--muted);font:10px/1.5 var(--mono);letter-spacing:1px}
.vp-title-screen{background:#1b2032;border:1px solid #40506d;box-shadow:0 0 0 4px #111827;overflow:hidden;text-align:center}
.vp-title-screen .vp-wordmark{display:block;width:min(100%,360px);height:auto;margin:0 auto}
.vp-version{display:grid;justify-items:center;gap:12px;margin-top:-12px;padding:0 12px 18px;color:#fff}
.vp-version>span{font:900 clamp(18px,3vw,25px)/1.2 var(--mono);letter-spacing:5px;padding:8px 14px 8px 19px;color:#dcecff;background:#263a5b;border:2px solid #4c9af8;box-shadow:3px 3px 0 #080d1e;text-shadow:2px 2px #080d1e}
.vp-version small{font:9px/1.4 var(--mono);letter-spacing:3px;color:#8da7cf}
.vp-landscape{display:block;width:100%;height:150px;object-fit:fill;image-rendering:pixelated}
.vp-coming{padding:14px 12px 16px;background:#050806;color:#f3f7e9;font:700 clamp(18px,3vw,22px)/1.2 var(--mono);letter-spacing:4px;text-shadow:2px 2px #3a4b42}
.vp-coming span{display:block;margin-top:12px;font:9px/1.5 var(--mono);letter-spacing:1.5px;color:#77958e;text-shadow:none}
.vp-game figcaption{margin-top:14px;color:var(--muted);font:10px/1.5 var(--mono);text-align:center}
.vp-sound{padding:0 6px;min-width:0}.vp-sound .cmp-eyebrow,.vp-sound>.vp-sound-title,.vp-sound>p:not(.vp-sound-status){display:none}
.vp-sound .vp-sound-status{color:var(--muted)!important;font:11px/1.5 var(--mono);margin:0 0 8px}
.vp-sound-toggle{padding:10px 16px;min-height:42px;border:1px solid #4c9af8;border-radius:3px;background:#1b2a43;color:#dcecff;font:700 11px var(--mono);cursor:pointer;white-space:nowrap;letter-spacing:0}
.vp-sound-toggle[aria-pressed="true"]{background:#4c9af8;color:#081326}.vp-sound-toggle:hover{border-color:#91c4ff}.vp-sound-toggle:focus-visible{outline:2px solid #91c4ff;outline-offset:3px}
.vp-sound a{color:var(--v2-accent,#4c9af8);font:10px var(--mono)}
.vp-sound-player[hidden]{display:none!important}.vp-sound-player{margin:12px 0;max-width:360px}.vp-sound-player iframe{display:block;width:100%;height:203px;min-width:200px;min-height:200px;border:0;background:#000}
@media(max-width:600px){.vp-game{padding:12px}.vp-game-toolbar{font-size:8px;letter-spacing:0}.vp-sound-toggle{padding:10px;font-size:10px}.vp-version{margin-top:-4px}.vp-landscape{height:145px}.vp-coming span{font-size:8px;letter-spacing:.5px}}
`;
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
