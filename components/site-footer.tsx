import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="About this site">
          <Link href="/about" className="underline-offset-4 hover:underline">
            About
          </Link>
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Privacy
          </Link>
          <Link href="/contact" className="underline-offset-4 hover:underline">
            Contact
          </Link>
        </nav>
        <p className="text-muted-foreground">The menu stays in this browser.</p>
      </div>
    </footer>
  )
}
