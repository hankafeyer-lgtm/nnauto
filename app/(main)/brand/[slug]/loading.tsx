export default function BrandLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      <div className="h-9 w-64 rounded bg-muted mb-4" />
      <div className="h-5 w-full max-w-xl rounded bg-muted mb-8" />
      <div className="mb-10">
        <div className="h-6 w-48 rounded bg-muted mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-muted" />
          ))}
        </div>
      </div>
      <div className="h-6 w-56 rounded bg-muted mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="h-44 w-full rounded-lg bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
