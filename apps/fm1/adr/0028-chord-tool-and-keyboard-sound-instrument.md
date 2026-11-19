# 28. Chord tool (a Drum Pad mode) and the Keyboard Sound instrument

## Status
Accepted

## Context
Requested directly: "a chord tool, as an option of the drum pad. Sound
when recording as set for the keyboard now." Two things to satisfy:
a chord-playing tool living inside the Drum Pad role (not a separate
role), and its sound tracking whatever patch Keyboard is currently set
to, rather than a fixed preset or the drum engine.

A genuine per-step chord (more than one note sounding from a single
step) has been an explicit open question since `adr/0013` and stayed
unimplemented through every later per-step feature (`adr/0016`'s
pitch/tie/slide, `adr/0024`'s recording) - the step/track data model is
built around exactly one note per step throughout this app. Building
true polyphonic steps now would touch the step shape, drag-to-tie,
Export/Import's schema, and more, for a want that's really about
*playing* and *hearing* chords, not necessarily about a sequencer step
holding three notes at once forever.

## Decision
- **Chords is a mode within Drum Pad**, not a new role: a two-button
  toggle (🥁 Drums / 🎵 Chords) switches which pad grid shows, both
  built once and toggled via `display`, same pattern as Tracks' Loop
  toggle switching which controls are relevant (`adr/0025`).
- **7 pads, the diatonic triads of C major** (C, Dm, Em, F, G, Am, B°),
  with its own octave ◀/▶ (same `(octave+1)*12` MIDI formula the
  Keyboard panel already uses). Picked for the same reason Phone Band's
  own instruments share one key/scale: any chord next to any other
  already sounds coherent, no music-theory decisions pushed onto
  whoever's playing.
- **A chord plays through the same shared patch Keyboard/Controls
  already read and write** (`lsGet('patch',...)`, the exact mechanism
  `adr/0007` set up) - multiple simultaneous `triggerVoice` calls, one
  per note, released together on release. This is the literal "sound...
  as set for the keyboard now": whatever you've shaped on Controls is
  what a chord pad plays, live.
- **Recording captures the chord's root note**, not the full chord -
  the step model stays monophonic, unchanged. A chord pad sends the
  same `{t:'note',note,on}` shape a Keyboard key or Drum Pad hit
  already does (plus a `chord` label for display), so it needed zero
  changes to Tracks' existing Keyboard-recording machinery
  (`adr/0024`/`0026`): arm ⏺ Record and play chords along with the
  loop, or tap a chord pad in a track's ✏️ edit mode to set a step's
  pitch to that chord's root instantly.
- **New pseudo-instrument: ⌨️ Keyboard Sound.** A track can be set to
  this instead of a fixed preset/custom patch/Drum Kit. Unlike every
  other instrument, it's resolved *fresh on every call* to
  `resolveInstrument()` - `{patch: lsGet('patch',null)||DEFAULT_PATCH}`
  computed live, not cached - so a track set to it always plays back
  using whatever Keyboard/Controls currently have set, even if that
  changes after the track was recorded. This is what actually answers
  "sound when recording [should be] as set for the keyboard now" for
  *played-back* audio, not just the live chord sound: assign a track to
  Keyboard Sound and its recorded steps sound like Keyboard, however
  Keyboard's patch is set at the moment it plays.
  - Not automatic - recording from Keyboard, Drum Pad, or the Chord
    tool never changes a track's instrument on its own. The person
    picks Keyboard Sound deliberately, same as picking Drum Kit or any
    preset, so a Keyboard-recorded melody can still play back as
    "Brass" or anything else on purpose.
- **Fixed a pre-existing bug this surfaced**: `allInstruments()` is
  shared between Tracks' per-track instrument picker (where Drum
  Kit/Keyboard Sound's `patch:null` placeholders make sense - they're
  never actually read, since `fireTrackStep`/`resolveInstrument` branch
  around them) and Controls' own "pick a sound to edit" picker, which
  always expected a real patch object to load into its sliders. Drum
  Kit silently had this problem since `adr/0027` shipped; tapping it in
  Controls would throw (`Cannot read properties of null (reading
  'ratio')`). Controls' `renderInstruments()` now filters to
  `inst.patch` truthy, so only real, editable patches show there.

## Consequences
- Verified with Playwright: the Drums/Chords toggle correctly swaps
  which pad grid and hint text show; chord pads play without error;
  setting Controls to the Bell preset and then assigning a Tracks track
  to ⌨️ Keyboard Sound, selecting a step, and tapping a chord pad
  correctly set that step to the chord's root note; playing that track
  back fired `triggerVoice` with Bell's actual patch values
  (`ratio:3.5, fm:4`), confirming the live/dynamic resolution - not a
  frozen snapshot - works through real Tracks playback, not just at
  selection time. The Controls-picker crash was reproduced before the
  fix (tapping the pseudo-instrument entries there threw) and confirmed
  gone after it. Re-ran the full melodic and drum regressions
  (Hallelujah piece, quick-tap recording fix, Drum Kit recording) -
  all unaffected.
- No true polyphonic step recording - a chord's root note is all that's
  captured, same deliberate scope boundary `adr/0013` already drew
  around chords. Left open if full multi-note-per-step recording is
  wanted later; this doesn't block it, it just doesn't attempt it now.
