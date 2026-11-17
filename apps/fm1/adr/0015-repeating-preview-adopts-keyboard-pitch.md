# 15. Repeating preview, pitched to the last Keyboard note

## Status
Accepted — extends `adr/0009`, doesn't reverse it

## Context
`adr/0009` replaced an auto-preview-on-every-change (which could sustain
forever) with an explicit "▶️ Hear it" button, bounded to a fixed
~550ms note each tap. That fixed the bug, but in practice it meant
re-tapping the button after every slider tweak to hear the result —
annoying enough while actively sound-designing that it defeats some of
the point of a live preview. Separately, the preview always played a
fixed A4 (440Hz), regardless of whatever pitch the Keyboard phone was
actually being played at.

## Decision
`playPreview()` itself is unchanged and still the thing that actually
fires a note — it still self-bounds to ~550ms every time it's called,
so the fix from `adr/0009` isn't being undone, just reused more often:

- "▶️ Hear it" is now a toggle. Tapping it once calls `playPreview()`
  immediately and starts a `setInterval(playPreview, 700)` — slightly
  longer than the ~550ms a single preview takes, so each repeat is
  audibly a fresh retrigger rather than overlapping. The button
  becomes "⏸ Stop Preview" (and visually active) while looping;
  tapping it again clears the interval and silences immediately.
- While looping, every parameter change (`apply()` — a slider, preset,
  or waveform tap) also calls `playPreview()` directly, so the new
  sound is heard right away instead of waiting up to 700ms for the
  next scheduled tick. This is what actually removes the
  "scroll up and tap Hear It again" friction.
- The preview pitch is no longer hardcoded to A4: Controls already
  tracks the last `{t:'note', on:true}` message it received (for the
  "now playing" display) — `playPreview()` now uses that same
  `lastNote` for its frequency, falling back to A4 until a real note
  arrives. Designing a sound now previews at whatever pitch the
  Keyboard phone is actually being played at.

## Consequences
- Verified with Playwright: looping fires immediately then roughly
  every 700ms with no manual retriggering; changing a slider while
  looping fires an extra trigger within 50ms rather than waiting for
  the next tick; stopping the loop halts it completely (no further
  triggers); the preview pitch is 440Hz with no Keyboard input yet,
  and exactly matches the frequency of whatever note was last played
  once one has been.
- No new "stuck forever" risk: every single firing (loop tick, manual
  retrigger on change, or the original one-shot tap) is still the same
  self-releasing `playPreview()` from `adr/0009`.
- If no Keyboard phone/panel is present (e.g. Controls used alone),
  the preview simply stays at A4, same as before this change.
