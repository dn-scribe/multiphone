# 31. True per-step chords, and recovering a lost 🎙️ Recorded instrument

## Status
Accepted

## Context
Requested directly, in reaction to actually using the Chord tool with
Tracks: "The chords are not recorded - only one sound. And if i by
mistake change the track instrument it may be lost." Two separate
complaints about decisions this app had made deliberately up to now:

1. Block-mode chord recording (`adr/0028`) only ever captured a chord's
   root note - a scope boundary drawn as far back as `adr/0013` and
   reaffirmed in `adr/0028`/`adr/0030` ("the step model stays
   monophonic"). Asked directly, that's no longer acceptable: a chord
   played into a track should record as a chord.
2. `adr/0029`'s auto-assigned **🎙️ Recorded** pseudo-instrument
   deliberately doesn't appear in `allInstruments()` - it's a per-track
   snapshot, not a general pick. But the per-track instrument-cycle
   button has no concept of "skip instruments that don't apply here" -
   it cycles the same global list on every track. Tap it once too many
   times by accident and 'recorded' is no longer reachable from the UI,
   even though `track.recordedPatch` is still sitting there intact.

## Decision
- **Step data is now `notes: number[]`, not `note: number`.** Almost
  always length 1, but a block-recorded (or arpeggio-into-ratchet, or
  drag-tied) chord step holds every note together. This threads through
  every place the old singular field touched:
  - `newStep()`/migration: old saved data with `note` is read into
    `notes:[note]` on load (Tracks' own storage, Patterns/Song, and
    Export/Import all get the same fallback).
  - `fireTrackStep()`: a drum step still uses `notes[0]` (one drum per
    step, unchanged); a melodic step triggers/releases one voice per
    note in `notes` together. **Slide is now restricted to single-note
    steps** (`notes.length===1`) - gliding a chord to another chord
    note-for-note isn't a defined operation, so it falls through to a
    normal retrigger instead, and the step detail panel hides the Slide
    toggle for the same reason a drum step hides it.
  - Drag-to-tie (`drawTieRun`): carries the whole `notes` array from the
    span's first step across every step it's dragged over, so dragging
    a tie across a recorded chord extends the full chord, not just its
    root.
  - The step detail panel's pitch stepper now labels a chord step as
    "C4+E4+G4" (joined note names, smaller font past 2 notes) and
    ◀/▶ transposes every note in the step together, instead of editing
    a single pitch.
  - The message protocol gained a `notes` array alongside the existing
    single `note` on every `{t:'note',...}` message (Keyboard, Drum
    Pad, both Chord tool modes) - `note` is kept as-is (Controls'
    "now playing" and `lastNote` still only need one), `notes` is the
    new full set Tracks' recording listener captures.
  - **The actual fix for complaint 1**: the Chord tool's block-mode
    `room.send` now sends `notes` (the whole chord), not just its root.
    Arp mode already recorded real per-note data (`adr/0030`) and is
    unaffected.
- **`instrumentCycleList(track)`**: a track-specific variant of
  `allInstruments()` that splices a `{key:'recorded',...}` entry onto
  the front of the list whenever `track.recordedPatch` is set on that
  track. The instrument-cycle button now calls this instead of
  `allInstruments()` directly, so once a track has ever recorded
  something, 'recorded' is a permanent, reachable stop in its own
  cycle - tapping the button enough times always loops back to it,
  exactly as recoverable as any built-in preset. No new UI, no
  confirmation dialog, no undo: the snapshot was never actually lost,
  it just needed to stay reachable.

## Consequences
- Verified with Playwright (Single Phone Mode, since real WebRTC is
  unreachable from this environment): a quick tap and a held press on
  a block-mode chord pad both now record every note of the chord
  (`notes:[60,64,67]`) onto the armed track, including correctly tied
  across a held run; arpeggio recording is unaffected (still each note
  individually); dragging a tie across a chord step propagates the
  whole chord; the step detail panel shows a joined chord label and
  transposes all its notes together; Slide is hidden for a chord step.
  Re-ran the full existing regression set (quick-tap recording,
  sustained-hold recording, edit-mode instant entry, drum recording,
  Hallelujah piece playback, Export/Import round-trip, recorded-
  instrument snapshot) - all pass with the renamed field. Confirmed
  `instrumentCycleList` only adds 'recorded' for a track that actually
  has a `recordedPatch`, and that repeatedly tapping a track's
  instrument button after cycling away from it eventually lands back
  on 🎙️ Recorded.
- Export/Import's schema gains `notes` in place of `note`; an old
  export file (pre-dating this ADR) still imports correctly via the
  same migration fallback used for localStorage.
- No quantize/parameter-lock changes - out of scope, unrelated to
  either complaint.
