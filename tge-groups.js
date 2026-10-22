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
   allows 'unsafe-inline', which is what lets it inject its own <style>.

   ALPHA MODE lives here too, because this is the one file that already touches every rail row
   and runs after every panel file has mounted its buttons. Two Post-TGE tabs are still being
   built; for the public they stay in the navigation (the numbering and the roadmap read
   better with them than without) but are locked, and the owner opens them with a private
   link. It is a visibility gate on a static site, not access control: the sections are in the
   page source either way, so nothing confidential belongs in them. */
(function () {
  'use strict';

  /* Switch for the whole lock. Set to true to open the locked tabs to everyone: every piece of lock
     UI and the owner's ALPHA badge go away, and nothing else in this file changes. */
  var ALPHA_PUBLIC = false;
  /* The tabs that are locked, by tab id. Ids, not positions, so renumbering cannot move the
     lock onto a different row. */
  var ALPHA_TABS = ['whales-next'];
  var ALPHA_FLAG = 'varAlphaOwnerV1';
  /* SHA-256 of the owner key — never the key itself. ?alpha=<key> is hashed in the browser
     and compared to this, so the source can be read without being able to open the tabs. */
  var ALPHA_HASH = '7a708aff652c680746aa3993fb1e83ae9eb6ae32da0395b32b48ca35b7ea6aae';
  var ALPHA_MSG = 'ALPHA MODE \u2014 I\u2019m still building this. Opening to everyone soon.';
  var ALPHA_SUB = 'Building now \u00b7 opening soon';

  var KEY = 'variationalTgeView';

  /* Canonical order. Rails are reordered to match this, so it does not matter where the
     panel files happened to insert their buttons. */
  var GROUPS = [
    { k: 'pre',  label: 'Pre-TGE',  note: 'Measuring the protocol',
      tabs: ['overview', 'daily-news', 'efficiency', 'comparison', 'pretge', 'tokenomics',
             'historical', 'biweekly', 'implied', 'roadmap'] },
    /* Points sits here, not in Pre-TGE: "what my points are worth at each FDV" is a question
       about the listing, and it makes the group read as one sequence — how much do I get,
       what shape does it take, what do I do about it. */
    { k: 'post', label: 'Post-TGE', note: 'After the token lists',
      tabs: ['points', 'paths', 'plan', 'monitors', 'whales', 'whales-next', 'variational-pro'] }
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
    if (tab === 'derivatives') tab = 'variational-pro'; // Shareable nested Pro page.
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
    if (g && !isLocked(t)) lastTab[g] = t;
  }

  /* ---------- ALPHA MODE state ----------
     Three states, one question per call site. Public: nothing is special. Locked: the default
     for every visitor. Owner: the flag is set in this browser, the tabs work, and a small
     badge stays so the owner can tell the public still sees them locked. */
  var owner = false;
  try { owner = localStorage.getItem(ALPHA_FLAG) === '1'; } catch (_) {}
  function locked() { return !ALPHA_PUBLIC && !owner; }
  function isLocked(tab) { return tab === 'whales-next' || (locked() && ALPHA_TABS.indexOf(tab) >= 0); }
  function alphaState(tab) {
    if (tab === 'whales-next') return 'locked';
    if (ALPHA_PUBLIC || ALPHA_TABS.indexOf(tab) < 0) return '';
    return owner ? 'owner' : 'locked';
  }
  /* Where a locked deep link lands: the first Post-TGE tab that is open and really exists. */
  function fallbackTab() {
    var post = GROUPS.filter(function (x) { return x.k === 'post'; })[0];
    return (post && post.tabs.filter(function (t) {
      return !isLocked(t) && document.getElementById('tab-' + t);
    })[0]) || 'points';
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
        if (name) b.setAttribute('aria-label', num + ' ' + name.textContent +
          (alphaState(t) === 'locked' ? ' (alpha mode, locked)' : ''));
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

  /* ---------- ALPHA row state ----------
     The row is edited in place, not replaced: it keeps the listeners dashboard.js attached.
     What this file takes from it (title, sub-line text) is remembered on the element so that
     unlocking without a reload puts it back exactly as it was. The badge and the lock glyph
     are CSS pseudo-elements, not DOM text, because app-inline.js reads the <strong> text for
     the page heading and the translation harvester would pick up a stray string. */
  function alphaRow(b) {
    var st = alphaState(b.getAttribute('data-open-tab')), sub = b.querySelector('small');
    b.classList.toggle('alpha-locked', st === 'locked');
    b.classList.toggle('alpha-owner', st === 'owner');
    if (st === 'locked') {
      b.setAttribute('aria-disabled', 'true');
      b.setAttribute('tabindex', '-1');
      b.classList.remove('on');
      /* the native tooltip would stack on top of ours */
      if (b.hasAttribute('title')) { b.dataset.alphaTitle = b.getAttribute('title'); b.removeAttribute('title'); }
      if (!sub) {
        sub = document.createElement('small');
        sub.className = 'alpha-sub';
        b.appendChild(sub);
      } else if (b.dataset.alphaSmall === undefined) {
        b.dataset.alphaSmall = sub.textContent;
      }
      sub.textContent = ALPHA_SUB;
    } else {
      if (b.getAttribute('aria-disabled') === 'true') b.removeAttribute('aria-disabled');
      if (b.getAttribute('tabindex') === '-1') b.removeAttribute('tabindex');
      if (b.dataset.alphaTitle !== undefined) { b.setAttribute('title', b.dataset.alphaTitle); delete b.dataset.alphaTitle; }
      if (sub && sub.classList.contains('alpha-sub')) sub.parentNode.removeChild(sub);
      else if (sub && b.dataset.alphaSmall !== undefined) sub.textContent = b.dataset.alphaSmall;
      delete b.dataset.alphaSmall;
    }
  }

  function apply() {
    RAILS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (rail) {
        applyRail(rail);
        ALPHA_TABS.forEach(function (t) {
          rail.querySelectorAll('[data-open-tab="' + t + '"]').forEach(alphaRow);
        });
        renumber(rail);   /* the aria-label carries the lock */
      });
    });
    document.documentElement.classList.toggle('alpha-lock', locked());
  }

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
    var want = lastTab[mode] && !isLocked(lastTab[mode]) && document.getElementById('tab-' + lastTab[mode])
      ? lastTab[mode] : null;
    var target = want || (g && g.tabs.filter(function (t) {
      return !isLocked(t) && document.getElementById('tab-' + t);
    })[0]);
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
    var cur = (location.hash || '').replace('#', '');
    if (isLocked(cur)) {
      /* remembered so an owner key that arrives in the same URL can still open it */
      pendingTab = cur;
      leaveLocked(cur);
    }
    noteTab();
    var g = groupOf((location.hash || '').replace('#', ''));
    if (g && g !== mode) setMode(g, { silent: true });
  }

  /* ---------- ALPHA MODE behaviour ----------
     A locked tab has to be unreachable by every route that exists here, not just by the click
     that is obvious. The routes are: the rail rows (listeners attached by app-inline.js), the
     #tabs buttons (listener attached by dashboard.js), the arrow keys inside #tabs, a hash
     in the URL, and any other script calling showTab(). The first three are stopped by
     capture-phase listeners on document, which run before anything attached to the button
     itself; the last two by redirecting where the tab would have opened. */
  var pendingTab = null;      /* a locked tab the reader asked for, kept in case the owner key follows */
  var toldOnce = false;       /* the deep-link redirect explains itself once, not on every hashchange */
  var quietRedirect = false;  /* set while an ?alpha= key is being checked, so the owner sees no "locked" toast */
  var tip = null, tipTimer = 0;

  function tipEl() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'alpha-tip';
    tip.setAttribute('role', 'status');
    tip.textContent = ALPHA_MSG;
    document.body.appendChild(tip);
    return tip;
  }
  function hideTip() {
    clearTimeout(tipTimer);
    if (tip) tip.classList.remove('show', 'toast');
  }
  /* Hover: a tooltip beside the row. Click / redirect: a toast at the bottom of the viewport,
     because a tap has no hover and a redirect has no row to point at. */
  function showTip(anchor, asToast) {
    var t = tipEl();
    clearTimeout(tipTimer);
    t.classList.toggle('toast', !!asToast);
    t.classList.add('show');
    if (asToast || !anchor) {
      t.style.left = t.style.top = '';
      tipTimer = setTimeout(hideTip, 3800);
      return;
    }
    var r = anchor.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight;
    var left = r.right + 10, top = r.top + r.height / 2 - h / 2;
    if (left + w > window.innerWidth - 8) {       /* collapsed strip, or no room on the right */
      left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
      top = r.bottom + 8;
      if (top + h > window.innerHeight - 8) top = r.top - h - 8;
    }
    t.style.left = Math.round(left) + 'px';
    t.style.top = Math.round(Math.max(8, top)) + 'px';
  }

  function leaveLocked(from) {
    var to = fallbackTab();
    if (typeof showTab === 'function') { try { showTab(to); } catch (_) {} }
    else location.hash = '#' + to;
    if (!toldOnce && !quietRedirect) { toldOnce = true; showTip(null, true); }
  }

  /* Anything else that opens a tab by name — a link inside a panel, a hashchange handler in
     dashboard.js — goes through showTab(), so a locked name is swapped for the fallback
     there. Wrapped once; dashboard.js calls it by global name, so this takes effect for it. */
  function guardShowTab() {
    if (typeof window.showTab !== 'function' || window.showTab.alphaGuard) return;
    var open = window.showTab;
    var guarded = function (name, opts) {
      if (isLocked(name)) {
        pendingTab = name;
        name = fallbackTab();
        if (!quietRedirect) showTip(null, true);
      }
      return open.call(this, name, opts);
    };
    guarded.alphaGuard = true;
    window.showTab = guarded;
  }

  function lockedTarget(e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-open-tab],#tabs [data-tab]') : null;
    if (!el) return null;
    return isLocked(el.getAttribute('data-open-tab') || el.getAttribute('data-tab')) ? el : null;
  }

  function guardEvents() {
    document.addEventListener('click', function (e) {
      var el = lockedTarget(e);
      if (!el) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      showTip(el, true);
    }, true);
    document.addEventListener('keydown', function (e) {
      var el, bar, list, i, n;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        el = lockedTarget(e);
        if (!el) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        showTip(el, true);
        return;
      }
      /* dashboard.js walks #tabs by arrow key over every child, which would step straight
         onto a locked tab. Same walk, over the open ones only. */
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0 || !locked()) return;
      bar = document.getElementById('tabs');
      if (!bar || !e.target.closest || !e.target.closest('#tabs')) return;
      list = [].slice.call(bar.children).filter(function (b) { return !isLocked(b.dataset.tab); });
      if (!list.length) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      n = list.length;
      for (i = 0; i < n && !list[i].classList.contains('on'); i++);
      i = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : e.key === 'ArrowRight' ? (i + 1) % n : (i - 1 + n) % n;
      list[i].focus();
      if (typeof showTab === 'function') showTab(list[i].dataset.tab);
    }, true);
    /* mouseover / mouseout rather than mouseenter: one delegated pair covers rows that were
       cloned in by other scripts, with no per-row listeners to attach and lose. */
    document.addEventListener('mouseover', function (e) {
      var el = lockedTarget(e);
      if (el && el.hasAttribute('data-open-tab') && !(tip && tip.classList.contains('toast'))) showTip(el, false);
    });
    document.addEventListener('mouseout', function (e) {
      if (lockedTarget(e) && tip && !tip.classList.contains('toast')) hideTip();
    });
  }

  /* ---------- owner unlock ----------
     ?alpha=<key> opens the tabs in this browser; ?alpha=off closes them again. The key is
     stripped from the address bar straight away — right or wrong — so it is not left in
     history, a screenshot or a shared link. */
  function sha256hex(text) {
    var c = window.crypto;
    if (!c || !c.subtle || !window.TextEncoder) return Promise.resolve(null);   /* insecure context: stay locked */
    return c.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return [].map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function setOwner(on) {
    owner = on;
    try { if (on) localStorage.setItem(ALPHA_FLAG, '1'); else localStorage.removeItem(ALPHA_FLAG); } catch (_) {}
    hideTip();
    apply();
    var cur = (location.hash || '').replace('#', '');
    if (on && pendingTab && typeof showTab === 'function') { try { showTab(pendingTab); } catch (_) {} }
    else if (!on && isLocked(cur)) leaveLocked(cur);
    pendingTab = null;
  }
  function checkKey() {
    var m = /[?&]alpha=([^&#]*)/.exec(location.search);
    if (!m) return;
    var val;
    try { val = decodeURIComponent(m[1]); } catch (_) { val = m[1]; }
    var rest = location.search.replace(/([?&])alpha=[^&#]*&?/, '$1').replace(/[?&]$/, '');
    try { history.replaceState(history.state, '', location.pathname + rest + location.hash); } catch (_) {}
    if (val === 'off') { setOwner(false); return; }
    quietRedirect = true;
    sha256hex(val).then(function (h) {
      quietRedirect = false;
      if (h === ALPHA_HASH) setOwner(true);
      else if (pendingTab) { pendingTab = null; showTip(null, true); }
    }, function () { quietRedirect = false; });
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

    /* ---------- ALPHA MODE ----------
       While locked the locked sections and their #tabs buttons are removed outright — the
       rail rows are what stay, so the numbering and the roadmap still read in full. This is a
       second line behind the click guards, not the first. */
    ALPHA_TABS.map(function (t) {
      return 'html.alpha-lock .tsec[data-tg="' + t + '"],html.alpha-lock #tab-' + t;
    }).join(',') + '{display:none!important}',

    /* The badge and the lock glyph are pseudo-elements on the name, so the name's text, the
       aria-label and the page heading that reads it stay clean. The glyph is a mask over
       currentColor, which lets one shape follow dim / hover / light theme. */
    '.alpha-locked strong::before,.alpha-locked b::before{content:"";display:inline-block;',
    'width:8px;height:10px;margin-right:5px;vertical-align:-1px;background:currentColor;',
    '-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 8 10\'%3E',
    '%3Cpath fill-rule=\'evenodd\' d=\'M1.5 4V3a2.5 2.5 0 0 1 5 0v1H8v6H0V4zm1.2 0h2.6V3a1.3 1.3 0 0 0-2.6 0z\'/%3E%3C/svg%3E") center/contain no-repeat;',
    'mask:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 8 10\'%3E',
    '%3Cpath fill-rule=\'evenodd\' d=\'M1.5 4V3a2.5 2.5 0 0 1 5 0v1H8v6H0V4zm1.2 0h2.6V3a1.3 1.3 0 0 0-2.6 0z\'/%3E%3C/svg%3E") center/contain no-repeat}',
    '.alpha-locked strong::after,.alpha-locked b::after,.alpha-owner strong::after,.alpha-owner b::after{',
    'content:"ALPHA MODE";display:inline-block;margin-left:7px;padding:2px 4px 1px;',
    'border:1px solid rgba(245,185,74,.55);border-radius:2px;background:rgba(245,185,74,.09);',
    'color:#f5b94a;font:700 7px/1.3 var(--mono);letter-spacing:.7px;text-transform:uppercase;',
    'vertical-align:1px;white-space:nowrap}',
    '.alpha-owner strong::after,.alpha-owner b::after{content:"ALPHA"}',
    'body.theme-light .alpha-locked strong::after,body.theme-light .alpha-locked b::after,',
    'body.theme-light .alpha-owner strong::after,body.theme-light .alpha-owner b::after{',
    'color:#8a5a00;border-color:rgba(176,112,0,.6);background:rgba(245,185,74,.2)}',

    /* Dimmed by colour, not opacity: opacity would dim the badge with the name, and the badge
       is the one part that has to stay readable. Hover and focus are put back to the resting
       look so the row does not light up like something that will open. */
    'body button.alpha-locked[data-open-tab]{cursor:not-allowed!important;color:var(--v2-faint,#6b7686)!important;',
    'background:transparent!important;border-color:transparent!important}',
    'button.alpha-locked[data-open-tab] strong,button.alpha-locked[data-open-tab] b,',
    'button.alpha-locked[data-open-tab] span,button.alpha-locked[data-open-tab] small{color:var(--v2-faint,#6b7686)!important}',

    /* Vertical rails give each row a fixed height with !important. A badge that wraps and a
       locked row's second line both need more than that, so these rows take the height they
       need; the number and name stay on the first line, the sub-line sits under the name.
       Only from 1101px up — below that the rails are a strip of chips with no room for a
       second line, and the sub-line is dropped there. */
    '@media(min-width:1101px){',
    /* Here the name becomes a small wrapping flex line so that, in a narrow rail, the badge
       drops under the name flush left instead of dangling off the end of it with a stray
       margin. Everywhere else the name stays inline text, which is what lets a long name
       like Next Farm wrap naturally in the landing list. */
    '.srv2-rail .alpha-locked>strong,.srv2-global-nav .alpha-locked>strong,',
    '.srv2-rail .alpha-owner>strong,.srv2-global-nav .alpha-owner>strong{display:flex!important;',
    'flex-wrap:wrap;align-items:center;column-gap:6px;row-gap:3px}',
    '.srv2-rail .alpha-locked strong::before,.srv2-global-nav .alpha-locked strong::before{margin-right:0!important}',
    '.srv2-rail .alpha-locked strong::after,.srv2-global-nav .alpha-locked strong::after,',
    '.srv2-rail .alpha-owner strong::after,.srv2-global-nav .alpha-owner strong::after{margin-left:0!important}',
    'body .srv2-rail button.alpha-locked[data-open-tab],body .srv2-global-nav button.alpha-locked[data-open-tab],',
    'body .srv2-rail button.alpha-owner[data-open-tab],body .srv2-global-nav button.alpha-owner[data-open-tab]{',
    'height:auto!important;min-height:48px!important;padding-top:7px!important;padding-bottom:7px!important;',
    'grid-template-rows:auto auto;row-gap:2px}',
    '.srv2-rail button.alpha-locked>span,.srv2-global-nav button.alpha-locked>span{grid-row:1;grid-column:1}',
    '.srv2-rail button.alpha-locked>strong,.srv2-global-nav button.alpha-locked>strong{grid-row:1;grid-column:2;',
    'white-space:normal;line-height:1.5}',
    '.srv2-rail button.alpha-locked>small,.srv2-global-nav button.alpha-locked>small{grid-row:2;grid-column:2;',
    'font-size:8.5px!important;line-height:1.3!important;font-family:var(--sans)!important;font-weight:600!important;',
    'letter-spacing:0!important;white-space:normal}',
    '}',
    /* A chip stays on one line. Next Farm carries its own white-space:normal from whales-panels.js,
       which would otherwise drop the badge onto a second line inside a 38px chip. */
    '@media(max-width:1100px){.srv2-rail button.alpha-locked>small,.srv2-global-nav button.alpha-locked>small{display:none!important}',
    '.srv2-rail .alpha-locked>strong,.srv2-global-nav .alpha-locked>strong,',
    '.srv2-rail .alpha-owner>strong,.srv2-global-nav .alpha-owner>strong{white-space:nowrap!important}}',

    /* Landing list: "OPEN →" would promise something the row cannot do. */
    '.srv2-workspace-list button.alpha-locked::after{content:"LOCKED"!important;color:var(--v2-faint,#6b7686)!important}',
    '.srv2-workspace-list button.alpha-locked:hover{padding-left:4px!important}',

    /* Tooltip beside a row on hover; toast at the bottom on click or redirect. */
    '.alpha-tip{position:fixed;z-index:2147483000;left:0;top:0;max-width:260px;padding:9px 11px;',
    'border:1px solid var(--v2-line,#2a323d);border-left:2px solid #f5b94a;border-radius:2px;',
    'background:var(--v2-bg,#0e1116);color:var(--v2-text,#e8edf4);box-shadow:0 8px 28px rgba(0,0,0,.38);',
    'font:600 10.5px/1.45 var(--mono);letter-spacing:.2px;opacity:0;visibility:hidden;pointer-events:none;',
    'transition:opacity .15s ease,visibility .15s}',
    '.alpha-tip.show{opacity:1;visibility:visible}',
    '.alpha-tip.toast{left:50%!important;top:auto!important;bottom:26px;transform:translateX(-50%);',
    'width:max-content;max-width:min(380px,calc(100vw - 32px))}',
    'body.theme-light .alpha-tip{box-shadow:0 8px 24px rgba(20,30,50,.16);border-left-color:#c98a12}',
    '@media(prefers-reduced-motion:reduce){.alpha-tip{transition:none}}',

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
    guardShowTab();
    document.documentElement.classList.toggle('alpha-lock', locked());   /* before first paint of the rails */
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
    guardEvents();
    checkKey();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
