# 6. Shared networking helper now surfaces connection failures instead of hanging silently

## Status
Accepted

## Context
Reported directly: "I chose host + number and cont does nothing." The
cause was in `shared/multiphone.js` (used by both this app and FM-1
Clone, not Simon-specific), reproduced directly: if the PeerJS script
itself fails to load - a flaky connection, an ad-blocker, a CDN hiccup
- `new Peer(...)` throws synchronously (`ReferenceError: Peer is not
defined`) *before* any error handler exists to catch it. That exception
is uncaught, so it silently aborts the click handler right after
`$('countGo').disabled=true` runs - the button just stays disabled
forever, with no error shown and no way to tell what happened. A
second, related failure mode has the same symptom: the signaling
connection can simply hang, with neither PeerJS's `'open'` nor
`'error'` event ever firing, leaving the same dead end.

Both apps built on this helper already had an `onError` handler wired
up to show a message like "Could not start the room. Check your
connection and try again." and re-enable the button - that path was
sound, it just never got reached in either failure mode.

## Decision
`Multiphone.host()` and `.join()` both now:
- Wrap `new Peer(...)` in a `try/catch` and call `opts.onError(e)` if
  it throws, instead of letting the exception propagate uncaught.
- Start a 12-second timeout as soon as connecting begins, calling
  `opts.onError(new Error('Timed out connecting.'))` if neither success
  nor a PeerJS error has happened by then. Cleared on success, on a
  real PeerJS error, and before each retry (host's existing
  `unavailable-id` room-code-retry loop), so it never fires after
  things have already succeeded or moved on to a new attempt.
- No changes needed in Simon or FM-1 themselves - both already call
  `onError` correctly; this just makes sure it actually gets called.

## Consequences
- Verified with Playwright: reproduced the exact reported failure
  (PeerJS blocked/unreachable in this sandbox) and confirmed it now
  shows "Could not start the room. Check your connection and try
  again." and re-enables Continue, instead of silently doing nothing.
  Separately verified, with a stubbed `Peer`, that a normal successful
  connection still fires `onReady`/`onOpen` exactly once and never
  triggers a spurious timeout error even 13 seconds later (past the
  12s window); and that the room-code retry path doesn't leave a stale
  timeout from the first failed attempt to fire later.
- This is a real device/network dependency (PeerJS over a public CDN,
  WebRTC signaling), not something fully eliminable - the fix is about
  always telling the user something went wrong, not about making the
  connection itself more reliable.
