export default function ListingDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl animate-pulse">
      <div className="h-6 w-64 rounded bg-muted mb-4" />
      <div className="aspect-[16/9] w-full rounded-xl bg-muted mb-6" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-6 w-1/3 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted" />
            ))}
          </div>
          <div className="space-y-2 mt-6">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-xl bg-muted" />
          <div className="h-12 rounded-lg bg-muted" />
          <div className="h-12 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
