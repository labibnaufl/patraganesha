import Link from "next/link";
import { Instagram, Linkedin, Youtube } from "lucide-react";

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
              Platform terpusat untuk berita, informasi akademik, dan kegiatan
              komunitas PATRA Ganesha. Terhubung, berkembang, dan berprestasi
              bersama.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/hmtmpatraitb/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram PATRA"
                className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/hmtmpatra-itb/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn PATRA"
                className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@mediahmtmpatraitb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube PATRA"
                className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Fitur
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/articles"
                  className="hover:text-primary transition-colors"
                >
                  Berita &amp; Artikel
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-primary transition-colors"
                >
                  Kegiatan Mendatang
                </Link>
              </li>
              <li>
                <Link
                  href="/academic"
                  className="hover:text-primary transition-colors"
                >
                  Info Akademik
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-primary transition-colors"
                >
                  Tentang PATRA
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
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@patra-itb.org"
                  className="hover:text-primary transition-colors"
                >
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} PATRA Digital Hub. Seluruh hak cipta
            dilindungi.
          </p>
          <div className="text-xs text-muted-foreground flex gap-4">
            <span>
              Dibuat dengan ✨ oleh{" "}
              <a
                href="https://github.com/labibnaufl"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                @labibnugrh
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
