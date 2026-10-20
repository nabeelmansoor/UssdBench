"use client"

import Link from "next/link"
import { BufferEditor } from "@/components/buffer-controls"
import { CounterStrip } from "@/components/counter-strip"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Reading } from "@/components/tool-frame"
import { useSession } from "@/lib/session"
import { TOOLS } from "@/lib/tools"

export function HomeScreen() {
  const { state, ready } = useSession()
  if (!ready) {
    return (
      <div className="page-shell pt-8">
        <Reading />
      </div>
    )
  }

  return (
    <div className="page-shell pt-8 pb-4 sm:pt-12">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">Shared buffer</p>
        <h1 className="mt-2 max-w-[20ch] text-4xl font-semibold tracking-tight text-balance sm:text-[2.35rem] sm:leading-tight">
          Fit the menu before the gateway cuts it
        </h1>
        <p className="mt-4 max-w-[62ch] text-base leading-7 text-muted-foreground">
          Paste one USSD screen. See whether it is still GSM 7-bit, clean the characters a phone paste hides, and
          split it to the page budget. The same text is there when you open SMS.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <BufferEditor id="home-text" />
        <div className="mt-5">
          <CounterStrip />
        </div>
        {state.text.length > 0 ? (
          <div className="mt-5">
            <Button asChild className="h-11 w-full sm:w-auto">
              <Link href="/ussd/paginate">Paginate this menu</Link>
            </Button>
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            The box is empty. Paste a menu, or load the sample, then jump to a tool.
          </p>
        )}
      </div>

      <section className="mt-12" aria-labelledby="home-tools-heading">
        <h2 id="home-tools-heading" className="text-sm font-semibold tracking-tight text-foreground">
          Open a tool
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Each tool reads the same pasted menu.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Card
              key={tool.href}
              className="h-full border-border/90 shadow-sm transition-[box-shadow,border-color] hover:border-primary/35 hover:shadow-md"
            >
              <CardHeader className="gap-2">
                <CardTitle className="text-base font-semibold">{tool.title}</CardTitle>
                <CardDescription className="text-sm leading-6">{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" className="h-10 w-full sm:w-auto">
                  <Link href={tool.href}>{tool.action}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
