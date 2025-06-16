<h1 align="center">🛡️ devtools-guard</h1>

<p align="center">
  <b>A lightweight JavaScript library to detect and guard when browser DevTools are open, with customizable actions, framework support, and multiple detection strategies.</b>
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

## 🚀 Features

- 🔍 Detect when browser DevTools are open
- 🕵️ Multiple detection strategies
- 📦 Tiny, framework-agnostic package
- 📣 `onOpen` and `onClose` event handlers
- 🔧 Configurable polling interval
- 💡 Easy integration with JavaScript and TypeScript projects

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
  onOpen: () => {
    alert("DevTools is open! 🚨")
  },
  onClose: () => {
    console.log("DevTools closed ✅")
  },
  interval: 500, // optional, checks every 500ms
})
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
        onOpen: () => alert("DevTools detected!"),
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

| Option     | Type         | Description                                        |
| ---------- | ------------ | -------------------------------------------------- |
| `onOpen`   | `() => void` | Callback when DevTools are opened                  |
| `onClose`  | `() => void` | Callback when DevTools are closed                  |
| `interval` | `number`     | Polling interval in milliseconds (default: `1000`) |
| `methods`  | `string[]`   | Detection strategies to use (default: all)         |

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

| Branch              | Purpose                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| `master`            | ✅ Production-ready code, published to NPM. Tags live here (e.g. `v1.0.0`). |
| `develop`           | 🌱 Active development branch. All new features go here first.               |
| `feature/*`         | 🧩 Feature branches (e.g., `feature/v1.1-console-detection`)                |
| `release/*`         | 🚀 Pre-release branches to prep and test before pushing to `master`.        |
| `hotfix/*` _(opt.)_ | 🛠 Urgent patches that go directly to `master` then `develop`.               |

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

Planned features:

- More detection methods (debugger trap, console timing, etc.)
- EventEmitter support (`on('open')`, `on('close')`)
- React/Vue/Svelte integrations
- Obfuscation-resistant builds
- Analytics/logging integrations (opt-in)

See full roadmap → [ROADMAP.md](https://github.com/DicksonPaL21/devtools-guard/blob/master/ROADMAP.md)

---

## 💡 Use Cases

- Prevent cheating in browser-based games
- Hide sensitive business logic from reverse engineering
- Trigger alerts or logging when DevTools are open
- Log attempts to inspect proprietary web apps
- Detect tampered environments or automation (in future releases)

---

## 🌐 CDN

Use via [unpkg](https://unpkg.com/) or [jsDelivr](https://cdn.jsdelivr.net/):

```html
<!-- ES Module -->
<script type="module" src="https://unpkg.com/devtools-guard?module"></script>

<!-- IIFE build (coming soon) -->
<!-- <script src="https://cdn.jsdelivr.net/npm/devtools-guard/dist/devtools-guard.iife.js"></script> -->
```

---

## 📁 Project Structure

```text
devtools-guard/
├── src/                # Core logic
│   └── index.ts
├── dist/               # Bundled output (ESM & UMD)
├── examples/           # Demo HTML + JS
├── README.md
├── ROADMAP.md
└── LICENSE
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

MIT © 2025 [Dickson Palomeras](https://github.com/DicksonPaL21)

---

## 📣 Feedback

Have ideas or feedback? Open an issue or reach out—let's make DevTools detection better for everyone.
