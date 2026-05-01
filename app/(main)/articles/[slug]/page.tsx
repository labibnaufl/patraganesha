import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { incrementViewAction } from "./_lib/actions";
import { ArticleBody } from "./_components/article-body";
import { ReactionBar } from "./_components/reaction-bar";
import { CommentSection } from "./_components/comment-section";
import { RelatedArticles } from "./_components/related-articles";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar, Clock, Eye, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

// ISR: regenerate every hour
export const revalidate = 3600;
export const dynamicParams = true; // Generate new slugs on first visit

// Pre-render all published articles at build time
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return articles.map((a) => ({ slug: a.slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  if (!article) return { title: "Artikel tidak ditemukan" };

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt,
    openGraph: {
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt,
      images: article.coverImage ? [{ url: article.coverImage }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  ENERGI: "Energi",
  NON_ENERGI: "Non-Energi",
  UMUM: "Umum",
};

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch article and session in parallel
  const [article, session] = await Promise.all([
    prisma.article.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, image: true } },
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

  if (!article) notFound();

  // Increment view count (fire-and-forget)
  incrementViewAction(slug);

  const userId = session?.user?.id ?? null;
  const userRole = session?.user?.role ?? null;
  const isLoggedIn = !!userId;

  const likes = article.reactions.filter((r) => r.type === "LIKE").length;
  const dislikes = article.reactions.filter((r) => r.type === "DISLIKE").length;
  const userReaction = userId
    ? ((article.reactions.find((r) => r.userId === userId)?.type as
        | "LIKE"
        | "DISLIKE"
        | null) ?? null)
    : null;
  const isBookmarked = userId
    ? article.bookmarks.some((b) => b.userId === userId)
    : false;

  // Related articles — same category, exclude current
  const related = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      category: article.category,
      slug: { not: slug },
    },
    orderBy: { views: "desc" },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  return (
    <article className="w-full min-h-screen">
      {/* Hero / Cover */}
      <div className="relative w-full h-[40vh] md:h-[55vh] bg-black">
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
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
          className="absolute top-6 left-4 md:left-8 flex items-center gap-1.5 text-white/70 text-sm"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/articles" className="hover:text-white transition-colors">
            Artikel
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white/50 line-clamp-1 max-w-[180px]">
            {article.title}
          </span>
        </nav>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-8 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary text-white">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
            {article.tags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="px-2.5 py-0.5 rounded-full text-xs bg-white/15 text-white/80 backdrop-blur-sm"
              >
                #{tag.name}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-10">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/40">
          {/* Author */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/15 overflow-hidden flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {article.author.image ? (
                <Image
                  src={article.author.image}
                  alt={article.author.name ?? ""}
                  width={36}
                  height={36}
                  className="object-cover"
                />
              ) : (
                (article.author.name?.charAt(0) ?? "A").toUpperCase()
              )}
            </div>
            <span className="font-semibold text-foreground">
              {article.author.name}
            </span>
          </div>

          <div className="h-4 w-px bg-border" />

          {article.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(article.publishedAt), "d MMMM yyyy", {
                locale: idLocale,
              })}
            </span>
          )}

          {article.readTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime} menit baca
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            {article.views.toLocaleString("id-ID")} kali dilihat
          </span>
        </div>

        {/* Excerpt */}
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 italic border-l-4 border-brand-primary pl-4">
          {article.excerpt}
        </p>

        {/* Body */}
        <ArticleBody html={article.content} />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border/40">
            <span className="text-sm text-muted-foreground mr-1">Tags:</span>
            {article.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/articles?search=${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary border border-border/50 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Reactions + Bookmark */}
        <div className="mt-4">
          <ReactionBar
            articleId={article.id}
            initialLikes={likes}
            initialDislikes={dislikes}
            userReaction={userReaction}
            isBookmarked={isBookmarked}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Comments */}
        <CommentSection
          articleId={article.id}
          initialComments={article.comments.map((c) => ({
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

        {/* Related Articles */}
        <RelatedArticles articles={related} />
      </div>
    </article>
  );
}
