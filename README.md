# Multiphone

Static GitHub Pages hub of small multi-phone web apps.

[**dn-scribe.github.io/multiphone**](https://dn-scribe.github.io/multiphone/) — scan to open it on another phone:

<a href="https://dn-scribe.github.io/multiphone/"><img src="assets/qr-home.png" alt="QR code linking to the Multiphone hub" width="180"></a>

- `index.html`: home page that lists the apps from `apps.json`, and shows a
  QR code (generated client-side) of its own URL, so it can be shared to
  another phone by scanning
- `assets/qr-home.png`: static QR code for the live site, embedded above
- `apps/<id>/index.html`: one self-contained app per folder
- `apps/<id>/REQUIREMENTS.md` + `apps/<id>/adr/`: each app tracks its own
  requirements and architecture decision records (ADRs) alongside its code.
  A folder can exist with just these (no `index.html` yet) while an app is
  still being planned.
- `shared/`: shared CSS and JS
  - `shared/multiphone.js`: cross-phone networking helper (one phone hosts,
    others join with a short room code; messages go peer-to-peer over
    WebRTC via PeerJS, loaded from a CDN). See the comment at the top of
    the file for the `Multiphone.host()` / `Multiphone.join()` API. Use
    this for any app where phones need to share live state, instead of
    reinventing room codes/signaling per app.
- `version.json` (hub) + `apps.json`'s `"version"` field (per app): every
  app, and the hub itself, is versioned independently with [semantic
  versioning](https://semver.org/). `version.html` lists them all. A
  version only changes when that app's behavior/requirements change —
  see its `REQUIREMENTS.md`/`adr/` for the why.

To add an app, create `apps/<id>/` and add an entry to `apps.json`.

## Installing an app to a home screen

Every app (and the hub itself) is a small installable PWA: `apps/<id>/`
has its own `manifest.json`, `icon-192.png` and `icon-512.png`. Open an
app in Chrome (Android) and use "Add to Home Screen" to get its own icon
and a standalone (no browser chrome) window; on iOS Safari use the Share
sheet's "Add to Home Screen" — it uses the `apple-touch-icon` link since
iOS doesn't read the manifest's icons. There's no offline support (no
service worker) — this just gives each app its own icon and launch
behavior, nothing more.

## Local persistence

An app may remember small bits of state across reloads using
`localStorage`, namespaced `multiphone.<id>.*` (e.g. FM-1 Clone
remembers its current patch and octave this way). This is **per phone
only** — it never syncs to any other phone, and there is no way to
recover it from a different device. If an app uses this, it's the
user's responsibility to keep using the same phone for that role to
keep that state; see the app's own `REQUIREMENTS.md`/`adr/` for specifics.
