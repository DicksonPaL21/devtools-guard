import { createDetectors, safelyDetect } from "../detectors"
import type {
  DevtoolsGuard,
  DevtoolsGuardOptions,
  DevtoolsOrientation,
  DevtoolsState,
} from "../types"
import { normalizeOptions } from "./options"

function initialState(): DevtoolsState {
  return {
    isOpen: false,
    orientation: null,
    confidence: 0,
    detectedBy: [],
    timestamp: Date.now(),
  }
}

function copyState(state: DevtoolsState): DevtoolsState {
  return { ...state, detectedBy: [...state.detectedBy] }
}

function callSafely(callback: ((state: DevtoolsState) => void) | undefined, state: DevtoolsState): void {
  try {
    callback?.(copyState(state))
  } catch {
    // User callbacks must not interrupt monitoring.
  }
}

/** Creates a DevTools monitor. Monitoring only starts when requested. */
export function createDevtoolsGuard(options: DevtoolsGuardOptions = {}): DevtoolsGuard {
  const config = normalizeOptions(options)
  const detectors = createDetectors(config.methods, config)
  const subscribers = new Set<(state: DevtoolsState) => void>()
  let state = initialState()
  let timer: ReturnType<typeof setInterval> | undefined
  let running = false
  let destroyed = false
  let positiveCount = 0
  let negativeCount = 0
  let checkInProgress: Promise<DevtoolsState> | undefined

  const isHidden = () =>
    config.pauseWhenHidden &&
    typeof document !== "undefined" &&
    document.visibilityState === "hidden"

  const schedule = () => {
    if (!running || timer !== undefined || isHidden()) return
    timer = setInterval(() => { void guard.check() }, config.interval)
  }

  const unschedule = () => {
    if (timer !== undefined) clearInterval(timer)
    timer = undefined
  }

  const onVisibilityChange = () => {
    if (!running) return
    if (isHidden()) unschedule()
    else {
      void guard.check()
      schedule()
    }
  }

  const publish = (nextState: DevtoolsState) => {
    state = nextState
    callSafely(nextState.isOpen ? config.onOpen : config.onClose, nextState)
    callSafely(config.onChange, nextState)
    for (const subscriber of [...subscribers]) callSafely(subscriber, nextState)
  }

  const runCheck = async (): Promise<DevtoolsState> => {
    if (!config.enabled || destroyed || typeof window === "undefined" || isHidden()) {
      return copyState(state)
    }

    const results = await Promise.all(detectors.map(async detector => ({
      name: detector.name,
      result: await safelyDetect(detector),
    })))
    const detected = results.filter(({ result }) => result.detected)
    const detectedBy = detected.map(({ name }) => name)
    const confidence = detected.reduce((combined, { result }) =>
      1 - (1 - combined) * (1 - Math.min(1, Math.max(0, result.confidence))), 0)
    const candidateOpen = confidence >= config.confidenceThreshold
    const orientation: DevtoolsOrientation = detected
      .find(({ name, result }) => name === "dimensions" && result.orientation)?.result.orientation ?? null

    if (candidateOpen) {
      positiveCount += 1
      negativeCount = 0
    } else {
      negativeCount += 1
      positiveCount = 0
    }

    const required = candidateOpen ? config.debounce.open : config.debounce.close
    if (candidateOpen !== state.isOpen && (candidateOpen ? positiveCount : negativeCount) >= required) {
      publish({
        isOpen: candidateOpen,
        orientation: candidateOpen ? orientation : null,
        confidence,
        detectedBy: candidateOpen ? detectedBy : [],
        timestamp: Date.now(),
      })
    } else if (candidateOpen === state.isOpen && state.isOpen) {
      state = { ...state, orientation, confidence, detectedBy, timestamp: Date.now() }
    }

    return copyState(state)
  }

  const guard: DevtoolsGuard = {
    start() {
      if (running || destroyed || !config.enabled || typeof window === "undefined") return guard
      running = true
      if (config.pauseWhenHidden && typeof document !== "undefined") {
        document.addEventListener("visibilitychange", onVisibilityChange)
      }
      if (!isHidden()) {
        void guard.check()
        schedule()
      }
      return guard
    },
    stop() {
      if (!running) return
      running = false
      unschedule()
      if (config.pauseWhenHidden && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange)
      }
      positiveCount = 0
      negativeCount = 0
    },
    check() {
      if (!checkInProgress) {
        checkInProgress = runCheck().finally(() => { checkInProgress = undefined })
      }
      return checkInProgress
    },
    getState: () => copyState(state),
    destroy() {
      guard.stop()
      destroyed = true
      subscribers.clear()
    },
    subscribe(listener) {
      if (destroyed) return () => undefined
      subscribers.add(listener)
      return () => { subscribers.delete(listener) }
    },
    isRunning: () => running,
  }

  if (options.autoStart) guard.start()
  return guard
}
