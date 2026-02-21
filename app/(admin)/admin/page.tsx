import { prisma } from "@/lib/prisma";
import { requireAdmin } from "./_lib/require-admin";
import {
  Users,
  FileText,
  CalendarDays,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Fetch stats in parallel
  const [
    totalUsers,
    pendingUsers,
    verifiedUsers,
    bannedUsers,
    totalArticles,
    totalEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: "VERIFIED" } }),
    prisma.user.count({ where: { banned: true } }),
    prisma.article.count(),
    prisma.event.count(),
  ]);

  // Recent pending users
  const recentPending = await prisma.user.findMany({
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
  });

  const stats = [
    {
      label: "Total Pengguna",
      value: totalUsers,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Menunggu Persetujuan",
      value: pendingUsers,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      urgent: pendingUsers > 0,
    },
    {
      label: "Pengguna Aktif",
      value: verifiedUsers,
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Diblokir",
      value: bannedUsers,
      icon: UserX,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Artikel",
      value: totalArticles,
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Event",
      value: totalEvents,
      icon: CalendarDays,
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selamat datang, {session.user.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 ${
              stat.urgent ? "border-amber-200 bg-amber-50/50" : "bg-card"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${stat.color}`}>
                <stat.icon className="size-4" />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Users */}
      {recentPending.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
            Menunggu Persetujuan
          </h2>
          <div className="rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Nama
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Email Verified
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Tanggal Daftar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPending.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.emailVerified
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.emailVerified ? "Ya" : "Belum"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.createdAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
