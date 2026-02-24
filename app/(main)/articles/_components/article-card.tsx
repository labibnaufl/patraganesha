import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type ArticleCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  publishedAt: Date | null;
  readTime: number | null;
  views: number;
  author: { name: string | null };
};

const CATEGORY_LABELS: Record<string, string> = {
  ENERGI: "Energi",
  NON_ENERGI: "Non-Energi",
  UMUM: "Umum",
};

const CATEGORY_COLORS: Record<string, string> = {
  ENERGI: "bg-orange-100 text-orange-700 border-orange-200",
  NON_ENERGI: "bg-blue-100 text-blue-700 border-blue-200",
  UMUM: "bg-gray-100 text-gray-600 border-gray-200",
};

export function ArticleCard({
  slug,
  title,
  excerpt,
  coverImage,
  category,
  publishedAt,
  readTime,
  views,
  author,
}: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${slug}`}
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
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-600"}`}
          >
            {CATEGORY_LABELS[category] ?? category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/40">
          <span className="font-medium text-foreground/70">{author.name}</span>
          <div className="flex items-center gap-3">
            {publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(publishedAt), "d MMM yyyy", {
                  locale: idLocale,
                })}
              </span>
            )}
            {readTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readTime} mnt
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {views.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
