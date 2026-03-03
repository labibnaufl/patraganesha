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
  // Filter by type to avoid accidentally toggling the wrong reaction type
  const existing = await prisma.reaction.findFirst({
    where: { eventId, userId, type },
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
  // Revalidate both the listing and specific event detail page
  revalidatePath(`/events`);
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });
  if (event) revalidatePath(`/events/${event.slug}`);
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
  // Revalidate both the listing and specific event detail page
  revalidatePath(`/events`);
  const event2 = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });
  if (event2) revalidatePath(`/events/${event2.slug}`);
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
  // Revalidate the event listing and detail page
  revalidatePath(`/events`);
  const eventForComment = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });
  if (eventForComment) revalidatePath(`/events/${eventForComment.slug}`);
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
  // Revalidate the specific event page if we know its slug
  if (comment.eventId) {
    const deletedCommentEvent = await prisma.event.findUnique({
      where: { id: comment.eventId },
      select: { slug: true },
    });
    if (deletedCommentEvent)
      revalidatePath(`/events/${deletedCommentEvent.slug}`);
  }
  return { success: true };
}

// ─── Registration Actions ────────────────────────────────────────────────────

export async function registerForEventAction(eventId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { error: "Login terlebih dahulu untuk mendaftar." };
  const userId = session.user.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId, status: "PUBLISHED" },
    select: {
      slug: true,
      registrationDeadline: true,
      maxParticipants: true,
      currentParticipants: true,
    },
  });
  if (!event) return { error: "Event tidak ditemukan." };

  // Check deadline
  if (
    event.registrationDeadline &&
    new Date() > new Date(event.registrationDeadline)
  ) {
    return { error: "Pendaftaran sudah ditutup." };
  }

  // Check quota
  if (
    event.maxParticipants &&
    event.currentParticipants >= event.maxParticipants
  ) {
    return { error: "Kuota peserta sudah penuh." };
  }

  // Check duplicate registration
  const existing = await prisma.eventAttendance.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) return { error: "Kamu sudah terdaftar di event ini." };

  await prisma.$transaction([
    prisma.eventAttendance.create({
      data: { userId, eventId, status: "REGISTERED" },
    }),
    prisma.event.update({
      where: { id: eventId },
      data: { currentParticipants: { increment: 1 } },
    }),
  ]);

  revalidatePath(`/events`);
  revalidatePath(`/events/${event.slug}`);
  return { success: true };
}

export async function cancelEventRegistrationAction(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const userId = session.user.id;

  const attendance = await prisma.eventAttendance.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: { id: true, status: true },
  });
  if (!attendance) return { error: "Kamu tidak terdaftar di event ini." };
  if (attendance.status === "ATTENDED") {
    return { error: "Tidak bisa membatalkan setelah kehadiran diverifikasi." };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });

  await prisma.$transaction([
    prisma.eventAttendance.update({
      where: { id: attendance.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    }),
    prisma.event.update({
      where: { id: eventId },
      data: { currentParticipants: { decrement: 1 } },
    }),
  ]);

  revalidatePath(`/events`);
  if (event) revalidatePath(`/events/${event.slug}`);
  return { success: true };
}

export async function uploadAttendanceProofAction(
  attendanceId: string,
  proofData: {
    url: string;
    publicId: string;
    thumbnailUrl: string;
    format: string;
    width: number;
    height: number;
    fileSize: number;
    caption?: string;
  },
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthenticated" };
  const userId = session.user.id;

  const attendance = await prisma.eventAttendance.findUnique({
    where: { id: attendanceId },
    include: {
      event: {
        select: { slug: true, autoVerify: true, maxProofsPerUser: true },
      },
      proofs: { select: { id: true } },
    },
  });

  if (!attendance || attendance.userId !== userId) {
    return { error: "Tidak ditemukan atau tidak diizinkan." };
  }
  if (attendance.proofs.length >= attendance.event.maxProofsPerUser) {
    return {
      error: `Maksimal ${attendance.event.maxProofsPerUser} foto bukti.`,
    };
  }

  const shouldAutoVerify = attendance.event.autoVerify;

  await prisma.$transaction([
    prisma.attendanceProof.create({
      data: {
        attendanceId,
        url: proofData.url,
        publicId: proofData.publicId,
        thumbnailUrl: proofData.thumbnailUrl,
        format: proofData.format,
        width: proofData.width,
        height: proofData.height,
        fileSize: proofData.fileSize,
        caption: proofData.caption ?? null,
      },
    }),
    ...(shouldAutoVerify
      ? [
          prisma.eventAttendance.update({
            where: { id: attendanceId },
            data: {
              status: "ATTENDED",
              attendedAt: new Date(),
              verifiedAt: new Date(),
            },
          }),
        ]
      : attendance.status === "REGISTERED" || attendance.status === "ATTENDING"
        ? [
            prisma.eventAttendance.update({
              where: { id: attendanceId },
              data: { status: "ATTENDING", attendingAt: new Date() },
            }),
          ]
        : []),
  ]);

  revalidatePath(`/events/${attendance.event.slug}`);
  return { success: true };
}
