# FM-1 Clone — Requirements

Your phones become a tiny FM synth: a Keyboard, a Controls surface, a
Drum Pad, and Tracks — a step editor that can loop forever or play once,
your choice (`adr/0025`; this used to be two separate roles, a looping
"Sequencer" and a non-looping "Track Writer" — merged into one tool with
a Loop toggle). Inspired by the M-VAVE FM-1 hardware synth and its
"Felucca" community firmware — naming/engine concepts only, see
`adr/0001`.

## Decided and built (v1)
- [x] No real FM-1 hardware or Felucca firmware code involved — a
  from-scratch Web Audio FM synth (`adr/0001`).
- [x] Android first: primary target is Chrome on Android; other
  browsers are best-effort, not a blocker (`adr/0002`).
- [x] Two phone roles — "Keyboard" and "Controls" — picked after
  host/join, kept in sync over `shared/multiphone.js` (the same
  networking layer built for Phone Simon). Grew to 4 roles and
  multi-select (a phone can run more than one at once, `adr/0023`), then
  back to 3 once the Sequencer and Track Writer merged into one Tracks
  role (`adr/0025`).
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
- [x] The bullets below through "Track Writer" describe the Sequencer
  and Track Writer as they were built in phases, as two separate roles.
  All of this functionality still exists and still works the way
  described — it's just one role now, "Tracks," with a 🔁 Loop toggle
  standing in for "which of the two tools you were in" (`adr/0025`).
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
- [x] **A phone can run more than one role at once**: the role picker
  is multi-select (e.g. Keyboard + Controls on one phone, Sequencer +
  Tracks on another) instead of locking each phone to exactly one role.
  Reuses the same multi-panel layout as Single Phone Mode; panels on
  the same phone see each other's messages (a Keyboard note updates
  that same phone's own Controls "now playing," a Controls patch
  change reaches that same phone's own Keyboard) with no special
  plumbing beyond what cross-phone messaging already does (`adr/0023`).
- [x] **Recording from a Keyboard**: both the Sequencer and Tracks gained
  a per-track ⏺ Record button, and a Keyboard's notes now reach both
  tools. Edit mode (not recording): playing a key sets the selected
  step's pitch instantly, a faster alternative to the pitch stepper.
  Recording, while playing: the currently playing step captures
  whichever note is held, and holding through several steps ties them
  into one long note - using the same tie/slide playback as everywhere
  else, not a separate mechanism (`adr/0024`; two real bugs in the
  capture mechanism itself - a quick tap could be missed, and playback
  could cascade-record itself forward - fixed in `adr/0026`).
- [x] **Sequencer and Tracks merged into one tool**: a single 🔁 Loop
  toggle next to Play replaces picking between two separate roles - on
  (default) repeats forever with Chance/Condition/FILL available, off
  runs the pattern once and stops. `loop` is saved as part of a pattern
  snapshot, so a Song can chain looping grooves and one-shot written
  parts together - the actual point of combining the two tools, done
  through the existing Song mechanism rather than a new one. Pattern
  length is now 16/32/64/128 (the union of what each tool offered
  alone). File Export/Import now carries `loop` too; an old,
  pre-merge Track Writer export (no `loop` field) imports with Loop off,
  matching what it always was (`adr/0025`).
- [x] **Drum Pad role**: 10 pads (Kick/Snare/Hat/Open Hat/Lo Tom/Hi
  Tom/Clap/Crash/Cowbell/Shaker), synthesized with Phone Band's own
  percussion engine (`apps/band`), ported in almost verbatim. Sends the
  same note-message shape a Keyboard does, so it works with Tracks'
  existing recording (`adr/0024`) with no changes to that mechanism —
  arm ⏺ Record and play along, or tap a pad while a step is selected in
  ✏️ edit mode to set it instantly. A track's instrument can be set to
  🥁 Drum Kit, which plays recorded drum hits back with the real
  percussion sounds instead of the FM voice; the step detail panel
  adapts (drum name instead of note name, no Slide toggle, since slide
  has nothing to glide on a drum hit) (`adr/0027`).
- [x] **Chord tool**: a 🎵 Chords mode inside Drum Pad (toggle next to
  🥁 Drums) — 7 pads, the diatonic triads of C major, with their own
  octave ◀/▶. Plays the full chord live through whatever patch
  Keyboard/Controls currently have set; recording/edit-mode entry
  captures the chord's root note, same as any other note (no true
  per-step chords — see open questions). New **⌨️ Keyboard Sound**
  instrument option: a track set to it always plays back using
  Keyboard's *current* patch, resolved fresh every time, not a frozen
  copy — picked manually, never automatic (`adr/0028`).

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
- [ ] Tracks: true per-step chords (a step playing more than one note at
  once) are still not built, even with a Chord tool now live on Drum
  Pad (`adr/0028`) — only a chord's root note gets recorded, since the
  step model stays one-note-per-step. Parameter locks also still open
  (`adr/0016`). Live recording itself is now built (`adr/0024`), but
  with no separate, adjustable quantize amount - a note always lands on
  whichever step is current at that tick.
- [ ] Sequencer: a scale-locked pitch picker (e.g. "stay in C major")
  instead of raw semitone-by-semitone stepping.
- [ ] Song: no reordering UI (remove + re-add via ➕ is the current
  workaround), no length limit, no duplicate-name prevention for
  patterns (`adr/0014`).
- [ ] Sequencer timing is a self-rescheduling `setTimeout` chain, not
  sample-accurate lookahead scheduling (`adr/0010`, `adr/0011`) —
  revisit if a later phase makes timing precision actually matter.
- [ ] Drag-to-tie: tapping a step in the middle of an existing tied run
  off doesn't currently un-tie or re-anchor the steps after it — they
  stay flagged `tie` with nothing live to extend, playing as silence
  until the next real note (`adr/0019`).
- [ ] The merged Tracks panel is noticeably taller/denser than either
  tool was alone — Loop, FILL, Tempo, Swing, Length, Patterns, Save
  Pattern, Song Mode, the Song list, and Export/Import all now live
  above the track rows in one scroll. Not fixed yet (e.g. collapsible
  sections); worth revisiting if it turns out to matter in practice
  (`adr/0025`).

## Explicitly out of scope (for now)
- Talking to real FM-1 hardware over MIDI/USB — ruled out, see
  `adr/0001`. Could be revisited later as an optional, isolated
  add-on if that changes, without becoming a requirement of the core
  app.
