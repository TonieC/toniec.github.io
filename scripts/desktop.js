'use strict';
/* ============================================================
   TASKBAR PINS (persisted, defaults: About + Settings)
   ============================================================ */
var PIN_DEFAULTS = ['about-me', 'settings'];
function getPinned(){
  try {
    var saved = JSON.parse(localStorage.getItem('tcos-pinned') || 'null');
    if(Array.isArray(saved)) return saved.filter(function(id){ return !!APPS[id]; });
  } catch(e){}
  return PIN_DEFAULTS.slice();
}
function savePinned(list){
  try { localStorage.setItem('tcos-pinned', JSON.stringify(list)); } catch(e){}
}
function pinLabel(app){
  var meta = ICON_LIST.filter(function(x){ return x.app === app; })[0];
  if(meta) return meta.label;
  var app2 = APPS[app];
  return app2 ? app2.title : app;
}
window.TCOS_isPinned = function(app){ return getPinned().indexOf(app) > -1; };
window.TCOS_pinApp = function(app){
  if(!APPS[app]) return;
  var list = getPinned();
  if(list.indexOf(app) === -1){
    list.push(app);
    savePinned(list);
    showToast(pinLabel(app) + ' pinned to taskbar.');
  }
};
window.TCOS_unpinApp = function(app){
  var list = getPinned().filter(function(id){ return id !== app; });
  savePinned(list);
  showToast(pinLabel(app) + ' unpinned.');
};

/* ============================================================
   WINDOW MANAGER (desktop / tablet)
   ============================================================ */
var WM = (function(){
  var layer = document.getElementById('windows-layer');
  var taskbarApps = document.getElementById('taskbar-apps');
  var windows = {}; // id -> state
  var zTop = 10;
  var openOrder = [];
  var cascadeN = 0;

  function label(appId){
    var app = APPS[appId];
    return app ? app.title : appId;
  }

  function ctxFor(appId, winId){
    return {
      openApp: function(id){ open(id); },
      closeSelf: function(){ close(winId); }
    };
  }

  function open(appId){
    if(appId === 'github'){
      window.open(DATA.contact.github, '_blank', 'noopener');
      return;
    }
    if(windows[appId]){
      restore(appId);
      focus(appId);
      return;
    }
    var app = APPS[appId];
    if(!app) return;

    var winId = appId;
    var w = Math.min(560, Math.max(360, window.innerWidth*0.42));
    var h = Math.min(560, Math.max(360, window.innerHeight*0.6));
    var baseX = 90 + (cascadeN%6)*32;
    var baseY = 70 + (cascadeN%6)*28;
    cascadeN++;

    var el = document.createElement('div');
    el.className = 'window';
    el.style.left = baseX+'px';
    el.style.top = baseY+'px';
    el.style.width = w+'px';
    el.style.height = h+'px';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-label', app.title);
    el.setAttribute('tabindex','-1');

    el.innerHTML =
      '<div class="win-titlebar" data-role="drag">'+
        '<span class="win-ttl-icon">'+iconGlyphForApp(appId)+'</span>'+
        '<span class="win-title">'+esc(app.title)+'</span>'+
        '<div class="win-controls">'+
          '<button class="win-btn" data-act="min" aria-label="Minimize"><svg viewBox="0 0 12 12"><rect y="5.2" width="12" height="1.6" fill="currentColor"/></svg></button>'+
          '<button class="win-btn" data-act="max" aria-label="Maximize"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="1.5" width="9" height="9"/></svg></button>'+
          '<button class="win-btn win-close" data-act="close" aria-label="Close"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2l8 8M10 2l-8 8"/></svg></button>'+
        '</div>'+
      '</div>'+
      '<div class="win-body"></div>'+
      '<div class="win-resize" aria-hidden="true"></div>';

    layer.appendChild(el);
    var body = el.querySelector('.win-body');
    body.innerHTML = app.render();
    if(app.init) app.init(body, ctxFor(appId, winId));

    windows[appId] = { el:el, minimized:false, maximized:false, prevRect:null, opener:(document.activeElement && document.activeElement !== document.body) ? document.activeElement : null };
    openOrder.push(appId);

    wireWindow(appId);
    focus(appId);
    try { el.focus({preventScroll:true}); } catch(e){ try { el.focus(); } catch(err){} }
    renderTaskbar();
  }

  function iconGlyphForApp(appId){
    var meta = ICON_LIST.filter(function(i){return i.app===appId;})[0];
    if(meta) return iconGlyphFor(meta);
    if(appId.indexOf('project-')===0) return glyph('file','case','var(--purple)');
    return glyph('app');
  }

  function wireWindow(appId){
    var st = windows[appId];
    var el = st.el;
    var titlebar = el.querySelector('.win-titlebar');
    var resize = el.querySelector('.win-resize');

    el.addEventListener('mousedown', function(){ focus(appId); });
    el.addEventListener('touchstart', function(){ focus(appId); }, {passive:true});

    el.querySelector('[data-act="close"]').addEventListener('click', function(e){ e.stopPropagation(); close(appId); });
    el.querySelector('[data-act="min"]').addEventListener('click', function(e){ e.stopPropagation(); minimize(appId); });
    el.querySelector('[data-act="max"]').addEventListener('click', function(e){ e.stopPropagation(); toggleMax(appId); });
    titlebar.addEventListener('dblclick', function(){ toggleMax(appId); });

    /* drag */
    var dragging=false, sx=0, sy=0, ox=0, oy=0;
    function dragStart(x,y){
      if(st.maximized) return;
      dragging=true; sx=x; sy=y;
      var r = el.getBoundingClientRect();
      var deskR = document.getElementById('desktop').getBoundingClientRect();
      ox = r.left - deskR.left; oy = r.top - deskR.top;
      el.classList.add('dragging');
      focus(appId);
    }
    function dragMove(x,y){
      if(!dragging) return;
      var dx=x-sx, dy=y-sy;
      var nx = Math.max(-40, ox+dx);
      var ny = Math.max(0, Math.min(oy+dy, window.innerHeight - 60 - 40));
      el.style.left = nx+'px';
      el.style.top = ny+'px';
    }
    function dragEnd(){ dragging=false; el.classList.remove('dragging'); }

    titlebar.addEventListener('mousedown', function(e){ if(e.target.closest('.win-btn')) return; dragStart(e.clientX,e.clientY); });
    window.addEventListener('mousemove', function(e){ dragMove(e.clientX,e.clientY); });
    window.addEventListener('mouseup', dragEnd);

    titlebar.addEventListener('touchstart', function(e){
      if(e.target.closest('.win-btn')) return;
      var t=e.touches[0]; dragStart(t.clientX,t.clientY);
    }, {passive:true});
    window.addEventListener('touchmove', function(e){
      if(!dragging) return;
      var t=e.touches[0]; dragMove(t.clientX,t.clientY);
    }, {passive:true});
    window.addEventListener('touchend', dragEnd);

    /* resize */
    if(resize){
      var resizing=false, rsx=0, rsy=0, rw=0, rh=0;
      function rStart(x,y){
        if(st.maximized) return;
        resizing=true; rsx=x; rsy=y;
        rw = el.offsetWidth; rh = el.offsetHeight;
        el.classList.add('resizing');
      }
      function rMove(x,y){
        if(!resizing) return;
        var dw = x-rsx, dh=y-rsy;
        el.style.width = Math.max(300, rw+dw)+'px';
        el.style.height = Math.max(220, rh+dh)+'px';
      }
      function rEnd(){ resizing=false; el.classList.remove('resizing'); }
      resize.addEventListener('mousedown', function(e){ e.stopPropagation(); rStart(e.clientX,e.clientY); });
      window.addEventListener('mousemove', function(e){ rMove(e.clientX,e.clientY); });
      window.addEventListener('mouseup', rEnd);
      resize.addEventListener('touchstart', function(e){ e.stopPropagation(); var t=e.touches[0]; rStart(t.clientX,t.clientY); }, {passive:true});
      window.addEventListener('touchmove', function(e){ if(!resizing) return; var t=e.touches[0]; rMove(t.clientX,t.clientY); }, {passive:true});
      window.addEventListener('touchend', rEnd);
    }
  }

  function focus(appId){
    var st = windows[appId];
    if(!st) return;
    if(st.minimized) restore(appId);
    zTop++;
    st.el.style.zIndex = zTop;
    Object.keys(windows).forEach(function(id){ windows[id].el.classList.toggle('active', id===appId); });
    renderTaskbar(appId);
  }

  function minimize(appId){
    var st = windows[appId]; if(!st) return;
    st.minimized = true;
    st.el.style.display = 'none';
    renderTaskbar();
  }
  function restore(appId){
    var st = windows[appId]; if(!st) return;
    st.minimized = false;
    st.el.style.display = 'flex';
  }
  function toggleMax(appId){
    var st = windows[appId]; if(!st) return;
    var el = st.el;
    var desk = document.getElementById('desktop');
    if(!st.maximized){
      st.prevRect = { left:el.style.left, top:el.style.top, width:el.style.width, height:el.style.height };
      el.style.left='0px'; el.style.top='0px';
      el.style.width='100%'; el.style.height = (window.innerHeight - 52) + 'px';
      el.classList.add('maximized');
      st.maximized = true;
    } else {
      var pr = st.prevRect;
      if(pr){ el.style.left=pr.left; el.style.top=pr.top; el.style.width=pr.width; el.style.height=pr.height; }
      el.classList.remove('maximized');
      st.maximized = false;
    }
    focus(appId);
  }
  function close(appId){
    var st = windows[appId]; if(!st) return;
    var opener = st.opener;
    st.el.remove();
    delete windows[appId];
    openOrder = openOrder.filter(function(id){return id!==appId;});
    renderTaskbar();
    if(opener && opener.isConnected){
      try { opener.focus({preventScroll:true}); } catch(e){ try { opener.focus(); } catch(err){} }
    }
  }

  function openPinned(id){
    var meta = ICON_LIST.filter(function(x){ return x.app === id; })[0];
    if(meta && meta.kind === 'link'){ window.open(meta.href, '_blank', 'noopener'); return; }
    open(id);
  }

  function renderTaskbar(activeId){
    taskbarApps.innerHTML = '';
    getPinned().forEach(function(id){
      if(windows[id] || !APPS[id]) return;
      var btn = document.createElement('button');
      btn.className = 'tb-app pinned';
      btn.setAttribute('aria-label', 'Open ' + pinLabel(id));
      btn.innerHTML = '<span class="dot" aria-hidden="true"></span><span>'+esc(pinLabel(id))+'</span>';
      btn.addEventListener('click', function(){ openPinned(id); });
      btn.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
        window.TCOS_unpinApp(id);
        renderTaskbar(activeId);
      });
      taskbarApps.appendChild(btn);
    });
    openOrder.forEach(function(id){
      var st = windows[id];
      if(!st) return;
      var btn = document.createElement('button');
      btn.className = 'tb-app'+(id===activeId?' active':'')+(st.minimized?' minimized':'');
      btn.innerHTML = '<span class="dot"></span><span>'+esc(label(id))+'</span>';
      btn.addEventListener('click', function(){
        if(st.minimized){ restore(id); focus(id); }
        else if(id===activeId){ minimize(id); }
        else { focus(id); }
      });
      btn.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
        if(window.TCOS_isPinned(id)) window.TCOS_unpinApp(id);
        else window.TCOS_pinApp(id);
        renderTaskbar(activeId);
      });
      taskbarApps.appendChild(btn);
    });
  }

  window.addEventListener('resize', function(){
    Object.keys(windows).forEach(function(id){
      var st = windows[id];
      if(st.maximized){ st.el.style.height = (window.innerHeight-52)+'px'; }
    });
  });

  renderTaskbar();

  return { open:open, close:close, minimize:minimize, focus:focus, isOpen:function(id){return !!windows[id];}, refresh:function(){ renderTaskbar(); }, list:function(){ return openOrder.map(function(id){ var st = windows[id]; return st ? {id:id, title:label(id), minimized:st.minimized, maximized:st.maximized} : null; }).filter(function(x){return !!x;}); } };
})();

/* ============================================================
   DESKTOP ICONS
   ============================================================ */
(function(){
  var wrap = document.getElementById('desktop-icons');
  ICON_LIST.forEach(function(item){
    var btn = document.createElement('button');
    btn.className = 'dicon';
    btn.setAttribute('data-app', item.app);
    btn.innerHTML = '<span class="dicon-glyph">'+iconGlyphFor(item)+'</span><span class="dicon-label">'+esc(item.label)+'</span>';
    btn.addEventListener('click', function(e){
      document.querySelectorAll('.dicon').forEach(function(d){d.classList.remove('selected');});
      btn.classList.add('selected');
    });
    btn.addEventListener('dblclick', function(){ launch(item.app, item); });
    btn.addEventListener('keydown', function(e){
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); launch(item.app, item); }
    });
    wrap.appendChild(btn);
  });

  function launch(app, item){
    if(item && item.kind==='link'){ window.open(item.href,'_blank','noopener'); return; }
    WM.open(app);
  }

  document.getElementById('desktop').addEventListener('click', function(e){
    if(!e.target.closest('.dicon')) document.querySelectorAll('.dicon').forEach(function(d){d.classList.remove('selected');});
  });

  /* Windows-style click + drag marquee selection */
  (function(){
    var desktop = document.getElementById('desktop');
    var box = null, sx = 0, sy = 0, dragging = false;

    desktop.addEventListener('mousedown', function(e){
      if(e.button !== 0) return;
      if(e.target.closest('.dicon') || e.target.closest('.window')) return;
      var r = desktop.getBoundingClientRect();
      sx = e.clientX - r.left;
      sy = e.clientY - r.top;
      dragging = false;
      box = document.createElement('div');
      box.className = 'marquee-select';
      box.style.left = sx + 'px';
      box.style.top = sy + 'px';
      box.style.width = '0px';
      box.style.height = '0px';
      desktop.appendChild(box);

      function move(ev){
        var dx = ev.clientX - r.left - sx;
        var dy = ev.clientY - r.top - sy;
        if(Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        dragging = true;
        box.style.display = 'block';
        box.style.left = (dx < 0 ? sx + dx : sx) + 'px';
        box.style.top = (dy < 0 ? sy + dy : sy) + 'px';
        box.style.width = Math.abs(dx) + 'px';
        box.style.height = Math.abs(dy) + 'px';
        var bx = parseFloat(box.style.left), by = parseFloat(box.style.top);
        var bw = parseFloat(box.style.width), bh = parseFloat(box.style.height);
        document.querySelectorAll('.dicon').forEach(function(d){
          var dr = d.getBoundingClientRect();
          var ix = dr.left - r.left, iy = dr.top - r.top;
          var hit = ix < bx + bw && ix + dr.width > bx && iy < by + bh && iy + dr.height > by;
          d.classList.toggle('selected', hit);
        });
        ev.preventDefault();
      }
      function up(){
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        if(box) box.remove();
        box = null;
        if(!dragging){
          document.querySelectorAll('.dicon').forEach(function(d){d.classList.remove('selected');});
        }
        dragging = false;
      }
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    });
  })();
})();

/* ============================================================
   DESKTOP ICON DRAG-REORDER + AUTO-ARRANGE
   ============================================================ */
(function(){
  var wrap = document.getElementById('desktop-icons');
  var desktop = document.getElementById('desktop');
  if(!wrap || !desktop) return;

  /* restore saved order */
  try {
    var saved = JSON.parse(localStorage.getItem('tcos-dicon-order') || '[]');
    if(saved && saved.length){
      var map = {};
      Array.prototype.forEach.call(wrap.children, function(b){ map[b.getAttribute('data-app')] = b; });
      saved.forEach(function(app){ if(map[app]) wrap.appendChild(map[app]); });
    }
  } catch(e){}

  function saveOrder(){
    try {
      var order = Array.prototype.map.call(wrap.children, function(b){ return b.getAttribute('data-app'); });
      localStorage.setItem('tcos-dicon-order', JSON.stringify(order));
    } catch(e){}
  }

  /* keep icons inside the visible desktop on resize */
  function clampOverflow(){
    var r = desktop.getBoundingClientRect();
    if(r.width < 200) arrangeTop();
  }
  function arrangeTop(){
    /* grid auto-flows from top-left; clearing inline offsets re-packs */
    Array.prototype.forEach.call(wrap.children, function(b){
      b.style.transform = '';
    });
  }
  window.addEventListener('resize', clampOverflow);

  var dragEl = null, sx = 0, sy = 0, active = false;

  function clearTargets(){
    wrap.querySelectorAll('.drop-target').forEach(function(c){ c.classList.remove('drop-target'); });
  }

  function suppressClick(){
    var h = function(ev){ ev.stopPropagation(); ev.preventDefault(); window.removeEventListener('click', h, true); };
    window.addEventListener('click', h, true);
    setTimeout(function(){ window.removeEventListener('click', h, true); }, 80);
  }

  wrap.addEventListener('mousedown', function(e){
    if(e.button !== 0) return;
    if(window.TCOS_autoArrange === false) return;
    var t = e.target.closest('.dicon');
    if(!t) return;
    sx = e.clientX; sy = e.clientY;
    dragEl = t; active = false;

    function move(ev){
      if(!dragEl) return;
      if(!active){
        if(Math.abs(ev.clientX - sx) < 6 && Math.abs(ev.clientY - sy) < 6) return;
        active = true;
        dragEl.classList.add('dragging');
      }
      var dx = ev.clientX - sx, dy = ev.clientY - sy;
      dragEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      var sibs = Array.prototype.filter.call(wrap.children, function(c){ return c !== dragEl; });
      var placed = false;
      for(var i = 0; i < sibs.length; i++){
        var r = sibs[i].getBoundingClientRect();
        if(ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom){
          clearTargets();
          sibs[i].classList.add('drop-target');
          if(ev.clientX < r.left + r.width / 2) wrap.insertBefore(dragEl, sibs[i]);
          else wrap.insertBefore(dragEl, sibs[i].nextSibling);
          placed = true;
          break;
        }
      }
      if(!placed) clearTargets();
      ev.preventDefault();
    }
    function up(){
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      if(dragEl){
        dragEl.classList.remove('dragging');
        dragEl.style.transform = '';
        dragEl.style.zIndex = '';
        clearTargets();
        if(active){ saveOrder(); suppressClick(); }
      }
      dragEl = null; active = false;
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  });

  /* touch: long-press (350ms) then drag, so scroll/tap still work */
  var touchEl = null, tx = 0, ty = 0, touchTimer = null, touchActive = false;
  wrap.addEventListener('touchstart', function(e){
    if(window.TCOS_autoArrange === false) return;
    var t = e.target.closest('.dicon');
    if(!t || e.touches.length !== 1) return;
    var th = e.touches[0];
    tx = th.clientX; ty = th.clientY;
    touchEl = t; touchActive = false;
    touchTimer = setTimeout(function(){
      touchActive = true;
      touchEl.classList.add('dragging');
    }, 350);
  }, {passive:true});
  wrap.addEventListener('touchmove', function(e){
    if(window.TCOS_autoArrange === false) return;
    if(!touchEl) return;
    var th = e.touches[0];
    if(!touchActive){
      if(Math.abs(th.clientX - tx) > 10 || Math.abs(th.clientY - ty) > 10){
        clearTimeout(touchTimer); touchEl = null;
      }
      return;
    }
    e.preventDefault();
    var dx = th.clientX - tx, dy = th.clientY - ty;
    touchEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    var sibs = Array.prototype.filter.call(wrap.children, function(c){ return c !== touchEl; });
    for(var i = 0; i < sibs.length; i++){
      var r = sibs[i].getBoundingClientRect();
      if(th.clientX > r.left && th.clientX < r.right && th.clientY > r.top && th.clientY < r.bottom){
        if(th.clientX < r.left + r.width / 2) wrap.insertBefore(touchEl, sibs[i]);
        else wrap.insertBefore(touchEl, sibs[i].nextSibling);
        break;
      }
    }
  }, {passive:false});
  wrap.addEventListener('touchend', function(){
    clearTimeout(touchTimer);
    if(touchEl){
      touchEl.classList.remove('dragging');
      touchEl.style.transform = '';
      if(touchActive) saveOrder();
    }
    touchEl = null; touchActive = false;
  });
})();

/* ============================================================
   AUTO ARRANGE TOGGLE + FREE ICON PLACEMENT
   ============================================================ */
(function(){
  var wrap = document.getElementById('desktop-icons');
  var desktop = document.getElementById('desktop');
  var check = document.getElementById('arrange-check');
  var toggleBtn = document.querySelector('[data-ctx="arrange"]');
  if(!wrap || !desktop) return;

  window.TCOS_autoArrange = true;

  function paintCheck(){
    if(check) check.textContent = window.TCOS_autoArrange ? '✓' : '';
  }

  function loadPos(){
    try { return JSON.parse(localStorage.getItem('tcos-icon-pos') || '{}'); }
    catch(e){ return {}; }
  }
  function savePos(p){
    try { localStorage.setItem('tcos-icon-pos', JSON.stringify(p)); } catch(e){}
  }

  function clampVal(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function enterFree(){
    /* capture grid positions BEFORE switching layout, or icons stack */
    var d = desktop.getBoundingClientRect();
    var current = {};
    Array.prototype.forEach.call(wrap.children, function(b){
      var r = b.getBoundingClientRect();
      current[b.getAttribute('data-app')] = { x: r.left - d.left, y: r.top - d.top };
    });
    wrap.classList.add('free-mode');
    var pos = loadPos();
    Array.prototype.forEach.call(wrap.children, function(b){
      var app = b.getAttribute('data-app');
      var x, y;
      if(pos[app]){
        x = pos[app].x; y = pos[app].y;
      } else if(current[app]){
        x = current[app].x; y = current[app].y;
      } else {
        x = 0; y = 0;
      }
      x = clampVal(x, 0, Math.max(0, desktop.clientWidth - 86));
      y = clampVal(y, 0, Math.max(0, desktop.clientHeight - 92));
      b.style.left = x + 'px';
      b.style.top = y + 'px';
    });
  }

  function enterAuto(){
    wrap.classList.remove('free-mode');
    Array.prototype.forEach.call(wrap.children, function(b){
      b.classList.remove('dragging');
      b.style.left = '';
      b.style.top = '';
      b.style.transform = '';
      b.style.zIndex = '';
    });
  }

  function applyMode(){
    if(window.TCOS_autoArrange) enterAuto();
    else enterFree();
    paintCheck();
  }

  window.TCOS_isAutoArrange = function(){ return window.TCOS_autoArrange !== false; };
  window.TCOS_setAutoArrange = function(on){
    window.TCOS_autoArrange = !!on;
    applyMode();
    showToast(window.TCOS_autoArrange ? 'Auto arrange on.' : 'Auto arrange off — place icons anywhere.');
  };

  if(toggleBtn){
    toggleBtn.addEventListener('click', function(){
      window.TCOS_setAutoArrange(!window.TCOS_autoArrange);
    });
  }
  desktop.addEventListener('contextmenu', function(){ paintCheck(); });

  /* free drag (mouse): move icon anywhere, clamped to desktop */
  var el = null, ox = 0, oy = 0, moved = false;
  wrap.addEventListener('mousedown', function(e){
    if(window.TCOS_autoArrange !== false) return;
    if(e.button !== 0) return;
    var t = e.target.closest('.dicon');
    if(!t) return;
    var r = t.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    el = t; moved = false;
    el.classList.add('dragging');
    el.style.zIndex = '10';
    function move(ev){
      if(!el) return;
      var d = desktop.getBoundingClientRect();
      var x = clampVal(ev.clientX - d.left - ox, 0, Math.max(0, desktop.clientWidth - 86));
      var y = clampVal(ev.clientY - d.top - oy, 0, Math.max(0, desktop.clientHeight - 92));
      if(Math.abs(x - parseFloat(el.style.left || '0')) > 2 || Math.abs(y - parseFloat(el.style.top || '0')) > 2) moved = true;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      ev.preventDefault();
    }
    function up(){
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      if(el){
        el.classList.remove('dragging');
        el.style.zIndex = '';
        if(moved){
          var pos = loadPos();
          pos[el.getAttribute('data-app')] = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
          savePos(pos);
          var h = function(ev){ ev.stopPropagation(); ev.preventDefault(); window.removeEventListener('click', h, true); };
          window.addEventListener('click', h, true);
          setTimeout(function(){ window.removeEventListener('click', h, true); }, 80);
        }
      }
      el = null; moved = false;
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  });

  /* free drag (touch): long-press then move */
  var tEl = null, tTimer = null, tActive = false, tOX = 0, tOY = 0;
  wrap.addEventListener('touchstart', function(e){
    if(window.TCOS_autoArrange !== false) return;
    var t = e.target.closest('.dicon');
    if(!t || e.touches.length !== 1) return;
    var th = e.touches[0];
    var r = t.getBoundingClientRect();
    tOX = th.clientX - r.left; tOY = th.clientY - r.top;
    tEl = t; tActive = false;
    tTimer = setTimeout(function(){ tActive = true; tEl.classList.add('dragging'); }, 350);
  }, {passive:true});
  wrap.addEventListener('touchmove', function(e){
    if(window.TCOS_autoArrange !== false) return;
    if(!tEl) return;
    var th = e.touches[0];
    if(!tActive){
      if(Math.abs(th.clientX - (tEl.getBoundingClientRect().left + tOX)) > 10){ clearTimeout(tTimer); tEl = null; }
      return;
    }
    e.preventDefault();
    var d = desktop.getBoundingClientRect();
    var x = clampVal(th.clientX - d.left - tOX, 0, Math.max(0, desktop.clientWidth - 86));
    var y = clampVal(th.clientY - d.top - tOY, 0, Math.max(0, desktop.clientHeight - 92));
    tEl.style.left = x + 'px';
    tEl.style.top = y + 'px';
  }, {passive:false});
  wrap.addEventListener('touchend', function(){
    clearTimeout(tTimer);
    if(tEl){
      tEl.classList.remove('dragging');
      if(tActive){
        var pos = loadPos();
        pos[tEl.getAttribute('data-app')] = { x: parseFloat(tEl.style.left), y: parseFloat(tEl.style.top) };
        savePos(pos);
      }
    }
    tEl = null; tActive = false;
  });

  window.addEventListener('resize', function(){
    if(window.TCOS_autoArrange !== false) return;
    var pos = loadPos();
    var changed = false;
    Array.prototype.forEach.call(wrap.children, function(b){
      var x = clampVal(parseFloat(b.style.left || '0'), 0, Math.max(0, desktop.clientWidth - 86));
      var y = clampVal(parseFloat(b.style.top || '0'), 0, Math.max(0, desktop.clientHeight - 92));
      b.style.left = x + 'px';
      b.style.top = y + 'px';
      var app = b.getAttribute('data-app');
      if(pos[app] && (pos[app].x !== x || pos[app].y !== y)){ pos[app] = {x:x, y:y}; changed = true; }
    });
    if(changed) savePos(pos);
  });

  applyMode();
})();
