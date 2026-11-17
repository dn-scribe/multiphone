# 2. Letters-only room codes, with a QR code as an alternative

## Status
Accepted

## Context
Joining phones need to identify the host's session somehow. The first
version generated 4-character codes from letters and digits. In
practice, reading a mixed alphanumeric code aloud or typing it on a
phone keyboard (which defaults to letters, requiring a keyboard switch
for digits) is more friction than it needs to be for a 4-character code
whose only job is "tell the other phones which room."

## Decision
- Room codes are 4 letters only (`shared/multiphone.js`'s `genCode()`),
  drawn from `A-Z` minus `I`/`O` to avoid visual confusion. The join
  screen strips/rejects anything else as the user types.
- The host's lobby also renders a QR code of a `?room=CODE` link
  (`qrcode-generator`, loaded from a CDN, same pattern as PeerJS).
  Opening that link jumps straight to the button-count step with the
  room pre-filled, as an alternative to typing the code at all.

## Consequences
- Codes stay easy to read/say/type with a phone's default keyboard.
- Letters-only shrinks the code space (24^4 ≈ 331,776) versus
  alphanumeric, but collisions only matter among rooms open at the same
  moment under the same `multiphone-simon-` prefix, and `host()` already
  retries with a new code on an `unavailable-id` collision.
- The QR code depends on the `qrcode-generator` CDN script; if it fails
  to load, the lobby just hides the QR box (try/catch) and the typed
  code still works.
