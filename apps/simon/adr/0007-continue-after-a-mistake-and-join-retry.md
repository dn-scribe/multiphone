# 7. Continue after a mistake, and retrying a flaky "room doesn't exist"

## Status
Accepted

## Context
Two things reported directly from a real 3-player session:

1. "The third could not join, got message that the room does not
   exist" — but the host plainly existed (two other phones had just
   joined it with the same code moments earlier), and the app's
   documented limit is up to 5 phones total, well above 3. The error
   text itself (`adr/0006`'s "Could not find that room. Check the code
   and try again.") covers both a genuinely wrong code and any other
   join failure identically, so there's no way to tell from the report
   which actually happened - but a code that had just worked for two
   other phones, failing for a third moments later, points to a
   transient PeerJS signaling-server hiccup, not a bad code.
2. "Add a continue - if i err i can continue - the app will replay the
   last pattern and the player gets another chance" - today, any wrong
   press ends the whole game immediately; the only way back in is
   Play Again, which starts over from round 1.

## Decision
- **`Multiphone.join()` now retries once or twice on `peer-unavailable`**
  before giving up, mirroring the retry `Multiphone.host()` already does
  for its own room-code collisions (`unavailable-id`, from `adr/0001`).
  `peer-unavailable` is PeerJS's "that peer ID isn't registered" error -
  normally a real "no such room," but under several phones connecting
  to the same host in quick succession, the public signaling server can
  report it transiently even though the host is right there. Up to 3
  total attempts, 500ms apart; a genuinely wrong/expired code still
  fails in well under 2 seconds, just not on the very first signal. No
  app-level changes needed - both Simon and FM-1 Clone already just
  call `onError` if it's eventually reached.
- **Continue, on Simon's game-over screen**, alongside Play Again: tells
  the host to replay the *exact round that was just missed* - same
  sequence, same length - instead of starting a new game. Implemented
  by splitting `hostNextRound()`'s round-playing logic out into
  `playCurrentRound()`, called by `hostNextRound()` (which pushes a new
  random step first) and the new `hostContinue()` (which doesn't push
  anything - just re-runs the current `sequence` from the top).
  - Any player can tap it, not just whoever missed - same reasoning as
    Play Again (`adr/0004`): a non-host sends `{t:'continue'}`, the
    host-authoritative `hostContinue()` actually runs it.
  - The button assignment is **not** recomputed (unlike Play Again) -
    this isn't a new game, just another go at the one already running,
    so it keeps the exact players/buttons that round was built for.
  - Only offered after an actual wrong press, not after a player
    disconnecting (`reason:'left'`) - that round's assignment no longer
    matches who's still connected, so continuing it doesn't make sense;
    Play Again (which does rebuild the assignment) is still offered.
  - The client side piggybacks on the existing `roundstart` message
    (sent either way) to dismiss the GAME OVER overlay, rather than
    adding a new message type - a continued round looks exactly like
    any other round starting, just without a new `start` broadcast
    first.

## Consequences
- Verified with Playwright: driving the host-side game logic directly
  (no real PeerJS signaling in this sandbox, same constraint as
  `adr/0006`) confirmed a wrong press shows Continue, tapping it
  replays the *identical* sequence (same array, same round number) and
  correctly clears into round 2 on a correct pass; a "player left"
  game-over correctly hides Continue. Separately, with a stubbed `Peer`
  simulating `peer-unavailable` on the first two connection attempts
  and success on the third, confirmed `join()` recovers and calls
  `onOpen` exactly once with no spurious `onError`; and that a
  genuinely unavailable room (every attempt fails) still calls
  `onError` exactly once, not a burst of retried errors. Re-ran
  `adr/0006`'s own stubbed-failure/success/retry regressions - all
  unaffected, since host()'s retry logic wasn't touched.
- This doesn't make the underlying PeerJS public signaling server any
  more reliable, same caveat as `adr/0006` - it just gives a second (and
  third) chance before reporting a failure, for the specific error type
  that's plausibly a race rather than a real "no such room."
- Continue is unlimited - tap it as many times as needed, no life
  counter or cap. Kept simple since nothing was asked for beyond "give
  the player another chance."
