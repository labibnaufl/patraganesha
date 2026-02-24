import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen">
      {/* Hero / Cover Skeleton */}
      <div className="relative w-full h-[40vh] md:h-[55vh] bg-teal-950">
        <Skeleton className="absolute inset-0 bg-white/10" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-10 max-w-4xl mx-auto w-full z-10">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-24 rounded-full bg-white/20" />
            <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
          </div>
          <Skeleton className="h-10 md:h-14 w-3/4 max-w-2xl bg-white/20 mb-6" />

          <div className="flex gap-4">
            <Skeleton className="h-8 w-48 rounded-full bg-white/20" />
            <Skeleton className="h-8 w-24 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-10 space-y-10">
        {/* CTA Bar Skeleton */}
        <div className="p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 w-full md:w-1/2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Skeleton className="h-12 w-full md:w-40 rounded-xl" />
            <Skeleton className="h-12 w-full md:w-32 rounded-xl" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="p-6 rounded-2xl border">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
