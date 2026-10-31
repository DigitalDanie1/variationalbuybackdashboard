/* The only first-paint release point. Never expose uninitialized legacy markup. */
(function () {
  'use strict';
  const root=document.documentElement;
  function fail(){root.dataset.uiState='error';}
  function finish(){
    // Registered last: every synchronous DOMContentLoaded initializer has run.
    // Two frames also drain their mutation observers and layout callbacks.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const body=document.body;
      const landing=body.classList.contains('v2-landing');
      const dashboard=body.classList.contains('v2-dashboard');
      const active=document.querySelector('#tabs button.on');
      const arranged=document.getElementById('tge-groups-style');
      if(typeof showTab!=='function'||!arranged||(!landing&&!dashboard)||!active){fail();return;}
      if(landing&&!document.querySelector('.le-landing canvas')){fail();return;}
      root.dataset.uiState='ready';
      performance.mark('var-ui-ready');
    }));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',finish,{once:true});
  else finish();
})();
