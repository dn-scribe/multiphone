# 3. Optional name + emoji per player

## Status
Accepted

## Context
The lobby originally showed every player as a generic "📱" row. With up
to 5 phones, players couldn't tell their own row apart from anyone
else's except by button count, and there was no personality to it.

## Decision
Add an optional name field and emoji picker to the setup step (tapping
a selected emoji again clears it). Both default to a generic phone icon
and "Player" when left blank. This data travels as part of the
`join`/`lobby` messages over the existing peer connection — it's
cosmetic only, never used for game logic.

Because name/emoji are attacker-controllable peer data (a malicious
client could send arbitrary strings as its "join" payload), they are
HTML-escaped and length-clamped (`esc()` in `apps/simon/index.html`)
before being inserted into the lobby list via `innerHTML`.

## Consequences
- Lobby rows are easier to tell apart and a bit more fun, with no
  required input.
- Any future rendering of peer-supplied name/emoji elsewhere in the app
  must go through the same escaping — it isn't automatically safe just
  because it looked fine in the lobby.
