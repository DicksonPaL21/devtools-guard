# devtools-guard

A small, framework-agnostic TypeScript utility that detects signals commonly associated with open browser DevTools. It is a best-effort deterrence and observability tool, not a security boundary.

## Installation

```bash
npm install devtools-guard
```

## Quick Start

```ts
import { createDevtoolsGuard } from "devtools-guard"

const guard = createDevtoolsGuard({
  onOpen(state) {
    console.log("DevTools are likely open", state)
  },
})

guard.start()
// Later: guard.destroy()
```

Importing the package has no side effects. Monitoring is off until `start()` is called, unless `autoStart` is enabled.

## API

### `createDevtoolsGuard(options?)`

Creates an independent monitor with these methods:

- `start()` starts polling and is idempotent.
- `stop()` stops polling without discarding configuration or state.
- `check()` immediately runs one asynchronous detection cycle and returns the latest stable `DevtoolsState`.
- `getState()` returns a defensive copy of the latest stable state.
- `subscribe(listener)` observes state transitions and returns an unsubscribe function.
- `destroy()` stops the monitor, removes listeners, and clears subscribers. Repeated cleanup is safe.
- `isRunning()` reports whether monitoring is active.

```ts
interface DevtoolsState {
  isOpen: boolean
  orientation: "vertical" | "horizontal" | null
  confidence: number
  detectedBy: ("dimensions" | "debuggerTiming" | "consoleTiming")[]
  timestamp: number
}
```

### `detectDevtools(options?)`

Runs one cycle without starting a timer:

```ts
import { detectDevtools } from "devtools-guard"

const state = await detectDevtools()
```

### Legacy API

`startDevtoolsDetector`, `createDevtoolsDetector`, and `isDevtoolsOpen` remain available for compatibility and are deprecated. New code should use `createDevtoolsGuard`. The legacy adapter defaults to the polite dimensions method; legacy `console`, `debugger`, and `toString` names are accepted, but `toString` is ignored because it did not reliably indicate DevTools usage.

## Configuration

```ts
const guard = createDevtoolsGuard({
  enabled: true,
  interval: 1000,
  threshold: 160,
  confidenceThreshold: 0.6,
  methods: {
    dimensions: true,
    debuggerTiming: false,
    consoleTiming: false,
  },
  debounce: { open: 2, close: 2 },
  pauseWhenHidden: true,
  autoStart: false,
  debuggerThresholdMs: 100,
  consoleThresholdMs: 5,
  onOpen(state) {},
  onClose(state) {},
  onChange(state) {},
})
```

Intervals are clamped to at least 100 ms. Nested options are merged with defaults and input is not mutated. Callback errors are isolated so application code cannot stop monitoring.

## Detection Methods

- `dimensions` compares outer and inner window dimensions, reports likely dock orientation, and contributes confidence from `0.6` to `0.8`. It is enabled by default.
- `debuggerTiming` measures time around one `debugger` statement and contributes `0.8`. It is opt-in because pauses can interrupt development and timing varies.
- `consoleTiming` measures one transparent `console.debug` operation and contributes `0.4`. It is opt-in because console behavior is browser-dependent and it cannot meet the default threshold alone.

Confidence is combined as independent evidence: `1 - product(1 - signal confidence)`. A transition occurs only after the configured number of consecutive open or close observations.

Dimension detection is skipped on likely mobile devices. Sidebars, browser chrome, responsive mode, window layout, zoom, and browser differences can still cause false positives or negatives.

## React Example

```tsx
useEffect(() => {
  const guard = createDevtoolsGuard({
    onChange(state) {
      setDevtoolsOpen(state.isOpen)
    },
  })
  guard.start()
  return () => guard.destroy()
}, [])
```

## Next.js Example

Use monitoring from a client component. The package itself remains safe to import during SSR.

```tsx
"use client"

import { useEffect } from "react"
import { createDevtoolsGuard } from "devtools-guard"

export function DevtoolsObserver() {
  useEffect(() => {
    const guard = createDevtoolsGuard()
    guard.start()
    return () => guard.destroy()
  }, [])
  return null
}
```

## Limitations

No browser exposes a reliable standard API for determining whether DevTools are open. Detection differs across Chrome, Edge, Firefox, and Safari. Undocked tools may not affect dimensions, mobile measurements are unreliable, and timing probes depend on the runtime. Treat every result as an estimate.

The library does not redirect, reload, disable interaction, report users, modify browser globals, or impose a response policy. Applications decide how to use the signal.

## Security limitations

Client-side JavaScript can be inspected and modified. Users can disable JavaScript, change runtime state, use extensions, or capture network requests without DevTools. Source maps may expose source, and minification is not encryption. DevTools detection cannot protect API secrets or trusted authorization logic.

> Never put secrets, private credentials, authorization logic, or trusted security decisions in client-side code.

Enforce authentication, authorization, rate limits, validation, and sensitive business rules on a trusted server.

## Browser Compatibility

The package targets modern evergreen Chrome, Edge, Firefox, and Safari. It is SSR-safe in Node-based build tools and frameworks. Detection results are not identical across browsers.

## Performance

The default monitor performs one dimensions check per second and pauses while the document is hidden. The package has zero runtime dependencies and no import-time work. Source maps ship for debugging; omitting them is not a security measure.

## Release

```bash
npm ci
npm run validate
npm pack --dry-run
npm version patch|minor|major
npm publish
```

Publishing is manual. Validate the archive before release.

## License

MIT © 2025 DicksonPaL21
