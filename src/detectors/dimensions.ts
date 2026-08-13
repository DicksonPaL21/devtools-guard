import type { DetectorResult } from "../types"

function isLikelyMobile(): boolean {
  if (typeof navigator === "undefined") return false

  return (
    navigator.maxTouchPoints > 1 &&
    (typeof window === "undefined" || Math.min(window.screen.width, window.screen.height) < 768)
  )
}

export function detectDimensions(threshold: number): DetectorResult {
  if (typeof window === "undefined" || isLikelyMobile()) {
    return { detected: false, confidence: 0, orientation: null }
  }

  const widthDifference = Math.max(0, window.outerWidth - window.innerWidth)
  const heightDifference = Math.max(0, window.outerHeight - window.innerHeight)
  const vertical = widthDifference >= threshold
  const horizontal = heightDifference >= threshold

  if (!vertical && !horizontal) {
    return { detected: false, confidence: 0, orientation: null }
  }

  const difference = Math.max(widthDifference, heightDifference)
  const confidence = Math.min(0.8, 0.6 + ((difference - threshold) / threshold) * 0.2)
  const orientation = vertical && horizontal
    ? widthDifference >= heightDifference ? "vertical" : "horizontal"
    : vertical ? "vertical" : "horizontal"

  return { detected: true, confidence, orientation }
}
