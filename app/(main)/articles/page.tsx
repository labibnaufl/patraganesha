import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "./_components/article-card";
import { FeaturedArticle } from "./_components/featured-article";
import { ArticleFilters } from "./_components/article-filters";
import Link from "next/link";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Artikel",
  description:
    "Baca artikel, berita, dan gagasan terbaru dari PATRA Ganesha HMTM ITB.",
  openGraph: {
    title: "Artikel | PATRA Digital Hub",
    description:
      "Baca artikel, berita, dan gagasan terbaru dari PATRA Ganesha.",
  },
};

const PER_PAGE = 12;

const VALID_CATEGORIES = ["ENERGI", "NON_ENERGI", "UMUM"] as const;
type ArticleCategory = (typeof VALID_CATEGORIES)[number];

function isValidCategory(value: string): value is ArticleCategory {
  return VALID_CATEGORIES.includes(value as ArticleCategory);
}

function ArticleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-3xl overflow-hidden border"
        >
          <Skeleton className="w-full aspect-video" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function ArticleGrid({
  category,
  search,
  page,
}: {
  category: string;
  search: string;
  page: number;
}) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (category && isValidCategory(category)) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const [featured, articles, total] = await Promise.all([
    // Featured: most-viewed published article (no filter applied)
    page === 1 && !search && !category
      ? prisma.article.findFirst({
          where: { status: "PUBLISHED" },
          orderBy: { views: "desc" },
          select: {
            slug: true,
            title: true,
            excerpt: true,
            coverImage: true,
            category: true,
            publishedAt: true,
            readTime: true,
            views: true,
            author: { select: { name: true } },
          },
        })
      : Promise.resolve(null),

    prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        readTime: true,
        views: true,
        author: { select: { name: true } },
      },
    }),

    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const featuredSlug = featured?.slug;
  // Exclude featured from grid to avoid duplication
  const grid = featured
    ? articles.filter((a) => a.slug !== featuredSlug)
    : articles;

  return (
    <div className="space-y-10">
      {/* Featured */}
      {featured && (
        <FeaturedArticle
          slug={featured.slug}
          title={featured.title}
          excerpt={featured.excerpt}
          coverImage={featured.coverImage}
          category={featured.category}
          publishedAt={featured.publishedAt}
          readTime={featured.readTime}
          views={featured.views}
          author={featured.author}
        />
      )}

      {/* Grid */}
      {grid.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-xl font-semibold mb-2">
            Tidak ada artikel ditemukan.
          </p>
          <p className="text-sm">Coba ubah kata kunci atau filter kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grid.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          {page > 1 && (
            <Link
              href={`/articles?page=${page - 1}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
              className="px-5 py-2.5 rounded-full border text-sm font-medium hover:bg-muted transition-colors"
            >
              ← Sebelumnya
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/articles?page=${page + 1}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
              className="px-5 py-2.5 rounded-full border text-sm font-medium hover:bg-muted transition-colors"
            >
              Selanjutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "";
  const search = params.search ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  return (
    <div className="w-full min-h-screen">
      {/* Page Header */}
      <section className="w-full bg-brand-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-3">
            PATRA Digital Hub
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Artikel & Berita
          </h1>
          <p className="text-white/80 text-lg max-w-xl">
            Tulisan, laporan, dan gagasan dari massa himpunan PATRA Ganesha.
          </p>
        </div>
      </section>

      {/* Filters + Content */}
      <section className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <ArticleFilters />

          <div className="mt-10">
            <Suspense fallback={<ArticleGridSkeleton />}>
              <ArticleGrid category={category} search={search} page={page} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
