"use client"

import Link from "next/link"
import { BufferActions, BufferField } from "@/components/buffer-controls"
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
      <div className="mx-auto w-full max-w-3xl px-4 pt-8">
        <Reading />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 sm:pt-12">
      <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance">
        Fit the menu before the gateway cuts it
      </h1>
      <p className="mt-4 max-w-[62ch] text-base leading-7 text-muted-foreground">
        Paste one USSD screen. See whether it is still GSM 7-bit, clean the characters a phone paste hides, and
        split it to the page budget. The same text is there when you open SMS.
      </p>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <BufferField id="home-text" />
        </div>
        <div className="w-full sm:w-44 sm:shrink-0">
          <BufferActions stacked />
        </div>
      </div>
      <div className="mt-4">
        <CounterStrip />
      </div>
      {state.text.length > 0 ? (
        <div className="mt-4">
          <Button asChild className="h-11 w-full sm:w-auto">
            <Link href="/ussd/paginate">Paginate this menu</Link>
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The box is empty. Paste a menu, or load the sample, then jump to a tool.
        </p>
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Card key={tool.href} className="h-full">
            <CardHeader>
              <CardTitle>{tool.title}</CardTitle>
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
    </div>
  )
}
