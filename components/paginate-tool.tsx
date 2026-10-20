"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { BufferEditor } from "@/components/buffer-controls"
import { CollapsiblePanel } from "@/components/collapsible-panel"
import { ToolWorkLayout } from "@/components/tool-work-layout"
import { CopyButton } from "@/components/copy-button"
import { CounterStrip } from "@/components/counter-strip"
import { PhonePreview } from "@/components/phone-preview"
import { Callout, Panel, Reading, ToolCanvas, ToolIntro } from "@/components/tool-frame"
import { WidthControl } from "@/components/width-control"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { gsmSeptetBudget, ucs2CharacterBudget } from "@/lib/gsm"
import { formatCodePoint } from "@/lib/names"
import { composeReply, isReplyKey } from "@/lib/text"
import { copyPage, copyPages, paginate, type PageModel } from "@/lib/paginate"
import { useSession } from "@/lib/session"

function visibleLine(line: string): string {
  const shown = line.replaceAll("\u202A", "[LRE]").replaceAll("\u202B", "[RLE]").replaceAll("\u202C", "[PDF]")
  return shown.length <= 80 ? shown : `${shown.slice(0, 77)}...`
}

function overflowCopy(page: PageModel): string {
  const overflow = page.overflow
  if (!overflow) return ""
  const unit = overflow.encoding === "gsm" ? "septets" : "UCS-2 characters"
  const marks =
    overflow.directionMarks > 0
      ? `, including ${overflow.directionMarks} direction mark${overflow.directionMarks === 1 ? "" : "s"}`
      : ""
  const quoted = `“${visibleLine(overflow.line)}”`
  const size = `It is ${overflow.units} ${unit}${marks}, and the limit is ${overflow.limit}.`
  if (overflow.lineNumber === 0) {
    return `The navigation line ${quoted} does not fit within the page size limit. ${size} The menu is split below without those lines.`
  }
  if (overflow.reason === "nav") {
    return `Line ${overflow.lineNumber} ${quoted} does not fit once the navigation line is reserved. ${size}`
  }
  return `Line ${overflow.lineNumber} ${quoted} does not fit within the page size limit. ${size}`
}

function causeWhere(page: PageModel): string {
  if (!page.ucs2Cause) return ""
  return page.ucs2Cause.lineNumber === null ? "on the navigation line" : `on line ${page.ucs2Cause.lineNumber}`
}

function ucs2Copy(page: PageModel, budgetOctets: number): string | null {
  if (page.overflow || page.analysis.encoding !== "ucs2" || !page.ucs2Cause) return null
  const cause = page.ucs2Cause
  const named = `${cause.name} (${formatCodePoint(cause.cp)}) ${causeWhere(page)}`
  const limit = ucs2CharacterBudget(budgetOctets)
  const gsm = gsmSeptetBudget(budgetOctets)
  if (page.singleCharacterCause) {
    return `This page is UCS-2 because of one character: ${named}. The page size limit is ${limit} characters, not ${gsm} septets.`
  }
  if (page.analysis.nonGsmAllDirection) {
    return `This page is UCS-2 because of direction marks. The first is ${named}. Each mark is one of the ${limit} characters and adds no columns.`
  }
  return `This page is UCS-2 because it contains characters outside GSM 7-bit. The first is ${named}. The page size limit is ${limit} characters, not ${gsm} septets.`
}

function pageStats(page: PageModel): string {
  if (page.analysis.encoding === "gsm") {
    return `${page.analysis.characters} characters · ${page.analysis.septets} septets · ${page.analysis.octets} octets · GSM 7-bit`
  }
  return `${page.analysis.utf16Units} UCS-2 characters · ${page.analysis.octets} octets · UCS-2`
}

function PaginationHelp() {
  return (
    <>
      <h3>Why a page is cut in the middle of a word</h3>
      <p>
        A gateway that receives more than its octet limit drops or cuts the reply. The cut is not obliged to land on a
        space. Pagination keeps an explicit line break, refuses to break a numbered option, and keeps a line that opens
        with a direction mark and closes with PDF on one page.
      </p>
      <h3>Next and Back use the same page size limit</h3>
      <p>
        On a real session the handset answers with a reply such as 99. That line is part of the string, so the body is
        shortened until the navigation fits. Without links is for networks that already append their own More and Back.
      </p>
      <h3>The carriage-return pad</h3>
      <p>
        If a GSM page has a septet count one below a multiple of eight, some handsets pad with a carriage return, which
        can show as an extra blank line. Copied pages use a line feed unless you choose a carriage return.
      </p>
    </>
  )
}

export function PaginateTool() {
  const { state, ready, update } = useSession()
  const [selected, setSelected] = useState(0)
  const phoneRef = useRef<HTMLDivElement>(null)
  const nextOk = isReplyKey(state.nextKey)
  const backOk = isReplyKey(state.backKey)
  const keysOk = nextOk && backOk
  const nextLine = composeReply(state.nextKey, state.nextSep, state.nextLabel)
  const backLine = composeReply(state.backKey, state.backSep, state.backLabel)
  const gsmLimit = gsmSeptetBudget(state.budgetOctets)
  const ucs2Limit = ucs2CharacterBudget(state.budgetOctets)

  const pages = useMemo(
    () =>
      paginate(state.text, {
        budgetOctets: state.budgetOctets,
        withLinks: state.withLinks && keysOk,
        nextLine,
        backLine,
        nextKey: state.nextKey,
        backKey: state.backKey,
      }),
    [state.text, state.budgetOctets, state.withLinks, keysOk, nextLine, backLine, state.nextKey, state.backKey],
  )

  if (!ready) {
    return (
      <>
        <ToolIntro title="Paginate" lede="Split one screen so each page fits the octet budget." />
        <ToolCanvas>
          <Reading />
        </ToolCanvas>
      </>
    )
  }

  const index = pages.length === 0 ? 0 : Math.min(selected, pages.length - 1)
  const current = pages[index]
  const phoneLines = current ? [...current.bodyLines, ...current.navLines] : []
  const phoneMeta = current
    ? current.overflow
      ? "Does not fit"
      : current.analysis.encoding === "gsm"
        ? `Page ${index + 1} of ${pages.length} · GSM · ${current.analysis.septets} septets · ${current.analysis.octets} octets`
        : `Page ${index + 1} of ${pages.length} · UCS-2 · ${current.analysis.utf16Units} characters · ${current.analysis.octets} octets`
    : undefined

  return (
    <>
      <ToolIntro
        title="Paginate"
        lede="Split one screen so each page fits the page size limit, with Next and Back or without them."
      />
      <ToolWorkLayout
        main={
          <>
        <CounterStrip />
        <Panel title="Menu text" note="Buffer">
          <BufferEditor id="paginate-text" />
        </Panel>
        <Panel title="Page size limit">
          <div className="grid gap-4 sm:grid-cols-[9rem_1fr] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="budget" className="font-semibold">Page size limit</Label>
              <Input
                id="budget"
                type="number"
                min={1}
                max={2000}
                inputMode="numeric"
                value={state.budgetOctets}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  if (Number.isInteger(next) && next >= 1 && next <= 2000) update({ budgetOctets: next })
                }}
                className="h-10 font-mono"
                aria-describedby="budget-hint"
              />
              <p id="budget-hint" className="text-xs leading-5 text-muted-foreground">
                In octets (160 = typical USSD cap).
              </p>
            </div>
            <div className="grid gap-2">
              <Button
                type="button"
                variant={state.budgetOctets === 160 ? "default" : "outline"}
                className="h-10 w-full sm:w-fit"
                aria-pressed={state.budgetOctets === 160}
                onClick={() => update({ budgetOctets: 160 })}
              >
                Vodafone Qatar · 160 octets
              </Button>
              <p className="text-sm leading-6 text-muted-foreground">
                {state.budgetOctets} octets hold {gsmLimit} GSM septets or {ucs2Limit} UCS-2 characters.
                {state.budgetOctets === 160
                  ? " Vodafone Qatar does not publish a USSD cap, so the preset keeps this ceiling."
                  : " This is no longer the Vodafone Qatar preset. That preset is 160 octets."}
              </p>
            </div>
          </div>
          <div className="segmented">
            <Button
              type="button"
              className="h-11"
              variant={state.withLinks ? "default" : "outline"}
              aria-pressed={state.withLinks}
              onClick={() => update({ withLinks: true })}
            >
              With Next and Back
            </Button>
            <Button
              type="button"
              className="h-11"
              variant={state.withLinks ? "outline" : "default"}
              aria-pressed={!state.withLinks}
              onClick={() => update({ withLinks: false })}
            >
              Without links
            </Button>
          </div>
          {state.withLinks ? (
            <div className="grid gap-4">
              <ReplyFields
                legend="Next"
                keyValue={state.nextKey}
                separator={state.nextSep}
                label={state.nextLabel}
                composed={nextLine}
                valid={nextOk}
                onKey={(value) => update({ nextKey: value })}
                onSeparator={(value) => update({ nextSep: value })}
                onLabel={(value) => update({ nextLabel: value })}
              />
              <ReplyFields
                legend="Back"
                keyValue={state.backKey}
                separator={state.backSep}
                label={state.backLabel}
                composed={backLine}
                valid={backOk}
                onKey={(value) => update({ backKey: value })}
                onSeparator={(value) => update({ backSep: value })}
                onLabel={(value) => update({ backLabel: value })}
              />
              {keysOk && state.nextKey === state.backKey ? (
                <p className="text-sm font-medium text-destructive">Next and Back use the same reply key.</p>
              ) : null}
              {!keysOk ? (
                <p className="text-sm font-medium text-destructive">
                  Next and Back stay off until both reply keys are digits, #, or *.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Use this when the network already paginates. No navigation lines are added, so the body keeps the room
              those lines would have used.
            </p>
          )}
          <fieldset className="grid gap-2 border-t border-border pt-4">
            <legend className="mb-1 px-0 text-sm font-semibold">Line break in copied pages</legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="line-break"
                  className="size-4 accent-primary"
                  checked={state.lineBreak === "lf"}
                  onChange={() => update({ lineBreak: "lf" })}
                />
                Line feed (LF)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="line-break"
                  className="size-4 accent-primary"
                  checked={state.lineBreak === "cr"}
                  onChange={() => update({ lineBreak: "cr" })}
                />
                Carriage return (CR)
              </label>
            </div>
          </fieldset>
        </Panel>
        <Panel title="Phone width">
          <WidthControl />
        </Panel>
        <CollapsiblePanel title="How pagination works">
          <PaginationHelp />
        </CollapsiblePanel>
          {state.text.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">Paste a menu, or load the sample, to build pages.</p>
          ) : (
            <div ref={phoneRef} className="grid gap-3 lg:hidden">
              <p className="kicker">Phone preview</p>
              <PhonePreview lines={phoneLines} width={state.width} meta={phoneMeta} empty={false} />
            </div>
          )}
          {state.text.length === 0 ? null : (
            <div className="grid gap-5">
              {pages.map((page, pageIndex) => {
                const warning = ucs2Copy(page, state.budgetOctets)
                const active = pageIndex === index
                return (
                  <Panel
                    key={pageIndex}
                    active={active}
                    title={page.overflow ? `Page ${pageIndex + 1} does not fit` : `Page ${pageIndex + 1}`}
                    note={<span className="font-mono text-xs">{pageStats(page)}</span>}
                  >
                    {page.overflow ? <Callout tone="danger">{overflowCopy(page)}</Callout> : null}
                    {warning ? (
                      <Callout tone="warning">
                        <p>{warning}</p>
                        <Link href="/ussd/characters#ucs2-cause" className="underline underline-offset-4">
                          See it in the character list
                        </Link>
                      </Callout>
                    ) : null}
                    {page.paddingWarning ? (
                      <Callout tone="warning">
                        This page is {page.analysis.septets} septets, one below a multiple of 8. Some handsets pad that
                        length with a carriage return, which can show up as an extra blank line.
                      </Callout>
                    ) : null}
                    {page.clashes.map((clash) => (
                      <Callout key={`${clash.which}-${clash.lineNumber}`} tone="danger">
                        Reply key {clash.key} is already used on line {clash.lineNumber}. The check looks at the key
                        only.
                      </Callout>
                    ))}
                    <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm leading-6 whitespace-pre-wrap">
                      {page.text}
                    </pre>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button
                        type="button"
                        variant={active ? "default" : "outline"}
                        className="h-11 w-full sm:w-auto"
                        onClick={() => {
                          setSelected(pageIndex)
                          if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
                            phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
                          }
                        }}
                      >
                        Preview on phone
                      </Button>
                      <CopyButton
                        text={page.overflow ? "" : copyPage(page, state.lineBreak)}
                        label={page.overflow ? "Nothing to copy" : `Copy page ${pageIndex + 1}`}
                        disabled={page.overflow !== null}
                      />
                    </div>
                  </Panel>
                )
              })}
              <CopyButton text={copyPages(pages, state.lineBreak)} label="Copy all pages" />
              <p className="text-sm leading-6 text-muted-foreground">
                Copy all pages puts a blank line between pages and uses {state.lineBreak === "cr" ? "carriage returns" : "line feeds"}.
                Direction marks in the text are included.
              </p>
            </div>
          )}
          </>
        }
        aside={
          state.text.length > 0 ? (
            <PhonePreview lines={phoneLines} width={state.width} meta={phoneMeta} empty={false} />
          ) : (
            <p className="rounded-md border border-dashed border-line p-4 text-sm leading-6 text-muted-foreground">
              Paste a menu to see the phone preview here while you work through pages.
            </p>
          )
        }
      />
    </>
  )
}

function ReplyFields({
  legend,
  keyValue,
  separator,
  label,
  composed,
  valid,
  onKey,
  onSeparator,
  onLabel,
}: {
  legend: string
  keyValue: string
  separator: string
  label: string
  composed: string
  valid: boolean
  onKey: (value: string) => void
  onSeparator: (value: string) => void
  onLabel: (value: string) => void
}) {
  const keyId = `${legend}-key`
  const sepId = `${legend}-sep`
  const labelId = `${legend}-label`
  return (
    <fieldset className="grid gap-2 border-t border-border pt-4">
      <legend className="mb-1 px-0 text-sm font-semibold">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor={keyId}>Reply key</Label>
          <Input
            id={keyId}
            value={keyValue}
            onChange={(event) => onKey(event.target.value)}
            aria-invalid={!valid}
            className="h-10 font-mono"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={sepId}>Separator</Label>
          <Input id={sepId} value={separator} onChange={(event) => onSeparator(event.target.value)} className="h-10 font-mono" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={labelId}>Label</Label>
          <Input id={labelId} value={label} onChange={(event) => onLabel(event.target.value)} className="h-10 font-mono" />
        </div>
      </div>
      <p className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm">
        Line: {composed}
        {valid ? "" : " · use digits, #, or *"}
      </p>
    </fieldset>
  )
}
