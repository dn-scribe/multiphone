# Project notes for Claude
- Static site served by GitHub Pages from `main` /. No build step, no dependencies.
- Each app lives in `apps/<id>/` and is registered in `apps.json`. Apps link back to `../../`.
- Mobile-first design: simple, high-contrast, large fonts, plain lines, no gradients.
- Audio is synthesized with Web Audio; avoid asset files unless needed.
