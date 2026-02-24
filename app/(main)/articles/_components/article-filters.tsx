"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "Semua" },
  { value: "ENERGI", label: "Energi" },
  { value: "NON_ENERGI", label: "Non-Energi" },
  { value: "UMUM", label: "Umum" },
];

export function ArticleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const activeCategory = searchParams.get("category") ?? "";

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page"); // reset to page 1 on filter change
    return `/articles?${params.toString()}`;
  }

  function handleCategory(value: string) {
    startTransition(() => router.push(buildUrl({ category: value })));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl({ search })));
  }

  return (
    <div className={`transition-opacity ${isPending ? "opacity-50" : ""}`}>
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari artikel..."
          className="w-full pl-11 pr-4 py-3 rounded-full border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="submit" className="sr-only">
          Cari
        </button>
      </form>

      {/* Category tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              activeCategory === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
