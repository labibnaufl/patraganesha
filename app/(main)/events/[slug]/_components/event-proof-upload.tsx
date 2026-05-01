"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { Upload, X, ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { uploadAttendanceProofAction } from "../_lib/actions";

type Props = {
  attendanceId: string;
  currentProofCount: number;
  maxProofs: number;
  onSuccess?: () => void;
};

type UploadedFile = {
  localId: string;
  preview: string;
  status: "uploading" | "done" | "error";
  error?: string;
};

export function EventProofUpload({
  attendanceId,
  currentProofCount,
  maxProofs,
  onSuccess,
}: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [caption, setCaption] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining =
    maxProofs -
    currentProofCount -
    files.filter((f) => f.status === "done").length;
  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  async function handleFiles(selected: FileList | null) {
    if (!selected) return;
    setGlobalError(null);
    const toAdd = Array.from(selected).slice(0, remaining);

    for (const file of toAdd) {
      const localId = `${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);

      setFiles((prev) => [...prev, { localId, preview, status: "uploading" }]);

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "proof");
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload gagal.");

        // Save to DB
        const saveResult = await uploadAttendanceProofAction(attendanceId, {
          ...data,
          caption: caption || undefined,
        });
        if (saveResult?.error) throw new Error(saveResult.error);

        setFiles((prev) =>
          prev.map((f) =>
            f.localId === localId ? { ...f, status: "done" } : f,
          ),
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.localId === localId
              ? {
                  ...f,
                  status: "error",
                  error: err instanceof Error ? err.message : "Error",
                }
              : f,
          ),
        );
      }
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remaining, caption, attendanceId],
  );

  function removeFile(localId: string) {
    setFiles((prev) => prev.filter((f) => f.localId !== localId));
  }

  function handleDone() {
    startTransition(() => {
      onSuccess?.();
    });
  }

  return (
    <div className="mt-4 p-5 rounded-2xl border border-border/60 bg-muted/20 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Upload Bukti Kehadiran
        </h3>
        <span className="text-xs text-muted-foreground">
          {remaining} slot tersisa
        </span>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
          Keterangan (opsional)
        </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Contoh: Foto saat registrasi meja 3"
          className="w-full px-3 py-2 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Drop zone */}
      {remaining > 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-8 cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          <Upload className={`w-6 h-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-sm text-muted-foreground text-center">
            {isDragging ? (
              <span className="text-primary font-medium">Lepaskan foto di sini</span>
            ) : (
              <>
                Klik atau tarik foto ke sini
                <br />
                <span className="text-xs">JPG, PNG, WebP — maks 5MB per foto</span>
              </>
            )}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-hidden">
          {files.map((f) => (
            <div key={f.localId} className="relative group overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.preview}
                alt=""
                className={`w-full aspect-square object-cover border transition-opacity ${
                  f.status === "uploading" ? "opacity-50" : ""
                }`}
              />
              {/* Overlay status */}
              {f.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              {f.status === "done" && (
                <div className="absolute top-1.5 right-1.5 bg-green-500 rounded-full p-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {f.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 px-2">
                  <X className="w-4 h-4 text-white mb-1" />
                  <p className="text-[10px] text-white text-center leading-tight break-all">
                    {f.error}
                  </p>
                </div>
              )}
              {/* Remove button */}
              {f.status !== "uploading" && (
                <button
                  onClick={() => removeFile(f.localId)}
                  className="absolute top-1.5 left-1.5 bg-black/50 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {globalError && (
        <p className="text-xs text-red-600 font-medium">{globalError}</p>
      )}

      {allDone && (
        <button
          onClick={handleDone}
          disabled={isPending}
          className="w-full py-2.5 rounded-full bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          <CheckCircle2 className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          Selesai — Bukti Terkirim
        </button>
      )}
    </div>
  );
}
