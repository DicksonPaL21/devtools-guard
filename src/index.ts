/**
 * 🛡️ devtools-guard
 * A lightweight utility to detect if browser DevTools are open.
 */

export interface DetectorOptions {
  /** Interval in milliseconds to check for DevTools (default: 1000) */
  interval?: number

  /** Callback triggered when DevTools is opened */
  onOpen?: () => void

  /** Callback triggered when DevTools is closed */
  onClose?: () => void
}

let isOpen = false

export function startDevtoolsDetector(options: DetectorOptions = {}) {
  const {
    interval = 1000,
    onOpen = () => console.warn("DevTools opened!"),
    onClose = () => {},
  } = options

  const threshold = 160 // devtools usually causes >160px diff in dimensions

  setInterval(() => {
    const widthDiff = window.outerWidth - window.innerWidth
    const heightDiff = window.outerHeight - window.innerHeight

    const devtoolsDetected = widthDiff > threshold || heightDiff > threshold

    if (devtoolsDetected && !isOpen) {
      isOpen = true
      onOpen()
    } else if (!devtoolsDetected && isOpen) {
      isOpen = false
      onClose()
    }
  }, interval)
}
