import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EventCarousel } from "./event-carousel";
import Link from "next/link";

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

  if (events.length === 0) {
    return null; // Or return a specific empty state if desired
  }

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Badge variant="outline" className="mb-4">
            Upcoming Events
          </Badge>

          <EventCarousel events={events} />

          <div className="flex justify-center mt-10">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Lihat Semua Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
