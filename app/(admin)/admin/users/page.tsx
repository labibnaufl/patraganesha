import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "../_lib/require-admin";
import Link from "next/link";
import { UserActions } from "./user-actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    role?: string;
    search?: string;
    page?: string;
  }>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;

  const status = params.status || "";
  const role = params.role || "";
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const perPage = 15;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { nim: { contains: search, mode: "insensitive" } },
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

  const totalPages = Math.ceil(total / perPage);

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "PENDING", label: "Pending" },
    { value: "VERIFIED", label: "Verified" },
    { value: "REJECTED", label: "Rejected" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  const roleOptions = [
    { value: "", label: "Semua Role" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Admin" },
    { value: "USER", label: "User" },
    { value: "GUEST", label: "Guest" },
  ];

  function getStatusBadge(s: string, banned: boolean) {
    if (banned) return "bg-red-100 text-red-700";
    switch (s) {
      case "VERIFIED":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "REJECTED":
        return "bg-gray-100 text-gray-600";
      case "ARCHIVED":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function getRoleBadge(r: string) {
    switch (r) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-700";
      case "ADMIN":
        return "bg-blue-100 text-blue-700";
      case "USER":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Kelola Pengguna
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} pengguna ditemukan
          </p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-3 mb-6">
        <input
          name="search"
          type="text"
          placeholder="Cari nama, email, atau NIM..."
          defaultValue={search}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 text-sm border rounded-lg bg-background"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          name="role"
          defaultValue={role}
          className="px-3 py-2 text-sm border rounded-lg bg-background"
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Filter
        </button>
        {(search || status || role) && (
          <Link
            href="/admin/users"
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors"
          >
            Reset
          </Link>
        )}
      </form>

      {/* User Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Nama
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  NIM
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Tgl Daftar
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {user.nim || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status, user.banned)}`}
                    >
                      {user.banned ? "BANNED" : user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {user.createdAt.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <UserActions user={user} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Tidak ada pengguna ditemukan.
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
                href={`/admin/users?page=${page - 1}${status ? `&status=${status}` : ""}${role ? `&role=${role}` : ""}${search ? `&search=${search}` : ""}`}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/users?page=${page + 1}${status ? `&status=${status}` : ""}${role ? `&role=${role}` : ""}${search ? `&search=${search}` : ""}`}
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
