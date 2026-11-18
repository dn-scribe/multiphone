# 17. Keyboard octave count follows orientation

## Status
Superseded by `adr/0020` — landscape's 3rd octave and the "many" small-key
size were dropped; portrait switched from one dense row to two
organ-style rows. The orientation-based re-render mechanism itself
(`matchMedia('(orientation: ...)')`, live on rotation) is unchanged.

## Context
The Keyboard panel always showed exactly one octave plus one note (13
keys), regardless of screen size or orientation, requiring frequent
taps on the octave ◀/▶ buttons to reach notes outside that window.

## Decision
The number of octaves shown now follows device orientation, read via
`window.matchMedia('(orientation: ...)')` (re-rendering on its
`change` event, so rotating the phone updates it live):
- **Portrait** ("tall," phone not tilted): 2 octaves (25 keys) at the
  normal key size.
- **Landscape** (tilted): 3 octaves (37 keys), with smaller
  font-size/padding on the keys (the `.keys.many` class) so that many
  more, narrower keys stay usable rather than illegibly cramped.

The octave ◀/▶ buttons still shift the whole visible window up/down
by one octave, same as before — they just now move a 2- or 3-octave
window instead of a 1-octave one.

## Consequences
- Verified with Playwright: resizing to a portrait-shaped viewport
  renders exactly 25 keys, a landscape-shaped one renders 37 with the
  smaller-key class applied, and switching back to portrait shrinks
  back to 25 live.
- No change to note range logic, persistence, or the Keyboard's
  message protocol — this is purely how many of the same kind of key
  are rendered at once.
