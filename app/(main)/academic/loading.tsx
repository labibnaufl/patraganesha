import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen">
      {/* Page Header Skeleton */}
      <section className="w-full bg-teal-800 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 space-y-4">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-12 md:h-16 w-3/4 max-w-md bg-white/20" />
          <Skeleton className="h-6 w-full max-w-xl bg-white/20" />
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 space-y-10">
          {/* Filters Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-12 w-full rounded-full" />
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Skeleton className="h-10 w-64 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-3xl overflow-hidden border"
              >
                <Skeleton className="w-full aspect-[16/9]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="pt-4 border-t border-border/40 mt-4 flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
