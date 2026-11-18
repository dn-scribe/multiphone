# 20. Keyboard: organ-style two-row layout in portrait; landscape drops to 2 octaves

## Status
Accepted (supersedes `adr/0017`)

## Context
`adr/0017` gave portrait 2 octaves in one row and landscape 3 octaves in
one row, shrinking font-size/padding (`.keys.many`) so the extra keys
still fit. In practice, feedback was that landscape's 3-octave row felt
too narrow/cramped, and portrait's single row of 25 keys was narrower
than it needed to be for a phone that's just as tall as it is useful —
there was unused vertical space below the keys that could instead hold a
second row.

## Decision
Both orientations now show the same 2 octaves (25 keys total) as
before — only how they're laid out changes:
- **Portrait**: two stacked rows, organ-style, 13 keys each (one octave
  per row, so the boundary C is the last key of the bottom row and also
  the first key of the top row) — the upper octave on top, the lower
  octave on the bottom. Half as many keys per row as the old single-row
  layout, so each key is about twice as wide, at no cost in total note
  range. A white divider line between the two rows reads as the two
  "manuals" of an organ.
- **Landscape**: back to one straight row of 2 octaves, at the normal key
  size — the 3rd octave and the `.keys.many` smaller-key treatment are
  gone, since the extra octave was the reason it needed shrinking in the
  first place.
- `buildRow(parent, baseOctave, keyCount)` replaces the old single
  inline loop in `render()`, called once (25 keys) in landscape or twice
  (13 keys each) in portrait, so both layouts share the exact same
  key-building/pointer-handling code.

The octave ◀/▶ buttons are unchanged: they still shift the whole visible
window (now 2 rows or 1 row of the same 2-octave span) up/down by one
octave.

## Consequences
- Verified with Playwright at both a portrait and a landscape viewport,
  via Single Phone Mode (real device rotation isn't testable in this
  sandbox): portrait renders exactly 2 `.keyRow`s of 13 keys each (C to
  C), landscape renders exactly 1 row of 25 keys — confirmed by reading
  the rendered DOM and by screenshot.
- No change to note range, persistence, or the Keyboard's message
  protocol — purely a layout change, same as `adr/0017` was.
