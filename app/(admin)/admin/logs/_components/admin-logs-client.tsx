"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { getAdminLogs } from "../../_lib/admin-actions";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  APPROVE_USER: {
    label: "Setujui Pengguna",
    color: "bg-emerald-100 text-emerald-700",
  },
  REJECT_USER: { label: "Tolak Pengguna", color: "bg-red-100 text-red-700" },
  BAN_USER: { label: "Ban Pengguna", color: "bg-red-100 text-red-700" },
  UNBAN_USER: { label: "Unban Pengguna", color: "bg-blue-100 text-blue-700" },
  CHANGE_ROLE: { label: "Ubah Role", color: "bg-amber-100 text-amber-700" },
  ARCHIVE_USER: {
    label: "Arsipkan Pengguna",
    color: "bg-gray-100 text-gray-600",
  },
  UNARCHIVE_USER: {
    label: "Aktifkan Pengguna",
    color: "bg-emerald-100 text-emerald-700",
  },
  CREATE: { label: "Buat", color: "bg-blue-100 text-blue-700" },
  UPDATE: { label: "Edit", color: "bg-amber-100 text-amber-700" },
  DELETE: { label: "Hapus", color: "bg-red-100 text-red-700" },
  PUBLISH: { label: "Terbitkan", color: "bg-emerald-100 text-emerald-700" },
  APPROVE: { label: "Setujui", color: "bg-emerald-100 text-emerald-700" },
  REJECT: { label: "Tolak", color: "bg-red-100 text-red-700" },
  ARCHIVE: { label: "Arsipkan", color: "bg-gray-100 text-gray-600" },
  UNARCHIVE: {
    label: "Aktifkan Kembali",
    color: "bg-emerald-100 text-emerald-700",
  },
};

function getActionStyle(action: string) {
  return (
    ACTION_LABELS[action] ?? {
      label: action,
      color: "bg-gray-100 text-gray-600",
    }
  );
}

interface LogData {
  logs: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    details: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  total: number;
  admins: Array<{ userId: string; user: { name: string | null } }>;
  actions: Array<{ action: string }>;
  totalPages: number;
}

function LogsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const action = searchParams.get("action") || "";
  const entity = searchParams.get("entity") || "";
  const adminId = searchParams.get("admin") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminLogs({ action, entity, admin: adminId, page });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [action, entity, adminId, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/logs?${params.toString()}`);
  };

  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (overrides.page === "1") params.delete("page");
    return `/admin/logs${params.toString() ? `?${params.toString()}` : ""}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
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

  const entityOptions = ["User", "Article", "Event", "AcademicInfo", "Tag"];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <ScrollText className="size-6" />
            Admin Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.total.toLocaleString("id-ID")} entri log ditemukan
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Action filter */}
        <select
          className="px-3 py-2 text-sm border rounded-lg bg-background"
          value={action}
          onChange={(e) => handleFilterChange("action", e.target.value)}
        >
          <option value="">Semua Aksi</option>
          {data.actions.map((a: any) => (
            <option key={a.action} value={a.action}>
              {getActionStyle(a.action).label}
            </option>
          ))}
        </select>

        {/* Entity filter buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref({ entity: "" })}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              !entity
                ? "bg-primary text-primary-foreground border-transparent"
                : "hover:bg-accent"
            }`}
          >
            Semua
          </Link>
          {entityOptions.map((e) => (
            <Link
              key={e}
              href={buildHref({ entity: e })}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                entity === e
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "hover:bg-accent"
              }`}
            >
              {e}
            </Link>
          ))}
        </div>

        {/* Admin filter */}
        <select
          className="px-3 py-2 text-sm border rounded-lg bg-background"
          value={adminId}
          onChange={(e) => handleFilterChange("admin", e.target.value)}
        >
          <option value="">Semua Admin</option>
          {data.admins.map((a: any) => (
            <option key={a.userId} value={a.userId}>
              {a.user.name}
            </option>
          ))}
        </select>

        {(action || entity || adminId) && (
          <Link
            href="/admin/logs"
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors"
          >
            Reset Filter
          </Link>
        )}
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Waktu
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Admin
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Aksi
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Entitas
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {data.logs.map((log: any) => {
                const style = getActionStyle(log.action);
                return (
                  <tr
                    key={log.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div>
                        {new Date(log.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-muted-foreground/70">
                        {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-foreground">
                        {log.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.color}`}
                      >
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground">
                        {log.entity}
                      </div>
                      {log.entityId && (
                        <div className="text-xs font-mono text-muted-foreground truncate max-w-24">
                          {log.entityId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
                      <p className="line-clamp-2">{log.details ?? "—"}</p>
                    </td>
                  </tr>
                );
              })}
              {data.logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Belum ada log aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {data.totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Sebelumnya
              </Link>
            )}
            {page < data.totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Selanjutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminLogsClient() {
  return (
    <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-xl" />}>
      <LogsContent />
    </Suspense>
  );
}
