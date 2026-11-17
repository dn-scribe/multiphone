# FM-1 Clone — Requirements

Your phones become a tiny FM synth: a Keyboard, a Controls surface,
and a Sequencer. Inspired by the M-VAVE FM-1 hardware synth and its
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
  mounts every role's panel locally (no network), side by side and
  all live at once on a wide screen, or switchable one at a time with
  a bar at top on a narrow one, never losing any panel's state when
  switching (`adr/0008`). Built on generic infra
  (`shared/single-phone.js` + `.css`) any future multi-role app can
  reuse the same way.
- [x] **Sequencer, Phase 1**: a third role. One track, 16 steps, each a
  plain on/off toggle, all playing the same fixed pitch (A4) with
  whatever patch this phone has. Tempo slider, Play/Stop, steps+tempo
  persist via `localStorage` (per phone, same tradeoff as patch/octave
  persistence). Deliberately minimal — see `adr/0010` for what's
  phased in next and why a 1:1 clone of Felucca's sequencer (4 tracks,
  64 steps, per-step chords/ties/accent/slide/chance/ratchets/
  conditions, parameter locks, song mode, live-record-with-overdub)
  isn't attempted in one step.

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
- [ ] Validation/guard rails if multiple phones pick the same role
  (v1: allowed — e.g. two Controls and no Keyboard is possible).
- [ ] Sequencer Phase 2: multiple tracks (toward Felucca's 4), each
  with its own preset; variable pattern length (16/32/64); per-step
  velocity/accent; mute/solo per track; swing.
- [ ] Sequencer Phase 3: per-step ties/slides/chords/ratchets/chance/
  conditions; parameter locks; pattern save + song mode (chaining
  patterns, like Felucca's up-to-16-section song mode); live recording
  by listening for the Keyboard's own `note` messages, with quantize.
- [ ] Sequencer timing is a plain `setInterval`, not sample-accurate
  lookahead scheduling (`adr/0010`) — revisit if later phases make
  timing precision actually matter (e.g. swing, ratchets).

## Explicitly out of scope (for now)
- Talking to real FM-1 hardware over MIDI/USB — ruled out, see
  `adr/0001`. Could be revisited later as an optional, isolated
  add-on if that changes, without becoming a requirement of the core
  app.
