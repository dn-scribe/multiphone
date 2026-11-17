# 19. Track Writer: a 4th role for full, non-repeating arrangements; shared drag-to-tie gesture

## Status
Accepted

## Context
Every role so far is loop-based: the Sequencer always repeats its pattern
(optionally chained into a Song, `adr/0014`). That's the wrong shape for
writing out a full, one-shot musical part that doesn't repeat - e.g. a
melody or bassline meant to play once start to finish, not cycle.

Looking for real precedent before building (as asked): Felucca, the
M-VAVE FM-1 community firmware this app takes its naming/engine concepts
from (`adr/0001`), has its own web editor with a *separate* Piano Roll
page, distinct from its step Sequencer page - for "drawing, deleting, and
stretching notes and chords with the mouse," scrolling to follow the
playhead once a part runs longer than one screen. That's a genuine
non-sequencer editing surface in the actual FM-1 ecosystem, not just
generic DAW convention - and "stretching notes with the mouse" is exactly
the "connect adjacent notes into a long note" gesture asked for, just
expressed as a drag instead of a resize handle.

The Sequencer's tie/slide (`adr/0016`) already let a step extend the
previous note, but only one step at a time via the ✏️ edit-mode detail
panel - tying several steps together meant selecting each one
individually and flipping Tie on. That's tedious for exactly the kind of
long, intentional notes a non-looping arrangement leans on more than a
loop does.

## Decision
- **New role: "Tracks"** (icon ✍️), alongside Keyboard/Controls/Sequencer,
  in networked play and Single Phone Mode alike. 4 tracks (same as the
  Sequencer, toward Felucca's 4), each with its own instrument (shared
  library, `adr/0012`), length 32/64/128 steps, Tempo, Swing, Mute/Solo,
  and the same per-step Pitch/Tie/Slide/Ratchet editing as the Sequencer
  (`adr/0013`, `adr/0016`) via its own ✏️ edit mode.
- **It never loops.** ▶️ Play runs from step 1 through the end of the
  arrangement once and stops - no Song mode, no per-step Chance or
  Condition (those are loop-repetition devices with nothing to attach to
  in a part that only ever plays once), and no saved-pattern library (one
  arrangement at a time per phone, auto-persisted - same as the Sequencer
  before patterns existed, `adr/0010`/`adr/0011`). This not-looping is the
  actual distinction from the Sequencer, not just a cosmetic rename.
- **Shared drag-to-tie gesture**, used by *both* Tracks and the Sequencer:
  dragging across more than one step in a row ties them all into one long
  note, taking the dragged span's pitch from its leftmost step (or the
  default pitch if that step was off) and setting `tie` on every step
  after the first - so the run plays as a single sustained note via the
  existing tie/slide playback logic, with no extra per-step tapping
  required.
  - Implemented as `attachStepsInteraction()`, a row-level pointer-gesture
    controller (tap → toggle, hold-without-moving → accent, drag → tie)
    that replaced each step button's own `pointerdown`/`pointerup`
    listeners, since a cross-cell drag can't be expressed by listeners
    scoped to one button at a time.
  - `drawTieRun()`, `legatoExtensionSteps()`, and the actual
    voice-triggering `fireTrackStep()` are now shared top-level functions
    (previously private to the Sequencer) so Tracks' playback and tie
    behavior is identical to the Sequencer's, not a parallel
    reimplementation. `newStep()`/`newSteps()`/`resizeSteps()` and the
    default instrument list moved the same way.
  - Tapping a step still toggles on/off and holding it (without dragging)
    still toggles accent, exactly as before - the drag gesture only
    activates once the pointer actually crosses into a different step's
    cell, so normal tap/hold use is unaffected.

## Consequences
- Verified with Playwright (real PeerJS networking isn't reachable from
  this sandbox, so via Single Phone Mode's local room): structural checks
  on the modified file; simulated pointer drags across several step cells
  in both the Tracks and Sequencer panels confirm the dragged span ends
  up tied with a shared pitch (checked through the edit-mode detail
  panel, which showed "Tie: On" for a step in the middle of a dragged
  run); Tracks' Play confirmed to auto-stop at the end of the arrangement
  instead of wrapping back to step 0; the Sequencer's existing tap-toggle,
  hold-accent, and edit-mode step-select gestures were re-verified
  unchanged after the `makeStepButton` refactor.
- Known limitation, left open: tapping a step in the *middle* of an
  existing tied run off doesn't currently un-tie or re-anchor the steps
  after it - they stay flagged `tie` with no live note ahead of them to
  extend, which plays as silence until the next non-tied `on` step. Not
  solved here; a future pass could auto-clear `tie` on the following step
  when the step it depends on is turned off.
- Tracks has no pattern-save/Song-mode library by design (see Decision) -
  if that turns out to be wanted later (e.g. chaining several written
  parts), it's new scope, not a bug.
- Chance/condition remain Sequencer-only; Tracks' step data still carries
  those fields internally (to reuse the exact same step shape and shared
  helpers) but always at their default/no-op values, and no UI exposes
  them there.
