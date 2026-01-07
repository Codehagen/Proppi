export default function WorkspaceDetailLoading() {
  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="skeleton h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <div className="skeleton h-7 w-48" />
            <div className="skeleton h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-9 w-36" />
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-[72px] rounded-xl" />
        ))}
      </div>

      {/* Two-column grid: Workspace Info + Members */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workspace Info skeleton */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="skeleton h-5 w-32" />
          </div>
          <div className="space-y-4 p-4">
            {/* Owner skeleton */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-40" />
                </div>
              </div>
              <div className="skeleton h-5 w-14 rounded-full" />
            </div>
            {/* Info rows skeleton */}
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="skeleton h-4 w-4" />
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Members skeleton */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="skeleton h-5 w-20" />
            <div className="skeleton h-5 w-8 rounded-full" />
          </div>
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg p-2">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton h-3 w-36" />
                  </div>
                </div>
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column grid: Recent Projects + Recent Videos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects skeleton */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="skeleton h-5 w-32" />
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="skeleton h-4 w-36" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                  <div className="skeleton h-5 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="skeleton h-1.5 flex-1 rounded-full" />
                  <div className="skeleton h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Videos skeleton */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="skeleton h-5 w-28" />
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                  <div className="skeleton h-5 w-24 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="skeleton h-1.5 flex-1 rounded-full" />
                  <div className="skeleton h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
