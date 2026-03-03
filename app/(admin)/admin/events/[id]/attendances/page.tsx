import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../../../_lib/require-admin";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
} from "lucide-react";
import { AttendanceActions } from "./_components/attendance-actions";

export default async function EventAttendancesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      requireProof: true,
      autoVerify: true,
      maxParticipants: true,
      currentParticipants: true,
      attendances: {
        orderBy: { registeredAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          proofs: {
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              uploadedAt: true,
              caption: true,
            },
            orderBy: { uploadedAt: "asc" },
          },
          verifiedBy: { select: { name: true } },
        },
      },
    },
  });

  if (!event)
    return (
      <div className="p-8 text-muted-foreground">Event tidak ditemukan.</div>
    );

  const statusCounts = {
    REGISTERED: event.attendances.filter((a) => a.status === "REGISTERED")
      .length,
    ATTENDING: event.attendances.filter((a) => a.status === "ATTENDING").length,
    ATTENDED: event.attendances.filter((a) => a.status === "ATTENDED").length,
    REJECTED: event.attendances.filter((a) => a.status === "REJECTED").length,
    CANCELLED: event.attendances.filter((a) => a.status === "CANCELLED").length,
  };

  const STATUS_STYLE: Record<string, string> = {
    REGISTERED: "bg-blue-100 text-blue-700",
    ATTENDING: "bg-amber-100 text-amber-700",
    ATTENDED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
    ABSEN: "bg-gray-100 text-gray-400",
  };

  const STATUS_LABEL: Record<string, string> = {
    REGISTERED: "Terdaftar",
    ATTENDING: "Bukti Dikirim",
    ATTENDED: "Hadir",
    REJECTED: "Ditolak",
    CANCELLED: "Dibatal",
    ABSEN: "Absen",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/events"
          className="mt-0.5 p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">
            Attendance Management
          </p>
          <h1 className="text-xl font-bold font-heading truncate">
            {event.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Users className="size-3.5" />
            {event.currentParticipants}
            {event.maxParticipants ? `/${event.maxParticipants}` : ""} peserta
            {event.requireProof && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Camera className="size-3.5" />
                {event.autoVerify ? "Auto-verify" : "Manual verify"}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/events/${event.slug}`}
          target="_blank"
          className="shrink-0 text-xs px-3 py-1.5 border rounded-lg hover:bg-accent transition-colors"
        >
          Lihat Event →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            label: "Terdaftar",
            count: statusCounts.REGISTERED,
            color: "text-blue-600",
          },
          {
            label: "Bukti Dikirim",
            count: statusCounts.ATTENDING,
            color: "text-amber-600",
          },
          {
            label: "Hadir",
            count: statusCounts.ATTENDED,
            color: "text-emerald-600",
          },
          {
            label: "Ditolak",
            count: statusCounts.REJECTED,
            color: "text-red-600",
          },
          {
            label: "Dibatal",
            count: statusCounts.CANCELLED,
            color: "text-gray-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-card p-3 text-center"
          >
            <p className={`text-2xl font-bold font-heading ${s.color}`}>
              {s.count}
            </p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bulk actions */}
      {statusCounts.ATTENDING > 0 && (
        <AttendanceActions
          eventId={event.id}
          pendingCount={statusCounts.ATTENDING}
        />
      )}

      {/* Attendance table */}
      {event.attendances.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          Belum ada pendaftar.
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Peserta
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Terdaftar
                  </th>
                  {event.requireProof && (
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Bukti Foto
                    </th>
                  )}
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Diverifikasi oleh
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {event.attendances.map((att) => (
                  <tr
                    key={att.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                          {att.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={att.user.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (att.user.name?.charAt(0).toUpperCase() ?? "U")
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {att.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {att.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[att.status]}`}
                      >
                        {STATUS_LABEL[att.status] ?? att.status}
                      </span>
                      {att.verificationNotes && (
                        <p className="text-xs text-red-500 mt-0.5 max-w-[160px] truncate">
                          {att.verificationNotes}
                        </p>
                      )}
                    </td>

                    {/* Registered at */}
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {format(new Date(att.registeredAt), "d MMM yyyy, HH:mm", {
                        locale: idLocale,
                      })}
                    </td>

                    {/* Proofs */}
                    {event.requireProof && (
                      <td className="px-4 py-3">
                        {att.proofs.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        ) : (
                          <div className="flex gap-1.5 flex-wrap">
                            {att.proofs.map((proof) => (
                              <a
                                key={proof.id}
                                href={proof.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={proof.caption ?? undefined}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={proof.thumbnailUrl ?? proof.url}
                                  alt="Bukti"
                                  className="size-10 rounded-lg object-cover border hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                    )}

                    {/* Verified by */}
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {att.verifiedBy?.name ?? "—"}
                      {att.verifiedAt && (
                        <div className="text-[10px] text-muted-foreground/60">
                          {format(new Date(att.verifiedAt), "d MMM, HH:mm")}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {(att.status === "ATTENDING" ||
                        att.status === "REGISTERED") && (
                        <AttendanceActions
                          attendanceId={att.id}
                          eventId={event.id}
                          mode="single"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
