/* Extracted from index.html so the page can ship under a strict CSP
   (script-src 'self' — no 'unsafe-inline'). Loaded with defer immediately
   after dashboard.js, so it still runs before DOMContentLoaded and every
   listener below registers in the original order. */

/* ---- was inline: anon ---- */
(function(){if(location.hash==="#meme")history.replaceState(null,"",location.pathname+location.search+"#overview");
})();

/* ---- was inline: anon ---- */
(function(){addEventListener("load",function(){var e=document.getElementById("calSharePct");try{if(e)e.textContent=Math.round(MKT.spreadShare*100)+"%";}catch(_){}});
})();

/* ---- was inline: anon ---- */
(function(){window.addEventListener("DOMContentLoaded", function () {
    const pairs = [
      ["totalVal", "overviewTreasuryHero"],
      ["stamp", "overviewTreasuryStamp"],
      ["dailyBriefRevenue", "overviewDayEarn"],
      ["marketEarn7", "overviewWeekEarn"],
      ["marketEarn30", "overviewMonthEarn"],
      ["headVol24", "overviewVolume"],
      ["dailyBriefSpreadFees", "overviewSpreads"],
      ["dailyBriefOlpSide", "overviewOlp"],
      ["dailyBriefRevenue", "overviewProtocol"]
    ];
    const syncOverview = function () {
      pairs.forEach(function (pair) {
        const source = document.getElementById(pair[0]);
        const target = document.getElementById(pair[1]);
        if (source && target && source.textContent.trim()) target.textContent = source.textContent.trim();
      });
    };
    const observer = new MutationObserver(syncOverview);
    pairs.forEach(function (pair) {
      const source = document.getElementById(pair[0]);
      if (source) observer.observe(source, { childList: true, characterData: true, subtree: true });
    });
    syncOverview();
    const jump = document.getElementById("overviewJumpEarnings");
    const earnings = document.querySelector(".earnings-workspace");
    if (jump && earnings) jump.addEventListener("click", function () { earnings.scrollIntoView({ behavior: "smooth", block: "start" }); });
  });
})();

/* ---- was inline: anon ---- */
(function(){['trollbox-splitview-widget','trollbox-complete-widget'].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.remove();
  });
})();

/* ---- was inline: anon ---- */
(function(){window.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('bwGuideToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      const open = document.body.classList.toggle('bw-guide-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Hide the reading guide' : 'How to read this page';
    });
  });
})();

/* ---- was inline: anon ---- */
(function(){
  // Theme controls are initialized centrally by dashboard.js.
})();

/* ---- was inline: signal-room-v2-runtime ---- */
(function(){window.addEventListener('DOMContentLoaded', function () {
    const links = {
      totalVal: ['v2Balance', 'v2LandBalance', 'v2GlobalTreasury'],
      headVol24: ['v2Volume', 'v2FlowVolume', 'v2LandVolume', 'v2GlobalVolume'],
      headOi: ['v2Oi', 'v2LandOi', 'v2GlobalOi'],
      dailyBriefRevenue: ['v2Latest', 'v2Day', 'v2Treasury', 'v2LandDay'],
      dailyBriefSpreadFees: ['v2Spreads'],
      dailyBriefOlpSide: ['v2Olp'],
      marketEarn7: ['v2Week'],
      marketEarn30: ['v2Month'],
      ticker: ['v2Hour'],
      liveHourLabel: ['v2HourLabel'],
      ac12h: ['v2Twelve'],
      ac24h: ['v2TwentyFour'],
      ac7d: ['v2SevenWindow'],
      marketVol7d: ['v2Volume7'],
      marketVol30d: ['v2Volume30'],
      marketEarnMtd: ['v2Mtd'],
      marketEarnMtdRange: ['v2MtdRange'],
      marketEarnAll: ['v2Held'],
      pmDailyRevenue: ['v2Pace'],
      stamp: ['v2Sync']
    };
    const normalizeBalance = function (value) {
      const match = String(value || '').replace(/,/g, '').match(/\$?([\d.]+)/);
      if (!match) return value;
      const amount = Number(match[1]);
      if (!Number.isFinite(amount)) return value;
      if (String(value).includes('M') || String(value).includes('B') || amount < 1000000) return value;
      return '$' + (amount / 1000000).toFixed(2) + '<em>M</em>';
    };
    const sync = function () {
      Object.entries(links).forEach(function (entry) {
        const source = document.getElementById(entry[0]);
        if (!source || !source.textContent.trim()) return;
        entry[1].forEach(function (targetId) {
          const target = document.getElementById(targetId);
          if (!target) return;
          if (targetId === 'v2Balance' || targetId === 'v2LandBalance') target.innerHTML = normalizeBalance(source.textContent.trim());
          else if (targetId === 'v2Sync') target.textContent = source.textContent.trim().replace(/^verified\s*/i, 'LIVE ');
          else target.textContent = source.textContent.trim();
        });
      });
      drawTreasuryCurve();
    };
    // Both axis ends label the data, not the wall clock. Using today's date on the right put
    // the axis up to a day ahead of the last plotted point.
    const toUTC = function (iso) {
      const parts = String(iso || '').split('-');
      if (parts.length !== 3) return null;
      const dt = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
      return isNaN(dt) ? null : dt;
    };
    const stamp = function (iso, opts) {
      const dt = toUTC(iso);
      if (!dt) return null;
      return dt.toLocaleDateString('en-US', Object.assign({month:'short', day:'numeric', year:'numeric', timeZone:'UTC'}, opts || {})).toUpperCase();
    };
    const getSeries = function () {
      const s = (typeof SERIES !== 'undefined' && Array.isArray(SERIES)) ? SERIES : null;
      return (s && s.length > 1) ? s : null;
    };
    // Plots one cumulative curve into an <svg> whose viewBox is W x H.
    const plotCurve = function (lineId, areaId, W, H, PAD) {
      const line = document.getElementById(lineId);
      const area = document.getElementById(areaId);
      const series = getSeries();
      if (!line || !area || !series) return;
      const values = series.map(function (p) { return p.v; });
      const min = Math.min.apply(null, values), max = Math.max.apply(null, values);
      const span = (max - min) || 1;
      const d = series.map(function (p, i) {
        const x = (i / (series.length - 1)) * W;
        const y = H - PAD - ((p.v - min) / span) * (H - PAD * 2);
        return (i ? 'L' : 'M') + (Math.round(x * 100) / 100) + ' ' + (Math.round(y * 100) / 100);
      }).join(' ');
      line.setAttribute('d', d);
      area.setAttribute('d', d + ' L' + W + ' ' + H + ' L0 ' + H + 'Z');
    };
    // Month ticks placed by real elapsed time, so an uneven gap in the data shows as an uneven
    // gap on the axis rather than being evenly spaced into a lie.
    const renderLandingAxis = function () {
      const host = document.getElementById('v2LandAxis');
      const series = getSeries();
      if (!host || !series) return;
      const firstISO = series[0].d, lastISO = series[series.length - 1].d;
      const t0 = toUTC(firstISO), t1 = toUTC(lastISO);
      if (!t0 || !t1 || t1 <= t0) return;
      const total = t1 - t0;
      const parts = [];
      parts.push('<i class="is-start">' + (stamp(firstISO) || '') + '</i>');
      // First day of each month strictly inside the range, skipping ticks that would collide
      // with either end label.
      const cursor = new Date(Date.UTC(t0.getUTCFullYear(), t0.getUTCMonth() + 1, 1));
      while (cursor < t1) {
        const pct = (cursor - t0) / total * 100;
        if (pct > 9 && pct < 88) {
          parts.push('<i class="is-mid" style="left:' + pct.toFixed(2) + '%">'
            + cursor.toLocaleDateString('en-US', {month:'short', timeZone:'UTC'}).toUpperCase() + '</i>');
        }
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
      parts.push('<i class="is-end">' + (stamp(lastISO) || '') + '</i>');
      host.innerHTML = parts.join('');
    };
    // Draws every treasury curve from the same on-chain SERIES that feeds the Historical tab,
    // so the headline visuals and the verifiable data are the same object.
    const drawTreasuryCurve = function () {
      const series = getSeries();
      if (!series) return;
      plotCurve('v2CurveLine', 'v2CurveArea', 1000, 400, 14);
      plotCurve('v2LandCurveLine', 'v2LandCurveArea', 1000, 260, 10);
      const startLabel = document.getElementById('v2StartDate');
      const endLabel = document.getElementById('v2EndDate');
      const startText = stamp(series[0] && series[0].d);
      const endText = stamp(series[series.length - 1] && series[series.length - 1].d);
      if (startLabel && startText) startLabel.textContent = startText;
      if (endLabel && endText) endLabel.textContent = endText;
      renderLandingAxis();
    };
    const setView = function () {
      const overview = document.getElementById('tab-overview');
      const isOverview = Boolean(overview && overview.classList.contains('on'));
      const isLanding = isOverview && (location.hash === '' || location.hash === '#landing');
      document.body.classList.toggle('v2-landing', isLanding);
      document.body.classList.toggle('v2-dashboard', !isLanding);
      document.body.classList.toggle('v2-overview', isOverview && !isLanding);
      const active = document.querySelector('#tabs button.on[data-tab]');
      // The rail is the navigation the user actually sees, so its label is the canonical workspace
      // name. Reading the legacy #tabs strip here made the header and the rail disagree
      // ("Daily Earnings" vs "Daily VAR News", "Money Mechanic" vs "Mechanic").
      const railLabel = active && document.querySelector('.srv2-rail [data-open-tab="' + active.dataset.tab + '"] strong');
      const activeName = railLabel ? railLabel.textContent.trim() : (active ? active.textContent.trim() : 'Dashboard');
      const title = document.getElementById('v2SectionTitle');
      if (title) title.textContent = activeName;
      document.querySelectorAll('.srv2-global-nav [data-open-tab], .srv2-rail [data-open-tab]').forEach(function (button) {
        button.classList.toggle('on', Boolean(active && button.dataset.openTab === active.dataset.tab));
      });
    };
    const observer = new MutationObserver(function () { sync(); setView(); });
    Object.keys(links).forEach(function (id) {
      const source = document.getElementById(id);
      if (source) observer.observe(source, {subtree:true, childList:true, characterData:true, attributes:true});
    });
    const tabs = document.getElementById('tabs');
    if (tabs) observer.observe(tabs, {subtree:true, attributes:true, attributeFilter:['class','aria-selected']});
    document.querySelectorAll('[data-open-tab]').forEach(function (button) {
      button.addEventListener('click', function () {
        const target = document.getElementById('tab-' + button.dataset.openTab);
        history.replaceState(null, '', location.pathname + location.search + '#' + button.dataset.openTab);
        if (target) target.click();
        setView();
        window.scrollTo(0, 0);
      });
    });
    const marketHost = document.getElementById('v2MarketChartHost');
    const marketChart = document.getElementById('marketActivityChart');
    const marketChartHead = marketChart && marketChart.parentElement ? marketChart.parentElement.querySelector('.market-chart-head') : null;
    if (marketHost && marketChart) {
      if (marketChartHead) marketHost.appendChild(marketChartHead);
      marketHost.appendChild(marketChart);
    }
    // Landing already owns the treasury headline and operating summary. Overview starts
    // with the detailed ET ledger, followed by market activity.
    const canvas = document.querySelector('.srv2-canvas');
    const calendar = document.querySelector('.earnings-workspace');
    if (canvas && calendar) {
      calendar.classList.remove('tsec', 'tg-hide');
      calendar.removeAttribute('data-tg');
      canvas.insertBefore(calendar, canvas.firstChild);
    }
    const landingRefresh = document.getElementById('v2LandingRefresh');
    if (landingRefresh) landingRefresh.addEventListener('click', function () { location.reload(); });
    const openDashboard = document.getElementById('v2OpenDashboard');
    if (openDashboard) openDashboard.addEventListener('click', function () {
      history.replaceState(null, '', location.pathname + location.search + '#overview');
      setView();
      window.scrollTo(0, 0);
    });
    const goHome = function () {
      const overviewTab = document.getElementById('tab-overview');
      if (overviewTab && !overviewTab.classList.contains('on')) overviewTab.click();
      history.replaceState(null, '', location.pathname + location.search + '#landing');
      setView();
      window.scrollTo(0, 0);
    };
    const backHome = document.getElementById('v2BackHome');
    if (backHome) backHome.addEventListener('click', goHome);
    document.querySelectorAll('[data-back-home]').forEach(function (button) { button.addEventListener('click', goHome); });
    window.addEventListener('hashchange', setView);
    sync(); setView();
    setTimeout(sync, 400); setTimeout(sync, 1400); setTimeout(sync, 3500);
  });
})();

/* ---- recent completed days ----
   Fills the gap the brief column used to leave between the money flow and the
   footnote. Same closes the calendar shows, from the same on-chain SERIES. */
(function(){
  window.addEventListener('DOMContentLoaded', function(){
    var host = document.getElementById('v2DaysList');
    if (!host) return;
    var N = 10;
    function money(n){
      var sign = n < 0 ? '-' : '+';
      try { if (typeof fmtUSD === 'function') return sign + fmtUSD(Math.abs(n)); } catch (e) {}
      return sign + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
    }
    function render(){
      var s = (typeof SERIES !== 'undefined' && Array.isArray(SERIES)) ? SERIES : null;
      if (!s || s.length < 2) return;
      var days = [];
      for (var i = s.length - 1; i > 0 && days.length < N; i--) days.push({d: s[i].d, e: s[i].v - s[i-1].v});
      if (!days.length) return;
      var max = Math.max.apply(null, days.map(function(x){ return x.e; }));
      host.innerHTML = days.map(function(x){
        var p = String(x.d).split('-');
        var dt = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
        if (isNaN(dt)) return '';
        var day = dt.toLocaleDateString('en-US', {month:'short', day:'numeric', timeZone:'UTC'}).toUpperCase();
        var wd  = dt.toLocaleDateString('en-US', {weekday:'short', timeZone:'UTC'}).toUpperCase();
        var cls = 'srv2-day' + (x.e < 0 ? ' is-down' : '') + (x.e === max && max > 0 ? ' is-top' : '');
        return '<div class="' + cls + '">'
             +   '<div class="srv2-day-date"><b>' + day + '</b><span>' + wd + '</span></div>'
             +   '<div class="srv2-day-val">' + money(x.e) + '</div>'
             + '</div>';
      }).join('');
    }
    render();
    // dashboard.js swaps SERIES once the live fetch resolves, so re-render on that.
    var probe = document.getElementById('totalVal');
    if (probe) new MutationObserver(render).observe(probe, {childList:true, characterData:true, subtree:true});
    setTimeout(render, 600); setTimeout(render, 1800); setTimeout(render, 4000);
  });
})();
