export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-12 w-12">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
          <span className="absolute inset-2 rounded-full bg-accent" />
          <span className="absolute inset-4 rounded-full bg-background" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Loading the latest…
        </p>
      </div>
    </div>
  );
}
