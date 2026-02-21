import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/app/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    default: "PATRA Digital Hub",
    template: "%s | PATRA Digital Hub",
  },
  description:
    "Platform digital Himpunan Mahasiswa Teknik Perminyakan ITB — berita, event, informasi akademik, dan komunitas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-body antialiased">
        <SessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
