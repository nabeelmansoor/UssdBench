"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ForcedDirection } from "@/lib/direction"
import { ENCODINGS, type Encoding } from "@/lib/encoding"
import { isKnownLanguage } from "@/lib/languages"
import type { PaginationMode } from "@/lib/ussd-pagination"
import { newSmsLanguage, newUssdLanguage, type SmsLanguage, type UssdLanguage } from "@/lib/workflow"

export type ThemeName = "light" | "dark"
export type LineBreakMode = "lf" | "cr"
export type PhoneKind = "smartphone" | "feature"

export type PhoneSettings = {
  kind: PhoneKind
  smartphoneColumns: number
  featureColumns: number
}

export type UssdState = {
  languages: UssdLanguage[]
  active: string
  step: number
  withLinks: boolean
  mode: PaginationMode
  lineBreak: LineBreakMode
}

export type SmsState = {
  languages: SmsLanguage[]
  active: string
  step: number
}

export type SessionState = {
  theme: ThemeName
  phone: PhoneSettings
  ussd: UssdState
  sms: SmsState
}

export const PHONE_DEFAULT_COLUMNS: Record<PhoneKind, number> = { smartphone: 32, feature: 20 }
export const PHONE_COLUMN_RANGE = { min: 8, max: 60 }

export const DEFAULT_SESSION: SessionState = {
  theme: "dark",
  phone: { kind: "smartphone", smartphoneColumns: 32, featureColumns: 20 },
  ussd: {
    languages: [newUssdLanguage("en")],
    active: "en",
    step: 0,
    withLinks: true,
    mode: "word",
    lineBreak: "lf",
  },
  sms: { languages: [newSmsLanguage("en")], active: "en", step: 0 },
}

const STORAGE_KEY = "ussd-bench-v2"

const str = (value: unknown, fallback: string) => (typeof value === "string" ? value : fallback)
const encodingOrNull = (value: unknown): Encoding | null =>
  ENCODINGS.includes(value as Encoding) ? (value as Encoding) : null
const columns = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(PHONE_COLUMN_RANGE.max, Math.max(PHONE_COLUMN_RANGE.min, Math.round(value)))
    : fallback
const step = (value: unknown, max: number) =>
  typeof value === "number" && Number.isInteger(value) ? Math.min(max, Math.max(0, value)) : 0

function sanitizeList<T extends { code: string }>(raw: unknown, make: (code: string, value: Record<string, unknown>) => T, fallback: T[]): T[] {
  if (!Array.isArray(raw)) return fallback
  const seen = new Set<string>()
  const list: T[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const value = item as Record<string, unknown>
    const code = typeof value.code === "string" ? value.code : ""
    if (!isKnownLanguage(code) || seen.has(code)) continue
    seen.add(code)
    list.push(make(code, value))
  }
  return list.length > 0 ? list : fallback
}

function sanitizeUssdLanguage(code: string, value: Record<string, unknown>): UssdLanguage {
  const base = newUssdLanguage(code)
  const direction = value.direction
  return {
    code,
    text: str(value.text, ""),
    encoding: encodingOrNull(value.encoding),
    charsPerPage:
      typeof value.charsPerPage === "number" && value.charsPerPage >= 1 ? Math.min(2000, Math.round(value.charsPerPage)) : null,
    direction: direction === "rtl" || direction === "ltr" || direction === "none" ? (direction as ForcedDirection) : null,
    nextKey: str(value.nextKey, base.nextKey),
    nextSep: str(value.nextSep, base.nextSep),
    nextLabel: str(value.nextLabel, base.nextLabel),
    backKey: str(value.backKey, base.backKey),
    backSep: str(value.backSep, base.backSep),
    backLabel: str(value.backLabel, base.backLabel),
  }
}

function sanitize(raw: unknown): SessionState {
  if (!raw || typeof raw !== "object") return DEFAULT_SESSION
  const value = raw as Record<string, Record<string, unknown> | undefined> & { theme?: unknown }
  const phone = value.phone ?? {}
  const ussd = value.ussd ?? {}
  const sms = value.sms ?? {}
  const ussdLanguages = sanitizeList(ussd.languages, sanitizeUssdLanguage, DEFAULT_SESSION.ussd.languages)
  const smsLanguages = sanitizeList(
    sms.languages,
    (code, item) => ({ code, text: str(item.text, ""), encoding: encodingOrNull(item.encoding) }),
    DEFAULT_SESSION.sms.languages,
  )
  const active = (list: { code: string }[], candidate: unknown) =>
    list.some((item) => item.code === candidate) ? (candidate as string) : list[0]!.code
  return {
    theme: value.theme === "light" ? "light" : "dark",
    phone: {
      kind: phone.kind === "feature" ? "feature" : "smartphone",
      smartphoneColumns: columns(phone.smartphoneColumns, PHONE_DEFAULT_COLUMNS.smartphone),
      featureColumns: columns(phone.featureColumns, PHONE_DEFAULT_COLUMNS.feature),
    },
    ussd: {
      languages: ussdLanguages,
      active: active(ussdLanguages, ussd.active),
      step: step(ussd.step, 4),
      withLinks: typeof ussd.withLinks === "boolean" ? ussd.withLinks : true,
      mode: ussd.mode === "line" ? "line" : "word",
      lineBreak: ussd.lineBreak === "cr" ? "cr" : "lf",
    },
    sms: { languages: smsLanguages, active: active(smsLanguages, sms.active), step: step(sms.step, 2) },
  }
}

type Patch<T> = Partial<T> | ((current: T) => Partial<T>)

type SessionContextValue = {
  state: SessionState
  ready: boolean
  setTheme: (theme: ThemeName) => void
  updatePhone: (patch: Patch<PhoneSettings>) => void
  updateUssd: (patch: Patch<UssdState>) => void
  updateSms: (patch: Patch<SmsState>) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

function resolve<T>(current: T, patch: Patch<T>): T {
  return { ...current, ...(typeof patch === "function" ? patch(current) : patch) }
}

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
      // The text still lives in memory for this visit.
    }
  }, [ready, state])

  const value: SessionContextValue = {
    state,
    ready,
    setTheme: (theme) => setState((current) => ({ ...current, theme })),
    updatePhone: (patch) => setState((current) => ({ ...current, phone: resolve(current.phone, patch) })),
    updateUssd: (patch) => setState((current) => ({ ...current, ussd: resolve(current.ussd, patch) })),
    updateSms: (patch) => setState((current) => ({ ...current, sms: resolve(current.sms, patch) })),
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error("useSession must be used inside SessionProvider")
  return value
}
