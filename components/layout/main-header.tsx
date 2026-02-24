"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScroll } from "@/components/ui/use-scroll";
import { Menu, X, Sun, Moon } from "lucide-react";
import StaggeredMenu, { StaggeredMenuHandle } from "./StaggeredMenu";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export function MainHeader() {
  const scrolled = useScroll(10);
  const menuRef = useRef<StaggeredMenuHandle>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  const menuItems = [
    { label: "Home", ariaLabel: "Home", link: "/" },
    { label: "Profile PATRA", ariaLabel: "Profile PATRA", link: "/profile" },
    { label: "Articles", ariaLabel: "News and Articles", link: "/articles" },
    { label: "Events", ariaLabel: "Events", link: "/events" },
    { label: "Academic Info", ariaLabel: "Academic Info", link: "/academic" },
  ];

  const { data: session } = useSession();

  // Close menu on Escape key — required by ARIA modal pattern
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        menuRef.current?.close();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Dynamically push auth links to the navigation menu
  if (!session?.user) {
    menuItems.push({
      label: "Login",
      ariaLabel: "Login",
      link: "/login",
    });
  } else {
    const isSpecialAdmin =
      session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";
    if (isSpecialAdmin) {
      menuItems.push({
        label: "Admin Panel",
        ariaLabel: "Admin Panel",
        link: "/admin",
      });
    }
  }

  const socialItems = [
    { label: "Instagram", link: "https://instagram.com/patra_undip" },
    { label: "LinkedIn", link: "https://linkedin.com/company/patra-undip" },
  ];

  const handleToggle = () => {
    menuRef.current?.toggle();
  };

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
            {
              "md:px-4": scrolled,
            },
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity z-50"
          >
            {/* Adding fallback dynamic gradient circle for now just in case the logo isn't available */}
            <span className="font-bold tracking-tight text-lg hidden sm:block">
              PATRA Digital Hub
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              aria-expanded={isOpen}
              aria-controls="main-menu"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              className="relative h-10 w-10 overflow-hidden z-50 hover:bg-secondary/50 rounded-full transition-colors"
            >
              <Menu
                className={cn(
                  "h-6 w-6 absolute transition-all duration-300 ease-in-out",
                  isOpen
                    ? "rotate-90 opacity-0 scale-50"
                    : "rotate-0 opacity-100 scale-100",
                )}
              />

              <X
                className={cn(
                  "h-6 w-6 absolute transition-all duration-300 ease-in-out",
                  isOpen
                    ? "rotate-0 opacity-100 scale-100"
                    : "-rotate-90 opacity-0 scale-50",
                )}
              />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
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
