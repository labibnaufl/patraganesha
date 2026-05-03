import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AcademicContent } from "./_components/academic-content";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Info Akademik | HMTM \"PATRA\" ITB",
  description:
    "Informasi lomba, beasiswa, dan info kampus terbaru dari PATRA Ganesha HMTM ITB.",
  openGraph: {
    title: "Info Akademik | HMTM \"PATRA\" ITB",
    description: "Lomba, Beasiswa, dan Info Kampus dari PATRA Ganesha.",
  },
};

// Server: fetch ALL published academic info (cached for 1 hour)
async function getAllAcademicInfo() {
  try {
    return await prisma.academicInfo.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { deadline: "asc" },
      select: {
        slug: true,
        title: true,
        description: true,
        coverImage: true,
        type: true,
        deadline: true,
        externalLink: true,
        tags: { select: { tag: { select: { name: true } } } },
        createdAt: true,
      },
    });
  } catch (error) {
    console.error('Failed to fetch academic info:', error);
    // Return empty array to prevent build failure
    return [];
  }
}

export default async function AcademicPage() {
  // No searchParams! Page is now static
  const items = await getAllAcademicInfo();

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
            <AcademicContent items={JSON.parse(JSON.stringify(items))} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
