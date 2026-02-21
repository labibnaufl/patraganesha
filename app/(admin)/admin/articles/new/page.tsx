import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../_lib/require-admin";
import { createArticle } from "../_lib/actions";
import { ArticleForm } from "../_components/article-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewArticlePage() {
  await requireAdmin();

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Kembali
        </Link>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-xl font-bold font-heading">Tulis Artikel Baru</h1>
      </div>

      <ArticleForm action={createArticle} tags={tags} />
    </div>
  );
}
