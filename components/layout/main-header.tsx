"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/components/ui/use-scroll";
import StaggeredMenu, { StaggeredMenuHandle } from "./StaggeredMenu";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { gsap } from "gsap";

export function MainHeader() {
  const scrolled = useScroll(10);
  const menuRef = useRef<StaggeredMenuHandle>(null);
  const [isOpen, setIsOpen] = useState(false);

  // GSAP icon refs
  const plusHRef = useRef<HTMLSpanElement>(null);
  const plusVRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  // Text scramble refs
  const textInnerRef = useRef<HTMLSpanElement>(null);
  const [textLines, setTextLines] = useState<string[]>(["Menu", "Close"]);

  // GSAP tween refs
  const spinTlRef = useRef<gsap.core.Timeline | null>(null);
  const textCycleRef = useRef<gsap.core.Tween | null>(null);

  const menuItems = [
    { label: "Home", ariaLabel: "Home", link: "/" },
    {
      label: "Profile",
      ariaLabel: "Profile PATRA",
      link: "/profile",
      children: [
        { label: "Badan Pengurus", link: "/profile/badanpengurus" },
        {
          label: "Badan Perwakilan Angkatan",
          link: "/profile/badanperwakilanangkatan",
        },
        { label: "Badan Kesenatoran", link: "/profile/badankesenatoran" },
      ],
    },
    { label: "Articles", ariaLabel: "News and Articles", link: "/articles" },
    { label: "Events", ariaLabel: "Events", link: "/events" },
    { label: "Academic", ariaLabel: "Academic Info", link: "/academic" },
  ];

  const { data: session } = useSession();

  if (!session?.user) {
    menuItems.push({ label: "Login", ariaLabel: "Login", link: "/login" });
  } else {
    const isAdmin =
      session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";
    if (isAdmin) {
      menuItems.push({
        label: "Admin",
        ariaLabel: "Admin Panel",
        link: "/admin",
      });
    }
  }

  const socialItems = [
    { label: "Instagram", link: "https://www.instagram.com/hmtmpatraitb/" },
    { label: "LinkedIn", link: "https://www.linkedin.com/company/hmtmpatra-itb" },
  ];

  // Initialise GSAP icon state
  useLayoutEffect(() => {
    gsap.set(plusHRef.current, { transformOrigin: "50% 50%", rotate: 0 });
    gsap.set(plusVRef.current, { transformOrigin: "50% 50%", rotate: 90 });
    gsap.set(iconRef.current, { rotate: 0, transformOrigin: "50% 50%" });
    gsap.set(textInnerRef.current, { yPercent: 0 });
  }, []);

  // Animate the +/× icon
  const animateIcon = useCallback((opening: boolean) => {
    spinTlRef.current?.kill();
    if (opening) {
      spinTlRef.current = gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .to(plusHRef.current, { rotate: 45, duration: 0.45 }, 0)
        .to(plusVRef.current, { rotate: -45, duration: 0.45 }, 0);
    } else {
      spinTlRef.current = gsap
        .timeline({ defaults: { ease: "power3.inOut" } })
        .to(plusHRef.current, { rotate: 0, duration: 0.3 }, 0)
        .to(plusVRef.current, { rotate: 90, duration: 0.3 }, 0);
    }
  }, []);

  // Animate the text scramble
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

  const handleToggle = () => {
    const next = !isOpen;
    menuRef.current?.toggle();
    animateIcon(next);
    animateText(next);
    // isOpen state is updated via onMenuOpen/onMenuClose callbacks
  };

  // Escape key close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        menuRef.current?.close();
        animateIcon(false);
        animateText(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, animateIcon, animateText]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 ease-out px-4 py-2 bg-white items-center",
          {
            "supports-backdrop-filter:bg-white/80 border-border backdrop-blur-lg border-b shadow-sm":
              scrolled && !isOpen,
            "md:top-4 md:max-w-6xl md:rounded-2xl md:mx-auto md:border":
              scrolled,
            "border-transparent": isOpen,
          },
        )}
      >
        <nav
          className={cn(
            "flex h-14 w-full container mx-auto items-center justify-between px-4 md:px-6 md:h-12 md:transition-all md:ease-out text-foreground",
            { "md:px-4": scrolled },
          )}
        >
          {/* Logo / wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity z-50"
          >
            <span className="font-bold tracking-tight text-lg hidden sm:block">
              PATRA Digital Hub
            </span>
          </Link>

          {/* GSAP-animated toggle button */}
          <button
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls="main-menu"
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
            className="relative z-50 flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors select-none cursor-pointer bg-transparent border-0 p-0"
          >
            {/* Scrambling text */}
            <span
              className="relative inline-block h-[1em] overflow-hidden whitespace-nowrap"
              aria-hidden="true"
            >
              <span
                ref={textInnerRef}
                className="flex flex-col leading-none"
                style={{ lineHeight: 1 }}
              >
                {textLines.map((l, i) => (
                  <span key={i} className="block h-[1em] leading-none">
                    {l}
                  </span>
                ))}
              </span>
            </span>

            {/* Morphing +/× icon */}
            <span
              ref={iconRef}
              className="relative w-3.5 h-3.5 inline-flex items-center justify-center"
              aria-hidden="true"
            >
              <span
                ref={plusHRef}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1.5px] bg-current rounded-sm"
              />
              <span
                ref={plusVRef}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1.5px] bg-current rounded-sm"
              />
            </span>
          </button>
        </nav>
      </header>

      <StaggeredMenu
        ref={menuRef}
        headless={true}
        items={menuItems}
        socialItems={socialItems}
        isFixed={true}
        displaySocials={true}
        displayItemNumbering={true}
        onMenuOpen={() => setIsOpen(true)}
        onMenuClose={() => setIsOpen(false)}
        className="font-sans font-medium"
        user={session?.user}
      />
    </>
  );
}
