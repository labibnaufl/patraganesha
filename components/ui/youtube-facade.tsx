"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

/**
 * YouTubeFacade — shows a static thumbnail until the user clicks.
 * This defers the heavy YouTube iframe from loading on page init,
 * dramatically improving CLS and LCP (Core Web Vitals).
 */
export function YouTubeFacade({
  videoid,
  playlabel = "Putar video",
  thumbnailQuality = "maxresdefault",
}: {
  videoid: string;
  playlabel?: string;
  thumbnailQuality?: "maxresdefault" | "hqdefault" | "mqdefault";
}) {
  const [active, setActive] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoid}/${thumbnailQuality}.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoid}?autoplay=1&rel=0`;

  if (active) {
    return (
      <iframe
        src={embedUrl}
        title={playlabel}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-2xl"
      />
    );
  }

  return (
    <button
      onClick={() => setActive(true)}
      aria-label={playlabel}
      className="group absolute inset-0 w-full h-full rounded-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      {/* Thumbnail */}
      <Image
        src={thumbnailUrl}
        alt={playlabel}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Dark overlay */}
      <span className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
      {/* Play button */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center shadow-xl shadow-black/40 transition-transform duration-300 group-hover:scale-110">
          <Play className="w-7 h-7 text-white fill-white translate-x-0.5" />
        </span>
      </span>
    </button>
  );
}
