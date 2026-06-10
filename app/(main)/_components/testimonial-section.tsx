import Image from "next/image";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { Quote } from "lucide-react";

export function TestimonialSection() {
  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Alumni PATRA 2020",
      content:
        "Sangat membantu dalam mengorganisir kegiatan kemahasiswaan. Platform yang luar biasa dan informatif untuk seluruh massa PATRA!",
      image: "https://i.pravatar.cc/150?u=budi",
    },
    {
      name: "Siti Rahma",
      role: "Anggota Aktif",
      content:
        "Informasi lomba dan registrasi kegiatan sangat up-to-date. Tampilan website-nya juga sangat modern dan mudah digunakan sehari-hari.",
      image: "https://i.pravatar.cc/150?u=siti",
    },
    {
      name: "Ahmad Fauzi",
      role: "Ketua Departemen Pendidikan",
      content:
        "Pengarsipan kegiatan dan kebutuhan akademik mahasiswa menjadi jauh lebih rapi. Sangat merekomendasikan platform Hub ini!",
      image: "https://i.pravatar.cc/150?u=ahmad",
    },
  ];

  return (
    <section className="w-full py-24 bg-white text-black overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
              Apa Kata Mereka Tentang PATRA?
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Testimoni langsung dari massa himpunan yang telah merasakan
              manfaat dari ekosistem digital PATRA.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pt-16">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal
              key={testimonial.name}
              direction="up"
              delay={0.2 + index * 0.1}
            >
              <div className="bg-background relative flex flex-col items-center text-center p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-border mt-12 transition-transform duration-300 hover:-translate-y-2">
                {/* Floating Avatar */}
                <div className="absolute -top-12 w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-brand-primary/10">
                  <Image
                    src={testimonial.image}
                    alt={`Foto ${testimonial.name}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-brand-primary/20 mt-8 mb-4 rotate-180" />

                {/* Content */}
                <p className="text-foreground/80 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="mt-auto">
                  <h4 className="font-bold text-lg text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-brand-primary font-medium text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
