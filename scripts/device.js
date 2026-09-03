'use strict';

/* ============================================================
   DEVICE — volume, brightness, battery, network
   Shared by the desktop tray and mobile Settings.
   ============================================================ */
(function(){
  /* ---------- volume (TC/OS sounds only — browsers expose no system volume) ---------- */
  function getVolume(){
    try {
      var v = parseInt(localStorage.getItem('tcos-volume'), 10);
      if(!isNaN(v)) return Math.max(0, Math.min(100, v));
    } catch(e){}
    return 100;
  }
  function applyVolume(){
    var v = getVolume() / 100;
    ['notif-audio', 'startup-audio'].forEach(function(id){
      var a = document.getElementById(id);
      if(a) a.volume = v;
    });
    var s = document.getElementById('tray-vol');
    if(s) s.value = getVolume();
    var m = document.getElementById('m-set-vol');
    if(m) m.value = getVolume();
  }
  function setVolume(v){
    v = Math.max(0, Math.min(100, Math.round(v)));
    try { localStorage.setItem('tcos-volume', String(v)); } catch(e){}
    applyVolume();
  }

  /* ---------- brightness (visual overlay — never touches hardware) ---------- */
  function getBright(){
    try {
      var v = parseInt(localStorage.getItem('tcos-bright'), 10);
      if(!isNaN(v)) return Math.max(40, Math.min(100, v));
    } catch(e){}
    return 100;
  }
  function applyBright(){
    var v = getBright();
    var o = document.getElementById('bright-overlay');
    if(o) o.style.opacity = String(((100 - v) / 100 * 0.72).toFixed(3));
    var s = document.getElementById('tray-bright');
    if(s) s.value = v;
    var m = document.getElementById('m-set-bright');
    if(m) m.value = v;
  }
  function setBright(v){
    v = Math.max(40, Math.min(100, Math.round(v)));
    try { localStorage.setItem('tcos-bright', String(v)); } catch(e){}
    applyBright();
  }

  /* ---------- network (real browser status) ---------- */
  function online(){ return navigator.onLine !== false; }
  function paintNet(){
    var on = online();
    var t = document.getElementById('tray-net-state');
    if(t) t.textContent = on ? 'Online · Connected' : 'Offline · No connection';
    var m = document.getElementById('m-set-wifi');
    if(m) m.textContent = on ? 'Online · Connected' : 'Offline · No connection';
    var btn = document.getElementById('tray-btn');
    if(btn) btn.classList.toggle('offline', !on);
    /* direct display control (works even if tray CSS is stale/missing) */
    var slash = document.getElementById('tray-wifi-off');
    if(slash) slash.style.display = on ? 'none' : 'block';
    var mSlash = document.getElementById('m-st-wifi-off');
    if(mSlash) mSlash.style.display = on ? 'none' : 'block';
    var mw = document.getElementById('m-st-wifi');
    if(mw){
      mw.classList.toggle('offline', !on);
      mw.setAttribute('aria-label', on ? 'Network: online' : 'Network: offline');
    }
  }
  window.addEventListener('online', paintNet);
  window.addEventListener('offline', paintNet);

  /* ---------- battery (Battery Status API with graceful fallback) ---------- */
  var batt = { supported:false, level:null, charging:false };
  function battText(){
    if(!batt.supported) return 'Battery unavailable';
    return Math.round(batt.level * 100) + '%' + (batt.charging ? ' · Charging' : '');
  }
  function paintBatt(){
    var pct = batt.supported ? Math.round(batt.level * 100) : null;
    var fill = document.getElementById('tray-batt-fill');
    if(fill && pct !== null) fill.setAttribute('width', String(Math.max(2, Math.round(pct / 100 * 16))));
    var fillLg = document.getElementById('tray-batt-fill-lg');
    if(fillLg && pct !== null) fillLg.setAttribute('width', String(Math.max(2, Math.round(pct / 100 * 16))));
    var bolt = document.getElementById('tray-batt-bolt');
    if(bolt){
      bolt.classList.toggle('hidden', !batt.charging);
      bolt.style.display = batt.charging ? 'block' : 'none';
    }
    var tp = document.getElementById('tray-pct');
    if(tp) tp.textContent = pct === null ? '--' : pct + '%';
    var tt = document.getElementById('tray-batt-text');
    if(tt) tt.textContent = battText();
    var mt = document.getElementById('m-set-batt');
    if(mt) mt.textContent = battText();
    var tb = document.getElementById('tray-btn');
    if(tb) tb.classList.toggle('lowbatt', pct !== null && pct <= 15);
    var mFill = document.getElementById('m-st-batt-fill');
    if(mFill && pct !== null) mFill.setAttribute('width', String(Math.max(2, Math.round(pct / 100 * 16))));
    var mBolt = document.getElementById('m-st-batt-bolt');
    if(mBolt){
      mBolt.classList.toggle('hidden', !batt.charging);
      mBolt.style.display = batt.charging ? 'block' : 'none';
    }
    var mPct = document.getElementById('m-st-pct');
    if(mPct) mPct.textContent = pct === null ? '--' : pct + '%';
    var mBatt = document.getElementById('m-st-batt');
    if(mBatt){
      mBatt.classList.toggle('lowbatt', pct !== null && pct <= 15);
      mBatt.setAttribute('aria-label', 'Battery: ' + battText());
    }
  }
  function watchBatt(b){
    function sync(){
      batt.level = b.level;
      batt.charging = b.charging;
      paintBatt();
    }
    b.addEventListener('levelchange', sync);
    b.addEventListener('chargingchange', sync);
    sync();
  }
  if(navigator.getBattery){
    try {
      navigator.getBattery().then(function(b){
        batt.supported = true;
        watchBatt(b);
      }).catch(function(){ paintBatt(); });
    } catch(e){ paintBatt(); }
  } else {
    paintBatt();
  }

  /* ---------- tray panel ---------- */
  var panel = document.getElementById('tray-panel');
  var trayBtn = document.getElementById('tray-btn');
  function closeTray(){
    if(panel) panel.classList.add('hidden');
    if(trayBtn) trayBtn.setAttribute('aria-expanded', 'false');
  }
  window.TCOS_closeTray = closeTray;
  if(trayBtn && panel){
    trayBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var willOpen = panel.classList.contains('hidden');
      if(window.TCOS_closeNotifs) window.TCOS_closeNotifs();
      if(window.TCOS_closeClock) window.TCOS_closeClock();
      if(window.TCOS_closeStart) window.TCOS_closeStart();
      panel.classList.toggle('hidden');
      trayBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if(willOpen){ paintNet(); paintBatt(); }
    });
    document.addEventListener('click', function(e){
      if(!panel.classList.contains('hidden') && !panel.contains(e.target)) closeTray();
    });
  }

  var vs = document.getElementById('tray-vol');
  if(vs) vs.addEventListener('input', function(){ setVolume(parseInt(vs.value, 10)); });
  var bs = document.getElementById('tray-bright');
  if(bs) bs.addEventListener('input', function(){ setBright(parseInt(bs.value, 10)); });

  /* ---------- public API ---------- */
  window.TCOS_device = {
    volume:getVolume,
    setVolume:setVolume,
    brightness:getBright,
    setBrightness:setBright,
    batteryText:battText,
    refresh:function(){ paintNet(); paintBatt(); applyVolume(); applyBright(); }
  };

  applyVolume();
  applyBright();
  paintNet();
})();
