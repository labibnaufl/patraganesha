"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { articleSchema } from "./validations";
import { createAdminLog } from "@/lib/admin-log";

// ==================
// Auth Guard
// ==================
async function requireAdminAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ==================
// Helpers
// ==================
function calculateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function generateUniqueSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (!existing) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
}

// ==================
// CREATE
// ==================
export async function createArticle(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireAdminAction();

  // Cover image: pre-uploaded by client via /api/upload, we just read the URL
  const coverImage = (formData.get("coverImage") as string) || undefined;

  const raw = {
    title: formData.get("title") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    coverImage,
    tagIds: formData.getAll("tagIds") as string[],
    metaTitle: formData.get("metaTitle") as string,
    metaDescription: formData.get("metaDescription") as string,
    keywords: formData.get("keywords") as string,
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const {
    title,
    excerpt,
    content,
    category,
    tagIds,
    metaTitle,
    metaDescription,
    keywords,
  } = parsed.data;

  const slug = await generateUniqueSlug(title);
  const readTime = calculateReadTime(content);
  const keywordsArray = keywords
    ? keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const shouldPublish = formData.get("action") === "publish";

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      category: category as "ENERGI" | "NON_ENERGI" | "UMUM",
      coverImage,
      status: shouldPublish ? "PUBLISHED" : "DRAFT",
      publishedAt: shouldPublish ? new Date() : null,
      readTime,
      authorId: session.user.id,
      reviewerId: shouldPublish ? session.user.id : null,
      reviewedAt: shouldPublish ? new Date() : null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      keywords: keywordsArray,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  await createAdminLog({
    adminId: session.user.id,
    action: shouldPublish ? "PUBLISH" : "CREATE",
    entity: "Article",
    entityId: article.id,
    details: `${shouldPublish ? "Published" : "Created draft"}: "${title}"`,
  });

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

// ==================
// UPDATE
// ==================
export async function updateArticle(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireAdminAction();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { error: "Artikel tidak ditemukan." };

  // Cover image: pre-uploaded by client via /api/upload, we just read the URL
  const coverImageValue = (formData.get("coverImage") as string) || undefined;
  const coverImage: string | undefined =
    coverImageValue || article.coverImage || undefined;

  const raw = {
    title: formData.get("title") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    coverImage,
    tagIds: formData.getAll("tagIds") as string[],
    metaTitle: formData.get("metaTitle") as string,
    metaDescription: formData.get("metaDescription") as string,
    keywords: formData.get("keywords") as string,
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const {
    title,
    excerpt,
    content,
    category,
    tagIds,
    metaTitle,
    metaDescription,
    keywords,
  } = parsed.data;

  const slug = await generateUniqueSlug(title, id);
  const readTime = calculateReadTime(content);
  const keywordsArray = keywords
    ? keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const shouldPublish = formData.get("action") === "publish";
  const wasPublished = article.status === "PUBLISHED";

  // Neon HTTP adapter does not support transactions — use sequential awaits
  await prisma.articleTag.deleteMany({ where: { articleId: id } });
  await prisma.article.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      category: category as "ENERGI" | "NON_ENERGI" | "UMUM",
      coverImage,
      status: shouldPublish
        ? "PUBLISHED"
        : wasPublished
          ? "PUBLISHED"
          : "DRAFT",
      publishedAt:
        shouldPublish && !wasPublished ? new Date() : article.publishedAt,
      readTime,
      reviewerId: shouldPublish ? session.user.id : article.reviewerId,
      reviewedAt: shouldPublish ? new Date() : article.reviewedAt,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      keywords: keywordsArray,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE",
    entity: "Article",
    entityId: id,
    details: `Updated article: "${title}"`,
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
  redirect("/admin/articles");
}

// ==================
// PUBLISH
// ==================
export async function publishArticle(id: string) {
  const session = await requireAdminAction();

  const article = await prisma.article.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      reviewerId: session.user.id,
      reviewedAt: new Date(),
    },
  });

  await createAdminLog({
    adminId: session.user.id,
    action: "PUBLISH",
    entity: "Article",
    entityId: id,
    details: `Published article: "${article.title}"`,
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
}

// ==================
// ARCHIVE
// ==================
export async function archiveArticle(id: string) {
  const session = await requireAdminAction();

  const article = await prisma.article.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  await createAdminLog({
    adminId: session.user.id,
    action: "ARCHIVE",
    entity: "Article",
    entityId: id,
    details: `Archived article: "${article.title}"`,
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
}

export async function revertToDraft(id: string) {
  const session = await requireAdminAction();

  const article = await prisma.article.update({
    where: { id },
    data: { status: "DRAFT", publishedAt: null },
  });

  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE",
    entity: "Article",
    entityId: id,
    details: `Reverted to draft: "${article.title}"`,
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
}

// ==================
// DELETE
// ==================
export async function deleteArticle(id: string) {
  const session = await requireAdminAction();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return;

  if (article.status === "PUBLISHED") {
    throw new Error(
      "Artikel yang sudah dipublikasikan tidak dapat dihapus. Arsipkan terlebih dahulu.",
    );
  }

  await prisma.article.delete({ where: { id } });

  await createAdminLog({
    adminId: session.user.id,
    action: "DELETE",
    entity: "Article",
    entityId: id,
    details: `Deleted article: "${article.title}"`,
  });

  revalidatePath("/admin/articles");
}
