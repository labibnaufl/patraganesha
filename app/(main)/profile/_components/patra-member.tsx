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
    name: "Biro Sumber Daya Anggota",
    role: "Biro",
    image: "/images/Biro Sumber Daya Anggota/DSC_0397.jpg",
    className: "absolute top-16 left-[12%] rotate-[-6deg]",
    needsRotation: true,
  },
  {
    name: "BRKPO",
    role: "Biro",
    image: "/images/BRKPO/DSC_0233.jpg",
    className: "absolute top-8 left-[28%] rotate-[5deg]",
    needsRotation: true,
  },
  {
    name: "Departemen Eksternal",
    role: "Departemen",
    image: "/images/Departemen Eksternal/0041.jpg",
    className: "absolute top-28 left-[43%] rotate-[-4deg]",
    needsRotation: false, // already portrait
  },
  {
    name: "Internal",
    role: "Departemen",
    image: "/images/Internal/DSC_0218.jpg",
    className: "absolute top-12 left-[58%] rotate-[8deg]",
    needsRotation: true,
  },
  {
    name: "Kajian",
    role: "Departemen",
    image: "/images/Kajian/DSC_0297.jpg",
    className: "absolute top-36 right-[18%] rotate-[-3deg]",
    needsRotation: true,
  },
  {
    name: "Karya",
    role: "Departemen",
    image: "/images/Karya/DSC_0315.jpg",
    className: "absolute top-4 right-[30%] rotate-[6deg]",
    needsRotation: true,
  },
  {
    name: "Kebutuhan Dasar",
    role: "Departemen",
    image: "/images/Kebutuhan Dasar/DSC_0356.jpg",
    className: "absolute top-24 left-[35%] rotate-[-9deg]",
    needsRotation: true,
  },
  {
    name: "Kesekjenan",
    role: "Departemen",
    image: "/images/Kesekjenan/DSC_0092.jpg",
    className: "absolute top-24 left-[35%] rotate-[-9deg]",
    needsRotation: true,
  },
  {
    name: "Medkominfo",
    role: "Departemen",
    image: "/images/Medkominfo/Medkominfo.png",
    className: "absolute top-24 left-[35%] rotate-[-9deg]",
    needsRotation: true,
  },
  {
    name: "Ketua Himpunan",
    role: "Ketua Himpunan",
    image: "/images/Ketua/DSC_0014.jpg",
    className: "absolute top-16 left-[12%] rotate-[-6deg]",
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

export function PatraMembers() {
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
