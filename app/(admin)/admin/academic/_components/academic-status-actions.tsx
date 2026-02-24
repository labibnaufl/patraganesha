"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Globe,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  publishAcademic,
  archiveAcademic,
  revertAcademicToDraft,
  deleteAcademic,
} from "../_lib/action";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export function AcademicStatusActions({
  academicId,
  status,
  title,
}: {
  academicId: string;
  status: Status;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const run = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          className="size-8"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {/* Edit — always available */}
        <DropdownMenuItem asChild>
          <Link href={`/admin/academic/${academicId}`}>
            <Pencil className="size-3.5 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* DRAFT → publish */}
        {status === "DRAFT" && (
          <DropdownMenuItem
            onClick={() => run(() => publishAcademic(academicId))}
            className="text-emerald-600"
          >
            <Globe className="size-3.5 mr-2" />
            Publish
          </DropdownMenuItem>
        )}

        {/* PUBLISHED → draft / archive */}
        {status === "PUBLISHED" && (
          <>
            <DropdownMenuItem
              onClick={() => run(() => revertAcademicToDraft(academicId))}
            >
              <RotateCcw className="size-3.5 mr-2" />
              Revert to Draft
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => run(() => archiveAcademic(academicId))}
            >
              <Archive className="size-3.5 mr-2" />
              Archive
            </DropdownMenuItem>
          </>
        )}

        {/* ARCHIVED → republish / draft */}
        {status === "ARCHIVED" && (
          <>
            <DropdownMenuItem
              onClick={() => run(() => publishAcademic(academicId))}
              className="text-emerald-600"
            >
              <Globe className="size-3.5 mr-2" />
              Re-publish
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => run(() => revertAcademicToDraft(academicId))}
            >
              <RotateCcw className="size-3.5 mr-2" />
              Revert to Draft
            </DropdownMenuItem>
          </>
        )}

        {/* Delete — only for non-PUBLISHED */}
        {status !== "PUBLISHED" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (
                  confirm(
                    `Delete academic info "${title}"? This cannot be undone.`,
                  )
                ) {
                  run(() => deleteAcademic(academicId));
                }
              }}
            >
              <Trash2 className="size-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
