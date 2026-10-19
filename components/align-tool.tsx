"use client"

import { useMemo } from "react"
import { alignText, alignedCopy, setLineDirection, type AlignMode } from "@/lib/align"
import { BufferActions, BufferField } from "@/components/buffer-controls"
import { CopyButton } from "@/components/copy-button"
import { CounterStrip } from "@/components/counter-strip"
import { PhonePreview } from "@/components/phone-preview"
import { Callout, Reading, ToolCanvas, ToolIntro, actionButtonClass } from "@/components/tool-frame"
import { WidthControl } from "@/components/width-control"
import { Button } from "@/components/ui/button"
import { formatCodePoint } from "@/lib/names"
import { useSession } from "@/lib/session"

const EDGES: Array<{ mode: AlignMode; label: string }> = [
  { mode: "left", label: "Left" },
  { mode: "center", label: "Center" },
  { mode: "right", label: "Right" },
]

function marked(line: string): string {
  return line.replaceAll("\u202A", "[LRE]").replaceAll("\u202B", "[RLE]").replaceAll("\u202C", "[PDF]")
}

export function AlignTool() {
  const { state, ready, update } = useSession()
  const lines = useMemo(
    () => alignText(state.text, state.width, state.alignMode),
    [state.text, state.width, state.alignMode],
  )
  const aligned = useMemo(() => alignedCopy(lines, state.lineBreak), [lines, state.lineBreak])

  if (!ready) {
    return (
      <>
        <ToolIntro title="Align" lede="Pad lines to the width you set, and force direction per line." />
        <ToolCanvas>
          <Reading />
        </ToolCanvas>
      </>
    )
  }

  return (
    <>
      <ToolIntro
        title="Align"
        lede="Pad lines to a shared column width, and force a mixed line right to left or left to right."
      />
      <ToolCanvas>
        <CounterStrip />
        <BufferField id="align-text" />
        <div className="grid gap-3">
          <p className="text-sm font-medium">Edge</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {EDGES.map((edge) => (
              <Button
                key={edge.mode}
                type="button"
                className="h-11 w-full sm:w-auto"
                variant={state.alignMode === edge.mode ? "default" : "outline"}
                aria-pressed={state.alignMode === edge.mode}
                onClick={() => update({ alignMode: edge.mode })}
              >
                {edge.label}
              </Button>
            ))}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Centered text that cannot be even puts the extra column on the right. A line that is already wider than the
            width is left unchanged.
          </p>
        </div>
        <BufferActions copyLabel="Copy text" />
        <div className="grid gap-5">
          <WidthControl showAmbiguous />
          <PhonePreview
            lines={lines.map((line) => line.text)}
            width={state.width}
            empty={state.text.length === 0}
            meta={state.text.length === 0 ? undefined : `${state.width} columns · padded ${state.alignMode}`}
          />
          {state.text.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Paste a menu, or load the sample. The phone stays blank until there is text.
            </p>
          ) : (
            <div className="grid gap-3">
              {lines.map((line, index) => (
                <div key={line.lineNumber} className="grid gap-2 rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">Line {line.lineNumber}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {line.columns} columns
                      {line.overflow ? ` · wider than ${state.width}` : ""}
                      {line.direction === "rtl" ? " · right to left" : ""}
                      {line.direction === "ltr" ? " · left to right" : ""}
                    </p>
                  </div>
                  <pre className="overflow-x-auto font-mono text-sm leading-6 whitespace-pre-wrap">{marked(line.source)}</pre>
                  {line.overflow ? (
                    <Callout tone="warning">This line is wider than {state.width} columns, so it is not padded.</Callout>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      variant={line.direction === "rtl" ? "default" : "outline"}
                      className="h-10 w-full sm:w-auto"
                      aria-pressed={line.direction === "rtl"}
                      onClick={() => update({ text: setLineDirection(state.text, index, "rtl") })}
                    >
                      Right to left
                    </Button>
                    <Button
                      type="button"
                      variant={line.direction === "ltr" ? "default" : "outline"}
                      className="h-10 w-full sm:w-auto"
                      aria-pressed={line.direction === "ltr"}
                      onClick={() => update({ text: setLineDirection(state.text, index, "ltr") })}
                    >
                      Left to right
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full sm:w-auto"
                      disabled={line.direction === null}
                      onClick={() => update({ text: setLineDirection(state.text, index, "clear") })}
                    >
                      Clear direction
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  className={actionButtonClass}
                  onClick={() => update({ text: lines.map((line) => line.text).join("\n") })}
                >
                  Write padding into the text
                </Button>
                <CopyButton text={aligned} label="Copy aligned text" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Copy aligned text copies the padded result, including direction marks. The menu in the box changes only
                when you write the padding back, or when you force a direction. Forcing the same direction again does
                not add a second pair. {formatCodePoint(0x202b)} and {formatCodePoint(0x202a)} each close with{" "}
                {formatCodePoint(0x202c)}.
              </p>
            </div>
          )}
        </div>
      </ToolCanvas>
    </>
  )
}
