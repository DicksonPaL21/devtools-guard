import { createDevtoolsGuard } from "./core/devtools-guard"
import type {
  DetectionMethod,
  DetectionResult,
  DevtoolsDetector,
  DevtoolsState,
  DetectorOptions,
  LegacyDetectionMethod,
} from "./types"

const activeLegacyDetectors = new Set<DevtoolsDetector>()

function legacyMethod(method: DetectionMethod): LegacyDetectionMethod {
  if (method === "consoleTiming") return "console"
  if (method === "debuggerTiming") return "debugger"
  return method
}

function legacyResult(state: DevtoolsState): DetectionResult {
  return { detectedBy: state.detectedBy.map(legacyMethod), timestamp: state.timestamp }
}

/** @deprecated Use createDevtoolsGuard instead. */
export function createDevtoolsDetector(options: DetectorOptions = {}): DevtoolsDetector {
  const requestedMethods = options.methods ?? ["dimensions"]
  const methods = {
    dimensions: requestedMethods.includes("dimensions"),
    debuggerTiming: requestedMethods.includes("debugger"),
    consoleTiming: requestedMethods.includes("console"),
  }
  const guard = createDevtoolsGuard({
    ...(options.interval === undefined ? {} : { interval: options.interval }),
    ...(options.dimensionThreshold === undefined
      ? {}
      : { threshold: options.dimensionThreshold }),
    ...(options.debuggerThresholdMs === undefined
      ? {}
      : { debuggerThresholdMs: options.debuggerThresholdMs }),
    ...(options.consoleThresholdMs === undefined
      ? {}
      : { consoleThresholdMs: options.consoleThresholdMs }),
    methods,
    debounce: { open: 1, close: 1 },
    onOpen: state => options.onOpen?.(legacyResult(state)),
    onClose: state => options.onClose?.(legacyResult(state)),
  })

  const detector: DevtoolsDetector = {
    start() {
      guard.start()
      if (guard.isRunning()) activeLegacyDetectors.add(detector)
      return detector
    },
    stop() {
      guard.stop()
      activeLegacyDetectors.delete(detector)
    },
    check() {
      void guard.check()
      const state = guard.getState()
      return state.isOpen ? legacyResult(state) : null
    },
    isOpen: () => guard.getState().isOpen,
    isRunning: guard.isRunning,
  }
  return detector
}

/** @deprecated Use createDevtoolsGuard and call start() explicitly. */
export function startDevtoolsDetector(options: DetectorOptions = {}): DevtoolsDetector {
  return createDevtoolsDetector(options).start()
}

/** @deprecated Read getState().isOpen from your guard instance instead. */
export function isDevtoolsOpen(): boolean {
  return [...activeLegacyDetectors].some(detector => detector.isOpen())
}
