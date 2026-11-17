# 8. Single Phone Mode, built as reusable infra rather than an FM-1-only toggle

## Status
Accepted

## Context
FM-1 Clone needs two phones to be fully playable (one Keyboard, one
Controls). In practice people want to use it — and test it — with only
one device available. An early sketch of this treated it as a "debug"
toggle that flips which of the two screens is showing, sharing state
through plain global variables. Two things changed that plan:

1. It's a real, user-facing way to use the app alone — not a developer
   convenience — so it shouldn't be named or framed as "debug."
2. On an actual browser (not just a phone), seeing both roles on
   screen *at once*, side by side, live, is more useful than flipping
   between them one at a time. On a phone's narrower screen, flipping
   between them is still the right behavior (there isn't room for
   both at once).
3. This project already expects more multi-role apps later (e.g. a
   sequencer), so solving this with FM-1-specific globals would mean
   re-solving it from scratch for every future app with more than one
   role.

## Decision
Two pieces, factored as generic `shared/` infra rather than FM-1-only
code:

- **`shared/single-phone.js`**: `SinglePhone.createRoom()` returns a
  room you can get any number of local "peers" from
  (`{myId, send(msg), onMessage(cb)}`); every peer's `send()` reaches
  every peer from the same room (including itself) synchronously, in
  memory — no network, no PeerJS. `SinglePhone.mountPanels(container,
  panels)` takes `[{id, label, mount(contentEl)}, ...]` and renders
  them responsively (paired with `shared/single-phone.css`): side by
  side and all live at once above a width breakpoint, or one at a
  time behind a switcher bar below it — every panel stays mounted
  (just hidden) when switching, so switching never loses state.
- **FM-1's Keyboard and Controls screens became "panels"**:
  `createKeyboardPanel(el, room)` / `createControlsPanel(el, room)`
  each build their own UI into whatever element they're given, scoped
  with `querySelector` (never global ids, since more than one copy
  can now exist on screen at once), and talk only through the `room`
  argument's `send`/`onMessage` — never through shared globals. This
  is exactly the same shape `shared/multiphone.js`'s real rooms
  already have, so the *same* two functions now serve both: a real
  cross-phone session (wrapping the actual `Multiphone.host()`/
  `.join()` room) and Single Phone Mode (wrapping a local
  `SinglePhone` room) use identical panel code. There is no second,
  divergent implementation to keep in sync.

A third top-level button, "📱 Single Phone Mode," sits on the role
screen alongside Host/Join. Picking it skips networking entirely and
mounts both panels locally.

## Consequences
- Works with zero network connection and no second device — genuinely
  solves "I only have one phone," not just a dev convenience.
- Any future multiphone app that structures its roles the same way
  (a `mount(el, room)` function per role, talking only through
  `room`) gets Single Phone Mode for free by calling
  `SinglePhone.mountPanels()` with its own panel list — no new
  per-app plumbing, and no limit to exactly two roles (a 3-role app,
  e.g. with a sequencer panel, works the same way).
- The local `SinglePhone` room is deliberately simpler than a real
  `shared/multiphone.js` room: every peer can reach every other peer
  directly (no host/relay asymmetry), since there's no real network
  to economize messages over. A panel's logic must not assume it's
  talking to a *host* specifically — only that `send()` reaches
  everyone, which is true in both cases.
- This forced a genuine refactor (panel functions take an element and
  a room instead of reading global ids/state), which also made the
  real networked path's code simpler to follow — not purely a cost
  paid for the new feature.
