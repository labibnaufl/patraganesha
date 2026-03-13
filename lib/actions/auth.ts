"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

// ============
// RATE LIMITER
// ============
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

type RateLimitEntry = { count: number; resetAt: number };
const loginAttempts = new Map<string, RateLimitEntry>();
const registerAttempts = new Map<string, RateLimitEntry>();

function checkRateLimit(
  map: Map<string, RateLimitEntry>,
  ip: string,
): { blocked: boolean; remaining: number } {
  const now = Date.now();
  const entry = map.get(ip);

  // Reset if window has expired
  if (!entry || now > entry.resetAt) {
    map.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { blocked: false, remaining: MAX_ATTEMPTS - 1 };
  }

  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    return { blocked: true, remaining: 0 };
  }

  return { blocked: false, remaining: MAX_ATTEMPTS - entry.count };
}

function resetRateLimit(map: Map<string, RateLimitEntry>, ip: string) {
  map.delete(ip);
}

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

// ============
// LOGIN
// ============
export async function loginAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const ip = await getClientIP();

  // 1. Check rate limit BEFORE validating credentials
  const { blocked } = checkRateLimit(loginAttempts, ip);
  if (blocked) {
    return {
      error:
        "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.",
    };
  }

  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate
    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });

    // Success — clear rate limit for this IP
    resetRateLimit(loginAttempts, ip);
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.cause?.err?.message) {
        case "BANNED":
          return {
            error:
              "Akun Anda telah diblokir. Hubungi admin untuk informasi lebih lanjut.",
          };
        case "EMAIL_NOT_VERIFIED":
          return { error: "Email belum diverifikasi. Silakan cek email Anda." };
        case "PENDING_APPROVAL":
          return { error: "Akun Anda menunggu persetujuan admin." };
        case "ACCOUNT_REJECTED":
          return {
            error:
              "Pendaftaran Anda ditolak. Hubungi admin untuk informasi lebih lanjut.",
          };
        default:
          return { error: "Email atau password salah." };
      }
    }
    // NEXT_REDIRECT error — let it propagate (this is expected for successful signIn)
    throw error;
  }
}

// ============
// REGISTER
// ============
export async function registerAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const ip = await getClientIP();

  // Rate limit registrations: max 3 per 15 min per IP
  const regEntry = registerAttempts.get(ip);
  const now = Date.now();
  if (regEntry && now <= regEntry.resetAt && regEntry.count >= 3) {
    return {
      error: "Terlalu banyak percobaan pendaftaran. Silakan coba lagi dalam 15 menit.",
    };
  }
  registerAttempts.set(ip, {
    count: (regEntry && now <= regEntry.resetAt ? regEntry.count : 0) + 1,
    resetAt: regEntry && now <= regEntry.resetAt ? regEntry.resetAt : now + WINDOW_MS,
  });

  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      nim: (formData.get("nim") as string) || undefined,
      generation: (formData.get("generation") as string) || undefined,
      major: (formData.get("major") as string) || undefined,
    };

    // Validate
    const parsed = registerSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }

    const { name, email, password, nim, generation, major } = parsed.data;

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      return { error: "Email sudah terdaftar." };
    }

    // Check existing NIM
    if (nim) {
      const existingNim = await prisma.user.findUnique({
        where: { nim },
      });
      if (existingNim) {
        return { error: "NIM sudah terdaftar." };
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with GUEST role + PENDING status
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "GUEST",
        status: "PENDING",
        emailVerified: false,
        nim: nim || null,
        generation: generation || null,
        major: major || null,
      },
    });

    // Generate and send verification email
    try {
      const token = await generateVerificationToken(email.toLowerCase());
      await sendVerificationEmail(email.toLowerCase(), token);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);

      // Rollback user creation since they won't be able to verify their email
      await prisma.user.delete({
        where: { id: newUser.id },
      });

      return {
        error:
          "Gagal mengirim email verifikasi karena masalah server. Silakan coba lagi nanti.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }
}

// ============
// LOGOUT
// ============
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
