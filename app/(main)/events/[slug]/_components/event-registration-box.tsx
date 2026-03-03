"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  LogIn,
  UserCheck,
  UserMinus,
  Upload,
} from "lucide-react";
import {
  registerForEventAction,
  cancelEventRegistrationAction,
} from "../_lib/actions";
import Link from "next/link";
import { EventProofUpload } from "./event-proof-upload";

type AttendanceStatus =
  | "ABSEN"
  | "REGISTERED"
  | "ATTENDING"
  | "ATTENDED"
  | "REJECTED"
  | "CANCELLED";

type UserAttendance = {
  id: string;
  status: AttendanceStatus;
  proofs: { id: string; thumbnailUrl: string | null; url: string }[];
} | null;

type Props = {
  eventId: string;
  isLoggedIn: boolean;
  registrationOpen: boolean; // deadline not passed AND event not full
  isFull: boolean;
  deadlinePassed: boolean;
  eventPast: boolean; // startDate < now
  requireProof: boolean;
  maxProofsPerUser: number;
  userAttendance: UserAttendance;
};

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  ABSEN: {
    label: "Belum Daftar",
    color: "text-muted-foreground",
    icon: AlertCircle,
  },
  REGISTERED: {
    label: "Terdaftar",
    color: "text-blue-600",
    icon: CheckCircle2,
  },
  ATTENDING: {
    label: "Bukti Dikirim",
    color: "text-amber-600",
    icon: Clock,
  },
  ATTENDED: {
    label: "Hadir Terverifikasi",
    color: "text-green-600",
    icon: CheckCircle2,
  },
  REJECTED: { label: "Bukti Ditolak", color: "text-red-600", icon: XCircle },
  CANCELLED: { label: "Dibatalkan", color: "text-gray-500", icon: XCircle },
};

export function EventRegistrationBox({
  eventId,
  isLoggedIn,
  registrationOpen,
  isFull,
  deadlinePassed,
  eventPast,
  requireProof,
  maxProofsPerUser,
  userAttendance,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showProofUpload, setShowProofUpload] = useState(false);

  const status: AttendanceStatus = userAttendance?.status ?? "ABSEN";
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const isRegistered =
    status === "REGISTERED" ||
    status === "ATTENDING" ||
    status === "ATTENDED" ||
    status === "REJECTED";

  function handleRegister() {
    setError(null);
    startTransition(async () => {
      const result = await registerForEventAction(eventId);
      if (result?.error) setError(result.error);
    });
  }

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelEventRegistrationAction(eventId);
      if (result?.error) setError(result.error);
      setShowCancelConfirm(false);
    });
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Login untuk mendaftar event ini.
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover px-6 py-3 rounded-full font-bold text-sm transition-all shrink-0"
        >
          <LogIn className="w-4 h-4" />
          Login Sekarang
        </Link>
      </div>
    );
  }

  // ── Already registered ────────────────────────────────────────────────────
  if (isRegistered) {
    const canUploadProof =
      requireProof &&
      eventPast &&
      (status === "REGISTERED" ||
        status === "ATTENDING" ||
        status === "REJECTED") &&
      (userAttendance?.proofs.length ?? 0) < maxProofsPerUser;

    return (
      <div className="space-y-4">
        {/* Status badge */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span
            className={`inline-flex items-center gap-2 text-sm font-semibold ${statusConfig.color}`}
          >
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </span>

          <div className="flex gap-2">
            {canUploadProof && (
              <button
                onClick={() => setShowProofUpload((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary text-white hover:bg-brand-hover text-sm font-semibold transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Bukti Foto
              </button>
            )}

            {/* Cancel – only if not yet attended */}
            {status !== "ATTENDED" && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium text-muted-foreground hover:text-red-600 hover:border-red-300 transition-all"
              >
                <UserMinus className="w-4 h-4" />
                Batalkan
              </button>
            )}
          </div>
        </div>

        {/* Cancel confirm */}
        {showCancelConfirm && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 flex-1">
              Yakin ingin membatalkan pendaftaran?
            </p>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="px-4 py-1.5 rounded-full bg-red-600 text-white text-sm font-semibold disabled:opacity-50 transition-all hover:bg-red-700"
            >
              {isPending ? "Membatalkan..." : "Ya, Batalkan"}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="px-4 py-1.5 rounded-full border text-sm text-muted-foreground hover:bg-muted transition-all"
            >
              Tidak
            </button>
          </div>
        )}

        {/* Proof thumbnails */}
        {userAttendance && userAttendance.proofs.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Bukti terkirim ({userAttendance.proofs.length}/{maxProofsPerUser}
              ):
            </p>
            <div className="flex gap-2 flex-wrap">
              {userAttendance.proofs.map((proof) => (
                <a
                  key={proof.id}
                  href={proof.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proof.thumbnailUrl ?? proof.url}
                    alt="Bukti kehadiran"
                    className="w-16 h-16 rounded-xl object-cover border hover:opacity-80 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Proof upload panel */}
        {showProofUpload && userAttendance && (
          <EventProofUpload
            attendanceId={userAttendance.id}
            currentProofCount={userAttendance.proofs.length}
            maxProofs={maxProofsPerUser}
            onSuccess={() => setShowProofUpload(false)}
          />
        )}

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }

  // ── Cancelled ─────────────────────────────────────────────────────────────
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-gray-500">
          <XCircle className="w-4 h-4" />
          Pendaftaranmu dibatalkan.{" "}
          {registrationOpen ? "Kamu bisa mendaftar lagi." : ""}
        </span>
        {registrationOpen && (
          <button
            onClick={handleRegister}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover px-6 py-3 rounded-full font-bold text-sm disabled:opacity-60 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            {isPending ? "Mendaftar..." : "Daftar Lagi"}
          </button>
        )}
        {error && <p className="text-xs text-red-600 w-full">{error}</p>}
      </div>
    );
  }

  // ── Not registered yet ────────────────────────────────────────────────────
  if (isFull) {
    return (
      <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
        <XCircle className="w-4 h-4" />
        Kuota peserta sudah penuh.
      </div>
    );
  }
  if (deadlinePassed || eventPast) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        <Clock className="w-4 h-4" />
        Pendaftaran sudah ditutup.
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleRegister}
        disabled={isPending}
        className={`inline-flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover px-8 py-3.5 rounded-full font-bold transition-all disabled:opacity-60 ${isPending ? "cursor-wait" : ""}`}
      >
        <UserCheck className="w-4 h-4" />
        {isPending ? "Mendaftar..." : "Daftar Sekarang"}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
      )}
    </div>
  );
}
