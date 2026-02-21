"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div >
      <h2 className="text-2xl font-bold text-[#FF6E00] font-heading">Masuk </h2>
      <p className="text-sm text-gray-400 mt-1 mb-7">
        Masuk ke akun PATRA Digital Hub Anda
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

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[13px] font-medium text-black"
          >
            Email
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

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[13px] font-medium text-black"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="auth-input w-full px-4 py-3 bg-[#FFEDDF] border border-[#FFD9B8] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-[#FF6E00] focus:ring-2 focus:ring-[#FF6E00]/20"
            required
            autoComplete="current-password"
          />
        </div>

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
            "Masuk"
          )}
        </button>
      </form>

      <p className="text-center text-[13px] text-gray-400 mt-6">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-patra-300 font-medium hover:underline"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}
