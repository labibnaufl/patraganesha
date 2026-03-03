"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";

interface Member {
  name: string;
  role: string;
  image: string;
  className: string;
  /** true = landscape photo that needs 90° CSS rotation to appear portrait */
  needsRotation: boolean;
}

const members: Member[] = [
  {
    name: "Bintang Yanuar Putra",
    role: "Ketua Komisi",
    image: "/images/Badan Kesenatoran/Ketua/DSC_0016.jpg",
    className: "absolute top-16 left-[12%] rotate-[-6deg]",
    needsRotation: true,
  },
  {
    name: "Yosua Zendrato",
    role: "Senator",
    image: "/images/Badan Kesenatoran/Senator/DSC_0005.jpg",
    className: "absolute top-8 left-[28%] rotate-[5deg]",
    needsRotation: true,
  },
  {
    name: "Wildan Malik Fajar",
    role: "Komisi Aspirasi Ganesha",
    image: "/images/Badan Kesenatoran/Komisi Aspirasi Ganesha/DSC_0027.jpg",
    className: "absolute top-28 left-[43%] rotate-[-4deg]",
    needsRotation: true,
  },
  {
    name: "Savana Nazwa Putri W.",
    role: "Komisi Media Kreatif",
    image: "/images/Badan Kesenatoran/Komisi Media Kreatif/DSC_0059 (1).jpg",
    className: "absolute top-12 left-[58%] rotate-[8deg]",
    needsRotation: true,
  },
  {
    name: "Valentino Varian Vanitra",
    role: "Komisi Riset dan Kajian Ganesha",
    image:
      "/images/Badan Kesenatoran/Komisi Riset dan Kajian Ganesha/DSC_0024.jpg",
    className: "absolute top-36 right-[18%] rotate-[-3deg]",
    needsRotation: true,
  },
  {
    name: "Naufal Abiyyu P, Rury Hikaru Adisty W, Farouq Abdullah",
    role: "Badan Kesenatoran Cirebon",
    image: "/images/Badan Kesenatoran/Badan Kesenatoran Cirebon/DSC_0090.jpg",
    className: "absolute top-4 right-[30%] rotate-[6deg]",
    needsRotation: true,
  },
];

/**
 * Renders a landscape image rotated 90° inside a portrait container using pure CSS.
 *
 * Math: container is W × (W×4/3). The landscape image wrapper must be:
 *   width  = container height = 133.33% of container width
 *   height = container width  = 75%     of container height
 * Centered at (50%, 50%) then rotated 90°, the landscape source fills the portrait frame exactly.
 */
function LandscapeToPortrait({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="absolute"
      style={{
        width: "133.33%",
        height: "75%",
        top: "12.5%",
        left: "-16.67%",
        transform: "rotate(90deg)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="pointer-events-none object-cover object-center"
        style={{ imageOrientation: "from-image" }}
      />
    </div>
  );
}

export function PatraMembersKesenatoran() {
  return (
    <section className="w-full bg-background py-24">
      {/* Section Header */}
      <div className="container mx-auto px-4 md:px-8 max-w-5xl mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xl md:text-2xl text-brand-primary mb-4 font-medium">
            Pengurus Himpunan
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-snug text-slate-900">
            Mereka yang menggerakkan roda{" "}
            <span className="text-brand-primary">PATRA Ganesha.</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl">
            Seret kartu untuk berinteraksi. Kenali para pengurus yang
            berdedikasi membangun himpunan.
          </p>
        </motion.div>
      </div>

      {/* Draggable Cards */}
      <DraggableCardContainer className="relative flex min-h-[600px] w-full items-center justify-center overflow-clip">
        <p className="pointer-events-none absolute top-1/2 mx-auto max-w-xs -translate-y-3/4 text-center text-2xl font-black text-orange-200 md:text-3xl dark:text-neutral-800 select-none">
          Wajah di Setiap Langkah PATRA Ganesha.
        </p>
        {members.map((member, index) => (
          <DraggableCardBody key={index} className={member.className}>
            {/* Portrait card frame */}
            <div className="relative w-full aspect-3/4 overflow-hidden rounded-sm bg-slate-100">
              {member.needsRotation ? (
                <LandscapeToPortrait src={member.image} alt={member.name} />
              ) : (
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  unoptimized
                  className="pointer-events-none object-cover object-top"
                  style={{ imageOrientation: "from-image" }}
                />
              )}
            </div>
            <div className="mt-4 px-1">
              <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
                {member.name}
              </h3>
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                {member.role}
              </p>
            </div>
          </DraggableCardBody>
        ))}
      </DraggableCardContainer>
    </section>
  );
}
