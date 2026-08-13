import type { DetectDevtoolsOptions, DevtoolsState } from "../types"
import { createDevtoolsGuard } from "./devtools-guard"

/** Runs one detection cycle without starting a monitor. */
export async function detectDevtools(options: DetectDevtoolsOptions = {}): Promise<DevtoolsState> {
  const guard = createDevtoolsGuard({ ...options, debounce: { open: 1, close: 1 } })
  try {
    return await guard.check()
  } finally {
    guard.destroy()
  }
}
