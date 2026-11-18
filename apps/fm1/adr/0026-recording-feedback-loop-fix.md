# 26. Fix: Keyboard recording missed quick taps and could cascade on playback

## Status
Accepted

## Context
Reported directly: "track record, play, then hit on keyboard, the notes
are not added." Investigating turned up two distinct bugs in
`adr/0024`'s recording feature, not one:

1. **A quick tap could be missed entirely.** The original design only
   captured a note into the grid from the per-tick sustain-check
   (`if(track.recording&&liveNote!=null)`), which only runs when
   `tick()` itself fires. A note whose note-on *and* note-off both
   landed in the gap between two ticks - a realistic, even typical, fast
   tap - meant `liveNote` was already back to `null` by the time any
   tick ever looked at it. Nothing got recorded, even though a note was
   genuinely played. The original testing for `adr/0024` only ever
   exercised a *sustained* hold spanning several ticks, so this never
   showed up.
2. **Once (1) was fixed naively, playback could cascade forward.**
   `fireTrackStep` (the shared step-firing helper used by every track,
   recording or not) sends its own `{t:'note',...}` message purely so
   Controls' "now playing" can reflect it - but that message is
   indistinguishable from a real Keyboard note. A recording track's own
   played-back note would get picked up by the *same* listener driving
   recording, and - because `fireTrackStep` sends its message
   asynchronously (inside a `setTimeout`, by which point `stepIndex` has
   already moved on) - get re-recorded onto whatever step was current
   *then*. That step would then also play back and echo forward, one
   step per loop, forever. This likely existed since `adr/0024` shipped
   (the original design had the same blind spot, just less visibly,
   since the sustain-check logic made a self-overwrite onto the same
   step mostly harmless there) - today's fix for (1) just made it
   produce a visibly wrong result (writes advancing every tick instead
   of a clean hold).
   A related smaller bug surfaced fixing (1): when a note-on landed on
   a step `tick()` hadn't reached yet, *both* the immediate write and
   the next tick's sustain-check would write that same step - the
   second write stomped the first one's correct `tie:false` with
   `tie:true`, since by then the shared "was this a fresh onset" flag
   had already been flipped.

## Decision
- **Capture on note-on, not just on tick.** The `room.onMessage`
  handler itself now writes a recording track's current step
  (`steps[stepIndex]`) the instant a note-on arrives, rather than
  waiting for the next scheduled tick to notice. A held note still
  extends across subsequent steps via the existing per-tick check, for
  as long as it stays held - this only fixes the case where a note
  doesn't survive to the next tick.
- **Tag playback echoes.** `fireTrackStep`'s own `room.send(...)` calls
  now carry `synth:true`. The recording/edit-mode-entry listener skips
  any message with that flag (`if(msg.t!=='note'||msg.synth) return;`)
  - it only ever reacts to a real Keyboard's notes. Controls' "now
  playing" listener is untouched and still reacts to every note
  message regardless of the flag, since it's supposed to reflect
  anything currently sounding, played or recorded.
- **One write per step per held note.** `liveNoteLastStep` tracks which
  step index was most recently written for the currently-held note.
  Both the note-on handler and the per-tick sustain-check check it
  before writing, and skip if they'd be re-writing the same index -
  whichever of the two gets there first for a given step "wins," and
  the other no-ops instead of overwriting a correct write with a wrong
  one.

## Consequences
- Verified with Playwright, instrumenting the actual message traffic to
  find the cascade in the first place (console-logged every `note`
  message, `liveNote`, and `stepIndex` at the moment of receipt - this
  is what exposed the echo-driven step-by-step cascade directly, not
  just its symptom):
  - A quick tap (down and up within ~3ms, well under one tick interval)
    now writes exactly one step, correctly.
  - A sustained hold now produces a clean run: the first step
    `tie:false`, every following step `tie:true`, with no extra writes
    beyond the actual hold duration (previously: 7 separate steps, each
    independently `tie:false`, cascading one step per tick forever).
  - Controls' "now playing" still reflects playback notes (confirmed
    by checking within a note's actual ~75ms hold window, not after an
    arbitrary delay - the earlier scare where it appeared broken was a
    test timing mistake, not a real regression: a brief note's
    note-off fires and resets the display well before a naive
    multi-hundred-ms check would catch it).
  - The full Hallelujah regression check (`adr/0019`/`0025`) was
    re-run after this fix and still passes unchanged: 54 `triggerVoice`
    calls, correct auto-stop, no console errors.
- No change to the recording feature's scope or UI - this is purely a
  correctness fix for the mechanism `adr/0024` already shipped.
