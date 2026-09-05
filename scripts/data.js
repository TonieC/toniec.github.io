'use strict';

/* ============================================================
   DATA — single source of truth, mirrors the real portfolio
   ============================================================ */
var DATA = {
  name:'Tonie C.',
  role:'Developer — Philippines',
  about: {
    paragraphs:[
      "I'm **Tonie**, a developer from the Philippines who builds software across different layers of a system — from interfaces and APIs to hardware, automation, and embedded projects.",
      "Most of what I know comes from building things myself. I usually start with a rough idea, turn it into something functional, then keep breaking, fixing, and improving it until I understand the problem better.",
      "I'm currently looking for **internships, junior opportunities, freelance work, and collaborations** where I can work on real projects, solve practical problems, and keep getting better at building software."
    ],
    goals:[
      ['BUILD','**Maintainable systems** — clear code and sensible structure matter more than clever solutions.'],
      ['WORK','**Across layers** — moving between UI, servers, automation, and hardware is part of the work.'],
      ['LEARN','**By building** — working software teaches more than following another tutorial.'],
      ['COLLAB','**With other developers** — contributing to existing projects while learning how other people solve problems.'],
      ['FOCUS','**Useful software** — building things that solve an actual problem instead of existing just to demonstrate a technology.']
    ]
  },
  skills:{
    Frontend:{ items:['HTML & CSS','JavaScript','TypeScript','React','Tailwind CSS','Next.js','Framer Motion'], note:'Where I build interfaces — from simple pages to full applications, including this portfolio.' },
    Backend:{ items:['Node.js','Express','REST APIs','Python','AsyncIO','MongoDB','PostgreSQL','SQLite','Redis','Prisma','WebSockets'], note:'Building APIs, handling asynchronous workloads, working with databases, and connecting services together.' },
    Embedded:{ items:['ESP32','Arduino','C / C++','I2C / SPI','BLE / Wi-Fi','MQTT','Sensor Integration'], note:'Connecting hardware, sensors, and software — usually through microcontrollers and small IoT systems.' },
    Tooling:{ items:['Git & GitHub','Linux','NPM packages','PyPI packages','Discord API','Docker','CI/CD'], note:'The tools I use to build, test, publish, deploy, and maintain projects.' }
  },
  contact:{
    emailB64:'Y2FkaXphbDA2QGdtYWlsLmNvbQ==',
    github:'https://github.com/toniec',
    githubLabel:'github.com/toniec',
    linkedin:'https://www.linkedin.com/in/jesstonie-cadizal-8a80a9392',
    linkedinLabel:'jesstonie-cadizal',
    location:'Philippines · Remote',
    resume:'images/Cadizal Resume.pdf',
    pypi:'https://pypi.org/user/tonie06/',
    npm:'https://www.npmjs.com/~tonie06'
  },
  certs:[
    ['Responsive Web Design Certification','https://freecodecamp.org/certification/tonie06/responsive-web-design-v9'],
    ['JavaScript Certification','https://freecodecamp.org/certification/tonie06/javascript-v9']
  ],
  projects:[
    {
      id:'email-studio', name:'Email Studio', file:'email-studio', badge:'Featured Project', status:'Active',
      desc:'A self-hosted developer email IDE. Write HTML/CSS in a CodeMirror editor, preview responsive layouts, convert to email-safe HTML, and send via Gmail OAuth or any SMTP provider — all from the browser.',
      tags:['Node.js','Express','SQLite','CodeMirror','OAuth 2.0'],
      architecture:[
        'Email conversion pipeline sanitizes markup, inlines CSS, converts flex layouts to tables, and hardens the output for email clients.',
        'Compatibility analysis checks rendered output against Gmail, Outlook, Apple Mail, and Yahoo, with guidance for fixing issues.',
        'Gmail OAuth 2.0 or SMTP credentials are supported for sending, both encrypted at rest — Gmail passwords are never requested or stored.',
        'A visual editor with a property inspector and undo/redo sits alongside the code editor, backed by a sandboxed responsive preview.'
      ],
      useCases:[
        ['Newsletter Design','Build and preview HTML newsletters without fighting email client quirks.'],
        ['Transactional Emails','Convert clean HTML/CSS into email-safe markup ready to send.'],
        ['Client Delivery','Export a project as a ZIP or single HTML file for handoff.'],
        ['Compatibility Testing','Catch Gmail/Outlook rendering issues before sending to real inboxes.']
      ],
      stats:[['OAuth','Gmail send'],['SMTP','Any provider'],['Docker','Self-hosted'],['OSS','MIT licensed']],
      links:[['GitHub','https://github.com/TonieC/Email-Studio']]
    },
    {
      id:'uptime-monitor', name:'Uptime Monitor', file:'uptime-monitor', badge:'Featured Project', status:'Active',
      desc:'A self-hosted uptime monitoring application for tracking the availability and performance of web services. Provides continuous health checks, response-time monitoring, uptime history, and incident tracking through a focused operations dashboard.',
      tags:['JavaScript','WebSockets','HTTP','Monitoring','Self-hosted'],
      architecture:[
        'HTTP and HTTPS health checks periodically verify whether configured services are reachable and responding correctly.',
        'Response-time measurements are recorded alongside service status, allowing performance degradation to be distinguished from complete outages.',
        'WebSocket-based updates keep the dashboard synchronized with monitoring activity without requiring constant page refreshes.',
        'A modular frontend separates dashboard, service details, incidents, charts, uptime visualization, and modal interactions into dedicated components.'
      ],
      useCases:[
        ['Website Monitoring','Continuously check websites and web services for availability and unexpected downtime.'],
        ['API Monitoring','Track HTTP endpoints and identify failed requests or abnormal response times.'],
        ['Performance Tracking','Monitor response times over time to identify services becoming slower before they completely fail.'],
        ['Incident Tracking','Keep a record of service outages and degraded states for later review.']
      ],
      stats:[['HTTP','Health checks'],['Live','Real-time status'],['Uptime','History tracking'],['OSS','Open source']],
      links:[['GitHub','https://github.com/TonieC/Uptime-Monitor']]
    },
    {
      id:'tflows', name:'tflows.py', file:'tflows', badge:'Featured Project', status:'Published',
      desc:'A lightweight Python framework for building Discord bots with script-based commands. Define bot behavior with simple scripts, use built-in functions and variables, and extend the framework with custom Python functionality while retaining the flexibility of discord.py.',
      tags:['Python','discord.py','Scripting','Open Source','PyPI'],
      architecture:[
        'Built on discord.py, with FlowBot providing the main bot interface while retaining access to discord.py\u2019s functionality.',
        'Script engine executes registered commands line by line, resolving functions and variables through the framework\u2019s FunctionRegistry.',
        'Built-in functions and variables provide common Discord bot functionality without requiring every action to be implemented as Python code.',
        'Scripts now branch with conditionals, run as slash commands, enforce cooldowns and permission guards, persist per-server state, and run on schedules or event triggers.',
        'Extensible registry system allows developers to add their own Python functions, variables, and aliases when scripts need additional functionality.'
      ],
      useCases:[
        ['Discord Bots','Build commands and bot functionality using concise script-based definitions.'],
        ['Server Automation','Automate common Discord actions such as replies, reactions, message management, delays, and embeds — or schedule scripts and react to server events.'],
        ['Rapid Prototyping','Create functional Discord commands without writing a separate Python function for every simple command.'],
        ['Python Extensions','Combine scripts with custom Python functions, variables, and normal discord.py features for more complex functionality.']
      ],
      stats:[['v1.0.0','PyPI version'],['OSS','Open source'],['Scripts','Script-based'],['discord.py','Based on']],
      links:[['GitHub','https://github.com/TonieC/tflows.py'],['PyPI','https://pypi.org/project/tflows/'],['Docs','https://toniec.github.io/tflows']]
    }
  ],
  lab:[
    {
      id:'siklista', name:'Siklista', file:'siklista', badge:'Horror Game', status:'Under development',
      desc:'A short horror game about a cyclist descending the Cordillera mountains at 3:00 AM. Reach La Union before sunrise while managing energy, avoiding supernatural creatures, and making choices that affect your ending.',
      tags:['Game','Horror','Survival'],
      architecture:[
        'Descend isolated Cordillera roads before sunrise.',
        'Manage energy and stop at sari-sari stores for supplies.',
        'Control your speed to avoid crashes and injuries.',
        'Encounter creatures inspired by Philippine mythology.',
        'Make choices that affect your journey and ending.'
      ],
      useCases:[
        ['01 — Survive','Avoid creatures and survive the night.'],
        ['02 — Manage Energy','Find food and drinks to keep cycling.'],
        ['03 — Control Speed','Ride carefully through dangerous roads.'],
        ['04 — Choose Your Fate','Your decisions determine the ending.']
      ],
      stats:[['30m–2h','Playtime'],['Horror','Genre'],['In dev','Status']],
      links:[['Itch.io','https://tonie6.itch.io/siklista']],
      archLabel:'Game Overview', useCaseLabel:'Core Gameplay'
    }
  ]
};

/* ============================================================
   HELPERS
   ============================================================ */
function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }
function mdInline(s){
  return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
}
function prefersReducedMotion(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function getContactEmail(){ try { return atob(DATA.contact.emailB64); } catch(e){ return ''; } }
function isMobile(){ return window.matchMedia('(max-width:640px)').matches; }

/* file-type glyph factory (class-based colors — no inline styles, CSP-safe) */
function extClass(color){
  return {'var(--blue)':'ext-blue','var(--accent)':'ext-accent','var(--green)':'ext-green','var(--danger)':'ext-danger','var(--purple)':'ext-purple'}[color] || 'ext-accent';
}
function glyph(kind, ext, color){
  if(kind==='folder') return '<span class="glyph-folder" aria-hidden="true"></span>';
  if(kind==='app') return '<span class="glyph-app" aria-hidden="true">>_</span>';
  if(kind==='link') return '<span class="glyph-link" aria-hidden="true"><svg class="link-blue" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8.5 11.5l3-3"/><path d="M11 6l1.3-1.3a3 3 0 0 1 4.2 4.2L15 10.2"/><path d="M9 13.8L7.7 15.1a3 3 0 0 1-4.2-4.2L5 9.5"/></svg></span>';
  return '<span class="glyph-file '+extClass(color)+'" aria-hidden="true"><span class="glyph-ext">.'+ext+'</span></span>';
}