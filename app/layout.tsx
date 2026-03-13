import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/app/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://patra-digital-hub.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HMTM \"PATRA\" ITB",
    template: "%s | HMTM \"PATRA\" ITB",
  },
  description:
    "Platform digital Himpunan Mahasiswa Teknik Perminyakan ITB — berita, event, informasi akademik, dan komunitas.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "HMTM \"PATRA\" ITB",
    title: "HMTM \"PATRA\" ITB",
    description:
      "Platform digital Himpunan Mahasiswa Teknik Perminyakan ITB — berita, event, informasi akademik, dan komunitas.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HMTM \"PATRA\" ITB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HMTM \"PATRA\" ITB",
    description:
      "Platform digital Himpunan Mahasiswa Teknik Perminyakan ITB.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${bricolage.variable} ${plusJakarta.variable}`}>
      <body className="font-body antialiased">
        <SessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
