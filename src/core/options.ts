import type { DetectionMethod, DevtoolsGuardOptions } from "../types"

export interface NormalizedOptions {
  enabled: boolean
  interval: number
  threshold: number
  confidenceThreshold: number
  methods: Record<DetectionMethod, boolean>
  debounce: { open: number; close: number }
  pauseWhenHidden: boolean
  debuggerThresholdMs: number
  consoleThresholdMs: number
  onOpen?: DevtoolsGuardOptions["onOpen"]
  onClose?: DevtoolsGuardOptions["onClose"]
  onChange?: DevtoolsGuardOptions["onChange"]
}

export const DEFAULT_OPTIONS = {
  enabled: true,
  interval: 1000,
  threshold: 160,
  confidenceThreshold: 0.6,
  methods: {
    dimensions: true,
    debuggerTiming: false,
    consoleTiming: false,
  },
  debounce: { open: 2, close: 2 },
  pauseWhenHidden: true,
  autoStart: false,
  debuggerThresholdMs: 100,
  consoleThresholdMs: 5,
} as const

function finiteAtLeast(value: number | undefined, fallback: number, minimum: number): number {
  return value === undefined || !Number.isFinite(value)
    ? fallback
    : Math.max(minimum, value)
}

export function normalizeOptions(options: DevtoolsGuardOptions = {}): NormalizedOptions {
  return {
    enabled: options.enabled ?? DEFAULT_OPTIONS.enabled,
    interval: finiteAtLeast(options.interval, DEFAULT_OPTIONS.interval, 100),
    threshold: finiteAtLeast(options.threshold, DEFAULT_OPTIONS.threshold, 1),
    confidenceThreshold: Math.min(
      1,
      finiteAtLeast(options.confidenceThreshold, DEFAULT_OPTIONS.confidenceThreshold, 0),
    ),
    methods: { ...DEFAULT_OPTIONS.methods, ...options.methods },
    debounce: {
      open: Math.ceil(finiteAtLeast(options.debounce?.open, DEFAULT_OPTIONS.debounce.open, 1)),
      close: Math.ceil(finiteAtLeast(options.debounce?.close, DEFAULT_OPTIONS.debounce.close, 1)),
    },
    pauseWhenHidden: options.pauseWhenHidden ?? DEFAULT_OPTIONS.pauseWhenHidden,
    debuggerThresholdMs: finiteAtLeast(
      options.debuggerThresholdMs,
      DEFAULT_OPTIONS.debuggerThresholdMs,
      0,
    ),
    consoleThresholdMs: finiteAtLeast(
      options.consoleThresholdMs,
      DEFAULT_OPTIONS.consoleThresholdMs,
      0,
    ),
    onOpen: options.onOpen,
    onClose: options.onClose,
    onChange: options.onChange,
  }
}
