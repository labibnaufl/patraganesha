"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isFuture, differenceInDays } from "date-fns";
import { Search, ChevronDown } from "lucide-react";
import { AcademicCard } from "./academic-card";

const TYPES = [
  { value: "", label: "Semua Info" },
  { value: "LOMBA", label: "Lomba" },
  { value: "BEASISWA", label: "Beasiswa" },
  { value: "INFO_KAMPUS", label: "Info Kampus" },
];

const SORT_OPTIONS = [
  { value: "deadline", label: "Deadline Terdekat" },
  { value: "newest", label: "Terbaru" },
];

const PER_PAGE = 12;

interface AcademicItem {
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  type: string;
  deadline: Date | null;
  externalLink: string | null;
  tags: { tag: { name: string } }[];
  createdAt: Date;
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

export function AcademicContent({
  items: initialItems,
}: {
  items: AcademicItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const urlType = searchParams.get("type") ?? "";
  const urlSort = searchParams.get("sort") ?? "deadline";
  const urlSearch = searchParams.get("search") ?? "";
  const urlPage = parseInt(searchParams.get("page") ?? "1", 10);

  // Local state for inputs
  const [searchInput, setSearchInput] = useState(urlSearch);

  // Update URL with new filters (resets to page 1)
  const updateUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    // Always reset page when filters change
    if (!overrides.page) params.delete("page");
    const query = params.toString();
    router.push(`/academic${query ? `?${query}` : ""}`, { scroll: false });
  };

  // Filter and sort academic items client-side
  const { filtered, total, page, totalPages } = useMemo(() => {
    let result = [...initialItems];

    // Filter by type
    if (urlType) {
      result = result.filter((item) => item.type === urlType);
    }

    // Filter by search
    if (urlSearch.trim()) {
      const searchLower = urlSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          (item.description?.toLowerCase() ?? "").includes(searchLower)
      );
    }

    // Sort
    if (urlSort === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // deadline - sort by deadline ascending (nulls last)
      result.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
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
  }, [initialItems, urlType, urlSort, urlSearch, urlPage]);

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
            placeholder="Cari lomba, beasiswa, info kampus..."
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
            label="Jenis Info"
            value={urlType}
            onChange={(val) => updateUrl({ type: val })}
            options={TYPES}
          />
          <FilterSelect
            label="Urutkan"
            value={urlSort}
            onChange={(val) => updateUrl({ sort: val })}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">
            Tidak ada info akademik ditemukan.
          </p>
          <p className="text-sm mt-1">
            Coba ubah kata kunci atau filter kategori.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <AcademicCard
              key={item.slug}
              slug={item.slug}
              title={item.title}
              description={item.description ?? ""}
              coverImage={item.coverImage}
              type={item.type}
              deadline={item.deadline}
              externalLink={item.externalLink}
              tags={item.tags}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateUrl({ page: String(p) })}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border transition-colors ${
                p === page
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-background text-muted-foreground border-border hover:border-brand-primary hover:text-brand-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      {total > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Menampilkan {Math.min((page - 1) * PER_PAGE + 1, total)}–
          {Math.min(page * PER_PAGE, total)} dari {total} info akademik
        </p>
      )}
    </div>
  );
}
