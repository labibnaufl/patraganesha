import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "../../_lib/require-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserDetailActions } from "./user-detail-actions";
import { ArrowLeft } from "lucide-react";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSuperAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      banned: true,
      banReason: true,
      nim: true,
      generation: true,
      major: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) notFound();

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  function getStatusColor(status: string, banned: boolean) {
    if (banned) return "bg-red-100 text-red-700 border-red-200";
    switch (status) {
      case "VERIFIED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "REJECTED":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "ARCHIVED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  }

  const infoRows = [
    { label: "Email", value: user.email },
    { label: "NIM", value: user.nim || "-" },
    { label: "Angkatan", value: user.generation?.toString() || "-" },
    { label: "Program Studi", value: user.major || "-" },
    { label: "Email Verified", value: user.emailVerified ? "Ya" : "Belum" },
    {
      label: "Tanggal Daftar",
      value: user.createdAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    {
      label: "Terakhir Diperbarui",
      value: user.updatedAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ];

  return (
    <div>
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar pengguna
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {user.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status, user.banned)}`}
          >
            {user.banned ? "BANNED" : user.status}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info Card */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <h2 className="font-semibold font-heading text-foreground mb-4">
            Informasi Pengguna
          </h2>
          <dl className="space-y-3">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start gap-4">
                <dt className="w-40 shrink-0 text-sm text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {user.banned && user.banReason && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">Alasan Ban</p>
              <p className="text-sm text-red-600 mt-1">{user.banReason}</p>
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold font-heading text-foreground mb-4">
            Aksi
          </h2>
          <UserDetailActions
            userId={user.id}
            currentRole={user.role}
            currentStatus={user.status}
            isBanned={user.banned}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      </div>
    </div>
  );
}
