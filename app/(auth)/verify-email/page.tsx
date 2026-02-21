import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  let status: "success" | "error" | "no-token" = "no-token";
  let message = "";

  if (token) {
    try {
      const verification = await prisma.verification.findFirst({
        where: {
          value: token,
          expiresAt: { gt: new Date() },
        },
      });

      if (!verification) {
        status = "error";
        message = "Link verifikasi tidak valid atau sudah kedaluwarsa.";
      } else {
        await prisma.user.update({
          where: { email: verification.identifier },
          data: { emailVerified: true },
        });

        await prisma.verification.delete({
          where: { id: verification.id },
        });

        status = "success";
        message =
          "Email Anda berhasil diverifikasi! Akun Anda sedang menunggu persetujuan admin.";
      }
    } catch (error) {
      console.error("Verification error:", error);
      status = "error";
      message = "Terjadi kesalahan saat memverifikasi email.";
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-3 text-center">
      {status === "no-token" && (
        <>
          <svg
            className="mb-2"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
          >
            <circle cx="24" cy="24" r="22" stroke="#fbbf24" strokeWidth="2" />
            <path
              d="M24 16V28M24 32V33"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <h2 className="text-2xl font-bold text-white font-heading">
            Token Tidak Ditemukan
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-[360px]">
            Link verifikasi tidak valid. Silakan cek kembali email Anda untuk
            link yang benar.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <svg
            className="mb-2"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
          >
            <circle cx="24" cy="24" r="22" stroke="#34d399" strokeWidth="2" />
            <path
              d="M16 24L22 30L32 18"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="text-2xl font-bold text-white font-heading">
            Verifikasi Berhasil!
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-[360px]">
            {message}
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <svg
            className="mb-2"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
          >
            <circle cx="24" cy="24" r="22" stroke="#f87171" strokeWidth="2" />
            <path
              d="M18 18L30 30M30 18L18 30"
              stroke="#f87171"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <h2 className="text-2xl font-bold text-white font-heading">
            Verifikasi Gagal
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-[360px]">
            {message}
          </p>
        </>
      )}

      <Link
        href="/login"
        className="mt-2 inline-block px-7 py-3 bg-gradient-to-r from-patra-600 to-patra-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
      >
        Ke Halaman Login
      </Link>
    </div>
  );
}
