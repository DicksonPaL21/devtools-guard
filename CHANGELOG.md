# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [2.0.0] - 2026-08-13

### Added

- Modern lifecycle API, one-off detection, typed confidence and state, subscriptions, visibility pausing, and comprehensive tests.
- npm validation scripts and push/pull-request CI.

### Changed

- Isolated detection methods with dimensions as the only default and timing probes opt-in.
- Modern ESM/CommonJS exports, package metadata, documentation, and npm contents.

### Fixed

- SSR crashes, leaked intervals, shared state, callback propagation, noisy defaults, and missing cleanup.
- CI package-manager mismatch.

### Removed

- Unreliable `Function.prototype.toString` detection from the modern API; its legacy option is accepted but ignored.

## [1.1.3] - 2025-06-17

## [1.1.2] - 2025-06-17

## [1.1.1] - 2025-06-17

## [1.1.0] - 2025-06-17

### Added

- Multi-method DevTools detection and debounce configuration.

## [1.0.0] - 2025-06-16

### Added

- Initial package, logo, demo, source, and npm publishing workflow.

## [0.0.2] - 2025-06-16

### Added

- Initial project assets and publishing configuration.

[Unreleased]: https://github.com/DicksonPaL21/devtools-guard/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/DicksonPaL21/devtools-guard/compare/v1.1.3...v2.0.0
[1.1.3]: https://github.com/DicksonPaL21/devtools-guard/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/DicksonPaL21/devtools-guard/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/DicksonPaL21/devtools-guard/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/DicksonPaL21/devtools-guard/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/DicksonPaL21/devtools-guard/releases/tag/v1.0.0
[0.0.2]: https://github.com/DicksonPaL21/devtools-guard/releases/tag/v0.0.2
