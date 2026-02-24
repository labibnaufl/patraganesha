import Link from "next/link";
import { ArrowRight, Youtube } from "lucide-react";
import { YouTubeEmbed } from "@next/third-parties/google";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export function SocialSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-brand-primary text-black overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col items-start w-full space-y-6">
            <ScrollReveal direction="left">
              <p className="text-white text-xl md:text-3xl font-medium tracking-wide flex items-center gap-3">
                <Youtube className="w-8 h-8 md:w-10 md:h-10 text-white" />
                Media PATRA
              </p>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight w-full mb-2 leading-snug">
                Saksikan karya dan dokumentasi kegiatan terbaik kami melalui
                platform digital.
              </h2>
            </ScrollReveal>

            <ScrollReveal
              direction="up"
              delay={0.4}
              className="pt-8 w-full sm:w-auto"
            >
              <Link
                href="https://www.youtube.com/watch?v=oeY6U3l0nOo"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center whitespace-nowrap text-base md:text-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black min-h-16 h-16 md:min-h-20 md:h-20 rounded-full bg-black text-white hover:bg-white/90 group w-full sm:w-87.5 overflow-hidden"
              >
                <span className="relative z-10 transition-all duration-500 ease-[cubic-bezier(0.5,0,0,1)] pl-12 md:pl-16 group-hover:pl-0 group-hover:pr-12 md:group-hover:pr-16 group-hover:text-black text-2xl">
                  Ikuti Kami
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

          <ScrollReveal
            direction="left"
            delay={0.3}
            className="relative w-full aspect-video rounded-3xl shadow-2xl border-4 border-white/20"
          >
            <div className="w-full h-full overflow-hidden [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0 rounded-2xl relative">
              <YouTubeEmbed
                videoid="oeY6U3l0nOo"
                playlabel="Play PATRA Profile Video"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
