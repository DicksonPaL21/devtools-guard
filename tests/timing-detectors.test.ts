import { afterEach, describe, expect, it, vi } from "vitest"
import { detectConsoleTiming } from "../src/detectors/consoleTrap"
import { detectDebuggerTiming } from "../src/detectors/debugger"
import { createDetectors, safelyDetect } from "../src/detectors"

afterEach(() => vi.unstubAllGlobals())

describe("opt-in timing detectors", () => {
  it("keeps console output isolated and applies its threshold", () => {
    vi.stubGlobal("window", {})
    vi.stubGlobal("performance", { now: vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(10) })
    vi.stubGlobal("console", { debug: vi.fn() })

    expect(detectConsoleTiming(5)).toEqual({ detected: true, confidence: 0.4 })
    expect(console.debug).toHaveBeenCalledOnce()
  })

  it("handles unsupported debugger timing environments", () => {
    vi.stubGlobal("window", undefined)
    expect(detectDebuggerTiming(100)).toEqual({ detected: false, confidence: 0 })
  })

  it("constructs only enabled detectors and isolates failures", async () => {
    const detectors = createDetectors(
      { dimensions: false, debuggerTiming: true, consoleTiming: true },
      { threshold: 160, debuggerThresholdMs: 100, consoleThresholdMs: 5 },
    )
    expect(detectors.map(detector => detector.name)).toEqual(["debuggerTiming", "consoleTiming"])
    await expect(safelyDetect({
      name: "dimensions",
      detect: () => { throw new Error("unsupported browser API") },
    })).resolves.toEqual({ detected: false, confidence: 0 })
  })
})
