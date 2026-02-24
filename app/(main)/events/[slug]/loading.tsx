import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen">
      {/* Hero / Cover Skeleton */}
      <div className="relative w-full h-[40vh] md:h-[55vh] bg-black">
        <Skeleton className="absolute inset-0 bg-white/20" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-8 max-w-4xl mx-auto w-full z-10">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-20 rounded-full bg-white/30" />
            <Skeleton className="h-5 w-16 rounded-full bg-white/30" />
          </div>
          <Skeleton className="h-10 md:h-14 w-3/4 max-w-2xl bg-white/30" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-10 space-y-10">
        {/* Registration CTA Skeleton */}
        <div className="p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 w-full sm:w-1/2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-12 w-full sm:w-40 rounded-full" />
        </div>

        {/* Date/Location Meta */}
        <div className="flex flex-col gap-4 py-8 border-y">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-2/5" />
        </div>

        {/* Description */}
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
