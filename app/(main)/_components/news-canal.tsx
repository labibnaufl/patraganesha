import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, Calendar, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function NewsCanal() {
  // Fetch top 2 published articles, prioritizing views and recency
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take: 2,
    include: {
      author: {
        select: { name: true, image: true },
      },
    },
  });

  if (articles.length === 0) {
    return null; // Don't render if no articles are available
  }

  return (
    <section className="w-full py-24 bg-background border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="mb-2">
              Latest Updates
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Pinned News & Articles
            </h2>
          </div>
          <Button variant="ghost" className="group rounded-full" asChild>
            <Link href="/articles">
              View All Articles
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group flex flex-col md:flex-row gap-6 bg-muted/20 border border-border/50 rounded-3xl p-4 hover:bg-muted/40 transition-colors"
            >
              <div className="relative w-full md:w-48 h-48 min-h-45 rounded-2xl overflow-hidden shrink-0 bg-muted">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-background/80 backdrop-blur-md text-foreground hover:bg-background/90 border-0">
                    {article.category}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col justify-center py-2 flex-1">
                <h3 className="line-clamp-2 text-xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>

                <p className="line-clamp-2 text-muted-foreground text-sm mb-4">
                  {article.excerpt}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-auto">
                  <div className="flex items-center">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    {article.publishedAt
                      ? format(new Date(article.publishedAt), "MMM d, yyyy")
                      : "Draft"}
                  </div>
                  <div className="flex items-center">
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    {article.views}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
