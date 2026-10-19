"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { AlignMode } from "@/lib/align"

export type WidthRange = "feature" | "smartphone"
export type ThemeName = "light" | "dark"
export type LineBreakMode = "lf" | "cr"

export type SessionState = {
  text: string
  budgetOctets: number
  width: number
  widthRange: WidthRange
  nextKey: string
  nextSep: string
  nextLabel: string
  backKey: string
  backSep: string
  backLabel: string
  theme: ThemeName
  lineBreak: LineBreakMode
  withLinks: boolean
  alignMode: AlignMode
}

export const DEFAULT_SESSION: SessionState = {
  text: "",
  budgetOctets: 160,
  width: 16,
  widthRange: "feature",
  nextKey: "99",
  nextSep: ": ",
  nextLabel: "Next",
  backKey: "0",
  backSep: ": ",
  backLabel: "Back",
  theme: "light",
  lineBreak: "lf",
  withLinks: true,
  alignMode: "left",
}

const STORAGE_KEY = "ussd-sms-formatter-v1"

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

function sanitize(raw: unknown): SessionState {
  if (!raw || typeof raw !== "object") return DEFAULT_SESSION
  const value = raw as Partial<SessionState>
  const widthRange = value.widthRange === "smartphone" ? "smartphone" : "feature"
  const min = widthRange === "smartphone" ? 30 : 16
  const max = widthRange === "smartphone" ? 48 : 24
  const width =
    typeof value.width === "number" ? Math.min(max, Math.max(min, Math.round(value.width))) : min
  const budget =
    typeof value.budgetOctets === "number"
      ? Math.min(2000, Math.max(1, Math.round(value.budgetOctets)))
      : 160
  return {
    text: typeof value.text === "string" ? normalizeText(value.text) : "",
    budgetOctets: budget,
    width,
    widthRange,
    nextKey: typeof value.nextKey === "string" ? value.nextKey : DEFAULT_SESSION.nextKey,
    nextSep: typeof value.nextSep === "string" ? value.nextSep : DEFAULT_SESSION.nextSep,
    nextLabel: typeof value.nextLabel === "string" ? value.nextLabel : DEFAULT_SESSION.nextLabel,
    backKey: typeof value.backKey === "string" ? value.backKey : DEFAULT_SESSION.backKey,
    backSep: typeof value.backSep === "string" ? value.backSep : DEFAULT_SESSION.backSep,
    backLabel: typeof value.backLabel === "string" ? value.backLabel : DEFAULT_SESSION.backLabel,
    theme: value.theme === "dark" ? "dark" : "light",
    lineBreak: value.lineBreak === "cr" ? "cr" : "lf",
    withLinks: typeof value.withLinks === "boolean" ? value.withLinks : true,
    alignMode: value.alignMode === "center" || value.alignMode === "right" ? value.alignMode : "left",
  }
}

type SessionPatch = Partial<SessionState> | ((current: SessionState) => Partial<SessionState>)

type SessionContextValue = {
  state: SessionState
  ready: boolean
  update: (patch: SessionPatch) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(DEFAULT_SESSION)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Read after mount so the server render and the first client render match.
    const timer = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (raw) setState(sanitize(JSON.parse(raw) as unknown))
      } catch {
        // A broken session starts again from the defaults.
      }
      setReady(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!ready) return
    document.documentElement.classList.toggle("dark", state.theme === "dark")
    document.documentElement.style.colorScheme = state.theme
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // The menu still lives in memory for this visit.
    }
  }, [ready, state])

  const update = (patch: SessionPatch) => {
    setState((current) => {
      const resolved = typeof patch === "function" ? patch(current) : patch
      const next: SessionState = { ...current, ...resolved }
      if (resolved.text !== undefined) next.text = normalizeText(resolved.text)
      if (resolved.budgetOctets !== undefined) {
        const budget = Math.round(resolved.budgetOctets)
        next.budgetOctets = Number.isFinite(budget) ? Math.min(2000, Math.max(1, budget)) : current.budgetOctets
      }
      if (resolved.widthRange === "feature" && resolved.width === undefined) next.width = 16
      if (resolved.widthRange === "smartphone" && resolved.width === undefined) next.width = 30
      const min = next.widthRange === "smartphone" ? 30 : 16
      const max = next.widthRange === "smartphone" ? 48 : 24
      next.width = Math.min(max, Math.max(min, Math.round(next.width)))
      return next
    })
  }

  return <SessionContext.Provider value={{ state, ready, update }}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error("useSession must be used inside SessionProvider")
  return value
}
