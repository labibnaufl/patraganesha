"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LogOut, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "gsap";

// ─── Public handle ────────────────────────────────────────────────────────────
export interface StaggeredMenuHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

// ─── Internal types ───────────────────────────────────────────────────────────
interface SubItem {
  label: string;
  link: string;
}
interface MenuItem {
  label: string;
  ariaLabel: string;
  link: string;
  children?: SubItem[];
}
interface SocialItem {
  label: string;
  link: string;
}
interface StaggeredMenuProps {
  headless?: boolean;
  items: MenuItem[];
  socialItems?: SocialItem[];
  isFixed?: boolean;
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  colors?: string[];
  accentColor?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  className?: string;
  user?: any;
}

// ─── Component ────────────────────────────────────────────────────────────────
const StaggeredMenu = forwardRef<StaggeredMenuHandle, StaggeredMenuProps>(
  (
    {
      items,
      socialItems = [],
      isFixed = true,
      displaySocials = true,
      displayItemNumbering = true,
      colors = ["#f97316", "#ea580c"],
      accentColor = "#f97316",
      onMenuOpen,
      onMenuClose,
      className,
      user,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const [textLines, setTextLines] = useState<string[]>(["Menu", "Close"]);

    const isOpenRef = useRef(false);
    const busyRef = useRef(false);

    // DOM refs
    const panelRef = useRef<HTMLDivElement>(null);
    const preLayersRef = useRef<HTMLDivElement>(null);

    // Icon refs
    const plusHRef = useRef<HTMLSpanElement>(null);
    const plusVRef = useRef<HTMLSpanElement>(null);
    const iconRef = useRef<HTMLSpanElement>(null);

    // Text scramble refs
    const textInnerRef = useRef<HTMLSpanElement>(null);

    // GSAP timeline refs
    const openTlRef = useRef<gsap.core.Timeline | null>(null);
    const closeTweenRef = useRef<gsap.core.Tween | null>(null);
    const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
    const textCycleRef = useRef<gsap.core.Tween | null>(null);

    // ── GSAP initial setup (runs once after mount) ──────────────────────────
    useLayoutEffect(() => {
      if (!mounted) return;
      const ctx = gsap.context(() => {
        const panel = panelRef.current;
        const preContainer = preLayersRef.current;
        if (!panel) return;

        const preLayers = preContainer
          ? Array.from(
              preContainer.querySelectorAll<HTMLElement>(".sm-prelayer"),
            )
          : [];

        gsap.set([panel, ...preLayers], { xPercent: 100 });
        gsap.set(plusHRef.current, { transformOrigin: "50% 50%", rotate: 0 });
        gsap.set(plusVRef.current, { transformOrigin: "50% 50%", rotate: 90 });
        gsap.set(iconRef.current, { rotate: 0, transformOrigin: "50% 50%" });
        gsap.set(textInnerRef.current, { yPercent: 0 });
      });
      return () => ctx.revert();
    }, [mounted]);

    // ── Build open timeline ─────────────────────────────────────────────────
    const buildOpenTimeline = useCallback(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return null;

      openTlRef.current?.kill();
      closeTweenRef.current?.kill();

      const preLayers = preContainer
        ? Array.from(preContainer.querySelectorAll<HTMLElement>(".sm-prelayer"))
        : [];

      const itemEls = Array.from(
        panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"),
      );
      const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
      const socialLinks = Array.from(
        panel.querySelectorAll<HTMLElement>(".sm-socials-link"),
      );

      if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 8 });
      if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
      if (socialLinks.length) gsap.set(socialLinks, { y: 20, opacity: 0 });

      const layerStates = preLayers.map((el) => ({
        el,
        start: Number(gsap.getProperty(el, "xPercent")),
      }));
      const panelStart = Number(gsap.getProperty(panel, "xPercent"));

      const tl = gsap.timeline({ paused: true });

      // Pre-layers stagger in
      layerStates.forEach((ls, i) => {
        tl.fromTo(
          ls.el,
          { xPercent: ls.start },
          { xPercent: 0, duration: 0.42, ease: "power4.out" },
          i * 0.07,
        );
      });

      const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
      const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
      const panelDuration = 0.6;

      // Main panel slides in
      tl.fromTo(
        panel,
        { xPercent: panelStart },
        { xPercent: 0, duration: panelDuration, ease: "power4.out" },
        panelInsertTime,
      );

      // Items clip-up entrance
      if (itemEls.length) {
        const itemsStart = panelInsertTime + panelDuration * 0.18;
        tl.to(
          itemEls,
          {
            yPercent: 0,
            rotate: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger: { each: 0.08, from: "start" },
          },
          itemsStart,
        );
      }

      // Socials fade up
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle)
        tl.to(
          socialTitle,
          { opacity: 1, duration: 0.4, ease: "power2.out" },
          socialsStart,
        );
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
            stagger: { each: 0.07 },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: "opacity" });
            },
          },
          socialsStart + 0.04,
        );
      }

      openTlRef.current = tl;
      return tl;
    }, []);

    // ── Play open ────────────────────────────────────────────────────────────
    const playOpen = useCallback(() => {
      if (busyRef.current) return;
      busyRef.current = true;
      const tl = buildOpenTimeline();
      if (tl) {
        tl.eventCallback("onComplete", () => {
          busyRef.current = false;
        });
        tl.play(0);
      } else {
        busyRef.current = false;
      }
    }, [buildOpenTimeline]);

    // ── Play close ───────────────────────────────────────────────────────────
    const playClose = useCallback(() => {
      openTlRef.current?.kill();
      openTlRef.current = null;

      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return;

      const preLayers = preContainer
        ? Array.from(preContainer.querySelectorAll<HTMLElement>(".sm-prelayer"))
        : [];

      closeTweenRef.current?.kill();
      closeTweenRef.current = gsap.to([...preLayers, panel], {
        xPercent: 100,
        duration: 0.3,
        ease: "power3.in",
        overwrite: "auto",
        onComplete: () => {
          // Reset item positions for next open
          const itemEls = Array.from(
            panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"),
          );
          if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 8 });

          const socialTitle =
            panel.querySelector<HTMLElement>(".sm-socials-title");
          const socialLinks = Array.from(
            panel.querySelectorAll<HTMLElement>(".sm-socials-link"),
          );
          if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
          if (socialLinks.length) gsap.set(socialLinks, { y: 20, opacity: 0 });

          busyRef.current = false;
          setIsOpen(false);
          setOpenDropdown(null);
        },
      });
    }, []);

    // ── Icon morph ───────────────────────────────────────────────────────────
    const animateIcon = useCallback((opening: boolean) => {
      spinTweenRef.current?.kill();
      if (opening) {
        spinTweenRef.current = gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .to(plusHRef.current, { rotate: 45, duration: 0.45 }, 0)
          .to(plusVRef.current, { rotate: -45, duration: 0.45 }, 0);
      } else {
        spinTweenRef.current = gsap
          .timeline({ defaults: { ease: "power3.inOut" } })
          .to(plusHRef.current, { rotate: 0, duration: 0.3 }, 0)
          .to(plusVRef.current, { rotate: 90, duration: 0.3 }, 0);
      }
    }, []);

    // ── Text scramble ────────────────────────────────────────────────────────
    const animateText = useCallback((opening: boolean) => {
      const inner = textInnerRef.current;
      if (!inner) return;
      textCycleRef.current?.kill();

      const from = opening ? "Menu" : "Close";
      const to = opening ? "Close" : "Menu";
      const seq = [from];
      let last = from;
      for (let i = 0; i < 3; i++) {
        last = last === "Menu" ? "Close" : "Menu";
        seq.push(last);
      }
      if (last !== to) seq.push(to);
      seq.push(to);

      setTextLines(seq);
      gsap.set(inner, { yPercent: 0 });

      const finalShift = ((seq.length - 1) / seq.length) * 100;
      textCycleRef.current = gsap.to(inner, {
        yPercent: -finalShift,
        duration: 0.45 + seq.length * 0.06,
        ease: "power4.out",
      });
    }, []);

    // ── Core toggle logic ────────────────────────────────────────────────────
    const doOpen = useCallback(() => {
      setMounted(true);
      setIsOpen(true);
      isOpenRef.current = true;
      onMenuOpen?.();
      // GSAP runs after the panel mounts — triggered via a small rAF
      requestAnimationFrame(() => playOpen());
      animateIcon(true);
      animateText(true);
    }, [playOpen, animateIcon, animateText, onMenuOpen]);

    const doClose = useCallback(() => {
      isOpenRef.current = false;
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateText(false);
    }, [playClose, animateIcon, animateText, onMenuClose]);

    const handleToggle = useCallback(() => {
      if (isOpenRef.current) doClose();
      else doOpen();
    }, [doOpen, doClose]);

    // ── Imperative handle ────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      toggle: handleToggle,
      open: doOpen,
      close: doClose,
    }));

    if (!isOpen && !mounted) return null;

    return (
      <>
        {/* ── Overlay ─────────────────────────────────────────────────── */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
            onClick={doClose}
            aria-hidden="true"
          />
        )}

        {/* ── Pre-layers + Panel wrapper ─────────────────────────────── */}
        <div
          className={cn(
            "fixed top-0 right-0 bottom-0 z-40 pointer-events-none",
            "w-full sm:w-[min(420px,90vw)]",
          )}
          style={
            accentColor
              ? ({ "--sm-accent": accentColor } as React.CSSProperties)
              : undefined
          }
        >
          {/* Color pre-layers */}
          <div
            ref={preLayersRef}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {(() => {
              // Remove the middle layer so only 2 pre-layers show
              const raw = colors.slice(0, 4);
              let arr = [...raw];
              if (arr.length >= 3) {
                arr.splice(Math.floor(arr.length / 2), 1);
              }
              return arr.map((c, i) => (
                <div
                  key={i}
                  className="sm-prelayer absolute inset-0"
                  style={{ background: c }}
                />
              ));
            })()}
          </div>

          {/* Main panel */}
          <aside
            id="main-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu Navigasi"
            className={cn(
              "absolute inset-0 pointer-events-auto",
              "bg-background border-l border-border shadow-2xl",
              "flex flex-col overflow-y-auto overflow-x-hidden",
              "pt-24 pb-8 px-8 sm:px-12",
              className,
            )}
            aria-hidden={!isOpen}
          >
            {/* Subtle gradient */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-linear-to-br from-primary/20 via-background to-secondary/20" />

            {/* Nav items */}
            <nav className="relative z-10 w-full flex flex-col items-start gap-5 flex-1">
              {items.map((item, index) => {
                const hasChildren = item.children && item.children.length > 0;
                const isDropdownOpen = openDropdown === index;

                return (
                  <div
                    key={index}
                    className="sm-panel-itemWrap relative overflow-hidden w-full leading-none"
                  >
                    {hasChildren ? (
                      <div className="w-full">
                        <button
                          onClick={() =>
                            setOpenDropdown(isDropdownOpen ? null : index)
                          }
                          aria-expanded={isDropdownOpen}
                          className="group flex items-center gap-4 cursor-pointer font-bold text-[clamp(2rem,5vw,3.5rem)] tracking-tighter uppercase leading-none hover:text-primary transition-colors duration-200 w-full text-left pr-6"
                        >
                          {displayItemNumbering && (
                            <span
                              className="text-muted-foreground/40 text-base font-mono leading-none"
                              style={{
                                opacity: "var(--sm-num-opacity, 1)",
                                color: accentColor,
                              }}
                            >
                              {(index + 1).toString().padStart(2, "0")}
                            </span>
                          )}
                          <span className="sm-panel-itemLabel inline-block will-change-transform flex-1">
                            {item.label}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-5 h-5 shrink-0 transition-transform duration-300 text-muted-foreground/50",
                              isDropdownOpen && "rotate-180 text-primary",
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{
                                duration: 0.28,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="overflow-hidden"
                            >
                              <div
                                className="flex flex-col gap-2 pl-10 pt-3 pb-1 mt-2 border-l-2 ml-10"
                                style={{ borderColor: accentColor + "55" }}
                              >
                                {item.children!.map((child, ci) => (
                                  <motion.div
                                    key={ci}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay: ci * 0.06,
                                      duration: 0.22,
                                    }}
                                  >
                                    <Link
                                      href={child.link}
                                      onClick={doClose}
                                      className="block text-base font-semibold text-muted-foreground hover:text-primary transition-colors py-1"
                                    >
                                      {child.label}
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.link}
                        aria-label={item.ariaLabel}
                        className="group flex items-center gap-4 cursor-pointer font-bold text-[clamp(2rem,5vw,3.5rem)] tracking-tighter uppercase leading-none hover:text-primary transition-colors duration-200"
                        onClick={doClose}
                      >
                        {displayItemNumbering && (
                          <span
                            className="text-base font-mono leading-none"
                            style={{
                              opacity: "var(--sm-num-opacity, 1)",
                              color: accentColor,
                            }}
                          >
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                        )}
                        <span className="sm-panel-itemLabel inline-block will-change-transform">
                          {item.label}
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Socials */}
            {displaySocials && socialItems.length > 0 && (
              <div className="sm-socials relative z-10 mt-auto pt-8 flex flex-col gap-3">
                <h3
                  className="sm-socials-title m-0 text-sm font-semibold uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  Socials
                </h3>
                <ul className="flex flex-row flex-wrap gap-5 list-none m-0 p-0">
                  {socialItems.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-socials-link text-base font-semibold text-foreground/80 hover:text-primary transition-colors no-underline"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* User footer */}
            {user && (
              <div className="relative z-10 mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 text-sm rounded-full flex items-center justify-center font-bold shrink-0 text-white"
                    style={{ background: accentColor }}
                  >
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground/70 lowercase">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-full shrink-0"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </button>
              </div>
            )}
          </aside>
        </div>

        {/* Clip-up entrance CSS */}
        <style>{`
          .sm-panel-itemWrap { clip-path: inset(0 0 -20% 0); }
        `}</style>
      </>
    );
  },
);

StaggeredMenu.displayName = "StaggeredMenu";
export default StaggeredMenu;
