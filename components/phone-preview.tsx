"use client"

import { lineDirection, stripDirectionMarks } from "@/lib/text"
import { displayColumns, walkWidth, wrapUnits, type WidthUnit } from "@/lib/width"

function coalesce(row: WidthUnit[]): WidthUnit[] {
  const visible: WidthUnit[] = []
  let leading = ""
  for (const unit of row) {
    if (unit.cols === 0) {
      if (visible.length === 0) leading += unit.text
      else visible[visible.length - 1] = { ...visible[visible.length - 1]!, text: visible[visible.length - 1]!.text + unit.text }
      continue
    }
    visible.push({ ...unit, text: leading + unit.text })
    leading = ""
  }
  if (leading && visible.length > 0) {
    const last = visible[visible.length - 1]!
    visible[visible.length - 1] = { ...last, text: last.text + leading }
  }
  return visible
}

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
    const direction = lineDirection(line)
    const shown = stripDirectionMarks(line)
    const columns = displayColumns(shown)
    const rows = shown.length === 0 ? [] : wrapUnits(walkWidth(shown), width).map(coalesce)
    return { direction, columns, rows, blank: shown.length === 0 }
  })
  const wideLines = wrapped.flatMap((line, index) => (line.columns > width ? [index + 1] : []))

  return (
    <figure className="w-full max-w-full">
      <div className="mx-auto w-fit max-w-full rounded-[1.75rem] bg-[#1b1a17] p-3 shadow-md dark:bg-black">
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/20" aria-hidden="true" />
        <div
          className="max-w-full overflow-x-auto rounded-xl bg-[#102418] px-3 py-3 text-[#d7f5d4]"
          aria-label={`Phone preview, ${width} columns`}
        >
          {empty ? (
            <p className="min-w-40 px-2 py-10 text-center text-sm text-[#d7f5d4]/70">
              The screen stays blank until there is text.
            </p>
          ) : (
            <div className="font-mono text-[0.72rem] leading-snug sm:text-xs" style={{ width: `${width}ch` }}>
              {wrapped.map((line, index) =>
                line.blank ? (
                  <div key={index} className="h-[1.35em]" />
                ) : (
                  <div key={index} dir={line.direction === "rtl" ? "rtl" : "ltr"}>
                    {line.rows.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid"
                        style={{ gridTemplateColumns: `repeat(${width}, 1ch)` }}
                      >
                        {row.map((unit, unitIndex) => (
                          <span
                            key={unitIndex}
                            style={{ gridColumn: `span ${Math.max(1, unit.cols)}` }}
                            className={unit.emoji ? "text-[#f3d48a] underline decoration-wavy decoration-[#f3d48a]" : undefined}
                            title={unit.emoji ? "Unsafe on a USSD handset. Wider than one GSM character." : undefined}
                          >
                            {unit.text}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                ),
              )}
            </div>
          )}
          {meta ? (
            <p className="mt-2 border-t border-[#d7f5d4]/20 pt-2 font-mono text-[0.65rem] leading-4 text-[#d7f5d4]/80">
              {meta}
            </p>
          ) : null}
        </div>
        <div className="mx-auto mt-2 h-8 w-8 rounded-full border border-white/15" aria-hidden="true" />
      </div>
      <figcaption className="mt-3 space-y-1 text-sm leading-6 text-muted-foreground">
        <p>Preview only. It is not a claim about a particular handset.</p>
        {wideLines.length > 0 ? (
          <p className="text-amber-900 dark:text-amber-100">
            {wideLines.length === 1
              ? `Line ${wideLines[0]} is wider than ${width} columns. The phone shows where it wraps.`
              : `Lines ${wideLines.join(", ")} are wider than ${width} columns. The phone shows where they wrap.`}
          </p>
        ) : null}
      </figcaption>
    </figure>
  )
}
