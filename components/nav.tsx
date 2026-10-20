"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlignLeft, House, Lock, MessageSquareText, Moon, Rows3, ScanSearch, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"
import { TOOLS } from "@/lib/tools"
import { useSession } from "@/lib/session"

const ICONS: Record<string, LucideIcon> = {
  "/": House,
  "/ussd/paginate": Rows3,
  "/ussd/align": AlignLeft,
  "/ussd/characters": ScanSearch,
  "/sms": MessageSquareText,
}

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 rounded-md focus-visible:outline-sidebar-ring"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-md border-[1.5px] border-sidebar-primary bg-sidebar-primary font-mono font-extrabold text-sidebar-primary-foreground",
          compact ? "size-9 text-base" : "size-11 text-lg",
        )}
      >
        *#
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading font-extrabold tracking-tight text-sidebar-foreground",
            compact ? "text-xl" : "text-[1.7rem]",
          )}
        >
          USSD Bench
        </span>
        <span className="mt-1.5 font-mono text-[0.65rem] tracking-[0.1em] text-sidebar-muted uppercase">
          Menu and SMS workbench
        </span>
      </span>
    </Link>
  )
}

export function ThemeSwitch({ className, showLabel = true }: { className?: string; showLabel?: boolean }) {
  const { state, update } = useSession()
  const dark = state.theme === "dark"
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={() => update({ theme: dark ? "light" : "dark" })}
      className={cn(
        "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-sidebar-ring",
        className,
      )}
    >
      {showLabel ? <span className="flex-1 text-left">Dark mode</span> : null}
      <span
        aria-hidden="true"
        className={cn(
          "relative flex h-7 w-[3.25rem] shrink-0 items-center rounded-full border-[1.5px] border-sidebar-primary px-1 transition-colors",
          dark ? "bg-sidebar-primary" : "bg-transparent",
        )}
      >
        <Sun
          className={cn(
            "absolute left-1.5 size-4",
            dark ? "text-sidebar-primary-foreground/70" : "text-sidebar-primary",
          )}
        />
        <Moon
          className={cn(
            "absolute right-1.5 size-4",
            dark ? "text-sidebar-primary-foreground" : "text-sidebar-muted",
          )}
        />
        <span
          className={cn(
            "z-10 size-4.5 rounded-full transition-transform",
            dark
              ? "translate-x-0 bg-sidebar-primary-foreground"
              : "translate-x-[1.5rem] bg-sidebar-primary",
          )}
        />
      </span>
    </button>
  )
}

function SideLink({
  href,
  label,
  active,
  badge,
  Icon,
}: {
  href: string
  label: string
  active: boolean
  badge: string | null
  Icon: LucideIcon
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md border-[1.5px] px-2 py-2 text-[0.95rem] font-semibold transition-colors focus-visible:outline-sidebar-ring",
        active
          ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
          : "border-transparent text-sidebar-foreground hover:bg-sidebar-accent",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded font-mono text-sm font-bold",
          active
            ? "bg-sidebar-primary-foreground text-sidebar-primary"
            : "border border-sidebar-border bg-sidebar text-sidebar-primary",
        )}
      >
        {badge ?? <Icon className="size-4" />}
      </span>
      <span className="flex-1">{label}</span>
      {active ? <span aria-hidden="true" className="font-mono text-sm">&gt;</span> : null}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex xl:w-64">
      <Wordmark />
      <nav aria-label="Site" className="flex flex-col gap-1">
        <SideLink href="/" label="Home" active={pathname === "/"} badge={null} Icon={House} />
        <p className="mt-4 mb-1 px-2 font-mono text-[0.65rem] font-semibold tracking-[0.14em] text-sidebar-muted uppercase">
          Tools
        </p>
        {TOOLS.map((tool) => (
          <SideLink
            key={tool.href}
            href={tool.href}
            label={tool.label}
            active={pathname === tool.href}
            badge={tool.key}
            Icon={ICONS[tool.href]}
          />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <p className="flex items-start gap-2 px-2 text-xs leading-5 text-sidebar-muted">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          The menu never leaves this browser tab.
        </p>
        <div className="border-t border-sidebar-border pt-3">
          <ThemeSwitch />
        </div>
      </div>
    </aside>
  )
}

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
      <Wordmark compact />
      <ThemeSwitch showLabel={false} className="px-1" />
    </header>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const items = [
    { href: "/", label: "Home" },
    ...TOOLS.map((tool) => ({ href: tool.href, label: tool.label })),
  ]
  return (
    <nav
      aria-label="Site"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-[1.5px] border-sidebar-primary bg-sidebar lg:hidden"
    >
      {items.map((item) => {
        const active = pathname === item.href
        const Icon = ICONS[item.href]
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-2 text-[0.7rem] font-semibold focus-visible:outline-sidebar-ring focus-visible:-outline-offset-4",
              active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
