import { prisma } from "@/lib/prisma";
import { updateEvent } from "../_lib/actions";
import { EventForm } from "../_components/event-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Globe, Users, MapPin } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [event, tags] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        locationType: true,
        location: true,
        registrationLink: true,
        registrationDeadline: true,
        maxParticipants: true,
        currentParticipants: true,
        contactPerson: true,
        contactEmail: true,
        contactPhone: true,
        requireProof: true,
        autoVerify: true,
        maxProofsPerUser: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        views: true,
        organizer: { select: { name: true } },
        tags: { select: { tagId: true } },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!event) notFound();

  const updateBound = updateEvent.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back
          </Link>
          <span className="text-muted-foreground">|</span>
          <h1 className="text-xl font-bold font-heading">Edit Event</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[event.status]}`}
          >
            {event.status}
          </span>
          {event.publishedAt && (
            <span className="flex items-center gap-1">
              <Globe className="size-3.5" />
              {event.publishedAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {event.locationType}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {event.currentParticipants}
            {event.maxParticipants ? `/${event.maxParticipants}` : ""} attendees
          </span>
          <span>{event.views.toLocaleString()} views</span>
        </div>
      </div>

      <EventForm action={updateBound} tags={tags} event={event} />
    </div>
  );
}
