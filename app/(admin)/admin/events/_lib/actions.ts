"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { eventSchema } from "./validations";
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
    const existing = await prisma.event.findFirst({
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
export async function createEvent(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireAdminAction();

  const coverImage = (formData.get("coverImage") as string) || undefined;
  const requireProof = formData.get("requireProof") === "true";
  const autoVerify = formData.get("autoVerify") === "true";

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    startDate: formData.get("startDate") as string,
    endDate: (formData.get("endDate") as string) || undefined,
    locationType: (formData.get("locationType") as string) || "OFFLINE",
    location: (formData.get("location") as string) || undefined,
    registrationLink: (formData.get("registrationLink") as string) || undefined,
    registrationDeadline:
      (formData.get("registrationDeadline") as string) || undefined,
    maxParticipants: formData.get("maxParticipants")
      ? Number(formData.get("maxParticipants"))
      : undefined,
    contactPerson: (formData.get("contactPerson") as string) || undefined,
    contactEmail: (formData.get("contactEmail") as string) || undefined,
    contactPhone: (formData.get("contactPhone") as string) || undefined,
    requireProof,
    autoVerify,
    maxProofsPerUser: Number(formData.get("maxProofsPerUser") || 3),
    tagIds: formData.getAll("tagIds") as string[],
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const {
    title,
    description,
    startDate,
    endDate,
    locationType,
    location,
    registrationLink,
    registrationDeadline,
    maxParticipants,
    contactPerson,
    contactEmail,
    contactPhone,
    tagIds,
    maxProofsPerUser,
  } = parsed.data;

  const slug = await generateUniqueSlug(title);
  const shouldPublish = formData.get("action") === "publish";

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      coverImage,
      startDate: new Date(startDate),
      endDate: parseDate(endDate),
      locationType,
      location: location || null,
      registrationLink: registrationLink || null,
      registrationDeadline: parseDate(registrationDeadline),
      maxParticipants: maxParticipants ?? null,
      contactPerson: contactPerson || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      requireProof,
      autoVerify,
      maxProofsPerUser,
      status: shouldPublish ? "PUBLISHED" : "DRAFT",
      publishedAt: shouldPublish ? new Date() : null,
      organizerId: session.user.id,
    },
  });
  // Create tags separately — nested writes trigger internal transactions unsupported by Neon HTTP
  if (tagIds.length > 0) {
    await prisma.eventTag.createMany({
      data: tagIds.map((tagId) => ({ eventId: event.id, tagId })),
    });
  }

  await createAdminLog({
    adminId: session.user.id,
    action: shouldPublish ? "PUBLISH" : "CREATE",
    entity: "Event",
    entityId: event.id,
    details: `${shouldPublish ? "Published" : "Created draft"} event: "${title}"`,
  });

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

// ==================
// UPDATE
// ==================
export async function updateEvent(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const session = await requireAdminAction();

  const existingEvent = await prisma.event.findUnique({ where: { id } });
  if (!existingEvent) return { error: "Event not found." };

  const coverImage =
    (formData.get("coverImage") as string) ||
    existingEvent.coverImage ||
    undefined;
  const requireProof = formData.get("requireProof") === "true";
  const autoVerify = formData.get("autoVerify") === "true";

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    startDate: formData.get("startDate") as string,
    endDate: (formData.get("endDate") as string) || undefined,
    locationType: (formData.get("locationType") as string) || "OFFLINE",
    location: (formData.get("location") as string) || undefined,
    registrationLink: (formData.get("registrationLink") as string) || undefined,
    registrationDeadline:
      (formData.get("registrationDeadline") as string) || undefined,
    maxParticipants: formData.get("maxParticipants")
      ? Number(formData.get("maxParticipants"))
      : undefined,
    contactPerson: (formData.get("contactPerson") as string) || undefined,
    contactEmail: (formData.get("contactEmail") as string) || undefined,
    contactPhone: (formData.get("contactPhone") as string) || undefined,
    requireProof,
    autoVerify,
    maxProofsPerUser: Number(formData.get("maxProofsPerUser") || 3),
    tagIds: formData.getAll("tagIds") as string[],
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const {
    title,
    description,
    startDate,
    endDate,
    locationType,
    location,
    registrationLink,
    registrationDeadline,
    maxParticipants,
    contactPerson,
    contactEmail,
    contactPhone,
    tagIds,
    maxProofsPerUser,
  } = parsed.data;

  const slug = await generateUniqueSlug(title, id);
  const shouldPublish = formData.get("action") === "publish";
  const wasPublished = existingEvent.status === "PUBLISHED";

  // Neon HTTP adapter does not support transactions or nested writes — use sequential queries
  await prisma.eventTag.deleteMany({ where: { eventId: id } });
  await prisma.event.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      coverImage,
      startDate: new Date(startDate),
      endDate: parseDate(endDate),
      locationType,
      location: location || null,
      registrationLink: registrationLink || null,
      registrationDeadline: parseDate(registrationDeadline),
      maxParticipants: maxParticipants ?? null,
      contactPerson: contactPerson || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      requireProof,
      autoVerify,
      maxProofsPerUser,
      status: shouldPublish ? "PUBLISHED" : existingEvent.status,
      publishedAt:
        shouldPublish && !wasPublished
          ? new Date()
          : existingEvent.publishedAt,
    },
  });
  if (tagIds.length > 0) {
    await prisma.eventTag.createMany({
      data: tagIds.map((tagId) => ({ eventId: id, tagId })),
    });
  }

  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE",
    entity: "Event",
    entityId: id,
    details: `Updated event: "${title}"`,
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  redirect("/admin/events");
}

// ==================
// PUBLISH
// ==================
export async function publishEvent(id: string) {
  const session = await requireAdminAction();

  const event = await prisma.event.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  await createAdminLog({
    adminId: session.user.id,
    action: "PUBLISH",
    entity: "Event",
    entityId: id,
    details: `Published event: "${event.title}"`,
  });

  revalidatePath("/admin/events");
}

// ==================
// ARCHIVE
// ==================
export async function archiveEvent(id: string) {
  const session = await requireAdminAction();

  const event = await prisma.event.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  await createAdminLog({
    adminId: session.user.id,
    action: "ARCHIVE",
    entity: "Event",
    entityId: id,
    details: `Archived event: "${event.title}"`,
  });

  revalidatePath("/admin/events");
}

// ==================
// REVERT TO DRAFT
// ==================
export async function revertEventToDraft(id: string) {
  const session = await requireAdminAction();

  const event = await prisma.event.update({
    where: { id },
    data: { status: "DRAFT", publishedAt: null },
  });

  await createAdminLog({
    adminId: session.user.id,
    action: "UPDATE",
    entity: "Event",
    entityId: id,
    details: `Reverted to draft: "${event.title}"`,
  });

  revalidatePath("/admin/events");
}

// ==================
// DELETE
// ==================
export async function deleteEvent(id: string) {
  const session = await requireAdminAction();

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return;

  if (event.status === "PUBLISHED") {
    throw new Error("Cannot delete a published event. Archive it first.");
  }

  await prisma.event.delete({ where: { id } });

  await createAdminLog({
    adminId: session.user.id,
    action: "DELETE",
    entity: "Event",
    entityId: id,
    details: `Deleted event: "${event.title}"`,
  });

  revalidatePath("/admin/events");
}
