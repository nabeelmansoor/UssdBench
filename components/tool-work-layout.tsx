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
    <div className={cn("mx-auto mt-6 w-full max-w-5xl px-4", className)}>
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">{main}</div>
        <aside className="flex flex-col gap-5 lg:sticky lg:top-4 lg:self-start">{aside}</aside>
      </div>
    </div>
  )
}
