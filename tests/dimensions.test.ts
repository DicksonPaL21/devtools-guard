import { afterEach, describe, expect, it, vi } from "vitest"
import { detectDimensions } from "../src/detectors/dimensions"

function browser(widthDifference: number, heightDifference: number) {
  vi.stubGlobal("window", {
    innerWidth: 1000,
    innerHeight: 700,
    outerWidth: 1000 + widthDifference,
    outerHeight: 700 + heightDifference,
    screen: { width: 1440, height: 900 },
  })
  vi.stubGlobal("navigator", { maxTouchPoints: 0 })
}

afterEach(() => vi.unstubAllGlobals())

describe("dimensions detector", () => {
  it("reports a closed state below the threshold", () => {
    browser(159, 159)
    expect(detectDimensions(160)).toEqual({ detected: false, confidence: 0, orientation: null })
  })

  it("detects vertical and horizontal orientations at the threshold", () => {
    browser(160, 0)
    expect(detectDimensions(160)).toMatchObject({ detected: true, orientation: "vertical" })

    browser(0, 200)
    expect(detectDimensions(160)).toMatchObject({ detected: true, orientation: "horizontal" })
  })

  it("skips likely mobile environments", () => {
    browser(300, 300)
    vi.stubGlobal("navigator", { maxTouchPoints: 5 })
    vi.stubGlobal("window", {
      ...globalThis.window,
      screen: { width: 390, height: 844 },
    })
    expect(detectDimensions(160).detected).toBe(false)
  })
})
