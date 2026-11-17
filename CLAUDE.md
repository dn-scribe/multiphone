# Project notes for Claude
- Static site served by GitHub Pages from `main` /. No build step, no dependencies.
- Each app lives in `apps/<id>/` and is registered in `apps.json`. Apps link back to `../../`.
  A folder can exist before it has an `index.html` (planning-only); don't add it to
  `apps.json` until it's a real, usable page.
- Mobile-first design: simple, high-contrast, large fonts, plain lines, no gradients.
- Audio is synthesized with Web Audio; avoid asset files unless needed.
- Each app folder owns its own project-management docs, kept up to date alongside
  its code:
  - `REQUIREMENTS.md`: living checklist of what the app should do, grouped as
    Done / Open questions / Explicitly out of scope.
  - `adr/NNNN-title.md`: one Architecture Decision Record per significant design
    decision for that app (Status / Context / Decision / Consequences), numbered
    sequentially per app starting at `0001`.
  When you make or change a design decision for an app, or its requirements change,
  update that app's `REQUIREMENTS.md` and/or add an ADR — don't just change the code.
- Installable as a home-screen app: the hub (repo root) and every real app
  (`apps/<id>/`) has its own `manifest.json` + `icon-192.png` + `icon-512.png`
  (black background, centered emoji/icon, no gradients — generate with Pillow +
  the system's Noto Color Emoji font), linked from `<head>` with
  `<link rel="manifest" href="manifest.json">` and
  `<link rel="apple-touch-icon" href="icon-192.png">` (iOS needs the explicit
  touch-icon link; it doesn't read the manifest's icons). A new app isn't done
  until it has this, same as `REQUIREMENTS.md`.
- Semantic versioning: `apps.json` carries a `"version"` field (semver) per app;
  the repo root's `version.json` carries the hub's own version; `/version.html`
  lists all of them. Bump an app's version whenever its requirements/behavior
  change — PATCH for a fix/tweak, MINOR for an added capability, MAJOR for a
  breaking change to how it's used or how it talks over the network. An app
  still settling its core feature set (see its `REQUIREMENTS.md` "Open
  questions") stays pre-1.0 (`0.x.y`). Bump `version.json` when hub-level
  mechanics change (`index.html`, `apps.json`'s schema, `shared/`).
- Local persistence: if an app wants to remember something across reloads on
  the *same* phone (not shared with any other phone), use `localStorage` with
  keys namespaced `multiphone.<id>.*`, through small get/set helpers wrapped in
  try/catch (storage can be blocked — private browsing, permissions — and must
  degrade to "nothing persists," never crash). This is strictly per-device: it
  is the user's responsibility to return to the same phone to get that state
  back, and that tradeoff should be written into the app's `REQUIREMENTS.md`/
  `adr/`. It is never a substitute for `shared/multiphone.js` — that's for
  state that must be shared live between phones.
