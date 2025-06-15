# 🛣️ devtools-detector Roadmap

This file outlines the upcoming features, improvements, and long-term plans for the `devtools-detector` project.

---

## ✅ v1.0.0 – MVP (Minimal Viable Product)

- [x] Window dimension-based detection
- [x] `onOpen` / `onClose` callback system
- [x] Configurable polling interval
- [x] TypeScript + ESM support
- [x] Demo with vanilla JS (HTML)
- [x] Publish to NPM

---

## 🛠️ v1.1.0 – Core Detection Enhancements (Planned)

- [ ] Add additional detection methods:
  - [ ] `debugger` trap
  - [ ] `console.log` timing delay trap
  - [ ] `Function.toString()` tampering trap
- [ ] Scoring-based detection result: `detectedBy: string[]`
- [ ] Option to disable/enable specific methods
- [ ] Debounce and anti-false-positive logic
- [ ] Improved documentation on detection strategies

---

## 🌐 v1.2.0 – Event System & Logging

- [ ] EventEmitter API:
  - `on('open')`, `on('close')`, `off()`
- [ ] Export `isDevtoolsOpen()` for manual polling
- [ ] Local log history in `localStorage`
- [ ] Hooks for logging to Sentry, Analytics, etc.

---

## 🎨 v1.3.0 – Framework Adapters

- [ ] React Hook: `useDevtoolsDetector()`
- [ ] Vue Composable: `useDevtoolsDetector()`
- [ ] Svelte store integration
- [ ] Add framework-specific examples

---

## 🧱 v2.0.0 – Stability & Evasion Resistance

- [ ] Strategy-based countermeasures:
  - `alert`, `redirect`, `logout`, `blank`, `custom()`
- [ ] Watch for tampering (`window.devtoolsDetector = null`)
- [ ] Obfuscated fallback build (`devtools-detector-obf`)
- [ ] Support for different build outputs:
  - ESM, UMD, Lite, Full
- [ ] Detect automation tools:
  - Puppeteer, Selenium, Headless browsers
- [ ] Support CDN builds (via jsDelivr/unpkg)

---

## 📊 v2.1.0 – Optional Analytics Dashboard

- [ ] Collect DevTools usage logs (optional)
- [ ] Send to external endpoint / API
- [ ] Optional Next.js-based dashboard
- [ ] Webhook or Slack alerts
- [ ] Anonymous fingerprinting

---

## ⏱️ Version Timeline (Suggested)

| Version | Goal                                 | ETA             |
| ------- | ------------------------------------ | --------------- |
| v1.0.0  | MVP release                          | ✅ Done         |
| v1.1.0  | Multi-method detection               | Late June 2025  |
| v1.2.0  | Event system + local logs            | Early July 2025 |
| v1.3.0  | Framework support (React, Vue, etc.) | Mid July 2025   |
| v2.0.0  | Evasion resistance + bundles         | August 2025     |
| v2.1.0  | Analytics dashboard (optional)       | TBD             |

---

Want to contribute? Check open issues or create a feature proposal!
