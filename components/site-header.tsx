"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "cn"
import { TOOLS } from "@/lib/tools"
import { useSession } from "@/lib/session"

const navLinkClass =
  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors"

function NavLink({
  href,
  active,
  children,
  onNavigate,
}: {
  href: string
  active: boolean
  children: React.ReactNode
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        navLinkClass,
        active
          ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px] shadow-primary/25 dark:bg-primary/20 dark:text-primary-foreground"
          : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  )
}

export function Header() {
  const pathname = usePathname()
  const { state, update } = useSession()
  const [open, setOpen] = useState(false)
  const dark = state.theme === "dark"
  const isHome = pathname === "/"

  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-2 shrink-0 leading-none">
          <span className="text-xl font-bold tracking-tight text-primary sm:text-2xl">USSD Bench</span>
        </Link>
        <nav className="hidden min-w-0 flex-1 items-center gap-1 sm:flex" aria-label="Site">
          <NavLink href="/" active={isHome}>Home</NavLink>
          {TOOLS.map((tool) => (
            <NavLink key={tool.href} href={tool.href} active={pathname === tool.href}>
              {tool.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={dark}
            onClick={() => update({ theme: dark ? "light" : "dark" })}
          >
            {dark ? "Light" : "Dark"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="sm:hidden"
            aria-expanded={open}
            aria-controls="tool-menu"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </Button>
        </div>
      </div>
      {open ? (
        <nav id="tool-menu" className="flex flex-col gap-1 border-t px-4 py-3 sm:hidden" aria-label="Site">
          <NavLink href="/" active={isHome} onNavigate={() => setOpen(false)}>Home</NavLink>
          {TOOLS.map((tool) => (
            <NavLink
              key={tool.href}
              href={tool.href}
              active={pathname === tool.href}
              onNavigate={() => setOpen(false)}
            >
              {tool.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
