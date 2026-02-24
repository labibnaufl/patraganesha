"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface TextTypeProps {
  /** Lines to type in sequence, separated visually by newlines. */
  lines: string[];
  /** Optional Tailwind class(es) applied per line, indexed by line position. */
  lineClassNames?: string[];
  /** ms per character while typing. Default 38. */
  typingSpeed?: number;
  /** ms delay before typing starts. Default 400. */
  initialDelay?: number;
  /** If true, erase and retype forever. Default false. */
  loop?: boolean;
  /** ms pause after completing all lines before erasing (loop only). Default 1800. */
  loopDelay?: number;
  /** ms per character while erasing. Default 20. */
  deletingSpeed?: number;
  /** Blinking cursor character. Default '|'. */
  cursorCharacter?: string;
  /** Extra Tailwind classes on the outer <h1>. */
  className?: string;
  /** GSAP blink duration in seconds. Default 0.5. */
  cursorBlinkDuration?: number;
}

export default function TextType({
  lines,
  lineClassNames = [],
  typingSpeed = 38,
  initialDelay = 400,
  loop = false,
  loopDelay = 1800,
  deletingSpeed = 20,
  cursorCharacter = "|",
  className = "",
  cursorBlinkDuration = 0.5,
}: TextTypeProps) {
  const fullText = lines.join("\n");
  const [displayed, setDisplayed] = useState("");
  const cursorRef = useRef<HTMLSpanElement>(null);

  // ── All mutable animation state in a single ref so we never get stale closures ──
  const stateRef = useRef({
    index: 0,
    phase: "idle" as "idle" | "typing" | "pausing" | "deleting",
    timer: null as ReturnType<typeof setTimeout> | null,
  });

  // GSAP cursor blink — runs once on mount
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    gsap.set(el, { opacity: 1 });
    const tween = gsap.to(el, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
    return () => {
      tween.kill();
    };
  }, [cursorBlinkDuration]);

  // ── Main typing engine ────────────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;

    function schedule(fn: () => void, delay: number) {
      s.timer = setTimeout(fn, delay);
    }

    function tick() {
      if (s.phase === "typing") {
        if (s.index < fullText.length) {
          s.index += 1;
          setDisplayed(fullText.slice(0, s.index));
          schedule(tick, typingSpeed);
        } else if (loop) {
          s.phase = "pausing";
          schedule(() => {
            s.phase = "deleting";
            tick();
          }, loopDelay);
        }
        // non-loop: done — cursor stays visible
      } else if (s.phase === "deleting") {
        if (s.index > 0) {
          s.index -= 1;
          setDisplayed(fullText.slice(0, s.index));
          schedule(tick, deletingSpeed);
        } else {
          s.phase = "typing";
          schedule(tick, typingSpeed);
        }
      }
    }

    // Start
    s.phase = "idle";
    s.index = 0;
    schedule(() => {
      s.phase = "typing";
      tick();
    }, initialDelay);

    return () => {
      if (s.timer) clearTimeout(s.timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText, typingSpeed, initialDelay, loop, loopDelay, deletingSpeed]);
  // NOTE: we intentionally omit `tick` from deps — it's defined inside the effect.

  // Split the displayed flat string back into per-line spans
  const renderedLines = displayed.split("\n");

  return (
    <h1
      className={`font-bold leading-[1.15] tracking-tight text-slate-900 ${className}`}
    >
      {renderedLines.map((line, i) => (
        <span key={i} className={`block ${lineClassNames[i] ?? ""}`}>
          {/* Render line content; nbsp keeps the block from collapsing on empty lines */}
          {line || "\u00A0"}
          {/* Cursor lives at the very end of the last rendered line */}
          {i === renderedLines.length - 1 && (
            <span
              ref={cursorRef}
              aria-hidden="true"
              className="ml-px inline-block align-baseline text-brand-primary select-none"
            >
              {cursorCharacter}
            </span>
          )}
        </span>
      ))}
    </h1>
  );
}
