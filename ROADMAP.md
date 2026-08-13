# devtools-guard roadmap

This roadmap describes possible improvements, not release commitments.

## Reliability

- Compare conservative thresholds across evergreen browsers and operating systems.
- Expand mobile, PWA, responsive-mode, and browser-sidebar test fixtures.
- Document browser-specific detector behavior as reproducible evidence becomes available.

## Developer experience

- Add lightweight browser bundle smoke tests.
- Add framework examples without introducing runtime framework dependencies.
- Track bundle-size changes in CI.

## Non-goals

`devtools-guard` will not become a client-side security boundary. The core package will not redirect, reload, blank pages, disable input, fingerprint users, send telemetry, or interfere with browser globals. Application-specific policy and server-side security remain outside the library.
