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
    <MaskContainer
      revealText={
        <div className="flex flex-col items-center gap-4 px-4">
          {/* PATRA + Logo row — single <h1> for SEO & accessibility */}
          <motion.div
            className="flex items-center gap-2 sm:gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[120px] font-black tracking-[0.01em] leading-none text-white text-patra-stroke">
              PATRA
            </h1>
            <div className="relative w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo HIMATEK PATRA ITB"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Digital Hub — h2 for correct heading hierarchy */}
          <motion.h2
            className="text-5xl sm:text-7xl md:text-9xl lg:text-[120px] font-black tracking-[0.01em] leading-none text-white text-patra-stroke"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            Digital Hub
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl font-semibold max-w-3xl text-center mt-2 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            Platform Terintegrasi untuk Dokumentasi Kegiatan, Media Publikasi,
            dan Sistem Informasi Massa HMTM "PATRA" ITB Ganesha
          </motion.p>

          {/* CTA Buttons below subtitle */}
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
      className="h-160 text-white dark:text-black"
    >
      Masa depan <span className="text-brand-primary">PATRA Ganesha</span> ada
      di sini. Arahkan kursor untuk menemukan{" "}
      <span className="text-brand-primary">Digital Hub</span>.
    </MaskContainer>
  );
}
