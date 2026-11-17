# 16. Per-step pitch, tie, and slide

## Status
Accepted

## Context
Every step, on every track, always played the same fixed pitch (A4).
`adr/0013` and `adr/0014` both flagged this explicitly as the real
blocker for ties, slides and chords — a tie means "this note
continues," a slide means "glide from one pitch to another," neither
means anything without more than one pitch to work with.

## Decision
Each step gets its own `note` (MIDI number, defaulting to the old
fixed A4/69 so existing saved patterns sound unchanged until edited),
plus two new booleans, `tie` and `slide`, set from the per-step detail
panel (`adr/0013`'s ✏️ edit mode) via a ◀/▶ pitch stepper (range C2-C7,
matching the Keyboard's own usable range) and two toggle buttons.

- **Tie**: a tied step never fires on its own — `tick()`'s firing loop
  now skips any step with `tie` set. Instead, the *previous* firing
  step computes how many immediately-following steps are tied into it
  and extends its own hold by that many step-durations, so the one
  voice actually continues sounding through them.
- **Slide**: instead of triggering a new voice, a slide step calls a
  new engine function, `slideVoiceToFreq()`, which ramps the
  *existing* still-sounding voice's oscillator frequencies to the new
  pitch over roughly one step's duration — it only makes sense if a
  voice from the previous step is still alive to glide from (if not,
  e.g. the very first note, it's silently a no-op: nothing to slide).
  This needed the same hold-extension idea as tie: a plain step
  immediately followed by a slide step must *also* extend its own hold
  through the slide step's turn, or the voice is already released
  (back down to silence) by the time the slide step runs and there's
  nothing left to glide. A first implementation only extended for
  `tie`, and testing caught this immediately — a slide step found no
  live voice and silently fell back to a normal retrigger. The lookahead
  (now `legatoExtensionSteps()`) extends through any number of
  consecutive ties *and* through exactly one trailing slide.
- Each track keeps a `_lastVoice` reference (the most recent voice it
  triggered) so slide and the hold-extension logic know what's still
  live; every voice still gets exactly one `releaseVoice()` call
  whether or not it's still the "current" one when its own hold timer
  fires.

Chords are still not attempted — they need a step to hold *more than
one* note, which is a bigger data-model change than extending a
single-note step with modifiers, and stay open in `REQUIREMENTS.md`.

## Consequences
- The Sequencer can now play actual melodies, not just rhythms.
- Verified with Playwright: two steps with different pitches trigger
  at genuinely different frequencies; a tied step fires zero voices of
  its own while the originating note's trigger/release count still
  comes out right; a slide step was confirmed, after the lookahead
  fix, to call `slideVoiceToFreq()` on the still-live previous voice
  rather than `triggerVoice()` again.
- Per-step pitch/ties/slides apply within a single track only — a
  slide or tie never reaches across tracks, which matches how actual
  instruments work (one voice per track, not a merged timeline).
- Chords, parameter locks, pattern-level pitch tooling (e.g. a proper
  scale-locked picker instead of raw semitone stepping) all remain
  open.
