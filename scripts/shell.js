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
}
tickClock();
setInterval(tickClock, 1000);

/* taskbar wifi status */
(function(){
  var wifi = document.getElementById('tb-wifi');
  if(!wifi) return;
  function paint(){
    var online = navigator.onLine !== false;
    wifi.classList.toggle('offline', !online);
    wifi.setAttribute('aria-label', online ? 'Online' : 'Offline');
    wifi.title = online ? 'Online' : 'Offline — changes are saved locally';
  }
  window.addEventListener('online', paint);
  window.addEventListener('offline', paint);
  paint();
})();

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
    {app:'skills', label:'Skills'},
    {app:'contact', label:'Contact'},
    {app:'taskmanager', label:'Task Manager'},
    {app:'calculator', label:'Calculator'},
    {app:'notepad', label:'Notepad'},
    {app:'deviceinfo', label:'Device Info'},
    {app:'github', label:'GitHub', kind:'link', href:DATA.contact.github},
    {app:'resume', label:'Resume'}
  ];

  function renderList(filter){
    var f = (filter||'').toLowerCase();
    var filtered = items.filter(function(i){ return i.label.toLowerCase().indexOf(f)>-1; });
    if(!filtered.length){ list.innerHTML = '<div class="sm-empty">No matches in TC/OS.</div>'; return; }
    list.innerHTML = filtered.map(function(i){
      var meta = ICON_LIST.filter(function(x){return x.app===i.app;})[0] || {kind:'app'};
      return '<button class="sm-item" data-sm="'+i.app+'"><span class="g">'+iconGlyphFor(meta)+'</span>'+esc(i.label)+'</button>';
    }).join('');
    list.querySelectorAll('[data-sm]').forEach(function(b){
      b.addEventListener('click', function(){
        var app = b.getAttribute('data-sm');
        var meta = items.filter(function(i){return i.app===app;})[0];
        closeMenu();
        if(meta && meta.kind==='link'){ window.open(meta.href,'_blank','noopener'); }
        else WM.open(app);
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
    menu.classList.add('open');
    startBtn.classList.add('active');
    startBtn.setAttribute('aria-expanded','true');
    searchInput.value='';
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
  document.addEventListener('click', function(){ menu.classList.remove('open'); menu.classList.remove('pin-mode'); });
  document.addEventListener('contextmenu', function(e){
    if(!e.target.closest('#desktop')){ menu.classList.remove('open'); menu.classList.remove('pin-mode'); }
  });

  menu.querySelectorAll('.ctx-item').forEach(function(item){
    item.addEventListener('click', function(){
      var act = item.getAttribute('data-ctx');
      menu.classList.remove('open');
      menu.classList.remove('pin-mode');
      if(act==='pin'){
        var app = menu._pinApp;
        if(app){
          if(window.TCOS_isPinned(app)) window.TCOS_unpinApp(app);
          else window.TCOS_pinApp(app);
          if(WM.refresh) WM.refresh();
        }
      }
      else if(act==='new') showToast('New \u2014 not available in this build.');
      else if(act==='refresh') showToast('Desktop refreshed.');
      else if(act==='terminal') WM.open('terminal');
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
