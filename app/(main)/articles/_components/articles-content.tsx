"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { FeaturedArticle } from "./featured-article";
import { ArticleCard } from "./article-card";

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

const PAGE_SIZE = 9;

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  publishedAt: Date;
  readTime: number | null;
  views: number;
  author: { name: string };
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

export function ArticlesContent({
  articles: initialArticles,
}: {
  articles: Article[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const urlCategory = searchParams.get("category") ?? "";
  const urlSearch = searchParams.get("search") ?? "";
  const urlSort = searchParams.get("sort") ?? "";
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
    router.push(`/articles${query ? `?${query}` : ""}`, { scroll: false });
  };

  // Filter and sort articles client-side
  const { featured, filtered, total, page, totalPages } = useMemo(() => {
    let result = [...initialArticles];

    // Filter by category
    if (urlCategory) {
      result = result.filter((a) => a.category === urlCategory);
    }

    // Filter by search
    if (urlSearch.trim()) {
      const searchLower = urlSearch.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          (a.excerpt?.toLowerCase() ?? "").includes(searchLower)
      );
    }

    // Sort
    if (urlSort === "views") {
      result.sort((a, b) => b.views - a.views);
    }
    // Default is already sorted by publishedAt desc from server

    // Get featured (most viewed) only on first page with no filters
    const showFeatured =
      urlPage === 1 && !urlCategory && !urlSearch && initialArticles.length > 0;
    const featuredArticle = showFeatured
      ? [...initialArticles].sort((a, b) => b.views - a.views)[0]
      : null;

    // Pagination
    const totalItems = result.length;
    const totalPg = Math.ceil(totalItems / PAGE_SIZE);
    const currentPage = Math.min(Math.max(1, urlPage), totalPg || 1);
    const paginated = result.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );

    return {
      featured: featuredArticle,
      filtered: paginated,
      total: totalItems,
      page: currentPage,
      totalPages: totalPg,
    };
  }, [initialArticles, urlCategory, urlSearch, urlSort, urlPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput });
  };

  return (
    <div>
      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
            value={urlCategory}
            onChange={(val) => updateUrl({ category: val })}
            options={CATEGORIES}
          />
          <FilterSelect
            label="Urutkan"
            value={urlSort}
            onChange={(val) => updateUrl({ sort: val })}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* Featured Article */}
      {featured && (
        <div className="mb-10">
          <FeaturedArticle
            slug={featured.slug}
            title={featured.title}
            excerpt={featured.excerpt ?? ""}
            coverImage={featured.coverImage}
            category={featured.category}
            publishedAt={featured.publishedAt}
            readTime={featured.readTime}
            views={featured.views}
            author={featured.author}
          />
        </div>
      )}

      {/* Article Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <ArticleCard
              key={article.slug}
              slug={article.slug}
              title={article.title}
              excerpt={article.excerpt ?? ""}
              coverImage={article.coverImage}
              category={article.category}
              publishedAt={article.publishedAt}
              readTime={article.readTime}
              views={article.views}
              author={article.author}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">Tidak ada artikel ditemukan.</p>
          <p className="text-sm mt-1">
            Coba ubah kata kunci atau filter kategori.
          </p>
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

      {/* Article count */}
      {total > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          Menampilkan {Math.min((page - 1) * PAGE_SIZE + 1, total)}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} artikel
        </p>
      )}
    </div>
  );
}
