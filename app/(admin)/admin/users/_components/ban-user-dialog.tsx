"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function BanUserDialog({
  userId,
  userName,
  onBan,
  open,
  onOpenChange,
  trigger,
}: {
  userId: string;
  userName: string;
  onBan?: (userId: string, reason: string) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : localOpen;
  const setDialogOpen = isControlled ? onOpenChange : setLocalOpen;

  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleBanUser = async () => {
    setIsPending(true);
    try {
      if (onBan) {
        await onBan(userId, reason);
      } else {
        // Fallback or placeholder if standard server action isn't passed in directly
        console.log(`Banning user ${userId} for reason: ${reason}`);
        // await banUserAction(userId, reason);
      }
      setDialogOpen(false);
      setReason(""); // Reset for next time
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ban Pengguna: {userName}</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin memblokir pengguna ini? Silakan berikan
            alasan pemblokiran di bawah ini. Tindakan ini akan mencabut akses
            mereka ke sistem.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Textarea
            placeholder="Contoh: Terdeteksi melakukan spam di komentar acara..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full min-h-[100px]"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleBanUser}
            disabled={!reason.trim() || isPending}
          >
            {isPending ? "Memproses..." : "Konfirmasi Blokir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
