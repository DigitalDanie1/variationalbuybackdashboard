// Apply the saved theme before first paint to prevent a dark-to-light flash.
// Loaded synchronously from <head>; it lives in its own file because the CSP
// (script-src 'self') blocks inline scripts.
(function(){
  var mode='dark';
  try{mode=localStorage.getItem('variationalRadarTheme')||'dark';}catch(_){ }
  document.documentElement.dataset.theme=mode==='light'?'light':'dark';
  if(mode==='light')document.documentElement.classList.add('theme-light-pending');
})();
