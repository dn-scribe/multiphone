# 7. Patch and octave persistence via localStorage, per phone only

## Status
Accepted — supersedes `adr/0006-no-patch-persistence.md`

## Context
`adr/0006` deliberately shipped v1 with no persistence: reloading
either phone reset everything to the E.Piano preset. In practice,
losing a hand-tweaked patch on every reload (or every time the page
backgrounds and the browser kills the tab) is annoying enough to be
worth fixing, even without building real save/load/naming of patches
(still out of scope — see `REQUIREMENTS.md`).

This project has no backend and no cross-device storage of its own.
The only "free" persistence available is the browser's own
`localStorage`, which is strictly per-device, per-origin: it does not
sync to any other phone, and it isn't visible to Claude or anyone else
— it only ever reflects what that specific phone's browser last wrote.

## Decision
Each phone remembers, in its own `localStorage` (keys namespaced
`multiphone.fm1.*`, via small `lsGet`/`lsSet` helpers wrapped in
try/catch so blocked/unavailable storage — private browsing, storage
permissions off — degrades to "nothing persists" rather than crashing
the app):
- `patch`: the current FM patch, updated whenever it changes — either
  from this phone's own sliders (Controls role) or from a patch
  message received over the network (any role, so a Keyboard phone
  remembers the last patch it was told to use even if it's reloaded
  while playing solo).
- `octave`: the Keyboard screen's current octave.

On load, each phone starts from whatever it last had saved (falling
back to the E.Piano preset / octave 4 if nothing is saved yet).

This generalizes beyond FM-1: any app in this repo that wants to
remember something across reloads on the *same* phone should use this
same pattern (namespaced key, try/catch, no assumption it syncs
anywhere) rather than inventing per-app storage handling. Cross-phone
state is a different problem, already solved by `shared/multiphone.js`
— localStorage is not a substitute for it.

## Consequences
- Reloading the phone you were just using picks back up where you left
  off. This is a real, deliberate limitation, not a bug: **it is the
  user's responsibility to return to the same phone** to get their
  patch back — there is no way for a *different* phone to recover a
  patch that was only ever saved on the first one, short of recreating
  it on the sliders (or picking the closest preset) again.
- A phone used for the first time, or with storage blocked, just
  starts from the default preset — same as before this ADR, not a
  regression.
- Still no way to save more than one patch, name a patch, or share a
  patch between phones — those remain open questions in
  `REQUIREMENTS.md`.
