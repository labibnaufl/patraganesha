import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { format, isFuture, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type EventCardProps = {
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  locationType: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  tags: { tag: { name: string } }[];
};

const LOCATION_COLORS: Record<string, string> = {
  ONLINE: "bg-blue-100 text-blue-700 border-blue-200",
  OFFLINE: "bg-amber-100 text-amber-700 border-amber-200",
  HYBRID: "bg-purple-100 text-purple-700 border-purple-200",
};

export function EventCard({
  slug,
  title,
  description,
  coverImage,
  startDate,
  endDate,
  location,
  locationType,
  maxParticipants,
  currentParticipants,
  tags,
}: EventCardProps) {
  const isUpcoming = isFuture(new Date(startDate));
  const daysUntil = differenceInDays(new Date(startDate), new Date());

  const progressPercentage = maxParticipants
    ? Math.min(100, Math.round((currentParticipants / maxParticipants) * 100))
    : 0;

  return (
    <Link
      href={`/events/${slug}`}
      className="group flex flex-col bg-background border border-border/60 rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover */}
      <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}

        {/* Badges container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {locationType && (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                LOCATION_COLORS[locationType] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {locationType}
            </span>
          )}
          {isUpcoming && daysUntil <= 7 && daysUntil > 0 && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
              {daysUntil} hari lagi
            </span>
          )}
          {isUpcoming && daysUntil === 0 && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-500 text-white border-red-600">
              Hari ini
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 w-full mb-4">
          {description}
        </p>

        {/* Date and Location Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-foreground/80 gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {format(new Date(startDate), "d MMM yyyy", { locale: idLocale })}
              {endDate &&
                ` - ${format(new Date(endDate), "d MMM yyyy", { locale: idLocale })}`}
            </span>
          </div>
          <div className="flex items-center text-sm text-foreground/80 gap-2">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {format(new Date(startDate), "HH:mm")} WIB
              {endDate && ` - ${format(new Date(endDate), "HH:mm")} WIB`}
            </span>
          </div>
          {location && (
            <div className="flex items-center text-sm text-foreground/80 gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Spacer to push the footer to the bottom */}
        <div className="mt-auto"></div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-sm"
              >
                {t.tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Participants Progress */}
        <div className="pt-4 border-t border-border/40">
          {maxParticipants ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Kursi Terisi
                </span>
                <span>
                  {currentParticipants} / {maxParticipants}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Daftar Sekarang
              </span>
              <span>{currentParticipants} Peserta</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
