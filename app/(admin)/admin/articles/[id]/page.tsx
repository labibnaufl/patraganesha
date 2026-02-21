import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../_lib/require-admin";
import { updateArticle } from "../_lib/actions";
import { ArticleForm } from "../_components/article-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Globe, Clock } from "lucide-react";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [article, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        category: true,
        status: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        views: true,
        readTime: true,
        metaTitle: true,
        metaDescription: true,
        keywords: true,
        author: { select: { name: true } },
        tags: { select: { tagId: true } },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!article) notFound();

  // Bind updateArticle to this specific article id using .bind
  const updateBound = updateArticle.bind(null, id);

  function getStatusBadge(s: string) {
    switch (s) {
      case "PUBLISHED":
        return "bg-emerald-100 text-emerald-700";
      case "DRAFT":
        return "bg-amber-100 text-amber-700";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Kembali
          </Link>
          <span className="text-muted-foreground">|</span>
          <h1 className="text-xl font-bold font-heading">Edit Artikel</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(article.status)}`}
          >
            {article.status}
          </span>
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Globe className="size-3.5" />
              {article.publishedAt.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
          {article.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {article.readTime} menit baca
            </span>
          )}
          <span>{article.views.toLocaleString("id-ID")} views</span>
        </div>
      </div>

      <ArticleForm
        action={updateBound}
        tags={tags}
        article={{
          ...article,
          coverImage: article.coverImage ?? undefined,
          metaTitle: article.metaTitle ?? undefined,
          metaDescription: article.metaDescription ?? undefined,
        }}
      />
    </div>
  );
}
