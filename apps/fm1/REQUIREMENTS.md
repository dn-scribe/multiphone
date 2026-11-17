# FM-1 Clone — Requirements

Two phones: one is the keyboard, the other is the controls surface for
an FM synth. Inspired by the M-VAVE FM-1 hardware synth and its
"Felucca" community firmware — naming/engine concepts only, see
`adr/0001`.

## Decided and built (v1)
- [x] No real FM-1 hardware or Felucca firmware code involved — a
  from-scratch Web Audio FM synth (`adr/0001`).
- [x] Android first: primary target is Chrome on Android; other
  browsers are best-effort, not a blocker (`adr/0002`).
- [x] Two phone roles — "Keyboard" and "Controls" — picked after
  host/join, kept in sync over `shared/multiphone.js` (the same
  networking layer built for Phone Simon).
- [x] 2-operator FM voice (sine modulator, selectable carrier waveform),
  with ratio, FM amount (modulation index), ADSR, and volume as the
  full parameter set — not a 1:1 clone of Felucca's 13 engines
  (`adr/0003`).
- [x] The Keyboard phone always synthesizes and plays its own audio
  locally — only patch *changes* travel over the network, never audio
  or note timing, so there's no playable-note latency (`adr/0004`).
- [x] Either phone works solo: Keyboard plays with whatever patch it
  last received (or the default preset) even with nobody connected;
  Controls has a "▶️ Hear it" button to preview the current patch
  (bounded to a fixed short duration — never sustains forever),
  with or without a Keyboard phone connected (`adr/0004`, `adr/0009`).
- [x] Keyboard UI: one row of 13 flat piano-style keys (white/black
  coloring, not true piano key shapes) spanning an octave + 1, with
  octave up/down buttons (range octave 1-7). Multi-touch works for
  free since each key is its own element with its own pointer
  handlers.
- [x] Controls UI: 4 quick presets (E.Piano, Bell, Bass, Brass), carrier
  waveform picker, and sliders for ratio / FM amount / attack / decay /
  sustain / release / volume. Shows a "now playing" readout driven by
  note events from the Keyboard phone(s).
- [x] Room code + QR-to-join, reusing the same pattern as Phone Simon
  (letters-only 4-char code, `?room=CODE` link, QR shown behind a
  "Room: ABCD" pill so it doesn't block using the app while waiting).
- [x] Host relays any message it receives from one peer to all other
  peers (`adr/0005`), so a 3rd phone (e.g. a second Keyboard) can join
  and see the same patch/note traffic — not required, but not blocked
  either.
- [x] Patch and octave persist across reloads via `localStorage`,
  **per phone only** — no sync between phones, and nothing recoverable
  if you switch to a different phone (`adr/0007`, supersedes
  `adr/0006`). It's the user's responsibility to return to the same
  phone to get a saved patch back.
- [x] Installable as its own home-screen app (`manifest.json` + icons,
  `apple-touch-icon` for iOS) — see the root `README.md`'s "Installing
  an app to a home screen" section for the general pattern.
- [x] Versioned independently (`apps.json`'s `"version"` field,
  semantic versioning) — see `/version.html` for every app's current
  version.
- [x] **Single Phone Mode**: a real, first-class way to use the whole
  app alone, not a debug toggle — a third button on the role screen
  mounts both the Keyboard and Controls panels locally (no network),
  side by side and both live at once on a wide screen, or switchable
  one at a time with a bar at top on a narrow one, never losing
  either panel's state when switching (`adr/0008`). Built on new
  generic infra (`shared/single-phone.js` + `.css`) any future
  multi-role app can reuse the same way.

## Open questions / possible future work
- [ ] Naming/saving more than one patch, or sharing a patch between
  phones (today: one unnamed patch remembered per phone).
- [ ] More than 2 operators / selectable algorithms (closer to a true
  multi-op FM synth), if the 2-op voice feels too thin.
- [ ] Live-updating already-held notes when a Controls slider moves
  (currently a slider change only affects *new* notes going forward —
  a note already sounding keeps the envelope/timbre it started with).
- [ ] Visual feedback on the Controls screen when more than one
  Keyboard phone is connected (currently "now playing" just shows the
  latest note from any Keyboard).
- [ ] Validation/guard rails if both phones pick the same role (v1:
  allowed, just means no Keyboard — or two independent Controls with
  no one playing).

## Explicitly out of scope (for now)
- Talking to real FM-1 hardware over MIDI/USB — ruled out, see
  `adr/0001`. Could be revisited later as an optional, isolated
  add-on if that changes, without becoming a requirement of the core
  app.
