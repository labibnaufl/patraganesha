"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireSuperAdminSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized - Super Admin only");
  }
  return session;
}

// Helper to serialize dates
function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Dashboard data
export async function getAdminDashboardData() {
  await requireAdminSession();

  const [
    totalUsers,
    pendingUsers,
    verifiedUsers,
    bannedUsers,
    totalArticles,
    totalEvents,
    recentPending,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: "VERIFIED" } }),
    prisma.user.count({ where: { banned: true } }),
    prisma.article.count(),
    prisma.event.count(),
    prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        emailVerified: true,
      },
    }),
  ]);

  return serializeData({
    totalUsers,
    pendingUsers,
    verifiedUsers,
    bannedUsers,
    totalArticles,
    totalEvents,
    recentPending,
  });
}

// Articles
export async function getAdminArticles(filters: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
}) {
  await requireAdminSession();

  const page = filters.page || 1;
  const perPage = 15;
  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { excerpt: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [articles, total, stats] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        status: true,
        views: true,
        readTime: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  return serializeData({
    articles,
    total,
    stats,
    totalPages: Math.ceil(total / perPage),
  });
}

// Events
export async function getAdminEvents(filters: {
  search?: string;
  status?: string;
  page?: number;
}) {
  await requireAdminSession();

  const page = filters.page || 1;
  const perPage = 15;
  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [events, total, stats] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        locationType: true,
        location: true,
        startDate: true,
        endDate: true,
        maxParticipants: true,
        currentParticipants: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        tags: { select: { tag: { select: { name: true } } } },
        organizer: { select: { name: true } },
      },
    }),
    prisma.event.count({ where }),
    prisma.event.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  return serializeData({
    events,
    total,
    stats,
    totalPages: Math.ceil(total / perPage),
  });
}

// Academic Info
export async function getAdminAcademic(filters: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
}) {
  await requireAdminSession();

  const page = filters.page || 1;
  const perPage = 15;
  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [academics, total, stats] = await Promise.all([
    prisma.academicInfo.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        type: true,
        deadline: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        tags: { select: { tag: { select: { name: true } } } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.academicInfo.count({ where }),
    prisma.academicInfo.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  return serializeData({
    academics,
    total,
    stats,
    totalPages: Math.ceil(total / perPage),
  });
}

// Users (Super Admin only)
export async function getAdminUsers(filters: {
  status?: string;
  role?: string;
  search?: string;
  page?: number;
}) {
  await requireSuperAdminSession();

  const page = filters.page || 1;
  const perPage = 15;
  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;
  if (filters.role) where.role = filters.role;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { nim: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        banned: true,
        nim: true,
        generation: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return serializeData({
    users,
    total,
    totalPages: Math.ceil(total / perPage),
  });
}

// Admin Logs
export async function getAdminLogs(filters: {
  action?: string;
  entity?: string;
  admin?: string;
  page?: number;
}) {
  await requireAdminSession();

  const page = filters.page || 1;
  const perPage = 25;
  const where: Record<string, unknown> = {};

  if (filters.action) where.action = filters.action;
  if (filters.entity) where.entity = filters.entity;
  if (filters.admin) where.userId = filters.admin;

  const [logs, total, admins, actions] = await Promise.all([
    prisma.adminLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.adminLog.count({ where }),
    prisma.adminLog.findMany({
      distinct: ["userId"],
      select: { userId: true, user: { select: { name: true } } },
    }),
    prisma.adminLog.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    }),
  ]);

  return serializeData({
    logs,
    total,
    admins,
    actions,
    totalPages: Math.ceil(total / perPage),
  });
}

// Get available tags
export async function getAvailableTags() {
  await requireAdminSession();

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return serializeData(tags);
}
