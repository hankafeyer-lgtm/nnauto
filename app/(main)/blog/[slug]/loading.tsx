export default function ArticleLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-pulse">
      <div className="h-4 w-48 rounded bg-muted mb-6" />
      <div className="aspect-[2/1] w-full rounded-xl bg-muted mb-6" />
      <div className="h-10 w-3/4 rounded bg-muted mb-4" />
      <div className="flex gap-4 mb-8">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-muted" />
        ))}
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}
