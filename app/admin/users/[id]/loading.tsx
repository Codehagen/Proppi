export default function AdminUserDetailLoading() {
  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Back Button */}
      <div className="animate-fade-in-up">
        <div className="skeleton h-9 w-32 rounded-md" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
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
          <div className="skeleton h-9 w-20 rounded-md" />
          <div className="skeleton h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5"
          >
            <div className="skeleton h-9 w-9 rounded-lg" />
            <div className="space-y-1.5">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-5 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Info */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="skeleton h-5 w-24" />
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="skeleton h-4 w-4" />
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-4 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Card */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="skeleton h-5 w-24" />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-24" />
                </div>
              </div>
              <div className="skeleton h-6 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects & Videos Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="skeleton h-5 w-32" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="skeleton h-1.5 flex-1 rounded-full" />
                  <div className="skeleton h-3 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="skeleton h-5 w-28" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="skeleton h-1.5 flex-1 rounded-full" />
                  <div className="skeleton h-3 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
