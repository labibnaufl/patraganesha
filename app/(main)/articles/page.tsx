import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FeaturedArticle } from "./_components/featured-article";
import { ArticleCard } from "./_components/article-card";
import { ArticleFilters } from "./_components/article-filters";

export const metadata = {
  title: "Artikel | HMTM \"PATRA\" ITB",
  description:
    "Baca artikel terbaru seputar energi, non-energi, dan isu umum dari PATRA Ganesha.",
};

const PAGE_SIZE = 9;

type SearchParams = {
  category?: string;
  search?: string;
  page?: string;
};

async function getArticles(params: SearchParams) {
  const category = params.category ?? "";
  const search = params.search ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    status: "PUBLISHED" as const,
    ...(category
      ? { category: category as "ENERGI" | "NON_ENERGI" | "UMUM" }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { excerpt: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [featured, articles, total] = await Promise.all([
    // Featured = most viewed published article (only on first page with no filters)
    page === 1 && !category && !search
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
      orderBy: { publishedAt: "desc" },
      skip,
      take: PAGE_SIZE,
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

  return {
    featured,
    articles,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { featured, articles, total, page, totalPages } =
    await getArticles(params);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-brand-primary font-medium mb-2">Artikel</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Wawasan &amp; Perspektif{" "}
            <span className="text-brand-primary">PATRA Ganesha</span>
          </h1>
          <div className="text-center">
            <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
              Kumpulan artikel seputar energi, lingkungan, dan isu-isu terkini
              dari himpunan kami.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Suspense>
          <ArticleFilters />
        </Suspense>

        {/* Featured Article */}
        {featured && (
          <div className="mt-10 mb-10">
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
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {articles.map((article) => (
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
              <a
                key={p}
                href={`/articles?${new URLSearchParams({
                  ...(params.category ? { category: params.category } : {}),
                  ...(params.search ? { search: params.search } : {}),
                  page: String(p),
                }).toString()}`}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border transition-colors ${
                  p === page
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-background text-muted-foreground border-border hover:border-brand-primary hover:text-brand-primary"
                }`}
              >
                {p}
              </a>
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
    </main>
  );
}
