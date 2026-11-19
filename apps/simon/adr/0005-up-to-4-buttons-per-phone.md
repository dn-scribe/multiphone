# 5. Up to 4 buttons per phone

## Status
Accepted

## Context
Requested directly: raise the per-phone button count from 1-3 to 1-4.
Nothing about the game logic assumed a cap of 3 - `colorForIndex()`
picks a color procedurally from a global index (no fixed palette size),
`buildAssignment()` just hands out `p.n` sequential indices per player
with no per-player limit, and the in-game pad grid
(`pads.style.gridTemplateRows=repeat(${myButtons.length},1fr)`) already
sizes itself to however many buttons a phone was assigned. The only
actual limit was the picker screen only offering 1/2/3 as choices.

## Decision
Added a 4th choice to `#countChoices` (and widened its grid to 4
columns). Nothing else needed to change - the game already supported
however many buttons `myCount` said, this just makes 4 a reachable
value.

## Consequences
- Verified with Playwright: the picker now offers 1-4 and picking 4
  enables Continue; driving the game screen directly with a 4-index
  assignment (real PeerJS networking isn't reachable in this sandbox)
  renders exactly 4 pads with 4 distinct colors, each sized to still be
  large and tappable on a phone screen (confirmed via screenshot).
- The existing open question about a possible warning when total
  buttons across phones gets very large (`REQUIREMENTS.md`) is now
  slightly more reachable (5 phones × 4 = 20) but still not addressed
  here - out of scope for this change specifically.
