export interface DetectorOptions {
  interval?: number
  onOpen?: () => void
  onClose?: () => void
}

let isOpen = false

export function startDevtoolsDetector(options: DetectorOptions = {}) {
  const {
    interval = 1000,
    onOpen = () => console.warn("DevTools opened!"),
    onClose = () => {},
  } = options

  const threshold = 160

  setInterval(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold
    const heightThreshold = window.outerHeight - window.innerHeight > threshold

    const detected = widthThreshold || heightThreshold

    if (detected && !isOpen) {
      isOpen = true
      onOpen()
    } else if (!detected && isOpen) {
      isOpen = false
      onClose()
    }
  }, interval)
}
