# 23. A phone can run more than one role at once

## Status
Accepted. The specific role list changed in `adr/0025` (Sequencer and
Tracks merged into one role, back to 3 total) but multi-select itself,
and everything below about why it works, is unchanged.

## Context
Each networked phone was locked to exactly one role (Keyboard, Controls,
Sequencer, or Tracks), picked with a single-select button group. With 4
roles and often fewer than 4 phones in the room, that's awkward - e.g.
two phones naturally want to split the roles in pairs (one plays and
shapes sound: Keyboard + Controls; the other composes: Sequencer +
Tracks) rather than needing a 3rd/4th phone just to cover a role nobody
is dedicating a whole device to.

Single Phone Mode (`adr/0008`) already solved the "more roles than
phones" problem for the solo case, by mounting every role's panel
together via `shared/single-phone.js`'s generic multi-panel layout. The
same layout mechanism works just as well for a *networked* phone running
more than one role - it doesn't know or care what kind of `room` object
a panel's `mount()` closes over.

## Decision
- The role picker (`#screen-instrument`) is now multi-select: each
  choice button toggles independently (same pattern as Mute/Solo
  elsewhere), Continue stays disabled until at least one is picked.
- `instrumentRole` (a single string) became `instrumentRoles` (an
  array). The roster (`peers[id]`) now stores `{roles: [...]}` instead
  of `{role: '...'}`, and the room-status line joins them
  (`"keyboard+controls"`).
- `enterStage()` builds a `wrapped` room exactly as before, then mounts
  one panel per chosen role, all sharing that *same* `wrapped` object.
  With exactly one role it mounts directly (no extra chrome); with more
  than one it hands the panel list to `SinglePhone.mountPanels()` - the
  identical multi-panel layout Single Phone Mode uses, just fed a real
  networked room instead of a local one.
- This works for free, with no new message-routing plumbing: a host's
  own `Multiphone.host().broadcast()` already loops a locally-sent
  message back through the host's own `onMessage` (confirmed by reading
  `shared/multiphone.js` directly - `broadcast()` both sends to every
  connection *and* calls `opts.onMessage(msg, myId)` itself), and a
  joiner's own messages come back the same way via the host's
  re-broadcast to every connection, including the one it arrived on.
  Since every panel on a phone registers into the same shared
  `panelHandlers` list regardless of which panel called
  `room.onMessage()`, two panels on the same phone see each other's
  messages exactly like two panels on different phones would - e.g. a
  phone running Keyboard + Controls together has Controls' "now
  playing" update from its own Keyboard's notes, and its Controls'
  patch changes reach its own Keyboard, with no special-casing.
- `ROLE_PANELS`, a role -> `{id,label,mount}` map, replaced the
  if/else-if chain in `enterStage()` and the hand-written 4-entry array
  in `enterSinglePhoneMode()` - both now build their panel list from the
  same single source.

## Consequences
- Verified with Playwright (real PeerJS isn't reachable in this
  sandbox, so the host's own stage was driven directly: `room` stubbed
  to mimic `Multiphone.host()`'s actual broadcast-loops-back behavior,
  confirmed from reading the real implementation rather than guessed):
  the role picker's multi-select toggles correctly and Continue
  enables/disables on the selection count; choosing Keyboard + Controls
  mounts both via the multi-panel layout; a note played on the
  Keyboard panel updates the Controls panel's "now playing" live while
  held and clears on release - confirming same-phone cross-panel
  messaging actually works, not just that it mounts.
- No protocol/version bump needed for peers talking to an *old* client
  that still sends `{role: '...'}` - this only matters within one
  shared session, and every phone in a room runs the same deployed
  code (a static site with one live version), so there's no real
  mixed-version scenario to migrate.
- Single Phone Mode's own behavior (always all 4 roles, one person
  alone) is unchanged - this just gives *networked* phones the same
  "more than one role, same device" option it already had.
