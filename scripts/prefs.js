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

/* accent color */
var ACCENTS = {
  gold:{ a:'#d2a24b', h:'#e2b45d' },
  blue:{ a:'#87aef3', h:'#a5c4f5' },
  green:{ a:'#82c990', h:'#9ad8a8' },
  purple:{ a:'#b59adc', h:'#c9b3e6' }
};
function applyAccent(id, save){
  var p = ACCENTS[id] || ACCENTS.gold;
  document.documentElement.style.setProperty('--accent', p.a);
  document.documentElement.style.setProperty('--accent-hover', p.h);
  if(save !== false){ try { localStorage.setItem('tcos-accent', id); } catch(e){} }
}
window.TCOS_accent = function(id){ applyAccent(id, true); };
(function restoreAccent(){
  var id = 'gold';
  try { id = localStorage.getItem('tcos-accent') || 'gold'; } catch(e){}
  applyAccent(id, false);
})();

/* night light (temperature slider drives a warm overlay) */
function nightTemp(){
  var t = 60;
  try {
    var v = parseInt(localStorage.getItem('tcos-night-temp'), 10);
    if(!isNaN(v)) t = Math.max(0, Math.min(100, v));
  } catch(e){}
  return t;
}
function applyNight(){
  var on = false;
  try { on = localStorage.getItem('tcos-night') === '1'; } catch(e){}
  var o = document.getElementById('night-overlay');
  if(o) o.classList.toggle('hidden', !on);
  applyNightTemp();
}
function applyNightTemp(){
  var t = nightTemp();
  var o = document.getElementById('night-overlay');
  if(o) o.style.background = 'rgba(255,' + Math.round(210 - 160 * t / 100) + ',0,' + (0.03 + 0.13 * t / 100).toFixed(3) + ')';
  document.querySelectorAll('[data-night-temp]').forEach(function(s){ s.value = t; });
  var v = document.getElementById('night-temp-val');
  if(v) v.textContent = t + '% warm';
}
window.TCOS_night = function(){ applyNight(); };
window.TCOS_nightTemp = function(t){
  t = Math.max(0, Math.min(100, Math.round(t)));
  try { localStorage.setItem('tcos-night-temp', String(t)); } catch(e){}
  applyNightTemp();
};
applyNight();

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
  if(e.ctrlKey && e.altKey && (e.key === 'Delete' || e.key === 'End')){
    e.preventDefault();
    if(window.TCOS_cad) window.TCOS_cad();
    return;
  }
  if(e.altKey && e.key === 'Tab'){
    e.preventDefault();
    if(window.TCOS_altabNext && !document.getElementById('altab').classList.contains('hidden')) window.TCOS_altabNext();
    else if(window.TCOS_altab) window.TCOS_altab();
    return;
  }
  if((e.metaKey || e.ctrlKey) && !isMobile() && !(window.TCOS_isLocked && window.TCOS_isLocked())){
    var top = WM.topmost ? WM.topmost() : null;
    if(top){
      if(e.key === 'ArrowLeft'){ e.preventDefault(); WM.snap(top, 'left'); return; }
      if(e.key === 'ArrowRight'){ e.preventDefault(); WM.snap(top, 'right'); return; }
      if(e.key === 'ArrowUp'){
        e.preventDefault();
        var cur = WM.list().filter(function(w){ return w.id === top; })[0];
        if(cur && !cur.maximized) WM.toggleMax(top);
        return;
      }
      if(e.key === 'ArrowDown'){ e.preventDefault(); WM.minimize(top); return; }
    }
    if(e.key.toLowerCase() === 'l'){ window.TCOS_lock && window.TCOS_lock(); return; }
  }
  var tag = (e.target.tagName||'').toLowerCase();
  if(tag==='input' || tag==='textarea') return;
  if(e.key==='Escape'){
    window.TCOS_closeStart && window.TCOS_closeStart();
    document.getElementById('ctx-menu').classList.remove('open');
    if(window.TCOS_closeNotifs) window.TCOS_closeNotifs();
    if(window.TCOS_closeClock) window.TCOS_closeClock();
    if(window.TCOS_closeTray) window.TCOS_closeTray();
    if(window.TCOS_uacCancel) window.TCOS_uacCancel();
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
