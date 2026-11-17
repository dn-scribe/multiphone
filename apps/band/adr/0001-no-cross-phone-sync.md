# 1. No cross-phone synchronization

## Status
Accepted

## Context
Phone Band is a "multiplayer" instrument app: several phones, each played
by a different person, meant to sound like a band together. Some
multiphone apps (e.g. Phone Simon) need every phone to agree on shared,
live state — a sequence, whose turn it is. A naive design for Band might
assume it needs the same kind of networking "to keep phones in sync."

## Decision
Phone Band has no networking at all. Each phone independently picks an
instrument from a shared, fixed list and plays it locally; there is no
session, room code, or state shared between phones. Musical coherence
comes from every instrument being written in the same key/scale (A minor
pentatonic), not from coordination.

## Consequences
- Zero networking code, zero external dependencies, zero failure modes
  related to connectivity — any number of phones can join or leave a
  "jam" by simply opening the page.
- There is no way to see what instruments other phones have picked,
  prevent two phones picking the same instrument, or synchronize
  tempo/BPM across phones. If a future requirement needs any of that,
  it's a new decision — and would likely reuse `shared/multiphone.js`
  (built later for Phone Simon) rather than inventing new networking.
