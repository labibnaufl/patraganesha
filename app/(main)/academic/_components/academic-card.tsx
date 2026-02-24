import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { format, differenceInDays, isFuture } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type AcademicCardProps = {
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  type: string;
  deadline: Date | null;
  externalLink: string | null;
  tags: { tag: { name: string } }[];
};

const TYPE_COLORS: Record<string, string> = {
  LOMBA: "bg-orange-100 text-orange-700 border-orange-200",
  BEASISWA: "bg-blue-100 text-blue-700 border-blue-200",
  INFO_KAMPUS: "bg-slate-100 text-slate-700 border-slate-200",
};

const TYPE_LABELS: Record<string, string> = {
  LOMBA: "Lomba",
  BEASISWA: "Beasiswa",
  INFO_KAMPUS: "Info Kampus",
};

export function AcademicCard({
  slug,
  title,
  description,
  coverImage,
  type,
  deadline,
  externalLink,
  tags,
}: AcademicCardProps) {
  const isUpcoming = deadline ? isFuture(new Date(deadline)) : null;
  const daysUntil = deadline
    ? differenceInDays(new Date(deadline), new Date())
    : null;

  return (
    <Link
      href={`/academic/${slug}`}
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
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs shadow-inner">
            No Image
          </div>
        )}

        {/* Badges container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {type && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                TYPE_COLORS[type] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {TYPE_LABELS[type] ?? type}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors pr-6 relative">
          {title}
          {externalLink && (
            <ExternalLink className="w-4 h-4 text-muted-foreground absolute right-0 top-1" />
          )}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 w-full mb-4">
          {description}
        </p>

        {/* Tags */}
        <div className="mt-auto mb-4">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
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
        </div>

        {/* Footer: Deadline */}
        <div className="pt-4 border-t border-border/40 mt-auto flex items-center justify-between text-xs font-medium">
          {deadline ? (
            <div className="flex items-center gap-1.5 text-foreground/70">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                Tutup:{" "}
                {format(new Date(deadline), "d MMM yyyy", { locale: idLocale })}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground italic">
              Tanpa tenggat waktu
            </span>
          )}

          {isUpcoming !== null && daysUntil !== null && (
            <span
              className={`${daysUntil <= 7 && daysUntil >= 0 ? "text-red-500 font-bold" : daysUntil < 0 ? "text-muted-foreground" : "text-primary"}`}
            >
              {daysUntil < 0
                ? "Selesai"
                : daysUntil === 0
                  ? "Hari Ini"
                  : `${daysUntil} hari lagi`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
