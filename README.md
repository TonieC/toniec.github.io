# TC/OS — Tonie C., Developer

A personal portfolio presented as a fictional desktop operating system.
Instead of scrolling a page, visitors explore files, windows, a terminal,
and a taskbar — the way work actually feels on my computer.

**Live:** https://toniec.github.io/

## What's inside

**Desktop OS**
- Draggable, resizable, minimizable, maximizable windows with taskbar tracking
- Win+Arrow snapping, Alt+Tab switcher, double-click to maximize
- Desktop icons: click-drag marquee select, drag-to-reorder, free placement
  with auto-arrange toggle (right-click desktop), persisted per browser
- Start menu with pinned apps, all-apps view, categorized search
  (apps / files / settings), recently opened, centered like Windows 11
  (or left-aligned via Settings), clock flyout with calendar
- System tray + quick settings: network, volume, brightness, night light
  with temperature slider, Bluetooth, airplane mode, live battery
- Shutdown / restart / sleep flows, lock screen, Ctrl+Alt+End security
  screen, permission confirmations
- Task Manager (processes, live performance graphs, app history, startup,
  users, details, services, run-new-task, `Ctrl+Shift+Esc`) with simulated
  process data
- File Explorer over a persisted simulated filesystem (Home, Documents,
  Apps…): navigate, search, create/rename/delete/copy/paste, properties,
  sorting, list/grid views — text files open in Notepad
- Notification center: tray bell, grouped panel, toast stack, sounds,
  do-not-disturb, per-visit onboarding notices
- Pin/unpin apps to the taskbar, Calculator, Notepad, Settings, terminal,
  and browser Device Info (GPU, storage, gamepads, fingerprints, display,
  audio)

**Mobile OS** (≤640px)
- Home grid with search + recently opened, long-press drag reorder
- Full-screen app views, bottom nav (Home / Search / Settings)
- Settings sheet: theme, Wi-Fi/volume/brightness/battery status,
  night light, do-not-disturb

**Content**
- About, skills, contact (spam-protected email reveal), resume viewer
- Project case studies: Email Studio, Uptime Monitor, `tflows.py`, Siklista
- Samples: `/samples/` (shop, portfolio, taskify, playground, notepad)

## Project structure

```
index.html          App shell + markup (JS/CSS live in folders below)
scripts/            data, apps, fs, desktop, shell, notifications, device,
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

No frameworks, no build step, and no package dependencies — plain HTML/CSS/JS.

## Controls

- `Ctrl+Shift+Esc` task manager · `Ctrl+Alt+End` security screen
- `Alt+Tab` window switcher · `Win+Arrows` snap windows · `` ` `` terminal
- `Esc` closes menus/panels · Right-click desktop, icons, and taskbar apps
  for context actions · `F2` renames in File Explorer

## Notes

- State (theme, wallpaper, pins, recents, notes, volume, brightness,
  notification history) lives in `localStorage` — Settings → Reset wipes it.
- `samples/` demo content is intentionally indexable,
  placeholders (`portfolio.html`) are `noindex`.
