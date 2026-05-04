"use client";

import { useEffect, useState } from "react";
import { getAdminDashboardData } from "../_lib/admin-actions";
import { Users, FileText, CalendarDays, Clock, UserCheck, UserX } from "lucide-react";
import Link from "next/link";

export function AdminDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getAdminDashboardData();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Total Pengguna",
      value: data.totalUsers,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Menunggu Persetujuan",
      value: data.pendingUsers,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      urgent: data.pendingUsers > 0,
    },
    {
      label: "Pengguna Aktif",
      value: data.verifiedUsers,
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Diblokir",
      value: data.bannedUsers,
      icon: UserX,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Artikel",
      value: data.totalArticles,
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Event",
      value: data.totalEvents,
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
      {data.recentPending.length > 0 && (
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
                  {data.recentPending.map((user: any) => (
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
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
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
            <div className="p-4 border-t">
              <Link
                href="/admin/users"
                className="text-sm text-primary hover:underline"
              >
                Lihat semua pengguna →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
