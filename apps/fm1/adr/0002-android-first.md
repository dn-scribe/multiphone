# 2. Android-first target

## Status
Accepted

## Context
The phones available to test this app are Android. Other apps in this
repo (Band, Simon) aim to work on any phone with no particular browser
priority.

## Decision
Design and test this app primarily against Chrome on Android first.
Other browsers (iOS Safari, desktop) are best-effort — nice if they
work, but not a blocker for shipping or for feature choices. This app
may lean on Android/Chrome-friendly affordances (e.g. `navigator.vibrate`,
or Web MIDI if ever relevant) more freely than apps aimed at the widest
possible device support.

## Consequences
- Features/APIs that are Android-Chrome-only, or that behave noticeably
  better there, are acceptable choices for this app even if they'd
  degrade on iOS.
- If broader device support becomes a goal later, that's a new
  decision — re-test on iOS Safari specifically rather than assuming
  parity with what worked on Android.
