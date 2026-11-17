# Phone Band — Requirements

## Done
- [x] Each phone independently picks one instrument (a drum/percussion
  piece, bass, keys, bells, or pluck) from a fixed list.
- [x] All instruments are written in the same key/scale (A minor
  pentatonic), so any combination of phones sounds musically coherent
  with zero coordination between phones.
- [x] All audio is synthesized locally with Web Audio — no audio asset
  files, no network dependency between phones.
- [x] Works standalone on a single phone — picking an instrument is
  enough to play, no "room"/session needed.
- [x] Large, high-contrast pads; screen wake lock while playing; haptic
  feedback (vibrate) on tap.
- [x] `index.html#N` deep-links straight into instrument `N`.
- [x] Installable as its own home-screen app (`manifest.json` + icons);
  versioned independently in `apps.json` — see root `README.md`.

## Explicitly out of scope
- No cross-phone synchronization or networking — by design, see
  `adr/0001-no-cross-phone-sync.md`.
