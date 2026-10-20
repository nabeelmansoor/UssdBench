import { cn } from "cn"

export function ToolWorkLayout({
  main,
  aside,
  className,
}: {
  main: React.ReactNode
  aside: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("container-page mt-8", className)}>
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16.5rem,19rem)] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">{main}</div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">{aside}</aside>
      </div>
    </div>
  )
}
