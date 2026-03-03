import { BookOpen, Trophy, Calendar, Users } from "lucide-react";
import Link from "next/link";

export function FeaturesSection() {
  const features = [
    {
      title: "Artikel PATRA",
      description:
        "Media publikasi tulisan, laporan, dan, gagasan PATRA Ganesha.",
      icon: BookOpen,
      color: "text-gray-900",
      bg: "bg-orange-500/10",
      href: "/articles",
    },
    {
      title: "Informasi Akademik",
      description:
        "Pusat akses informasi seputar lomba, beasiswa, Drive akademik, dan YouTube PATRA.",
      icon: Trophy,
      color: "text-gray-900",
      bg: "bg-orange-500/10",
      href: "/academic",
    },
    {
      title: "Kegiatan PATRA",
      description:
        "Arsip kegiatan PATRA yang terdokumentasi rapi dan terstruktur.",
      icon: Calendar,
      color: "text-gray-900",
      bg: "bg-orange-500/10",
      href: "/events",
    },
    {
      title: "Komunitas PATRA",
      description:
        "Terhubung dengan anggota PATRA lainnya, berdiskusi, dan berbagi gagasan.",
      icon: Users,
      color: "text-gray-900",
      bg: "bg-orange-500/10",
      href: "/profile",
    },
  ];

  return (
    <section className="w-full py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Semua yang Kamu Butuhkan Ada di Sini
          </h2>
          <p className="text-lg text-muted-foreground">
            PATRA Digital Hub menyediakan berbagai fitur yang dapat membantu
            kamu dalam mengakses informasi dan kegiatan PATRA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <Link
              href={feature.href || "#"}
              key={idx}
              className="flex flex-col items-start p-6 rounded-3xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`p-3 rounded-2xl ${feature.bg} mb-6`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
