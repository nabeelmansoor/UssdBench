import { formatCodePoint } from "@/lib/names"
import type { SmartReplacement, SmartSegment } from "@/lib/smart-chars"

function visible(ch: string): string {
  if (ch === " ") return "␠"
  if (/\s/u.test(ch) || /\p{Cf}/u.test(ch)) return formatCodePoint(ch.codePointAt(0) ?? 0)
  return ch
}

/** The text as it will be sent, with every automatically replaced character highlighted. */
export function SmartTextView({ segments, rtl }: { segments: SmartSegment[]; rtl: boolean }) {
  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="min-h-48 rounded-md border-[1.5px] border-border bg-muted p-3 font-mono text-sm leading-7 whitespace-pre-wrap break-words"
    >
      {segments.map((segment, index) =>
        segment.replaced ? (
          <mark
            key={index}
            data-replaced
            title={`${segment.replaced.name} (${formatCodePoint(segment.replaced.cp)}) replaced with ${segment.text === "" ? "nothing" : `“${segment.text}”`}`}
            className="rounded-sm bg-accent px-0.5 text-accent-foreground shadow-[inset_0_-2px_0_0_var(--line)]"
          >
            {segment.text === "" ? <span className="text-[0.6rem] font-bold">∅</span> : segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </div>
  )
}

export function ReplacementSummary({ replacements }: { replacements: SmartReplacement[] }) {
  if (replacements.length === 0) {
    return <p className="text-sm leading-6 text-muted-foreground">No smart characters to replace.</p>
  }
  const groups = new Map<string, { from: string; to: string; name: string; cp: number; count: number }>()
  for (const entry of replacements) {
    const key = `${entry.cp}-${entry.to}`
    const group = groups.get(key)
    if (group) group.count += 1
    else groups.set(key, { from: entry.from, to: entry.to, name: entry.name, cp: entry.cp, count: 1 })
  }
  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold">
        {replacements.length} smart character{replacements.length === 1 ? "" : "s"} replaced automatically
      </p>
      <ul className="flex flex-wrap gap-2">
        {[...groups.values()].map((group) => (
          <li
            key={`${group.cp}-${group.to}`}
            className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-2 py-1 font-mono text-xs"
            title={`${group.name} (${formatCodePoint(group.cp)})`}
          >
            <span className="rounded-sm bg-muted px-1">{visible(group.from)}</span>
            <span aria-hidden="true">→</span>
            <span className="sr-only">replaced with</span>
            <span className="rounded-sm bg-accent px-1 text-accent-foreground">{group.to === "" ? "∅" : group.to === " " ? "␠" : group.to}</span>
            {group.count > 1 ? <span className="text-muted-foreground">×{group.count}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
