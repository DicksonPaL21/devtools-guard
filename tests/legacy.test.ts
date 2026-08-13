import { afterEach, describe, expect, it, vi } from "vitest"
import { createDevtoolsDetector, isDevtoolsOpen, startDevtoolsDetector } from "../src"

afterEach(() => vi.unstubAllGlobals())

describe("legacy API", () => {
  it("remains available with safe defaults and cleanup", async () => {
    vi.stubGlobal("window", {
      innerWidth: 1000,
      innerHeight: 700,
      outerWidth: 1200,
      outerHeight: 700,
      screen: { width: 1440, height: 900 },
    })
    vi.stubGlobal("navigator", { maxTouchPoints: 0 })
    vi.stubGlobal("document", {
      visibilityState: "visible",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    const onOpen = vi.fn()
    const detector = createDevtoolsDetector({ onOpen })
    detector.start()
    expect(detector.isRunning()).toBe(true)
    await vi.waitFor(() => {
      expect(isDevtoolsOpen()).toBe(true)
      expect(onOpen).toHaveBeenCalledOnce()
    })
    detector.stop()
    expect(isDevtoolsOpen()).toBe(false)
  })

  it("does not start during SSR", () => {
    const detector = startDevtoolsDetector()
    expect(detector.isRunning()).toBe(false)
  })
})
