import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createDevtoolsGuard, detectDevtools } from "../src"

type VisibilityListener = () => void
let visibilityState: "visible" | "hidden"
let visibilityListener: VisibilityListener | undefined

function setDimensions(widthDifference: number, heightDifference = 0) {
  Object.assign(globalThis.window, {
    innerWidth: 1000,
    innerHeight: 700,
    outerWidth: 1000 + widthDifference,
    outerHeight: 700 + heightDifference,
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  visibilityState = "visible"
  visibilityListener = undefined
  vi.stubGlobal("window", { screen: { width: 1440, height: 900 } })
  vi.stubGlobal("navigator", { maxTouchPoints: 0 })
  vi.stubGlobal("document", {
    get visibilityState() { return visibilityState },
    addEventListener: vi.fn((_event: string, listener: VisibilityListener) => {
      visibilityListener = listener
    }),
    removeEventListener: vi.fn((_event: string, listener: VisibilityListener) => {
      if (visibilityListener === listener) visibilityListener = undefined
    }),
  })
  setDimensions(0)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("guard lifecycle and transitions", () => {
  it("starts and stops idempotently and cleans up on destroy", () => {
    const guard = createDevtoolsGuard()
    guard.start().start()
    expect(guard.isRunning()).toBe(true)
    expect(document.addEventListener).toHaveBeenCalledTimes(1)

    guard.stop()
    guard.stop()
    expect(guard.isRunning()).toBe(false)
    expect(document.removeEventListener).toHaveBeenCalledTimes(1)

    guard.destroy()
    guard.destroy()
    expect(() => guard.start()).not.toThrow()
    expect(guard.isRunning()).toBe(false)
  })

  it("debounces open and close transitions and fires callbacks once", async () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const onChange = vi.fn()
    const guard = createDevtoolsGuard({ onOpen, onClose, onChange })
    setDimensions(200)

    await guard.check()
    expect(guard.getState().isOpen).toBe(false)
    await guard.check()
    expect(guard.getState()).toMatchObject({ isOpen: true, orientation: "vertical" })
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)

    await guard.check()
    expect(onOpen).toHaveBeenCalledTimes(1)
    setDimensions(0)
    await guard.check()
    expect(guard.getState().isOpen).toBe(true)
    await guard.check()
    expect(guard.getState().isOpen).toBe(false)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it("resets debounce counters when the candidate changes", async () => {
    const guard = createDevtoolsGuard()
    setDimensions(200)
    await guard.check()
    setDimensions(0)
    await guard.check()
    setDimensions(200)
    await guard.check()
    expect(guard.getState().isOpen).toBe(false)
    await guard.check()
    expect(guard.getState().isOpen).toBe(true)
  })

  it("isolates callback and subscriber failures", async () => {
    const survivor = vi.fn()
    const guard = createDevtoolsGuard({
      debounce: { open: 1 },
      onOpen: () => { throw new Error("application callback") },
    })
    guard.subscribe(() => { throw new Error("subscriber") })
    guard.subscribe(survivor)
    setDimensions(200)

    await expect(guard.check()).resolves.toMatchObject({ isOpen: true })
    expect(survivor).toHaveBeenCalledOnce()
  })

  it("pauses while hidden and resumes when visible", async () => {
    const guard = createDevtoolsGuard({ interval: 100 })
    guard.start()
    await vi.advanceTimersByTimeAsync(0)
    visibilityState = "hidden"
    visibilityListener?.()
    expect(vi.getTimerCount()).toBe(0)

    visibilityState = "visible"
    visibilityListener?.()
    expect(vi.getTimerCount()).toBe(1)
    guard.destroy()
    expect(visibilityListener).toBeUndefined()
  })
})

describe("one-off and SSR behavior", () => {
  it("runs a one-off detection with no monitor", async () => {
    setDimensions(200)
    await expect(detectDevtools()).resolves.toMatchObject({ isOpen: true })
    expect(vi.getTimerCount()).toBe(0)
  })

  it("is safe without browser globals", async () => {
    vi.unstubAllGlobals()
    const guard = createDevtoolsGuard({ autoStart: true })
    expect(guard.isRunning()).toBe(false)
    await expect(guard.check()).resolves.toMatchObject({ isOpen: false, detectedBy: [] })
  })
})
