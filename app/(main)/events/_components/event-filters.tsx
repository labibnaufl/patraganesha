"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { Search } from "lucide-react";

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const activeLocation = searchParams.get("locationType") ?? "";
  const activeTime = searchParams.get("time") ?? "UPCOMING";

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page"); // reset to page 1 on filter change
    return `/events?${params.toString()}`;
  }

  function handleFilter(key: string, value: string) {
    startTransition(() => router.push(buildUrl({ [key]: value })));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl({ search })));
  }

  const LOCATION_TYPES = [
    { value: "", label: "Semua Lokasi" },
    { value: "ONLINE", label: "Online" },
    { value: "OFFLINE", label: "Offline" },
    { value: "HYBRID", label: "Hybrid" },
  ];

  const TIME_FILTERS = [
    { value: "ALL", label: "Semua Waktu" },
    { value: "UPCOMING", label: "Akan Datang" },
    { value: "PAST", label: "Selesai" },
  ];

  return (
    <div
      className={`space-y-6 transition-opacity ${isPending ? "opacity-50" : ""}`}
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari event..."
          className="w-full pl-11 pr-4 py-3 rounded-full border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="submit" className="sr-only">
          Cari
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Time Tabs */}
        <div className="flex p-1 bg-muted rounded-full">
          {TIME_FILTERS.map((time) => {
            const isActive =
              activeTime === time.value ||
              (!searchParams.has("time") && time.value === "UPCOMING");
            return (
              <button
                key={time.value}
                onClick={() => handleFilter("time", time.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {time.label}
              </button>
            );
          })}
        </div>

        {/* Location Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {LOCATION_TYPES.map((loc) => (
            <button
              key={loc.value}
              onClick={() => handleFilter("locationType", loc.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeLocation === loc.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
