"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "cn"
import { TOOLS } from "@/lib/tools"
import { useSession } from "@/lib/session"

export function Header() {
  const pathname = usePathname()
  const { state, update } = useSession()
  const [open, setOpen] = useState(false)
  const dark = state.theme === "dark"

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="page-shell flex items-center gap-2 py-3 sm:gap-3">
        <Link href="/" className="mr-auto flex min-w-0 items-center gap-2.5 leading-tight">
          <span
            className="hidden size-8 shrink-0 rounded-lg bg-primary/15 ring-1 ring-primary/25 sm:inline-flex sm:items-center sm:justify-center"
            aria-hidden="true"
          >
            <span className="font-mono text-xs font-semibold text-primary">UB</span>
          </span>
          <span className="grid min-w-0">
            <span className="truncate font-semibold tracking-tight text-foreground">USSD Bench</span>
            <span className="truncate text-xs text-muted-foreground">Menus and SMS segments</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 sm:flex" aria-label="Tools">
          {TOOLS.map((tool) => {
            const active = pathname === tool.href
            return (
              <Link
                key={tool.href}
                href={tool.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tool.label}
              </Link>
            )
          })}
        </nav>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0"
          aria-pressed={dark}
          onClick={() => update({ theme: dark ? "light" : "dark" })}
        >
          {dark ? "Light" : "Dark"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 sm:hidden"
          aria-expanded={open}
          aria-controls="tool-menu"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </Button>
      </div>
      {open ? (
        <nav
          id="tool-menu"
          className="page-shell flex flex-col gap-0.5 border-t border-border py-3 sm:hidden"
          aria-label="Tools"
        >
          {TOOLS.map((tool) => {
            const active = pathname === tool.href
            return (
              <Link
                key={tool.href}
                href={tool.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-2 py-2.5 text-sm font-medium",
                  active ? "bg-primary/12 text-primary" : "text-foreground hover:bg-muted",
                )}
              >
                {tool.label}
              </Link>
            )
          })}
        </nav>
      ) : null}
    </header>
  )
}
