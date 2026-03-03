import { Metadata } from "next";
import { ProfileHero } from "../_components/profile-hero-bpa";
import { VisionMission } from "../_components/vision-mission-bpa";
import { PatraMembersBPA } from "../_components/patra-member-bpa";

export const metadata: Metadata = {
  title: "Badan Perwakilan Angkatan | PATRA Digital Hub",
  description:
    "Kenali Badan Perwakilan Angkatan Himpunan Mahasiswa Teknik Perminyakan 'PATRA' ITB.",
};

export default function BadanPerwakilanAngkatanPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground">
      <ProfileHero>
        <div className="relative z-20 bg-background flex flex-col w-full shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
          <VisionMission />
          <PatraMembersBPA />
        </div>
      </ProfileHero>
    </main>
  );
}
