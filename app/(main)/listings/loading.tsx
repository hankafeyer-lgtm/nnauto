export default function ListingsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-pulse">
      <div className="h-8 w-48 rounded bg-muted mb-6" />
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-32 rounded-lg bg-muted" />
        <div className="h-10 w-32 rounded-lg bg-muted" />
        <div className="h-10 w-32 rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="h-44 w-full rounded-lg bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
