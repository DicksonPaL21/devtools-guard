<h1 align="center">🛡️ devtools-guard</h1>

<p align="center">
  <b>A lightweight JavaScript library to detect and guard when browser DevTools are open, with customizable actions, multi-strategy detection, and upcoming framework support.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/devtools-guard">
    <img alt="NPM version" src="https://img.shields.io/npm/v/devtools-guard.svg">
  </a>
  <a href="https://github.com/DicksonPaL21/devtools-guard/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/DicksonPaL21/devtools-guard">
  </a>
  <a href="https://bundlephobia.com/package/devtools-guard">
    <img alt="Bundle size" src="https://img.shields.io/bundlephobia/minzip/devtools-guard">
  </a>
  <a href="https://www.npmjs.com/package/devtools-guard">
    <img alt="Total Downloads" src="https://img.shields.io/npm/dt/devtools-guard" />
  </a>
  <a href="https://www.npmjs.com/package/devtools-guard">
    <img alt="NPM Install" src="https://img.shields.io/npm/i/devtools-guard" />
  </a>
</p>

---

## 🚀 Features (v1.1.0)

- 🔍 Detect when browser DevTools are open
- 🕵️‍♂️ Multiple detection strategies:
  - Window size inspection
  - Console trap timing
  - `debugger` statement trap
  - `Function.prototype.toString` tampering
- ⚡ Debounced detection to reduce false positives
- 📣 `onOpen` and `onClose` event handlers
- ⚙️ Configurable interval and detection strategies
- 📦 Lightweight, framework-agnostic
- 🧪 TypeScript support built-in

---

## 📦 Installation

```bash
npm install devtools-guard
# or
yarn add devtools-guard
```

---

## ✨ Usage

```ts
import { startDevtoolsDetector } from "devtools-guard"

startDevtoolsDetector({
  onOpen: ({ detectedBy }) => {
    alert(`DevTools is open! Detected via: ${detectedBy.join(", ")}`)
  },
  onClose: () => {
    console.log("DevTools closed ✅")
  },
  methods: ["dimensions", "console", "debugger", "toString"], // default: all
  interval: 500,
  debounceMs: 1000,
})
```

---

## ✅ Usage Notes

- The `console` and `debugger` methods are browser-dependent and timing-sensitive.
- You can selectively disable methods like:

```ts
startDevtoolsDetector({ methods: ["dimensions", "debugger"] })
```

---

## 🧪 Example (HTML)

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import { startDevtoolsDetector } from "https://unpkg.com/devtools-guard?module"

      startDevtoolsDetector({
        onOpen: ({ detectedBy }) =>
          alert(`DevTools detected via: ${detectedBy.join(", ")}`),
        onClose: () => console.log("DevTools closed."),
      })
    </script>
  </head>
  <body>
    <h1>DevTools Detection Example</h1>
  </body>
</html>
```

---

## ⚙️ API

### `startDevtoolsDetector(options)`

| Option       | Type                             | Description                                                                  |
| ------------ | -------------------------------- | ---------------------------------------------------------------------------- |
| `onOpen`     | `(res: DetectionResult) => void` | Callback when DevTools are detected.                                         |
| `onClose`    | `() => void`                     | Callback when DevTools are closed.                                           |
| `interval`   | `number`                         | Polling interval in ms (default: `1000`).                                    |
| `debounceMs` | `number`                         | Delay before triggering detection again (default: `500`).                    |
| `methods`    | `string[]`                       | Methods used for detection: `dimensions`, `console`, `debugger`, `toString`. |

---

## 🧭 Branching Strategy

```text
master
│
├── develop
│   ├── feature/v1.1-multi-method-detection
│   ├── feature/v1.2-event-emitter-api
│   ├── feature/v1.3-framework-hooks
│   └── ...
│
└── release/v2.0.0
```

| Branch              | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `master`            | ✅ Stable, published version                         |
| `develop`           | 🚧 Active development                                |
| `feature/*`         | 🌱 Feature branches (e.g., `feature/v1.2-event-api`) |
| `release/*`         | 🚀 Final staging for major version releases          |
| `hotfix/*` _(opt.)_ | 🛠 Urgent patches directly merged to master           |

---

## ⚙️ Initial Repo Setup

```bash
# Create develop from master
git checkout master
git checkout -b develop

# Start your first feature branch
git checkout -b feature/v1.1-multi-method-detection develop
```

---

## 🛣️ Roadmap Highlights

| Version  | Highlights                                                     |
| -------- | -------------------------------------------------------------- |
| `v1.1.0` | ✅ Multi-method detection, debounce, strategy config           |
| `v1.2.0` | 🔌 EventEmitter support, `on('open')`, `off()`, etc.           |
| `v1.3.0` | 🔧 React/Vue/Svelte composables/hooks                          |
| `v2.0.0` | 🧱 Obfuscation resistance, headless detection, multiple builds |
| `v2.1.0` | 📈 Analytics dashboard (optional, opt-in)                      |

See full roadmap → [ROADMAP.md](https://github.com/DicksonPaL21/devtools-guard/blob/master/ROADMAP.md)

---

## 💡 Use Cases

- Prevent cheating in browser-based games
- Detect inspection attempts in client-side SaaS/web apps
- Log or alert when sensitive code is at risk
- Automatically logout users or restrict actions
- In future: detect headless automation environments

---

<!-- ## 🌐 CDN -->

<!-- Use via [unpkg](https://unpkg.com/) or [jsDelivr](https://cdn.jsdelivr.net/): -->

<!-- ```html -->
<!-- ES Module -->
<!-- <script type="module" src="https://unpkg.com/devtools-guard?module"></script> -->

<!-- IIFE build (coming soon) -->
<!-- <script src="https://cdn.jsdelivr.net/npm/devtools-guard/dist/devtools-guard.iife.js"></script> -->
<!-- ``` -->
<!--  -->
<!-- --- -->

## 📁 Project Structure

```text
devtools-guard/
├── src/                # Core detection logic
├── dist/               # ESM and UMD bundles
├── examples/           # Live HTML demos
├── tests/              # Unit tests (WIP)
├── README.md
├── ROADMAP.md
├── LICENSE
└── package.json
```

---

## 🧑‍💻 Contributing

Pull requests, issues, and feedback are welcome!

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/something`)
3. Commit your changes (`git commit -m 'feat: add something'`)
4. Push and open a PR 🎉

---

## 📃 License

MIT © 2025 [DicksonPaL21](https://github.com/DicksonPaL21)

---

## 📣 Feedback

Have ideas or feedback? Open an issue or reach out—let's make DevTools detection better for everyone.
