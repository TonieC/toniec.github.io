'use strict';

/* ============================================================
   FILESYSTEM — simulated, persisted in localStorage
   Paths look like "/Home/Documents". Text file contents survive
   reloads; app-links ({kind:'link', app}) open TC/OS apps.
   ============================================================ */
(function(){
  var KEY = 'tcos-fs-v1';

  function dir(name, children){
    return { name:name, type:'dir', children:children || [], mtime:Date.now() };
  }
  function file(name, opts){
    opts = opts || {};
    return {
      name:name, type:'file',
      kind:opts.kind || 'text',
      content:opts.content || '',
      app:opts.app || null,
      size:opts.size || 0,
      mtime:opts.mtime || Date.now()
    };
  }
  function applink(name, app, ext){
    return { name:name, type:'file', kind:'link', app:app, ext:ext || '', content:'', size:0, mtime:Date.now() };
  }

  function seed(){
    return dir('', [
      dir('Home', [
        dir('Desktop', [
          file('readme.txt', { content:'Welcome to TC/OS.\n\nDouble-click files to open them.\nRight-click for more actions.' }),
          applink('about-me.md', 'about-me', 'md'),
          applink('terminal', 'terminal')
        ]),
        dir('Documents', [
          file('notes.txt', { content:'Ideas worth keeping.\n\n- Ship real software\n- Learn by building' }),
          file('todo.txt', { content:'[ ] Reply to internship email\n[x] Build a desktop OS in a browser' })
        ]),
        dir('Downloads', []),
        dir('Pictures', [
          file('wallpaper-1920.jpg', { kind:'image', size:60485 }),
          file('workshop.png', { kind:'image', size:174807 })
        ]),
        dir('Music', [
          file('startup.mp3', { kind:'audio', size:118000 })
        ]),
        dir('Videos', []),
        dir('Apps', [
          applink('about-me.md', 'about-me', 'md'),
          applink('projects.md', 'projects', 'md'),
          applink('skills.json', 'skills', 'json'),
          applink('contact.md', 'contact', 'md'),
          applink('terminal', 'terminal'),
          applink('settings', 'settings'),
          applink('task-manager', 'taskmanager'),
          applink('calculator', 'calculator'),
          applink('notepad.txt', 'notepad', 'txt'),
          applink('device-info', 'deviceinfo')
        ])
      ])
    ]);
  }

  function valid(node){
    return node && node.type === 'dir' && Array.isArray(node.children);
  }
  function load(){
    try {
      var raw = localStorage.getItem(KEY);
      if(raw){
        var tree = JSON.parse(raw);
        if(valid(tree)) return tree;
      }
    } catch(e){}
    var fresh = seed();
    save(fresh);
    return fresh;
  }
  var root = load();
  function save(tree){
    try { localStorage.setItem(KEY, JSON.stringify(tree || root)); }
    catch(e){ showToast('Storage is full — changes were not saved.'); }
  }

  function parts(path){
    return String(path || '/').split('/').filter(function(p){ return p.length; });
  }
  function get(path){
    var ps = parts(path);
    var node = root;
    for(var i = 0; i < ps.length; i++){
      if(!valid(node)) return null;
      var next = null;
      node.children.forEach(function(c){ if(c.name === ps[i]) next = c; });
      if(!next) return null;
      node = next;
    }
    return node;
  }
  function parentOf(path){
    var ps = parts(path);
    if(!ps.length) return null;
    return get('/' + ps.slice(0, -1).join('/')) || (ps.length === 1 ? root : null);
  }
  function baseOf(path){
    var ps = parts(path);
    return ps[ps.length - 1] || '';
  }
  function join(dirPath, name){
    return (dirPath === '/' ? '' : dirPath) + '/' + name;
  }
  function cleanName(name){
    name = String(name || '').trim().replace(/[\/\\]/g, '');
    return name.slice(0, 60) || 'untitled';
  }
  function uniqueName(dirNode, name){
    if(!dirNode.children.some(function(c){ return c.name === name; })) return name;
    var dot = name.lastIndexOf('.');
    var stem = dot > 0 ? name.slice(0, dot) : name;
    var ext = dot > 0 ? name.slice(dot) : '';
    var n = 2;
    while(dirNode.children.some(function(c){ return c.name === (stem + ' (' + n + ')' + ext); })) n++;
    return stem + ' (' + n + ')' + ext;
  }
  function sizeOf(node){
    if(node.type === 'file') return node.size || (node.content ? node.content.length : 0);
    return node.children.reduce(function(a, c){ return a + sizeOf(c); }, 0);
  }
  function fmtSize(n){
    if(n >= 1048576) return (n / 1048576).toFixed(1) + ' MB';
    if(n >= 1024) return Math.round(n / 1024) + ' KB';
    return n + ' B';
  }

  window.TCOS_fs = {
    root:function(){ return root; },
    get:get,
    list:function(path){
      var n = get(path);
      return (n && n.type === 'dir') ? n.children.slice() : null;
    },
    isDir:function(path){ var n = get(path); return !!n && n.type === 'dir'; },
    mkdir:function(path, name){
      var d = get(path);
      if(!d || d.type !== 'dir') return null;
      name = uniqueName(d, cleanName(name));
      var nd = dir(name);
      d.children.push(nd);
      save();
      return join(path, name);
    },
    touch:function(path, name, content){
      var d = get(path);
      if(!d || d.type !== 'dir') return null;
      name = uniqueName(d, cleanName(name));
      d.children.push(file(name, { content:content || '' }));
      save();
      return join(path, name);
    },
    rename:function(path, name){
      var ps = parts(path);
      if(!ps.length) return false;
      var p = parentOf(path);
      var node = get(path);
      if(!p || !node) return false;
      name = cleanName(name);
      if(name !== node.name && p.children.some(function(c){ return c.name === name; })) return false;
      node.name = name;
      node.mtime = Date.now();
      save();
      return true;
    },
    rm:function(paths){
      var ok = 0;
      paths.forEach(function(path){
        var p = parentOf(path);
        var b = baseOf(path);
        if(!p || !b) return;
        var i = -1;
        p.children.forEach(function(c, k){ if(c.name === b) i = k; });
        if(i > -1){ p.children.splice(i, 1); ok++; }
      });
      if(ok) save();
      return ok;
    },
    copy:function(paths, dstDir, cut){
      var d = get(dstDir);
      if(!d || d.type !== 'dir') return 0;
      var n = 0;
      var toRemove = [];
      paths.forEach(function(path){
        var node = get(path);
        if(!node || node === d) return;
        if(cut && (dstDir === path || dstDir.indexOf(path + '/') === 0)) return;
        var clone = JSON.parse(JSON.stringify(node));
        clone.name = uniqueName(d, clone.name);
        clone.mtime = Date.now();
        d.children.push(clone);
        toRemove.push(path);
        n++;
      });
      if(cut){
        toRemove.forEach(function(path){
          var p = parentOf(path);
          var b = baseOf(path);
          if(p) p.children = p.children.filter(function(x){ return x.name !== b; });
        });
      }
      if(n) save();
      return n;
    },
    write:function(path, content){
      var node = get(path);
      if(!node || node.type !== 'file') return false;
      node.content = String(content);
      node.size = 0;
      node.mtime = Date.now();
      save();
      return true;
    },
    read:function(path){
      var node = get(path);
      return (node && node.type === 'file') ? (node.content || '') : null;
    },
    size:sizeOf,
    fmtSize:fmtSize,
    storageInfo:function(){
      var files = 0, dirs = 0;
      (function walk(n){
        if(n.type === 'file') files++;
        else { dirs++; n.children.forEach(walk); }
      })(root);
      return { bytes:sizeOf(root), files:files, dirs:dirs - 1 };
    }
  };
})();
