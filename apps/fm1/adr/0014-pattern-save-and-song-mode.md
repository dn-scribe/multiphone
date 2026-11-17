# 14. Saved patterns and Song mode

## Status
Accepted

## Context
Until now there was exactly one sequencer state: whatever you were
currently editing, auto-persisted to `localStorage` on every change.
There was no way to keep more than one arrangement, or to play more
than one pattern in a row without manually re-editing between them.
`REQUIREMENTS.md` staged this as "pattern save + song mode (chaining
patterns, like Felucca's up-to-16-section song mode)."

## Decision
Mirror the relationship `adr/0012` already established for
instruments — "the current thing" auto-persists as before; named
saves are a separate, explicit library on top:

- **Patterns**: `localStorage` (`multiphone.fm1.patterns`), an array
  of `{id, name, patternLen, swing, tracks}` snapshots. "💾 Save
  Pattern" snapshots the currently-edited tracks/length/swing (tempo
  is NOT part of a pattern — it's a transport-level setting shared
  across the whole song, matching how Felucca's tempo lives in
  `HOME > CLOCK`, separate from patterns). Tapping a saved pattern
  loads it back into the live editor (restoring tracks, steps, length,
  swing); holding one (600ms, same gesture used elsewhere) deletes it
  after a `confirm()`.
- **Song**: `localStorage` (`multiphone.fm1.song`), an ordered array
  of `{patternId, repeats}`. Each saved pattern has a ➕ button that
  appends it to the song with `repeats:1`; a song row has ◀/▶ to
  adjust its repeat count (1-8) and ✕ to remove it. There's no
  separate reorder control — removing and re-adding (via ➕, which
  always appends) is how you reorder for now; see open questions.
- **Song Mode** is a toggle, independent of Play/Stop. With it off,
  Play loops the current pattern forever, exactly as before. With it
  on, pressing Play loads the song's first pattern and plays through
  the song's entries in order, looping each one for its configured
  repeat count before advancing — checked once per pattern-loop
  boundary (`stepIndex===0`) in the same place `loopCount` is already
  tracked for Phase 3's `1:2`/`2:2` conditions. `loopCount` resets to
  1 whenever a new pattern loads, so those per-pattern conditions stay
  correctly scoped to whichever pattern is currently playing, not the
  song as a whole. An empty song with Song Mode on just shows "Song is
  empty" and doesn't attempt to play anything broken.

## Consequences
- You can now build a few patterns, chain them into an actual arrangement,
  and the Sequencer plays through it unattended — the main missing
  piece toward feeling like a real groove box rather than a single
  looping pattern.
- Verified with Playwright: saving two patterns with different
  content, tapping one restores exactly its own steps (not the other's
  or whatever was being edited), and building a 2-entry song with
  Song Mode on correctly plays pattern A for its loop then switches to
  pattern B, firing exactly the notes each pattern defines.
- No reordering UI, no limit on song length, no duplicate-name
  prevention, and tempo is shared/global rather than per-pattern —
  all reasonable for a personal, pre-1.0 tool; tracked as open
  questions rather than silently decided forever.
- Still no live recording, parameter locks, or per-step pitch/ties/
  slides/chords — unaffected by this ADR, still open from `adr/0013`.
