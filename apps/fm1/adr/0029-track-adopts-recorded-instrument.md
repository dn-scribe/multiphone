# 29. A track adopts the instrument it was actually recorded with

## Status
Accepted

## Context
Requested directly, right after `adr/0028` shipped ⌨️ Keyboard Sound: "The
track should save the instrument used when recorded, let me replace it
later in the track editor." Keyboard Sound resolves *live* on every
play - by design (`adr/0028`: "not a cached snapshot"), so a track set
to it keeps changing sound if Keyboard/Controls' patch changes later.
That's the opposite of what a *recording* should do: capture a
performance as it sounded, not keep silently re-interpreting it.

## Decision
- Whenever a track actually captures a note - live while recording, or
  the instant-entry tap in ✏️ edit mode - it now **adopts the
  instrument that made the sound**, automatically:
  - A drum hit (`msg.drum` present) sets the track to 🥁 Drum Kit.
  - Anything else (a Keyboard note or a Chord-tool hit) freezes a
    **snapshot** of Keyboard/Controls' current patch onto the track
    itself (`track.recordedPatch`) and sets the track to a new
    **🎙️ Recorded** pseudo-instrument. Unlike Keyboard Sound, this
    patch is captured once, at that moment, and never changes again on
    its own - playing the track back later always sounds like it did
    when recorded, even if Keyboard's patch has since moved on.
  - Only changes the instrument when it doesn't already match, so it
    won't fight a deliberate manual pick mid-recording.
- **Replacing it is just the existing instrument-cycle button** - tap a
  track's instrument name to cycle to something else, same as always.
  🎙️ Recorded isn't in that cycle's list (it's a per-track, per-recording
  state, not a general-purpose pick), so cycling away from it moves on
  to Drum Kit/Keyboard Sound/the presets/customs like normal, and
  cycling TO it isn't possible - it only ever appears as a result of
  actually recording something.
- `track.recordedPatch` travels everywhere `instrumentKey` does: saved
  Patterns (`cloneTrackForSave`/`applyPattern`, `adr/0014`) and file
  Export/Import (`adr/0022`) both now carry it, so a recorded sound
  survives being saved, reloaded, or moved to another phone.
- `fireTrackStep` reads `track.recordedPatch` directly for a 🎙️
  Recorded track (there's no *global* instrument to resolve - the patch
  only exists on that one track), the same way it already reads
  `track.instrumentKey==='drumkit'` as a special case rather than going
  through the shared instrument list.

## Consequences
- Verified with Playwright: recording a Keyboard note into a track
  (via edit-mode instant entry) while Controls was set to Bell flipped
  that track's instrument label to 🎙️ Recorded immediately; changing
  Controls to Brass *afterward* had no effect on it - played-back audio
  still used Bell's exact patch values, confirming the snapshot is
  truly frozen, not a live link; tapping the instrument-cycle button
  afterward moved it on to a different instrument, as requested.
  Drum Pad recording still correctly sets Drum Kit, unchanged.
  Saved Patterns and Export both round-trip `recordedPatch` correctly.
  Re-ran the full melodic and drum regressions (Hallelujah piece,
  quick-tap recording, Drum Kit) - all unaffected.
- ⌨️ Keyboard Sound (`adr/0028`) is unchanged and still available as a
  deliberate manual pick, for the opposite case: a track that should
  always mirror whatever Keyboard currently has set, not freeze at
  record time. The two now serve clearly different purposes instead of
  overlapping.
