import { Metadata } from "next";
import { ProfileHero } from "../_components/profile-hero";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const VisionMission = dynamic(
  () =>
    import("../_components/vision-mission").then((m) => m.VisionMission),
  {
    loading: () => (
      <div className="w-full py-24 container mx-auto px-4">
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    ),
  }
);

const PatraMembers = dynamic(
  () =>
    import("../_components/patra-member").then((m) => m.PatraMembers),
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
  title: "Badan Pengurus | HMTM \"PATRA\" ITB",
  description:
    "Kenali lebih dekat Badan Pengurus Himpunan Mahasiswa Teknik Perminyakan 'PATRA' ITB — struktur, visi, dan misi.",
};

export default function BadanPengurusPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground">
      <ProfileHero>
        <div className="relative z-20 bg-background flex flex-col w-full shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
          <VisionMission />
          <PatraMembers />
        </div>
      </ProfileHero>
    </main>
  );
}
