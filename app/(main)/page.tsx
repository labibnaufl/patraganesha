import { HeroSection } from "./_components/hero-section";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

function EventSkeleton() {
  return (
    <div className="w-full py-24 bg-background container mx-auto px-4">
      <Skeleton className="h-[125px] rounded-[2.5rem] w-full" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full selection:bg-primary/30">
      <HeroSection />
    </div>
  );
}
