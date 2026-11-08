export default function Loading() {
  return (
    <div className="p-10 animate-pulse">
      <div className="flex flex-col gap-3 mb-8">
        <div className="h-8 w-52 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded-md bg-muted/70" />
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4"
          >
            <div className="aspect-[9/16] w-full rounded-lg bg-muted" />
            <div className="h-4 w-3/4 rounded-md bg-muted" />
            <div className="h-3 w-1/2 rounded-md bg-muted/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
