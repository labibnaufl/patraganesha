"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdminAttendance() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function verifyAttendanceAction(attendanceId: string) {
  const session = await requireAdminAttendance();

  const attendance = await prisma.eventAttendance.findUnique({
    where: { id: attendanceId },
    include: { event: { select: { slug: true } } },
  });
  if (!attendance) return { error: "Attendance not found" };

  await prisma.eventAttendance.update({
    where: { id: attendanceId },
    data: {
      status: "ATTENDED",
      attendedAt: attendance.attendedAt ?? new Date(),
      verifiedAt: new Date(),
      verifiedById: session.user.id,
    },
  });

  revalidatePath(`/admin/events/${attendance.eventId}/attendances`);
  revalidatePath(`/events/${attendance.event.slug}`);
  return { success: true };
}

export async function rejectAttendanceAction(
  attendanceId: string,
  notes?: string,
) {
  const session = await requireAdminAttendance();

  const attendance = await prisma.eventAttendance.findUnique({
    where: { id: attendanceId },
    include: { event: { select: { slug: true } } },
  });
  if (!attendance) return { error: "Attendance not found" };

  await prisma.eventAttendance.update({
    where: { id: attendanceId },
    data: {
      status: "REJECTED",
      verifiedById: session.user.id,
      verificationNotes: notes ?? null,
    },
  });

  revalidatePath(`/admin/events/${attendance.eventId}/attendances`);
  revalidatePath(`/events/${attendance.event.slug}`);
  return { success: true };
}

export async function verifyAllPendingAction(eventId: string) {
  const session = await requireAdminAttendance();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });
  if (!event) return { error: "Event not found" };

  await prisma.eventAttendance.updateMany({
    where: { eventId, status: "ATTENDING" },
    data: {
      status: "ATTENDED",
      attendedAt: new Date(),
      verifiedAt: new Date(),
      verifiedById: session.user.id,
    },
  });

  revalidatePath(`/admin/events/${eventId}/attendances`);
  revalidatePath(`/events/${event.slug}`);
  return { success: true };
}
