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
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-auto grid leading-tight">
          <span className="font-semibold tracking-tight">USSD Bench</span>
          <span className="text-xs text-muted-foreground">Menus and SMS segments</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Tools">
          {TOOLS.map((tool) => {
            const active = pathname === tool.href
            return (
              <Link
                key={tool.href}
                href={tool.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tool.label}
              </Link>
            )
          })}
        </nav>
        <Button
          type="button"
          variant="outline"
          size="lg"
          aria-pressed={dark}
          onClick={() => update({ theme: dark ? "light" : "dark" })}
        >
          {dark ? "Light" : "Dark"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="sm:hidden"
          aria-expanded={open}
          aria-controls="tool-menu"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </Button>
      </div>
      {open ? (
        <nav id="tool-menu" className="flex flex-col gap-1 border-t px-4 py-3 sm:hidden" aria-label="Tools">
          {TOOLS.map((tool) => {
            const active = pathname === tool.href
            return (
              <Link
                key={tool.href}
                href={tool.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-2 py-2 text-sm",
                  active ? "bg-accent text-accent-foreground" : "text-foreground",
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
