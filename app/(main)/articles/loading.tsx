import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlesLoading() {
  return (
    <div className="w-full min-h-screen">
      {/* Header skeleton */}
      <section className="w-full bg-brand-primary py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 space-y-4">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-14 w-72 bg-white/30" />
          <Skeleton className="h-5 w-96 bg-white/20" />
        </div>
      </section>

      <section className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 space-y-10">
          {/* Filters skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-11 w-full rounded-full" />
            <div className="flex gap-2">
              {[80, 64, 96, 80].map((w, i) => (
                <Skeleton
                  key={i}
                  className="h-8 rounded-full"
                  style={{ width: w }}
                />
              ))}
            </div>
          </div>
          {/* Featured skeleton */}
          <Skeleton className="w-full h-72 rounded-3xl" />
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-3xl overflow-hidden border"
              >
                <Skeleton className="w-full aspect-video" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
