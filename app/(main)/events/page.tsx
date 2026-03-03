import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { EventCard } from "./_components/event-card";
import { EventFilters } from "./_components/event-filters";
import Link from "next/link";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Events",
  description: "Daftar event dan kegiatan terbaru dari PATRA Ganesha HMTM ITB.",
  openGraph: {
    title: "Events | PATRA Digital Hub",
    description: "Kegiatan dan acara terbaru PATRA Ganesha.",
  },
};

const PER_PAGE = 12;

function EventGridSkeleton() {
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
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-4 border-t border-border/40 mt-4 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function EventGrid({
  time,
  locationType,
  search,
  page,
}: {
  time: string;
  locationType: string;
  search: string;
  page: number;
}) {
  const where: Record<string, any> = { status: "PUBLISHED" };

  if (locationType) {
    where.locationType = locationType;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const now = new Date();
  if (time === "UPCOMING") {
    where.startDate = { gte: now };
  } else if (time === "PAST") {
    where.startDate = { lt: now };
  }
  // If time === "ALL", we don't apply startDate filter.

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy:
        time === "PAST" ? [{ startDate: "desc" }] : [{ startDate: "asc" }], // Upcoming/All shows nearest future first
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        slug: true,
        title: true,
        description: true,
        coverImage: true,
        startDate: true,
        endDate: true,
        location: true,
        locationType: true,
        maxParticipants: true,
        currentParticipants: true,
        tags: { select: { tag: { select: { name: true } } } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-10">
      {/* Grid */}
      {events.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-xl font-semibold mb-2">
            Tidak ada event ditemukan.
          </p>
          <p className="text-sm">Coba ubah kata kunci atau filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt.slug} {...evt} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          {page > 1 && (
            <Link
              href={`/events?page=${page - 1}${time ? `&time=${time}` : ""}${locationType ? `&locationType=${locationType}` : ""}${search ? `&search=${search}` : ""}`}
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
              href={`/events?page=${page + 1}${time ? `&time=${time}` : ""}${locationType ? `&locationType=${locationType}` : ""}${search ? `&search=${search}` : ""}`}
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

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    time?: string;
    locationType?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const time = params.time ?? "UPCOMING";
  const locationType = params.locationType ?? "";
  const search = params.search ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  return (
    <div className="w-full min-h-screen">
      {/* Page Header */}
      <section className="w-full bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          <p className="text-brand-primary font-medium mb-2">Events</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Kegiatan &amp; Acara{" "}
            <span className="text-brand-primary">PATRA Ganesha</span>
          </h1>
          <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
            Ikuti berbagai acara, kompetisi, dan kegiatan seru dari himpunan.
          </p>
        </div>
      </section>

      {/* Filters + Content */}
      <section className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <EventFilters />

          <div className="mt-10">
            <Suspense fallback={<EventGridSkeleton />}>
              <EventGrid
                time={time}
                locationType={locationType}
                search={search}
                page={page}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
