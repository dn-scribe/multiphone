# 9. Preview with an explicit ▶️ button, not automatically on every change

## Status
Accepted — supersedes the auto-preview mechanism described in `adr/0004`

## Context
`adr/0004` had the Controls panel fire a short local preview note on
every slider/preset/wave change. In practice this note could get stuck
sounding forever: `triggerVoice()` ramps a note's level up through
attack and decay to its *sustain* level and then holds there — correct
for a real held note, which is ended by a separate `releaseVoice()`
call on note-off. The auto-preview's `schedulePreview()` only ever
called that release right before starting the *next* preview; a single
discrete change (e.g. tapping a carrier waveform, with no follow-up
edit) left that preview note sustaining indefinitely, since nothing
ever scheduled its release.

## Decision
Replace automatic preview with an explicit "▶️ Hear it" button on the
Controls panel. Tapping it plays the current patch at a fixed preview
pitch (A4) and schedules its own release after a fixed, short duration
(550ms) — so a preview note can never outlive a timer, regardless of
whether the user does anything else afterward. Tapping it again while
a preview is still sounding stops the old one first.

Slider/preset/wave changes still update the patch and send it to
whichever phone is the Keyboard immediately, same as before — only the
automatic *local* preview tone on the Controls phone itself was
removed.

## Consequences
- No more indefinitely-sustaining preview tone.
- Checking a new sound now takes one extra tap instead of happening
  automatically while dragging a slider — a small deliberate tradeoff
  for not having a stuck note.
- Any future "preview" feature elsewhere in this app (or others) must
  pair a `triggerVoice()` with a *scheduled* `releaseVoice()`, never
  rely on "the next change will clean it up."
