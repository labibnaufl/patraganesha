"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { verifyEmailAction } from "../_lib/actions";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    verifyEmailAction(token).then((result) => {
      setStatus(result.status);
      setMessage(result.message);
    });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-3 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-700 mb-4 mx-auto" />
          <div className="h-6 w-48 bg-gray-700 rounded mb-2 mx-auto" />
          <div className="h-4 w-64 bg-gray-700 rounded mx-auto" />
        </div>
      </div>
    );
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
