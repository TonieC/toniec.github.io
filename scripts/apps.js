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
      ['about','projects','skills','lab','explorer','contact','github','resume','neofetch','whoami','ls','open <file>','clear'].forEach(function(c){ line('  '+c); });
    },
    about:function(){ ctx.openApp('about-me'); line('Opening about-me.md ...'); },
    projects:function(){ ctx.openApp('projects'); line('Opening projects.md ...'); },
    skills:function(){ ctx.openApp('skills'); line('Opening skills.json ...'); },
    lab:function(){ ctx.openApp('lab'); line('Opening lab/ ...'); },
    explorer:function(){ ctx.openApp('explorer'); line('Opening explorer ...'); },
    contact:function(){ ctx.openApp('contact'); line('Opening contact.md ...'); },
    resume:function(){ ctx.openApp('resume'); line('Opening resume.pdf ...'); },
    github:function(){ line('Opening '+DATA.contact.github+' ...'); window.open(DATA.contact.github,'_blank','noopener'); },
    whoami:function(){ line('tonie — developer, Philippines'); },
    ls:function(){ line('about-me.md  projects.md  skills.json  contact.md  resume.pdf  github.url  lab/  explorer'); },
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
      var map = {'about-me.md':'about-me','about':'about-me','projects.md':'projects','projects':'projects','skills.json':'skills','skills':'skills','contact.md':'contact','contact':'contact','resume.pdf':'resume','resume':'resume','lab':'lab','lab/':'lab','explorer':'explorer'};
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
        b.addEventListener('contextmenu', function(e){
          e.preventDefault();
          window.__tcosExplorerOpen = { path:'/Home/Apps' };
          if(WM.isOpen('explorer')) WM.close('explorer');
          WM.open('explorer');
          showToast('File location: /Home/Apps');
        });
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
      var label = tmLabel(target);
      if(admin && window.TCOS_uac){
        window.TCOS_uac(label, function(ok){
          if(!ok) return;
          closeRunDlg();
          WM.open(target);
          draw();
          showToast('Running with administrative privileges.');
        });
        return;
      }
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
    var fsFile = null;
    if(window.__tcosOpenFile){
      fsFile = window.__tcosOpenFile;
      window.__tcosOpenFile = null;
    }
    function stats(){
      var words = area.value.trim() ? area.value.trim().split(/\s+/).length : 0;
      count.textContent = words + (words === 1 ? ' word' : ' words');
    }
    if(fsFile && fsFile.content !== undefined){
      area.value = fsFile.content;
      saved.textContent = 'Editing ' + fsFile.name;
    } else {
      try { area.value = localStorage.getItem('tcos-note') || ''; } catch(e){}
    }
    stats();
    area.addEventListener('input', function(){
      stats();
      saved.textContent = 'Saving…';
      clearTimeout(timer);
      timer = setTimeout(function(){
        if(!container.isConnected) return;
        try {
          if(fsFile && window.TCOS_fs){ window.TCOS_fs.write(fsFile.path, area.value); }
          else localStorage.setItem('tcos-note', area.value);
        } catch(e){}
        saved.textContent = 'Saved ' + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      }, 600);
    });
  }
};

APPS['settings'] = {
  title:'Settings', kind:'app',
  render:function(){
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    var sound = true, dnd = false, night = false, bt = true, air = false;
    try {
      sound = localStorage.getItem('tcos-sound') !== '0';
      dnd = localStorage.getItem('tcos-dnd') === '1';
      night = localStorage.getItem('tcos-night') === '1';
      bt = localStorage.getItem('tcos-bt') !== '0';
      air = localStorage.getItem('tcos-air') === '1';
    } catch(e){}
    var current = 'auto', align = 'center', accent = 'gold';
    try {
      current = localStorage.getItem('tcos-wallpaper') || 'auto';
      align = localStorage.getItem('tcos-taskalign') || 'center';
      accent = localStorage.getItem('tcos-accent') || 'gold';
    } catch(e){}
    var wps = wallpaperOptions();
    var secs = [
      ['system','System'], ['personalization','Personalization'], ['apps','Apps'],
      ['network','Network'], ['gaming','Gaming'], ['privacy','Privacy'],
      ['accessibility','Accessibility'], ['updates','Updates'], ['about','About']
    ];
    var vol = 100, bright = 100;
    try {
      var v = parseInt(localStorage.getItem('tcos-volume'), 10);
      if(!isNaN(v)) vol = Math.max(0, Math.min(100, v));
      var b = parseInt(localStorage.getItem('tcos-bright'), 10);
      if(!isNaN(b)) bright = Math.max(40, Math.min(100, b));
    } catch(e){}
    var pads = 0;
    try {
      var gps = navigator.getGamepads ? navigator.getGamepads() : [];
      for(var gi = 0; gi < gps.length; gi++) if(gps[gi]) pads++;
    } catch(e){}
    var storeBytes = 0, storeKeys = 0;
    try {
      for(var ki = 0; ki < localStorage.length; ki++){
        var kk = localStorage.key(ki);
        if(kk && kk.indexOf('tcos-') === 0){
          storeKeys++;
          storeBytes += (localStorage.getItem(kk) || '').length + kk.length;
        }
      }
    } catch(e){}
    function toggle(id, t, d, on, label){
      return '<div class="set-row"><div><div class="t">' + t + '</div><div class="d">' + d + '</div></div>' +
        '<button class="set-toggle' + (on ? ' on' : '') + '" data-set-' + id + ' role="switch" aria-checked="' + on + '" aria-label="' + label + '"></button></div>';
    }
    return '<div class="app-scroll">' +
      '<p class="app-eyebrow"># settings</p>' +
      '<h1 class="app-h1">Settings</h1>' +
      '<div class="set-layout">' +
        '<div class="set-side" role="tablist" aria-label="Settings sections">' +
          secs.map(function(s, i){
            return '<button class="set-navbtn' + (i === 0 ? ' active' : '') + '" data-set-tab="' + s[0] + '" role="tab" aria-selected="' + (i === 0) + '">' + s[1] + '</button>';
          }).join('') +
        '</div>' +
        '<div class="set-main">' +
          '<div class="set-pane" data-set-pane="system">' +
            '<div class="set-label">Sound</div>' +
            toggle('sound', 'Notification sounds', 'Play a sound when a notification arrives.', sound, 'Toggle notification sounds') +
            '<div class="set-row"><div><div class="t">Volume</div><div class="d">TC/OS sounds only.</div></div><input class="m-set-slider" data-set-vol type="range" min="0" max="100" value="' + vol + '" aria-label="TC/OS volume" /></div>' +
            '<div class="set-label">Focus</div>' +
            toggle('dnd', 'Do Not Disturb', 'Silence notification popups. New items still collect silently.', dnd, 'Toggle do not disturb') +
            '<div class="set-label">Display</div>' +
            '<div class="set-row"><div><div class="t">Brightness</div><div class="d">Dim the TC/OS screen.</div></div><input class="m-set-slider" data-set-bright type="range" min="40" max="100" value="' + bright + '" aria-label="Screen brightness" /></div>' +
            toggle('night', 'Night light', 'Warm tint for late sessions.', night, 'Toggle night light') +
            '<div class="set-row"><div><div class="t">Warmth</div><div class="d"><span id="night-temp-val">60% warm</span> · Cooler to warmer.</div></div><input class="m-set-slider" data-night-temp type="range" min="0" max="100" value="60" aria-label="Night light warmth" /></div>' +
            '<div class="set-label">Recovery</div>' +
            '<div class="set-row"><div><div class="t">Reset TC/OS data</div><div class="d">Clear positions, recents, notes, and preferences.</div></div><button class="case-btn set-danger" data-set-reset>Reset</button></div>' +
          '</div>' +
          '<div class="set-pane hidden" data-set-pane="personalization">' +
            '<div class="set-label">Appearance</div>' +
            toggle('theme', 'Light theme', 'Switch TC/OS to a light appearance.', light, 'Toggle light theme') +
            '<div class="set-label">Accent color</div>' +
            '<div class="seg-group">' +
              '<button class="acc-swatch acc-gold' + (accent === 'gold' ? ' active' : '') + '" data-acc="gold" aria-label="Gold accent">Gold</button>' +
              '<button class="acc-swatch acc-blue' + (accent === 'blue' ? ' active' : '') + '" data-acc="blue" aria-label="Blue accent">Blue</button>' +
              '<button class="acc-swatch acc-green' + (accent === 'green' ? ' active' : '') + '" data-acc="green" aria-label="Green accent">Green</button>' +
              '<button class="acc-swatch acc-purple' + (accent === 'purple' ? ' active' : '') + '" data-acc="purple" aria-label="Purple accent">Purple</button>' +
            '</div>' +
            '<div class="set-label">Wallpaper</div>' +
            '<div class="wp-grid">' + wps.map(function(w){
              return '<button class="wp-opt' + (current === w.id ? ' active' : '') + '" data-wp="' + w.id + '"><img src="' + w.thumb + '" alt="" loading="lazy" /><span class="n">' + esc(w.label) + '</span></button>';
            }).join('') + '</div>' +
            '<div class="set-label">Taskbar</div>' +
            '<div class="set-row"><div><div class="t">Alignment</div><div class="d">Center icons like Windows 11, or align them left.</div></div></div>' +
            '<div class="seg-group">' +
              '<button class="seg-btn' + (align === 'left' ? '' : ' active') + '" data-align="center">Centered</button>' +
              '<button class="seg-btn' + (align === 'left' ? ' active' : '') + '" data-align="left">Left</button>' +
            '</div>' +
          '</div>' +
          '<div class="set-pane hidden" data-set-pane="apps">' +
            '<div class="set-label">Installed apps</div><div data-set-apps></div>' +
          '</div>' +
          '<div class="set-pane hidden" data-set-pane="network">' +
            '<div class="set-label">Network &amp; Internet</div>' +
            '<div class="set-row"><div><div class="t">Status</div><div class="d" data-set-netstate>Checking…</div></div></div>' +
            toggle('bt', 'Bluetooth', 'Toggles the tray indicator.', bt, 'Toggle bluetooth') +
            toggle('air', 'Airplane mode', 'Mutes the network indicator.', air, 'Toggle airplane mode') +
          '</div>' +
          '<div class="set-pane hidden" data-set-pane="gaming">' +
            '<div class="set-label">Gaming</div>' +
            '<div class="set-row"><div><div class="t">Controllers</div><div class="d">' + pads + ' connected. Press any button, then reopen.</div></div></div>' +
          '</div>' +
          '<div class="set-pane hidden" data-set-pane="privacy">' +
            '<div class="set-label">Privacy</div>' +
            '<div class="set-row"><div><div class="t">Local data</div><div class="d">' + storeKeys + ' keys · ' + Math.round(storeBytes / 1024) + ' KB. Everything stays in this browser.</div></div></div>' +
            '<div class="set-row"><div><div class="t">Clear notifications</div><div class="d">Forget which notices were already shown.</div></div><button class="case-btn" data-set-clearnotif>Clear</button></div>' +
          '</div>' +
          '<div class="set-pane hidden" data-set-pane="accessibility">' +
            '<div class="set-label">Accessibility</div>' +
            '<div class="set-row"><div><div class="t">Reduced motion</div><div class="d">Follows your device setting: ' + (prefersReducedMotion() ? 'On' : 'Off') + '.</div></div></div>' +
            '<div class="set-row"><div><div class="t">Keyboard shortcuts</div><div class="d">Ctrl+Shift+Esc task manager · Ctrl+Alt+End security · Alt+Tab switcher · Win+Arrows snap · ` terminal</div></div></div>' +
          '</div>' +
          '<div class="set-pane hidden" data-set-pane="updates">' +
            '<div class="set-label">Updates</div>' +
            '<div class="set-row"><div><div class="t">TC/OS 2.x — dev channel</div><div class="d">Static site — refresh fetches the latest build.</div></div><button class="case-btn" data-set-check>Check</button></div>' +
          '</div>' +
          '<div class="set-pane hidden" data-set-pane="about">' +
            '<div class="set-label">About</div>' +
            '<div class="set-row"><div><div class="t">Tonie C. — Developer</div><div class="d">Philippines · Remote</div></div><button class="case-btn" data-set-sysinfo>System info</button></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  },
  init:function(container, ctx){
    var tabs = container.querySelectorAll('[data-set-tab]');
    var panes = container.querySelectorAll('[data-set-pane]');
    function show(id){
      tabs.forEach(function(t){
        var on = t.getAttribute('data-set-tab') === id;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on);
      });
      panes.forEach(function(p){ p.classList.toggle('hidden', p.getAttribute('data-set-pane') !== id); });
    }
    tabs.forEach(function(t){
      t.addEventListener('click', function(){ show(t.getAttribute('data-set-tab')); });
    });
    if(window.__tcosSettingsSection){
      show(window.__tcosSettingsSection);
      window.__tcosSettingsSection = null;
    }
    function flip(btn, key, val){
      btn.classList.toggle('on', val);
      btn.setAttribute('aria-checked', val);
      try { localStorage.setItem(key, val ? '1' : '0'); } catch(e){}
    }
    function wireToggle(sel, key, fn){
      var b = container.querySelector(sel);
      if(b) b.addEventListener('click', function(){
        var on = !b.classList.contains('on');
        flip(b, key, on);
        if(fn) fn(on);
      });
    }
    wireToggle('[data-set-sound]', 'tcos-sound', null);
    wireToggle('[data-set-dnd]', 'tcos-dnd', function(){
      if(window.TCOS_device) window.TCOS_device.refresh();
    });
    wireToggle('[data-set-night]', 'tcos-night', function(){
      if(window.TCOS_night) window.TCOS_night();
    });
    wireToggle('[data-set-bt]', 'tcos-bt', function(){
      if(window.TCOS_device) window.TCOS_device.refresh();
    });
    wireToggle('[data-set-air]', 'tcos-air', function(){
      if(window.TCOS_device) window.TCOS_device.refresh();
    });
    /* theme toggle uses the real theme, synced manually */
    var themeBtn = container.querySelector('[data-set-theme]');
    if(themeBtn) themeBtn.addEventListener('click', function(){
      toggleTheme();
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      themeBtn.classList.toggle('on', light);
      themeBtn.setAttribute('aria-checked', light);
    });
    var vol = container.querySelector('[data-set-vol]');
    if(vol) vol.addEventListener('input', function(){
      if(window.TCOS_device) window.TCOS_device.setVolume(parseInt(vol.value, 10));
    });
    var bright = container.querySelector('[data-set-bright]');
    if(bright) bright.addEventListener('input', function(){
      if(window.TCOS_device) window.TCOS_device.setBrightness(parseInt(bright.value, 10));
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
    container.querySelectorAll('[data-acc]').forEach(function(b){
      b.addEventListener('click', function(){
        if(window.TCOS_accent) window.TCOS_accent(b.getAttribute('data-acc'));
        container.querySelectorAll('[data-acc]').forEach(function(x){ x.classList.toggle('active', x === b); });
      });
    });
    var appsEl = container.querySelector('[data-set-apps]');
    if(appsEl){
      var seen = {};
      var rows = [];
      ICON_LIST.forEach(function(m){ if(!seen[m.app] && APPS[m.app]){ seen[m.app] = 1; rows.push(m.app); } });
      ['taskmanager', 'calculator', 'notepad', 'settings', 'deviceinfo', 'sysinfo', 'about-tcos', 'explorer'].forEach(function(id){
        if(!seen[id] && APPS[id]){ seen[id] = 1; rows.push(id); }
      });
      appsEl.innerHTML = rows.map(function(id){
        var app = APPS[id];
        return '<div class="set-row"><div><div class="t">' + esc(app.title) + '</div><div class="d">' + esc(id) + '</div></div>' +
          '<button class="case-btn" data-open-app="' + esc(id) + '">Open</button></div>';
      }).join('');
      appsEl.querySelectorAll('[data-open-app]').forEach(function(b){
        b.addEventListener('click', function(){ ctx.openApp(b.getAttribute('data-open-app')); });
      });
    }
    var netState = container.querySelector('[data-set-netstate]');
    if(netState) netState.textContent = (navigator.onLine !== false) ? 'Online' : 'Offline';
    var clearBtn = container.querySelector('[data-set-clearnotif]');
    if(clearBtn) clearBtn.addEventListener('click', function(){
      try { localStorage.removeItem('tcos-notif-seen'); } catch(e){}
      showToast('Notification history cleared.');
    });
    var checkBtn = container.querySelector('[data-set-check]');
    if(checkBtn) checkBtn.addEventListener('click', function(){ showToast('TC/OS is up to date.'); });
    var sysBtn = container.querySelector('[data-set-sysinfo]');
    if(sysBtn) sysBtn.addEventListener('click', function(){ ctx.openApp('sysinfo'); });
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
      showToast('TC/OS data wiped — rebooting…');
      setTimeout(function(){ window.location.reload(); }, 700);
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

APPS['explorer'] = {
  title:'File Explorer', kind:'folder',
  render:function(){
    return '<div class="fx-ex">' +
      '<div class="fx-ex-bar">' +
        '<button class="fx-ex-nav" data-ex-nav="back" aria-label="Back">‹</button>' +
        '<button class="fx-ex-nav" data-ex-nav="fwd" aria-label="Forward">›</button>' +
        '<button class="fx-ex-nav" data-ex-nav="up" aria-label="Up">∧</button>' +
        '<div class="fx-ex-crumbs" data-ex-crumbs></div>' +
      '</div>' +
      '<div class="fx-ex-tools">' +
        '<input class="fx-ex-search" data-ex-search type="text" placeholder="Search this folder" autocomplete="off" aria-label="Search this folder" />' +
        '<button class="fx-ex-tool" data-ex-tool="new">New folder</button>' +
        '<button class="fx-ex-tool" data-ex-tool="file">New file</button>' +
        '<button class="fx-ex-tool" data-ex-tool="view">List</button>' +
        '<button class="fx-ex-tool" data-ex-tool="sort">Name</button>' +
      '</div>' +
      '<div class="fx-ex-list" data-ex-list></div>' +
      '<div class="fx-ex-status" data-ex-status></div>' +
      '<div class="fx-ctx hidden" data-ex-ctx role="menu"></div>' +
      '<div class="fx-prop hidden" data-ex-prop></div>' +
    '</div>';
  },
  init:function(container, ctx){
    var FS = window.TCOS_fs;
    var root = container.querySelector('.fx-ex');
    var listEl = container.querySelector('[data-ex-list]');
    var crumbsEl = container.querySelector('[data-ex-crumbs]');
    var statusEl = container.querySelector('[data-ex-status]');
    var searchEl = container.querySelector('[data-ex-search]');
    var ctxEl = container.querySelector('[data-ex-ctx]');
    var propEl = container.querySelector('[data-ex-prop]');
    var viewBtn = container.querySelector('[data-ex-tool="view"]');
    var sortBtn = container.querySelector('[data-ex-tool="sort"]');

    var cwd = '/Home';
    var hist = ['/Home'], hi = 0;
    var selected = [];
    var sortMode = 'name';
    var viewMode = 'list';
    var filter = '';
    var clip = { paths:[], cut:false };
    var renamePath = null;

    if(window.__tcosExplorerOpen){
      var req = window.__tcosExplorerOpen;
      window.__tcosExplorerOpen = null;
      if(req.path && FS.get(req.path)) cwd = req.path;
      hist = [cwd]; hi = 0;
    }

    function full(dir, name){ return (dir === '/' ? '' : dir) + '/' + name; }
    function fmtDate(t){
      try { return new Date(t).toLocaleDateString([], {month:'short', day:'numeric'}) + ' ' +
        new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
      catch(e){ return '—'; }
    }
    function iconFor(node){
      if(node.type === 'dir') return '<span class="glyph-folder" aria-hidden="true"></span>';
      if(node.kind === 'link' && node.app){
        if(node.app.indexOf('project-') === 0) return '<span class="glyph-file ext-purple" aria-hidden="true"></span>';
        return '<span class="glyph-app" aria-hidden="true">>_</span>';
      }
      var ext = (node.name.split('.').pop() || 'txt').slice(0, 4);
      var color = node.kind === 'image' ? 'var(--green)' : (node.kind === 'audio' ? 'var(--purple)' : 'var(--blue)');
      return '<span class="glyph-file ' + extClass(color) + '" aria-hidden="true"><span class="glyph-ext">.' + esc(ext) + '</span></span>';
    }
    function metaFor(node){
      if(node.type === 'dir') return 'Folder';
      if(node.kind === 'link') return 'Shortcut';
      if(node.kind === 'image') return 'Image · ' + FS.fmtSize(node.size || 0);
      if(node.kind === 'audio') return 'Audio · ' + FS.fmtSize(node.size || 0);
      return 'Text · ' + FS.fmtSize(node.content ? node.content.length : 0);
    }

    function nav(path, push){
      if(!FS.get(path)) return;
      cwd = path;
      if(push !== false){
        hist = hist.slice(0, hi + 1);
        hist.push(path);
        hi = hist.length - 1;
      }
      selected = [];
      renamePath = null;
      draw();
    }

    function sortedKids(){
      var kids = FS.list(cwd) || [];
      if(filter) kids = kids.filter(function(k){ return k.name.toLowerCase().indexOf(filter) > -1; });
      var by = {
        name:function(a, b){ return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; },
        type:function(a, b){
          var ta = a.type === 'dir' ? 0 : 1, tb = b.type === 'dir' ? 0 : 1;
          return (ta - tb) || by.name(a, b);
        },
        date:function(a, b){ return (b.mtime || 0) - (a.mtime || 0); }
      }[sortMode];
      return kids.sort(by);
    }

    function draw(){
      if(!container.isConnected) return;
      /* crumbs */
      var ps = cwd.split('/').filter(function(p){ return p; });
      var html = '<button class="fx-crumb' + (cwd === '/Home' && ps.length === 1 ? '' : '') + '" data-crumb="/">Home</button>';
      var acc = '';
      ps.slice(1).forEach(function(p){
        acc += '/' + p;
        html += '<span class="fx-crumb-sep">/</span><button class="fx-crumb" data-crumb="/Home' + esc(acc) + '">' + esc(p) + '</button>';
      });
      crumbsEl.innerHTML = html;
      crumbsEl.querySelectorAll('[data-crumb]').forEach(function(b){
        b.addEventListener('click', function(){
          var t = b.getAttribute('data-crumb');
          nav(t === '/' ? '/Home' : t);
        });
      });
      root.querySelectorAll('[data-ex-nav]').forEach(function(b){
        var act = b.getAttribute('data-ex-nav');
        b.disabled = act === 'back' ? hi <= 0 : act === 'fwd' ? hi >= hist.length - 1 : cwd === '/Home';
      });

      /* rows */
      var kids = sortedKids();
      listEl.classList.toggle('grid', viewMode === 'grid');
      listEl.innerHTML = '';
      if(!kids.length){
        var em = document.createElement('div');
        em.className = 'tm-empty';
        em.textContent = filter ? 'No matches.' : 'This folder is empty.';
        listEl.appendChild(em);
      }
      kids.forEach(function(node){
        var p = full(cwd, node.name);
        var b = document.createElement('button');
        b.className = 'fx-erow' + (selected.indexOf(p) > -1 ? ' selected' : '');
        b.setAttribute('data-path', p);
        var inner = '<span class="glyph-wrap">' + iconFor(node) + '</span>';
        if(renamePath === p){
          inner += '<span class="fx-ename"><input type="text" value="' + esc(node.name) + '" aria-label="New name" /></span>';
        } else {
          inner += '<span class="fx-ename">' + esc(node.name) + '</span>';
        }
        inner += '<span class="fx-emeta">' + esc(metaFor(node)) + '</span>';
        inner += '<span class="fx-emeta">' + esc(fmtDate(node.mtime)) + '</span>';
        b.innerHTML = inner;
        if(renamePath === p){
          var inp = b.querySelector('input');
          inp.focus();
          inp.setSelectionRange(0, node.name.lastIndexOf('.') > 0 ? node.name.lastIndexOf('.') : node.name.length);
          inp.addEventListener('keydown', function(e){
            e.stopPropagation();
            if(e.key === 'Enter'){ commitRename(p, inp.value); }
            else if(e.key === 'Escape'){ renamePath = null; draw(); }
          });
          inp.addEventListener('blur', function(){ commitRename(p, inp.value); });
          inp.addEventListener('click', function(e){ e.stopPropagation(); });
        } else {
          b.addEventListener('click', function(e){
            if(e.ctrlKey || e.metaKey){
              var i = selected.indexOf(p);
              if(i > -1) selected.splice(i, 1);
              else selected.push(p);
              draw();
            } else if(selected.length === 1 && selected[0] === p){
              openNode(node, p);
            } else {
              selected = [p];
              draw();
            }
          });
          b.addEventListener('dblclick', function(){ openNode(node, p); });
        }
        b.addEventListener('contextmenu', function(e){
          e.preventDefault();
          e.stopPropagation();
          if(selected.indexOf(p) === -1){ selected = [p]; draw(); }
          showCtx(e.clientX, e.clientY, ctxForSelection());
        });
        listEl.appendChild(b);
      });

      /* status */
      var info = FS.storageInfo();
      statusEl.innerHTML = '<span>' + kids.length + ' items</span>' +
        '<span>' + selected.length + ' selected</span>' +
        '<span>' + FS.fmtSize(info.bytes) + ' used</span>';
      viewBtn.textContent = viewMode === 'list' ? 'Grid' : 'List';
      sortBtn.textContent = sortMode.charAt(0).toUpperCase() + sortMode.slice(1);
      hideCtx();
    }

    function commitRename(path, name){
      if(renamePath === null && !name) return;
      if(name && name.trim()) FS.rename(path, name);
      renamePath = null;
      draw();
    }

    function openNode(node, path){
      if(node.type === 'dir'){ nav(path); return; }
      if(node.kind === 'link' && node.app){
        if(node.app === 'github'){ window.open(DATA.contact.github, '_blank', 'noopener'); return; }
        ctx.openApp(node.app);
        return;
      }
      if(node.kind === 'text' || /\.(txt|md|json|log)$/i.test(node.name)){
        window.__tcosOpenFile = { name:node.name, path:path, content:node.content || '' };
        ctx.openApp('notepad');
        return;
      }
      showToast('No viewer for ' + node.kind + ' files yet.');
    }

    /* context menu */
    function menuPos(x, y){
      var r = root.getBoundingClientRect();
      return { x: Math.max(4, Math.min(x - r.left, r.width - 180)), y: Math.max(4, Math.min(y - r.top, r.height - 40)) };
    }
    function showCtx(x, y, items){
      var pos = menuPos(x, y);
      ctxEl.style.left = pos.x + 'px';
      ctxEl.style.top = pos.y + 'px';
      ctxEl.innerHTML = '';
      items.forEach(function(it){
        var b = document.createElement('button');
        b.className = 'fx-ctx-item';
        b.textContent = it.label;
        b.addEventListener('click', function(){ hideCtx(); it.fn(); });
        ctxEl.appendChild(b);
      });
      ctxEl.classList.remove('hidden');
    }
    function hideCtx(){ ctxEl.classList.add('hidden'); }
    function ctxForSelection(){
      var items = [];
      var single = selected.length === 1 ? FS.get(selected[0]) : null;
      if(single && (single.type === 'dir' || single.kind === 'link')){
        items.push({label:'Open', fn:function(){ openNode(single, selected[0]); }});
      }
      if(single && single.type === 'file' && single.kind === 'text'){
        items.push({label:'Open', fn:function(){ openNode(single, selected[0]); }});
        items.push({label:'Open with Notepad', fn:function(){ openNode(single, selected[0]); }});
      }
      if(selected.length){
        items.push({label:'Rename', fn:function(){
          if(selected.length === 1){ renamePath = selected[0]; draw(); }
          else showToast('Rename one item at a time.');
        }});
        items.push({label:'Copy', fn:function(){ clip = { paths:selected.slice(), cut:false }; showToast(selected.length + ' copied.'); }});
        items.push({label:'Cut', fn:function(){ clip = { paths:selected.slice(), cut:true }; showToast(selected.length + ' cut.'); }});
        items.push({label:'Delete', fn:function(){
          var n = FS.rm(selected);
          selected = [];
          showToast(n + ' deleted.');
          draw();
        }});
        items.push({label:'Properties', fn:function(){ showProps(selected); }});
      } else {
        items.push({label:'New folder', fn:newFolder});
        items.push({label:'New Markdown file', fn:function(){ newFile('untitled.md', '# Untitled\n'); }});
        items.push({label:'New text file', fn:function(){ newFile('untitled.txt', ''); }});
        items.push({label:'New JSON file', fn:function(){ newFile('untitled.json', '{}'); }});
        if(clip.paths.length) items.push({label:'Paste', fn:function(){ doPaste(); }});
        items.push({label:'Refresh', fn:function(){ draw(); }});
      }
      return items;
    }
    function newFolder(){
      var p = FS.mkdir(cwd, 'New folder');
      if(p){ renamePath = p; draw(); }
    }
    function newFile(name, content){
      var p = FS.touch(cwd, name, content);
      if(p){ renamePath = p; draw(); }
    }
    function doPaste(){
      if(!clip.paths.length) return;
      var n = FS.copy(clip.paths, cwd, clip.cut);
      if(clip.cut) clip = { paths:[], cut:false };
      selected = [];
      showToast(n + ' pasted.');
      draw();
    }
    function showProps(paths){
      var list = paths.map(function(p){ return FS.get(p); }).filter(function(n){ return !!n; });
      if(!list.length) return;
      var bytes = list.reduce(function(a, n){ return a + FS.size(n); }, 0);
      var rows = list.map(function(n){
        return '<div class="info-row"><span class="k">' + esc(n.name) + '</span><span class="v">' +
          esc(n.type === 'dir' ? 'Folder' : (n.kind === 'link' ? 'Shortcut' : n.kind)) + ' · ' +
          esc(FS.fmtSize(FS.size(n))) + '</span></div>';
      }).join('');
      propEl.innerHTML = '<div class="fx-prop-box" role="dialog" aria-label="Properties">' +
        '<h3>Properties' + (list.length > 1 ? ' (' + list.length + ' items)' : '') + '</h3>' +
        '<div class="info-rows">' + rows +
        '<div class="info-row"><span class="k">Total size</span><span class="v">' + esc(FS.fmtSize(bytes)) + '</span></div>' +
        '<div class="info-row"><span class="k">Location</span><span class="v">' + esc(cwd) + '</span></div>' +
        '</div><div class="contact-actions"><button class="case-btn primary" data-prop-ok>OK</button></div></div>';
      propEl.classList.remove('hidden');
      propEl.querySelector('[data-prop-ok]').addEventListener('click', function(){ propEl.classList.add('hidden'); });
    }

    /* toolbar */
    root.querySelectorAll('[data-ex-nav]').forEach(function(b){
      b.addEventListener('click', function(){
        var act = b.getAttribute('data-ex-nav');
        if(act === 'back' && hi > 0){ hi--; cwd = hist[hi]; selected = []; draw(); }
        else if(act === 'fwd' && hi < hist.length - 1){ hi++; cwd = hist[hi]; selected = []; draw(); }
        else if(act === 'up' && cwd !== '/Home'){
          var ps = cwd.split('/').filter(function(p){ return p; });
          nav(ps.length > 1 ? '/' + ps.slice(0, -1).join('/') : '/Home');
        }
      });
    });
    searchEl.addEventListener('input', function(){
      filter = searchEl.value.toLowerCase();
      draw();
    });
    viewBtn.addEventListener('click', function(){
      viewMode = viewMode === 'list' ? 'grid' : 'list';
      draw();
    });
    sortBtn.addEventListener('click', function(){
      sortMode = sortMode === 'name' ? 'type' : (sortMode === 'type' ? 'date' : 'name');
      draw();
    });
    container.querySelector('[data-ex-tool="new"]').addEventListener('click', newFolder);
    container.querySelector('[data-ex-tool="file"]').addEventListener('click', function(){ newFile('untitled.txt', ''); });
    listEl.addEventListener('contextmenu', function(e){
      e.preventDefault();
      showCtx(e.clientX, e.clientY, selected.length ? ctxForSelection() : [
        {label:'New folder', fn:newFolder},
        {label:'Paste', fn:function(){ doPaste(); }},
        {label:'Refresh', fn:function(){ draw(); }}
      ]);
    });
    listEl.addEventListener('click', function(e){
      if(e.target === listEl){ selected = []; draw(); }
    });
    propEl.addEventListener('click', function(e){
      if(e.target === propEl) propEl.classList.add('hidden');
    });
    document.addEventListener('click', function h(e){
      if(!container.isConnected){ document.removeEventListener('click', h); return; }
      if(!ctxEl.classList.contains('hidden') && !ctxEl.contains(e.target)) hideCtx();
    });
    container.addEventListener('keydown', function(e){
      var tag = (e.target.tagName || '').toLowerCase();
      if(tag === 'input' || tag === 'textarea') return;
      if(e.key === 'Delete' && selected.length){
        var n = FS.rm(selected);
        selected = [];
        showToast(n + ' deleted.');
        draw();
      }
      else if(e.key === 'F2' && selected.length === 1){ renamePath = selected[0]; draw(); }
      else if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selected.length){
        clip = { paths:selected.slice(), cut:false };
        showToast(selected.length + ' copied.');
      }
      else if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x' && selected.length){
        clip = { paths:selected.slice(), cut:true };
        showToast(selected.length + ' cut.');
      }
      else if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v'){ doPaste(); }
    });

    draw();
  }
};

/* icon metadata for desktop / start menu / mobile home */
var ICON_LIST = [
  {app:'about-me', label:'about-me.md', kind:'file', ext:'md', color:'var(--blue)'},
  {app:'projects', label:'projects.md', kind:'file', ext:'md', color:'var(--blue)'},
  {app:'skills', label:'skills.json', kind:'file', ext:'json', color:'var(--accent)'},
  {app:'contact', label:'contact.md', kind:'file', ext:'md', color:'var(--blue)'},
  {app:'resume', label:'resume.pdf', kind:'file', ext:'pdf', color:'var(--danger)'},
  {app:'github', label:'github.url', kind:'link', href:DATA.contact.github},
  {app:'lab', label:'lab/', kind:'folder'},
  {app:'explorer', label:'explorer', kind:'folder'},
  {app:'terminal', label:'terminal', kind:'app'}
];

function iconGlyphFor(item){
  if(item.kind==='folder') return glyph('folder');
  if(item.kind==='app') return glyph('app');
  if(item.kind==='link') return glyph('link', null, 'var(--blue)');
  return glyph('file', item.ext, item.color);
}
