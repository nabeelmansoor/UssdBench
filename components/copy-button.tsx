"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { actionButtonClass } from "@/components/tool-frame"

export function CopyButton({
  text,
  label,
  disabled = false,
  variant = "outline",
}: {
  text: string
  label: string
  disabled?: boolean
  variant?: "outline" | "default" | "secondary"
}) {
  const [note, setNote] = useState<string | null>(null)

  return (
    <Button
      type="button"
      variant={variant}
      className={actionButtonClass}
      disabled={disabled || text.length === 0}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(
          () => {
            setNote("Copied")
            window.setTimeout(() => setNote(null), 2000)
          },
          () => setNote("Copy failed"),
        )
      }}
    >
      {note ?? label}
    </Button>
  )
}
