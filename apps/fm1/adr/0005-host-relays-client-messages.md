# 5. The host relays messages between clients

## Status
Accepted

## Context
`shared/multiphone.js` connects every client to the host directly, but
clients can't message each other — only the host can `broadcast()`.
With exactly 2 phones (the core use case) this is irrelevant: any
message a client sends is naturally "for" the host, and vice versa.
But a 3rd phone (e.g. a second Keyboard, left open as a possibility in
`REQUIREMENTS.md`) would have no way to see another client's `note` or
`patch` messages without the host explicitly forwarding them.

## Decision
The host's `onMessage(msg, fromId)` callback relays: if `fromId` is not
the host's own id (i.e. the message came from a client over the wire),
the host calls `room.broadcast(msg)` again — which both re-sends it to
every connection (including, harmlessly, back to the original sender)
and loops back into the host's own handler with `fromId === myId`,
which is what actually applies the message (`handleMessage(msg)`).
This turns the star topology into a full relay with about 4 lines of
code, rather than hand-writing per-message-type forwarding.

## Consequences
- A 3rd+ phone joining this session sees the same patch/note traffic
  as everyone else, with no extra protocol work.
- Every message does one extra hop through the host even in the
  2-phone case (client → host → client), which is already how
  `shared/multiphone.js` works for everything — not a new cost.
- This relay pattern is generic enough to lift into
  `shared/multiphone.js` itself if a future app wants it by default,
  rather than re-deriving it per app.
