# 32. Pointer capture on held notes - a drifting finger was cutting them short

## Status
Accepted

## Context
Reported directly, about the Chord tool specifically: "chord length...
should be as long as I press. Recording tracks with chords only sounds
parts of the chord, maybe one sound" - and separately, that a fresh
recording on another track produced no audible sound at all. Both are
consistent with the same underlying cause: a held chord pad (or
Keyboard key, or drum pad) releasing its note *before* the finger
actually lifts.

None of the Chord pad's, Keyboard key's, or Drum Pad hit's
`pointerdown`/`pointerup`/`pointerleave`/`pointercancel` listeners ever
called `setPointerCapture()`. Without it, a touchscreen is free to fire
`pointerleave` the moment a finger's contact point drifts even slightly
off the element's visual bounds while held - completely normal for a
thumb holding a button on a 2-column grid, not a mis-tap. Each of these
elements treats `pointerleave` exactly like `pointerup` (to end a held
note), so that drift silently ends the note early: live, it cuts the
chord's sustain short; while recording, it means the step(s) actually
captured are however long the finger happened to stay *perfectly*
still, not however long it was actually held - easily just one step,
or even read back as "nothing," especially for a chord where a
near-instant on/off blip is easy to miss entirely in the mix.

## Decision
`setPointerCapture(e.pointerId)` on `pointerdown`, for the three held-
to-sustain interactions this can affect: Chord pads, Keyboard keys, and
Drum Pad hits. Per the Pointer Events spec, once an element has
captured a pointer, the browser does not fire `pointerover`/`pointerout`/
`pointerenter`/`pointerleave` for it while captured - so a drifting
finger's `pointerup` (and only a genuine `pointerup`/`pointercancel`)
is what ends the note now, regardless of exactly where over the
button's bounds the finger wanders while held. Wrapped in try/catch
(same defensive pattern used everywhere else a browser API might not
be present) since it's not essential to correctness if a very old
browser lacks it - it just stops helping.

Deliberately **not** touched: `attachStepsInteraction()` (the Sequencer/
Tracks step row's drag-to-tie gesture, `adr/0019`) already explicitly
*releases* any pointer capture on `pointerdown` - it needs
`pointerleave`/the pointer moving to other elements to detect which
steps a drag crosses, the opposite of what held-note sustain wants.
Also not touched: the generic hold-for-tooltip/hold-to-rename/hold-to-
delete gestures elsewhere - those aren't about audio sustain length,
so weren't implicated by the report, and are left alone to keep this
change scoped to what was actually broken.

## Consequences
- This is a real-touchscreen behavior difference that a mouse-driven
  Playwright run in this sandbox can't reproduce or verify directly -
  `dispatchEvent`-ing a synthetic `pointerleave` fires listeners
  regardless of capture state, since capture only governs events the
  browser's own input pipeline would otherwise generate, not ones a
  script constructs by hand. Relying on the Pointer Events spec's
  documented capture-suppresses-boundary-events behavior (consistently
  implemented in Chromium) rather than a reproduced-and-fixed test, the
  same category of limitation already noted for real WebRTC in
  `adr/0006`.
- Re-ran the existing regression set that exercises these same
  elements by tap/click (chord editor hold-to-edit, drum pad tap-to-
  play and live-hit recording, quick-tap and sustained-hold Keyboard
  recording, block-mode and held block-mode chord recording) - all
  still pass unchanged, confirming the capture call doesn't interfere
  with the normal tap/hold-to-edit paths on a mouse-driven browser.
- Also fixed a stale hint under the Chords mode still describing block-
  mode recording as "just the chord's root" - `adr/0031` already made
  it capture the whole chord.
