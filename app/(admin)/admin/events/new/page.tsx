import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../_lib/require-admin";
import { createEvent } from "../_lib/actions";
import { EventForm } from "../_components/event-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewEventPage() {
  await requireAdmin();

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-xl font-bold font-heading">Create New Event</h1>
      </div>

      <EventForm action={createEvent} tags={tags} />
    </div>
  );
}
