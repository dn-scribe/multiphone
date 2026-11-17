# 18. Press-and-hold tooltips

## Status
Accepted

## Context
Several controls are abbreviated or jargon-y enough to be genuinely
unclear at a glance — "M"/"S" on a Sequencer track being the concrete
example that prompted this (Mute and Solo). This is a touch screen:
there's no hover state to attach a conventional tooltip to.

## Decision
One shared tooltip bubble (`shared`-within-this-app, not promoted to
`shared/` since nothing outside FM-1 needs it yet), shown via the same
long-press gesture this app already uses elsewhere (e.g. a step's
accent, `adr/0013`): `attachTooltip(el, text, onTap)` replaces a plain
`onclick` — tapping still calls `onTap()` as before, but holding past
450ms shows `text` near the element instead and swallows that
press, so looking up what something does never also triggers it. A
plain, non-interactive label can call it with `onTap` omitted — it
just shows the tooltip on hold and does nothing on a quick tap.

Applied to controls whose own label doesn't fully explain them: the
Sequencer's instrument-cycle button, Mute, Solo, ✏️ edit mode, Play,
Save Pattern, Song Mode, each pattern's ➕/song row's ◀▶✕, and the new
Pitch/Ratchet/Chance/Condition section labels in the step detail panel
(one tooltip per *concept*, not per individual value button — e.g. one
tooltip on "Condition" explaining All/1:2/2:2/Fill, not four separate
ones); and on Controls, the preview toggle, Save Instrument, the
carrier-wave buttons, and each ADSR/Ratio/FM-amount slider's label. A
small ⓘ is appended to plain-text labels (which otherwise give no hint
they're pressable); buttons that already look tappable don't need it.

Deliberately *not* applied to controls that already use the hold
gesture for something else: a step's own tap/hold (on/off vs accent),
the Instruments/Patterns library rows (tap loads, hold deletes), and
FILL (hold activates it) — those already have an inline caption
explaining their gesture, and stacking a third meaning onto an
already-overloaded hold would make all of them ambiguous.

## Consequences
- Verified with Playwright: holding Mute past 450ms shows its tooltip
  and leaves mute untouched; releasing hides the tooltip; a normal
  quick tap afterward still toggles mute as always.
- Converting a button from `onclick` to `attachTooltip` changes
  nothing about when its action runs for a normal tap — only a
  successful long-press-reveal suppresses that one press.
- Coverage is deliberately uneven: concepts that are genuinely
  unclear (M/S, Tie/Slide, Ratchet/Chance/Condition, FM amount) got
  tooltips; things that are already self-explanatory from their label
  and surrounding heading (e.g. the 16/32/64 pattern-length buttons)
  didn't, to avoid tooltip fatigue.
