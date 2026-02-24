"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Instagram, Linkedin, Github, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion } from "motion/react";

export interface StaggeredMenuHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

interface MenuItem {
  label: string;
  ariaLabel: string;
  link: string;
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

const StaggeredMenu = forwardRef<StaggeredMenuHandle, StaggeredMenuProps>(
  (
    {
      items,
      socialItems = [],
      isFixed = true,
      displaySocials = true,
      displayItemNumbering = true,
      colors = ["#2563eb", "#1d4ed8", "#1e40af"],
      accentColor = "#3b82f6",
      onMenuOpen,
      onMenuClose,
      className,
      user,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const isOpenRef = useRef(isOpen);
    isOpenRef.current = isOpen;

    useImperativeHandle(ref, () => ({
      toggle: () => {
        const nextState = !isOpenRef.current;
        setIsOpen(nextState);
        if (nextState) onMenuOpen?.();
        else onMenuClose?.();
      },
      open: () => {
        setIsOpen(true);
        onMenuOpen?.();
      },
      close: () => {
        setIsOpen(false);
        onMenuClose?.();
      },
    }));

    if (!isOpen) return null;

    return (
      <div
        id="main-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi"
        className={cn(
          "bg-background text-foreground flex flex-col justify-center px-8 sm:px-12 z-40 overflow-hidden border-l border-border shadow-2xl transition-all duration-300",
          isFixed
            ? "fixed top-0 right-0 bottom-0"
            : "absolute top-0 right-0 bottom-0",
          "w-full sm:w-100 md:w-112.5",
          className,
        )}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-linear-to-br from-primary/20 via-background to-secondary/20" />
        <nav className="relative z-10 w-full flex flex-col items-start gap-6 pt-16 mt-16 md:mt-0 md:pt-0">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={item.link}
                aria-label={item.ariaLabel}
                className="group flex items-center gap-4 text-3xl md:text-5xl font-bold tracking-tighter hover:text-primary transition-colors duration-300"
                onClick={() => {
                  setIsOpen(false);
                  onMenuClose?.();
                }}
              >
                {displayItemNumbering && (
                  <span className="text-muted-foreground/50 text-xl md:text-2xl font-mono">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                )}
                <span>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {user && (
          <div className="absolute w-full bottom-0 left-0 p-8 border-t border-border/50 bg-background/50 backdrop-blur-md flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 text-lg rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground/80 lowercase">
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
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  },
);

StaggeredMenu.displayName = "StaggeredMenu";

export default StaggeredMenu;
