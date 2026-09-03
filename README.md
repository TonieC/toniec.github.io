# TC/OS — Tonie C., Developer

A personal portfolio presented as a fictional desktop operating system.
Instead of scrolling a page, visitors explore files, windows, a terminal,
and a taskbar — the way work actually feels on my computer.

**Live:** https://toniec.github.io/

## What's inside

**Desktop OS**
- Draggable, resizable, minimizable, maximizable windows with taskbar tracking
- Desktop icons: click-drag marquee select, drag-to-reorder, free placement
  with auto-arrange toggle (right-click desktop), persisted per browser
- Start menu with search + recently opened, centered like Windows 11
  (or left-aligned via Settings), clock flyout with calendar
- System tray: network status, volume, brightness, live battery, quick settings
- Shutdown / restart flows with boot replay, power menu in Start
- Task Manager (processes, performance, startup, run-new-task, `Ctrl+Shift+Esc`)
- Notification center: tray bell, panel, toast stack, sounds
- Pin/unpin apps to the taskbar, Calculator, Notepad, Settings, terminal

**Mobile OS** (≤640px)
- Home grid with search + recently opened, long-press drag reorder
- Full-screen app views, bottom nav (Home / Search / Settings)
- Settings sheet: theme, Wi-Fi/volume/brightness/battery status

**Content**
- About, skills, contact (spam-protected email reveal), resume viewer
- Project case studies: Email Studio, Uptime Monitor, `tflows.py`, Siklista
- Samples: `/samples/` (shop, portfolio, taskify, playground, notepad)

## Project structure

```
index.html          App shell + markup (JS/CSS live in folders below)
scripts/            data, apps, desktop, shell, notifications, device,
                    prefs, mobile, boot, theme-init (deferred, in order)
visual/             tokens, boot, desktop, windows, apps, taskbar, power,
                    taskmanager, notifications, calculator, notepad,
                    settings, device, responsive (?v= cache-busted)
images/             Wallpapers (1920/828 WebP + JPEG), icons, audio, resumes
samples/            Standalone demo pages (shop, portfolio, taskify, …)
sw.js               Offline-first service worker (bump CACHE_NAME on release)
manifest.json       PWA manifest · robots.txt · sitemap.xml
404.html            Blue-screen error page
```

No frameworks, no build step, no dependencies — plain HTML/CSS/JS.

## Notes

- State (theme, wallpaper, pins, recents, notes, volume, brightness,
  notification history) lives in `localStorage` — Settings → Reset wipes it.
- `samples/` demo content is intentionally indexable,
  placeholders (`portfolio.html`) are `noindex`.
