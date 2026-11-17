# FM-1 Clone — Requirements

*Working title — not yet registered in `apps.json`. This folder
currently holds only planning docs; there is no `index.html` yet.*

Two phones: one is the keyboard, the other is the controls surface for
an FM synth. Inspired by the M-VAVE FM-1 hardware synth and its
"Felucca" community firmware — naming/engine concepts only, see
`adr/0001`.

## Decided
- [x] No real FM-1 hardware or Felucca firmware code involved — a
  from-scratch Web Audio FM synth (`adr/0001`).
- [x] Android first: primary target is Chrome on Android; other
  browsers are best-effort, not a blocker (`adr/0002`).
- [x] Two phone roles — one "keyboard" phone, one "controls" phone —
  kept in sync over `shared/multiphone.js` (the same networking layer
  built for Phone Simon), not a new signaling scheme.

## Open questions (resolve before/while building)
- [ ] Keyboard UI: piano-style keys, a pad grid, or something else?
  What note range is visible/playable at once?
- [ ] How many FM operators/algorithms, and how configurable? (The
  Felucca engine list is a naming reference only, not a spec to match
  1:1.)
- [ ] What does the "controls" phone actually expose — per-voice
  envelope/operator knobs, effects, patch select, some combination?
- [ ] Polyphony: how many simultaneous notes?
- [ ] Patch save/load: local to a phone only, or shared/synced across
  the session?
- [ ] Where does audio actually play: does the keyboard phone synthesize
  and play its own sound locally (lowest latency), or do note events
  have to round-trip through the host/controls phone first?
- [ ] Is this always exactly 2 phones, or could a 3rd phone ever be a
  second keyboard?

## Explicitly out of scope (for now)
- Talking to real FM-1 hardware over MIDI/USB — ruled out, see
  `adr/0001`. Could be revisited later as an optional, isolated
  add-on if that changes, without becoming a requirement of the core
  app.
