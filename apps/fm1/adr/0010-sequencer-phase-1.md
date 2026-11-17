# 10. Sequencer, Phase 1: one track, 16 steps, one pitch

## Status
Accepted

## Context
Felucca's real sequencer is deep: 4 tracks, 64 steps per track, per-step
chords/ties/accent/slide/chance/velocity/ratchets, conditions,
parameter locks, live recording with overdub and quantize, swing,
mute/solo, and a 16-section song mode chaining pattern slots. Cloning
all of that at once is a large, multi-part effort, and this project
ships in small, validated slices rather than big-bang builds (see how
Phone Simon and the rest of FM-1 Clone were built incrementally).

Separately, `adr/0008` designed panels to be generic — any role is just
a `mount(el, room)` function talking through `room.send`/`onMessage` —
specifically anticipating a future role like a sequencer. That design
had only ever been exercised with exactly 2 roles.

## Decision
Ship a deliberately minimal first sequencer as a third role,
"Sequencer," alongside Keyboard and Controls:
- One track, 16 steps, each a plain on/off toggle (no per-step pitch,
  velocity, or any of Felucca's per-step modifiers yet).
- Every active step plays the same fixed pitch (A4) using whatever
  patch this phone last received/had — the exact same `patch` tracking
  pattern the Keyboard panel already uses (`room.onMessage` updates a
  local variable, `localStorage` remembers it across reloads).
- Tempo (BPM) slider and Play/Stop. Steps and tempo persist via
  `localStorage` (`multiphone.fm1.seqSteps` / `seqBpm`), per phone only
  — same tradeoff as the existing patch/octave persistence (`adr/0007`).
- Timing: a plain `setInterval` re-armed whenever BPM changes, not
  sample-accurate lookahead scheduling. Good enough for a 16-step pulse
  at a steady tempo; a few milliseconds of jitter isn't audible here.
  Worth revisiting with real lookahead scheduling if later phases (more
  tracks, swing, ratchets) make timing precision actually matter.
- Each active step sends `{t:'note', note:69, on:true}` then schedules
  `{t:'note', ..., on:false}` after a bounded hold — exactly like the
  Keyboard panel's note-on/note-off, so Controls' "now playing" and
  everything else that listens for `note` messages needs zero changes.

## Consequences
- Proves the generic panel/room design actually holds past 2 roles: no
  changes were needed to `shared/single-phone.js`,
  `shared/multiphone.js`, or the Keyboard/Controls panels to add a 3rd.
- Musically limited on purpose — one pitch, one track — but real and
  playable today, and a solid base to layer onto.
- Phase 2 (multiple tracks, each with its own preset; variable pattern
  length; per-step velocity/accent; mute/solo; swing) and Phase 3
  (ties/slides/chords/ratchets/chance/conditions; parameter locks;
  pattern save + song mode; live recording by listening for the
  Keyboard's own `note` messages) stay open, tracked in
  `REQUIREMENTS.md`.
