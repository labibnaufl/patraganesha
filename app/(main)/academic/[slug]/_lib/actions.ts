"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function incrementAcademicViewAction(slug: string) {
  try {
    await prisma.academicInfo.update({
      where: { slug, status: "PUBLISHED" },
      data: { views: { increment: 1 } },
    });
  } catch {
    // Silently fail
  }
}

export async function toggleAcademicReactionAction(
  academicInfoId: string,
  type: "LIKE" | "DISLIKE",
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const userId = session.user.id;
  const existing = await prisma.reaction.findFirst({
    where: { academicInfoId, userId },
  });
  if (existing) {
    if (existing.type === type) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.reaction.update({
        where: { id: existing.id },
        data: { type },
      });
    }
  } else {
    await prisma.reaction.create({ data: { academicInfoId, userId, type } });
  }
  revalidatePath(`/academic`);
}

export async function toggleAcademicBookmarkAction(academicInfoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const userId = session.user.id;
  const existing = await prisma.bookmark.findFirst({
    where: { academicInfoId, userId },
  });
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({ data: { academicInfoId, userId } });
  }
  revalidatePath(`/academic`);
}

export async function postAcademicCommentAction(
  academicInfoId: string,
  content: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const trimmed = content.trim();
  if (!trimmed || trimmed.length < 2)
    return { error: "Komentar terlalu pendek" };
  if (trimmed.length > 1000)
    return { error: "Komentar terlalu panjang (maks 1000 karakter)" };
  await prisma.comment.create({
    data: { academicInfoId, userId: session.user.id, content: trimmed },
  });
  revalidatePath(`/academic`);
  return { success: true };
}

export async function deleteAcademicCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Komentar tidak ditemukan" };
  const isOwner = comment.userId === session.user.id;
  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { error: "Tidak diizinkan" };
  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/academic`);
  return { success: true };
}
