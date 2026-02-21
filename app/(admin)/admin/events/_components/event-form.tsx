"use client";

import { useActionState, useRef, useState } from "react";
import {
  MapPin,
  Link as LinkIcon,
  Users,
  Phone,
  Mail,
  User,
  Calendar,
} from "lucide-react";

type Tag = { id: string; name: string };

type EventData = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  locationType: string | null;
  location: string | null;
  registrationLink: string | null;
  registrationDeadline: Date | null;
  maxParticipants: number | null;
  currentParticipants: number;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  requireProof: boolean;
  autoVerify: boolean;
  maxProofsPerUser: number;
  coverImage: string | null;
  tags: { tagId: string }[];
};

type Props = {
  action: (
    prevState: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string } | undefined>;
  tags: Tag[];
  event?: EventData;
};

// Format a Date to datetime-local string ("YYYY-MM-DDTHH:MM")
function toDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ action, tags, event }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  const [locationType, setLocationType] = useState(
    event?.locationType ?? "OFFLINE",
  );
  const [requireProof, setRequireProof] = useState(event?.requireProof ?? true);
  const [autoVerify, setAutoVerify] = useState(event?.autoVerify ?? false);

  const [coverPreview, setCoverPreview] = useState(event?.coverImage ?? "");
  const [coverUrl, setCoverUrl] = useState(event?.coverImage ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedTagIds = event?.tags.map((t) => t.tagId) ?? [];

  const locationTypes = [
    { value: "OFFLINE", label: "Offline" },
    { value: "ONLINE", label: "Online" },
    { value: "HYBRID", label: "Hybrid" },
  ];

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden values for boolean fields */}
      <input type="hidden" name="requireProof" value={String(requireProof)} />
      <input type="hidden" name="autoVerify" value={String(autoVerify)} />
      <input type="hidden" name="coverImage" value={coverUrl} />

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
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              defaultValue={event?.title}
              placeholder="Event title..."
              required
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              defaultValue={event?.description}
              placeholder="Full event description..."
              required
              rows={6}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Calendar className="inline size-3.5 mr-1" />
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                defaultValue={toDatetimeLocal(event?.startDate)}
                required
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Calendar className="inline size-3.5 mr-1" />
                End Date
              </label>
              <input
                type="datetime-local"
                name="endDate"
                defaultValue={toDatetimeLocal(event?.endDate)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Location Type + Location */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Location Type</label>
            <div className="flex gap-2">
              {locationTypes.map((lt) => (
                <button
                  key={lt.value}
                  type="button"
                  onClick={() => setLocationType(lt.value)}
                  className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                    locationType === lt.value
                      ? "bg-primary text-primary-foreground border-transparent"
                      : "hover:bg-accent"
                  }`}
                >
                  {lt.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="locationType" value={locationType} />

            {/* Physical location — shown for OFFLINE and HYBRID */}
            {(locationType === "OFFLINE" || locationType === "HYBRID") && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  <MapPin className="inline size-3 mr-1" />
                  Venue / Address
                </label>
                <input
                  name="location"
                  defaultValue={event?.location ?? ""}
                  placeholder="e.g. Aula PATRA, Bandung"
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            {/* Online link — shown for ONLINE and HYBRID */}
            {(locationType === "ONLINE" || locationType === "HYBRID") && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  <LinkIcon className="inline size-3 mr-1" />
                  Meeting / Stream Link
                </label>
                <input
                  name="registrationLink"
                  type="url"
                  defaultValue={event?.registrationLink ?? ""}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>

          {/* Registration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                defaultValue={toDatetimeLocal(event?.registrationDeadline)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Users className="inline size-3.5 mr-1" />
                Max Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                defaultValue={event?.maxParticipants ?? ""}
                min={1}
                placeholder="Unlimited"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <p className="text-sm font-medium">Contact Info (Optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  <User className="inline size-3 mr-1" />
                  Contact Person
                </label>
                <input
                  name="contactPerson"
                  defaultValue={event?.contactPerson ?? ""}
                  placeholder="Full name"
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  <Phone className="inline size-3 mr-1" />
                  Phone / WhatsApp
                </label>
                <input
                  name="contactPhone"
                  defaultValue={event?.contactPhone ?? ""}
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
                defaultValue={event?.contactEmail ?? ""}
                placeholder="contact@example.com"
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
                className="w-full h-36 object-cover rounded-lg mb-3 bg-muted"
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
                    fd.append("folder", "patra/events");
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
                  "Change Image"
                ) : (
                  "Upload Image"
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
                  Remove Image
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
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

          {/* Attendance Settings */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <p className="text-sm font-medium">Attendance Settings</p>
            <label className="flex items-center justify-between text-sm cursor-pointer">
              <span className="text-muted-foreground">Require photo proof</span>
              <button
                type="button"
                onClick={() => setRequireProof((v) => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${requireProof ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`inline-block size-3.5 rounded-full bg-white transition-transform ${requireProof ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </label>
            {requireProof && (
              <>
                <label className="flex items-center justify-between text-sm cursor-pointer">
                  <span className="text-muted-foreground">
                    Auto-verify proofs
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoVerify((v) => !v)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoVerify ? "bg-primary" : "bg-muted"}`}
                  >
                    <span
                      className={`inline-block size-3.5 rounded-full bg-white transition-transform ${autoVerify ? "translate-x-4" : "translate-x-0.5"}`}
                    />
                  </button>
                </label>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Max photos per attendee
                  </label>
                  <input
                    type="number"
                    name="maxProofsPerUser"
                    defaultValue={event?.maxProofsPerUser ?? 3}
                    min={1}
                    max={10}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </>
            )}
            {!requireProof && (
              <input type="hidden" name="maxProofsPerUser" value="3" />
            )}
          </div>
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
          {isPending ? "Saving..." : "Save Draft"}
        </button>
        <button
          type="submit"
          name="action"
          value="publish"
          disabled={isPending || isUploading}
          className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Processing..." : "Publish"}
        </button>
        {isUploading && (
          <p className="text-xs text-muted-foreground">
            Wait for image upload to complete...
          </p>
        )}
      </div>
    </form>
  );
}
