"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { Search } from "lucide-react";

export function AcademicFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const activeType = searchParams.get("type") ?? "";
  const activeSort = searchParams.get("sort") ?? "deadline";

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page");
    return `/academic?${params.toString()}`;
  }

  function handleFilter(key: string, value: string) {
    startTransition(() => router.push(buildUrl({ [key]: value })));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl({ search })));
  }

  const TYPES = [
    { value: "", label: "Semua Info" },
    { value: "LOMBA", label: "Lomba" },
    { value: "BEASISWA", label: "Beasiswa" },
    { value: "INFO_KAMPUS", label: "Info Kampus" },
  ];

  const SORTS = [
    { value: "deadline", label: "Deadline Terdekat" },
    { value: "newest", label: "Terbaru" },
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
          placeholder="Cari info akademik, lomba, beasiswa..."
          className="w-full pl-11 pr-4 py-3 rounded-full border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="submit" className="sr-only">
          Cari
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleFilter("type", type.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeType === type.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Urutkan:</span>
          <select
            className="px-3 py-1.5 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-primary"
            value={activeSort}
            onChange={(e) => handleFilter("sort", e.target.value)}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
