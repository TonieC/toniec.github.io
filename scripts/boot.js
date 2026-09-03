'use strict';
/* ============================================================
   BOOT SEQUENCE (replayable — used on first load and Reopen)
   ============================================================ */
function startBoot(boot){
  var linesEl = boot.querySelector('.boot-lines');
  var lines = ['Initializing TC/OS...', 'Loading portfolio...', 'Loading projects...', 'Loading system...'];
  var timers = [];
  var done = false;

  function onKey(){ finish(); }
  function finish(){
    if(done) return;
    done = true;
    timers.forEach(clearTimeout);
    document.removeEventListener('keydown', onKey);
    boot.classList.add('boot-out');
    setTimeout(function(){ boot.remove(); }, prefersReducedMotion()?0:380);
  }

  if(prefersReducedMotion()){
    finish();
  } else {
    var t = 0;
    lines.forEach(function(text, i){
      var d = document.createElement('div');
      d.className='boot-line';
      d.textContent = text;
      linesEl.appendChild(d);
      timers.push(setTimeout(function(){ d.classList.add('on'); }, t));
      t += 70;
    });
    timers.push(setTimeout(function(){
      var r = document.createElement('div');
      r.className='boot-line ready';
      r.textContent='READY';
      linesEl.appendChild(r);
      requestAnimationFrame(function(){ r.classList.add('on'); });
    }, t+60));
    timers.push(setTimeout(finish, t + 220));
  }

  boot.addEventListener('click', finish);
  document.addEventListener('keydown', onKey);
}
window.TCOS_boot = function(){
  var boot = document.createElement('div');
  boot.id = 'boot';
  boot.setAttribute('role','status');
  boot.setAttribute('aria-label','Loading TC/OS');
  boot.innerHTML = '<div class="boot-logo">TC<span>/</span>OS</div><div class="boot-lines"></div><div class="boot-skip">click / press any key to skip</div>';
  document.body.appendChild(boot);
  startBoot(boot);
};
startBoot(document.getElementById('boot'));
setTimeout(function(){ if(window.TCOS_startupSound) window.TCOS_startupSound(); }, 900);

/* offline support — registers the app-shell service worker (no-op
   where workers are unavailable; localhost and https only) */
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}
