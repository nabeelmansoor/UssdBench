"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BufferEditor } from "@/components/buffer-controls"
import { CounterStrip } from "@/components/counter-strip"
import { Button } from "@/components/ui/button"
import { Panel, Reading } from "@/components/tool-frame"
import { useSession } from "@/lib/session"
import { TOOLS } from "@/lib/tools"

const LIMITS = [
  { label: "GSM 7-bit", value: "160 octets", detail: "182 septets" },
  { label: "UCS-2", value: "160 octets", detail: "80 characters" },
  { label: "SMS GSM", value: "160 / 153", detail: "single / part" },
  { label: "SMS UCS-2", value: "70 / 67", detail: "single / part" },
]

function LimitsReadout() {
  return (
    <div
      className="lcd-grid rounded-2xl border-[1.5px] border-line bg-lcd p-1 text-lcd-foreground shadow-hard-lg"
      role="group"
      aria-label="Encoding limits"
    >
      <div className="rounded-xl border border-dashed border-lcd-dim/60 p-3 font-mono sm:p-4">
        <p className="text-[0.65rem] font-bold tracking-[0.14em] text-lcd-dim uppercase">The numbers that matter</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-y-4">
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
  const { state, ready } = useSession()
  if (!ready) {
    return (
      <div className="container-page pt-10">
        <Reading />
      </div>
    )
  }

  return (
    <div className="container-page pt-8 pb-4 lg:pt-14">
      <section className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <p className="kicker">Shared buffer</p>
          <h1 className="mt-4 max-w-[16ch] text-[2.75rem] leading-[0.98] font-extrabold tracking-tight text-balance sm:text-6xl xl:text-7xl">
            Fit the menu before the{" "}
            <span className="rounded-sm bg-accent px-1.5 text-accent-foreground [box-decoration-break:clone]">gateway</span>{" "}
            cuts it
          </h1>
          <p className="mt-6 max-w-[56ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Paste one USSD screen. See whether it is still GSM 7-bit, clean the characters a phone paste hides, and
            split it to the page budget. The same text is there when you open SMS.
          </p>
        </div>
        <LimitsReadout />
      </section>

      <section className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start" aria-label="Workbench">
        <Panel title="Buffer" note="Stays in this tab">
          <BufferEditor id="home-text" />
          <CounterStrip />
          {state.text.length > 0 ? (
            <div>
              <Button asChild className="h-11 w-full sm:w-auto">
                <Link href="/ussd/paginate">
                  Paginate this menu
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              The box is empty. Paste a menu, or load the sample, then jump to a tool.
            </p>
          )}
        </Panel>

        <section aria-labelledby="home-tools-heading">
          <h2 id="home-tools-heading" className="font-mono text-xs font-semibold tracking-[0.12em] uppercase">
            Open a tool
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Each tool reads the same pasted menu.</p>
          <ol className="mt-4 grid gap-3">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  aria-label={`${tool.action}. ${tool.description}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border-[1.5px] border-line bg-card p-4 transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg focus-visible:outline-offset-4"
                >
                  <span className="grid size-11 place-items-center rounded-md border-[1.5px] border-line bg-accent font-mono text-xl font-bold text-accent-foreground">
                    {tool.key}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-xl font-bold tracking-tight">{tool.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-muted-foreground">{tool.description}</span>
                  </span>
                  <ArrowRight
                    className="size-5 text-primary transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </section>
    </div>
  )
}
