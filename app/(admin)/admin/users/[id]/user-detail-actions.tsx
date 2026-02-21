"use client";

import { useTransition } from "react";
import {
  approveUser,
  rejectUser,
  banUser,
  unbanUser,
  updateUserRole,
  archiveUser,
  unarchiveUser,
} from "../../_lib/actions";

export function UserDetailActions({
  userId,
  currentRole,
  currentStatus,
  isBanned,
  isSuperAdmin,
}: {
  userId: string;
  currentRole: string;
  currentStatus: string;
  isBanned: boolean;
  isSuperAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const roles = [
    { value: "GUEST", label: "Guest" },
    { value: "USER", label: "User" },
    ...(isSuperAdmin
      ? [
          { value: "ADMIN", label: "Admin" },
          { value: "SUPER_ADMIN", label: "Super Admin" },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      {/* Role Change */}
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">
          Ubah Role
        </label>
        <select
          defaultValue={currentRole}
          disabled={isPending || currentRole === "SUPER_ADMIN"}
          onChange={(e) => {
            const newRole = e.target.value as
              | "SUPER_ADMIN"
              | "ADMIN"
              | "USER"
              | "GUEST";
            if (confirm(`Ubah role menjadi ${newRole}?`)) {
              startTransition(() => updateUserRole(userId, newRole));
            }
          }}
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background disabled:opacity-50"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Actions */}
      {currentStatus === "PENDING" && (
        <div className="flex gap-2">
          <button
            disabled={isPending}
            onClick={() => startTransition(() => approveUser(userId))}
            className="flex-1 px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Setujui
          </button>
          <button
            disabled={isPending}
            onClick={() => startTransition(() => rejectUser(userId))}
            className="flex-1 px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Tolak
          </button>
        </div>
      )}

      {/* Re-approve rejected user */}
      {currentStatus === "REJECTED" && (
        <button
          disabled={isPending}
          onClick={() => {
            if (confirm("Setujui kembali pengguna yang ditolak ini?")) {
              startTransition(() => approveUser(userId));
            }
          }}
          className="w-full px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          ↩ Setujui Kembali
        </button>
      )}

      {/* Ban/Unban */}
      {!isBanned && currentRole !== "SUPER_ADMIN" && (
        <button
          disabled={isPending}
          onClick={() => {
            const reason = prompt("Alasan ban:");
            if (reason !== null) {
              startTransition(() => banUser(userId, reason));
            }
          }}
          className="w-full px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Ban Pengguna
        </button>
      )}

      {isBanned && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => unbanUser(userId))}
          className="w-full px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Unban Pengguna
        </button>
      )}

      {/* Archive / Unarchive */}
      {currentRole !== "SUPER_ADMIN" && (
        <>
          {currentStatus === "ARCHIVED" ? (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => unarchiveUser(userId))}
              className="w-full px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Aktifkan Kembali
            </button>
          ) : (
            currentStatus !== "PENDING" &&
            currentStatus !== "REJECTED" && (
              <button
                disabled={isPending}
                onClick={() => {
                  if (confirm("Arsipkan pengguna ini?")) {
                    startTransition(() => archiveUser(userId));
                  }
                }}
                className="w-full px-3 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                Arsipkan Pengguna
              </button>
            )
          )}
        </>
      )}

      {isPending && (
        <p className="text-xs text-muted-foreground text-center">
          Memproses...
        </p>
      )}
    </div>
  );
}
