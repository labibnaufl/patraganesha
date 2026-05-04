"use server";

import { prisma } from "@/lib/prisma";

export async function verifyEmailAction(token: string) {
  try {
    const verification = await prisma.verification.findFirst({
      where: {
        value: token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return {
        status: "error" as const,
        message: "Link verifikasi tidak valid atau sudah kedaluwarsa.",
      };
    }

    await prisma.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: true },
    });

    await prisma.verification.delete({
      where: { id: verification.id },
    });

    return {
      status: "success" as const,
      message:
        "Email Anda berhasil diverifikasi! Akun Anda sedang menunggu persetujuan admin.",
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      status: "error" as const,
      message: "Terjadi kesalahan saat memverifikasi email.",
    };
  }
}
