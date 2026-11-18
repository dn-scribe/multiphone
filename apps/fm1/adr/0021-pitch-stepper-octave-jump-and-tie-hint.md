# 21. Pitch stepper: octave-jump + hold-to-repeat; hint on a tied step's no-op pitch

## Status
Accepted

## Context
Dogfooding: composing an actual 8-bar, 4-track piece (chord progression
+ melody, in the style of a well-known song, used only as a realistic
test case — no lyrics or audio were reproduced) in the new Tracks tool
(`adr/0019`) to see what breaks or grates under real use.

Two things stood out:
- **Pitch entry was impractically slow for real composition.** The
  step detail panel's pitch control was only ◀/▀ one semitone at a
  time (`adr/0016`). Moving a step's default pitch (A4) down to a
  reasonable bass note like C3 - a 21-semitone drop, completely normal
  for a harmony track - took 21 individual taps, confirmed by timing an
  actual Playwright run through the real buttons. For a song-length
  piece with several such notes, that adds up to minutes of pure
  pitch-stepping before any actual composing happens.
- **Editing a tied step's pitch is a silent no-op.** `fireTrackStep`'s
  firing loop (`tick()` in both the Sequencer and Tracks) skips any
  step with `tie:true` entirely - the sustained note's pitch comes from
  whichever earlier step started the run, via `legatoExtensionSteps`.
  But the step detail panel shows a fully interactive pitch stepper for
  *any* selected step, tied or not, with nothing telling you that
  changing a tied step's own pitch has no audible effect at all. Easy
  to spend time "fixing" a tied step's pitch and wonder why nothing
  changed.
- (Also explicitly tested and found **not** to be a problem: dragging a
  tie across a 16-step grid-row wrap, e.g. step 14 to step 18, works
  correctly - `attachStepsInteraction` resolves the step under the
  pointer by screen position via `elementFromPoint`, not by walking the
  row, so it isn't confused by the CSS grid wrapping onto a new visual
  line.)

## Decision
- The pitch row (`noteRow()`, shared in shape - though still a small
  per-panel duplicate, per the project's usual style - by the Sequencer
  and Tracks) gained two more buttons, `◀◀`/`▶▶`, that jump a full
  octave (±12 semitones) instead of one. Combined with the existing
  ◀/▶, a 21-semitone move is 1 octave-jump + 9 semitone taps - 10
  interactions instead of 21.
- All four pitch buttons now use a new shared `attachRepeatableTap(el,
  onTap, onRelease)`: fires `onTap` immediately on press, then again
  every 90ms after an initial 400ms hold, so a big move can just be
  held down rather than tapped repeatedly. `onTap` only updates the
  step's note and the label text directly - it deliberately does *not*
  call `saveTracks()`/`renderTrackDetail()` on every repeat tick, since
  that would tear down and rebuild the very button the pointer is still
  holding, orphaning the held gesture's `pointerup` listener mid-repeat.
  `onRelease` (once, when the hold ends) does the actual
  save/re-render.
- When the selected step has `tie:true`, the detail panel now shows a
  one-line hint under the pitch row explaining that this step never
  retriggers and its own pitch has no audible effect - without hiding
  or disabling the control itself (you may still want to pre-set a
  pitch in case you later untie it).

## Consequences
- Verified with Playwright: the pitch row now renders all 4 buttons in
  the expected order; a single octave-jump tap moves exactly 12
  semitones; holding the semitone button for 700ms moves several more
  steps beyond the initial tap (repeat confirmed firing, exact count
  subject to normal timer jitter); the same 21-semitone move done via
  1 octave-jump + 9 semitone taps lands on the correct target note in
  10 interactions; selecting a tied step shows the new hint text.
- Full end-to-end re-verification of the actual composed piece: all 4
  tracks render with the correct instrument/step data, Play runs
  through the whole 128-step arrangement and auto-stops as designed
  (`adr/0019`), and `triggerVoice` fired exactly 54 times across the
  full playback - 24 harmony chord-tones (8 bars × 3 harmony tracks)
  plus 30 melody notes, with zero spurious or missing retriggers across
  several 16-step-long tied runs. No console/page errors during any of
  this.
- `attachRepeatableTap` is now available for any future hold-to-repeat
  control, but is only wired up to the 4 pitch buttons for now - no
  other control in the app currently has this problem.
