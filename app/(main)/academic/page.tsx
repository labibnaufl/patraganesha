import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AcademicCard } from "./_components/academic-card";
import { AcademicFilters } from "./_components/academic-filters";
import Link from "next/link";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Info Akademik",
  description: "Informasi lomba, beasiswa, dan info kampus dari PATRA Ganesha.",
  openGraph: {
    title: "Info Akademik | PATRA Digital Hub",
    description: "Kumpulan informasi lomba dan beasiswa terkini.",
  },
};

const PER_PAGE = 12;

function AcademicGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-3xl overflow-hidden border"
        >
          <Skeleton className="w-full aspect-[16/9]" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="pt-4 border-t border-border/40 mt-4 flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Map frontend types to Enum
const VALID_TYPES = ["LOMBA", "BEASISWA", "INFO_KAMPUS"] as const;

async function AcademicGrid({
  type,
  search,
  sort,
  page,
}: {
  type: string;
  search: string;
  sort: string;
  page: number;
}) {
  const where: Record<string, any> = { status: "PUBLISHED" };

  if (type && VALID_TYPES.includes(type as any)) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Determine order by
  let orderByQuery: any = [{ createdAt: "desc" }];
  if (sort === "deadline") {
    // We want items with deadline closest to now (but still in the future) to appear first
    // For simplicity, just sort by deadline asc for upcoming.
    // In production, we might need a more complex query to put nulls last or past deadlines last.
    orderByQuery = [{ deadline: "asc" }];
  } else if (sort === "newest") {
    orderByQuery = [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }

  const [items, total] = await Promise.all([
    prisma.academicInfo.findMany({
      where,
      orderBy: orderByQuery,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        slug: true,
        title: true,
        description: true,
        coverImage: true,
        type: true,
        deadline: true,
        externalLink: true,
        tags: { select: { tag: { select: { name: true } } } },
      },
    }),
    prisma.academicInfo.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-10">
      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-xl font-semibold mb-2">
            Informasi tidak ditemukan.
          </p>
          <p className="text-sm">Coba ubah kata kunci atau filter tipe info.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <AcademicCard key={item.slug} {...item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          {page > 1 && (
            <Link
              href={`/academic?page=${page - 1}${type ? `&type=${type}` : ""}${sort ? `&sort=${sort}` : ""}${search ? `&search=${search}` : ""}`}
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
              href={`/academic?page=${page + 1}${type ? `&type=${type}` : ""}${sort ? `&sort=${sort}` : ""}${search ? `&search=${search}` : ""}`}
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

export default async function AcademicPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const type = params.type ?? "";
  const sort = params.sort ?? "deadline";
  const search = params.search ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  return (
    <div className="w-full min-h-screen">
      {/* Page Header */}
      <section className="w-full bg-teal-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-3">
            PATRA Digital Hub
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-emerald-50">
            Info Akademik
          </h1>
          <p className="text-teal-100/90 text-lg max-w-xl">
            Kumpulan informasi lomba, beasiswa, dan info akademik kampus penting
            untuk massa himpunan.
          </p>
        </div>
      </section>

      {/* Filters + Content */}
      <section className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <AcademicFilters />

          <div className="mt-10">
            <Suspense fallback={<AcademicGridSkeleton />}>
              <AcademicGrid
                type={type}
                search={search}
                sort={sort}
                page={page}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
