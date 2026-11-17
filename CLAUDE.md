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
