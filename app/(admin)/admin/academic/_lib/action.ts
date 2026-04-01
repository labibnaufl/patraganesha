"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { academicSchema } from "./validation";
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
async function generateUniqueSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.academicInfo.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (!existing) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
}

function parseDate(value: string | undefined | null): Date | null {
  if (!value || value.trim() === "") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// ==================
// CREATE
// ==================
export async function createAcademic(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireAdminAction();

  try {
    const raw = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      coverImage: (formData.get("coverImage") as string) || undefined,
      driveLink: (formData.get("driveLink") as string) || undefined,
      externalLink: (formData.get("externalLink") as string) || undefined,
      requirements: (formData.get("requirements") as string) || undefined,
      prizes: (formData.get("prizes") as string) || undefined,
      benefits: (formData.get("benefits") as string) || undefined,
      contactPerson: (formData.get("contactPerson") as string) || undefined,
      contactEmail: (formData.get("contactEmail") as string) || undefined,
      contactPhone: (formData.get("contactPhone") as string) || undefined,
      deadline: formData.get("deadline") as string,
      tagIds: formData.getAll("tagIds") as string[],
    };

    const parsed = academicSchema.safeParse(raw);

    if (!parsed.success) {
      console.error(parsed.error);
      return { error: "Data tidak valid. Periksa kembali form Anda." };
    }

    const { type, tagIds, ...data } = parsed.data;
    const slug = await generateUniqueSlug(data.title);

    const action = formData.get("action") as string; // "save" or "publish"
    const status = action === "publish" ? "PUBLISHED" : "DRAFT";
    const publishedAt = action === "publish" ? new Date() : null;

    const academicInfo = await prisma.academicInfo.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        type,
        coverImage: data.coverImage,
        driveLink: data.driveLink || null,
        externalLink: data.externalLink || null,
        deadline: parseDate(data.deadline),
        requirements: data.requirements || null,
        prizes: data.prizes || null,
        benefits: data.benefits || null,
        contactPerson: data.contactPerson || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        status,
        publishedAt,
        createdById: session.user.id,
      },
    });
    if ((tagIds as string[]).length > 0) {
      await prisma.academicTag.createMany({
        data: (tagIds as string[]).map((tagId: string) => ({ academicInfoId: academicInfo.id, tagId })),
      });
    }

    await createAdminLog({
      adminId: session.user.id,
      action: "CREATE",
      entity: "AcademicInfo",
      entityId: academicInfo.id,
      details: `Created academic info: ${academicInfo.title} (${status})`,
    });
  } catch (error) {
    console.error("Create Academic Info Error:", error);
    return { error: "Terjadi kesalahan saat menyimpan data." };
  }

  revalidatePath("/admin/academic");
  redirect("/admin/academic");
}

// ==================
// UPDATE
// ==================
export async function updateAcademic(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireAdminAction();

  try {
    const existing = await prisma.academicInfo.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (!existing) return { error: "Data tidak ditemukan." };

    const raw = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      coverImage: (formData.get("coverImage") as string) || undefined,
      driveLink: (formData.get("driveLink") as string) || undefined,
      externalLink: (formData.get("externalLink") as string) || undefined,
      requirements: (formData.get("requirements") as string) || undefined,
      prizes: (formData.get("prizes") as string) || undefined,
      benefits: (formData.get("benefits") as string) || undefined,
      contactPerson: (formData.get("contactPerson") as string) || undefined,
      contactEmail: (formData.get("contactEmail") as string) || undefined,
      contactPhone: (formData.get("contactPhone") as string) || undefined,
      deadline: formData.get("deadline") as string,
      tagIds: formData.getAll("tagIds") as string[],
    };

    const parsed = academicSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(parsed.error);
      return { error: "Data tidak valid. Periksa kembali form Anda." };
    }

    const { type, tagIds, ...data } = parsed.data;
    const slug = await generateUniqueSlug(data.title, id);

    const currentTagIds = existing.tags.map((t) => t.tagId);

    const tagsToConnect = tagIds.filter((id) => !currentTagIds.includes(id));
    const tagsToDisconnect = currentTagIds.filter((id) => !tagIds.includes(id));

    const action = formData.get("action") as string;
    const isPublishing =
      action === "publish" && existing.status !== "PUBLISHED";

    // Neon HTTP adapter does not support transactions or nested writes — use sequential queries
    await prisma.academicTag.deleteMany({
      where: { academicInfoId: id, tagId: { in: tagsToDisconnect } },
    });
    await prisma.academicInfo.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        description: data.description,
        type,
        coverImage:
          data.coverImage !== undefined ? data.coverImage : existing.coverImage,
        driveLink: data.driveLink || null,
        externalLink: data.externalLink || null,
        deadline: parseDate(data.deadline),
        requirements: data.requirements || null,
        prizes: data.prizes || null,
        benefits: data.benefits || null,
        contactPerson: data.contactPerson || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        status: isPublishing ? "PUBLISHED" : existing.status,
        publishedAt: isPublishing ? new Date() : existing.publishedAt,
      },
    });
    if (tagsToConnect.length > 0) {
      await prisma.academicTag.createMany({
        data: tagsToConnect.map((tagId: string) => ({ academicInfoId: id, tagId })),
      });
    }

    await createAdminLog({
      adminId: session.user.id,
      action: "UPDATE",
      entity: "AcademicInfo",
      entityId: id,
      details: `Updated academic info: ${data.title}${isPublishing ? " (Published)" : ""}`,
    });
  } catch (error) {
    console.error("Update Academic Info Error:", error);
    return { error: "Terjadi kesalahan saat mengupdate data." };
  }

  revalidatePath("/admin/academic");
  revalidatePath(`/admin/academic/${id}`);
  redirect("/admin/academic");
}

// ==================
// STATUS ACTIONS
// ==================
export async function publishAcademic(id: string) {
  const session = await requireAdminAction();
  await prisma.academicInfo.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE",
    entity: "AcademicInfo",
    entityId: id,
    details: "Published academic info",
  });
  revalidatePath("/admin/academic");
  revalidatePath(`/admin/academic/${id}`);
}

export async function archiveAcademic(id: string) {
  const session = await requireAdminAction();
  await prisma.academicInfo.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE",
    entity: "AcademicInfo",
    entityId: id,
    details: "Archived academic info",
  });
  revalidatePath("/admin/academic");
  revalidatePath(`/admin/academic/${id}`);
}

export async function revertAcademicToDraft(id: string) {
  const session = await requireAdminAction();
  await prisma.academicInfo.update({
    where: { id },
    data: { status: "DRAFT", publishedAt: null },
  });
  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE",
    entity: "AcademicInfo",
    entityId: id,
    details: "Reverted academic info to draft",
  });
  revalidatePath("/admin/academic");
  revalidatePath(`/admin/academic/${id}`);
}

// ==================
// DELETE
// ==================
export async function deleteAcademic(id: string) {
  const session = await requireAdminAction();
  const existing = await prisma.academicInfo.findUnique({ where: { id } });

  if (!existing) throw new Error("Not found");
  if (existing.status === "PUBLISHED") {
    throw new Error("Cannot delete published academic info");
  }

  await prisma.academicInfo.delete({ where: { id } });
  await createAdminLog({
    adminId: session.user.id,
    action: "DELETE",
    entity: "AcademicInfo",
    entityId: id,
    details: `Deleted academic info: ${existing.title}`,
  });
  revalidatePath("/admin/academic");
}
