"use client";

import { useActionState, useRef, useState } from "react";
import {
  Link as LinkIcon,
  Phone,
  Mail,
  User,
  Calendar,
  FolderOpen,
  Trophy,
  Gift,
  ListChecks,
} from "lucide-react";

type Tag = { id: string; name: string };

type AcademicData = {
  id: string;
  title: string;
  description: string;
  type: string;
  coverImage: string | null;
  driveLink: string | null;
  externalLink: string | null;
  deadline: Date | null;
  requirements: string | null;
  prizes: string | null;
  benefits: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  tags: { tagId: string }[];
};

type Props = {
  action: (
    prevState: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string } | undefined>;
  tags: Tag[];
  academic?: AcademicData;
};

// Format a Date to datetime-local string ("YYYY-MM-DDTHH:MM")
function toDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AcademicForm({ action, tags, academic }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  const [type, setType] = useState(academic?.type ?? "INFO_KAMPUS");

  const [coverPreview, setCoverPreview] = useState(academic?.coverImage ?? "");
  const [coverUrl, setCoverUrl] = useState(academic?.coverImage ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedTagIds = academic?.tags.map((t) => t.tagId) ?? [];

  const typeOptions = [
    { value: "LOMBA", label: "Lomba / Kompetisi" },
    { value: "BEASISWA", label: "Beasiswa" },
    { value: "INFO_KAMPUS", label: "Info Kampus" },
  ];

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden values */}
      <input type="hidden" name="coverImage" value={coverUrl} />
      <input type="hidden" name="type" value={type} />

      {state?.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- Main Column ---- */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              defaultValue={academic?.title}
              placeholder="Judul informasi..."
              required
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Jenis Informasi</label>
            <div className="flex gap-2 flex-wrap">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                    type === opt.value
                      ? "bg-primary text-primary-foreground border-transparent"
                      : "hover:bg-accent"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              defaultValue={academic?.description}
              placeholder="Deskripsi lengkap..."
              required
              rows={6}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Requirements (Persyaratan) */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              <ListChecks className="inline size-3.5 mr-1" />
              Persyaratan (Opsional)
            </label>
            <textarea
              name="requirements"
              defaultValue={academic?.requirements ?? ""}
              placeholder="1. Mahasiswa aktif semester 3-7..."
              rows={4}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Dynamic Details block based on Type */}
          {(type === "LOMBA" || type === "BEASISWA") && (
            <div className="p-4 rounded-xl border bg-card/50">
              {type === "LOMBA" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Trophy className="inline size-3.5 mr-1" />
                    Hadiah (Opsional)
                  </label>
                  <textarea
                    name="prizes"
                    defaultValue={academic?.prizes ?? ""}
                    placeholder="Juara 1: Rp 5.000.000..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              )}

              {type === "BEASISWA" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Gift className="inline size-3.5 mr-1" />
                    Benefit / Benefit Beasiswa (Opsional)
                  </label>
                  <textarea
                    name="benefits"
                    defaultValue={academic?.benefits ?? ""}
                    placeholder="Bantuan UKT Rp 5.000.000 / semester..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              <Calendar className="inline size-3.5 mr-1" />
              Deadline / Tenggat Waktu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="deadline"
              defaultValue={toDatetimeLocal(academic?.deadline)}
              required
              className="w-full sm:w-1/2 px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <FolderOpen className="inline size-3.5 mr-1" />
                Google Drive Link
              </label>
              <input
                name="driveLink"
                type="url"
                defaultValue={academic?.driveLink ?? ""}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <LinkIcon className="inline size-3.5 mr-1" />
                Website Link
              </label>
              <input
                name="externalLink"
                type="url"
                defaultValue={academic?.externalLink ?? ""}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <p className="text-sm font-medium">Narahubung (Opsional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  <User className="inline size-3 mr-1" />
                  Nama
                </label>
                <input
                  name="contactPerson"
                  defaultValue={academic?.contactPerson ?? ""}
                  placeholder="Nama CP"
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  <Phone className="inline size-3 mr-1" />
                  Telepon / WA
                </label>
                <input
                  name="contactPhone"
                  defaultValue={academic?.contactPhone ?? ""}
                  placeholder="+62..."
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                <Mail className="inline size-3 mr-1" />
                Email
              </label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={academic?.contactEmail ?? ""}
                placeholder="info@..."
                className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* ---- Sidebar Column ---- */}
        <div className="space-y-5">
          {/* Cover Image */}
          <div className="rounded-xl border bg-card p-4">
            <label className="block text-sm font-medium mb-2">
              Cover Image
            </label>
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg mb-3 bg-muted"
              />
            )}
            <div className="flex gap-2 flex-col">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setCoverPreview(URL.createObjectURL(file));
                  setUploadError(null);
                  setIsUploading(true);
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("folder", "patra/academic");
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: fd,
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setCoverUrl(data.url);
                  } catch (err) {
                    setUploadError(
                      err instanceof Error ? err.message : "Upload failed.",
                    );
                    setCoverPreview("");
                    setCoverUrl("");
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : coverPreview ? (
                  "Ganti Gambar"
                ) : (
                  "Upload Gambar"
                )}
              </button>
              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}
              {coverPreview && !isUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview("");
                    setCoverUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-full px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Hapus Gambar
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <label className="block text-sm font-medium mb-2">Tag</label>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground"
                  >
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={selectedTagIds.includes(tag.id)}
                      className="rounded"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          type="submit"
          name="action"
          value="draft"
          disabled={isPending || isUploading}
          className="px-5 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Draft"}
        </button>
        <button
          type="submit"
          name="action"
          value="publish"
          disabled={isPending || isUploading}
          className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Publish"}
        </button>
        {isUploading && (
          <p className="text-xs text-muted-foreground">
            Tunggu sampai proses upload gambar selesai...
          </p>
        )}
      </div>
    </form>
  );
}
