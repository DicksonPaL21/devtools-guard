import type { DetectionMethod, Detector, DetectorResult } from "../types"
import { detectConsoleTiming } from "./consoleTrap"
import { detectDebuggerTiming } from "./debugger"
import { detectDimensions } from "./dimensions"

export interface DetectorThresholds {
  threshold: number
  debuggerThresholdMs: number
  consoleThresholdMs: number
}

export function createDetectors(
  methods: Record<DetectionMethod, boolean>,
  thresholds: DetectorThresholds,
): Detector[] {
  const detectors: Detector[] = []

  if (methods.dimensions) {
    detectors.push({
      name: "dimensions",
      detect: () => detectDimensions(thresholds.threshold),
    })
  }
  if (methods.debuggerTiming) {
    detectors.push({
      name: "debuggerTiming",
      detect: () => detectDebuggerTiming(thresholds.debuggerThresholdMs),
    })
  }
  if (methods.consoleTiming) {
    detectors.push({
      name: "consoleTiming",
      detect: () => detectConsoleTiming(thresholds.consoleThresholdMs),
    })
  }

  return detectors
}

export async function safelyDetect(detector: Detector): Promise<DetectorResult> {
  try {
    return await detector.detect()
  } catch {
    return { detected: false, confidence: 0 }
  }
}
