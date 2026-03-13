"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "Semua Kategori" },
  { value: "ENERGI", label: "Energi" },
  { value: "NON_ENERGI", label: "Non-Energi" },
  { value: "UMUM", label: "Umum" },
];

const SORT_OPTIONS = [
  { value: "", label: "Terbaru" },
  { value: "views", label: "Paling Banyak Dibaca" },
];

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

export function ArticleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "";

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page");
    return `/articles?${params.toString()}`;
  }

  function handleFilter(key: string, value: string) {
    startTransition(() => router.push(buildUrl({ [key]: value })));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl({ search })));
  }

  return (
    <div
      className={`space-y-4 transition-opacity ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari artikel..."
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
          label="Kategori"
          value={activeCategory}
          onChange={(val) => handleFilter("category", val)}
          options={CATEGORIES}
        />
        <FilterSelect
          label="Urutkan"
          value={activeSort}
          onChange={(val) => handleFilter("sort", val)}
          options={SORT_OPTIONS}
        />
      </div>
    </div>
  );
}
