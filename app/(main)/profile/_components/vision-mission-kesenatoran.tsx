"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const missions = [
  {
    content:
      'Senator HMTM "PATRA" ITB berpartisipasi aktif dalam menjalankan peran representasinya dan tugasnya di Kongres KM ITB.',
  },
  {
    content:
      'Mewujudkan Badan Kesenatoran HMTM "PATRA" ITB sebagai ruang aspirasi massa HMTM "PATRA" ITB terhadap KM ITB yang bersifat demokratis, transparan, dan tepat sasaran.',
  },
  {
    content:
      'Menjadikan Badan Kesenatoran HMTM "PATRA" ITB sebagai pusat informasi akan isu-isu di KM ITB yang dikemas dengan menarik dan mudah dipahami.',
  },
  {
    content:
      'Mewujudkan sistem kerja di Badan Kesenatoran HMTM "PATRA" ITB yang optimal serta dapat menjadi wadah pengembangan bagi anggotanya dengan nyaman.'
  },
  {
    content:
      'Meningkatkan pemahaman dan kesadaran massa HMTM "PATRA" ITB terhadap isu serta posisi, potensi, dan peran massa HMTM "PATRA" ITB di ranah KM ITB.'
  },
];

export function VisionMission() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Vision Section */}
          <div className="mb-20">
            <p className="text-xl md:text-2xl text-brand-primary mb-6 font-medium">
              Visi Himpunan
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight w-full mb-2 leading-snug">
            Badan Kesenatoran &ldquo;PATRA&rdquo; ITB menjadi ruang pergerakan demin tercapainya resonansi positif untuk KM ITB dan HMTM &ldquo;PATRA&rdquo; ITB
            </h2>
          </div>

          {/* Separation Line */}
          <div className="w-24 h-1 bg-brand-primary/20 mx-auto mb-20 rounded-full" />

          {/* Mission Section */}
          <div>
            <p className="text-xl md:text-2xl text-brand-primary mb-4 font-medium">
              Misi Himpunan
            </p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight w-full mb-10 leading-snug">
              Pilar-pilar penggerak dalam mewujudkan Visi kami.
            </h2>

            {/* Orange pill accordion */}
            <div className="flex flex-col gap-3">
              {missions.map((mission, i) => {
                const isOpen = openIndex === i;
                return (
                  <motion.button
                    key={i}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    layout
                    className="w-full rounded-2xl bg-brand-primary text-left overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    {/* Header row — always visible */}
                    <div className="flex items-center justify-between px-5 py-4 min-h-[60px]">
                      {/* Mission text — only shown when open */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.p
                            key="text"
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="text-white font-semibold text-base md:text-lg leading-snug pr-6 flex-1"
                          >
                            {mission.content}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Number badge — always on the right */}
                      <span className="shrink-0 ml-auto flex items-center justify-center w-10 h-10 rounded-full bg-white text-brand-primary font-black text-lg leading-none select-none">
                        {i + 1}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
