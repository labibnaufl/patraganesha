"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    undefined,
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-3 text-center">
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
          Pendaftaran Berhasil!
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-[320px]">
          Silakan cek email Anda untuk memverifikasi akun. Setelah email
          diverifikasi, admin akan meninjau pendaftaran Anda.
        </p>
        <Link
          href="/login"
          className="mt-2 inline-block px-7 py-3 bg-gradient-to-r from-patra-600 to-patra-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Kembali ke Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#FF6E00] font-heading">Daftar</h2>
      <p className="text-sm text-gray-400 mt-1 mb-7">
        Buat akun HMTM &quot;PATRA&quot; ITB
      </p>

      {state?.error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl text-[13px] leading-relaxed mb-5 bg-danger/10 border border-danger/20 text-red-300">
          <svg
            className="shrink-0 mt-0.5"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="8"
              cy="8"
              r="7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 4.5V8.5M8 10.5V11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-[18px]">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-[13px] font-bold text-black"
          >
            Nama Lengkap <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Nama lengkap Anda"
            className="auth-input w-full px-4 py-3 bg-[#FFEDDF] border border-[#FFD9B8] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-[#FF6E00] focus:ring-2 focus:ring-[#FF6E00]/20"
            required
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[13px] font-bold text-black"
          >
            Email <span className="text-danger">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
  className="auth-input w-full px-4 py-3 bg-[#FFEDDF] border border-[#FFD9B8] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-[#FF6E00] focus:ring-2 focus:ring-[#FF6E00]/20"
required
            autoComplete="email"
          />
        </div>

        {/* Password row */}
        <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-bold text-black"
            >
              Password <span className="text-danger">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 karakter"
            className="auth-input w-full px-4 py-3 bg-[#FFEDDF] border border-[#FFD9B8] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-[#FF6E00] focus:ring-2 focus:ring-[#FF6E00]/20"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-[13px] font-bold text-black"
            >
              Konfirmasi <span className="text-danger">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password"
            className="auth-input w-full px-4 py-3 bg-[#FFEDDF] border border-[#FFD9B8] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-[#FF6E00] focus:ring-2 focus:ring-[#FF6E00]/20"
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs font-bold text-black">
            Informasi Mahasiswa
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* NIM + Generation */}
        <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="nim"
              className="text-[13px] font-bold text-black"
            >
              NIM
            </label>
            <input
              id="nim"
              name="nim"
              type="text"
              placeholder="12345678"
            className="auth-input w-full px-4 py-3 bg-[#FFEDDF] border border-[#FFD9B8] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-[#FF6E00] focus:ring-2 focus:ring-[#FF6E00]/20"
              maxLength={8}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="generation"
              className="text-[13px] font-bold text-black"
            >
              Angkatan
            </label>
            <input
              id="generation"
              name="generation"
              type="number"
              placeholder="2024"
            className="auth-input w-full px-4 py-3 bg-[#FFEDDF] border border-[#FFD9B8] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-[#FF6E00] focus:ring-2 focus:ring-[#FF6E00]/20"
              min={2000}
              max={2030}
            />
          </div>
        </div>

        {/* Major */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="major"
            className="text-[13px] font-bold text-black"
          >
            Program Studi
          </label>
          <input
            id="major"
            name="major"
            type="text"
            placeholder="Teknik Perminyakan"
            className="w-full px-3.5 py-[11px] bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 outline-none transition-all focus:border-patra-500 focus:ring-3 focus:ring-patra-500/15"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 mt-1 bg-black text-white text-[15px] font-semibold rounded-xl cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </span>
          ) : (
            "Daftar"
          )}
        </button>
      </form>

      <p className="text-center text-[13px] text-gray-400 mt-6">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-patra-300 font-medium hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
