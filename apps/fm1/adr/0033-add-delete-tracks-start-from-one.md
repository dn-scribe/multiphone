# 33. Add/delete tracks, and start from a single track

## Status
Accepted

## Context
Requested directly: "Add to track a delete whole track, add track,
start from single track." Tracks has always had exactly 4 fixed
tracks - baked into the initial-load default (`TRACK_DEFAULT_KEYS`, a
4-entry list), Export/Import's validation (`data.tracks.length!==4`),
and the brand-new-phone default. Nothing let you remove a track you
didn't want, or build up from fewer than 4.

## Decision
- **A new phone now starts with 1 track, not 4.** The "nothing saved
  yet" default is a single track (`defaultInstrumentKeyForIndex(0)`),
  built up from there with Add Track. This only applies when there's
  genuinely nothing saved - anyone with an existing 4-track (or any
  other count) save keeps exactly what they already have; this is a
  change to the fresh-start default, not a migration that touches
  existing data.
- **➕ Add Track**, below the track list: appends one new, empty track
  (`patternLen`-long, all steps off) with the next instrument in
  `TRACK_DEFAULT_KEYS`'s rotation (cycling back around past the
  original 4 via `defaultInstrumentKeyForIndex`, so a 5th track isn't
  left with an undefined instrument). Capped at `MAX_TRACKS` (8) - not
  a considered product limit, just a guard against mashing the button
  into an unreasonably large DOM/localStorage footprint; an alert says
  so if hit.
- **🗑️ delete, per track**, added to the existing M/S/⏺/✏️ row: a
  hold-to-confirm gesture (600ms hold, then `confirm()`) rather than a
  single tap, matching the hold-to-delete already used for saved
  Patterns - deleting a whole track's recorded steps is exactly as
  destructive and irreversible. Disabled (dimmed, hold is a no-op)
  while it's the only track left - there's always at least one, so
  Tracks never has to handle "zero tracks" as a state anywhere else
  (playback, Export, Patterns, instrument-cycle, etc. all still assume
  at least one track exists, same as before).
- **Export/Import, and the initial-load check, no longer require
  exactly 4** - both now only check for "at least one track," so a
  3-track or 7-track arrangement exports and re-imports correctly. An
  old export file (always exactly 4, from before this ADR) still
  imports fine, since 4 satisfies "at least one" too.
- Patterns/Song (`adr/0014`) needed no changes at all - `cloneTrackForSave`/
  `applyPattern` already mapped generically over whatever `tracks`
  holds, never assuming a count. Loading a saved Pattern that has a
  different track count than what's currently on screen already just
  works - `applyPattern` replaces `tracks` wholesale.

## Consequences
- Verified with Playwright: a fresh profile (no `localStorage`) starts
  with exactly 1 track; an existing 4-track save loads unchanged (not
  reset to 1); Add Track correctly grows the list with rotating
  instruments and saves/re-renders; the cap at 8 shows the alert and
  stops growing; deleting a track removes exactly that one (persisted
  correctly) and is a no-op while only one track remains; Export then
  re-Import of a 3-track arrangement round-trips correctly (previously
  would have been rejected as "doesn't look like a Tracks export" for
  not having exactly 4). The 6-button track header (instrument/M/S/⏺/✏️/
  🗑️) still fits without overflow at a 390px mobile viewport.
- Separately investigated a second remark in the same report ("length
  of track longer than seen"): the step grid (`.seqStepsRow`) is a
  fixed 16-column CSS grid that *wraps* into additional rows for
  patterns longer than 16 steps, rather than scrolling horizontally or
  clipping - checked that all 16/32/64/128 steps really do render (DOM
  count matches `patternLen` exactly at every length) and the row
  grows tall enough to show every wrapped row with no `overflow`
  clipping. Found no actual missing/hidden steps this way; left
  unchanged pending more specific reproduction steps, since changing
  something that already measures out as correct risks fixing a
  problem that doesn't exist and masking whatever the real one is.
