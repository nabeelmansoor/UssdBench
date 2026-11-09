"use client"

import { EncodingBadge, LanguageTabs } from "@/components/language-tabs"
import { ToolWorkLayout } from "@/components/tool-work-layout"
import { Callout, Panel } from "@/components/tool-frame"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PagesList, usePagedPhone } from "@/components/ussd/pages-view"
import { defaultCharsPerPage, ENCODING_LABEL, ENCODING_UNIT } from "@/lib/encoding"
import { getLanguage } from "@/lib/languages"
import type { UssdState } from "@/lib/session"
import type { UssdDerived, UssdLanguage } from "@/lib/workflow"

export type LanguageUpdater = (code: string, patch: Partial<UssdLanguage>) => void

function ReplyFields({
  legend,
  idPrefix,
  keyValue,
  separator,
  label,
  composed,
  rtl,
  onKey,
  onSeparator,
  onLabel,
}: {
  legend: string
  idPrefix: string
  keyValue: string
  separator: string
  label: string
  composed: string
  rtl: boolean
  onKey: (value: string) => void
  onSeparator: (value: string) => void
  onLabel: (value: string) => void
}) {
  const valid = /^(?:\d+|[#*])$/.test(keyValue)
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 px-0 text-sm font-semibold">{legend}</legend>
      <div className="grid grid-cols-[5rem_5rem_1fr] gap-2">
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-key`}>Reply key</Label>
          <Input
            id={`${idPrefix}-key`}
            value={keyValue}
            onChange={(event) => onKey(event.target.value)}
            aria-invalid={!valid}
            className="h-10 font-mono"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-sep`}>Separator</Label>
          <Input
            id={`${idPrefix}-sep`}
            value={separator}
            onChange={(event) => onSeparator(event.target.value)}
            className="h-10 font-mono"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-label`}>Label</Label>
          <Input
            id={`${idPrefix}-label`}
            dir={rtl ? "rtl" : "ltr"}
            value={label}
            onChange={(event) => onLabel(event.target.value)}
            className="h-10 font-mono"
          />
        </div>
      </div>
      <p className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm" dir="auto">
        {composed}
        {valid ? "" : " · use digits, #, or *"}
      </p>
    </fieldset>
  )
}

export function PaginationStep({
  ussd,
  derived,
  onSettings,
  onLanguage,
  onActive,
}: {
  ussd: UssdState
  derived: Record<string, UssdDerived>
  onSettings: (patch: Partial<UssdState>) => void
  onLanguage: LanguageUpdater
  onActive: (code: string) => void
}) {
  const codes = ussd.languages.map((language) => language.code)
  const current = ussd.languages.find((language) => language.code === ussd.active) ?? ussd.languages[0]!
  const info = derived[current.code]!
  const language = getLanguage(current.code)
  const tracker = usePagedPhone(info, current.code)
  const defaultLimit = defaultCharsPerPage(info.encoding)

  return (
    <ToolWorkLayout
      main={
        <>
          <Panel title="Pagination" note="All languages">
            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset className="grid content-start gap-2">
                <legend className="mb-1 text-sm font-semibold">Mode</legend>
                <div className="segmented" role="group" aria-label="Mode">
                  {(["word", "line"] as const).map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      className="h-11"
                      variant={ussd.mode === mode ? "default" : "outline"}
                      aria-pressed={ussd.mode === mode}
                      onClick={() => onSettings({ mode })}
                    >
                      By {mode}
                    </Button>
                  ))}
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {ussd.mode === "word"
                    ? "Fills each page and breaks between words, even inside a line."
                    : "Keeps lines whole. A single line longer than a page is split at a word."}
                </p>
              </fieldset>
              <fieldset className="grid content-start gap-2">
                <legend className="mb-1 text-sm font-semibold">Navigation</legend>
                <div className="segmented" role="group" aria-label="Navigation">
                  <Button
                    type="button"
                    className="h-11"
                    variant={ussd.withLinks ? "default" : "outline"}
                    aria-pressed={ussd.withLinks}
                    onClick={() => onSettings({ withLinks: true })}
                  >
                    With Next and Back
                  </Button>
                  <Button
                    type="button"
                    className="h-11"
                    variant={ussd.withLinks ? "outline" : "default"}
                    aria-pressed={!ussd.withLinks}
                    onClick={() => onSettings({ withLinks: false })}
                  >
                    Without links
                  </Button>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {ussd.withLinks
                    ? "Next and Back lines count against the same page."
                    : "For networks that add their own More and Back."}
                </p>
              </fieldset>
            </div>
            <fieldset className="grid gap-2 border-t border-border pt-4">
              <legend className="mb-1 px-0 text-sm font-semibold">Line break in copied pages</legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
                {(["lf", "cr"] as const).map((lineBreak) => (
                  <label key={lineBreak} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="line-break"
                      className="size-4 accent-primary"
                      checked={ussd.lineBreak === lineBreak}
                      onChange={() => onSettings({ lineBreak })}
                    />
                    {lineBreak === "lf" ? "Line feed (LF)" : "Carriage return (CR)"}
                  </label>
                ))}
              </div>
            </fieldset>
          </Panel>

          <LanguageTabs
            codes={codes}
            active={current.code}
            onSelect={onActive}
            badge={(code) => {
              const pages = derived[code]?.pagination.pages.length ?? 0
              return <EncodingBadge label={`${pages} pg`} />
            }}
          >
            <div className="grid gap-1.5 sm:max-w-xs">
              <Label htmlFor={`cpp-${current.code}`} className="font-semibold">
                Characters per Page
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`cpp-${current.code}`}
                  type="number"
                  min={1}
                  max={2000}
                  inputMode="numeric"
                  value={info.charsPerPage}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    if (Number.isInteger(next) && next >= 1 && next <= 2000) {
                      onLanguage(current.code, { charsPerPage: next === defaultLimit ? null : next })
                    }
                  }}
                  className="h-10 w-28 font-mono"
                  aria-describedby={`cpp-hint-${current.code}`}
                />
                {current.charsPerPage !== null ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10"
                    onClick={() => onLanguage(current.code, { charsPerPage: null })}
                  >
                    Reset to {defaultLimit}
                  </Button>
                ) : null}
              </div>
              <p id={`cpp-hint-${current.code}`} className="text-xs leading-5 text-muted-foreground">
                In {ENCODING_UNIT[info.encoding]}. Default for {ENCODING_LABEL[info.encoding]} is {defaultLimit} (GSM-7 182,
                Latin-1 160, UCS-2 80).
              </p>
            </div>
            {info.direction !== "none" ? (
              <Callout>
                {language.name} pages are forced {info.direction === "rtl" ? "right to left" : "left to right"} in
                Alignment, so 2 of the {info.charsPerPage} characters on every page are{" "}
                {info.direction === "rtl" ? "RLE" : "LRE"} and PDF.
              </Callout>
            ) : null}

            {ussd.withLinks ? (
              <div className="grid gap-4 border-t border-border pt-4 xl:grid-cols-2">
                <ReplyFields
                  legend={`Next · ${language.name}`}
                  idPrefix={`next-${current.code}`}
                  keyValue={current.nextKey}
                  separator={current.nextSep}
                  label={current.nextLabel}
                  composed={info.nextLine}
                  rtl={language.rtl}
                  onKey={(value) => onLanguage(current.code, { nextKey: value })}
                  onSeparator={(value) => onLanguage(current.code, { nextSep: value })}
                  onLabel={(value) => onLanguage(current.code, { nextLabel: value })}
                />
                <ReplyFields
                  legend={`Back · ${language.name}`}
                  idPrefix={`back-${current.code}`}
                  keyValue={current.backKey}
                  separator={current.backSep}
                  label={current.backLabel}
                  composed={info.backLine}
                  rtl={language.rtl}
                  onKey={(value) => onLanguage(current.code, { backKey: value })}
                  onSeparator={(value) => onLanguage(current.code, { backSep: value })}
                  onLabel={(value) => onLanguage(current.code, { backLabel: value })}
                />
              </div>
            ) : null}
            {ussd.withLinks && !info.keysOk ? (
              <p className="text-sm font-medium text-destructive">
                Next and Back stay off until both reply keys are digits, #, or *.
              </p>
            ) : null}
            {ussd.withLinks && info.keysOk && current.nextKey === current.backKey ? (
              <p className="text-sm font-medium text-destructive">Next and Back use the same reply key.</p>
            ) : null}
            {info.navUnencodable.length > 0 ? (
              <Callout tone="danger">
                The navigation labels use {info.navUnencodable.join(" ")}, which {ENCODING_LABEL[info.encoding]} cannot
                hold.
              </Callout>
            ) : null}
            {info.pagination.error ? <Callout tone="danger">{info.pagination.error}</Callout> : null}

            <div className="lg:hidden">{tracker.phone}</div>
            <PagesList
              derived={info}
              code={current.code}
              lineBreak={ussd.lineBreak}
              visible={tracker.visible}
              setVisible={tracker.setVisible}
              register={tracker.register}
            />
          </LanguageTabs>
        </>
      }
      aside={<div className="hidden lg:block">{tracker.phone}</div>}
    />
  )
}
