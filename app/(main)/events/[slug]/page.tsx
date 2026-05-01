import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { incrementEventViewAction } from "./_lib/actions";
import { EventReactionBar } from "./_components/event-reaction-bar";
import { EventCommentSection } from "./_components/event-comment-section";
import { EventRegistrationBox } from "./_components/event-registration-box";
import Image from "next/image";
import Link from "next/link";
import { format, isFuture, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  Eye,
  ChevronRight,
  Users,
  ExternalLink,
  Mail,
  Phone,
  User,
} from "lucide-react";
import type { Metadata } from "next";

// ISR: regenerate every hour
export const revalidate = 3600;
export const dynamicParams = true; // Generate new slugs on first visit

// Pre-render all published events at build time
export async function generateStaticParams() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return events.map((e) => ({ slug: e.slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      description: true,
      coverImage: true,
    },
  });

  if (!event) return { title: "Event tidak ditemukan" };

  return {
    title: `${event.title} | Events`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.coverImage ? [{ url: event.coverImage }] : [],
      type: "website",
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

const LOCATION_COLORS: Record<string, string> = {
  ONLINE: "bg-blue-100 text-blue-700",
  OFFLINE: "bg-amber-100 text-amber-700",
  HYBRID: "bg-purple-100 text-purple-700",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch event, session, and user attendance in parallel
  const [event, session] = await Promise.all([
    prisma.event.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        organizer: { select: { name: true } },
        tags: { include: { tag: true } },
        reactions: { select: { id: true, type: true, userId: true } },
        bookmarks: { select: { id: true, userId: true } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    }),
    auth(),
  ]);

  if (!event) notFound();

  const userId = session?.user?.id ?? null;

  // Fetch user's attendance after we have userId and eventId
  const userAttendance = userId
    ? await prisma.eventAttendance.findUnique({
        where: { userId_eventId: { userId, eventId: event.id } },
        select: {
          id: true,
          status: true,
          proofs: {
            select: { id: true, url: true, thumbnailUrl: true },
            orderBy: { uploadedAt: "asc" },
          },
        },
      })
    : null;

  // Increment view count (fire-and-forget, void prevents unhandled promise warning)
  void incrementEventViewAction(slug);

  const userRole = session?.user?.role ?? null;
  const isLoggedIn = !!userId;

  // Registration state
  const now = new Date();
  const deadlinePassed = event.registrationDeadline
    ? now > new Date(event.registrationDeadline)
    : false;
  const isFull = event.maxParticipants
    ? event.currentParticipants >= event.maxParticipants
    : false;
  const eventPast = now > new Date(event.startDate);
  const registrationOpen = !deadlinePassed && !isFull && !eventPast;

  const likes = event.reactions.filter((r) => r.type === "LIKE").length;
  const dislikes = event.reactions.filter((r) => r.type === "DISLIKE").length;
  const userReaction = userId
    ? ((event.reactions.find((r) => r.userId === userId)?.type as
        | "LIKE"
        | "DISLIKE"
        | null) ?? null)
    : null;
  const isBookmarked = userId
    ? event.bookmarks.some((b) => b.userId === userId)
    : false;

  const isUpcoming = isFuture(new Date(event.startDate));
  const daysUntil = differenceInDays(new Date(event.startDate), new Date());

  const progressPercentage = event.maxParticipants
    ? Math.min(
        100,
        Math.round((event.currentParticipants / event.maxParticipants) * 100),
      )
    : 0;

  return (
    <article className="w-full min-h-screen">
      {/* Hero / Cover */}
      <div className="relative w-full h-[40vh] md:h-[55vh] bg-black">
        {event.coverImage && (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            priority
            className="object-cover opacity-60"
            sizes="100vw"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="absolute top-6 left-4 md:left-8 flex items-center gap-1.5 text-white/70 text-sm z-20"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/events" className="hover:text-white transition-colors">
            Events
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white/50 line-clamp-1 max-w-[180px]">
            {event.title}
          </span>
        </nav>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-8 max-w-4xl mx-auto w-full z-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {event.locationType && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${LOCATION_COLORS[event.locationType] ?? "bg-white/20 text-white"}`}
              >
                {event.locationType}
              </span>
            )}
            {event.tags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="px-2.5 py-0.5 rounded-full text-xs bg-white/15 text-white/80 backdrop-blur-sm border border-white/20"
              >
                #{tag.name}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-10">
        {/* Registration Header Action */}
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-6 md:p-8 mb-10 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold mb-2">Status Pendaftaran</h2>
            {event.maxParticipants ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Kursi Terisi
                  </span>
                  <span>
                    {event.currentParticipants} / {event.maxParticipants} Kuota
                  </span>
                </div>
                <div className="h-2.5 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercentage >= 100
                        ? "bg-red-500"
                        : progressPercentage >= 80
                          ? "bg-amber-500"
                          : "bg-brand-primary"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {event.currentParticipants} Peserta telah mendaftar
                </span>
              </div>
            )}

            {/* Registration Deadline Alert */}
            {event.registrationDeadline &&
              isFuture(new Date(event.registrationDeadline)) && (
                <p className="text-sm text-red-600 font-medium mt-3">
                  Tutup pendaftaran:{" "}
                  {format(new Date(event.registrationDeadline), "d MMMM yyyy", {
                    locale: idLocale,
                  })}
                </p>
              )}
          </div>

          <div className="w-full">
            <EventRegistrationBox
              eventId={event.id}
              isLoggedIn={isLoggedIn}
              registrationOpen={registrationOpen}
              isFull={isFull}
              deadlinePassed={deadlinePassed}
              eventPast={eventPast}
              requireProof={event.requireProof}
              maxProofsPerUser={event.maxProofsPerUser}
              userAttendance={
                userAttendance
                  ? {
                      id: userAttendance.id,
                      status: userAttendance.status as
                        | "ABSEN"
                        | "REGISTERED"
                        | "ATTENDING"
                        | "ATTENDED"
                        | "REJECTED"
                        | "CANCELLED",
                      proofs: userAttendance.proofs.map((p) => ({
                        id: p.id,
                        url: p.url,
                        thumbnailUrl: p.thumbnailUrl,
                      })),
                    }
                  : null
              }
            />
          </div>
        </div>

        {/* Detailed Meta: Date, Time, Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 border-y border-border/40 mb-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                Tanggal Pelaksanaan
              </p>
              <p className="font-semibold">
                {format(new Date(event.startDate), "d MMMM yyyy", {
                  locale: idLocale,
                })}
              </p>
              {event.endDate && (
                <p className="text-sm text-muted-foreground">
                  sampai{" "}
                  {format(new Date(event.endDate), "d MMMM yyyy", {
                    locale: idLocale,
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                Waktu
              </p>
              <p className="font-semibold">
                {format(new Date(event.startDate), "HH:mm")} WIB
              </p>
              {event.endDate && (
                <p className="text-sm text-muted-foreground">
                  sampai {format(new Date(event.endDate), "HH:mm")} WIB
                </p>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-4 md:col-span-2">
              <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Lokasi Kegiatan
                </p>
                <p className="font-semibold">{event.location}</p>
                {event.locationType && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Metode: {event.locationType}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Description Body */}
        <div className="prose prose-brand max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {event.description}
        </div>

        {/* Contact Person Box */}
        {(event.contactPerson || event.contactEmail || event.contactPhone) && (
          <div className="mt-12 p-6 rounded-2xl border bg-muted/30">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              Hubungi Kepanitiaan (CP)
            </h3>
            <div className="space-y-3 text-sm">
              {event.contactPerson && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{event.contactPerson}</span>
                </div>
              )}
              {event.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{event.contactPhone}</span>
                </div>
              )}
              {event.contactEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{event.contactEmail}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border/40">
            <span className="text-sm text-muted-foreground mr-1">Tags:</span>
            {event.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/events?search=${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary border border-border/50 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Organizer / Publish Meta */}
        <div className="flex items-center gap-6 mt-8 py-6 border-y border-border/40 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-foreground/80">
              Penyelenggara:
            </span>
            {event.organizer.name}
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <Eye className="w-3.5 h-3.5" />
            {event.views.toLocaleString("id-ID")} kali dilihat
          </span>
        </div>

        {/* Reactions + Bookmark */}
        <div className="mt-4">
          <EventReactionBar
            eventId={event.id}
            initialLikes={likes}
            initialDislikes={dislikes}
            userReaction={userReaction}
            isBookmarked={isBookmarked}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Comments */}
        <EventCommentSection
          eventId={event.id}
          initialComments={event.comments.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            user: {
              id: c.user.id,
              name: c.user.name,
              image: c.user.image,
            },
          }))}
          currentUserId={userId}
          currentUserRole={userRole}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </article>
  );
}
