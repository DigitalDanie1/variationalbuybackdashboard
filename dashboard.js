/* ---------- Tab · Monitors -------------------------------------------------
   Two of the playbook's five monitors, promoted out of that tab because they are
   the ones meant to run continuously rather than be read once.

   Neither can run yet, and the honest version of "coming soon" is to say exactly
   what is missing rather than show an empty box. So each panel lists its inputs
   and marks which already exist. That distinction is real: the wallet monitor has
   nothing at all, while the OLP ratio already has its numerator live on-chain and
   is only waiting on a token to stake. Showing both as the same blank would hide
   the more useful of the two facts.

   The deploy CSP is script-src 'self', so this stays an external file loaded with
   defer after dashboard.js. */
(function () {
  'use strict';

  var OLP_ADDR = '0x74bbbb0e7f0bad6938509dd4b556a39a4db1f2cd';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function usd(v) {
    if (!isFinite(v) || v == null) return null;
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(v);
  }

  /* dashboard.js declares these as top-level consts, which classic scripts share.
     They may not be populated yet on first render, hence the guards. */
  function olpLive() {
    try {
      if (typeof PM_GROWTH_STATE !== 'undefined' && isFinite(PM_GROWTH_STATE.olpCurrent)) {
        return PM_GROWTH_STATE.olpCurrent;
      }
    } catch (_) {}
    try { if (typeof OLP_TVL !== 'undefined' && OLP_TVL > 0) return OLP_TVL; } catch (_) {}
    return null;
  }

  var MONITORS = [
    {
      k: 'wallets',
      n: '01',
      title: 'Top 100 airdropped wallets',
      sub: 'distribution behaviour after TGE',
      state: 'nothing to watch yet',
      ready: 0,
      watches: 'The net balance of the 100 largest airdrop recipients, day by day. It is the read on whether the people handed free supply are still selling it.',
      flips: 'Net balance of the top 100 stops falling — three consecutive days of flat-to-positive net flow.',
      matters: 'This is the gate the playbook puts on converting spot into collateral. Until it reads clear, nothing else in the plan moves.',
      inputs: [
        { t: 'A $VAR token', has: false, why: 'Not launched. No TGE date announced.' },
        { t: 'An allocation list', has: false, why: 'No airdrop recipients published, so there is no set of 100 to rank.' },
        { t: 'An indexer on the airdrop contract', has: false, why: 'Nothing to index against until the contract exists.' }
      ]
    },
    {
      k: 'olp',
      n: '02',
      title: 'OLP deposits ÷ VAR staked',
      sub: 'the flywheel ratio',
      state: 'numerator live, denominator missing',
      ready: 1,
      watches: 'Deposits sitting in the OLP vault against the amount of $VAR locked in staking. One number over the other, tracked over time.',
      flips: 'Rising means deposits arrive faster than tokens are locked. Falling means the staking yield is being paid for by nothing.',
      matters: 'It is the only one of the playbook’s five that measures the business rather than the price. Deposits are what the vault actually earns on.',
      inputs: [
        { t: 'OLP vault deposits', has: true, why: 'Already read on-chain from the Core OLP Vault, the same figure the Fundamentals tab uses.' },
        { t: '$VAR staked', has: false, why: 'No token, so nothing is staked and the denominator is zero.' }
      ]
    }
  ];

  function card(m) {
    var live = m.k === 'olp' ? olpLive() : null;
    var have = m.inputs.filter(function (i) { return i.has; }).length;

    var inputs = m.inputs.map(function (i) {
      return '<li class="mn-input' + (i.has ? ' has' : '') + '">' +
        '<span class="mn-dot" aria-hidden="true">' + (i.has ? '✓' : '—') + '</span>' +
        '<b>' + esc(i.t) + '</b><em>' + esc(i.why) + '</em></li>';
    }).join('');

    /* The one panel with a live input shows it. An empty box would say the same
       thing as the wallet monitor, and they are not in the same state. */
    var value = '';
    if (m.k === 'olp') {
      value = '<div class="mn-live">' +
        '<div class="mn-live-row"><span>OLP vault deposits</span>' +
        '<b>' + (live ? esc(usd(live)) : 'reading on-chain…') + '</b>' +
        '<em>live from the Core OLP Vault</em></div>' +
        '<div class="mn-live-row off"><span>$VAR staked</span><b>—</b>' +
        '<em>no token to stake yet</em></div>' +
        '<div class="mn-live-row out"><span>Ratio</span><b>—</b>' +
        '<em>needs both sides</em></div></div>';
    }

    return '<article class="mn-card ' + m.k + '">' +
      '<header class="mn-head"><span class="mn-n">' + m.n + '</span>' +
      '<div><b>' + esc(m.title) + '</b><small>' + esc(m.sub) + '</small></div></header>' +
      /* the status sits on its own row: one of these labels is three words and the
         other is four, and inline they landed on different lines per card */
      '<p class="mn-badge-row"><span class="mn-badge' + (m.ready ? ' part' : '') + '">' +
      esc(m.state) + '</span></p>' +
      value +
      '<dl class="mn-dl">' +
      '<dt>What it watches</dt><dd>' + esc(m.watches) + '</dd>' +
      '<dt>What flips it</dt><dd>' + esc(m.flips) + '</dd>' +
      '<dt>Why it matters</dt><dd>' + esc(m.matters) + '</dd>' +
      '</dl>' +
      '<div class="mn-need"><span class="mn-need-h">What it needs first' +
      '<i>' + have + ' of ' + m.inputs.length + ' ready</i></span>' +
      '<ul class="mn-inputs">' + inputs + '</ul></div>' +
      '</article>';
  }

  function render() {
    var host = document.querySelector('[data-tg="monitors"]');
    if (!host) return;
    host.innerHTML =
      '<div class="cmp-heading"><span class="cmp-eyebrow">MONITORS</span>' +
      '<h2>Two things worth watching, neither of which can run yet</h2>' +
      '<p>Both come straight out of the playbook. They are here rather than there because they are meant to run every day once they can, not be read once. Nothing below is live: what each panel shows is the list of inputs it needs and which of them already exist. The wallet monitor has none of its three. The OLP ratio already has one of its two, read on-chain, and is waiting only on a token.</p></div>' +
      '<div class="mn-grid">' + MONITORS.map(card).join('') + '</div>' +
      '<div class="tp-note"><b>Why these two and not the other three.</b> The playbook lists five monitors. The other three — week-one entry sizing, spot posted as collateral, and on-chain pools hedged with perp longs — are decisions taken once at a point in time, and they already have a home in the Playbook tab. These two are ratios that only mean anything as a series, which is what a monitor is for. Neither will show a number until the token exists; this page will say so plainly until then rather than filling the space with a placeholder chart.</div>';
  }

  function mount() {
    if (document.querySelector('[data-tg="monitors"]')) return;
    var main = document.querySelector('#main');
    if (!main) return;
    var sec = document.createElement('section');
    sec.className = 'monitors-report tsec tg-hide';
    sec.setAttribute('data-tg', 'monitors');
    var anchor = document.querySelector('[data-tg="roadmap"]');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else main.appendChild(sec);
    mountTabButton();
    mountRail();
  }

  /* #tabs is the source of tab state: showTab() reads it and the side rail only
     delegates into it, so a section without a #tab-<name> button never unhides. */
  function mountTabButton() {
    if (document.getElementById('tab-monitors')) return;
    var tabs = document.getElementById('tabs');
    if (!tabs) return;
    var after = document.getElementById('tab-roadmap');
    var b = document.createElement('button');
    b.id = 'tab-monitors';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.dataset.tab = 'monitors';
    b.textContent = 'Monitors';
    if (after && after.parentNode === tabs) tabs.insertBefore(b, after);
    else tabs.appendChild(b);
  }

  function mountRail() {
    var rails = {};
    document.querySelectorAll('[data-open-tab="roadmap"]').forEach(function (btn) {
      var rail = btn.parentNode;
      if (!rail || rail.querySelector('[data-open-tab="monitors"]')) return;
      var mine = btn.cloneNode(true);
      mine.setAttribute('data-open-tab', 'monitors');
      var strong = mine.querySelector('strong') || mine.querySelector('b');
      if (strong) strong.textContent = 'Monitors';
      var small = mine.querySelector('small');
      if (small) small.textContent = 'waiting on the token';
      rail.insertBefore(mine, btn);
      rails[rail.className || 'rail'] = rail;
    });
    /* the rail numbers itself top to bottom, so every button is renumbered */
    Object.keys(rails).forEach(function (k) {
      var kids = rails[k].querySelectorAll('[data-open-tab]');
      [].forEach.call(kids, function (b, i) {
        var num = ('0' + (i + 1)).slice(-2);
        var span = b.querySelector('span');
        if (span) span.textContent = num;
        var name = b.querySelector('strong') || b.querySelector('b');
        if (name) b.setAttribute('aria-label', num + ' ' + name.textContent);
      });
    });
  }

  function registerTab() {
    try {
      if (typeof VALID_TABS !== 'undefined' && VALID_TABS.indexOf('monitors') < 0) VALID_TABS.push('monitors');
      if (typeof DEFAULT_TAB_ORDER !== 'undefined' && DEFAULT_TAB_ORDER.indexOf('monitors') < 0) {
        var i = DEFAULT_TAB_ORDER.indexOf('plan');
        if (i < 0) i = DEFAULT_TAB_ORDER.indexOf('paths');
        DEFAULT_TAB_ORDER.splice(i < 0 ? DEFAULT_TAB_ORDER.length : i + 1, 0, 'monitors');
      }
      if (typeof SECTION_COPY !== 'undefined') SECTION_COPY.monitors = {
        eyebrow: 'Monitors',
        title: 'Monitors',
        description: 'The two playbook monitors meant to run as a series, and the inputs each is still missing.',
        chip: 'pending'
      };
    } catch (_) {}
  }

  function boot() {
    registerTab();
    mount();
    render();
    /* the OLP balance arrives from an on-chain read well after load, so the one
       live figure on the page is re-read a few times rather than once */
    var tries = 0;
    var timer = setInterval(function () {
      if (++tries > 20) { clearInterval(timer); return; }
      if (olpLive() != null) { render(); clearInterval(timer); }
    }, 1500);
    var tabs = document.getElementById('tabs');
    if (tabs) tabs.addEventListener('click', function (e) {
      var b = e.target && e.target.closest && e.target.closest('button');
      if (b && b.dataset.tab === 'monitors') setTimeout(render, 40);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
