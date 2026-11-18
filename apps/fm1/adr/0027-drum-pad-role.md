# 27. Drum Pad role, inspired by Phone Band's percussion engine

## Status
Accepted

## Context
Requested directly: a role for playing drums live and recording drum
tracks, inspired by Phone Band (`apps/band`). Phone Band already has a
complete, working percussion synthesis engine (`S.kick`, `S.snare`,
`S.hat`, `S.openhat`, `S.clap`, `S.crash`, `S.tomHi`, `S.tomLo`,
`S.cowbell`, `S.shaker` - noise bursts through a filter, or an
oscillator with a pitch-drop envelope) that's a better match for actual
drum sounds than FM-1's own 2-operator FM voice, which is tuned for
melodic/harmonic tones.

Recording was the more interesting half: Tracks already has a working
Keyboard-recording mechanism (`adr/0024`, fixed in `adr/0026`) built
entirely around a generic `{t:'note', note, on}` message. Nothing about
that mechanism actually requires `note` to be a melodic MIDI pitch - it
just needs to be *some* identifier, written into a step and read back
later. A drum hit fits that shape exactly.

## Decision
- **New role: Drum Pad** (🥁), picked the same way every other role is
  (multi-select, `adr/0023`) - e.g. a phone can be Drum Pad + Tracks
  together for solo recording, same as Keyboard + Tracks already could.
  10 pads (Kick, Snare, Hat, Open Hat, Lo Tom, Hi Tom, Clap, Crash,
  Cowbell, Shaker), each a plain `.choice` button in FM-1's existing
  house style (not Phone Band's own rainbow pad coloring - keeps this
  app's black/white/cyan look consistent across every role).
- **Percussion synthesis ported from Phone Band**, wired into FM-1's own
  `ctx`/`master`/`audio()` instead of duplicating a separate audio
  graph: `drumTone`/`drumNoiseHit`/`drumEnv` are Phone Band's
  `osc`/`noise`/`env`, renamed to avoid any collision with FM-1's own
  names; `DRUM_SYNTH` is Phone Band's `S` object, algorithmically
  unchanged.
- **Each drum sound gets a fixed note number** (`DRUM_KIT`, loosely
  General-MIDI-ish but not exact) so a drum hit is just another value
  in a step's existing `note` field - no new field, no schema change.
  A pad's own taps send exactly the same `{t:'note',note,on}` shape a
  Keyboard does (plus a `drum` name for display), so:
  - **Tracks' Keyboard-recording machinery needed zero changes** to
    also record drum hits - arm ⏺ Record and hit Play, or select a
    step in ✏️ edit mode and tap a pad to set it instantly, exactly
    like a Keyboard note does.
  - A track's instrument can now be set to **🥁 Drum Kit** (a new fixed
    entry in the instrument list, alongside the FM presets and custom
    instruments). `fireTrackStep` branches early for a Drum Kit track:
    no slide (drums don't pitch-glide), no sustained voice to release -
    just a one-shot hit per (possibly ratcheted) trigger, with the same
    `synth:true` echo-tagging (`adr/0026`) so a recording Drum Kit track
    doesn't re-record its own played-back hits.
  - The step detail panel adapts for a Drum Kit track: the pitch
    stepper's label shows the drum's name instead of a note name, ◀▶
    cycles one drum at a time through `DRUM_KIT` (◀◀▶▶ jumps 3) instead
    of by semitone/octave, and the Slide toggle is hidden entirely
    (same "don't show a control with no audible effect" reasoning as
    `adr/0021`'s tied-step pitch hint).
  - Controls' "now playing" prefers a message's `drum` name when
    present, so a drum hit doesn't show a nonsense note name there.

## Consequences
- Verified with Playwright: the role picker includes Drum Pad; all 10
  pads render with correct labels and play without error; assigning a
  track to Drum Kit and tapping a pad in edit mode sets the selected
  step's drum instantly (confirmed the label updates, e.g. Kick → the
  tapped pad's name); arming Record, playing, and tapping a pad live
  correctly writes a step with that drum's note number; the ◀▶ stepper
  correctly cycles through the kit (3 taps from Kick lands on Open
  Hat, the 4th entry); the detail panel shows "Drum" instead of
  "Pitch" and has no Slide button for a Drum Kit track. Re-ran the full
  melodic regression (the Hallelujah piece and the quick-tap recording
  fix from `adr/0026`) and both are unaffected.
- A drum hit has no real pitch to tie or slide, so tying a run of drum
  steps together just plays the first hit and goes silent for the rest
  (the same "tied step has no audible pitch" situation `adr/0021`
  already documents for melodic tracks) - not specially handled, since
  it's already a known, accepted shape for ties in general.
- No chord/multi-drum-per-step support - a step is still one hit, same
  monophonic-per-step model as the rest of this app.
