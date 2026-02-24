"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── View Counter ────────────────────────────────────────────────────────────

export async function incrementViewAction(slug: string) {
  try {
    await prisma.article.update({
      where: { slug, status: "PUBLISHED" },
      data: { views: { increment: 1 } },
    });
  } catch {
    // Silently fail — don't surface view count errors to users
  }
}

// ─── Reactions ───────────────────────────────────────────────────────────────

export async function toggleReactionAction(
  articleId: string,
  type: "LIKE" | "DISLIKE",
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };

  const userId = session.user.id;

  const existing = await prisma.reaction.findFirst({
    where: { articleId, userId },
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
    await prisma.reaction.create({ data: { articleId, userId, type } });
  }

  revalidatePath(`/articles`);
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export async function toggleBookmarkAction(articleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };

  const userId = session.user.id;

  const existing = await prisma.bookmark.findFirst({
    where: { articleId, userId },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({ data: { articleId, userId } });
  }

  revalidatePath(`/articles`);
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function postCommentAction(articleId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };

  const trimmed = content.trim();
  if (!trimmed || trimmed.length < 2)
    return { error: "Komentar terlalu pendek" };
  if (trimmed.length > 1000)
    return { error: "Komentar terlalu panjang (maks 1000 karakter)" };

  await prisma.comment.create({
    data: {
      articleId,
      userId: session.user.id, // ← correct field name per schema
      content: trimmed, // ← correct field name per schema
    },
  });

  revalidatePath(`/articles`);
  return { success: true };
}

export async function deleteCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Komentar tidak ditemukan" };

  const isOwner = comment.userId === session.user.id; // ← correct field name
  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) return { error: "Tidak diizinkan" };

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/articles`);
  return { success: true };
}
