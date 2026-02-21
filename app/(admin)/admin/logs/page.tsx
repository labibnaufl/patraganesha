import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../_lib/require-admin";
import Link from "next/link";
import { ScrollText } from "lucide-react";

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

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    entity?: string;
    admin?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const action = params.action || "";
  const entity = params.entity || "";
  const adminId = params.admin || "";
  const page = parseInt(params.page || "1", 10);
  const perPage = 25;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (adminId) where.userId = adminId;

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
    // All unique admins who have logs
    prisma.adminLog.findMany({
      distinct: ["userId"],
      select: { userId: true, user: { select: { name: true } } },
    }),
    // All unique action types
    prisma.adminLog.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  const entityOptions = ["User", "Article", "Event", "AcademicInfo", "Tag"];

  const buildHref = (overrides: Record<string, string>) => {
    const p = { action, entity, admin: adminId, page: "1", ...overrides };
    const qs = Object.entries(p)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/logs${qs ? `?${qs}` : ""}`;
  };

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
            {total.toLocaleString("id-ID")} entri log ditemukan
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Action filter */}
        <select
          className="px-3 py-2 text-sm border rounded-lg bg-background"
          defaultValue={action}
          onChange={undefined}
        >
          <option value="">Semua Aksi</option>
          {actions.map((a) => (
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
          defaultValue={adminId}
        >
          <option value="">Semua Admin</option>
          {admins.map((a) => (
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
              {logs.map((log) => {
                const style = getActionStyle(log.action);
                return (
                  <tr
                    key={log.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div>
                        {log.createdAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-muted-foreground/70">
                        {log.createdAt.toLocaleTimeString("id-ID", {
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
              {logs.length === 0 && (
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
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
            {page < totalPages && (
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
