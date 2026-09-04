'use strict';
/* ============================================================
   MOBILE OS (initialized lazily — see runner below)
   ============================================================ */
function initMobileOS(){
  var apps = document.getElementById('m-apps');
  var appview = document.getElementById('m-appview');
  var appviewTitle = document.getElementById('m-appview-title');
  var appviewBody = document.getElementById('m-appview-body');
  var backBtn = document.getElementById('m-back');
  var navBtns = document.querySelectorAll('.m-nav-btn');

  var mItems = [
    {app:'about-me', label:'About Me'},
    {app:'projects', label:'Projects'},
    {app:'skills', label:'Skills'},
    {app:'lab', label:'Lab'},
    {app:'explorer', label:'Explorer'},
    {app:'contact', label:'Contact'},
    {app:'github', label:'GitHub', kind:'link', href:DATA.contact.github},
    {app:'resume', label:'Resume'},
    {app:'terminal', label:'Terminal'},
    {app:'taskmanager', label:'Task Manager'},
    {app:'calculator', label:'Calculator'},
    {app:'notepad', label:'Notepad'},
    {app:'deviceinfo', label:'Device Info'}
  ];

  mItems.forEach(function(item){
    var meta = ICON_LIST.filter(function(x){return x.app===item.app;})[0] || {kind:'app'};
    var btn = document.createElement('button');
    btn.className = 'm-app';
    btn.setAttribute('data-mapp', item.app);
    btn.innerHTML = '<span class="m-app-glyph">'+iconGlyphFor(meta)+'</span><span class="m-app-label">'+esc(item.label)+'</span>';
    btn.addEventListener('click', function(){
      if(item.kind==='link'){ window.open(item.href,'_blank','noopener'); return; }
      openMobileApp(item.app, item.label);
    });
    apps.appendChild(btn);
  });

  /* recently opened (max 6, most recent first, persisted) */
  var recentApps = [];
  try {
    var savedMobileRecent = JSON.parse(localStorage.getItem('tcos-m-recent') || '[]');
    if(savedMobileRecent && savedMobileRecent.length) recentApps = savedMobileRecent.filter(function(id){ return !!APPS[id]; }).slice(0, 6);
  } catch(e){}
  function trackRecent(appId){
    recentApps = [appId].concat(recentApps.filter(function(id){ return id !== appId; })).slice(0, 6);
    try { localStorage.setItem('tcos-m-recent', JSON.stringify(recentApps)); } catch(e){}
    renderRecent();
  }
  function recentLabel(appId){
    var found = mItems.filter(function(i){ return i.app === appId; })[0];
    if(found) return found.label;
    var app = APPS[appId];
    return app ? app.title : appId;
  }
  function renderRecent(){
    var box = document.getElementById('m-recent');
    var row = document.getElementById('m-recent-row');
    if(!box || !row) return;
    if(!recentApps.length){ box.classList.add('hidden'); row.innerHTML = ''; return; }
    box.classList.remove('hidden');
    row.innerHTML = '';
    recentApps.forEach(function(appId){
      var chip = document.createElement('button');
      chip.className = 'm-recent-chip';
      chip.innerHTML = '<span class="dot"></span><span class="lbl">' + esc(recentLabel(appId)) + '</span>';
      chip.addEventListener('click', function(){
        var app = APPS[appId];
        openMobileApp(appId, app ? recentLabel(appId) : appId);
      });
      row.appendChild(chip);
    });
  }

  /* home search — filters the app grid like the desktop start menu */
  var homeSearch = document.getElementById('m-home-search-input');
  var noMatch = document.getElementById('m-no-match');
  if(homeSearch){
    homeSearch.addEventListener('input', function(){
      var q = homeSearch.value.toLowerCase();
      var visible = 0;
      Array.prototype.forEach.call(apps.children, function(b){
        var label = (b.textContent || '').toLowerCase();
        var show = label.indexOf(q) > -1;
        b.style.display = show ? '' : 'none';
        if(show) visible++;
      });
      if(noMatch) noMatch.classList.toggle('hidden', visible > 0);
    });
  }
  renderRecent();

  function ctxMobile(){
    return { openApp:function(id){ var app=APPS[id]; openMobileApp(id, app?app.title:id); } };
  }

  function openMobileApp(appId, title){
    var app = APPS[appId];
    if(!app) return;
    appviewTitle.textContent = title || app.title;
    appviewBody.innerHTML = app.render();
    if(app.init) app.init(appviewBody, ctxMobile());
    appviewOpener = (document.activeElement && document.activeElement !== document.body) ? document.activeElement : null;
    appview.classList.add('open');
    document.body.style.overflow='hidden';
    try { backBtn.focus({preventScroll:true}); } catch(e){ try { backBtn.focus(); } catch(err){} }
    trackRecent(appId);
  }
  window.TCOS_openMobile = openMobileApp;
  var appviewOpener = null;
  function closeMobileApp(){
    appview.classList.remove('open');
    document.body.style.overflow='';
    appviewBody.scrollTop = 0;
    if(appviewOpener && appviewOpener.isConnected){
      try { appviewOpener.focus({preventScroll:true}); } catch(e){ try { appviewOpener.focus(); } catch(err){} }
    }
    appviewOpener = null;
  }
  backBtn.addEventListener('click', closeMobileApp);

  function scrollHomeTop(){
    var home = document.getElementById('m-home');
    if(home && home.scrollTo) home.scrollTo({top:0, behavior: prefersReducedMotion() ? 'auto' : 'smooth'});
  }
  navBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      navBtns.forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      var target = btn.getAttribute('data-mnav');
      if(target==='home'){ closeMobileApp(); scrollHomeTop(); }
      else if(target==='search'){ openSearchApp(); }
      else if(target==='settings'){ openSettingsApp(); }
    });
  });

  function openSearchApp(){
    appviewTitle.textContent = 'Search';
    appviewBody.innerHTML = '<div class="app-scroll"><p class="app-eyebrow"># search</p>'+
      '<div class="sm-search m-search-box"><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="9" r="6.5"/><path d="M18 18l-4.5-4.5"/></svg><input id="m-search-input" type="text" placeholder="Search TC/OS" aria-label="Search TC/OS" class="m-search-input" /></div>'+
      '<div id="m-search-results"></div></div>';
    appview.classList.add('open');
    document.body.style.overflow='hidden';
    var input = appviewBody.querySelector('#m-search-input');
    var results = appviewBody.querySelector('#m-search-results');
    function draw(q){
      var f=(q||'').toLowerCase();
      var matches = mItems.filter(function(i){return i.label.toLowerCase().indexOf(f)>-1;});
      results.innerHTML = matches.map(function(i){
        return '<button class="fx-row fx-row-flush" data-app="'+i.app+'" data-kind="'+(i.kind||'app')+'" data-href="'+(i.href||'')+'"><span class="fx-name">'+esc(i.label)+'</span></button>';
      }).join('') || '<div class="sm-empty">No matches.</div>';
      results.querySelectorAll('[data-app]').forEach(function(b){
        b.addEventListener('click', function(){
          if(b.getAttribute('data-kind')==='link'){ window.open(b.getAttribute('data-href'),'_blank','noopener'); return; }
          openMobileApp(b.getAttribute('data-app'));
        });
      });
    }
    draw('');
    input.addEventListener('input', function(){ draw(input.value); });
    setTimeout(function(){ input.focus(); }, 60);
  }

  function openSettingsApp(){
    appviewTitle.textContent = 'Settings';
    var light = document.documentElement.getAttribute('data-theme')==='light';
    appviewBody.innerHTML = '<div>'+
      '<div class="m-settings-row"><div><div class="t">Light theme</div><div class="d">Switch TC/OS to a light appearance.</div></div><button class="m-toggle m-toggle-theme'+(light?' on':'')+'" id="m-theme-toggle" aria-label="Toggle light theme"></button></div>'+
      '<div class="m-settings-row"><div><div class="t">Reduced motion</div><div class="d">Follows your device setting.</div></div><span class="c-value mono m-static-val">'+(prefersReducedMotion()?'On':'Off')+'</span></div>'+
      '<div class="m-settings-row"><div><div class="t">Wi-Fi</div><div class="d" id="m-set-wifi">Checking…</div></div></div>'+
      '<div class="m-settings-row"><div><div class="t">Volume</div><div class="d">TC/OS sounds</div></div><input class="m-set-slider" id="m-set-vol" type="range" min="0" max="100" value="100" aria-label="TC/OS volume" /></div>'+
      '<div class="m-settings-row"><div><div class="t">Do Not Disturb</div><div class="d">Silence notification popups.</div></div><button class="m-toggle" id="m-dnd-toggle" aria-label="Toggle do not disturb"></button></div>'+
      '<div class="m-settings-row"><div><div class="t">Brightness</div><div class="d">Screen dimmer</div></div><input class="m-set-slider" id="m-set-bright" type="range" min="40" max="100" value="100" aria-label="Screen brightness" /></div>'+
      '<div class="m-settings-row"><div><div class="t">Night light</div><div class="d">Warm tint.</div></div><button class="m-toggle" id="m-night-toggle" aria-label="Toggle night light"></button></div>'+
      '<div class="m-settings-row"><div><div class="t">Warmth</div><div class="d">Cooler to warmer.</div></div><input class="m-set-slider" data-night-temp type="range" min="0" max="100" value="60" aria-label="Night light warmth" /></div>'+
      '<div class="m-settings-row"><div><div class="t">Battery</div><div class="d" id="m-set-batt">Checking…</div></div></div>'+
      '<div class="m-settings-row"><div><div class="t">About TC/OS</div><div class="d">Version and session info.</div></div><button class="case-btn m-small-btn" id="m-about-btn">Open</button></div>'+
      '</div>';
    appview.classList.add('open');
    document.body.style.overflow='hidden';
    appviewBody.querySelector('#m-theme-toggle').addEventListener('click', function(){ toggleTheme(); this.classList.toggle('on'); });
    var mDnd = appviewBody.querySelector('#m-dnd-toggle');
    if(mDnd){
      try { if(localStorage.getItem('tcos-dnd') === '1') mDnd.classList.add('on'); } catch(e){}
      mDnd.setAttribute('aria-checked', mDnd.classList.contains('on'));
      mDnd.addEventListener('click', function(){
        var on = mDnd.classList.toggle('on');
        mDnd.setAttribute('aria-checked', on);
        try { localStorage.setItem('tcos-dnd', on ? '1' : '0'); } catch(e){}
      });
    }
    appviewBody.querySelector('#m-about-btn').addEventListener('click', function(){ openMobileApp('about-tcos'); });
    var mVol = appviewBody.querySelector('#m-set-vol');
    if(mVol) mVol.addEventListener('input', function(){ if(window.TCOS_device) window.TCOS_device.setVolume(parseInt(mVol.value, 10)); });
    var mBright = appviewBody.querySelector('#m-set-bright');
    if(mBright) mBright.addEventListener('input', function(){ if(window.TCOS_device) window.TCOS_device.setBrightness(parseInt(mBright.value, 10)); });
    var mNight = appviewBody.querySelector('#m-night-toggle');
    if(mNight){
      try { if(localStorage.getItem('tcos-night') === '1') mNight.classList.add('on'); } catch(e){}
      mNight.setAttribute('aria-checked', mNight.classList.contains('on'));
      mNight.addEventListener('click', function(){
        var on = mNight.classList.toggle('on');
        mNight.setAttribute('aria-checked', on);
        try { localStorage.setItem('tcos-night', on ? '1' : '0'); } catch(e){}
        if(window.TCOS_night) window.TCOS_night();
      });
    }
    if(window.TCOS_device) window.TCOS_device.refresh();
  }
}

/* ============================================================
   MOBILE LONG-PRESS DRAG-REORDER (initialized lazily — see runner below)
   ============================================================ */
function initMobileReorder(){
  var apps = document.getElementById('m-apps');
  if(!apps) return;

  try {
    var saved = JSON.parse(localStorage.getItem('tcos-m-order') || '[]');
    if(saved && saved.length){
      var map = {};
      Array.prototype.forEach.call(apps.children, function(b){ map[b.getAttribute('data-mapp')] = b; });
      saved.forEach(function(app){ if(map[app]) apps.appendChild(map[app]); });
    }
  } catch(e){}

  function saveOrder(){
    try {
      var order = Array.prototype.map.call(apps.children, function(b){ return b.getAttribute('data-mapp'); });
      localStorage.setItem('tcos-m-order', JSON.stringify(order));
    } catch(e){}
  }

  var pressEl = null, pressTimer = null, dragging = false;
  var px = 0, py = 0;

  function suppressTap(){
    var h = function(ev){ ev.stopPropagation(); ev.preventDefault(); window.removeEventListener('click', h, true); };
    window.addEventListener('click', h, true);
    setTimeout(function(){ window.removeEventListener('click', h, true); }, 80);
  }

  apps.addEventListener('pointerdown', function(e){
    var t = e.target.closest('.m-app');
    if(!t) return;
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    px = e.clientX; py = e.clientY;
    pressEl = t; dragging = false;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(function(){
      dragging = true;
      pressEl.classList.add('dragging');
      pressEl.style.touchAction = 'none';
      try { if(navigator.vibrate) navigator.vibrate(30); } catch(err){}
    }, 450);
  });

  apps.addEventListener('pointermove', function(e){
    if(!pressEl) return;
    if(!dragging){
      if(Math.abs(e.clientX - px) > 10 || Math.abs(e.clientY - py) > 10){
        clearTimeout(pressTimer);
        pressEl = null;
      }
      return;
    }
    e.preventDefault();
    var dx = e.clientX - px, dy = e.clientY - py;
    pressEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    pressEl.style.zIndex = '30';
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var over = el ? el.closest('.m-app') : null;
    if(over && over !== pressEl && over.parentNode === apps){
      var r = over.getBoundingClientRect();
      var midX = r.left + r.width / 2;
      if(e.clientX < midX) apps.insertBefore(pressEl, over);
      else apps.insertBefore(pressEl, over.nextSibling);
    }
  });

  function endDrag(){
    clearTimeout(pressTimer);
    if(pressEl){
      pressEl.classList.remove('dragging');
      pressEl.style.transform = '';
      pressEl.style.zIndex = '';
      pressEl.style.touchAction = '';
      if(dragging){ saveOrder(); suppressTap(); }
    }
    pressEl = null; dragging = false;
  }
  apps.addEventListener('pointerup', endDrag);
  apps.addEventListener('pointercancel', endDrag);
}

/* Runs mobile-only setup immediately on small screens, or on first
   crossing into mobile width — keeps desktop initial JS lean. */
(function(){
  var done = false;
  function ready(){
    if(done) return;
    done = true;
    initMobileOS();
    initMobileReorder();
  }
  var mq = window.matchMedia('(max-width:640px)');
  if(mq.matches){ ready(); }
  else if(mq.addEventListener){ mq.addEventListener('change', function(e){ if(e.matches) ready(); }); }
  else if(mq.addListener){ mq.addListener(function(e){ if(e.matches) ready(); }); }
})();
