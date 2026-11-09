import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TOOLS } from "@/lib/tools"

const LIMITS = [
  { label: "USSD GSM-7", value: "182", detail: "septets per page" },
  { label: "USSD Latin-1", value: "160", detail: "characters per page" },
  { label: "USSD UCS-2", value: "80", detail: "characters per page" },
  { label: "SMS GSM-7", value: "160 / 153", detail: "single / part" },
  { label: "SMS Latin-1", value: "140 / 134", detail: "single / part" },
  { label: "SMS UCS-2", value: "70 / 67", detail: "single / part" },
]

const STEPS: Record<string, string[]> = {
  "/ussd": ["Input", "Encoding", "Pagination", "Alignment", "Character Review"],
  "/sms": ["Input", "Encoding", "Segments"],
}

function LimitsReadout() {
  return (
    <div
      className="lcd-grid rounded-2xl border-[1.5px] border-line bg-lcd p-1 text-lcd-foreground shadow-hard-lg"
      role="group"
      aria-label="Encoding limits"
    >
      <div className="rounded-xl border border-dashed border-lcd-dim/60 p-3 font-mono sm:p-4">
        <p className="text-[0.65rem] font-bold tracking-[0.14em] text-lcd-dim uppercase">The numbers that matter</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 sm:gap-y-4">
          {LIMITS.map((limit) => (
            <div key={limit.label}>
              <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-lcd-dim uppercase">{limit.label}</dt>
              <dd className="text-lg leading-6 font-bold sm:text-xl">{limit.value}</dd>
              <dd className="text-xs text-lcd-dim">{limit.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export function HomeScreen() {
  return (
    <div className="container-page pt-8 pb-4 lg:pt-14">
      <section className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <p className="kicker">Menu and SMS workbench</p>
          <h1 className="mt-4 max-w-[16ch] text-[2.75rem] leading-[0.98] font-extrabold tracking-tight text-balance sm:text-6xl xl:text-7xl">
            Fit the menu before the{" "}
            <span className="rounded-sm bg-accent px-1.5 text-accent-foreground [box-decoration-break:clone]">gateway</span>{" "}
            cuts it
          </h1>
          <p className="mt-6 max-w-[56ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Write each language once. Smart quotes and special spaces are replaced for you, the encoding is picked per
            language, and the pages or segments are counted the way the network counts them.
          </p>
        </div>
        <LimitsReadout />
      </section>

      <section className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-2" aria-label="Formatters">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            data-section={tool.href === "/ussd" ? "ussd" : "sms"}
            aria-label={`${tool.action}. ${tool.description}`}
            className="group grid gap-4 rounded-lg border-[1.5px] border-line bg-card p-5 transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg focus-visible:outline-offset-4"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="inline-flex h-8 items-center rounded-md border-[1.5px] border-line bg-primary px-2.5 font-mono text-sm font-bold tracking-[0.12em] text-primary-foreground uppercase">
                {tool.group}
              </span>
              <ArrowRight className="size-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-heading text-2xl font-bold tracking-tight">{tool.title}</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">{tool.description}</span>
            </span>
            <ol className="flex flex-wrap gap-2">
              {STEPS[tool.href]?.map((step, index) => (
                <li
                  key={step}
                  className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-1 font-mono text-xs"
                >
                  <span className="font-bold text-primary">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Link>
        ))}
      </section>
    </div>
  )
}
