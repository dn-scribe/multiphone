# Phone Simon — Requirements

## Done
- [x] One phone hosts a game; up to 5 phones total can join using a
  4-letter, letters-only room code.
- [x] Each phone chooses 1-4 buttons for itself before joining/starting
  (`adr/0005`).
- [x] Basic mode: classic Simon, constant playback tempo.
- [x] Advanced mode: tempo increases round by round, floored so it stays
  playable.
- [x] The host is authoritative: tracks the sequence, validates presses
  from whichever phone sends them, ends the game on a wrong press or a
  player disconnecting.
- [x] Host's lobby shows a QR code (`?room=CODE`) as an alternative to
  typing the room code — scanning it jumps straight to the button-count
  step with the room pre-filled.
- [x] Optional name + emoji per player (tap an emoji again to clear),
  shown in the lobby player list. Peer-supplied, so escaped and
  length-clamped before rendering. Persisted in `localStorage` per
  phone, so it's pre-filled next time instead of starting blank
  (`adr/0004`).
- [x] Game-over screen shows the round reached; **any player** can tap
  "Play Again," not just the host — the button assignment is rebuilt
  from whoever is *currently* connected, so a phone that joined after
  the first game started gets included too (`adr/0004`).
- [x] Game-over from a wrong press (not from a player disconnecting)
  also offers **Continue** — any player can tap it to replay the exact
  round just missed (same sequence, same button assignment) instead of
  restarting from round 1; unlimited, no life counter (`adr/0007`).
- [x] Installable as its own home-screen app (`manifest.json` + icons);
  versioned independently in `apps.json` — see root `README.md`.
- [x] Connecting (Host or Join) always shows an error and re-enables
  Continue if it fails, instead of the button just staying disabled
  with no feedback — covers both PeerJS failing to load at all and the
  connection simply hanging (`adr/0006`, in the shared `shared/
  multiphone.js` networking helper, also used by FM-1 Clone).
- [x] Joining retries a couple of times on a "room doesn't exist" error
  before giving up — a real room code failing that way right after
  other phones just joined it successfully is more likely a transient
  signaling-server race than an actually wrong code (`adr/0007`, same
  shared networking helper).

## Open questions / possible future work
- [ ] What should happen if the host disconnects mid-game? (Currently:
  clients just see a "lost connection" alert and reload — no host
  migration.)
- [ ] Reconnect support if a client drops and rejoins mid-game? (No
  stable identity across a reconnect — only the name/emoji you type
  carries over, via `localStorage`, not an actual session.)
- [ ] Any limit/warning when total buttons across phones gets very large
  (e.g. 5 phones × 4 buttons = 20)?
