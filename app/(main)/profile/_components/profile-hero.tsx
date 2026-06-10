"use client";

import Image from "next/image";
import { motion } from "motion/react";
import TextType from "./text-type-effect";

export function ProfileHero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative w-full text-black flex flex-col pt-0 z-10">
      {/* Sticky background image track */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="sticky top-0 w-full h-screen flex items-center justify-center">
          <div className="relative w-full h-full bg-black">
            <Image
              src="/images/profile.png"
              alt="Profile PATRA Background"
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Hero Content Layer (First Curtain) */}
      <div className="relative z-10 w-full bg-white flex flex-col justify-center pb-56 pt-32 md:pt-40 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <p className="text-slate-500 font-medium text-lg md:text-xl mb-4">
            Badan Pengurus &ldquo;PATRA&rdquo; ITB
          </p>
          <TextType
            lines={[
              "Mendokumentasikan karya,",
              "dan menggerakkan kegiatan",
              "PATRA Ganesha.",
            ]}
            lineClassNames={["", "", "text-brand-primary"]}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px]"
            typingSpeed={35}
            initialDelay={400}
            cursorCharacter="|"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mt-10 md:mt-12 xl:pt-48">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 md:w-16 md:h-16 -translate-y-2">
                <Image
                  src="/images/logo.png"
                  alt="PATRA Logo"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div className="font-bold text-slate-900 text-lg md:text-xl leading-tight -translate-y-2">
                2 Biro
                <br />7 Departemen
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 md:w-14 md:h-14 -translate-y-2">
                <Image
                  src="/images/image3.png"
                  alt="Ganesha Logo"
                  fill
                  sizes="64px"
                  className="object-contain mix-blend-multiply"
                />
              </div>
              <div className="font-bold text-slate-900 text-lg md:text-xl leading-tight -translate-y-2">
                Kampus
                <br />
                Ganesha
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for sticky scroll effect */}
      <div className="relative z-0 w-full h-[60vh] md:h-[75vh] pointer-events-none" />

      {/* Children content that will slide over the sticky background */}
      {children}
    </section>
  );
}
