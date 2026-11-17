# 11. Sequencer, Phase 2: 4 tracks, variable length, accent, mute/solo, swing

## Status
Accepted

## Context
`adr/0010` shipped a deliberately minimal Phase 1 sequencer (1 track, 16
steps, one pitch) to prove the generic panel/room design past 2 roles.
`REQUIREMENTS.md` staged Phase 2 as: multiple tracks (toward Felucca's
4) each with its own preset, variable pattern length, per-step
velocity/accent, mute/solo, and swing.

Two scoping calls were made while building this:

1. **"Per-step velocity" became "per-step accent" (binary), not a
   continuous value.** A continuous velocity control on every one of
   up to 256 step buttons (4 tracks × 64 steps) has no reasonable touch
   UI without a lot more screen real estate or a separate editing mode.
   Felucca itself has "accent" as one of its named per-step modifiers
   alongside continuous velocity, so a binary accent (tap-and-hold a
   step to toggle it, only meaningful on an active step) is a real
   subset of that feature, not a different one. True continuous
   per-step velocity stays an open question, likely alongside the
   other per-step modifiers (ties, slides, chords, ratchets, chance,
   conditions, parameter locks) already deferred to Phase 3.
2. **Each track's preset is one of the 4 fixed presets (cycled by
   tapping its name), not independently editable ratio/FM/ADSR/wave
   sliders.** 4 tracks × 7 sliders would make the Sequencer panel
   enormous and duplicate the Controls panel's entire UI four times
   over. If per-track custom patches are wanted later, that's a new
   decision (e.g. a small per-track "edit" screen), not a natural
   extension of this.
3. **Pitch is still fixed (A4) for every track and step.** Phase 2's
   brief never actually called for per-step pitch/melody — only
   per-step accent — so this was never in scope here. Recorded now as
   its own explicit open item so it isn't silently forgotten.

Swing needed the clock to support a variable delay between steps
(classic swing keeps each on-beat/off-beat *pair*'s total duration
constant while skewing the split between the two halves). The Phase 1
clock was a fixed-interval `setInterval`, re-armed only on BPM change,
which can't express that. It was replaced with a self-rescheduling
`setTimeout` chain, where each tick computes its own delay to the next
tick from the current BPM and swing. This is still not sample-accurate
lookahead scheduling (`adr/0010`'s call stands), but it's the natural
structure for variable per-step timing and happens to also make BPM
changes take effect on the very next step with no special-casing,
where Phase 1 needed to explicitly cancel and re-arm its interval.

## Decision
- 4 tracks, each `{preset, muted, solo, steps: [{on, accent}, ...]}`.
  Default presets: E.Piano, Bass, Bell, Brass (one of each existing
  preset, giving an immediately-usable mini arrangement).
- One shared pattern length for all 4 tracks: 16, 32, or 64 steps,
  picked with three buttons (not a continuous control, matching the
  discrete values this needs). Changing it resizes every track's step
  array (`resizeSteps`): grows with new off steps, shrinks by
  truncating — no attempt to preserve steps beyond the new length.
- Tap a step to toggle on/off; tap-and-hold (350ms) an *on* step to
  toggle its accent (accented steps play at a fixed higher volume than
  normal ones; turning a step off also clears its accent).
- Mute (`M`) and solo (`S`) per track, standard mixing semantics: if
  any track is soloed, only soloed tracks are audible regardless of
  their own mute state; otherwise muted tracks are simply silent.
- Swing (50-75%, 50 = straight) via the pair-duration-preserving delay
  described above.
- All of this persists via `localStorage` per phone
  (`seqTracks`/`seqLen`/`seqSwing`, alongside the existing `seqBpm`) —
  same per-device tradeoff as everything else under `adr/0007`. Phase
  1's flat `seqSteps` key is simply superseded/unused now; no
  migration was written for it (nothing externally depends on this
  pre-1.0 app's local storage format).
- The sequencer no longer reads the Controls phone's live patch
  (Phase 1 did, for its single implicit track) — each track's sound is
  now fully determined by its own chosen preset, independent of
  whatever Controls is doing.

## Consequences
- A legitimately useful 4-track groove is now possible on one phone,
  still without owning any real hardware.
- The per-step UI (tap vs. hold) is a new interaction pattern in this
  app; verified with Playwright that a tap toggles on/off, a hold
  toggles accent without also toggling on/off, and turning a step off
  clears its accent.
- Still far from Felucca's full depth: no per-step pitch, ties, slides,
  chords, ratchets, chance, conditions, parameter locks, pattern
  save/song mode, or live recording. These remain Phase 3, tracked in
  `REQUIREMENTS.md`.
