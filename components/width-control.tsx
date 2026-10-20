"use client"

import { Button } from "@/components/ui/button"
import { useSession, type WidthRange } from "@/lib/session"

export function WidthControl({ showAmbiguous = false }: { showAmbiguous?: boolean }) {
  const { state, update } = useSession()
  const min = state.widthRange === "feature" ? 16 : 30
  const max = state.widthRange === "feature" ? 24 : 48

  const choose = (range: WidthRange) => update({ widthRange: range })

  return (
    <div className="grid gap-3">
      <div className="segmented">
        <Button
          type="button"
          className="h-11 px-3"
          variant={state.widthRange === "feature" ? "default" : "outline"}
          aria-pressed={state.widthRange === "feature"}
          onClick={() => choose("feature")}
        >
          Feature phone, 16–24
        </Button>
        <Button
          type="button"
          className="h-11 px-3"
          variant={state.widthRange === "smartphone" ? "default" : "outline"}
          aria-pressed={state.widthRange === "smartphone"}
          onClick={() => choose("smartphone")}
        >
          Smartphone, 30–40+
        </Button>
      </div>
      <label className="grid gap-2 text-sm">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-medium">Columns</span>
          <span className="font-mono text-lg font-bold">{state.width}</span>
        </span>
        <input
          type="range"
          min={min}
          max={max}
          value={state.width}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={state.width}
          aria-valuetext={`${state.width} columns`}
          onChange={(event) => update({ width: Number(event.target.value) })}
          className="h-6 w-full accent-primary"
        />
        <span className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max === 48 ? "48" : max}</span>
        </span>
      </label>
      <p className="text-sm leading-6 text-muted-foreground">
        16 is the start of the feature-phone range, not a Vodafone Qatar width. The smartphone scale runs past 40.
        Paginate and Align share this width.
      </p>
      {showAmbiguous ? (
        <p className="text-sm leading-6 text-muted-foreground">
          Ambiguous-width characters count as one column. That matches a handset that is not using an East Asian width.
        </p>
      ) : null}
    </div>
  )
}
