# 3. A 2-operator FM voice, not a multi-engine clone

## Status
Accepted

## Context
Felucca-class firmware offers 13 engines (FM, analog, sample-slicing,
drums, physical modeling...). `adr/0001` already ruled out reusing that
code; this ADR picks what the from-scratch Web Audio voice actually
does.

## Decision
One voice type: classic 2-operator FM — a sine-wave modulator
frequency-modulating a carrier oscillator (carrier waveform selectable:
sine/triangle/square/sawtooth). Parameters, all per-patch:
- `ratio`: modulator frequency = carrier frequency × ratio (0.25-8)
- `fm`: FM index — modulator peak deviation = carrier frequency × `fm`
  (0-10), the standard DX-style scaling that keeps timbre consistent
  across the keyboard range
- a single ADSR amplitude envelope (attack/decay/sustain/release)
- `vol`: overall level

Implemented with the standard Web Audio FM pattern: a modulator
oscillator connected through a gain node into the carrier oscillator's
`.frequency` AudioParam.

## Consequences
- Covers a genuinely wide range of classic FM timbres (bells, electric
  piano, bass, brass — see the 4 built-in presets) with a small,
  understandable parameter set and no DSP beyond native Web Audio
  nodes.
- It is not a multi-engine or multi-operator synth. If that's wanted
  later, it's a new decision (see `REQUIREMENTS.md` open questions),
  not a natural extension of this voice's current parameter shape.
