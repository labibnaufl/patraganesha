"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Users } from "lucide-react";
import {
  verifyAttendanceAction,
  rejectAttendanceAction,
  verifyAllPendingAction,
} from "../_lib/actions";

// ─── Single attendance actions ───────────────────────────────────────────────
type SingleProps = {
  mode: "single";
  attendanceId: string;
  eventId: string;
};

// ─── Bulk actions ────────────────────────────────────────────────────────────
type BulkProps = {
  mode?: never;
  eventId: string;
  pendingCount: number;
};

type Props = SingleProps | BulkProps;

export function AttendanceActions(props: Props) {
  const [isPending, startTransition] = useTransition();
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Bulk mode ───────────────────────────────────────────────────────────
  if (!props.mode) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200">
        <Users className="size-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 flex-1">
          <span className="font-semibold">{props.pendingCount}</span> bukti
          menunggu verifikasi.
        </p>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const r = await verifyAllPendingAction(props.eventId);
              if (r?.error) setError(r.error);
            })
          }
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <CheckCircle2 className="size-3.5" />
          {isPending ? "Memverifikasi..." : "Verifikasi Semua"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // ── Single mode ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const r = await verifyAttendanceAction(props.attendanceId);
              if (r?.error) setError(r.error);
            })
          }
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <CheckCircle2 className="size-3" />
          {isPending ? "..." : "Verifikasi"}
        </button>

        <button
          disabled={isPending}
          onClick={() => setShowRejectInput((v) => !v)}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          <XCircle className="size-3" />
          Tolak
        </button>
      </div>

      {showRejectInput && (
        <div className="flex gap-1.5">
          <input
            type="text"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Alasan penolakan..."
            className="flex-1 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
          />
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const r = await rejectAttendanceAction(
                  props.attendanceId,
                  rejectNote || undefined,
                );
                if (r?.error) setError(r.error);
                else setShowRejectInput(false);
              })
            }
            className="px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "..." : "Kirim"}
          </button>
        </div>
      )}

      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
