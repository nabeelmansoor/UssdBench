import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="page-shell flex flex-col gap-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="About this site">
          <Link href="/about" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            About
          </Link>
          <Link href="/privacy" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Privacy
          </Link>
          <Link href="/contact" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Contact
          </Link>
        </nav>
        <p className="text-muted-foreground">The menu stays in this browser.</p>
      </div>
    </footer>
  )
}
