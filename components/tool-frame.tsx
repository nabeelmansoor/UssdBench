import { cn } from "cn"
import { TOOLS } from "@/lib/tools"

export const actionButtonClass = "h-11 w-full sm:w-auto"

export function ToolIntro({ title, lede }: { title: string; lede: string }) {
  const tool = TOOLS.find((entry) => title.startsWith(entry.label))
  return (
    <header className="container-page pt-8 lg:pt-12">
      <div className="flex items-center gap-3">
        {tool ? <span className="key-chip">{tool.key}</span> : null}
        <p className="kicker">{tool ? `${tool.group} tool` : "Tool"}</p>
      </div>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{title}</h1>
      <div className="mt-4 h-1.5 w-16 bg-primary" aria-hidden="true" />
      <p className="mt-5 max-w-[64ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{lede}</p>
    </header>
  )
}

export function ToolCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page mt-8">
      <div className="flex max-w-4xl flex-col gap-5">{children}</div>
    </div>
  )
}

export function Panel({
  title,
  note,
  children,
  className,
  active,
  id,
}: {
  title?: React.ReactNode
  note?: React.ReactNode
  children: React.ReactNode
  className?: string
  active?: boolean
  id?: string
}) {
  return (
    <section id={id} data-active={active ? "true" : undefined} className={cn("panel", className)}>
      {title ? (
        <div className="panel-head">
          <h2 className="font-mono text-xs font-semibold tracking-[0.08em] uppercase">{title}</h2>
          {note ? <span className="font-medium tracking-normal normal-case">{note}</span> : null}
        </div>
      ) : null}
      <div className="panel-body">{children}</div>
    </section>
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
    <section className="container-page mt-16 pb-16">
      <div
        className={cn(
          "prose-block border-t-[1.5px] border-line pt-10 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:before:mr-2 [&_h2]:before:font-mono [&_h2]:before:text-primary [&_h2]:before:content-['//'] [&_p]:max-w-[68ch] [&_ul]:max-w-[68ch] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
          wide ? "max-w-4xl" : "max-w-3xl",
        )}
      >
        {children}
      </div>
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
    <article className="container-page py-10 lg:py-14">
      <p className="kicker">USSD Bench</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      <div className="mt-4 h-1.5 w-16 bg-primary" aria-hidden="true" />
      <p className="mt-5 max-w-[64ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{lede}</p>
      <div className="prose-block mt-8 max-w-[68ch] [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
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
      ? "border-destructive bg-destructive/10 text-foreground"
      : tone === "warning"
        ? "border-warn-border bg-warn text-warn-foreground"
        : "border-primary bg-muted text-foreground"
  return (
    <div
      id={id}
      className={cn("scroll-mt-6 rounded-md border-l-[5px] px-4 py-3 text-sm leading-6 [&_a]:font-semibold", toneClass)}
    >
      {children}
    </div>
  )
}

export function Reading() {
  return <p className="font-mono text-sm text-muted-foreground">Reading the text kept in this tab.</p>
}
