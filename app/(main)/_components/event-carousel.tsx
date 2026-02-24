"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function EventCarousel({ events }: { events: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [events.length]);

  if (!events || events.length === 0) return null;

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden border border-border/50 bg-muted/10 group">
      {/* Background design elements */}
      <div className="absolute top-0 right-0 p-32 bg-linear-to-bl from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none z-0" />

      {/* Slider Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out lg:min-h-125 h-full relative z-10"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {events.map((upcomingEvent) => {
          const isHybrid = upcomingEvent.locationType === "HYBRID";
          const isOnline = upcomingEvent.locationType === "ONLINE";

          return (
            <div key={upcomingEvent.id} className="w-full shrink-0 flex-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                {/* Image side */}
                <div className="relative h-64 lg:h-full bg-muted w-full overflow-hidden">
                  {upcomingEvent.coverImage ? (
                    <Image
                      src={upcomingEvent.coverImage}
                      alt={upcomingEvent.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
                      <CalendarDays className="w-24 h-24 text-primary/20" />
                    </div>
                  )}

                  {/* Image Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                </div>

                {/* Content side */}
                <div className="relative p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-background/50 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">
                        {upcomingEvent.title}
                      </h3>
                      <p className="text-lg text-muted-foreground line-clamp-3">
                        {upcomingEvent.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                          <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            Date & Time
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {format(
                              new Date(upcomingEvent.startDate),
                              "MMMM d, yyyy",
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-amber-500/10 p-2 rounded-lg text-amber-500">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Location</div>
                          <div className="text-muted-foreground text-sm capitalize">
                            {isOnline
                              ? "Online"
                              : isHybrid
                                ? "Hybrid (Online + Offline)"
                                : upcomingEvent.location || "TBA"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:col-span-2">
                        <div className="mt-1 bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            Availability
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {upcomingEvent.maxParticipants
                              ? `${upcomingEvent.currentParticipants} / ${upcomingEvent.maxParticipants} Registered`
                              : `${upcomingEvent.currentParticipants} Registered (Open for all)`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/events/${upcomingEvent.slug}`}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 min-h-12 h-12 rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto mt-4 group/btn"
                    >
                      View Details & Register
                      <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      {events.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === 0 ? events.length - 1 : prev - 1,
              )
            }
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background text-primary items-center justify-center z-20 shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous event"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % events.length)
            }
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background text-primary items-center justify-center z-20 shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next event"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {events.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-primary"
                    : "w-2 bg-primary/30 hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
