"use client";

import { MaskContainer } from "@/components/ui/svg-mask-effect";
import Image from "next/image";
import { motion } from "motion/react";

export function HeroMaskEffect({
  ctaButtons,
}: {
  ctaButtons?: React.ReactNode;
}) {
  return (
    <>
      {/**
       * Hidden SEO heading — always rendered in the DOM so crawlers and
       * screen-readers index the page title even when the mask is closed.
       * Not visible to sighted users (the real heading lives inside the mask).
       */}
      <h1 className="sr-only">PATRA Digital Hub</h1>

      <MaskContainer
        revealText={
          <div className="flex flex-col items-center gap-4 px-4">
            {/* PATRA + Logo row */}
            <motion.div
              className="flex items-center gap-2 sm:gap-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* aria-hidden because the sr-only <h1> above covers it */}
              <span
                aria-hidden="true"
                className="text-5xl sm:text-7xl md:text-9xl lg:text-[120px] font-black tracking-[0.01em] leading-none text-white text-patra-stroke"
              >
                PATRA
              </span>
              <div className="relative w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Logo HIMATEK PATRA ITB"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 40px, (max-width: 768px) 64px, (max-width: 1024px) 96px, 128px"
                />
              </div>
            </motion.div>

            {/* Digital Hub */}
            <motion.span
              aria-hidden="true"
              className="text-5xl sm:text-7xl md:text-9xl lg:text-[120px] font-black tracking-[0.01em] leading-none text-white text-patra-stroke"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            >
              Digital Hub
            </motion.span>

            {/* Subtitle */}
            <motion.p
              className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl font-semibold max-w-3xl text-center mt-2 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              Platform Terintegrasi untuk Dokumentasi Kegiatan, Media Publikasi,
              dan Sistem Informasi Massa HMTM &ldquo;PATRA&rdquo; ITB Ganesha
            </motion.p>

            {/* CTA Buttons */}
            {ctaButtons && (
              <motion.div
                className="mt-6 relative z-100 pointer-events-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.45 }}
              >
                {ctaButtons}
              </motion.div>
            )}
          </div>
        }
        className="min-h-[70vh] md:h-160 text-white dark:text-black"
      >
        Masa depan <span className="text-brand-primary">PATRA Ganesha</span> ada
        di sini. Arahkan kursor untuk menemukan{" "}
        <span className="text-brand-primary">Digital Hub</span>.
      </MaskContainer>
    </>
  );
}
