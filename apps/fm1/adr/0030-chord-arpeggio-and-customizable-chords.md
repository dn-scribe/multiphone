# 30. Chord tool: arpeggio mode + choose from a much larger chord set

## Status
Accepted

## Context
Requested directly: "Add to chords arpeggio capabilities + a capability
to choose my chords from a much larger set." The Chord tool
(`adr/0028`) shipped with exactly 7 fixed pads - the diatonic triads of
C major, hardcoded - and only ever played a block chord (all notes at
once).

## Decision
- **144 chords to choose from, not 7.** `CHORD_QUALITIES` holds 12
  qualities (Major, Minor, Dim, Aug, Sus2, Sus4, 6, Minor 6, 7, Major 7,
  Minor 7, Add9) as semitone-offset sets; crossed with the 12 chromatic
  roots, that's 144 combinations. `chordLabel()`/`chordNotesFor()`
  compute a pad's actual name/notes from `{root, quality}` plus the
  existing octave selector, instead of a fixed offset list.
- **Each of the 7 pads is independently assignable**, not a fixed set:
  holding a pad (500ms, without releasing early) stops whatever it was
  playing and opens an inline editor below the grid - a 12-button root
  picker and a 12-button quality picker, tapping either updates that
  pad immediately (saved to `localStorage` as `chordPads`, so the
  layout persists). The default 7 pads are still the original diatonic
  C-major triads, just now expressed as `{root,quality}` and editable.
  A quick tap (released before 500ms) still just plays the pad, exactly
  as before - holding to edit only engages if the pointer stays down
  past the threshold, mirroring the hold-vs-tap pattern already used
  throughout this app (e.g. Sequencer's accent-hold, adr/0011).
- **Arp mode**: a new toggle (next to the octave control) that changes
  what *holding* a pad does. Off (default): the existing block-chord
  behavior, all notes together. On: holding a pad plays its notes one
  at a time, repeating in a cycle (fixed rate, 130ms/note) for as long
  as it's held, releasing the previous note as each new one starts -
  a genuine arpeggio, not a chopped-up chord.
- **Arpeggio notes are recorded individually**, not reduced to the
  chord's root like block mode still is. This isn't a special case -
  it falls out of how recording already works (`adr/0024`/`0026`):
  each arpeggio note is sent as its own real `{t:'note',...}` message
  as it's triggered, so Tracks' existing per-tick capture just does
  what it always does, landing each note on whichever step is current
  *then*. A chord's root-only recording in block mode was always a
  limitation of simultaneity (3+ notes, 1 step) - arpeggio notes aren't
  simultaneous, so there's no such limitation to work around.

## Consequences
- Verified with Playwright: a quick tap plays without opening the
  editor; holding a pad for 500ms stops its sound and opens the editor
  showing the right pad/chord; picking a different root and quality
  updates that pad's label immediately and persists
  (`localStorage`'s `chordPads` reflected the new `{root,quality}`).
  Instrumenting `triggerVoice` confirmed block mode fires a chord's
  notes simultaneously (same tick, same millisecond) while Arp mode
  fires them sequentially at the expected ~130ms spacing, cycling
  through the chord tones. Holding an arpeggiating pad while a Tracks
  track was armed and playing produced a recorded sequence with 3
  distinct pitches (not just the root), including a step correctly
  tied where an arp note's hold outlasted one tick - a real, working
  capture of the actual arpeggio, not an approximation.
- Re-ran the full melodic and drum regressions (Hallelujah piece,
  quick-tap recording, Drum Kit recording, the Recorded-instrument
  snapshot behavior) - all unaffected.
- Arp rate is fixed (130ms), not adjustable, and arpeggio direction is
  always "up, then repeat from the bottom" - no down or up-down
  patterns. Left open if that turns out to matter; kept simple for
  this pass, consistent with the project's usual scoping.
