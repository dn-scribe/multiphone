# 25. Merge the Sequencer and Track Writer into one tool

## Status
Accepted (supersedes `adr/0019`'s "never loops" framing and `adr/0023`'s
4-role picker)

## Context
Requested directly, with two options laid out: merge the looping
Sequencer and non-looping Track Writer into one GarageBand-style tool,
or keep them separate and just link them (e.g. chain a Tracks
arrangement into the Sequencer's existing Song mode). The recommendation
going in was the lighter, lower-risk linking option - the two tools
already shared almost everything under the hood (step/tie/pitch model,
drag-to-tie, instrument picking, `adr/0024`'s keyboard recording), with
only genuinely loop-only concepts (Chance, Condition, FILL, Song mode)
differing - and a real merge meant touching both data models and a
migration path for existing saved patterns and exported files. The
person asking weighed that and chose the full merge anyway.

## Decision
- One role now: **Tracks** (✍️). The Sequencer role is gone; the role
  picker is back to 3 choices (Keyboard, Controls, Tracks).
- A single **🔁 Loop** toggle, next to Play, replaces "which tool are
  you in" as the thing that decides looping behavior:
  - **Loop on** (default, for continuity with existing Sequencer users):
    Play repeats the pattern forever until stopped. FILL and the
    step detail panel's Chance/Condition controls are shown.
  - **Loop off**: Play runs the pattern once and stops - the Track
    Writer's original behavior. FILL and Chance/Condition are hidden
    (not cleared - their data stays put, so toggling Loop back on
    restores whatever was set).
  - `tick()`'s end-of-pattern handling is now one shared path: Song mode
    always wraps and advances via each entry's own repeat count,
    regardless of Loop (a Song decides its own pacing); outside Song
    mode, Loop on wraps forever and Loop off stops after one pass.
  - `loop` is saved as part of a pattern snapshot, alongside
    `patternLen`/`swing` (`adr/0014`) - so a saved pattern remembers
    whether it's a loop or a one-shot, and a **Song can now chain
    looping grooves and one-shot written parts together**, which was
    the actual goal behind asking to combine the two tools.
- Pattern length is now 16/32/64/128 (the union of the Sequencer's
  16/32/64 and the Track Writer's 32/64/128).
- Everything else carries over unchanged and is simply available in one
  place now: saved Patterns + Song (`adr/0014`), file Export/Import
  (`adr/0022`, now also carrying `loop` and Chance/Condition so a
  looping pattern round-trips in full), per-step pitch/tie/slide/ratchet
  and drag-to-tie (`adr/0016`, `adr/0019`), and Keyboard recording
  (`adr/0024`).
- Storage: the merged tool keeps using the Sequencer's existing
  `localStorage` keys (`seqLen`/`seqBpm`/`seqSwing`/`seqTracks`/
  `patterns`/`song`), plus a new `loop` key. The old Track Writer's
  separate keys (`trkLen`/`trkBpm`/`trkSwing`/`trkTracks`) are simply
  no longer read - they stay harmlessly orphaned in `localStorage`
  rather than being migrated in, since the two tools' "current working
  pattern" could easily disagree and silently overwriting one with the
  other on first load felt like the wrong default. Anyone who actually
  wants their old Track Writer arrangement back has the one robust path
  that was already available for moving data between contexts anyway:
  Export it from the old build if still reachable, or - the case that
  actually came up - Import a file that already has it, which works
  unchanged (see Consequences).

## Consequences
- Verified with Playwright: the role picker shows exactly 3 roles;
  toggling Loop flips FILL's visibility and the step detail panel's
  Chance/Condition rows live; with Loop on, a pattern kept looping past
  several pattern-lengths until manually stopped; with Loop off, it
  auto-stopped after exactly one pass; drag-to-tie and Keyboard
  recording (edit-mode instant pitch entry) both still work unchanged
  in the merged panel. Export with Loop on/off correctly round-trips
  the `loop` field; a simulated pre-merge Track Writer export (no
  `loop` field at all) imports with Loop off, as it should. The actual
  Hallelujah piece built and exported before this merge (`adr/0019`'s
  testing session) was re-imported into the merged tool and played back
  identically - same 4 tracks/instruments, same 54 `triggerVoice` calls,
  auto-stopping at the end, confirming real continuity for existing
  files, not just the synthetic test case.
- The merged panel is noticeably taller/denser than either tool was
  alone - Loop, FILL, Tempo, Swing, Length, Patterns, Save Pattern, Song
  Mode, the Song list, and Export/Import all now live above the actual
  track rows in one scroll, where previously a user only saw whichever
  subset one tool needed. This is the real cost of the full merge over
  the lighter linking option that was on the table; not fixed here, but
  worth revisiting (e.g. collapsible sections) if it turns out to
  matter in practice.
- Chaining a loop and a one-shot together in a Song (the actual
  "GarageBand-style" composition goal) now works through the existing
  Song mechanism - no new UI was added for it beyond what Loop +
  per-pattern `loop` already provide, since Song mode's `repeats` count
  already expressed "play this N times before moving on," loop or not.
