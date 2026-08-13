/** Detection techniques supported by the guard. */
export type DetectionMethod =
  | "dimensions"
  | "debuggerTiming"
  | "consoleTiming"

export type DevtoolsOrientation = "vertical" | "horizontal" | null

/** The latest stable DevTools state. */
export interface DevtoolsState {
  isOpen: boolean
  orientation: DevtoolsOrientation
  confidence: number
  detectedBy: DetectionMethod[]
  timestamp: number
}

export interface DevtoolsGuardOptions {
  enabled?: boolean
  interval?: number
  threshold?: number
  confidenceThreshold?: number
  methods?: Partial<Record<DetectionMethod, boolean>>
  debounce?: {
    open?: number
    close?: number
  }
  pauseWhenHidden?: boolean
  autoStart?: boolean
  debuggerThresholdMs?: number
  consoleThresholdMs?: number
  onOpen?: (state: DevtoolsState) => void
  onClose?: (state: DevtoolsState) => void
  onChange?: (state: DevtoolsState) => void
}

export type DetectDevtoolsOptions = Omit<
  DevtoolsGuardOptions,
  "autoStart" | "debounce" | "interval" | "onOpen" | "onClose" | "onChange"
>

export interface DevtoolsGuard {
  start(): DevtoolsGuard
  stop(): void
  check(): Promise<DevtoolsState>
  getState(): DevtoolsState
  destroy(): void
  subscribe(listener: (state: DevtoolsState) => void): () => void
  isRunning(): boolean
}

export interface DetectorResult {
  detected: boolean
  confidence: number
  orientation?: DevtoolsOrientation
}

export interface Detector {
  name: DetectionMethod
  detect(): DetectorResult | Promise<DetectorResult>
}

/** @deprecated Use DetectionMethod with createDevtoolsGuard instead. */
export type LegacyDetectionMethod =
  | "dimensions"
  | "console"
  | "debugger"
  | "toString"

/** @deprecated Use DevtoolsState instead. */
export interface DetectionResult {
  detectedBy: LegacyDetectionMethod[]
  timestamp: number
}

/** @deprecated Use DevtoolsGuardOptions instead. */
export interface DetectorOptions {
  interval?: number
  debounceMs?: number
  methods?: readonly LegacyDetectionMethod[]
  dimensionThreshold?: number
  consoleThresholdMs?: number
  debuggerThresholdMs?: number
  onOpen?: (details: DetectionResult) => void
  onClose?: (details?: DetectionResult) => void
}

/** @deprecated Use DevtoolsGuard instead. */
export interface DevtoolsDetector {
  start(): DevtoolsDetector
  stop(): void
  check(): DetectionResult | null
  isOpen(): boolean
  isRunning(): boolean
}
