import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type RelatedArticlesProps = {
  articles: {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string | null;
    publishedAt: Date | null;
    author: { name: string | null };
  }[];
};

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-border/40">
      <h2 className="text-2xl font-bold mb-8">Artikel Terkait</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group flex flex-col bg-background border border-border/60 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-video bg-muted overflow-hidden">
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                <span>{article.author.name}</span>
                {article.publishedAt && (
                  <span>
                    {format(new Date(article.publishedAt), "d MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
