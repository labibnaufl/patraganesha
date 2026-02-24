"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function incrementEventViewAction(slug: string) {
  try {
    await prisma.event.update({
      where: { slug, status: "PUBLISHED" },
      data: { views: { increment: 1 } },
    });
  } catch {
    // Silently fail
  }
}

export async function toggleEventReactionAction(
  eventId: string,
  type: "LIKE" | "DISLIKE",
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const userId = session.user.id;
  const existing = await prisma.reaction.findFirst({
    where: { eventId, userId },
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
    await prisma.reaction.create({ data: { eventId, userId, type } });
  }
  revalidatePath(`/events`);
}

export async function toggleEventBookmarkAction(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const userId = session.user.id;
  const existing = await prisma.bookmark.findFirst({
    where: { eventId, userId },
  });
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({ data: { eventId, userId } });
  }
  revalidatePath(`/events`);
}

export async function postEventCommentAction(eventId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const trimmed = content.trim();
  if (!trimmed || trimmed.length < 2)
    return { error: "Komentar terlalu pendek" };
  if (trimmed.length > 1000)
    return { error: "Komentar terlalu panjang (maks 1000 karakter)" };
  await prisma.comment.create({
    data: { eventId, userId: session.user.id, content: trimmed },
  });
  revalidatePath(`/events`);
  return { success: true };
}

export async function deleteEventCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Komentar tidak ditemukan" };
  const isOwner = comment.userId === session.user.id;
  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { error: "Tidak diizinkan" };
  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/events`);
  return { success: true };
}
