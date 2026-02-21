"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Eye,
  ShieldCheck,
  ShieldX,
  Ban,
  ShieldAlert,
  Archive,
  ArchiveRestore,
  UserCog,
  Crown,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  approveUser,
  rejectUser,
  banUser,
  unbanUser,
  updateUserRole,
  archiveUser,
  unarchiveUser,
} from "../_lib/actions";

type User = {
  id: string;
  name: string;
  status: string;
  banned: boolean;
  role: string;
};

export function UserActions({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();

  const isSelf = false; // Handled server-side
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center justify-center size-8 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? (
            <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <MoreHorizontal className="size-4" />
          )}
          <span className="sr-only">Aksi</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {user.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* View Detail */}
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user.id}`}>
            <Eye className="size-4 mr-2" />
            Lihat Detail
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Approval Actions — PENDING: show Setujui + Tolak; REJECTED: show reinstate only */}
        {(user.status === "PENDING" || user.status === "REJECTED") && (
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => startTransition(() => approveUser(user.id))}
              className="text-emerald-600"
            >
              {user.status === "REJECTED" ? (
                <RotateCcw className="size-4 mr-2" />
              ) : (
                <ShieldCheck className="size-4 mr-2" />
              )}
              {user.status === "REJECTED" ? "Setujui Kembali" : "Setujui"}
            </DropdownMenuItem>
            {user.status === "PENDING" && (
              <DropdownMenuItem
                onClick={() => startTransition(() => rejectUser(user.id))}
                className="text-red-600"
              >
                <ShieldX className="size-4 mr-2" />
                Tolak
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}

        {/* Role Change Sub-menu */}
        {!isSuperAdmin && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserCog className="size-4 mr-2" />
              Ubah Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                disabled={user.role === "GUEST"}
                onClick={() =>
                  startTransition(() => updateUserRole(user.id, "GUEST"))
                }
              >
                Guest
                {user.role === "GUEST" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    aktif
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.role === "USER"}
                onClick={() =>
                  startTransition(() => updateUserRole(user.id, "USER"))
                }
              >
                User
                {user.role === "USER" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    aktif
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={user.role === "ADMIN"}
                onClick={() =>
                  startTransition(() => updateUserRole(user.id, "ADMIN"))
                }
              >
                <Crown className="size-4 mr-2 text-amber-500" />
                Admin
                {user.role === "ADMIN" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    aktif
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />

        {/* Ban / Unban */}
        {!isSuperAdmin && (
          <>
            {user.banned ? (
              <DropdownMenuItem
                onClick={() => startTransition(() => unbanUser(user.id))}
                className="text-blue-600"
              >
                <ShieldAlert className="size-4 mr-2" />
                Unban Pengguna
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  const reason = prompt("Alasan ban:");
                  if (reason !== null) {
                    startTransition(() => banUser(user.id, reason));
                  }
                }}
                className="text-red-600"
              >
                <Ban className="size-4 mr-2" />
                Ban Pengguna
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* Archive / Unarchive */}
        {!isSuperAdmin && (
          <>
            {user.status === "ARCHIVED" ? (
              <DropdownMenuItem
                onClick={() => startTransition(() => unarchiveUser(user.id))}
              >
                <ArchiveRestore className="size-4 mr-2" />
                Aktifkan Kembali
              </DropdownMenuItem>
            ) : (
              user.status !== "PENDING" && (
                <DropdownMenuItem
                  onClick={() => startTransition(() => archiveUser(user.id))}
                  className="text-amber-600"
                >
                  <Archive className="size-4 mr-2" />
                  Arsipkan
                </DropdownMenuItem>
              )
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
