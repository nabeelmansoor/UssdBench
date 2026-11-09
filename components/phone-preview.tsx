"use client"

import { useId } from "react"
import { cn } from "cn"
import { layoutPhoneLine, type PhoneDirection } from "@/lib/bidi"
import { PHONE_COLUMN_RANGE, PHONE_DEFAULT_COLUMNS, useSession, type PhoneKind } from "@/lib/session"

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"]

function PhoneControls() {
  const { state, updatePhone } = useSession()
  const id = useId()
  const { kind } = state.phone
  const columns = kind === "smartphone" ? state.phone.smartphoneColumns : state.phone.featureColumns
  const setColumns = (value: number) =>
    updatePhone(kind === "smartphone" ? { smartphoneColumns: value } : { featureColumns: value })

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-lcd-dim/60 px-2 py-1.5 font-mono text-[0.65rem] font-bold tracking-wide uppercase">
      <div role="group" aria-label="Phone type" className="flex overflow-hidden rounded border border-lcd-foreground/70">
        {(["smartphone", "feature"] as PhoneKind[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={kind === option}
            onClick={() => updatePhone({ kind: option })}
            className={cn(
              "px-1.5 py-0.5",
              kind === option ? "bg-lcd-foreground text-lcd" : "text-lcd-foreground hover:bg-lcd-foreground/10",
            )}
          >
            {option === "smartphone" ? "Smartphone" : "Feature"}
          </button>
        ))}
      </div>
      <label htmlFor={`${id}-cols`} className="flex items-center gap-1 text-lcd-foreground">
        Cols
        <input
          id={`${id}-cols`}
          type="number"
          inputMode="numeric"
          min={PHONE_COLUMN_RANGE.min}
          max={PHONE_COLUMN_RANGE.max}
          value={columns}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isInteger(next) && next >= PHONE_COLUMN_RANGE.min && next <= PHONE_COLUMN_RANGE.max) setColumns(next)
          }}
          className="h-6 w-11 rounded border border-lcd-foreground/70 bg-transparent px-1 text-center font-mono text-[0.7rem] text-lcd-foreground focus-visible:outline-lcd-foreground"
          aria-describedby={`${id}-cols-hint`}
        />
        <span id={`${id}-cols-hint`} className="sr-only">
          Default {PHONE_DEFAULT_COLUMNS[kind]} columns for a {kind === "smartphone" ? "smartphone" : "feature phone"}.
        </span>
      </label>
    </div>
  )
}

export function PhonePreview({
  lines,
  direction = "auto",
  meta,
  label = "USSD",
  empty = false,
}: {
  lines: string[]
  direction?: PhoneDirection
  meta?: string
  label?: string
  empty?: boolean
}) {
  const { state } = useSession()
  const kind = state.phone.kind
  const width = kind === "smartphone" ? state.phone.smartphoneColumns : state.phone.featureColumns
  const wrapped = lines.map((line) => {
    const layout = layoutPhoneLine(line, width, direction)
    return { ...layout, blank: layout.rows.length === 0 }
  })
  const wideLines = wrapped.flatMap((line, index) => (line.columns > width ? [index + 1] : []))
  const smartphone = kind === "smartphone"

  return (
    <figure className="w-full max-w-full">
      <div
        className={cn(
          "mx-auto w-fit max-w-full border-[1.5px] border-line bg-phone text-white shadow-hard-lg",
          smartphone ? "rounded-[2.5rem] p-3" : "rounded-[2.25rem] p-3.5",
        )}
      >
        <div
          className={cn("mx-auto mb-3 rounded-full bg-black/45", smartphone ? "h-4 w-20" : "h-1.5 w-14")}
          aria-hidden="true"
        />
        <div className={cn("bg-bezel p-2", smartphone ? "rounded-[1.75rem]" : "rounded-2xl")}>
          <div
            className={cn(
              "lcd-grid max-w-full overflow-x-auto bg-lcd text-lcd-foreground",
              smartphone ? "rounded-[1.35rem]" : "rounded-lg",
            )}
            aria-label={`Phone preview, ${smartphone ? "smartphone" : "feature phone"}, ${width} columns`}
            role="group"
          >
            <PhoneControls />
            <div
              className="flex items-center justify-between px-3 pt-1.5 font-mono text-[0.62rem] font-bold tracking-widest text-lcd-dim uppercase"
              aria-hidden="true"
            >
              <span className="flex items-end gap-0.5">
                <i className="block h-1 w-1 bg-current" />
                <i className="block h-2 w-1 bg-current" />
                <i className="block h-3 w-1 bg-current" />
                <i className="block h-4 w-1 bg-current" />
              </span>
              <span>{label}</span>
              <span className="block h-2.5 w-5 border border-current p-px">
                <i className="block h-full w-3/4 bg-current" />
              </span>
            </div>
            <div className={cn("px-3 py-3", smartphone ? "min-h-64" : "min-h-44")}>
              {empty ? (
                <p className="px-2 py-10 text-center font-mono text-sm text-lcd-dim" style={{ width: `${width}ch`, maxWidth: "100%" }}>
                  The screen stays blank until there is text.
                </p>
              ) : (
                <div dir="ltr" className="font-mono text-[0.72rem] leading-snug sm:text-xs" style={{ width: `${width}ch` }}>
                  {wrapped.map((line, index) =>
                    line.blank ? (
                      <div key={index} className="h-[1.35em]" />
                    ) : (
                      line.rows.map((row, rowIndex) => (
                        <div
                          key={`${index}-${rowIndex}`}
                          className="grid"
                          dir="ltr"
                          style={{ gridTemplateColumns: `repeat(${width}, 1ch)` }}
                        >
                          {row.map((unit, unitIndex) => (
                            <span
                              key={unitIndex}
                              dir="ltr"
                              style={{ gridColumn: `${unit.column + 1} / span ${Math.max(1, unit.cols)}` }}
                              className={unit.emoji ? "font-bold text-lcd-alert underline decoration-wavy" : undefined}
                              title={unit.emoji ? "Unsafe on a USSD handset. Wider than one GSM character." : undefined}
                            >
                              {unit.text}
                            </span>
                          ))}
                        </div>
                      ))
                    ),
                  )}
                </div>
              )}
              {meta ? (
                <p className="mt-3 border-t border-dashed border-lcd-dim/60 pt-2 font-mono text-[0.65rem] leading-4 font-semibold text-lcd-dim">
                  {meta}
                </p>
              ) : null}
            </div>
            {smartphone ? (
              <div
                className="grid grid-cols-2 border-t border-dashed border-lcd-dim/60 font-mono text-[0.7rem] font-bold tracking-wider text-lcd-foreground uppercase"
                aria-hidden="true"
              >
                <span className="border-r border-dashed border-lcd-dim/60 py-2 text-center">Cancel</span>
                <span className="py-2 text-center">Send</span>
              </div>
            ) : null}
          </div>
        </div>
        {smartphone ? (
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-white/50" aria-hidden="true" />
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between px-1 font-mono text-[0.7rem] font-bold tracking-wider uppercase" aria-hidden="true">
              <span className="rounded-full bg-phone-key px-3 py-1">Cancel</span>
              <span className="size-6 rounded-full border-2 border-white/60" />
              <span className="rounded-full bg-phone-key px-3 py-1">Send</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5 [@media(max-height:860px)]:hidden" aria-hidden="true">
              {KEYS.map((key) => (
                <span key={key} className="grid h-7 place-items-center rounded-md bg-phone-key font-mono text-xs font-bold">
                  {key}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
      <figcaption className="mt-4 space-y-1 text-sm leading-6 text-muted-foreground">
        <p>Preview only. It is not a claim about a particular handset.</p>
        {wideLines.length > 0 ? (
          <p className="font-medium text-warn-foreground">
            {wideLines.length === 1
              ? `Line ${wideLines[0]} is wider than ${width} columns. The phone shows where it wraps.`
              : `Lines ${wideLines.join(", ")} are wider than ${width} columns. The phone shows where they wrap.`}
          </p>
        ) : null}
      </figcaption>
    </figure>
  )
}
