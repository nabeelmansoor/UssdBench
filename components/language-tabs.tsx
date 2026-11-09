"use client"

import { useId } from "react"
import { cn } from "cn"
import { getLanguage } from "@/lib/languages"

export function LanguageTabs({
  codes,
  active,
  onSelect,
  badge,
  children,
}: {
  codes: string[]
  active: string
  onSelect: (code: string) => void
  badge?: (code: string) => React.ReactNode
  children: React.ReactNode
}) {
  const id = useId()
  const current = codes.includes(active) ? active : codes[0]!
  return (
    <div className="panel">
      <div role="tablist" aria-label="Languages" className="flex overflow-x-auto border-b-[1.5px] border-line bg-secondary">
        {codes.map((code, index) => {
          const selected = code === current
          return (
            <button
              key={code}
              type="button"
              role="tab"
              id={`${id}-tab-${code}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(code)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
                const next = codes[(index + (event.key === "ArrowRight" ? 1 : codes.length - 1)) % codes.length]
                if (next) onSelect(next)
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 border-r-[1.5px] border-line px-4 py-2.5 text-sm font-semibold",
                selected ? "bg-card text-foreground shadow-[inset_0_-3px_0_0_var(--primary)]" : "text-muted-foreground hover:bg-card/60",
              )}
            >
              {getLanguage(code).name}
              {badge ? badge(code) : null}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${current}`}
        className="panel-body"
        dir="ltr"
      >
        {children}
      </div>
    </div>
  )
}

export function EncodingBadge({ label, tone = "plain" }: { label: string; tone?: "plain" | "warn" }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 font-mono text-[0.65rem] font-bold tracking-wide",
        tone === "warn" ? "border-warn-border bg-warn text-warn-foreground" : "border-border bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  )
}
