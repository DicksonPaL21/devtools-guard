import { describe, expect, it } from "vitest"
import { DEFAULT_OPTIONS, normalizeOptions } from "../src/core/options"

describe("option normalization", () => {
  it("uses conservative defaults", () => {
    expect(normalizeOptions()).toMatchObject({
      enabled: DEFAULT_OPTIONS.enabled,
      interval: DEFAULT_OPTIONS.interval,
      threshold: DEFAULT_OPTIONS.threshold,
      confidenceThreshold: DEFAULT_OPTIONS.confidenceThreshold,
      methods: DEFAULT_OPTIONS.methods,
      debounce: DEFAULT_OPTIONS.debounce,
      pauseWhenHidden: DEFAULT_OPTIONS.pauseWhenHidden,
    })
  })

  it("merges nested options without mutating input", () => {
    const input = {
      interval: 20,
      methods: { debuggerTiming: true },
      debounce: { open: 3 },
    } as const
    const snapshot = structuredClone(input)
    const normalized = normalizeOptions(input)

    expect(normalized.interval).toBe(100)
    expect(normalized.methods).toEqual({
      dimensions: true,
      debuggerTiming: true,
      consoleTiming: false,
    })
    expect(normalized.debounce).toEqual({ open: 3, close: 2 })
    expect(input).toEqual(snapshot)
  })
})
