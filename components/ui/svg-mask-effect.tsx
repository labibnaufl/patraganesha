"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const MaskContainer = ({
  children,
  revealText,
  size = 10,
  revealSize = 600,
  className,
}: {
  children?: string | React.ReactNode;
  revealText?: string | React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  // On touch / no-fine-pointer devices the mask is auto-revealed so users
  // on mobile always see the headline without needing to hover.
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `hover: none` means the primary pointer cannot hover (touch screens)
    const mq = window.matchMedia("(hover: none)");
    setIsTouchDevice(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const updateMousePosition = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  useEffect(() => {
    if (isTouchDevice) return; // no mouse events needed on touch
    const node = containerRef.current;
    if (!node) return;
    node.addEventListener("mousemove", updateMousePosition);
    return () => {
      node.removeEventListener("mousemove", updateMousePosition);
    };
  }, [updateMousePosition, isTouchDevice]);

  // On touch: always treat as "revealed"; the dark overlay is skipped entirely.
  const effectivelyRevealed = isTouchDevice || isHovered;
  const maskSize = effectivelyRevealed ? revealSize : size;

  // Touch devices: render a plain container with the revealText prominent
  // (children is the hover-prompt text, irrelevant on touch screens)
  if (isTouchDevice) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-white",
          className,
        )}
      >
        <div className="relative z-20 flex h-full w-full items-center justify-center">
          {revealText}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative h-screen", className)}
      animate={{
        backgroundColor: effectivelyRevealed ? "#0f172a" : "#ffffff",
      }}
      transition={{
        backgroundColor: { duration: 0.3 },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="pointer-events-none absolute flex h-full w-full items-center justify-center bg-black text-6xl mask-[url(/mask.svg)] mask-no-repeat mask-size-[40px]"
        animate={{
          maskPosition: `${mousePosition.x - maskSize / 2}px ${
            mousePosition.y - maskSize / 2
          }px`,
          maskSize: `${maskSize}px`,
        }}
        transition={{
          maskSize: { duration: 0.3, ease: "easeInOut" },
          maskPosition: { duration: 0, ease: "linear" },
        }}
      >
        <div className="absolute inset-0 z-0 h-full w-full bg-black opacity-50" />
        <div className="relative z-20 mx-auto max-w-4xl text-center text-4xl font-bold">
          {children}
        </div>
      </motion.div>

      <div className="pointer-events-auto flex h-full w-full items-center justify-center">
        {revealText}
      </div>
    </motion.div>
  );
};
