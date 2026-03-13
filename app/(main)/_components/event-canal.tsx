import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EventCarousel } from "./event-carousel";
import Link from "next/link";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function EventCanal() {
  // Fetch the 4 most upcoming published events
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: {
        gte: new Date(), // Only upcoming events
      },
    },
    orderBy: { startDate: "asc" },
    take: 4,
  });

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Badge variant="outline" className="mb-4">
            Kegiatan Mendatang
          </Badge>

          {events.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center rounded-[2.5rem] border border-border/40 bg-muted/10">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <CalendarX className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  Belum ada kegiatan mendatang
                </p>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Pantau terus halaman ini untuk informasi kegiatan PATRA
                  terbaru.
                </p>
              </div>
              <Button variant="outline" className="rounded-full mt-2" asChild>
                <Link href="/events">Lihat Semua Kegiatan</Link>
              </Button>
            </div>
          ) : (
            <>
              <EventCarousel events={events} />

              <div className="flex justify-center mt-10">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  Lihat Semua Kegiatan
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
