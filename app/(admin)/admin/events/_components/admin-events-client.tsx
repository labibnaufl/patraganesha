"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, CalendarDays, MapPin, Users } from "lucide-react";
import { getAdminEvents } from "../../_lib/admin-actions";
import { EventStatusActions } from "./event-status-actions";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

const LOCATION_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

interface EventData {
  events: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    locationType: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    maxParticipants: number | null;
    currentParticipants: number;
    coverImage: string | null;
    publishedAt: string | null;
    createdAt: string;
    tags: Array<{ tag: { name: string } }>;
    organizer: { name: string | null };
  }>;
  total: number;
  stats: Array<{ status: string; _count: { id: number } }>;
  totalPages: number;
}

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminEvents({ search, status, page });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilter = (formData: FormData) => {
    const params = new URLSearchParams();
    const newSearch = formData.get("search") as string;
    const newStatus = formData.get("status") as string;

    if (newSearch) params.set("search", newSearch);
    if (newStatus) params.set("status", newStatus);

    router.push(`/admin/events?${params.toString()}`);
  };

  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (overrides.page === "1") params.delete("page");
    return `/admin/events${params.toString() ? `?${params.toString()}` : ""}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  const statsMap = Object.fromEntries(
    data.stats.map((s: any) => [s.status, s._count.id])
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <CalendarDays className="size-6" />
            Events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.total} event(s) total
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          New Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Draft", key: "DRAFT", color: "text-amber-600" },
          { label: "Published", key: "PUBLISHED", color: "text-emerald-600" },
          { label: "Archived", key: "ARCHIVED", color: "text-gray-500" },
        ].map((s) => (
          <Link
            key={s.key}
            href={buildHref({ status: status === s.key ? "" : s.key })}
            className={`rounded-xl border bg-card p-4 hover:bg-accent/50 transition-colors ${status === s.key ? "ring-2 ring-primary" : ""}`}
          >
            <p className={`text-2xl font-bold font-heading ${s.color}`}>
              {statsMap[s.key] ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <form
        action={handleFilter}
        className="flex flex-wrap gap-3 mb-6"
      >
        <input
          name="search"
          defaultValue={search}
          placeholder="Search events..."
          className="flex-1 min-w-48 px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 text-sm border rounded-lg bg-background"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors"
        >
          Search
        </button>
        {(search || status) && (
          <Link
            href="/admin/events"
            className="px-4 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Event
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Location
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Participants
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Organizer
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.events.map((ev: any) => (
                <tr
                  key={ev.id}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {ev.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.coverImage}
                          alt=""
                          className="size-10 rounded-lg object-cover bg-muted flex-shrink-0"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <CalendarDays className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {ev.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {ev.tags.slice(0, 3).map((t: any) => (
                            <span
                              key={t.tag.name}
                              className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {t.tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    <div className="text-sm">
                      {new Date(ev.startDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    {ev.endDate && (
                      <div className="text-xs text-muted-foreground/70">
                        →{" "}
                        {new Date(ev.endDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {LOCATION_LABELS[ev.locationType ?? "OFFLINE"]}
                    </span>
                    {ev.location && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
                        {ev.location}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Users className="size-3.5 text-muted-foreground" />
                      {ev.currentParticipants}
                      {ev.maxParticipants ? `/${ev.maxParticipants}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ev.status]}`}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {ev.organizer.name}
                  </td>
                  <td className="px-4 py-3">
                    <EventStatusActions
                      eventId={ev.id}
                      status={ev.status as "DRAFT" | "PUBLISHED" | "ARCHIVED"}
                      title={ev.title}
                    />
                  </td>
                </tr>
              ))}
              {data.events.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No events found.{" "}
                    <Link
                      href="/admin/events/new"
                      className="text-primary hover:underline"
                    >
                      Create one
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Previous
              </Link>
            )}
            {page < data.totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminEventsClient() {
  return (
    <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-xl" />}>
      <EventsContent />
    </Suspense>
  );
}
