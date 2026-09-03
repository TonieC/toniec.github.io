'use strict';
/* ============================================================
   THEME TOGGLE
   ============================================================ */
function applyThemeIcon(){
  var light = document.documentElement.getAttribute('data-theme')==='light';
  var meta = document.getElementById('meta-theme-color');
  if(meta) meta.setAttribute('content', light ? '#eef0f3' : '#0b0c0e');
  document.querySelectorAll('.m-toggle-theme').forEach(function(t){ t.classList.toggle('on', light); });
}
function toggleTheme(){
  var light = document.documentElement.getAttribute('data-theme')==='light';
  if(light) document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme','light');
  try{ localStorage.setItem('tcos-theme', light?'dark':'light'); }catch(e){}
  applyThemeIcon();
}
document.getElementById('theme-btn').addEventListener('click', toggleTheme);
applyThemeIcon();
restoreWallpaper();
restoreTaskAlign();

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', function(e){
  if(e.ctrlKey && e.shiftKey && (e.key === 'Escape' || e.key === 'Esc')){
    e.preventDefault();
    if(isMobile() && window.TCOS_openMobile) window.TCOS_openMobile('taskmanager', 'Task Manager');
    else WM.open('taskmanager');
    return;
  }
  var tag = (e.target.tagName||'').toLowerCase();
  if(tag==='input' || tag==='textarea') return;
  if(e.key==='Escape'){
    window.TCOS_closeStart && window.TCOS_closeStart();
    document.getElementById('ctx-menu').classList.remove('open');
    if(window.TCOS_closeNotifs) window.TCOS_closeNotifs();
    if(window.TCOS_closeClock) window.TCOS_closeClock();
    if(window.TCOS_closeTray) window.TCOS_closeTray();
  }
  if(e.key==='`'){ e.preventDefault(); WM.open('terminal'); }
});

/* Konami-style easter egg: b u i l d then Enter opens About TC/OS */
(function(){
  var seq = ['b','u','i','l','d'];
  var pos = 0;
  document.addEventListener('keydown', function(e){
    var tag=(e.target.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea') return;
    var k = e.key.toLowerCase();
    if(k===seq[pos]){ pos++; if(pos===seq.length){ pos=0; showToast('You typed "build". Nice.'); WM.open('about-tcos'); } }
    else pos = (k===seq[0]) ? 1 : 0;
  });
})();
