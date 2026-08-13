import type { DetectorResult } from "../types"

export function detectDebuggerTiming(thresholdMs: number): DetectorResult {
  if (typeof window === "undefined" || typeof performance === "undefined") {
    return { detected: false, confidence: 0 }
  }

  const start = performance.now()
  // This probe is opt-in. A paused debugger makes the elapsed time exceed the threshold.
  debugger
  const elapsed = performance.now() - start
  return { detected: elapsed >= thresholdMs, confidence: elapsed >= thresholdMs ? 0.8 : 0 }
}
