/* ---------- Navigation · Pre-TGE / Post-TGE grouping ----------
   The site answers two different questions for two different readers, and until now the
   navigation was one flat run of thirteen tabs that did not say which was which:

     Pre-TGE   what the protocol is doing and what it is worth today
     Post-TGE  what happens to a holder once the token actually lists

   This file is navigation only. It adds no content, owns no data, and every tab it moves
   keeps its own id, its own section and its own deep link — reordering a rail cannot change
   what any tab shows.

   Three rails render the same navigation (global sidebar, landing workspace list, Signal
   Room rail), so the switch is injected into all three and they share one state. That is
   the same shape the theme toggle already uses here: three controls, one source of truth.

   Load order matters. paths-panels.js and playbook-panels.js insert their own rail buttons
   at boot and renumber every rail top to bottom, so this file has to run after all of them
   and renumber again within groups. Its <script> tag must stay LAST of the panel files —
   any panel that mounts a rail button after this runs would undo the grouping.

   The deploy target runs script-src 'self', so this is an external file, and style-src
   allows 'unsafe-inline', which is what lets it inject its own <style>. */
(function () {
  'use strict';

  var KEY = 'variationalTgeView';

  /* Canonical order. Rails are reordered to match this, so it does not matter where the
     panel files happened to insert their buttons. */
  var GROUPS = [
    { k: 'pre',  label: 'Pre-TGE',  note: 'Measuring the protocol',
      tabs: ['overview', 'daily-news', 'efficiency', 'comparison', 'pretge', 'tradfi',
             'historical', 'biweekly', 'implied', 'roadmap'] },
    /* Points sits here, not in Pre-TGE: "what my points are worth at each FDV" is a question
       about the listing, and it makes the group read as one sequence — how much do I get,
       what shape does it take, what do I do about it. */
    { k: 'post', label: 'Post-TGE', note: 'After the token lists',
      tabs: ['points', 'paths', 'plan', 'monitors'] }
  ];

  /* Headings carry the same two strings as the switch and are capitalised in CSS, not in the
     DOM. One string per idea instead of two: the translation dictionary here is rebuilt by a
     harvester that walks the rendered page, and a second all-caps spelling would be a second
     key to translate for no gain. */
  var MODES = [
    { k: 'pre',  label: 'Pre-TGE' },
    { k: 'post', label: 'Post-TGE' }
  ];

  var RAILS = ['.srv2-global-nav', '.srv2-workspace-list', '.srv2-rail'];

  function groupOf(tab) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].tabs.indexOf(tab) >= 0) return GROUPS[i].k;
    return null;
  }
  function order() {
    return GROUPS.reduce(function (a, g) { return a.concat(g.tabs); }, []);
  }

  /* Two states, not three. An earlier build let a click on the lit side clear the filter
     back to an 'all' view, which a two-position control has nowhere to show: the marker had
     no side to sit on, so it faded out and the switch read as broken rather than neutral.
     A value stored by that build resolves to Pre-TGE. */
  var mode = 'pre';
  try { if (localStorage.getItem(KEY) === 'post') mode = 'post'; } catch (_) {}
  function save() { try { localStorage.setItem(KEY, mode); } catch (_) {} }
  save();   /* normalise a stored 'all' on the way in rather than resolving it on every boot */

  /* Flipping back should return to what you were reading, not to the top of the list. Without
     this, Historical -> Post-TGE -> Pre-TGE lands on Overview and the toggle quietly loses
     your place every time it is used as a toggle rather than as a one-way filter. */
  var lastTab = { pre: null, post: null };
  function noteTab() {
    var t = (location.hash || '').replace('#', '');
    var g = groupOf(t);
    if (g) lastTab[g] = t;
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- reorder + tag ----------
     Buttons are moved, never rebuilt: they carry listeners, titles and aria-labels set by
     dashboard.js and by the two panel files, and cloning them would drop all of it. */
  function arrange(rail) {
    var seq = order(), i, btn;
    /* The block is re-ordered in place, not appended. appendChild would move every tab past
       whatever else the rail holds — the home button and the "SIGNAL ROOM 2.0" label both
       live in here — which left the list stranded below them with a gap above it. A marker
       at the first tab's current position keeps the block where the layout expects it. */
    var first = rail.querySelector('[data-open-tab]');
    if (!first) return;
    var mark = document.createComment('tge-order');
    rail.insertBefore(mark, first);
    for (i = 0; i < seq.length; i++) {
      btn = rail.querySelector('[data-open-tab="' + seq[i] + '"]');
      if (!btn) continue;
      btn.dataset.tgeGroup = groupOf(seq[i]);
      rail.insertBefore(btn, mark);   /* insertBefore moves an existing node */
    }
    /* Anything this file does not know about (a tab added later) keeps its place after the
       block rather than disappearing, and is left ungrouped so it shows in every mode. */
    if (mark.parentNode) mark.parentNode.removeChild(mark);
  }

  function headings(rail) {
    GROUPS.forEach(function (g) {
      var first = rail.querySelector('[data-open-tab][data-tge-group="' + g.k + '"]');
      if (!first) return;
      var h = rail.querySelector('.tge-ghead[data-tge-head="' + g.k + '"]');
      if (!h) {
        h = document.createElement('div');
        h.className = 'tge-ghead';
        h.setAttribute('data-tge-head', g.k);
        h.setAttribute('aria-hidden', 'true');   /* the switch already names the group */
        h.innerHTML = '<span>' + esc(g.label) + '</span><em>' + esc(g.note) + '</em>';
      }
      first.parentNode.insertBefore(h, first);
    });
  }

  function switcher(rail) {
    if (rail.querySelector('.tge-switch')) return;
    var box = document.createElement('div');
    box.className = 'tge-switch';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Show Pre-TGE or Post-TGE sections');
    /* One moving element rather than a background on the active button: a fill on each side
       reads as two separate buttons lighting up, a single marker reads as one control with a
       position, which is what a two-state switch is. The marker is a rule under the label. */
    box.innerHTML = '<span class="tge-thumb" aria-hidden="true"></span>' + MODES.map(function (m) {
      return '<button type="button" data-tge-mode="' + m.k + '" aria-pressed="false">' +
        esc(m.label) + '</button>';
    }).join('');
    /* After the logo where a rail has one, otherwise at the top. */
    var logo = rail.querySelector('.srv2-logo');
    if (logo && logo.parentNode === rail && logo.nextSibling) rail.insertBefore(box, logo.nextSibling);
    else rail.insertBefore(box, rail.firstChild);
    box.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-tge-mode]');
      if (!b || !box.contains(b)) return;
      setMode(b.dataset.tgeMode);
    });
  }

  /* Numbering restarts inside each group, which is the point of grouping: Points is the
     first thing a holder does after the listing, so it reads 01 of Post-TGE and not 11 of
     a flat list. Ungrouped buttons keep counting after the last group. */
  function renumber(rail) {
    GROUPS.forEach(function (g) {
      var n = 0;
      g.tabs.forEach(function (t) {
        var b = rail.querySelector('[data-open-tab="' + t + '"]');
        if (!b) return;
        n++;
        var num = ('0' + n).slice(-2);
        var sp = b.querySelector('span');
        if (sp) sp.textContent = num;
        var name = b.querySelector('strong') || b.querySelector('b');
        if (name) b.setAttribute('aria-label', num + ' ' + name.textContent);
      });
    });
  }

  function applyRail(rail) {
    /* A tab this file does not know about stays visible in both views rather than becoming
       unreachable — a new panel that lands here before its group is declared is a bug to fix,
       not a tab to hide. */
    rail.querySelectorAll('[data-open-tab]').forEach(function (b) {
      var g = b.dataset.tgeGroup;
      b.hidden = !(!g || g === mode);
    });
    /* Only one group is ever on screen, so only its heading is — and what that heading is
       for is the sub-line, not the name. The name is already lit in the switch directly
       above it, and printing it twice in the same accent mono read as a rendering fault. */
    rail.querySelectorAll('.tge-ghead').forEach(function (h) {
      h.hidden = h.dataset.tgeHead !== mode;
    });
    rail.querySelectorAll('[data-tge-mode]').forEach(function (b) {
      var on = b.dataset.tgeMode === mode;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    rail.querySelectorAll('.tge-switch').forEach(function (sw) { sw.dataset.tgePos = mode; });
    /* The landing list hangs its "START HERE" badge off button:first-child, which stopped
       matching the moment a switch and a heading were inserted ahead of it. Marking the
       first still-visible tab restores the badge and, in a filtered view, moves it onto the
       row that is actually first. */
    var firstShown = null;
    rail.querySelectorAll('[data-open-tab]').forEach(function (b) {
      b.classList.remove('tge-first');
      if (!firstShown && !b.hidden) firstShown = b;
    });
    if (firstShown) firstShown.classList.add('tge-first');
    rail.dataset.tgeView = mode;
  }

  function apply() { RAILS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(applyRail);
  }); }

  /* Filtering to a group while a tab from the other group is open would leave the reader
     looking at a section the navigation no longer lists, so the first tab of the chosen
     group is opened instead. Only on the dashboard — on the landing page nothing is open
     and nothing should be forced open. */
  function reconcileTab() {
    var b = document.body;
    if (!b.classList.contains('v2-dashboard') && !b.classList.contains('v2-overview')) return;
    var cur = (location.hash || '').replace('#', '');
    if (!cur || groupOf(cur) === mode) return;
    var g = GROUPS.filter(function (x) { return x.k === mode; })[0];
    var want = lastTab[mode] && document.getElementById('tab-' + lastTab[mode]) ? lastTab[mode] : null;
    var target = want || (g && g.tabs.filter(function (t) { return document.getElementById('tab-' + t); })[0]);
    if (target && typeof showTab === 'function') { try { showTab(target); } catch (_) {} }
  }

  function setMode(m, opts) {
    if (m !== 'pre' && m !== 'post') return;
    if (m === mode) return;   /* a two-position switch has nothing to do here */
    mode = m; save(); apply();
    if (!opts || !opts.silent) reconcileTab();
  }

  /* A deep link is the one way to arrive inside the side the toggle is not on — #plan opens
     the Playbook while the nav still lists Pre-TGE. Following the hash instead of overriding
     it keeps the link authoritative and the navigation honest about where the reader is. */
  function followHash() {
    noteTab();
    var g = groupOf((location.hash || '').replace('#', ''));
    if (g && g !== mode) setMode(g, { silent: true });
  }

  /* #tabs is the real source of tab state; reordering it keeps keyboard order and any saved
     tab order agreeing with what the rails show. The buttons themselves are untouched. */
  function arrangeTabBar() {
    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    order().forEach(function (t) {
      var b = document.getElementById('tab-' + t);
      if (b && b.parentNode === tabs) tabs.appendChild(b);
    });
  }

  var CSS = [
    /* Every rail gives its buttons an explicit display (grid in the landing list, inline-flex
       in a collapsed strip), and any display beats the UA's [hidden]{display:none}. So the
       filter has to say it outright, or setting .hidden changes the property and nothing on
       screen — which is exactly what it did. */
    '[data-open-tab][hidden],.tge-ghead[hidden]{display:none!important}',

    /* ---------- the switch ----------
       Two labels on a hairline with a 2px accent rule sliding between them.
       It was a 999px capsule holding a filled pill, and that was the only capsule on a page
       built out of hairlines, 3px corners and square fills — 340px wide and 50px tall on the
       landing panel, which made the filter heavier than the rows it filters and left the
       unselected half reading as an empty input rather than a button. A tab bar is the
       lighter of the two shapes and the one the rest of this page already speaks. */
    '.tge-switch{position:relative;display:flex;gap:0;margin:0;padding:0;background:none;',
    'border:0;border-bottom:1px solid var(--v2-line,var(--line));border-radius:0}',

    /* Still one moving element rather than a background on the active side. Its width is half
       the track, so the two labels have to stay exactly half each — at content width the rule
       lands a few pixels off the word it belongs to. Transform, so a fixed rail never lays
       out again mid-slide. */
    '.tge-thumb{position:absolute;left:0;bottom:-1px;width:50%;height:2px;border-radius:0;',
    'background:var(--v2-accent,#4c9af8);pointer-events:none;',
    'transition:transform .18s cubic-bezier(.4,0,.2,1)}',
    '.tge-switch[data-tge-pos="post"] .tge-thumb{transform:translateX(100%)}',
    '@media(prefers-reduced-motion:reduce){.tge-thumb{transition:none}}',

    /* display and grid-template are reset because the rails style their buttons as two-column
       grids with an !important template — a switch label dropped into that grid lands in the
       narrow second column and gets ellipsised. */
    '.tge-switch button{flex:1 1 50%;width:50%;min-width:0;position:relative;z-index:1;',
    'display:block!important;grid-template-columns:none!important;padding:0 6px!important;',
    'border:0!important;border-radius:0!important;background:transparent!important;cursor:pointer;',
    'color:var(--v2-dim,var(--dim));font:800 9.5px var(--mono);letter-spacing:1.1px;',
    'text-transform:uppercase;line-height:1.2;text-align:center;white-space:nowrap;',
    'overflow:hidden;text-overflow:ellipsis;transition:color .15s ease}',
    '.tge-switch button:hover{color:var(--v2-text,var(--text))}',
    '.tge-switch button:focus-visible{outline:0;color:var(--v2-text,var(--text));',
    'box-shadow:inset 0 0 0 1px var(--v2-accent,#4c9af8)}',
    /* The active label carries the colour and the rule carries the position; it paints no
       background of its own. The dashboard has a blanket `body.v2-dashboard button.on{
       background:accent!important}` that outranks a plain `.tge-switch button.on`, and it
       was filling the lit half solid blue behind the marker — two blue shapes with different
       corners on top of each other, which is what the control looked broken from. The extra
       body and attribute in this selector are there to outrank it. */
    'body .tge-switch button.on[data-tge-mode],body .tge-switch button.on[data-tge-mode]:hover',
    '{background:transparent!important;border-color:transparent!important;',
    'color:var(--v2-accent,#4c9af8)!important}',

    /* ---------- group sub-line ----------
       The name is in the switch; what is left worth saying is the one line describing the
       side you are on, so the heading keeps its <em> and drops its label. The element stays
       intact — the string is shared with the switch and the translation dictionary here is
       rebuilt by a harvester that walks the rendered page. */
    '.tge-ghead{display:block;margin:0;padding:10px 2px 11px;border:0}',
    '.tge-ghead>span{display:none}',
    '.tge-ghead>em{display:block;color:var(--v2-dim,var(--dim))!important;font-style:normal;',
    'font:600 10.5px var(--sans);letter-spacing:.2px;line-height:1.35}',
    /* Inside a rail there is no room to spend a line on it, and the lit tab is the heading. */
    '.srv2-rail .tge-ghead,.srv2-global-nav .tge-ghead{display:none!important}',

    /* ---------- landing workspace list ----------
       This list styles every descendant <button> as a workspace row — a four-column grid with
       an "OPEN →" ::after and an accent hover fill. The switch is a control, not a row, so
       each of those has to be undone rather than inherited. */
    '.srv2-workspace-list>.tge-switch,.srv2-workspace-list>.tge-ghead{grid-column:1/-1;width:100%}',
    '.srv2-workspace-list .tge-switch{margin-top:2px}',
    '.srv2-workspace-list .tge-switch button{display:block;min-height:44px;padding:0 6px!important;',
    'border:0;text-align:center;grid-template-columns:none;gap:0;font-size:10px}',
    '.srv2-workspace-list .tge-switch button::after{content:none}',
    '.srv2-workspace-list .tge-switch button:hover,.srv2-workspace-list .tge-switch button:focus-visible',
    '{background:transparent;color:var(--v2-text)}',
    'body .srv2-workspace-list .tge-switch button.on[data-tge-mode]',
    '{background:transparent!important;color:var(--v2-accent)!important}',
    /* badge restored on whichever row is first in the current view */
    '.srv2-workspace-list>button.tge-first b::after{content:"START HERE";display:inline-block;',
    'margin-left:9px;padding:3px 5px;border:1px solid var(--v2-accent-deep,#2a5f9e);',
    'color:var(--v2-accent,#4c9af8);font:700 8px var(--mono);vertical-align:1px}',
    '.srv2-workspace-list>button.tge-first:hover b::after{border-color:var(--v2-bg,#0e1116);color:var(--v2-bg,#0e1116)}',

    /* On wide screens the landing list turns into a nine-row fr grid and stretches every
       child to fill its row, which inflated the switch to 64px and the sub-line to 67px —
       about twice what either needs, and enough to make the filter taller than the rows it
       filters. Two auto rows at the top hold them at their own height and leave the fr rows
       to the workspace rows they were written for. */
    '@media(min-width:1251px){.srv2-workspaces>.srv2-workspace-list',
    '{grid-template-rows:auto auto repeat(9,minmax(44px,1fr))!important}}',

    /* ---------- vertical rails ----------
       Only the type is tightened here, never the height. The shell pins a rail button to 48px
       on desktop and 44px below 1100px, both with !important, and those are touch-target
       minimums rather than styling — a switch that undercut them would be a real regression
       on a phone. So the switch keeps the rail's own row height. */
    '.srv2-rail .tge-switch button,.srv2-global-nav .tge-switch button{font-size:9px;',
    'letter-spacing:.6px;padding:0 4px!important}',

    /* ---------- collapsed strip ----------
       Below 1100px both rails stop being a column and become a fixed horizontal strip of
       inline-flex chips. A full-width switch is a column shape: left alone it collapses to a
       few pixels. Fixed at two equal halves wide enough for the longer label — the old strip
       rule only named .srv2-global-nav, so on .srv2-rail, which is the strip that actually
       renders here, "Post-TGE" was cut to "Post-T". The hairline turns into a divider on the
       right, because a rule under two chips in a scrolling row reads as an underlined word
       rather than as the floor of a tab bar. */
    '@media(max-width:1100px){',
    '.srv2-global-nav .tge-switch,.srv2-rail .tge-switch{flex:0 0 auto;width:158px;',
    'margin:0 21px 0 0;padding:0;align-items:center;border:0}',
    /* The divider is a pseudo-element in the margin rather than padding and a border on the
       switch, so the track stays exactly two equal halves and the sliding rule keeps landing
       on the label it belongs to. */
    '.srv2-global-nav .tge-switch::after,.srv2-rail .tge-switch::after{content:"";',
    'position:absolute;right:-11px;top:9px;bottom:9px;width:1px;',
    'background:var(--v2-line,var(--line))}',
    '.srv2-global-nav .tge-switch button,.srv2-rail .tge-switch button{flex:1 1 50%;width:50%;',
    'padding:0 4px!important;font-size:9px;letter-spacing:.8px}',
    '.srv2-global-nav .tge-thumb,.srv2-rail .tge-thumb{bottom:7px}',
    '}',

    /* Hangul and Han do not belong in the mono stack: the tracking that makes a Latin micro
       label read as a terminal string only pulls the syllables apart. The page already has a
       CJK face for this, and the per-rail sizes above are overridden rather than repeated
       three times. */
    'html[lang="ko"] .tge-switch button,html[lang="zh-Hans"] .tge-switch button',
    '{font-family:var(--cjk)!important;font-size:10.5px!important;letter-spacing:.2px!important}',
    'html[lang="ko"] .tge-ghead>em,html[lang="zh-Hans"] .tge-ghead>em',
    '{font-family:var(--cjk);letter-spacing:0}'
  ].join('');

  function injectCss() {
    if (document.getElementById('tge-groups-style')) return;
    var st = document.createElement('style');
    st.id = 'tge-groups-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function boot() {
    injectCss();
    RAILS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (rail) {
        arrange(rail); headings(rail); switcher(rail); renumber(rail);
      });
    });
    arrangeTabBar();
    followHash();
    apply();
    reconcileTab();
    window.addEventListener('hashchange', followHash);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
