# 12. A saved-instrument library, shared by Controls and the Sequencer

## Status
Accepted

## Context
Every sound in this app came from exactly 4 hardcoded presets. The
Controls panel could hand-tweak a patch, but there was nowhere to keep
the result, and Sequencer tracks could only ever cycle through those
same 4 presets — there was no way to design a sound on Controls and
then actually use it in the Sequencer.

## Decision
Add a small saved-instrument library, stored in `localStorage`
(`multiphone.fm1.instruments`, an array of `{id, name, patch}`) — per
phone only, same tradeoff as everything else under `adr/0007`.

- Controls gets a "💾 Save as Instrument" button: `prompt()`s for a
  name (native dialog — this app already uses `alert()` for
  disconnects elsewhere, so a native `prompt()`/`confirm()` here is
  consistent, not a new pattern) and appends the current patch to the
  list.
- The Controls instrument row is no longer 4 hardcoded buttons — it's
  rendered from `allInstruments()`, a shared helper combining the 4
  built-in presets with every saved custom instrument. Tapping any of
  them loads that patch, same as before. Holding a *custom* one (same
  600ms-hold gesture used elsewhere in this app) deletes it, after a
  `confirm()`.
- Sequencer tracks now store an `instrumentKey` (`"preset:epiano"` or
  `"custom:<id>"`) instead of a bare preset name, and cycle through
  the exact same `allInstruments()` list — so any saved instrument is
  immediately available to every track. `resolveInstrument(key)` falls
  back to the E.Piano preset if a track's key no longer resolves (e.g.
  its custom instrument was deleted on Controls), so a stale reference
  never produces silence or a crash — just a quiet fallback.
- Phase 2 sequencer saves had a bare `preset` field; loading migrates
  it to `instrumentKey:'preset:'+preset` once, in place.

## Consequences
- Custom sounds designed on Controls are now genuinely reusable across
  the whole app, which is most of the point of "synth save instruments
  to use in seq."
- A track's displayed instrument *label* can go stale if its custom
  instrument is deleted elsewhere while that track's panel isn't
  re-rendering (Controls and the Sequencer are separate mounted panels
  that only talk through `room` messages, by design — there's no
  "poke this other panel to refresh" channel, and adding one just for
  this cosmetic case isn't worth it). This is cosmetic only:
  `resolveInstrument()`'s fallback means playback is never actually
  broken, and the label corrects itself the next time that control is
  used. Noted as a known limitation in `REQUIREMENTS.md`, not treated
  as a bug to fix.
- No naming collisions are prevented (two instruments can share a
  name) and there's no limit on how many can be saved — acceptable for
  a personal, pre-1.0 tool; worth revisiting if it ever matters.
