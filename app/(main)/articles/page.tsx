import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ArticlesContent } from "./_components/articles-content";

export const revalidate = 3600;

export const metadata = {
  title: 'Artikel | HMTM "PATRA" ITB',
  description: "Baca artikel terbaru seputar energi, non-energi, dan isu umum dari PATRA Ganesha.",
};

// Server: fetch ALL published articles (cached for 1 hour)
async function getAllArticles() {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        readTime: true,
        views: true,
        author: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    // Return empty array to prevent build failure
    return [];
  }
}

export default async function ArticlesPage() {
  // No searchParams! Page is now static
  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl py-16">
        {/* Static header */}
        <div className="mb-10 text-center">
          <p className="text-brand-primary font-medium mb-2">Artikel</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Wawasan & Perspektif <span className="text-brand-primary">PATRA Ganesha</span>
          </h1>
          <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
            Kumpulan artikel seputar energi, lingkungan, dan isu-isu terkini dari himpunan kami.
          </p>
        </div>

        {/* Client component handles filtering + pagination */}
        <Suspense>
          <ArticlesContent articles={JSON.parse(JSON.stringify(articles))} />
        </Suspense>
      </div>
    </main>
  );
}
