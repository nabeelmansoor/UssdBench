import { cn } from "cn"

export const actionButtonClass = "h-11 w-full sm:w-auto"

export function ToolIntro({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="tool-shell pt-8 sm:pt-10">
      <p className="text-xs font-medium tracking-wide text-primary uppercase">Tool</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-[2rem]">{title}</h1>
      <p className="mt-3 max-w-[62ch] text-base leading-7 text-muted-foreground">{lede}</p>
    </header>
  )
}

export function ToolCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="tool-shell mt-6 flex flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        {children}
      </div>
    </div>
  )
}

export function Explainer({
  children,
  wide = false,
}: {
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <section
      className={cn(
        "mx-auto mt-16 w-full space-y-4 border-t border-border px-4 pt-12 pb-16 text-[0.975rem] leading-7 text-foreground/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_p]:max-w-[68ch] [&_ul]:max-w-[68ch] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        wide ? "max-w-3xl" : "max-w-2xl",
      )}
    >
      {children}
    </section>
  )
}

export function PolicyArticle({
  title,
  lede,
  children,
}: {
  title: string
  lede: string
  children: React.ReactNode
}) {
  return (
    <article className="tool-shell py-10 sm:py-12">
      <p className="text-xs font-medium tracking-wide text-primary uppercase">USSD Bench</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-[62ch] text-base leading-7 text-muted-foreground">{lede}</p>
      <div className="mt-8 max-w-[68ch] space-y-4 text-[0.975rem] leading-7 text-foreground/90">{children}</div>
    </article>
  )
}

export function Callout({
  tone = "info",
  children,
  id,
}: {
  tone?: "info" | "warning" | "danger"
  children: React.ReactNode
  id?: string
}) {
  const toneClass =
    tone === "danger"
      ? "border-destructive/35 bg-destructive/8 text-foreground"
      : tone === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-50"
        : "border-border bg-muted/80 text-foreground"
  return (
    <div id={id} className={`scroll-mt-6 rounded-lg border px-3 py-2.5 text-sm leading-6 ${toneClass}`}>
      {children}
    </div>
  )
}

export function Reading() {
  return <p className="text-sm text-muted-foreground">Reading the text kept in this tab.</p>
}
