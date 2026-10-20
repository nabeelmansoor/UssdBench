"use client"

import { useState } from "react"
import { cn } from "cn"

export function CollapsiblePanel({
  title,
  defaultOpen = false,
  children,
  className,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <span className="text-muted-foreground" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border px-4 py-3 text-sm leading-6 text-muted-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground">
          {children}
        </div>
      ) : null}
    </div>
  )
}
