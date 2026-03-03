import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type FeaturedArticleProps = {
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

export function FeaturedArticle({
  slug,
  title,
  excerpt,
  coverImage,
  category,
  publishedAt,
  readTime,
  views,
  author,
}: FeaturedArticleProps) {
  return (
    <Link
      href={`/articles/${slug}`}
      className="group relative flex flex-col lg:flex-row gap-0 bg-background border border-border/60 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 min-h-[320px]"
    >
      {/* Cover */}
      <div className="relative w-full lg:w-[55%] aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[280px] bg-muted shrink-0 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary/40 text-sm">
            PATRA Digital Hub
          </div>
        )}
        {/* Pinned badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-primary text-white shadow-md">
            📌 Artikel Terpopuler
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-6 lg:p-10 flex-1">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
            {CATEGORY_LABELS[category] ?? category}
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3">
            {title}
          </h2>
          <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm lg:text-base">
            {excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">{author.name}</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {publishedAt && (
                <span>
                  {format(new Date(publishedAt), "d MMMM yyyy", {
                    locale: idLocale,
                  })}
                </span>
              )}
              {readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {readTime} mnt
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {views.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <span className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
            Baca
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
