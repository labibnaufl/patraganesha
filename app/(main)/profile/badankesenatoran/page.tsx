import { Metadata } from "next";
import { ProfileHeroKesenatoran } from "../_components/profile-hero-kesenatoran";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const VisionMission = dynamic(
  () =>
    import("../_components/vision-mission-kesenatoran").then(
      (m) => m.VisionMission
    ),
  {
    loading: () => (
      <div className="w-full py-24 container mx-auto px-4">
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    ),
  }
);

const PatraMembersKesenatoran = dynamic(
  () =>
    import("../_components/patra-member-kesenatoran").then(
      (m) => m.PatraMembersKesenatoran
    ),
  {
    loading: () => (
      <div className="w-full py-24 container mx-auto px-4">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-8 w-96 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-3/4 rounded-xl" />
          ))}
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Badan Kesenatoran | HMTM \"PATRA\" ITB",
  description:
    "Kenali Badan Kesenatoran Himpunan Mahasiswa Teknik Perminyakan 'PATRA' ITB.",
};

export default function BadanKesenatoranPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground">
      <ProfileHeroKesenatoran>
        <div className="relative z-20 bg-background flex flex-col w-full shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
          <VisionMission />
          <PatraMembersKesenatoran />
        </div>
      </ProfileHeroKesenatoran>
    </main>
  );
}
