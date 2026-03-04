import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "PATRA Digital Hub — Autentikasi",
  description: "Login atau daftar ke PATRA Digital Hub",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-[440px] flex flex-col gap-8">
        {/* Brand */}
        <div className="text-center">
          {/* Logo + Text */}
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/images/logo.png"
              alt="PATRA Logo"
              width={48}
              height={48}
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0"
              priority
            />
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#FF6E00] tracking-[2px] sm:tracking-[3px] font-heading whitespace-nowrap">
              PATRA DIGITAL HUB
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Himpunan Mahasiswa Teknik Perminyakan "PATRA" ITB 
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-9 shadow-lg shadow-gray-200/80">
          {children}
        </div>
      </div>
    </div>
  );
}
