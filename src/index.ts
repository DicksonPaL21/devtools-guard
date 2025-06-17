export interface DetectorOptions {
  interval?: number
  debounceMs?: number
  methods?: Array<"dimensions" | "console" | "debugger" | "toString">
  onOpen?: (details: DetectionResult) => void
  onClose?: () => void
}

export interface DetectionResult {
  detectedBy: string[]
  timestamp: number
}

let isDevtoolsOpen = false
let lastTriggerTime = 0

export function startDevtoolsDetector(options: DetectorOptions = {}) {
  const {
    interval = 1000,
    debounceMs = 500,
    methods = ["dimensions", "console", "debugger", "toString"],
    onOpen = (d) => console.warn("DevTools opened via:", d.detectedBy),
    onClose = () => {},
  } = options

  const detectMethods = {
    dimensions: () => {
      const threshold = 160
      return (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      )
    },

    console: () => {
      const start = performance.now()
      console.log("%c", "color: transparent")
      const duration = performance.now() - start
      return duration > 5
    },

    debugger: () => {
      const start = performance.now()
      debugger
      const duration = performance.now() - start
      return duration > 10
    },

    toString: () => {
      try {
        const fn = () => {}
        const nativeStr = fn.toString()
        const fakeStr = Function.prototype.toString.call(fn)
        return nativeStr !== fakeStr
      } catch {
        return false
      }
    },
  }

  setInterval(() => {
    const activeMethods = methods.filter((name) => detectMethods[name]?.())
    const now = Date.now()

    if (
      activeMethods.length > 0 &&
      !isDevtoolsOpen &&
      now - lastTriggerTime > debounceMs
    ) {
      isDevtoolsOpen = true
      lastTriggerTime = now
      onOpen({ detectedBy: activeMethods, timestamp: now })
    }

    if (activeMethods.length === 0 && isDevtoolsOpen) {
      isDevtoolsOpen = false
      onClose()
    }
  }, interval)
}
