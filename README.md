# Multiphone

Static GitHub Pages hub of small multi-phone web apps.

- `index.html`: home page that lists the apps from `apps.json`
- `apps/<id>/index.html`: one self-contained app per folder
- `shared/`: shared CSS and JS
  - `shared/multiphone.js`: cross-phone networking helper (one phone hosts,
    others join with a short room code; messages go peer-to-peer over
    WebRTC via PeerJS, loaded from a CDN). See the comment at the top of
    the file for the `Multiphone.host()` / `Multiphone.join()` API. Use
    this for any app where phones need to share live state, instead of
    reinventing room codes/signaling per app.

To add an app, create `apps/<id>/` and add an entry to `apps.json`.
