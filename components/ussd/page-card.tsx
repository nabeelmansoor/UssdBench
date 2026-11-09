"use client"

import { CopyButton } from "@/components/copy-button"
import { Callout, Panel } from "@/components/tool-frame"
import { Button } from "@/components/ui/button"
import { LRE, PDF, RLE, unwrapPage } from "@/lib/direction"
import { ENCODING_LABEL, ENCODING_UNIT, octetsFor, type Encoding } from "@/lib/encoding"
import { copyUssdPage, type UssdPage } from "@/lib/ussd-pagination"

function MarkChip({ mark }: { mark: string }) {
  const label = mark === RLE ? "RLE" : mark === LRE ? "LRE" : "PDF"
  const cp = mark === RLE ? "U+202B" : mark === LRE ? "U+202A" : "U+202C"
  return (
    <span
      title={`${label} ${cp}`}
      className="mx-0.5 inline-flex items-center rounded border border-line bg-accent px-1 align-baseline font-mono text-[0.65rem] font-bold text-accent-foreground"
    >
      {label}
    </span>
  )
}

export function PageText({ page, rtl }: { page: UssdPage; rtl: boolean }) {
  const { text, direction } = unwrapPage(page.text)
  const open = direction === "rtl" ? RLE : direction === "ltr" ? LRE : null
  return (
    <pre
      dir={rtl ? "rtl" : "ltr"}
      className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm leading-6 whitespace-pre-wrap"
    >
      {open ? <MarkChip mark={open} /> : null}
      {text}
      {open ? <MarkChip mark={PDF} /> : null}
    </pre>
  )
}

export function pageStats(page: UssdPage, encoding: Encoding): string {
  const marks = page.directionMarks > 0 ? ` · incl. ${page.directionMarks} direction marks` : ""
  return `${page.cost} / ${page.limit} ${ENCODING_UNIT[encoding]}${marks} · ${octetsFor(page.cost, encoding)} octets · ${ENCODING_LABEL[encoding]}`
}

export function UssdPageCard({
  page,
  index,
  total,
  encoding,
  rtl,
  active,
  lineBreak,
  register,
  onShow,
}: {
  page: UssdPage
  index: number
  total: number
  encoding: Encoding
  rtl: boolean
  active: boolean
  lineBreak: "lf" | "cr"
  register: (node: HTMLElement | null) => void
  onShow: () => void
}) {
  return (
    <div ref={register} data-page-index={index} className="scroll-mt-24">
      <Panel
        active={active}
        title={`Page ${index + 1} of ${total}`}
        note={<span className="font-mono text-xs">{pageStats(page, encoding)}</span>}
      >
        {page.splitWord ? (
          <Callout tone="warning">A word is longer than a page, so it is cut between characters here.</Callout>
        ) : null}
        {page.paddingRisk ? (
          <Callout tone="warning">
            This page is {page.cost} septets, one below a multiple of 8. Some handsets pad that length with a carriage
            return, which can show up as an extra blank line.
          </Callout>
        ) : null}
        {page.clashes.map((clash) => (
          <Callout key={`${clash.which}-${clash.line}`} tone="danger">
            Reply key {clash.key} is already used by “{clash.line}”, and this page also offers it for{" "}
            {clash.which === "next" ? "Next" : "Back"}.
          </Callout>
        ))}
        <PageText page={page} rtl={rtl} />
        {page.continues ? (
          <p className="text-xs text-muted-foreground">This line continues on page {index + 2}.</p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant={active ? "default" : "outline"}
            className="h-11 w-full sm:w-auto"
            aria-pressed={active}
            onClick={onShow}
          >
            {active ? "On the phone" : "Show on phone"}
          </Button>
          <CopyButton text={copyUssdPage(page, lineBreak)} label={`Copy page ${index + 1}`} />
        </div>
      </Panel>
    </div>
  )
}
