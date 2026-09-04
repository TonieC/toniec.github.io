'use strict';
/* ============================================================
   APP REGISTRY — each app returns {title, iconHtml, bodyHtml, init(container)}
   Shared between desktop windows and mobile full-screen views.
   ============================================================ */
var APPS = {};

APPS['about-me'] = {
  title:'about-me.md', kind:'file', ext:'md', color:'var(--blue)',
  render:function(){
    var goals = DATA.about.goals.map(function(g){
      return '<div class="goal-row"><span class="goal-tag">'+esc(g[0])+'</span><p class="goal-text">'+mdInline(g[1])+'</p></div>';
    }).join('');
    return '<div class="app-scroll">'+
      '<p class="app-eyebrow"># about-me.md</p>'+
      '<h1 class="app-h1">About Me</h1>'+
      DATA.about.paragraphs.map(function(p){return '<p class="app-p">'+mdInline(p)+'</p>';}).join('')+
      '<div class="goal-list">'+goals+'</div>'+
      '</div>';
  }
};

APPS['skills'] = {
  title:'skills.json', kind:'file', ext:'json', color:'var(--accent)',
  render:function(){
    var cats = Object.keys(DATA.skills);
    var out = '<div class="json-view">';
    out += '<span class="tok-punc">{</span>\n';
    cats.forEach(function(cat,ci){
      var s = DATA.skills[cat];
      out += '  <span class="tok-key">"'+cat.toLowerCase()+'"</span><span class="tok-punc">: {</span>\n';
      out += '    <span class="tok-key">"stack"</span><span class="tok-punc">: [</span>\n';
      s.items.forEach(function(it,i){
        out += '      <span class="tok-str">"'+esc(it)+'"</span>'+(i<s.items.length-1?'<span class="tok-punc">,</span>':'')+'\n';
      });
      out += '    <span class="tok-punc">],</span>\n';
      out += '    <span class="tok-key">"note"</span><span class="tok-punc">:</span> <span class="tok-note">"'+esc(s.note)+'"</span>\n';
      out += '  <span class="tok-punc">}</span>'+(ci<cats.length-1?'<span class="tok-punc">,</span>':'')+'\n';
    });
    out += '<span class="tok-punc">}</span>';
    out += '</div>';
    return out;
  }
};

APPS['contact'] = {
  title:'contact.md', kind:'file', ext:'md', color:'var(--blue)',
  render:function(){
    var c = DATA.contact;
    return '<div class="app-scroll">'+
      '<p class="app-eyebrow"># contact.md</p>'+
      '<h1 class="app-h1">Get in touch</h1>'+
      '<p class="app-p">Open to internships, freelance projects, collaborations, and entry-level opportunities.</p>'+
      '<div class="contact-lines">'+
        '<button class="contact-row" id="reveal-email-btn" type="button"><span class="c-label">Email</span><span class="c-value" id="reveal-email-val">click to reveal</span></button>'+
        '<a class="contact-row" href="'+c.github+'" target="_blank" rel="noopener noreferrer"><span class="c-label">GitHub</span><span class="c-value">'+c.githubLabel+'</span></a>'+
        '<a class="contact-row" href="'+c.linkedin+'" target="_blank" rel="noopener noreferrer"><span class="c-label">LinkedIn</span><span class="c-value">'+c.linkedinLabel+'</span></a>'+
        '<div class="contact-row"><span class="c-label">Location</span><span class="c-value">'+c.location+'</span></div>'+
      '</div>'+
      '<div class="contact-actions">'+
        '<a class="case-btn primary" href="'+c.resume+'" download>Download Resume</a>'+
        '<button class="case-btn" id="copy-email-btn" type="button">Copy Email</button>'+
        '<a class="case-btn" href="'+c.pypi+'" target="_blank" rel="noopener noreferrer">PyPI</a>'+
        '<a class="case-btn" href="'+c.npm+'" target="_blank" rel="noopener noreferrer">NPM</a>'+
      '</div>'+
      '<div id="copy-status" aria-live="polite"></div>'+
      '</div>';
  },
  init:function(container){
    var reveal = container.querySelector('#reveal-email-btn');
    var revealVal = container.querySelector('#reveal-email-val');
    var btn = container.querySelector('#copy-email-btn');
    var status = container.querySelector('#copy-status');
    if(reveal){
      reveal.addEventListener('click', function(){
        var email = getContactEmail();
        if(!email) return;
        if(revealVal) revealVal.textContent = email;
      });
    }
    if(!btn) return;
    btn.addEventListener('click', function(){
      var email = getContactEmail();
      if(!email) return;
      if(revealVal) revealVal.textContent = email;
      var done = function(ok){
        status.textContent = ok ? (email+' copied to clipboard') : email;
        setTimeout(function(){ status.textContent=''; }, 2200);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(email).then(function(){done(true);}, function(){done(false);});
      } else { done(false); }
    });
  }
};

APPS['resume'] = {
  title:'resume.pdf', kind:'file', ext:'pdf', color:'var(--danger)',
  render:function(){
    var r = DATA.contact.resume;
    return '<div class="pdf-col">'+
      '<div class="pdf-toolbar"><span>'+r+'</span><a class="case-btn primary pdf-dl-btn" href="'+r+'" download>Download</a></div>'+
      '<div class="pdf-frame-wrap"><object class="pdf-object" data="'+r+'" type="application/pdf">'+
        '<div class="pdf-fallback"><p class="app-p">The PDF preview isn\u2019t available inline here.</p><a class="case-btn primary" href="'+r+'" target="_blank" rel="noopener noreferrer">Open Resume</a></div>'+
      '</object></div>'+
    '</div>';
  }
};

function renderProjectCase(p){
  var archLabel = p.archLabel || 'Architecture Overview';
  var useCaseLabel = p.useCaseLabel || 'Real Use Cases';
  var links = p.links.map(function(l){ return '<a class="case-btn primary" href="'+l[1]+'" target="_blank" rel="noopener noreferrer">'+esc(l[0])+'</a>'; }).join('');
  var tags = p.tags.map(function(t){ return '<span class="case-tag">'+esc(t.toUpperCase())+'</span>'; }).join('');
  var arch = p.architecture.map(function(a){ return '<li>'+esc(a)+'</li>'; }).join('');
  var uc = p.useCases.map(function(u){ return '<div class="case-cell"><strong>'+esc(u[0])+'</strong>'+esc(u[1])+'</div>'; }).join('');
  var stats = p.stats.map(function(s){ return '<div class="case-stat"><div class="v">'+esc(s[0])+'</div><div class="l">'+esc(s[1].toUpperCase())+'</div></div>'; }).join('');
  return '<div class="app-scroll app-scroll-wide">'+
    '<span class="case-badge">'+esc(p.badge)+'</span>'+
    '<h1 class="app-h1">'+esc(p.name)+'</h1>'+
    '<p class="app-p">'+esc(p.desc)+'</p>'+
    '<div class="case-tags">'+tags+'</div>'+
    '<div class="case-links">'+links+'</div>'+
    '<div class="case-section-label">'+esc(archLabel)+'</div>'+
    '<ul class="case-list">'+arch+'</ul>'+
    '<div class="case-section-label">'+esc(useCaseLabel)+'</div>'+
    '<div class="case-grid">'+uc+'</div>'+
    '<div class="case-stats">'+stats+'</div>'+
    '<div class="case-section-label">Status</div>'+
    '<p class="app-p">'+esc(p.status)+'</p>'+
  '</div>';
}

var ALL_PROJECTS = DATA.projects.concat(DATA.lab);
ALL_PROJECTS.forEach(function(p){
  APPS['project-'+p.id] = {
    title:p.file+'.case', kind:'file', ext:'case', color:'var(--purple)',
    render:function(){ return renderProjectCase(p); }
  };
});

APPS['projects'] = {
  title:'projects.md', kind:'app',
  render:function(){
    var rows = DATA.projects.map(function(p){
      return '<button class="fx-row" data-open-app="project-'+p.id+'"><span class="glyph-wrap"><span class="glyph-folder" aria-hidden="true"></span></span>'+
        '<span><span class="fx-name">'+esc(p.file)+'/</span><div class="fx-desc">'+esc(p.badge)+'</div></span>'+
        '<span class="fx-meta">'+esc(p.status)+'</span></button>';
    }).join('');
    return '<div class="fx-toolbar"><span class="fx-path">~/projects</span></div><div class="fx-list">'+rows+'</div>';
  },
  init:function(container, ctx){
    container.querySelectorAll('[data-open-app]').forEach(function(el){
      el.addEventListener('click', function(){ ctx.openApp(el.getAttribute('data-open-app')); });
    });
  }
};

APPS['lab'] = {
  title:'lab/', kind:'folder',
  render:function(){
    var rows = DATA.lab.map(function(p){
      return '<button class="fx-row" data-open-app="project-'+p.id+'"><span class="glyph-wrap"><span class="glyph-file ext-purple" aria-hidden="true"></span></span>'+
        '<span><span class="fx-name">'+esc(p.file)+'</span><div class="fx-desc">'+esc(p.badge)+' — '+esc(p.status)+'</div></span></button>';
    }).join('');
    return '<div class="fx-toolbar"><span class="fx-path">~/lab</span></div><div class="fx-list">'+rows+
      '<div class="lab-note">More experiments land here as they\u2019re built.</div></div>';
  },
  init:function(container, ctx){
    container.querySelectorAll('[data-open-app]').forEach(function(el){
      el.addEventListener('click', function(){ ctx.openApp(el.getAttribute('data-open-app')); });
    });
  }
};

APPS['terminal'] = {
  title:'terminal', kind:'app',
  render:function(){
    return '<div class="term"><div class="term-out"></div>'+
      '<div class="term-inputrow"><span class="term-prompt">tonie@tcos:~$</span>'+
      '<input class="term-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal input" /></div></div>';
  },
  init:function(container, ctx){
    initTerminal(container, ctx);
  }
};

/* ---------- terminal logic ---------- */
function initTerminal(container, ctx){
  var out = container.querySelector('.term-out');
  var input = container.querySelector('.term-input');
  if(!out || !input) return;

  function line(text, cls){
    var d = document.createElement('div');
    d.className = 'term-line'+(cls?' '+cls:'');
    d.textContent = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }
  function raw(html, cls){
    var d = document.createElement('div');
    d.className = 'term-line'+(cls?' '+cls:'');
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }

  raw('TC/OS terminal — type <span class="accent">help</span> to see available commands.', 'accent');

  var commands = {
    help:function(){
      line('Available commands:');
      line('');
      ['about','projects','skills','lab','contact','github','resume','neofetch','whoami','ls','open <file>','clear'].forEach(function(c){ line('  '+c); });
    },
    about:function(){ ctx.openApp('about-me'); line('Opening about-me.md ...'); },
    projects:function(){ ctx.openApp('projects'); line('Opening projects.md ...'); },
    skills:function(){ ctx.openApp('skills'); line('Opening skills.json ...'); },
    lab:function(){ ctx.openApp('lab'); line('Opening lab/ ...'); },
    contact:function(){ ctx.openApp('contact'); line('Opening contact.md ...'); },
    resume:function(){ ctx.openApp('resume'); line('Opening resume.pdf ...'); },
    github:function(){ line('Opening '+DATA.contact.github+' ...'); window.open(DATA.contact.github,'_blank','noopener'); },
    whoami:function(){ line('tonie — developer, Philippines'); },
    ls:function(){ line('about-me.md  projects.md  skills.json  contact.md  resume.pdf  github.url  lab/'); },
    date:function(){ line(new Date().toString()); },
    clear:function(){ out.innerHTML=''; },
    exit:function(){ ctx.closeSelf && ctx.closeSelf(); },
    sudo:function(){ line('Permission denied: this machine only takes requests nicely.', 'err'); },
    neofetch:function(){
      raw(
        '<span class="accent">TC/OS</span>\n'+
        '——————————\n'+
        'OS:       TC/OS\n'+
        'USER:     Tonie\n'+
        'ROLE:     Developer\n'+
        'PROJECTS: '+ (DATA.projects.length + DATA.lab.length) +'\n'+
        'STACK:    JS / TS / Python / C++\n'+
        'STATUS:   Building'
      );
    }
  };

  function run(raw_){
    var trimmed = raw_.trim();
    if(!trimmed) return;
    line(trimmed, 'cmd');
    var parts = trimmed.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    if(cmd === 'open' && parts[1]){
      var map = {'about-me.md':'about-me','about':'about-me','projects.md':'projects','projects':'projects','skills.json':'skills','skills':'skills','contact.md':'contact','contact':'contact','resume.pdf':'resume','resume':'resume','lab':'lab','lab/':'lab'};
      var key = map[parts[1].toLowerCase()];
      if(key){ ctx.openApp(key); line('Opening '+parts[1]+' ...'); }
      else line('open: cannot find \u2018'+parts[1]+'\u2019', 'err');
      return;
    }
    if(commands[cmd]) commands[cmd]();
    else line(cmd+': command not found. Type "help" for a list.', 'err');
  }

  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      run(input.value);
      input.value='';
    }
  });
  setTimeout(function(){ input.focus(); }, 50);
}

APPS['sysinfo'] = {
  title:'System Information', kind:'app',
  render:function(){
    var ua = navigator.userAgent;
    var rows = [
      ['System','TC/OS'],
      ['Build','local · dev channel'],
      ['User','Tonie'],
      ['Viewport', window.innerWidth+' × '+window.innerHeight],
      ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || '—'],
      ['Reduced motion', prefersReducedMotion() ? 'on' : 'off'],
      ['Agent', ua.length>60?ua.slice(0,60)+'…':ua]
    ];
    var prefs = sysPrefs();
    return '<div class="app-scroll"><p class="app-eyebrow"># system information</p><div class="info-rows">'+
      rows.map(function(r){return '<div class="info-row"><span class="k">'+esc(r[0])+'</span><span class="v">'+esc(r[1])+'</span></div>';}).join('')+
      '</div><div class="case-section-label">Preferences</div><div class="info-rows">'+
      prefs.map(function(r){return '<div class="info-row"><span class="k">'+esc(r[0])+'</span><span class="v">'+esc(r[1])+'</span></div>';}).join('')+
      '</div></div>';
  }
};

function sysPrefs(){
  function ls(key, fallback){
    try {
      var v = localStorage.getItem(key);
      return (v === null || v === undefined) ? fallback : v;
    } catch(e){ return fallback; }
  }
  var light = document.documentElement.getAttribute('data-theme') === 'light';
  var wpId = ls('tcos-wallpaper', 'auto');
  var wpLabel = 'Default';
  wallpaperOptions().forEach(function(w){ if(w.id === wpId) wpLabel = w.label; });
  return [
    ['Theme', light ? 'Light' : 'Dark'],
    ['Wallpaper', wpLabel],
    ['Taskbar', ls('tcos-taskalign', 'center') === 'left' ? 'Left' : 'Centered'],
    ['Notification sounds', ls('tcos-sound', '1') === '0' ? 'Off' : 'On'],
    ['Volume', ls('tcos-volume', '100') + '%'],
    ['Brightness', ls('tcos-bright', '100') + '%']
  ];
}

APPS['about-tcos'] = {
  title:'About TC/OS', kind:'app',
  render:function(){
    return '<div class="app-scroll"><p class="app-eyebrow"># about tc/os</p><h1 class="app-h1">TC/OS</h1>'+
      '<p class="app-p">TC/OS is a small, fictional desktop environment built to present this portfolio the way it actually feels to work on Tonie\u2019s computer: files, windows, a terminal, and a taskbar clock that runs on your own local time.</p>'+
      '<p class="app-p">Everything here — the projects, skills, and contact details — reflects the real portfolio. The desktop is just a different way to explore it.</p></div>';
  }
};

APPS['taskmanager'] = {
  title:'Task Manager', kind:'app',
  render:function(){
    return '<div class="tm">' +
      '<div class="tm-body">' +
        '<div class="tm-side" role="tablist" aria-label="Task Manager views">' +
          '<button class="tm-navbtn active" data-tm-tab="processes" role="tab" aria-selected="true">Processes</button>' +
          '<button class="tm-navbtn" data-tm-tab="performance" role="tab" aria-selected="false">Performance</button>' +
          '<button class="tm-navbtn" data-tm-tab="apphistory" role="tab" aria-selected="false">App history</button>' +
          '<button class="tm-navbtn" data-tm-tab="startup" role="tab" aria-selected="false">Startup apps</button>' +
          '<button class="tm-navbtn" data-tm-tab="users" role="tab" aria-selected="false">Users</button>' +
          '<button class="tm-navbtn" data-tm-tab="details" role="tab" aria-selected="false">Details</button>' +
          '<button class="tm-navbtn" data-tm-tab="services" role="tab" aria-selected="false">Services</button>' +
        '</div>' +
        '<div class="tm-main">' +
          '<div class="tm-view" data-tm-view="processes">' +
            '<div class="tm-tablewrap"><div class="tm-table">' +
              '<div class="tm-head"><span></span><span>Name</span><span>Status</span><span>CPU</span><span>Memory</span><span>Disk</span><span>Network</span></div>' +
              '<div class="tm-rows"></div>' +
            '</div></div>' +
          '</div>' +
          '<div class="tm-view hidden" data-tm-view="performance">' +
            '<div class="tm-perf-layout">' +
              '<div class="tm-reslist" data-tm-reslist></div>' +
              '<div class="tm-detail">' +
                '<div class="tm-big" data-tm-big></div>' +
                '<svg class="tm-graph" data-tm-graph viewBox="0 0 300 100" preserveAspectRatio="none" role="img" aria-label="Usage history over 60 seconds"></svg>' +
                '<div class="tm-axis"><span>60 seconds</span><span>100%</span></div>' +
                '<div class="tm-stats info-rows" data-tm-stats></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="tm-view hidden" data-tm-view="apphistory"><div class="tm-tablewrap"><div class="tm-table" data-tm-hist></div></div></div>' +
          '<div class="tm-view hidden" data-tm-view="startup"><div data-tm-startup></div></div>' +
          '<div class="tm-view hidden" data-tm-view="users"><div data-tm-users></div></div>' +
          '<div class="tm-view hidden" data-tm-view="details"><div class="tm-tablewrap"><div class="tm-table" data-tm-details></div></div></div>' +
          '<div class="tm-view hidden" data-tm-view="services"><div data-tm-services></div></div>' +
          '<div class="tm-run-overlay hidden" data-tm-run-dlg>' +
            '<div class="tm-run-box" role="dialog" aria-label="Create new task">' +
              '<div class="tm-run-title">Create new task</div>' +
              '<p class="tm-run-desc">Type the name of an app, and TC/OS will open it.</p>' +
              '<input class="tm-run-input" data-tm-run-input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Task name" placeholder="terminal" />' +
              '<label class="tm-run-admin"><input type="checkbox" data-tm-run-admin /> Create this task with administrative privileges</label>' +
              '<div class="tm-run-error hidden" data-tm-run-err role="alert"></div>' +
              '<div class="tm-run-btns"><button class="case-btn primary" data-tm-run-ok>OK</button><button class="case-btn" data-tm-run-cancel>Cancel</button></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tm-foot"><button class="case-btn" data-tm-end>End Task</button><button class="case-btn" data-tm-run>Run new task</button><span class="spacer"></span><span data-tm-count></span></div>' +
    '</div>';
  },
  init:function(container){
    var rowsEl = container.querySelector('.tm-rows');
    var countEl = container.querySelector('[data-tm-count]');
    var endBtn = container.querySelector('[data-tm-end]');
    var tabs = container.querySelectorAll('[data-tm-tab]');
    var views = container.querySelectorAll('[data-tm-view]');
    var resList = container.querySelector('[data-tm-reslist]');
    var bigEl = container.querySelector('[data-tm-big]');
    var graphEl = container.querySelector('[data-tm-graph]');
    var statsEl = container.querySelector('[data-tm-stats]');
    var selected = null;
    var activeRes = 'cpu';
    var stats = {};
    var HN = 60;

    function walk(v, min, max, step){
      return Math.max(min, Math.min(max, v + (Math.random() - 0.5) * step));
    }
    function seed(id){
      var h = 0;
      for(var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
      return { cpu: 0.4 + (h % 70) / 10, mem: 42 + (h % 320), disk: 0.2 + (h % 40) / 10, net: 0.1 + (h % 90) / 10 };
    }
    function statFor(id){
      if(!stats[id]) stats[id] = seed(id);
      var s = stats[id];
      s.cpu = walk(s.cpu, 0.1, 24, 1.6);
      s.mem = Math.max(20, s.mem + Math.round((Math.random() - 0.45) * 6));
      s.disk = walk(s.disk, 0, 12, 1.2);
      s.net = walk(s.net, 0, 30, 2.4);
      return s;
    }

    var agg = { cpu: 8, memory: 40, disk: 4, network: 9, gpu: 12 };
    var raw = { send: 4.2, recv: 8.1, read: 12.4, write: 6.8, speed: 3.1, up: 0 };
    var hist = { cpu: [], memory: [], disk: [], network: [], gpu: [] };
    Object.keys(hist).forEach(function(k){
      var v = agg[k];
      for(var i = 0; i < HN; i++){ v = walk(v, 1, 70, 9); hist[k].push(v); }
    });
    function pushHist(){
      hist.cpu.push(agg.cpu); hist.memory.push(agg.memory); hist.disk.push(agg.disk);
      hist.network.push(agg.network); hist.gpu.push(agg.gpu);
      Object.keys(hist).forEach(function(k){ if(hist[k].length > HN) hist[k].shift(); });
    }

    var RES = [
      {id:'cpu', label:'CPU'},
      {id:'memory', label:'Memory'},
      {id:'disk', label:'Disk'},
      {id:'network', label:'Network'},
      {id:'gpu', label:'GPU'}
    ];

    function tmIcon(appId){
      var meta = ICON_LIST.filter(function(x){ return x.app === appId; })[0];
      if(meta) return iconGlyphFor(meta);
      if(appId.indexOf('project-') === 0) return glyph('file', 'case', 'var(--purple)');
      return glyph('app');
    }
    function tmLabel(appId){
      var meta = ICON_LIST.filter(function(x){ return x.app === appId; })[0];
      if(meta) return meta.label;
      var app = APPS[appId];
      return app ? app.title : appId;
    }
    function pidFor(id){
      var h = 0;
      for(var i = 0; i < id.length; i++) h = (h * 37 + id.charCodeAt(i)) % 9000;
      return 1000 + h;
    }

    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        tabs.forEach(function(t){ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        views.forEach(function(v){ v.classList.toggle('hidden', v.getAttribute('data-tm-view') !== tab.getAttribute('data-tm-tab')); });
      });
    });

    var startupApps = [
      {name:'TC/OS Shell', impact:'Low', on:true},
      {name:'Window Manager', impact:'Low', on:true},
      {name:'Taskbar Clock', impact:'None', on:true},
      {name:'Notification Service', impact:'Low', on:true},
      {name:'Wallpaper Engine', impact:'None', on:false}
    ];
    function drawStartup(){
      var el = container.querySelector('[data-tm-startup]');
      el.innerHTML = '';
      startupApps.forEach(function(s){
        var r = document.createElement('div');
        r.className = 'tm-startup-row';
        r.innerHTML = '<span class="ico">' + glyph('app') + '</span>' +
          '<span class="n">' + esc(s.name) + '</span>' +
          '<span class="impact">' + esc(s.impact) + ' impact</span>' +
          '<button class="tm-pill ' + (s.on ? 'on' : 'off') + '">' + (s.on ? 'Enabled' : 'Disabled') + '</button>';
        r.querySelector('.tm-pill').addEventListener('click', function(){
          s.on = !s.on;
          drawStartup();
        });
        el.appendChild(r);
      });
    }
    drawStartup();

    var services = [
      ['TC/OS Shell', 'Running'],
      ['Window Manager', 'Running'],
      ['Taskbar Clock', 'Running'],
      ['Notification Service', 'Running'],
      ['Wallpaper Engine', 'Stopped'],
      ['Print Spooler', 'Disabled']
    ];
    container.querySelector('[data-tm-services]').innerHTML = services.map(function(s){
      return '<div class="tm-startup-row"><span class="ico">' + glyph('app') + '</span>' +
        '<span class="n">' + esc(s[0]) + '</span>' +
        '<span class="tm-pill ' + (s[1] === 'Running' ? 'on' : 'off') + '">' + esc(s[1]) + '</span></div>';
    }).join('');

    var histApps = {};
    function knownApps(){
      var ids = ICON_LIST.map(function(x){ return x.app; });
      ['taskmanager', 'calculator', 'notepad', 'settings', 'deviceinfo', 'sysinfo', 'about-tcos'].forEach(function(id){
        if(ids.indexOf(id) === -1 && APPS[id]) ids.push(id);
      });
      return ids.filter(function(id){ return id !== 'github'; });
    }

    function graphSVG(values){
      var pts = values.map(function(v, i){
        return (i / (HN - 1) * 300).toFixed(1) + ',' + (100 - Math.max(0, Math.min(100, v))).toFixed(1);
      });
      var line = 'M' + pts.join(' L');
      var grid = [0, 25, 50, 75, 100].map(function(g){
        return '<line class="tm-grid" x1="0" y1="' + (100 - g) + '" x2="300" y2="' + (100 - g) + '"/>';
      }).join('');
      return grid + '<path class="tm-area" d="' + line + ' L300,100 L0,100 Z"/>' +
        '<path class="tm-line" d="' + line + '"/>';
    }

    function gpuName(){
      try {
        var c = document.createElement('canvas');
        var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        if(!gl) return 'TC/OS virtual GPU';
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        if(ext) return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'TC/OS virtual GPU';
        return gl.getParameter(gl.RENDERER) || 'TC/OS virtual GPU';
      } catch(e){ return 'TC/OS virtual GPU'; }
    }
    var gpuLabel = gpuName();

    var bootT = Date.now();
    function tmUptime(){
      var s = Math.floor((Date.now() - bootT) / 1000);
      var m = Math.floor(s / 60), h = Math.floor(m / 60);
      if(h) return h + 'h ' + (m % 60) + 'm';
      if(m) return m + 'm ' + (s % 60) + 's';
      return s + 's';
    }
    function row2(k, v){
      return '<div class="info-row"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>';
    }

    function resValue(id){
      if(id === 'cpu') return agg.cpu.toFixed(1) + '%';
      if(id === 'memory') return Math.round(agg.memory) + '%';
      if(id === 'disk') return agg.disk.toFixed(1) + '%';
      if(id === 'network') return (raw.send + raw.recv).toFixed(1) + ' Mbps';
      return agg.gpu.toFixed(1) + '%';
    }
    function resBig(id){
      if(id === 'cpu') return agg.cpu.toFixed(1) + '% <small>Utilization</small>';
      if(id === 'memory') return Math.round(agg.memory) + '% <small>' + Math.round(agg.memory / 100 * 8192) + ' MB of 8192 MB</small>';
      if(id === 'disk') return agg.disk.toFixed(1) + '% <small>Active time</small>';
      if(id === 'network') return (raw.send + raw.recv).toFixed(1) + ' <small>Mbps throughput</small>';
      return agg.gpu.toFixed(1) + '% <small>Utilization</small>';
    }
    function resStats(id, procs){
      var threads = procs * 13 + 40, handles = threads * 34 + 1200;
      var used = Math.round(agg.memory / 100 * 8192);
      var online = (navigator.onLine !== false);
      if(id === 'cpu') return row2('Utilization', agg.cpu.toFixed(1) + '%') +
        row2('Speed', (2.4 + agg.cpu / 100 * 1.4).toFixed(2) + ' GHz') +
        row2('Processes', String(procs)) + row2('Threads', String(threads)) +
        row2('Handles', String(handles)) + row2('Uptime', tmUptime());
      if(id === 'memory') return row2('In use', used + ' MB') +
        row2('Available', (8192 - used) + ' MB') + row2('Total', '8192 MB') +
        row2('Cached', Math.round(used * 0.38) + ' MB') +
        row2('Committed', Math.round(used * 1.25) + ' / 8192 MB') +
        row2('Paged pool', Math.round(used * 0.12) + ' MB') +
        row2('Non-paged pool', Math.round(used * 0.05) + ' MB');
      if(id === 'disk') return row2('Active time', agg.disk.toFixed(1) + '%') +
        row2('Read speed', raw.read.toFixed(1) + ' MB/s') +
        row2('Write speed', raw.write.toFixed(1) + ' MB/s') +
        row2('Capacity', '256 GB (168 GB free)');
      if(id === 'network') return row2('Send', raw.send.toFixed(1) + ' Mbps') +
        row2('Receive', raw.recv.toFixed(1) + ' Mbps') +
        row2('Connection', online ? 'Connected · 1.0 Gbps' : 'Offline');
      return row2('Name', gpuLabel) + row2('Utilization', agg.gpu.toFixed(1) + '%') +
        row2('Memory', Math.round(agg.gpu / 100 * 2048) + ' MB / 2048 MB');
    }

    function drawResList(){
      resList.innerHTML = '';
      RES.forEach(function(r){
        var b = document.createElement('button');
        b.className = 'tm-res' + (activeRes === r.id ? ' active' : '');
        b.innerHTML = '<div class="n">' + esc(r.label) + '</div><div class="v">' + esc(resValue(r.id)) + '</div>';
        b.addEventListener('click', function(){
          activeRes = r.id;
          drawResList();
          drawPerf();
        });
        resList.appendChild(b);
      });
    }
    function drawPerf(){
      bigEl.innerHTML = resBig(activeRes);
      graphEl.innerHTML = graphSVG(hist[activeRes]);
      statsEl.innerHTML = resStats(activeRes, WM.list().length);
    }

    function draw(){
      if(!container.isConnected){ clearInterval(timer); return; }
      var list = WM.list();
      rowsEl.innerHTML = '';
      var totalCpu = 0, totalMem = 0;
      list.forEach(function(w){
        var s = statFor(w.id);
        totalCpu += s.cpu; totalMem += s.mem;
        if(!histApps[w.id]) histApps[w.id] = { cpu: 0, net: Math.round(Math.random() * 40) / 10 };
        histApps[w.id].cpu += 1.5;
        histApps[w.id].net = Math.round((histApps[w.id].net + s.net / 60) * 10) / 10;
        var b = document.createElement('button');
        b.className = 'tm-row' + (selected === w.id ? ' selected' : '');
        b.setAttribute('data-tm-id', w.id);
        b.innerHTML = '<span class="ico">' + tmIcon(w.id) + '</span>' +
          '<span class="n">' + esc(tmLabel(w.id)) + '</span>' +
          '<span class="s ' + (w.minimized ? 'suspended' : 'running') + '">' + (w.minimized ? 'Suspended' : 'Running') + '</span>' +
          '<span class="c">' + s.cpu.toFixed(1) + '%</span>' +
          '<span class="m">' + s.mem + ' MB</span>' +
          '<span class="d">' + s.disk.toFixed(1) + ' MB/s</span>' +
          '<span class="e">' + s.net.toFixed(1) + ' Mbps</span>';
        b.addEventListener('click', function(){
          selected = (selected === w.id) ? null : w.id;
          rowsEl.querySelectorAll('.tm-row').forEach(function(r){ r.classList.toggle('selected', r.getAttribute('data-tm-id') === selected); });
        });
        b.addEventListener('dblclick', function(){ WM.focus(w.id); });
        rowsEl.appendChild(b);
      });
      if(countEl) countEl.textContent = list.length + (list.length === 1 ? ' process' : ' processes');

      agg.cpu = Math.min(96, totalCpu * 3);
      agg.memory = Math.min(97, totalMem / 81.92);
      agg.disk = walk(agg.disk, 0.5, 32, 4);
      agg.network = walk(agg.network, 1, 55, 5);
      agg.gpu = walk(agg.gpu, 2, 60, 5);
      raw.send = walk(raw.send, 0.2, 40, 2);
      raw.recv = walk(raw.recv, 0.5, 60, 3);
      raw.read = walk(raw.read, 0.5, 120, 8);
      raw.write = walk(raw.write, 0.2, 80, 6);
      pushHist();
      drawResList();
      drawPerf();

      var histEl = container.querySelector('[data-tm-hist]');
      histEl.innerHTML =
        knownAppsRow();
      function knownAppsRow(){
        var ids = knownApps();
        var out = '<div class="tm-head"><span></span><span>App</span><span>CPU time</span><span>Network</span><span></span><span></span><span></span></div>';
        ids.forEach(function(id){
          var h = histApps[id] || { cpu: 0, net: 0 };
          var mm = Math.floor(h.cpu / 60), ss = Math.floor(h.cpu % 60);
          out += '<div class="tm-row"><span class="ico">' + tmIcon(id) + '</span>' +
            '<span class="n">' + esc(tmLabel(id)) + '</span>' +
            '<span class="s">' + (WM.isOpen(id) ? 'Running' : '—') + '</span>' +
            '<span class="c">' + mm + ':' + (ss < 10 ? '0' : '') + ss + '</span>' +
            '<span class="m">' + h.net.toFixed(1) + ' MB</span>' +
            '<span class="d"></span><span class="e"></span></div>';
        });
        return out;
      }

      var uEl = container.querySelector('[data-tm-users]');
      uEl.innerHTML = '<div class="tm-user"><span class="tm-avatar">T</span>' +
        '<span><span class="n">tonie</span><span class="s sub">Active · ' + list.length + (list.length === 1 ? ' process' : ' processes') + '</span></span></div>';

      var dEl = container.querySelector('[data-tm-details]');
      dEl.innerHTML = '<div class="tm-head"><span></span><span>Name</span><span>Status</span><span>CPU</span><span>Memory</span><span>PID</span><span></span></div>' +
        list.map(function(w){
          var s = statFor(w.id);
          return '<div class="tm-row"><span class="ico">' + tmIcon(w.id) + '</span>' +
            '<span class="n">' + esc(tmLabel(w.id)) + '</span>' +
            '<span class="s ' + (w.minimized ? 'suspended' : 'running') + '">' + (w.minimized ? 'Suspended' : 'Running') + '</span>' +
            '<span class="c">' + s.cpu.toFixed(1) + '%</span>' +
            '<span class="m">' + s.mem + ' MB</span>' +
            '<span class="d">' + pidFor(w.id) + '</span><span class="e"></span></div>';
        }).join('') || '<div class="tm-empty">No processes.</div>';
    }

    endBtn.addEventListener('click', function(){
      if(!selected){ showToast('Select a process first.'); return; }
      var w = WM.list().filter(function(x){ return x.id === selected; })[0];
      WM.close(selected);
      if(window.TCOS_notify) window.TCOS_notify('Task ended', (w ? w.title : selected) + ' was closed.', null);
      selected = null;
      draw();
    });

    /* ---- Run new task ---- */
    var runBtn = container.querySelector('[data-tm-run]');
    var runDlg = container.querySelector('[data-tm-run-dlg]');
    var runInput = container.querySelector('[data-tm-run-input]');
    var runAdmin = container.querySelector('[data-tm-run-admin]');
    var runErr = container.querySelector('[data-tm-run-err]');
    var runOk = container.querySelector('[data-tm-run-ok]');
    var runCancel = container.querySelector('[data-tm-run-cancel]');

    var runAliases = {
      'cmd': 'terminal',
      'about': 'about-me',
      'system': 'sysinfo',
      'sys': 'sysinfo',
      'info': 'sysinfo',
      'taskmgr': 'taskmanager'
    };
    function resolveTask(raw){
      var name = String(raw || '').trim().toLowerCase().replace(/\.exe$/, '');
      if(!name) return null;
      if(runAliases[name]) name = runAliases[name];
      if(APPS[name]) return name;
      return null;
    }
    function openRunDlg(){
      runInput.value = '';
      runErr.textContent = '';
      runErr.classList.add('hidden');
      runDlg.classList.remove('hidden');
      setTimeout(function(){ try { runInput.focus(); } catch(e){} }, 40);
    }
    function closeRunDlg(){
      runDlg.classList.add('hidden');
      try { runBtn.focus({preventScroll:true}); } catch(e){ try { runBtn.focus(); } catch(err){} }
    }
    function execRun(){
      var target = resolveTask(runInput.value);
      if(!target){
        runErr.textContent = 'TC/OS cannot find \u2018' + String(runInput.value).trim() + '\u2019.';
        runErr.classList.remove('hidden');
        return;
      }
      var admin = runAdmin && runAdmin.checked;
      closeRunDlg();
      WM.open(target);
      draw();
      if(admin) showToast('Running with administrative privileges.');
    }
    runBtn.addEventListener('click', openRunDlg);
    runCancel.addEventListener('click', closeRunDlg);
    runOk.addEventListener('click', execRun);
    runInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); execRun(); }
      else if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); closeRunDlg(); }
    });

    draw();
    var timer = setInterval(draw, 1500);
  }
};

APPS['calculator'] = {
  title:'calculator', kind:'app',
  render:function(){
    var keys = ['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='];
    return '<div class="calc" tabindex="-1">' +
      '<div class="calc-display" data-calc-out>0</div>' +
      '<div class="calc-sub" data-calc-sub></div>' +
      '<div class="calc-keys">' + keys.map(function(k){
        var cls = 'calc-key' + ((k === '+' || k === '−' || k === '×' || k === '÷') ? ' op' : '') + (k === '=' ? ' eq' : '');
        return '<button class="' + cls + '" data-calc-key="' + k + '">' + k + '</button>';
      }).join('') + '</div></div>';
  },
  init:function(container){
    var box = container.querySelector('.calc');
    var out = container.querySelector('[data-calc-out]');
    var sub = container.querySelector('[data-calc-sub]');
    var cur = '0', prev = null, op = null, fresh = true;
    function fmt(n){
      if(!isFinite(n)) return 'Error';
      return parseFloat(n.toPrecision(10)).toString();
    }
    function calc(a, b, o){
      a = parseFloat(a); b = parseFloat(b);
      if(o === '+') return a + b;
      if(o === '−') return a - b;
      if(o === '×') return a * b;
      if(o === '÷') return b === 0 ? NaN : a / b;
      return b;
    }
    function paint(){ out.textContent = cur; }
    function press(k){
      if(/[0-9]/.test(k)){
        if(fresh || cur === '0' || cur === 'Error'){ cur = (cur === 'Error' || fresh) ? k : cur + k; fresh = false; }
        else if(cur.replace('-','').length < 12) cur += k;
      }
      else if(k === '.'){ if(fresh || cur === 'Error'){ cur = '0.'; fresh = false; } else if(cur.indexOf('.') === -1) cur += '.'; }
      else if(k === 'C'){ cur = '0'; prev = null; op = null; fresh = true; sub.textContent = ''; }
      else if(k === '±'){ if(cur !== '0' && cur !== 'Error') cur = cur.charAt(0) === '-' ? cur.slice(1) : '-' + cur; }
      else if(k === '%'){ cur = fmt(parseFloat(cur || '0') / 100); fresh = true; }
      else if(k === '='){
        if(op !== null && prev !== null){
          sub.textContent = prev + ' ' + op + ' ' + cur + ' =';
          cur = fmt(calc(prev, cur, op));
          prev = null; op = null; fresh = true;
        }
      }
      else {
        if(op !== null && !fresh && prev !== null){ cur = fmt(calc(prev, cur, op)); }
        prev = cur; op = k; fresh = true;
        sub.textContent = prev + ' ' + op;
      }
      paint();
    }
    container.querySelectorAll('[data-calc-key]').forEach(function(b){
      b.addEventListener('click', function(){ press(b.getAttribute('data-calc-key')); });
    });
    box.addEventListener('keydown', function(e){
      var map = {'*':'×', '/':'÷', '-':'−', '+':'+', '=':'=', 'Enter':'=', 'Escape':'C', 'Backspace':'⌫'};
      var k = map[e.key] !== undefined ? map[e.key] : e.key;
      if(k === '⌫'){ cur = (cur.length > 1 && cur !== 'Error') ? cur.slice(0, -1) : '0'; fresh = (cur === '0'); paint(); e.preventDefault(); return; }
      if(/[0-9.]/.test(k) || k === '+' || k === '−' || k === '×' || k === '÷' || k === '=' || k === 'C' || k === '%'){
        press(k === 'C' ? 'C' : k); e.preventDefault();
      }
    });
    setTimeout(function(){ try { box.focus({preventScroll:true}); } catch(e){} }, 60);
    paint();
  }
};

APPS['notepad'] = {
  title:'notepad.txt', kind:'file', ext:'txt', color:'var(--blue)',
  render:function(){
    return '<div class="np">' +
      '<div class="np-bar"><span data-np-count>0 words</span><span data-np-saved></span></div>' +
      '<textarea class="np-area" data-np-area aria-label="Notepad text" placeholder="Type here — saved automatically."></textarea>' +
    '</div>';
  },
  init:function(container){
    var area = container.querySelector('[data-np-area]');
    var count = container.querySelector('[data-np-count]');
    var saved = container.querySelector('[data-np-saved]');
    var timer = null;
    function stats(){
      var words = area.value.trim() ? area.value.trim().split(/\s+/).length : 0;
      count.textContent = words + (words === 1 ? ' word' : ' words');
    }
    try { area.value = localStorage.getItem('tcos-note') || ''; } catch(e){}
    stats();
    area.addEventListener('input', function(){
      stats();
      saved.textContent = 'Saving…';
      clearTimeout(timer);
      timer = setTimeout(function(){
        if(!container.isConnected) return;
        try { localStorage.setItem('tcos-note', area.value); } catch(e){}
        saved.textContent = 'Saved ' + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      }, 600);
    });
  }
};

APPS['settings'] = {
  title:'Settings', kind:'app',
  render:function(){
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    var sound = true;
    try { sound = localStorage.getItem('tcos-sound') !== '0'; } catch(e){}
    var current = 'auto';
    try { current = localStorage.getItem('tcos-wallpaper') || 'auto'; } catch(e){}
    var wps = wallpaperOptions();
    var align = 'center';
    try { align = localStorage.getItem('tcos-taskalign') || 'center'; } catch(e){}
    return '<div class="app-scroll">' +
      '<p class="app-eyebrow"># settings</p>' +
      '<h1 class="app-h1">Settings</h1>' +
      '<div class="set-group"><div class="set-label">Appearance</div>' +
        '<div class="set-row"><div><div class="t">Light theme</div><div class="d">Switch TC/OS to a light appearance.</div></div><button class="set-toggle' + (light ? ' on' : '') + '" data-set-theme role="switch" aria-checked="' + light + '" aria-label="Toggle light theme"></button></div>' +
      '</div>' +
      '<div class="set-group"><div class="set-label">Wallpaper</div>' +
        '<div class="wp-grid">' + wps.map(function(w){
          return '<button class="wp-opt' + (current === w.id ? ' active' : '') + '" data-wp="' + w.id + '"><img src="' + w.thumb + '" alt="" loading="lazy" /><span class="n">' + esc(w.label) + '</span></button>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="set-group"><div class="set-label">Taskbar</div>' +
        '<div class="set-row"><div><div class="t">Alignment</div><div class="d">Center icons like Windows 11, or align them left.</div></div></div>' +
        '<div class="seg-group">' +
          '<button class="seg-btn' + (align === 'left' ? '' : ' active') + '" data-align="center">Centered</button>' +
          '<button class="seg-btn' + (align === 'left' ? ' active' : '') + '" data-align="left">Left</button>' +
        '</div>' +
      '</div>' +
      '<div class="set-group"><div class="set-label">Notifications</div>' +
        '<div class="set-row"><div><div class="t">Notification sounds</div><div class="d">Play a sound when a notification arrives.</div></div><button class="set-toggle' + (sound ? ' on' : '') + '" data-set-sound role="switch" aria-checked="' + sound + '" aria-label="Toggle notification sounds"></button></div>' +
      '</div>' +
      '<div class="set-group"><div class="set-label">System</div>' +
        '<div class="set-row"><div><div class="t">Reduced motion</div><div class="d">Follows your device setting: ' + (prefersReducedMotion() ? 'On' : 'Off') + '.</div></div></div>' +
        '<div class="set-row"><div><div class="t">Reset TC/OS data</div><div class="d">Clear icon positions, recents, notes, and preferences.</div></div><button class="case-btn set-danger" data-set-reset>Reset</button></div>' +
      '</div>' +
    '</div>';
  },
  init:function(container){
    var themeBtn = container.querySelector('[data-set-theme]');
    if(themeBtn) themeBtn.addEventListener('click', function(){
      toggleTheme();
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      themeBtn.classList.toggle('on', light);
      themeBtn.setAttribute('aria-checked', light);
    });
    var soundBtn = container.querySelector('[data-set-sound]');
    if(soundBtn) soundBtn.addEventListener('click', function(){
      var on = soundBtn.classList.toggle('on');
      soundBtn.setAttribute('aria-checked', on);
      try { localStorage.setItem('tcos-sound', on ? '1' : '0'); } catch(e){}
    });
    container.querySelectorAll('[data-wp]').forEach(function(b){
      b.addEventListener('click', function(){
        applyWallpaper(b.getAttribute('data-wp'));
        container.querySelectorAll('[data-wp]').forEach(function(x){ x.classList.toggle('active', x === b); });
      });
    });
    container.querySelectorAll('[data-align]').forEach(function(b){
      b.addEventListener('click', function(){
        applyTaskAlign(b.getAttribute('data-align'));
        container.querySelectorAll('[data-align]').forEach(function(x){ x.classList.toggle('active', x === b); });
      });
    });
    var resetBtn = container.querySelector('[data-set-reset]');
    var resetArmed = false;
    var resetTimer = null;
    function disarmReset(){
      resetArmed = false;
      clearTimeout(resetTimer);
      if(resetBtn) resetBtn.textContent = 'Reset';
    }
    if(resetBtn) resetBtn.addEventListener('click', function(){
      if(!resetArmed){
        resetArmed = true;
        resetBtn.textContent = 'Confirm reset';
        showToast('Click Reset again to wipe all TC/OS data.');
        resetTimer = setTimeout(disarmReset, 4000);
        return;
      }
      clearTimeout(resetTimer);
      try {
        Object.keys(localStorage).filter(function(k){ return k.indexOf('tcos-') === 0; }).forEach(function(k){ localStorage.removeItem(k); });
      } catch(e){}
      window.location.reload();
    });
  }
};

APPS['deviceinfo'] = {
  title:'Device Info', kind:'app',
  render:function(){
    return '<div class="app-scroll">' +
      '<p class="app-eyebrow"># device info</p>' +
      '<h1 class="app-h1">This device</h1>' +
      '<p class="app-p">Live readings from browser APIs — measured on your device, never sent anywhere.</p>' +
      '<div class="contact-actions"><button class="case-btn" data-dv-refresh>Refresh</button></div>' +
      '<div class="case-section-label">Graphics</div><div class="info-rows" data-dv-gpu></div>' +
      '<div class="case-section-label">Storage</div><div class="info-rows" data-dv-store></div>' +
      '<div class="case-section-label">Gamepads</div><div data-dv-pads></div>' +
      '<div class="case-section-label">System</div><div class="info-rows" data-dv-sys></div>' +
      '<div class="case-section-label">Display</div><div class="info-rows" data-dv-disp></div>' +
      '<div class="case-section-label">Audio</div><div class="info-rows" data-dv-aud></div>' +
    '</div>';
  },
  init:function(container){
    function row(k, v){
      return '<div class="info-row"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>';
    }
    function hex(h){ return ('0000000' + (h >>> 0).toString(16)).slice(-8); }
    function fmtBytes(n){
      if(!n && n !== 0) return '—';
      if(n >= 1073741824) return (n / 1073741824).toFixed(1) + ' GB';
      return Math.round(n / 1048576) + ' MB';
    }
    function gpuInfo(){
      try {
        var c = document.createElement('canvas');
        var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        if(!gl) return 'Unavailable';
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        if(ext) return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'Masked by browser';
        return gl.getParameter(gl.RENDERER) || 'Masked by browser';
      } catch(e){ return 'Unavailable'; }
    }
    function canvasFp(){
      try {
        var c = document.createElement('canvas');
        c.width = 200; c.height = 60;
        var x = c.getContext('2d');
        x.fillStyle = '#111214'; x.fillRect(0, 0, 200, 60);
        x.font = '16px "JetBrains Mono", monospace';
        x.fillStyle = '#d2a24b'; x.fillText('TC/OS fp', 12, 28);
        x.strokeStyle = '#87aef3'; x.beginPath(); x.arc(150, 30, 15, 0, 6.29); x.stroke();
        var d = x.getImageData(0, 0, 200, 60).data;
        var h = 5381, i;
        for(i = 0; i < d.length; i += 7) h = (((h << 5) + h + d[i]) | 0);
        return hex(h);
      } catch(e){ return 'Unavailable'; }
    }
    function audioFp(el){
      try {
        var AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if(!AC) throw 0;
        var ctx = new AC(1, 44100, 44100);
        var osc = ctx.createOscillator();
        osc.type = 'triangle'; osc.frequency.value = 10000;
        var comp = ctx.createDynamicsCompressor();
        osc.connect(comp); comp.connect(ctx.destination); osc.start(0);
        ctx.startRendering().then(function(buf){
          if(!container.isConnected) return;
          var ch = buf.getChannelData(0), h = 5381, i;
          for(i = 0; i < ch.length; i += 97) h = (((h << 5) + h + Math.floor(ch[i] * 1000000)) | 0);
          el.textContent = hex(h);
        }).catch(function(){ if(container.isConnected) el.textContent = 'Unavailable'; });
      } catch(e){ el.textContent = 'Unavailable'; }
    }
    function audioStatic(){
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if(!AC) return null;
        var ctx = new AC();
        var out = { ch: ctx.destination.maxChannelCount || ctx.destination.channelCount, sr: ctx.sampleRate };
        try { if(ctx.close) ctx.close().catch(function(){}); } catch(e){}
        return out;
      } catch(e){ return null; }
    }
    function padList(){
      var out = [];
      try {
        var gps = navigator.getGamepads ? navigator.getGamepads() : [];
        for(var i = 0; i < gps.length; i++){
          var g = gps[i];
          if(!g) continue;
          var pressed = 0, b;
          for(b = 0; b < g.buttons.length; b++) if(g.buttons[b].pressed) pressed++;
          out.push({
            id: String(g.id).slice(0, 42),
            axes: g.axes.length,
            ax: (g.axes.length ? Number(g.axes[0]).toFixed(2) : '—') + ' / ' + (g.axes.length > 1 ? Number(g.axes[1]).toFixed(2) : '—'),
            btns: g.buttons.length + ' buttons, ' + pressed + ' pressed'
          });
        }
      } catch(e){}
      return out;
    }
    function draw(){
      if(!container.isConnected) return;
      var q = function(s){ return container.querySelector(s); };
      q('[data-dv-gpu]').innerHTML = row('GPU', gpuInfo()) + row('Canvas fingerprint', 'measuring…');
      var dark = false;
      try { dark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch(e){}
      var tb = '—';
      try {
        if(typeof window.screen.availHeight === 'number'){
          var diff = window.screen.height - window.availHeight;
          if(diff >= 0) tb = diff + ' px (estimated)';
        }
      } catch(e){}
      q('[data-dv-sys]').innerHTML = row('Device theme', dark ? 'Dark mode' : 'Light mode') +
        row('Animations', prefersReducedMotion() ? 'Reduced (OS setting)' : 'Full motion');
      q('[data-dv-disp]').innerHTML = row('Resolution', window.screen.width + ' × ' + window.screen.height) +
        row('Available', window.screen.availWidth + ' × ' + window.screen.availHeight) +
        row('Taskbar height', tb);
      var au = audioStatic();
      q('[data-dv-aud]').innerHTML = row('Output channels', au ? String(au.ch) : 'Unavailable') +
        row('Sample rate', au ? (au.sr + ' Hz') : 'Unavailable') +
        '<div class="info-row"><span class="k">Audio fingerprint</span><span class="v" data-dv-afp>measuring…</span></div>';
      var store = q('[data-dv-store]');
      store.innerHTML = row('Quota', 'measuring…');
      if(navigator.storage && navigator.storage.estimate){
        navigator.storage.estimate().then(function(e){
          if(!container.isConnected) return;
          var pct = e.quota ? Math.round((e.usage / e.quota) * 100) : 0;
          store.innerHTML = row('Used', fmtBytes(e.usage) + ' of ' + fmtBytes(e.quota)) +
            '<div class="tm-meter dv-meter"><div class="t"><span>Browser storage</span><span class="v">' + pct + '%</span></div>' +
            '<div class="tm-bar"><span data-w="' + Math.min(100, pct) + '"></span></div></div>';
          store.querySelectorAll('[data-w]').forEach(function(bar){ bar.style.width = bar.getAttribute('data-w') + '%'; });
        }).catch(function(){
          if(container.isConnected) store.innerHTML = row('Quota', 'Unavailable');
        });
      } else {
        store.innerHTML = row('Quota', 'Unavailable');
      }
      var pads = padList();
      q('[data-dv-pads]').innerHTML = pads.length ? '<ul class="case-list">' + pads.map(function(p){
        return '<li>' + esc(p.id) + ' — ' + p.axes + ' axes (' + esc(p.ax) + '), ' + esc(p.btns) + '</li>';
      }).join('') + '</ul>' :
        '<p class="app-p">No gamepads detected — press any button on a controller, then hit Refresh.</p>';
      audioFp(q('[data-dv-afp]'));
      var cfp = q('[data-dv-gpu]').querySelectorAll('.v');
      if(cfp[1]) cfp[1].textContent = canvasFp();
    }
    container.querySelector('[data-dv-refresh]').addEventListener('click', draw);
    draw();
  }
};

function wallpaperOptions(){
  return [
    {id:'auto', label:'Default', thumb:'images/wallpaper-1920.jpg'},
    {id:'code-1920', label:'Midnight Code', thumb:'images/wallpaper-1920.jpg'},
    {id:'code-828', label:'Midnight Lite', thumb:'images/wallpaper-828.jpg'},
    {id:'original', label:'Original 4K', thumb:'images/wallpaper-1920.jpg'}
  ];
}
function setWallpaperImage(id){
  var el = document.querySelector('.wallpaper');
  if(!el) return;
  if(!id || id === 'auto'){ el.style.backgroundImage = ''; return; }
  if(id === 'code-1920') el.style.backgroundImage = 'image-set(url("images/wallpaper-1920.webp") type("image/webp"), url("images/wallpaper-1920.jpg") type("image/jpeg"))';
  else if(id === 'code-828') el.style.backgroundImage = 'image-set(url("images/wallpaper-828.webp") type("image/webp"), url("images/wallpaper-828.jpg") type("image/jpeg"))';
  else if(id === 'original') el.style.backgroundImage = 'url("images/developer-coding-7680x4320-13642.png")';
}
function applyWallpaper(id){
  try { localStorage.setItem('tcos-wallpaper', id || 'auto'); } catch(e){}
  setWallpaperImage(id);
}
function restoreWallpaper(){
  var id = 'auto';
  try { id = localStorage.getItem('tcos-wallpaper') || 'auto'; } catch(e){}
  setWallpaperImage(id);
}
function applyTaskAlign(mode){
  try { localStorage.setItem('tcos-taskalign', mode === 'left' ? 'left' : 'center'); } catch(e){}
  var bar = document.getElementById('taskbar');
  if(bar) bar.classList.toggle('align-left', mode === 'left');
}
function restoreTaskAlign(){
  var mode = 'center';
  try { mode = localStorage.getItem('tcos-taskalign') || 'center'; } catch(e){}
  var bar = document.getElementById('taskbar');
  if(bar) bar.classList.toggle('align-left', mode === 'left');
}

/* icon metadata for desktop / start menu / mobile home */
var ICON_LIST = [
  {app:'about-me', label:'about-me.md', kind:'file', ext:'md', color:'var(--blue)'},
  {app:'projects', label:'projects.md', kind:'file', ext:'md', color:'var(--blue)'},
  {app:'skills', label:'skills.json', kind:'file', ext:'json', color:'var(--accent)'},
  {app:'contact', label:'contact.md', kind:'file', ext:'md', color:'var(--blue)'},
  {app:'resume', label:'resume.pdf', kind:'file', ext:'pdf', color:'var(--danger)'},
  {app:'github', label:'github.url', kind:'link', href:DATA.contact.github},
  {app:'lab', label:'lab/', kind:'folder'},
  {app:'terminal', label:'terminal', kind:'app'}
];

function iconGlyphFor(item){
  if(item.kind==='folder') return glyph('folder');
  if(item.kind==='app') return glyph('app');
  if(item.kind==='link') return glyph('link', null, 'var(--blue)');
  return glyph('file', item.ext, item.color);
}
