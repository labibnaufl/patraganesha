import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { EventsContent } from "./_components/events-content";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Events",
  description: "Daftar event dan kegiatan terbaru dari PATRA Ganesha HMTM ITB.",
  openGraph: {
    title: "Events | HMTM \"PATRA\" ITB",
    description: "Kegiatan dan acara terbaru PATRA Ganesha.",
  },
};

// Server: fetch ALL published events (cached for 1 hour)
async function getAllEvents() {
  try {
    return await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startDate: "asc" },
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
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    // Return empty array to prevent build failure
    return [];
  }
}

export default async function EventsPage() {
  // No searchParams! Page is now static
  const events = await getAllEvents();

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
          <Suspense>
            <EventsContent events={JSON.parse(JSON.stringify(events))} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
