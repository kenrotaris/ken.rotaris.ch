export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-black to-teal-500/5 animate-pulse" />
      </div>

      {/* Header Skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-6 glass-dark glass-border border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-2 w-48 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="flex gap-6">
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <section className="min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-4xl mx-auto text-center px-6 pb-16">
          {/* Profile Image Skeleton */}
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 animate-pulse" />
          </div>

          {/* Name Skeleton */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="h-12 w-64 md:w-96 bg-white/10 rounded-lg animate-pulse" />

            {/* Title Skeleton */}
            <div className="h-6 w-48 md:w-64 bg-teal-accent/20 rounded-lg animate-pulse" />

            {/* Bio Skeleton */}
            <div className="space-y-2 w-full max-w-2xl pt-4">
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-5/6 mx-auto bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-4/6 mx-auto bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Skeleton */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Tabs Skeleton */}
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md py-4 mb-8">
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-teal-accent/20 rounded-full animate-pulse" />
            <div className="h-9 w-28 bg-white/5 rounded-full animate-pulse" />
            <div className="h-9 w-32 bg-white/5 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Timeline Items Skeleton */}
        <div className="max-w-5xl mx-auto">
          <div className="relative glass rounded-2xl p-6 glass-border">
            {/* Timeline Line */}
            <div
              className="absolute left-6 md:left-[200px] -translate-x-1/2 top-0 bottom-0 w-px opacity-30"
              style={{
                background: 'linear-gradient(to bottom, transparent, var(--color-accent), transparent)'
              }}
            />

            {/* Timeline Items */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div className="absolute left-3 md:left-[176px] top-6 -translate-x-1/2 z-10">
                    <div className="w-2 h-2 rounded-full bg-teal-accent/50 animate-pulse" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col md:flex-row py-6 glass glass-hover rounded-lg pl-14 md:pl-0 pr-4">
                    {/* Date Column */}
                    <div className="hidden md:flex flex-col gap-1 w-48 shrink-0 pl-4 pr-4">
                      <div className="h-4 w-16 bg-teal-accent/20 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 md:pl-8">
                      <div className="flex items-start gap-3 mb-3">
                        {/* Logo */}
                        <div className="w-10 h-10 bg-white/10 rounded animate-pulse shrink-0" />

                        {/* Title & Company */}
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
                          <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-2 mt-3">
                        <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
                      </div>

                      {/* Skills */}
                      <div className="mt-3 h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
