"use client"

import { useState } from "react"
import { CopyButton } from "@/components/copy-button"
import { actionButtonClass } from "@/components/tool-frame"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SAMPLE_NOTE, SAMPLE_TEXT } from "@/lib/sample"
import { useSession } from "@/lib/session"

export function BufferField({ id, label = "Menu text" }: { id: string; label?: string }) {
  const { state, update } = useSession()
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="font-semibold">{label}</Label>
      <Textarea
        id={id}
        value={state.text}
        onChange={(event) => update({ text: event.target.value })}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="field-sizing-fixed max-h-96 min-h-48 overflow-auto font-mono text-sm leading-6"
        placeholder="Paste a USSD menu or an SMS."
      />
      {state.text === SAMPLE_TEXT ? (
        <p className="text-sm text-muted-foreground">{SAMPLE_NOTE}</p>
      ) : null}
    </div>
  )
}

export function BufferEditor({
  id,
  label = "Menu text",
  copyLabel = "Copy text",
}: {
  id: string
  label?: string
  copyLabel?: string
}) {
  return (
    <div className="grid gap-2">
      <BufferField id={id} label={label} />
      <BufferActions copyLabel={copyLabel} />
    </div>
  )
}

export function BufferActions({
  copyLabel = "Copy text",
  stacked = false,
}: {
  copyLabel?: string
  stacked?: boolean
}) {
  const { state, update } = useSession()
  const [clearOpen, setClearOpen] = useState(false)
  const [sampleOpen, setSampleOpen] = useState(false)
  const [pasteError, setPasteError] = useState<string | null>(null)
  const hasText = state.text.length > 0

  const loadSample = () => update({ text: SAMPLE_TEXT })

  return (
    <div className="grid gap-2">
      <div className={stacked ? "flex flex-col gap-3" : "grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap"}>
        <Button
          type="button"
          variant="outline"
          className={actionButtonClass}
          onClick={() => {
            setPasteError(null)
            void navigator.clipboard.readText().then(
              (value) => update({ text: value }),
              () => setPasteError("Could not read the clipboard. Click the box and paste there."),
            )
          }}
        >
          Paste
        </Button>
        <Button
          type="button"
          className={actionButtonClass}
          onClick={() => {
            if (hasText && state.text !== SAMPLE_TEXT) setSampleOpen(true)
            else loadSample()
          }}
        >
          Load sample
        </Button>
        <Button
          type="button"
          variant="outline"
          className={actionButtonClass}
          onClick={() => {
            if (hasText) setClearOpen(true)
          }}
        >
          Clear
        </Button>
        <CopyButton text={state.text} label={copyLabel} />
      </div>
      {pasteError ? <p className="text-sm text-destructive">{pasteError}</p> : null}
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this menu?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the text from every tool in this visit. It stays on this device either way.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep the text</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => update({ text: "" })}>
              Clear text
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={sampleOpen} onOpenChange={setSampleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace the current menu with the sample?</AlertDialogTitle>
            <AlertDialogDescription>
              The sample is English practice text. It contains a no-break space, a curly apostrophe, and a long line.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep the current text</AlertDialogCancel>
            <AlertDialogAction onClick={loadSample}>Load sample</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
