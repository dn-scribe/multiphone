# 4. Any player can start a new game; restart re-includes late joiners

## Status
Accepted

## Context
"Play Again" was host-only (`room.broadcast()` is host-only by
construction — a client only has `room.send()`), and it reused the
exact `assignment` object built when the *first* game started. A phone
that joined after that — mid-game, or while everyone was sitting at
the game-over screen — had no entry in `assignment` at all: pressing
"Play Again" would start a new round with buttons for the original
players only, silently excluding anyone who joined since.

Separately, names/emoji (`adr/0003`) were never persisted — reopening
the app always started from a blank name and no emoji, even on the
same phone.

## Decision
- `buildAssignment()` is now a function, not a one-off inline block —
  it builds the button assignment from whatever `players` currently
  holds. Both the initial "Start Game" and the new `hostRestart()`
  call it fresh, so a restart always reflects who's actually connected
  right now, not who was connected when the *first* game began.
- "Play Again" is shown to every player, not just the host. Tapping it
  on the host runs `hostRestart()` directly; tapping it on a client
  sends `{t:'restart'}` to the host, which the host's `onMessage`
  handler now routes to the same `hostRestart()` — so the host stays
  the single source of truth for game state regardless of who asked
  for the restart. `hostRestart()` no-ops if a game is already active,
  guarding against two players tapping it at once.
- Name and emoji now persist in `localStorage`
  (`multiphone.simon.name`/`.emoji`, wrapped in try/catch, same
  per-phone-only convention as FM-1 Clone's local persistence) and
  pre-fill the setup screen on load. This is what "default to stay
  [identified as the] same user" actually means here: there's no
  stable identity across a reconnect (PeerJS hands out a new peer id
  every time), but your chosen name/emoji now carry over automatically
  instead of needing to be retyped.

## Consequences
- Verified directly against the page's functions (real PeerJS
  networking isn't reachable from this sandbox): `buildAssignment()`
  correctly includes a simulated late-joining player with their own
  button count; `hostRestart()` broadcasts exactly once and is a
  no-op on a duplicate call while a game is already active; a
  simulated non-host's "Play Again" tap sends `{t:'restart'}` rather
  than trying to broadcast; name/emoji pre-fill from `localStorage`
  on load and update it when changed.
- The old "Waiting for the host to start a new round…" message and
  its element are removed — no longer true, since anyone can trigger
  it now.
- Still no stable identity across a reconnect, and no host migration
  if the host itself disconnects — both remain open in
  `REQUIREMENTS.md`.
