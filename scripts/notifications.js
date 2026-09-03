'use strict';
/* ============================================================
   NOTIFICATIONS
   ============================================================ */
(function(){
  var panel = document.getElementById('notif-panel');
  var list = document.getElementById('notif-list');
  var toasts = document.getElementById('notif-toasts');
  var badge = document.getElementById('notif-badge');
  var mBadge = document.getElementById('m-bell-badge');
  var bell = document.getElementById('notif-btn');
  var mBell = document.getElementById('m-bell');
  var clearBtn = document.getElementById('notif-clear');
  var audio = document.getElementById('notif-audio');
  var items = [];
  var seq = 0;

  function playSound(){
    if(!audio) return;
    try { if(localStorage.getItem('tcos-sound') === '0') return; } catch(e){}
    try {
      audio.currentTime = 0;
      var p = audio.play();
      if(p && p.catch) p.catch(function(){});
    } catch(e){}
  }
  /* browsers block audio before first interaction — unlock silently on gesture */
  function unlock(){
    [audio, document.getElementById('startup-audio')].forEach(function(a){
      if(!a) return;
      try {
        a.muted = true;
        var p = a.play();
        if(p && p.then){
          p.then(function(){ a.pause(); a.currentTime = 0; a.muted = false; }).catch(function(){ a.muted = false; });
        } else { a.muted = false; }
      } catch(e){}
    });
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
  }
  document.addEventListener('pointerdown', unlock);
  document.addEventListener('keydown', unlock);

  window.TCOS_startupSound = function(){
    var a = document.getElementById('startup-audio');
    if(!a) return;
    try { if(localStorage.getItem('tcos-sound') === '0') return; } catch(e){}
    try {
      a.currentTime = 0;
      var p = a.play();
      if(p && p.catch) p.catch(function(){});
    } catch(e){}
  };

  function paintBadge(){
    var n = items.length;
    [badge, mBadge].forEach(function(b){
      if(!b) return;
      b.textContent = n > 9 ? '9+' : String(n);
      b.classList.toggle('hidden', n === 0);
    });
    var label = n ? ('Notifications, ' + n + ' unread') : 'Notifications';
    if(bell) bell.setAttribute('aria-label', label);
    if(mBell) mBell.setAttribute('aria-label', label);
  }

  function timeNow(){
    return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }

  function renderList(){
    list.innerHTML = '';
    if(!items.length){
      var e = document.createElement('div');
      e.className = 'notif-empty';
      e.textContent = 'No notifications.';
      list.appendChild(e);
      return;
    }
    items.forEach(function(n){
      var b = document.createElement('button');
      b.className = 'notif-item';
      b.innerHTML = '<span class="t">' + esc(n.title) + '</span>' +
        (n.body ? '<span class="b">' + esc(n.body) + '</span>' : '') +
        '<span class="w">' + esc(n.time) + '</span>';
      b.addEventListener('click', function(){
        dismiss(n.id);
        if(n.app) openNotifApp(n.app);
      });
      list.appendChild(b);
    });
  }

  function openNotifApp(app){
    if(isMobile() && window.TCOS_openMobile) window.TCOS_openMobile(app);
    else WM.open(app);
  }

  function dismiss(id){
    items = items.filter(function(n){ return n.id !== id; });
    var t = toasts.querySelector('[data-toast="' + id + '"]');
    if(t) t.remove();
    paintBadge();
    renderList();
  }

  window.TCOS_notify = function(title, body, app){
    if(isMobile()) return;
    var n = { id: ++seq, title: String(title), body: body ? String(body) : '', app: app || null, time: timeNow() };
    items.unshift(n);
    items = items.slice(0, 20);
    paintBadge();
    renderList();
    playSound();

    var card = document.createElement('div');
    card.className = 'notif-toast';
    card.setAttribute('data-toast', n.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = '<span class="tx"><span class="t">' + esc(n.title) + '</span>' +
      (n.body ? '<span class="b">' + esc(n.body) + '</span>' : '') +
      '<span class="w">' + esc(n.time) + '</span></span>' +
      '<button class="notif-x" aria-label="Dismiss notification">×</button>';
    function go(){
      dismiss(n.id);
      if(n.app) openNotifApp(n.app);
    }
    card.addEventListener('click', function(e){
      if(e.target.closest('.notif-x')) return;
      go();
    });
    card.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); }
    });
    card.querySelector('.notif-x').addEventListener('click', function(e){
      e.stopPropagation();
      dismiss(n.id);
    });
    toasts.appendChild(card);
    setTimeout(function(){
      var el = toasts.querySelector('[data-toast="' + n.id + '"]');
      if(el) el.remove();
    }, 6000);
  };

  window.TCOS_dismissNotification = dismiss;

  function togglePanel(){
    panel.classList.toggle('hidden');
  }
  function closePanel(){ panel.classList.add('hidden'); }
  window.TCOS_closeNotifs = closePanel;

  if(bell) bell.addEventListener('click', function(e){ e.stopPropagation(); togglePanel(); });
  if(mBell) mBell.addEventListener('click', function(e){ e.stopPropagation(); togglePanel(); });
  if(clearBtn) clearBtn.addEventListener('click', function(){
    items = [];
    toasts.innerHTML = '';
    paintBadge();
    renderList();
  });
  document.addEventListener('click', function(e){
    if(!panel.classList.contains('hidden') && !panel.contains(e.target)) closePanel();
  });

  paintBadge();
  renderList();

  /* seed system notifications — each shows once ever (tracked in localStorage) */
  function seenSeeds(){
    try { return JSON.parse(localStorage.getItem('tcos-notif-seen') || '[]'); }
    catch(e){ return []; }
  }
  function markSeen(key){
    try {
      var s = seenSeeds();
      if(s.indexOf(key) === -1){ s.push(key); localStorage.setItem('tcos-notif-seen', JSON.stringify(s)); }
    } catch(e){}
  }
  function seedOnce(key, delay, title, body, app){
    if(seenSeeds().indexOf(key) > -1) return;
    setTimeout(function(){ markSeen(key); window.TCOS_notify(title, body, app); }, delay);
  }
  seedOnce('welcome', 2500, 'Welcome to TC/OS', 'Explore projects, skills, and contact from the desktop.', 'about-me');
  seedOnce('update', 30000, 'TC/OS update available', 'New projects and improvements are ready to explore.', 'projects');
  seedOnce('scan', 75000, 'System scan completed', 'No issues found. All systems nominal.', 'sysinfo');
})();
