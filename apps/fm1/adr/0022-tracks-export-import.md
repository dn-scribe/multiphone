# 22. Tracks: export/import an arrangement as a file

## Status
Accepted

## Context
Tracks deliberately has no in-app named-pattern library (`adr/0019`) -
it holds exactly one arrangement at a time, auto-saved to that phone's
`localStorage` only. In practice that turned out to be a real gap, not
just a documented trade-off: there was no way to get an arrangement
*off* the phone it was written on at all - not to keep a second version,
not to back it up, and not to move it to another phone/browser, since
this app's local persistence deliberately never syncs on its own
(`adr/0007`). That last one bit immediately: a test arrangement built in
one browser had no way to reach a different device to actually listen to
it, short of manually copying `localStorage` keys via DevTools - not
something you can do on a phone at all.

## Decision
Tracks gets two buttons, **⬇️ Export** and **⬆️ Import**, next to the
Length picker:
- **Export** downloads the current arrangement (length, tempo, swing,
  and all 4 tracks' instrument/steps) as a `.json` file, named
  `fm1-track-<date>.json`, via a `Blob` + a throwaway `<a download>`
  click - no server involved, same as everything else in this app.
- **Import** opens a file picker (`<input type="file" accept=".json">`);
  the chosen file is read with `FileReader`, parsed, and - after a
  confirm (it replaces what's currently loaded, same destructive-action
  pattern as deleting a saved instrument or pattern) - applied via
  `applyImportedData()`, which validates the file's shape (an `appId:
  'fm1-tracks'` marker, a `tracks` array of exactly 4) and defensively
  fills in anything missing/wrong (same `resizeSteps`/default-field
  pattern already used when loading from `localStorage`), rather than
  trusting the file blindly.
- This is a plain file, not a new sync mechanism - nothing changes about
  `adr/0007`'s per-phone-only persistence model. Export/Import is just
  how a person moves that file between devices or keeps more than one
  version, the same way they'd handle any other downloaded file.
- Scoped to Tracks only for now. The Sequencer already has its own
  save/load story (named patterns + Song mode, `adr/0014`) that doesn't
  have this specific gap - it just doesn't go to a file. Giving it
  file export/import too is a reasonable future step, not done here.

## Consequences
- Verified with Playwright: Export triggers a real file download with
  the correct filename and a `fm1-tracks`/`schema:1` JSON shape
  matching the current arrangement; Import, given a file, shows the
  confirm dialog, then correctly loads all 4 tracks (instruments, step
  on/off/pitch/tie/slide/accent/ratchet, length) and re-renders; the
  length picker's selected button updates to match the imported length.
  A full re-import-then-play check confirmed the imported arrangement
  plays identically to the original (`triggerVoice` called the same 54
  times, auto-stopping at the end, no console errors).
- An exported file's `steps` deliberately omit `chance`/`condition` -
  Tracks never uses them (`adr/0019`) - and `applyImportedData` fills
  them back in as no-op defaults on import, so a Tracks export can't
  accidentally smuggle in loop-only state.
- No validation beyond the `appId`/track-count check and per-field
  defensive defaults - a hand-edited file with, say, out-of-range notes
  will just get clamped by the same step-shape logic every other loader
  path already uses, not rejected outright.
