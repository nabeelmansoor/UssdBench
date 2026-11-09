"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/** Share of the viewport height a page's top edge must pass before the phone switches to it. */
const READING_LINE = 0.35

/** Tracks the page card the user has scrolled to, so the phone can follow it. */
export function useVisiblePage(count: number, resetKey: string) {
  const [visible, setVisible] = useState(0)
  const nodes = useRef(new Map<number, HTMLElement>())

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(0), 0)
    return () => window.clearTimeout(timer)
  }, [resetKey])

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const line = window.innerHeight * READING_LINE
      let best = 0
      for (const [index, node] of [...nodes.current.entries()].sort((a, b) => a[0] - b[0])) {
        if (node.getBoundingClientRect().top <= line) best = index
      }
      setVisible(best)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [count, resetKey])

  const register = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      if (node) nodes.current.set(index, node)
      else nodes.current.delete(index)
    },
    [],
  )

  return { visible: Math.min(visible, Math.max(0, count - 1)), setVisible, register }
}
