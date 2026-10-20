import Link from "next/link"

const linkClass =
  "font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:text-primary"

export function Footer() {
  return (
    <footer className="mt-auto border-t-[1.5px] border-line bg-card">
      <div className="container-page flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="About this site">
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact
          </Link>
        </nav>
        <p className="font-mono text-xs text-muted-foreground">USSD Bench · the menu stays in this browser</p>
      </div>
    </footer>
  )
}
