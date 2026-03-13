import { Metadata } from "next";
import { ProfileHero } from "../_components/profile-hero";
import { VisionMission } from "../_components/vision-mission";
import { PatraMembers } from "../_components/patra-member";

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
