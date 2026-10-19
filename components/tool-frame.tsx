import { cn } from "cn"

export const actionButtonClass = "h-11 w-full sm:w-auto"

export function ToolIntro({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="mx-auto w-full max-w-2xl px-4 pt-8 sm:pt-10">
      <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-2 max-w-[62ch] text-base leading-7 text-muted-foreground">{lede}</p>
    </header>
  )
}

export function ToolCanvas({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col gap-5 px-4">{children}</div>
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
        "mx-auto mt-20 w-full space-y-4 px-4 pb-16 text-[0.975rem] leading-7 text-foreground/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_p]:max-w-[68ch] [&_ul]:max-w-[68ch] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
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
    <article className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-[62ch] text-base leading-7 text-muted-foreground">{lede}</p>
      <div className="mt-8 max-w-[68ch] space-y-4 text-[0.975rem] leading-7">{children}</div>
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
      ? "border-destructive/40 bg-destructive/10 text-foreground"
      : tone === "warning"
        ? "border-amber-800/25 bg-amber-100 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/50 dark:text-amber-50"
        : "border-border bg-muted text-foreground"
  return (
    <div id={id} className={`scroll-mt-6 rounded-lg border px-3 py-2 text-sm leading-6 ${toneClass}`}>
      {children}
    </div>
  )
}

export function Reading() {
  return <p className="text-sm text-muted-foreground">Reading the text kept in this tab.</p>
}
