export { createDevtoolsGuard } from "./core/devtools-guard"
export { detectDevtools } from "./core/detect-devtools"
export {
  createDevtoolsDetector,
  isDevtoolsOpen,
  startDevtoolsDetector,
} from "./legacy"

export type {
  DetectionMethod,
  DetectionResult,
  DetectorOptions,
  DetectDevtoolsOptions,
  DevtoolsDetector,
  DevtoolsGuard,
  DevtoolsGuardOptions,
  DevtoolsOrientation,
  DevtoolsState,
  LegacyDetectionMethod,
} from "./types"
