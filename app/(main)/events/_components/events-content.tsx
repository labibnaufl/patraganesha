"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isFuture, isPast } from "date-fns";
import { Search, ChevronDown } from "lucide-react";
import { EventCard } from "./event-card";

const LOCATION_TYPES = [
  { value: "", label: "Semua Lokasi" },
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "Offline" },
  { value: "HYBRID", label: "Hybrid" },
];

const TIME_FILTERS = [
  { value: "UPCOMING", label: "Akan Datang" },
  { value: "PAST", label: "Selesai" },
  { value: "ALL", label: "Semua Waktu" },
];

const PER_PAGE = 12;

interface Event {
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  locationType: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  tags: { tag: { name: string } }[];
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <label className="absolute -top-2 left-3 text-[10px] font-semibold text-muted-foreground bg-background px-1 z-10 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-sm font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export function EventsContent({
  events: initialEvents,
}: {
  events: Event[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const urlTime = searchParams.get("time") ?? "UPCOMING";
  const urlLocation = searchParams.get("locationType") ?? "";
  const urlSearch = searchParams.get("search") ?? "";
  const urlPage = parseInt(searchParams.get("page") ?? "1", 10);

  // Local state for inputs
  const [searchInput, setSearchInput] = useState(urlSearch);

  // Update URL with new filters
  const updateUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (!overrides.page) params.delete("page");
    const query = params.toString();
    router.push(`/events${query ? `?${query}` : ""}`, { scroll: false });
  };

  // Filter events client-side
  const { filtered, total, page, totalPages } = useMemo(() => {
    let result = [...initialEvents];

    // Filter by time (UPCOMING/PAST/ALL)
    if (urlTime === "UPCOMING") {
      result = result.filter((e) => isFuture(new Date(e.startDate)));
    } else if (urlTime === "PAST") {
      result = result.filter((e) => isPast(new Date(e.startDate)));
    }

    // Filter by location type
    if (urlLocation) {
      result = result.filter((e) => e.locationType === urlLocation);
    }

    // Filter by search
    if (urlSearch.trim()) {
      const searchLower = urlSearch.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          (e.description?.toLowerCase() ?? "").includes(searchLower)
      );
    }

    // Sort: upcoming by startDate asc, past by startDate desc
    if (urlTime === "PAST") {
      result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else {
      result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }

    // Pagination
    const totalItems = result.length;
    const totalPg = Math.ceil(totalItems / PER_PAGE);
    const currentPage = Math.min(Math.max(1, urlPage), totalPg || 1);
    const paginated = result.slice(
      (currentPage - 1) * PER_PAGE,
      currentPage * PER_PAGE
    );

    return {
      filtered: paginated,
      total: totalItems,
      page: currentPage,
      totalPages: totalPg,
    };
  }, [initialEvents, urlTime, urlLocation, urlSearch, urlPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput });
  };

  return (
    <div className="space-y-10">
      {/* Filters */}
      <div className="space-y-4">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari kegiatan..."
            className="w-full pl-11 pr-28 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Cari
          </button>
        </form>

        {/* Dropdown filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <FilterSelect
            label="Waktu"
            value={urlTime}
            onChange={(val) => updateUrl({ time: val })}
            options={TIME_FILTERS}
          />
          <FilterSelect
            label="Lokasi"
            value={urlLocation}
            onChange={(val) => updateUrl({ locationType: val })}
            options={LOCATION_TYPES}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-xl font-semibold mb-2">
            Tidak ada event ditemukan.
          </p>
          <p className="text-sm">Coba ubah kata kunci atau filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((evt) => (
            <EventCard
              key={evt.slug}
              slug={evt.slug}
              title={evt.title}
              description={evt.description ?? ""}
              coverImage={evt.coverImage}
              startDate={evt.startDate}
              endDate={evt.endDate}
              location={evt.location}
              locationType={evt.locationType}
              maxParticipants={evt.maxParticipants}
              currentParticipants={evt.currentParticipants}
              tags={evt.tags}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          {page > 1 && (
            <button
              onClick={() => updateUrl({ page: String(page - 1) })}
              className="px-5 py-2.5 rounded-full border text-sm font-medium hover:bg-muted transition-colors"
            >
              ← Sebelumnya
            </button>
          )}
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <button
              onClick={() => updateUrl({ page: String(page + 1) })}
              className="px-5 py-2.5 rounded-full border text-sm font-medium hover:bg-muted transition-colors"
            >
              Selanjutnya →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
