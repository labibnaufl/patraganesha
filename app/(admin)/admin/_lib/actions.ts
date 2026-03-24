"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdminAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function approveUser(userId: string) {
  const session = await requireAdminAction();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "VERIFIED",
      role: "USER",
    },
  });

  await prisma.adminLog.create({
    data: {
      action: "APPROVE_USER",
      entity: "User",
      entityId: userId,
      details: `Approved user: ${user.name} (${user.email})`,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function rejectUser(userId: string) {
  const session = await requireAdminAction();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "REJECTED",
    },
  });

  await prisma.adminLog.create({
    data: {
      action: "REJECT_USER",
      entity: "User",
      entityId: userId,
      details: `Rejected user: ${user.name} (${user.email})`,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function banUser(userId: string, reason: string) {
  const session = await requireAdminAction();

  // Prevent banning yourself
  if (userId === session.user.id) {
    throw new Error("Tidak bisa memblokir diri sendiri");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      banned: true,
      banReason: reason || "Pelanggaran aturan komunitas",
    },
  });

  await prisma.adminLog.create({
    data: {
      action: "BAN_USER",
      entity: "User",
      entityId: userId,
      details: `Banned user: ${user.name} (${user.email}). Reason: ${reason}`,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function unbanUser(userId: string) {
  const session = await requireAdminAction();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      banned: false,
      banReason: null,
    },
  });

  await prisma.adminLog.create({
    data: {
      action: "UNBAN_USER",
      entity: "User",
      entityId: userId,
      details: `Unbanned user: ${user.name} (${user.email})`,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateUserRole(
  userId: string,
  role: "SUPER_ADMIN" | "ADMIN" | "USER" | "GUEST",
) {
  const session = await requireAdminAction();

  // Only SUPER_ADMIN can promote to ADMIN/SUPER_ADMIN
  if (
    (role === "SUPER_ADMIN" || role === "ADMIN") &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    throw new Error("Hanya Super Admin yang bisa memberikan role admin");
  }

  // Prevent demoting yourself
  if (userId === session.user.id) {
    throw new Error("Tidak bisa mengubah role diri sendiri");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await prisma.adminLog.create({
    data: {
      action: "CHANGE_ROLE",
      entity: "User",
      entityId: userId,
      details: `Changed role of ${user.name} (${user.email}) to ${role}`,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function archiveUser(userId: string) {
  const session = await requireAdminAction();

  // Prevent archiving yourself
  if (userId === session.user.id) {
    throw new Error("Tidak bisa mengarsipkan diri sendiri");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "ARCHIVED",
    },
  });

  await prisma.adminLog.create({
    data: {
      action: "ARCHIVE_USER",
      entity: "User",
      entityId: userId,
      details: `Archived user: ${user.name} (${user.email})`,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function unarchiveUser(userId: string) {
  const session = await requireAdminAction();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "VERIFIED",
    },
  });

  await prisma.adminLog.create({
    data: {
      action: "UNARCHIVE_USER",
      entity: "User",
      entityId: userId,
      details: `Unarchived user: ${user.name} (${user.email})`,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteUser(userId: string) {
  const session = await requireAdminAction();

  // Prevent deleting yourself
  if (userId === session.user.id) {
    throw new Error("Tidak bisa menghapus diri sendiri");
  }

  // Double check that the user is really ARCHIVED (safety mechanism)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, name: true, email: true },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan");
  }

  if (user.status !== "ARCHIVED") {
    throw new Error("Pengguna hanya dapat dihapus jika berstatus Diarsipkan");
  }

  // Perform permanent deletion
  await prisma.user.delete({
    where: { id: userId },
  });

  await prisma.adminLog.create({
    data: {
      action: "DELETE_USER",
      entity: "User",
      entityId: userId,
      details: `Permanently deleted user: ${user.name} (${user.email})`,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/users");
}
