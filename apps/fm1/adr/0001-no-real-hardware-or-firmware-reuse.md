# 1. Don't integrate real FM-1 hardware or reuse Felucca firmware code

## Status
Accepted

## Context
This app was pitched as an "FM-1 synth clone," asking whether the
project could also use the M-VAVE FM-1's actual firmware — specifically
"Felucca," a GPL-3.0 community firmware for that hardware
(https://github.com/hugelton/Felucca). Three options were analyzed:

A. Remote-control a real, physical FM-1 unit over MIDI from the phones.
B. Port Felucca's synthesis engines into the browser (WebAudio/WASM) as
   an actual software clone of its DSP.
C. Build a from-scratch Web Audio FM synth, using Felucca's engine list
   and MIDI CC map only as a naming/design reference.

Option A requires owning that specific hardware plus a USB(-OTG)
connection, and Web MIDI support — which does not exist in Safari/iOS
at all, excluding any iPhone as a controller. Option B is tied to a
JieLi SoC-specific toolchain not vendored in the Felucca repo, and that
project's own README states it is "the only supported hardware target,"
declines ports to other devices, and calls third-party ports
"independent projects... not tested or supported here" — and it's
GPL-3.0, which would impose license obligations on this repo that
nothing else here currently carries. The user confirmed they don't own
an FM-1.

## Decision
Build the FM-1 clone as a self-contained Web Audio synth, like every
other app in this repo: no audio asset files, no external hardware, no
firmware code reused. Felucca's engine names and MIDI CC map may be
used as design inspiration only — never its source code, and never as
a hard dependency.

## Consequences
- The app works on any phone with nothing plugged in, consistent with
  the rest of the site, and carries no GPL-3.0 code into this repo.
- Nobody needs to own an FM-1 to use it.
- If real-hardware MIDI control is ever wanted later, it would be a
  small, optional, feature-detected add-on
  (`navigator.requestMIDIAccess`), isolated from the core synth, and
  would need its own ADR — it is not a requirement now.
