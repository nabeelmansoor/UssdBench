"use client"

import { Button } from "@/components/ui/button"
import { actionButtonClass } from "@/components/tool-frame"
import {
  cleanupText,
  FULLWIDTH_ONLY,
  SPACES_AND_INVISIBLES,
  SPACES_INVISIBLES_AND_PUNCTUATION,
} from "@/lib/cleanup"
import { useSession } from "@/lib/session"

export function CleanupActions() {
  const { state, update } = useSession()
  const spaces = cleanupText(state.text, SPACES_AND_INVISIBLES)
  const punctuation = cleanupText(state.text, SPACES_INVISIBLES_AND_PUNCTUATION)
  const fullwidth = cleanupText(state.text, FULLWIDTH_ONLY)

  return (
    <div className="grid gap-3">
      {punctuation.ellipsisCount > 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">
          {punctuation.ellipsisCount === 1 ? "One ellipsis becomes three dots" : `${punctuation.ellipsisCount} ellipses become three dots each`}
          . The length goes from {punctuation.beforeLength} to {punctuation.afterLength} characters before you apply it.
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          className={actionButtonClass}
          disabled={spaces.replacements === 0}
          onClick={() => update({ text: spaces.text })}
        >
          Replace spaces and safe invisibles
        </Button>
        <Button
          type="button"
          variant="outline"
          className={actionButtonClass}
          disabled={punctuation.replacements === 0}
          onClick={() => update({ text: punctuation.text })}
        >
          Replace spaces, invisibles, and smart punctuation
        </Button>
        <Button
          type="button"
          variant="outline"
          className={actionButtonClass}
          disabled={fullwidth.replacements === 0}
          onClick={() => update({ text: fullwidth.text })}
        >
          Fold fullwidth lookalikes
        </Button>
      </div>
    </div>
  )
}
