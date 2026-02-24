import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";

export function MainFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                PDH
              </div>
              <span className="font-bold tracking-tight text-xl">
                PATRA Digital Hub
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Your central platform for all news, academic info, and events
              related to our community. Connect, grow, and achieve together.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://instagram.com/patra_undip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://linkedin.com/company/patra-undip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Features
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/articles"
                  className="hover:text-primary transition-colors"
                >
                  News & Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-primary transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  href="/academic"
                  className="hover:text-primary transition-colors"
                >
                  Academic Info
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-primary transition-colors"
                >
                  About PATRA
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@patra-undip.org"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} PATRA Digital Hub. All rights reserved.
          </p>
          <div className="text-xs text-muted-foreground flex gap-4">
            <span>Made with ✨ by the Dev Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
