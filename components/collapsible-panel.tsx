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
    <div className={cn("overflow-hidden rounded-lg border-[1.5px] border-line bg-card", className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold hover:bg-muted"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <span
          className="grid size-6 place-items-center rounded border-[1.5px] border-line bg-accent font-mono text-sm text-accent-foreground"
          aria-hidden="true"
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t-[1.5px] border-line px-4 py-4 text-sm leading-6 text-muted-foreground [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground">
          {children}
        </div>
      ) : null}
    </div>
  )
}
