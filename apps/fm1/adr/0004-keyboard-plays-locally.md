# 4. The Keyboard phone always plays audio locally; both roles can run solo

## Status
Accepted

## Context
Two architectures were possible: (a) note events travel over the
network to wherever the "real" synth lives, or (b) whichever phone is
the Keyboard synthesizes and plays its own sound locally, with only
patch parameters traveling over the network. A round trip over WebRTC
(even on a good connection) adds enough latency to make (a) feel
noticeably laggy for playing notes by touch — unacceptable for an
instrument.

## Decision
The Keyboard phone always runs the full synth engine itself and plays
notes with zero network round-trip. Patch changes made on the Controls
phone are sent as data (`{t:'patch', patch:{...}}`) and applied to
*new* notes going forward on whichever phone(s) are Keyboards; `note`
events only travel outward from the Keyboard for the Controls screen's
"now playing" display — never to produce sound.

Both screens share the same engine code in the one file, so:
- A Keyboard phone with nobody else connected still plays, using
  whatever patch it last received (or the default preset).
- A Controls phone with nobody else connected can still preview its
  current patch, by tapping a "▶️ Hear it" button (see `adr/0009` for
  why that's a button rather than automatic).

## Consequences
- Playing feels instant regardless of connection quality.
- A Controls slider change does not retroactively affect a note that's
  already sounding (it only affects the next note-on) — listed as an
  open question in `REQUIREMENTS.md` if that's wanted later.
- Either phone is independently useful even before the other joins,
  consistent with how Phone Band works standalone.
