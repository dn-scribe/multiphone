# 1. Shared, host-authoritative networking via `shared/multiphone.js`

## Status
Accepted

## Context
Simon is a real memory game: every phone must agree on one shared
sequence, whose turn it is, and when the game ends. Unlike Phone Band,
independent per-phone state isn't an option — this needs live,
cross-phone communication, and this repo has no backend (static GitHub
Pages site, no build step).

## Decision
Use WebRTC data channels for peer-to-peer messaging, with PeerJS (loaded
from a CDN) handling signaling via its free public broker — no app data
ever passes through that broker, only connection setup. One phone hosts
and is the sole authority on game state (the sequence, whose press is
expected next); every other phone just renders what the host broadcasts
and sends its own button presses to the host.

This was factored out of the Simon-specific code into
`shared/multiphone.js` (`Multiphone.host()` / `Multiphone.join()`) as
soon as it became clear it was generic multiplayer infrastructure, not
Simon-specific — so future multiphone apps (e.g. a future FM-1 clone)
can reuse room codes + host/join plumbing instead of reinventing it.

`broadcast()` on the host also invokes the host's own message handler
locally (loopback), so the host can reuse exactly the same UI-update
code path as a joining client, instead of maintaining two versions of
the same state-rendering logic.

## Consequences
- No server to run or pay for; works anywhere both phones have internet
  access to reach the PeerJS broker (typically fine on home Wi-Fi).
- Clients fully trust the host and each other — a malicious peer could
  send fabricated `press` messages. Acceptable for a casual, same-room
  party game; would need revisiting for anything adversarial.
- No reconnection/host-migration logic exists yet (see
  `REQUIREMENTS.md`).
