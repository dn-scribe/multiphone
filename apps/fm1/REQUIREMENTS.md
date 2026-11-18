# FM-1 Clone — Requirements

Your phones become a tiny FM synth: a Keyboard, a Controls surface, a
looping Sequencer, and a non-looping Tracks writer. Inspired by the
M-VAVE FM-1 hardware synth and its "Felucca" community firmware —
naming/engine concepts only, see `adr/0001`.

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
  Controls has a "▶️ Hear it" / "⏸ Stop Preview" toggle that loops a
  bounded preview note (never sustains forever) roughly every 700ms,
  retriggering immediately on every parameter change too, so you can
  hear a sound while shaping it without re-tapping after every tweak.
  The preview pitch adopts whichever note was last actually played on
  a Keyboard phone, falling back to A4 if none has (`adr/0004`,
  `adr/0009`, `adr/0015`).
- [x] Keyboard UI: flat piano-style keys (white/black coloring, not
  true piano key shapes), with octave up/down buttons (range octave
  1-7). Multi-touch works for free since each key is its own element
  with its own pointer handlers. Always 2 octaves, following device
  orientation live: one straight row in landscape, two stacked
  organ-style rows (one octave each, normal key width) in portrait
  (`adr/0017`, `adr/0020`).
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
  plain on/off toggle, all playing the same fixed pitch (A4). Tempo
  slider, Play/Stop. Deliberately minimal — see `adr/0010`.
- [x] **Sequencer, Phase 2**: 4 tracks (toward Felucca's 4), each with
  its own instrument; a shared pattern length of 16/32/64 steps; tap a
  step to toggle on/off, tap-and-hold an *on* step to toggle **accent**
  (a fixed louder level, not yet a continuous velocity — see open
  questions); per-track Mute/Solo (solo overrides mute, standard
  mixing semantics); Swing (50-75%, pair-duration-preserving).
  Everything persists via `localStorage` per phone. Pitch is still
  fixed (A4) for every track/step — see `adr/0011` for this and the
  other scoping calls made while building it.
- [x] **Saved instrument library**: Controls can save its current
  patch as a named custom instrument ("💾 Save as Instrument"), kept
  alongside the 4 built-in presets (hold a custom one to delete it).
  Sequencer tracks pick from this same combined list, so a sound
  designed on Controls can actually be used in the Sequencer
  (`adr/0012`). Per phone only, same as everything else under
  `adr/0007`; a track whose custom instrument gets deleted elsewhere
  falls back safely rather than going silent or breaking (see
  `adr/0012`'s note on cosmetic label staleness).
- [x] **Sequencer, Phase 3**: per-step **ratchet** (1/2/3/4x
  re-trigger), **chance** (100/75/50/25%), and **condition** (All /
  play-every-other-loop ×2 / a momentary **FILL** transport button),
  via a per-track ✏️ edit mode that lets you select a step and see its
  detail controls without changing the normal tap=on/off, hold=accent
  gestures. Deliberately *not* including per-step pitch, ties, slides,
  chords, parameter locks, pattern save/song mode, or live recording —
  see `adr/0013` for why each of those stays open rather than being
  faked.
- [x] **Saved patterns + Song mode**: "💾 Save Pattern" snapshots the
  current tracks/length/swing as a named pattern (tap to restore it
  into the editor, hold to delete); each saved pattern has a ➕ to
  append it to a **Song** (an ordered list of pattern + repeat-count
  entries, ◀/▶ to adjust 1-8, ✕ to remove). **Song Mode** toggles
  whether Play loops just the current pattern (off, as before) or
  plays through the whole song, advancing to the next entry once the
  current pattern has looped its configured number of times
  (`adr/0014`). Tempo is shared across the whole song, not saved per
  pattern.
- [x] **Sequencer, Phase 5 (partial)**: per-step **pitch** (a ◀/▶
  stepper, C2-C7, in the step detail panel), **tie** (don't retrigger —
  extend the previous note through this step), and **slide** (glide
  the previous still-sounding note to this step's pitch instead of
  retriggering). Chords, parameter locks, and live recording are still
  not attempted — see `adr/0016` for why pitch specifically unlocked
  tie/slide but not chords.
- [x] **Pressable tooltips**: a long press (450ms) on a control that
  isn't fully explained by its own label shows what it does, without
  also triggering it on release (`adr/0018`). Covers Sequencer's
  instrument-cycle, Mute, Solo, ✏️ edit, Play, Save Pattern, Song Mode,
  pattern ➕, song ◀▶✕, and the Pitch/Ratchet/Chance/Condition section
  labels; Controls' preview toggle, Save Instrument, carrier-wave
  buttons, and each ADSR/Ratio/FM-amount slider label. Not added where
  a hold gesture already means something else (a step's own tap/hold,
  the Instruments/Patterns library rows, FILL) — those keep their
  existing inline captions instead.
- [x] **Track Writer ("Tracks")**: a 4th role for a full, non-repeating
  arrangement, modeled on Felucca's own separate Piano Roll page — 4
  tracks, length 32/64/128 steps, Tempo/Swing, Mute/Solo, and the same
  per-step Pitch/Tie/Slide/Ratchet editing as the Sequencer. Unlike the
  Sequencer, ▶️ Play runs the arrangement once and stops — no looping,
  no Song mode, no per-step Chance/Condition, no saved-pattern library
  (`adr/0019`).
- [x] **Drag-to-tie**, shared by both the Sequencer and Tracks: dragging
  across more than one step in a row ties them into one long sustained
  note in a single gesture, instead of selecting and flipping Tie on
  each step individually in edit mode. Tap-to-toggle and hold-to-accent
  still work exactly as before (`adr/0019`).
- [x] **Pitch stepper: octave-jump + hold-to-repeat**, shared by both
  the Sequencer and Tracks: ◀◀/▶▶ buttons jump a full octave, and all
  four pitch buttons (◀◀◀▶▶▶) now auto-repeat while held, instead of
  needing one tap per semitone — found by actually composing a
  multi-track piece in Tracks and timing how long a large pitch move
  took. A tied step's detail panel also now explains that its own
  pitch has no audible effect, since a tied step never retriggers
  (`adr/0021`).
- [x] **Tracks: Export / Import**: ⬇️ Export downloads the current
  arrangement as a `.json` file; ⬆️ Import loads one back (after
  confirming, since it replaces what's currently loaded). This is how
  you keep more than one version or move an arrangement to another
  phone/browser, since Tracks has no in-app pattern library and nothing
  in this app syncs between devices on its own (`adr/0022`).

## Open questions / possible future work
- [ ] Naming/saving more than one patch, or sharing a patch between
  phones (today: one unnamed patch remembered per phone) — now
  largely superseded by the saved-instrument library (`adr/0012`),
  though that's instruments, not raw Controls-panel "current patch"
  snapshots specifically.
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
- [ ] A Sequencer track's displayed instrument label can go stale if
  that instrument is deleted on Controls while the Sequencer panel
  isn't re-rendered — cosmetic only, playback always falls back safely
  (`adr/0012`).
- [ ] Sequencer: each track's own instrument editable in place
  (ratio/FM/ADSR/wave), not just picked from the saved-instrument
  list.
- [ ] Sequencer: true continuous per-step velocity, not just the
  binary accent built in Phase 2.
- [ ] Sequencer: chords (a step playing more than one note at once);
  parameter locks; live recording by listening for the Keyboard's own
  `note` messages, with quantize (`adr/0016`).
- [ ] Sequencer: a scale-locked pitch picker (e.g. "stay in C major")
  instead of raw semitone-by-semitone stepping.
- [ ] Song: no reordering UI (remove + re-add via ➕ is the current
  workaround), no length limit, no duplicate-name prevention for
  patterns (`adr/0014`).
- [ ] Sequencer timing is a self-rescheduling `setTimeout` chain, not
  sample-accurate lookahead scheduling (`adr/0010`, `adr/0011`) —
  revisit if a later phase makes timing precision actually matter.
- [ ] Tracks has no in-app named-pattern/song library — it's one
  arrangement at a time per phone, by design (`adr/0019`), though
  Export/Import (`adr/0022`) now covers keeping more than one version
  as separate files. Could still grow an in-app library later if that
  turns out to be wanted.
- [ ] Drag-to-tie: tapping a step in the middle of an existing tied run
  off doesn't currently un-tie or re-anchor the steps after it — they
  stay flagged `tie` with nothing live to extend, playing as silence
  until the next real note (`adr/0019`).
- [ ] Sequencer's saved patterns/Song don't have file Export/Import the
  way Tracks now does (`adr/0022`) — only `localStorage`.

## Explicitly out of scope (for now)
- Talking to real FM-1 hardware over MIDI/USB — ruled out, see
  `adr/0001`. Could be revisited later as an optional, isolated
  add-on if that changes, without becoming a requirement of the core
  app.
