"use client"

import { layoutPhoneLine } from "@/lib/bidi"

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"]

export function PhonePreview({
  lines,
  width,
  meta,
  empty,
}: {
  lines: string[]
  width: number
  meta?: string
  empty: boolean
}) {
  const wrapped = lines.map((line) => {
    const layout = layoutPhoneLine(line, width)
    return { ...layout, blank: layout.rows.length === 0 }
  })
  const wideLines = wrapped.flatMap((line, index) => (line.columns > width ? [index + 1] : []))

  return (
    <figure className="w-full max-w-full">
      <div className="mx-auto w-fit max-w-full rounded-[2.25rem] border-[1.5px] border-line bg-phone p-3.5 text-white shadow-hard-lg">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/45" aria-hidden="true" />
        <div className="rounded-2xl bg-bezel p-2">
          <div
            className="lcd-grid max-w-full overflow-x-auto rounded-lg bg-lcd text-lcd-foreground"
            aria-label={`Phone preview, ${width} columns`}
          >
            <div
              className="flex items-center justify-between border-b border-dashed border-lcd-dim/60 px-3 py-1 font-mono text-[0.62rem] font-bold tracking-widest text-lcd-dim uppercase"
              aria-hidden="true"
            >
              <span className="flex items-end gap-0.5">
                <i className="block h-1 w-1 bg-current" />
                <i className="block h-2 w-1 bg-current" />
                <i className="block h-3 w-1 bg-current" />
                <i className="block h-4 w-1 bg-current" />
              </span>
              <span>USSD</span>
              <span className="block h-2.5 w-5 border border-current p-px">
                <i className="block h-full w-3/4 bg-current" />
              </span>
            </div>
            <div className="px-3 py-3">
              {empty ? (
                <p className="min-w-40 px-2 py-10 text-center font-mono text-sm text-lcd-dim">
                  The screen stays blank until there is text.
                </p>
              ) : (
                <div
                  dir="ltr"
                  className="font-mono text-[0.72rem] leading-snug sm:text-xs"
                  style={{ width: `${width}ch` }}
                >
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
                              className={
                                unit.emoji
                                  ? "font-bold text-lcd-alert underline decoration-wavy"
                                  : undefined
                              }
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
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between px-1 font-mono text-[0.7rem] font-bold tracking-wider uppercase" aria-hidden="true">
          <span className="rounded-full bg-phone-key px-3 py-1">Cancel</span>
          <span className="size-6 rounded-full border-2 border-white/60" />
          <span className="rounded-full bg-phone-key px-3 py-1">Send</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 [@media(max-height:860px)]:hidden" aria-hidden="true">
          {KEYS.map((key) => (
            <span
              key={key}
              className="grid h-7 place-items-center rounded-md bg-phone-key font-mono text-xs font-bold"
            >
              {key}
            </span>
          ))}
        </div>
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
