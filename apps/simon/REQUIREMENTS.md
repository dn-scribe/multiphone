# Phone Simon — Requirements

## Done
- [x] One phone hosts a game; up to 5 phones total can join using a
  4-letter, letters-only room code.
- [x] Each phone chooses 1-3 buttons for itself before joining/starting.
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
  length-clamped before rendering.
- [x] Game-over screen shows the round reached; host can "Play Again"
  with the same players/button assignment.

## Open questions / possible future work
- [ ] What should happen if the host disconnects mid-game? (Currently:
  clients just see a "lost connection" alert and reload — no host
  migration.)
- [ ] Reconnect support if a client drops and rejoins mid-game?
- [ ] Any limit/warning when total buttons across phones gets very large
  (e.g. 5 phones × 3 buttons = 15)?
