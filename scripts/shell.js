'use strict';
/* ============================================================
   TASKBAR shortcuts + clock
   ============================================================ */
document.querySelectorAll('[data-open]').forEach(function(el){
  el.addEventListener('click', function(){ WM.open(el.getAttribute('data-open')); });
});

function tickClock(){
  var now = new Date();
  var time = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  var date = now.toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'});
  var t = document.getElementById('tb-time'); if(t) t.textContent = time;
  var d = document.getElementById('tb-date'); if(d) d.textContent = date;
  var mt = document.getElementById('m-time'); if(mt) mt.textContent = time;
  var md = document.getElementById('m-date'); if(md) md.textContent = date;
  var vt = document.getElementById('m-view-time'); if(vt) vt.textContent = time;
  var vd = document.getElementById('m-view-date'); if(vd) vd.textContent = date;
  var cb = document.getElementById('clock-big'); if(cb) cb.textContent = time;
  var cs = document.getElementById('clock-sub'); if(cs) cs.textContent = date;
  var lt = document.getElementById('lock-time'); if(lt) lt.textContent = time;
  var ld = document.getElementById('lock-date'); if(ld) ld.textContent = date;
}
tickClock();
setInterval(tickClock, 1000);

/* ============================================================
   POPUP EXCLUSIVITY — only one taskbar submenu open at a time
   ============================================================ */
window.TCOS_closePopups = function(except){
  if(except !== 'start' && window.TCOS_closeStart) window.TCOS_closeStart();
  if(except !== 'clock' && window.TCOS_closeClock) window.TCOS_closeClock();
  if(except !== 'tray' && window.TCOS_closeTray) window.TCOS_closeTray();
  if(except !== 'notifs' && window.TCOS_closeNotifs) window.TCOS_closeNotifs();
};

/* ============================================================
   START MENU
   ============================================================ */
(function(){
  var startBtn = document.getElementById('start-btn');
  var menu = document.getElementById('start-menu');
  var list = document.getElementById('sm-list');
  var searchInput = document.getElementById('sm-search-input');

  var items = [
    {app:'about-me', label:'About Me'},
    {app:'projects', label:'Projects'},
    {app:'lab', label:'Lab'},
    {app:'explorer', label:'Explorer'},
    {app:'skills', label:'Skills'},
    {app:'contact', label:'Contact'},
    {app:'taskmanager', label:'Task Manager'},
    {app:'calculator', label:'Calculator'},
    {app:'notepad', label:'Notepad'},
    {app:'deviceinfo', label:'Device Info'},
    {app:'github', label:'GitHub', kind:'link', href:DATA.contact.github},
    {app:'resume', label:'Resume'}
  ];

  var smMode = 'home';
  var pinnedSec = document.getElementById('sm-pinned-sec');
  var pinnedGrid = document.getElementById('sm-pinned');
  var allBtn = document.getElementById('sm-allbtn');

  function smOpenApp(app, kind, href){
    closeMenu();
    if(kind === 'link'){ window.open(href, '_blank', 'noopener'); }
    else WM.open(app);
  }

  function renderPinned(){
    if(!pinnedGrid) return;
    pinnedGrid.innerHTML = '';
    getPinned().forEach(function(appId){
      var label = recentLabel(appId);
      var meta = items.filter(function(i){ return i.app === appId; })[0];
      var b = document.createElement('button');
      b.className = 'sm-app';
      b.innerHTML = '<span class="g">' + recentGlyph(appId) + '</span><span class="lbl">' + esc(label) + '</span>';
      b.addEventListener('click', function(){ smOpenApp(appId, meta && meta.kind, meta && meta.href); });
      pinnedGrid.appendChild(b);
    });
    if(pinnedSec) pinnedSec.classList.toggle('hidden', !getPinned().length && !smMode);
  }

  var SETTINGS_INDEX = [
    {label:'Appearance', section:'personalization'},
    {label:'Theme', section:'personalization'},
    {label:'Wallpaper', section:'personalization'},
    {label:'Taskbar alignment', section:'personalization'},
    {label:'Accent color', section:'personalization'},
    {label:'Notification sounds', section:'system'},
    {label:'Do Not Disturb', section:'system'},
    {label:'Volume', section:'system'},
    {label:'Brightness', section:'system'},
    {label:'Night light', section:'system'},
    {label:'Reset TC/OS data', section:'system'},
    {label:'Installed apps', section:'apps'},
    {label:'Network status', section:'network'},
    {label:'Wi-Fi', section:'network'},
    {label:'Battery', section:'network'},
    {label:'Bluetooth', section:'network'},
    {label:'Airplane mode', section:'network'},
    {label:'Game controllers', section:'gaming'},
    {label:'Storage usage', section:'privacy'},
    {label:'Keyboard shortcuts', section:'accessibility'},
    {label:'Updates', section:'updates'},
    {label:'About this device', section:'about'}
  ];

  function walkFiles(){
    var out = [];
    if(!window.TCOS_fs) return out;
    var guard = 0;
    (function walk(path){
      if(guard++ > 300) return;
      var kids = window.TCOS_fs.list(path) || [];
      kids.forEach(function(k){
        var p = (path === '/' ? '' : path) + '/' + k.name;
        out.push({ node:k, path:p });
        if(k.type === 'dir') walk(p);
      });
    })('/Home');
    return out;
  }
  function openFSNode(node, path){
    if(node.type === 'dir'){
      window.__tcosExplorerOpen = { path:path };
      if(WM.isOpen('explorer')) WM.close('explorer');
      WM.open('explorer');
      return;
    }
    if(node.kind === 'link' && node.app){
      if(node.app === 'github'){ window.open(DATA.contact.github, '_blank', 'noopener'); return; }
      WM.open(node.app);
      return;
    }
    if(node.kind === 'text' || /\.(txt|md|json|log)$/i.test(node.name)){
      window.__tcosOpenFile = { name:node.name, path:path, content:node.content || '' };
      WM.open('notepad');
      return;
    }
    showToast('No viewer for ' + node.kind + ' files yet.');
  }

  function appRow(i){
    var meta = ICON_LIST.filter(function(x){return x.app===i.app;})[0] || {kind:'app'};
    return '<button class="sm-item" data-sm="'+i.app+'"><span class="g">'+iconGlyphFor(meta)+'</span>'+esc(i.label)+'</button>';
  }
  function wireAppRows(scope){
    scope.querySelectorAll('[data-sm]').forEach(function(b){
      b.addEventListener('click', function(){
        var app = b.getAttribute('data-sm');
        var meta = items.filter(function(i){return i.app===app;})[0];
        smOpenApp(app, meta && meta.kind, meta && meta.href);
      });
    });
  }

  function renderList(filter){
    var f = (filter||'').toLowerCase();
    if(!f && smMode === 'home'){
      list.classList.add('hidden');
      renderPinned();
      if(pinnedSec) pinnedSec.classList.remove('hidden');
      renderRecent();
      return;
    }
    if(pinnedSec) pinnedSec.classList.add('hidden');
    if(!f && smMode === 'all'){
      list.classList.remove('hidden');
      list.innerHTML = items.map(appRow).join('');
      wireAppRows(list);
      renderRecent();
      return;
    }
    /* categorized search */
    list.classList.remove('hidden');
    var apps = items.filter(function(i){ return i.label.toLowerCase().indexOf(f)>-1; });
    var files = walkFiles().filter(function(w){ return w.node.name.toLowerCase().indexOf(f)>-1; }).slice(0, 8);
    var sets = SETTINGS_INDEX.filter(function(s){ return s.label.toLowerCase().indexOf(f)>-1; }).slice(0, 5);
    if(!apps.length && !files.length && !sets.length){
      list.innerHTML = '<div class="sm-empty">No matches in TC/OS.</div>';
      return;
    }
    var html = '';
    if(apps.length) html += '<div class="sm-cat-label">Apps</div>' + apps.map(appRow).join('');
    if(files.length) html += '<div class="sm-cat-label">Files</div>' + files.map(function(w, k){
      return '<button class="sm-item" data-fx="' + k + '"><span class="g">' + recentGlyph('explorer') + '</span>' + esc(w.node.name) + '</button>';
    }).join('');
    if(sets.length) html += '<div class="sm-cat-label">Settings</div>' + sets.map(function(s, k){
      return '<button class="sm-item" data-ss="' + k + '">' + esc(s.label) + '</button>';
    }).join('');
    list.innerHTML = html;
    wireAppRows(list);
    list.querySelectorAll('[data-fx]').forEach(function(b){
      b.addEventListener('click', function(){
        var w = files[parseInt(b.getAttribute('data-fx'), 10)];
        closeMenu();
        if(w) openFSNode(w.node, w.path);
      });
    });
    list.querySelectorAll('[data-ss]').forEach(function(b){
      b.addEventListener('click', function(){
        var s = sets[parseInt(b.getAttribute('data-ss'), 10)];
        closeMenu();
        if(s){ window.__tcosSettingsSection = s.section; WM.open('settings'); }
      });
    });
  }
  renderList('');

  /* recently opened (max 5, most recent first, persisted) */
  var recentIds = [];
  try {
    var savedRecent = JSON.parse(localStorage.getItem('tcos-recent') || '[]');
    if(savedRecent && savedRecent.length) recentIds = savedRecent.filter(function(id){ return !!APPS[id]; }).slice(0, 5);
  } catch(e){}
  var recentBox = document.getElementById('sm-recent');
  var recentRow = document.getElementById('sm-recent-row');
  function recentGlyph(appId){
    var meta = ICON_LIST.filter(function(x){ return x.app === appId; })[0];
    if(meta) return iconGlyphFor(meta);
    if(appId.indexOf('project-') === 0) return glyph('file', 'case', 'var(--purple)');
    return glyph('app');
  }
  function recentLabel(appId){
    var found = items.filter(function(i){ return i.app === appId; })[0];
    if(found) return found.label;
    var app = APPS[appId];
    return app ? app.title : appId;
  }
  function renderRecent(){
    if(!recentBox || !recentRow) return;
    if(!recentIds.length){ recentBox.classList.add('hidden'); recentRow.innerHTML = ''; return; }
    recentBox.classList.remove('hidden');
    recentRow.innerHTML = '';
    recentIds.forEach(function(appId){
      var chip = document.createElement('button');
      chip.className = 'sm-recent-chip';
      chip.innerHTML = '<span class="g">' + recentGlyph(appId) + '</span><span class="lbl">' + esc(recentLabel(appId)) + '</span>';
      chip.addEventListener('click', function(){
        var meta = items.filter(function(i){ return i.app === appId; })[0];
        closeMenu();
        if(meta && meta.kind === 'link'){ window.open(meta.href, '_blank', 'noopener'); }
        else WM.open(appId);
      });
      recentRow.appendChild(chip);
    });
  }
  var wmOpen = WM.open.bind(WM);
  WM.open = function(appId){
    recentIds = [appId].concat(recentIds.filter(function(id){ return id !== appId; })).slice(0, 5);
    try { localStorage.setItem('tcos-recent', JSON.stringify(recentIds)); } catch(e){}
    renderRecent();
    return wmOpen(appId);
  };
  renderRecent();

  function openMenu(){
    if(window.TCOS_closePopups) window.TCOS_closePopups('start');
    menu.classList.add('open');
    startBtn.classList.add('active');
    startBtn.setAttribute('aria-expanded','true');
    searchInput.value='';
    smMode = 'home';
    if(allBtn) allBtn.textContent = 'All apps ›';
    renderList('');
    setTimeout(function(){ searchInput.focus(); }, 60);
  }
  function closeMenu(){
    menu.classList.remove('open');
    startBtn.classList.remove('active');
    startBtn.setAttribute('aria-expanded','false');
    var pm = document.getElementById('sm-power-menu');
    if(pm) pm.classList.add('hidden');
    var pb = document.getElementById('sm-power');
    if(pb) pb.setAttribute('aria-expanded','false');
  }
  startBtn.addEventListener('click', function(e){
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });
  searchInput.addEventListener('input', function(){ renderList(searchInput.value); });
  if(allBtn) allBtn.addEventListener('click', function(e){
    e.stopPropagation();
    if(smMode === 'all'){ smMode = 'home'; allBtn.textContent = 'All apps ›'; }
    else { smMode = 'all'; allBtn.textContent = '‹ Back'; }
    searchInput.value = '';
    renderList('');
  });
  document.addEventListener('click', function(e){
    if(menu.classList.contains('open') && !menu.contains(e.target) && e.target!==startBtn){ closeMenu(); }
  });
  document.getElementById('sm-settings').addEventListener('click', function(){
    closeMenu();
    WM.open('settings');
  });
  document.getElementById('sm-power').addEventListener('click', function(e){
    e.stopPropagation();
    var pm = document.getElementById('sm-power-menu');
    var open = pm.classList.toggle('hidden');
    document.getElementById('sm-power').setAttribute('aria-expanded', open ? 'false' : 'true');
  });
  document.querySelectorAll('[data-power]').forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      closeMenu();
      var act = b.getAttribute('data-power');
      if(act === 'shutdown') window.TCOS_shutdown();
      else if(act === 'restart') window.TCOS_restart();
      else if(act === 'sleep') window.TCOS_lock();
    });
  });

  window.TCOS_closeStart = closeMenu;
})();

/* ============================================================
   POWER — shutdown / restart
   ============================================================ */
(function(){
  var screen = document.getElementById('power-screen');
  var text = document.getElementById('power-screen-text');
  var reopenBtn = document.getElementById('power-reopen');
  var timers = [];

  function clearTimers(){ timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = []; }

  /* cycles "Base", "Base.", "Base..", "Base..." until stopped */
  function dots(base){
    var n = 0;
    text.textContent = base;
    var iv = setInterval(function(){
      n = (n + 1) % 4;
      text.textContent = base + new Array(n + 1).join('.');
    }, 320);
    timers.push(iv);
  }

  function show(){ screen.classList.remove('hidden'); }
  function hide(){
    clearTimers();
    screen.classList.add('hidden');
    screen.classList.remove('off');
    reopenBtn.classList.add('hidden');
  }

  window.TCOS_shutdown = function(){
    if(window.TCOS_closeStart) window.TCOS_closeStart();
    reopenBtn.classList.add('hidden');
    screen.classList.remove('off');
    show();
    dots('TC/OS is shutting down');
    timers.push(setTimeout(function(){
      clearTimers();
      screen.classList.add('off');
      text.textContent = 'TC/OS is off';
      reopenBtn.classList.remove('hidden');
      try { reopenBtn.focus({preventScroll:true}); } catch(e){ try { reopenBtn.focus(); } catch(err){} }
    }, 1600));
  };

  window.TCOS_restart = function(){
    if(window.TCOS_closeStart) window.TCOS_closeStart();
    reopenBtn.classList.add('hidden');
    screen.classList.remove('off');
    show();
    dots('Restarting');
    timers.push(setTimeout(function(){ window.location.reload(); }, 2000));
  };

  reopenBtn.addEventListener('click', function(){
    hide();
    window.TCOS_boot();
    setTimeout(function(){ if(window.TCOS_startupSound) window.TCOS_startupSound(); }, 900);
  });
})();

/* ============================================================
   CLOCK FLYOUT
   ============================================================ */
(function(){
  var fly = document.getElementById('clock-flyout');
  var grid = document.getElementById('cal-grid');
  var title = document.getElementById('cal-title');
  var clockBtn = document.getElementById('tb-clock');
  if(!fly || !grid || !clockBtn) return;
  var view = new Date();
  view.setDate(1);

  function render(){
    var y = view.getFullYear(), m = view.getMonth();
    title.textContent = view.toLocaleDateString([], {month:'long', year:'numeric'});
    var first = new Date(y, m, 1).getDay();
    var days = new Date(y, m + 1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();
    var today = new Date();
    var html = ['S','M','T','W','T','F','S'].map(function(d){ return '<span class="cal-dow">' + d + '</span>'; }).join('');
    var n = 0;
    function cell(day, dim, isToday){
      return '<span class="cal-day' + (dim ? ' dim' : '') + (isToday ? ' today' : '') + '">' + day + '</span>';
    }
    for(var i = first - 1; i >= 0; i--) { html += cell(prevDays - i, true, false); n++; }
    for(var d = 1; d <= days; d++){
      html += cell(d, false, d === today.getDate() && m === today.getMonth() && y === today.getFullYear());
      n++;
    }
    for(var t = 1; n < 42; t++){ html += cell(t, true, false); n++; }
    grid.innerHTML = html;
  }

  function toggle(){ fly.classList.toggle('hidden'); }
  function close(){ fly.classList.add('hidden'); }
  window.TCOS_closeClock = close;

  clockBtn.addEventListener('click', function(e){
    e.stopPropagation();
    if(fly.classList.contains('hidden')){
      if(window.TCOS_closePopups) window.TCOS_closePopups('clock');
      view = new Date();
      view.setDate(1);
      render();
    }
    toggle();
  });
  document.getElementById('cal-prev').addEventListener('click', function(){ view.setMonth(view.getMonth() - 1); render(); });
  document.getElementById('cal-next').addEventListener('click', function(){ view.setMonth(view.getMonth() + 1); render(); });
  document.getElementById('cal-today').addEventListener('click', function(){ view = new Date(); view.setDate(1); render(); });
  document.addEventListener('click', function(e){
    if(!fly.classList.contains('hidden') && !fly.contains(e.target)) close();
  });
})();

/* ============================================================
   LOCK / SECURITY SCREEN / ALT+TAB
   ============================================================ */
(function(){
  var lockEl = document.getElementById('lock-screen');
  var cadEl = document.getElementById('cad-screen');
  var altabEl = document.getElementById('altab');
  var altabRow = document.getElementById('altab-row');
  if(!lockEl || !cadEl || !altabEl) return;

  function locked(){ return !lockEl.classList.contains('hidden'); }
  window.TCOS_isLocked = locked;
  window.TCOS_lock = function(){
    if(window.TCOS_closeStart) window.TCOS_closeStart();
    if(window.TCOS_closeNotifs) window.TCOS_closeNotifs();
    if(window.TCOS_closeClock) window.TCOS_closeClock();
    if(window.TCOS_closeTray) window.TCOS_closeTray();
    lockEl.classList.remove('hidden');
  };
  function unlock(){
    if(!locked()) return;
    lockEl.classList.add('hidden');
  }
  lockEl.addEventListener('click', unlock);
  document.addEventListener('keydown', function h(e){
    if(locked()){ unlock(); }
  });

  function hideCad(){ cadEl.classList.add('hidden'); }
  window.TCOS_cad = function(){
    if(locked()) return;
    if(window.TCOS_closeStart) window.TCOS_closeStart();
    cadEl.classList.remove('hidden');
  };
  cadEl.querySelectorAll('[data-cad]').forEach(function(b){
    b.addEventListener('click', function(){
      var act = b.getAttribute('data-cad');
      hideCad();
      if(act === 'lock') window.TCOS_lock();
      else if(act === 'taskmanager'){
        if(isMobile() && window.TCOS_openMobile) window.TCOS_openMobile('taskmanager', 'Task Manager');
        else WM.open('taskmanager');
      }
      else if(act === 'shutdown') window.TCOS_shutdown();
      else if(act === 'restart') window.TCOS_restart();
    });
  });
  cadEl.addEventListener('click', function(e){ if(e.target === cadEl) hideCad(); });

  /* alt+tab */
  var ids = [], idx = 0, altDown = false;
  function iconFor(id){
    var meta = ICON_LIST.filter(function(x){ return x.app === id; })[0];
    if(meta) return iconGlyphFor(meta);
    if(id.indexOf('project-') === 0) return glyph('file', 'case', 'var(--purple)');
    return glyph('app');
  }
  function labelFor(id){
    var meta = ICON_LIST.filter(function(x){ return x.app === id; })[0];
    if(meta) return meta.label;
    var app = APPS[id];
    return app ? app.title : id;
  }
  function paint(){
    altabRow.innerHTML = '';
    ids.forEach(function(id, i){
      var d = document.createElement('div');
      d.className = 'altab-app' + (i === idx ? ' active' : '');
      d.innerHTML = '<span class="g">' + iconFor(id) + '</span><span class="t">' + esc(labelFor(id)) + '</span>';
      altabRow.appendChild(d);
    });
  }
  window.TCOS_altab = function(){
    if(locked() || isMobile()) return;
    ids = WM.list().map(function(w){ return w.id; });
    if(!ids.length){ showToast('No open windows.'); return; }
    idx = 0;
    altDown = true;
    paint();
    altabEl.classList.remove('hidden');
  };
  window.TCOS_altabNext = function(){
    if(altabEl.classList.contains('hidden')) return;
    idx = (idx + 1) % ids.length;
    paint();
  };
  function altabDone(){
    if(altabEl.classList.contains('hidden')) return;
    altabEl.classList.add('hidden');
    altDown = false;
    if(ids[idx]) WM.focus(ids[idx]);
    ids = [];
  }
  document.addEventListener('keyup', function(e){
    if(e.key === 'Alt' && altDown) altabDone();
    if(e.key === 'Escape' && !cadEl.classList.contains('hidden')) hideCad();
  });
})();

/* ============================================================
   UAC — permission confirm dialog
   ============================================================ */
(function(){
  var screen = document.getElementById('uac-screen');
  var text = document.getElementById('uac-text');
  var yesBtn = document.getElementById('uac-yes');
  var noBtn = document.getElementById('uac-no');
  if(!screen) return;
  var cb = null;
  function done(ok){
    screen.classList.add('hidden');
    var fn = cb;
    cb = null;
    if(fn) fn(ok);
  }
  window.TCOS_uac = function(appName, callback){
    cb = callback || null;
    text.textContent = 'Do you want to allow ' + appName + ' to run as administrator?';
    screen.classList.remove('hidden');
    try { noBtn.focus({preventScroll:true}); } catch(e){}
  };
  window.TCOS_uacCancel = function(){
    if(!screen.classList.contains('hidden')) done(false);
  };
  yesBtn.addEventListener('click', function(){ done(true); });
  noBtn.addEventListener('click', function(){ done(false); });
})();

/* ============================================================
   CONTEXT MENU
   ============================================================ */
(function(){
  var menu = document.getElementById('ctx-menu');
  var desktop = document.getElementById('desktop');

  desktop.addEventListener('contextmenu', function(e){
    if(e.target.closest('.window')) return;
    e.preventDefault();
    var icon = e.target.closest('.dicon');
    menu.classList.remove('pin-mode');
    menu.classList.remove('task-mode');
    if(icon){
      var app = icon.getAttribute('data-app');
      menu._pinApp = app;
      var pinBtn = document.getElementById('ctx-pin');
      if(pinBtn) pinBtn.firstChild.textContent = (window.TCOS_isPinned(app) ? 'Unpin from taskbar' : 'Pin to taskbar');
      menu.classList.add('pin-mode');
    }
    var x = Math.min(e.clientX, window.innerWidth-220);
    var y = Math.min(e.clientY, window.innerHeight-220);
    menu.style.left = x+'px';
    menu.style.top = y+'px';
    menu.classList.add('open');
  });
  document.addEventListener('click', function(){ menu.classList.remove('open'); menu.classList.remove('pin-mode'); menu.classList.remove('task-mode'); });
  document.addEventListener('contextmenu', function(e){
    if(!e.target.closest('#desktop')){ menu.classList.remove('open'); menu.classList.remove('pin-mode'); menu.classList.remove('task-mode'); }
  });

  menu.querySelectorAll('.ctx-item').forEach(function(item){
    item.addEventListener('click', function(){
      var act = item.getAttribute('data-ctx');
      menu.classList.remove('open');
      menu.classList.remove('pin-mode');
      menu.classList.remove('task-mode');
      if(act==='pin'){
        var app = menu._pinApp;
        if(app){
          if(window.TCOS_isPinned(app)) window.TCOS_unpinApp(app);
          else window.TCOS_pinApp(app);
          if(WM.refresh) WM.refresh();
        }
      }
      else if(act==='tb-focus'){
        var fid = menu._taskApp;
        if(fid){ if(WM.isOpen(fid)) WM.focus(fid); else WM.open(fid); }
      }
      else if(act==='tb-min'){
        var mid = menu._taskApp;
        if(mid && WM.isOpen(mid)) WM.minimize(mid);
      }
      else if(act==='tb-close'){
        var cid = menu._taskApp;
        if(cid && WM.isOpen(cid)) WM.close(cid);
      }
      else if(act==='new') showToast('New \u2014 not available in this build.');
      else if(act==='refresh') showToast('Desktop refreshed.');
      else if(act==='terminal') WM.open('terminal');
      else if(act==='personalize'){ window.__tcosSettingsSection = 'personalization'; WM.open('settings'); }
      else if(act==='display'){ window.__tcosSettingsSection = 'system'; WM.open('settings'); }
      else if(act==='source') window.open('https://github.com/toniec/toniec.github.io','_blank','noopener');
      else if(act==='sysinfo') WM.open('sysinfo');
    });
  });
})();

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg){
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(function(){ t.classList.remove('show'); }, 2200);
}
