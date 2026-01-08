export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="skeleton h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-32" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5"
            key={i}
          >
            <div className="skeleton h-9 w-9 rounded-lg" />
            <div className="space-y-1.5">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-5 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Image grid skeleton */}
      <div>
        <div className="skeleton mb-4 h-6 w-20" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              className="skeleton aspect-square rounded-xl"
              key={i}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
