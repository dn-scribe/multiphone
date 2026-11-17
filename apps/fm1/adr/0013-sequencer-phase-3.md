# 13. Sequencer, Phase 3: ratchet, chance, and per-step condition

## Status
Accepted

## Context
`REQUIREMENTS.md` staged Phase 3 as: per-step ties/slides/chords/
ratchets/chance/conditions; parameter locks; pattern save + song mode;
live recording with quantize. Looking at what each of these actually
needs:

- **Ties, slides and chords are fundamentally about pitch** — a tie
  means "this note continues," a slide means "glide from one pitch to
  another," a chord means "more than one pitch at once." This
  sequencer has never had per-step pitch; every track still plays one
  fixed note (A4). That gap was flagged as its own open item back in
  `adr/0011`, not fixed since. Building ties/slides/chords without
  pitch first would mean inventing a different, lesser feature under
  the same name, so they're left out here rather than faked.
- **Parameter locks** (automating an arbitrary knob per step) need a
  concrete target parameter to lock, and the most natural targets
  (per-operator parameters) don't exist on a track yet either (a track
  is just "an instrument," not an editable set of synth parameters —
  see `adr/0012`'s companion decision to keep instruments as a
  pick-from-a-list, not a per-track editor). Also deferred.
- **Pattern save + song mode** and **live recording with quantize**
  are real, substantial features in their own right, independent of
  the pitch question. Deferred simply on size/scope grounds, to keep
  this phase shippable.
- **Ratchet, chance, and condition** need none of the above — they're
  properties of *when and how many times* an already-fixed-pitch step
  fires, which is exactly what this sequencer already models.

## Decision
Ship ratchet, chance, and condition as Phase 3's actual scope. Each
step gains:
- `ratchet` (1/2/3/4): re-trigger that step's note this many times,
  evenly spaced within its own duration.
- `chance` (100/75/50/25%): a per-firing probability check.
- `condition` (`all` / `1:2` / `2:2` / `fill`): `1:2`/`2:2` fire only
  on odd/even pattern loops respectively (tracked via a `loopCount`
  incremented each time playback wraps to step 0); `fill` fires only
  while the new momentary **FILL** transport button is held down.

Interaction design: tap/hold on a step keep their existing meaning
(toggle on/off, toggle accent) unchanged. A new per-track **✏️** button
puts that track into "edit mode"; while active, tapping a step
*selects* it (shown with a cyan inset highlight) instead of toggling
it, and a detail panel appears under that track showing the selected
step's Ratchet/Chance/Condition as three rows of small buttons. This
avoids overloading a single small touch target with a 4th/5th gesture,
and keeps the common case (plain on/off, accent) exactly as fast as
before.

## Consequences
- A real, if partial, step toward Felucca's groove-box depth —
  ratchets and probabilistic/conditional steps meaningfully change how
  a pattern can feel, without needing melody.
- Verified with Playwright: ratchet fires the voice the configured
  number of times within one step; `2:2` correctly fires on even loops
  only; editing one track's step detail doesn't affect another
  track's (a real bug caught and fixed during this work — a shared
  `curDetailTrack` variable was being clobbered by whichever track
  rendered last; fixed by passing the track explicitly into the
  picker-row closures instead).
- Per-step pitch/melody, ties, slides, chords, parameter locks, pattern
  save + song mode, and live recording all remain open — tracked in
  `REQUIREMENTS.md`, not silently dropped.
