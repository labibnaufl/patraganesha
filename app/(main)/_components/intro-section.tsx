import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export function IntroSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-brand-primary text-black overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-start w-full space-y-6">
          <ScrollReveal direction="left">
            <p className="text-black text-xl md:text-3xl font-medium tracking-wide">
              Tentang Kami,
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="left">
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight w-full mb-2 leading-tight pt-2">
              PATRA Ganesha menjadi ruang bertumbuh untuk berkarya,
              berkolaborasi, dan mendokumentasikan setiap perjalanan organisasi
              dari masa ke masa.
            </h2>
          </ScrollReveal>

          <ScrollReveal
            delay={0.4}
            direction="up"
            className="pt-8 w-full sm:w-auto"
          >
            <Link
              href="/profile"
              className="relative inline-flex items-center justify-center whitespace-nowrap text-base md:text-lg font-bold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black min-h-16 h-16 md:min-h-20 md:h-20 rounded-full bg-black text-white hover:bg-white group w-full sm:w-[350px] overflow-hidden"
            >
              <span className="relative z-10 transition-all duration-500 ease-[cubic-bezier(0.5,0,0,1)] pl-12 md:pl-16 group-hover:pl-0 group-hover:pr-12 md:group-hover:pr-16 text-2xl hover:text-black">
                Profil PATRA
              </span>
              <div className="absolute left-2 flex items-center justify-center bg-brand-primary text-white rounded-full w-12 h-12 md:w-16 md:h-16 transition-all duration-500 ease-[cubic-bezier(0.5,0,0,1)] group-hover:left-[calc(100%-3.5rem)] md:group-hover:left-[calc(100%-4.5rem)] group-hover:bg-brand-hover shrink-0">
                <ArrowRight
                  className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-500"
                  strokeWidth={2.5}
                />
              </div>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
