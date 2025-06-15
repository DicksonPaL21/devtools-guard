<h1 align="center">🛡️ devtools-guard</h1>

<p align="center">
  <b>A lightweight JavaScript library to detect and guard if browser DevTools are open, with customizable actions, framework support, and multiple detection strategies.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/devtools-guard">
    <img alt="NPM version" src="https://img.shields.io/npm/v/devtools-guard.svg">
  </a>
  <a href="https://github.com/DicksonPaL21/devtools-guard/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/DicksonPaL21/devtools-guard">
  </a>
  <a href="https://bundlephobia.com/result?p=devtools-guard">
    <img alt="Bundle size" src="https://img.shields.io/bundlephobia/minzip/devtools-guard">
  </a>
</p>

---

## 🚀 Features

- 🔍 Detect if browser DevTools is open
- 🕵️ Multiple detection strategies (with more coming!)
- 📦 Tiny, framework-agnostic package
- 📣 `onOpen` and `onClose` event handlers
- 🔧 Configurable polling
- 💡 Easy to integrate into any JS/TS project

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
  interval: 500, // optional, check every 500ms
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

`startDevtoolsDetector(options)`

| Option     | Type         | Description                                          |
| ---------- | ------------ | ---------------------------------------------------- |
| `onOpen`   | `() => void` | Callback when DevTools is opened                     |
| `onClose`  | `() => void` | Callback when DevTools is closed                     |
| `interval` | `number`     | Polling interval in milliseconds (default: `1000`)   |
| `methods`  | `string[]`   | Detection strategies to use (default: all available) |

---

## 🧭 Branching Strategy Overview

```
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

---

## 🌿 Branches and Purpose

| Branch              | Purpose                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| `master`            | ✅ Production-ready code, published to NPM. Tags live here (e.g. `v1.0.0`). |
| `develop`           | 🌱 Active development branch. All new features go here first.               |
| `feature/*`         | 🧩 Feature branches (e.g., `feature/v1.1-console-detection`)                |
| `release/*`         | 🚀 Pre-release branches to prep and test before pushing to `master`.        |
| `hotfix/*` _(opt.)_ | 🛠 Urgent patches that go directly to `master` and then `develop`.           |

---

## ⚙️ Suggested Initial Setup

```bash
# Create develop from master
git checkout master
git checkout -b develop

# Create your first feature branch
git checkout -b feature/v1.1-multi-method-detection develop
```

---

## 🛣️ Roadmap Highlights

Coming soon:

- Multiple detection methods (debugger trap, console timing, etc.)
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

<!-- IIFE build (optional in future) -->
<script src="https://cdn.jsdelivr.net/npm/devtools-guard/dist/devtools-guard.iife.js"></script>
```

---

## 📁 Project Structure

```
devtools-guard/
├── src/
│   └── index.ts         # Core logic
├── dist/                # Bundled output (ESM & UMD)
├── examples/            # Demo HTML + JS
├── README.md
├── ROADMAP.md
└── LICENSE
```

---

## 🧑‍💻 Contributing

Pull requests, issues, and feedback are very welcome!

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/something`)
3. Commit your changes (`git commit -m 'feat: add something'`)
4. Push and open a PR 🎉

---

## 📃 License

MIT © 2025 Dickson Palomeras

---

## 📣 Feedback

If you have ideas, open an issue or reach out! Let's make DevTools detection more powerful and flexible for everyone.
