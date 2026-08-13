import type { DetectorResult } from "../types"

export function detectConsoleTiming(thresholdMs: number): DetectorResult {
  if (
    typeof window === "undefined" ||
    typeof performance === "undefined" ||
    typeof console === "undefined"
  ) {
    return { detected: false, confidence: 0 }
  }

  const start = performance.now()
  console.debug("%c", "color:transparent")
  const elapsed = performance.now() - start
  return { detected: elapsed >= thresholdMs, confidence: elapsed >= thresholdMs ? 0.4 : 0 }
}
