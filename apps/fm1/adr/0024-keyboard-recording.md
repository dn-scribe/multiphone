# 24. Recording from a Keyboard into the Sequencer and Tracks

## Status
Accepted

## Context
Live recording was a long-standing open question (`adr/0013`,
`adr/0016`): "listening for the Keyboard's own note messages, with
quantize." Requested directly, with two distinct workflows in mind:
"play with keyboard or hit on time with looping" (capture notes live
while a pattern plays) and "hit the step and then the keyboard" (select
a step, then play a note to set its pitch - instead of the ◀◀◀▶▶▶
stepper from `adr/0021`).

Both became much more natural to build on top of the multi-role phones
just shipped (`adr/0023`): one phone can now be Keyboard + Sequencer (or
Keyboard + Tracks) together, so a single person can record solo, not
only across two physically separate phones.

## Decision
Both the Sequencer and Tracks gained a per-track **⏺ Record** button
(red when armed, next to Mute/Solo/✏️), and both now listen for `note`
messages from any Keyboard in the room (`room.onMessage`, which neither
panel used before this). One shared "currently held note" is tracked
per panel (last-note-wins if more than one overlaps, since a step is
monophonic - same convention Controls' preview pitch already uses,
`adr/0004`/`0009`/`0015`), and drives two behaviors:

- **Edit mode (✏️), not recording**: the instant a key is struck, the
  currently *selected* step's pitch is set to it (and the step turns
  on) - no playback needed, this is the "hit the step, then the
  keyboard" entry method, a faster alternative to the pitch stepper for
  anyone with a Keyboard connected.
- **Recording (⏺), while playing**: every tick, if a note is currently
  held, the *currently playing* step is written with that pitch. Held
  notes that span more than one step come out tied - the first step
  that captures a given note-on gets `tie:false`, every step after it
  (for as long as that same note stays held) gets `tie:true` - so a
  sustained keyboard note becomes one long note in the grid, through
  the exact same tie/slide playback machinery as `adr/0016`/`0019`,
  not a parallel implementation.
- No quantize setting - a note is always captured onto whichever step
  is current *at that tick*, which given the two tools' existing step
  resolution (16th notes) is already a fairly tight grid; a separate
  configurable quantize amount is still open (see Consequences).
- Capture happens *after* that tick's normal firing check, not before -
  otherwise a note you just played would also immediately retrigger as
  synthesized audio on the very same step, doubling up against the
  Keyboard's own live sound (`adr/0004`: the Keyboard always plays
  locally). The recorded step only starts actually sounding on the
  *next* loop pass (Sequencer) or stays there to review/replay after
  Play auto-stops (Tracks, which never loops - adr/0019 - so recording
  there is "play along once, then look at and keep what landed").
- Record and Edit mode are mutually exclusive per track (turning one on
  turns the other off) to avoid both reacting to the same keystroke at
  once.
- `recording` is a runtime-only flag on each track object, reset to
  `false` on every load/import, same reasoning as `playing` - it's
  never meant to persist as "still recording" across a reload.
- `saveTracks()` is only called once, when Record is turned *off* (not
  every tick while armed) - the visible grid still updates live via the
  same per-step `refresh()` functions used everywhere else (now kept on
  `track._stepRefreshers` so this listener, outside `renderTracks()`'s
  own closure, can reach them), but writing to `localStorage` on every
  single tick during a fast live performance would be needless churn.

## Consequences
- Verified with Playwright via Single Phone Mode (all panels share one
  local room, so a Keyboard tap there reaches the Sequencer/Tracks
  exactly like a second phone's Keyboard would): selecting a step in
  edit mode and tapping a key changed that step's pitch and turned it
  on; arming Record, playing, and holding a key for ~400ms at a fast
  tempo produced a 5-step run with the first step `tie:false` and the
  following four `tie:true`, all at the held note's pitch, read back
  directly from the saved `localStorage` data.
- Quantize is still not a separate, adjustable concept - recording
  always lands on the current tick's step, for better or worse. Left
  open, same as before, now narrower (adr/0013's "with quantize" framed
  it as part of recording itself; it's really an independent accuracy
  knob on top of what's built here).
- No chord/polyphonic capture - a step is still one note, so playing a
  chord while recording just captures whichever key was struck/held
  last, consistent with the rest of this app's monophonic step model
  (`adr/0003`, `adr/0013`).
