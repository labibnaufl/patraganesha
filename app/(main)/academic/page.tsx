import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AcademicCard } from "./_components/academic-card";
import { AcademicFilters } from "./_components/academic-filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Info Akademik | HMTM \"PATRA\" ITB",
  description:
    "Informasi lomba, beasiswa, dan info kampus terbaru dari PATRA Ganesha HMTM ITB.",
  openGraph: {
    title: "Info Akademik | HMTM \"PATRA\" ITB",
    description: "Lomba, Beasiswa, dan Info Kampus dari PATRA Ganesha.",
  },
};

const PER_PAGE = 12;

type SearchParams = {
  type?: string;
  sort?: string;
  search?: string;
  page?: string;
};

async function getAcademicInfo(params: SearchParams) {
  const type = params.type ?? "";
  const sort = params.sort ?? "deadline";
  const search = params.search ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PER_PAGE;

  const where: Record<string, any> = { status: "PUBLISHED" };

  if (type) where.type = type;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "newest"
      ? [{ createdAt: "desc" as const }]
      : [{ deadline: "asc" as const }];

  const [items, total] = await Promise.all([
    prisma.academicInfo.findMany({
      where,
      orderBy,
      skip,
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

  return { items, total, page, totalPages: Math.ceil(total / PER_PAGE) };
}

export default async function AcademicPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { items, total, page, totalPages } = await getAcademicInfo(params);

  return (
    <div className="w-full min-h-screen">
      {/* Page Header */}
      <section className="w-full bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          <p className="text-brand-primary font-medium mb-2">Info Akademik</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Lomba, Beasiswa &amp;{" "}
            <span className="text-brand-primary">Info Kampus</span>
          </h1>
          <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
            Temukan informasi lomba, beasiswa, dan info kampus terkini dari
            PATRA Ganesha.
          </p>
        </div>
      </section>

      {/* Filters + Content */}
      <section className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <Suspense>
            <AcademicFilters />
          </Suspense>

          <div className="mt-10">
            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                <p className="text-lg font-medium">
                  Tidak ada info akademik ditemukan.
                </p>
                <p className="text-sm mt-1">
                  Coba ubah kata kunci atau filter kategori.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/academic?${new URLSearchParams({
                    ...(params.type ? { type: params.type } : {}),
                    ...(params.sort ? { sort: params.sort } : {}),
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

          {total > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-6">
              Menampilkan {Math.min((page - 1) * PER_PAGE + 1, total)}–
              {Math.min(page * PER_PAGE, total)} dari {total} info akademik
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
