import { Metadata } from "next";
import { ProfileHeroKesenatoran } from "../_components/profile-hero-kesenatoran";
import { VisionMission } from "../_components/vision-mission-kesenatoran";
import { PatraMembersKesenatoran } from "../_components/patra-member-kesenatoran";

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
