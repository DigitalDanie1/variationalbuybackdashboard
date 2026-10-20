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
      '<figure class="vp-game"><img src="assets/pro/pro-version-title.svg" width="512" height="512" alt="Variational Pro — Pro Version. A gold pixel logo above a mysterious flying silhouette. Coming soon.">' +
      '<figcaption>The next chapter. Coming soon.</figcaption></figure>';
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
    style.textContent = '.vp-game{margin:24px 0 0;padding:24px;border:1px solid var(--line);background:var(--panel);display:grid;justify-items:center;gap:16px}' +
      '.vp-game img{display:block;width:100%;max-width:440px;height:auto;aspect-ratio:1;image-rendering:pixelated;border:4px solid #111827;box-shadow:0 0 0 1px #44516b}' +
      '.vp-game figcaption{color:var(--muted);font:11px/1.5 var(--mono);letter-spacing:.5px;text-align:center}' +
      '@media(max-width:600px){.vp-game{padding:16px}.vp-game img{border-width:3px}}';
    document.head.appendChild(style);

    if (location.hash === '#' + TAB) showTab(TAB, { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
