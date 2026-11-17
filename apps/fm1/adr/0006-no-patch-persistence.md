# 6. No patch persistence in v1

## Status
Accepted

## Context
A real patch save/load system (naming, storing, recalling custom
patches — locally, or shared across a session) is a meaningful feature
on its own, and the project has a static-site, no-backend constraint
to design within.

## Decision
v1 ships with exactly 4 hardcoded presets (E.Piano, Bell, Bass, Brass)
and no way to save a hand-tweaked patch. Reloading either phone resets
to the default preset. This keeps the first version small and
shippable.

## Consequences
- Nothing is lost that matters across a single play session (the
  Controls phone keeps its current patch in memory for as long as the
  tab stays open) — only a reload clears it.
- Saving/recalling custom patches is tracked as an open question in
  `REQUIREMENTS.md`, not forgotten, but deliberately deferred.
