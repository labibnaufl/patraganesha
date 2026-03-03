import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export function CtaSection() {
  return (
    <section className="w-full py-32 relative overflow-hidden bg-brand-primary text-white flex items-center justify-center min-h-[60vh]">
      {/* Background Graphic - Right Side */}
      <div className="absolute right-0 bottom-0 h-full w-[40%] sm:w-[50%] md:w-[45%] lg:w-[40%] pointer-events-none z-0 opacity-40 sm:opacity-70 md:opacity-90">
        <Image
          src="/images/Ganesha.jpg"
          alt="Ganesha Illustration"
          fill
          className="object-contain object-bottom md:object-bottom-right opacity-90"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center py-12">
        <div className="flex flex-col items-center text-center max-w-4xl space-y-6 md:space-y-8">
          <ScrollReveal direction="up" delay={0.1}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.2]">
              Jelajahi Aktivitas & <br className="hidden md:block" /> Arsip
              PATRA Ganesha
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed text-balance max-w-2xl mx-auto">
              Temukan informasi lengkap mengenai kegiatan, lomba, beasiswa, dan
              berbagai hal menarik lainnya seputar PATRA Ganesha.
            </p>
          </ScrollReveal>

          <ScrollReveal
            direction="up"
            delay={0.5}
            className="pt-6 w-full sm:w-auto"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center whitespace-nowrap text-brand-primary font-bold tracking-wide text-lg transition-all h-14 md:h-16 rounded-full px-12 md:px-16 bg-white hover:bg-white/90 hover:scale-105 active:scale-95 duration-200 shadow-xl"
            >
              Mulai Menjelajah
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
