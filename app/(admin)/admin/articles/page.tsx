import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../_lib/require-admin";
import Link from "next/link";
import { Plus, FileText, Globe, Archive } from "lucide-react";
import { ArticleStatusActions } from "./_components/article-status-actions";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const status = params.status || "";
  const category = params.category || "";
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const perPage = 15;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const [articles, total, stats] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        status: true,
        views: true,
        readTime: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  const statsMap: Record<string, number> = {};
  for (const s of stats) statsMap[s.status] = s._count;

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
    { value: "ARCHIVED", label: "Archived" },
  ];
  const categoryOptions = [
    { value: "", label: "Semua Kategori" },
    { value: "ENERGI", label: "Energi" },
    { value: "NON_ENERGI", label: "Non-Energi" },
    { value: "UMUM", label: "Umum" },
  ];

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

  function getCategoryBadge(c: string) {
    switch (c) {
      case "ENERGI":
        return "bg-orange-100 text-orange-700";
      case "NON_ENERGI":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Kelola Artikel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} artikel ditemukan
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          Tulis Artikel
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Draft",
            value: statsMap["DRAFT"] ?? 0,
            icon: FileText,
            color: "text-amber-600",
          },
          {
            label: "Published",
            value: statsMap["PUBLISHED"] ?? 0,
            icon: Globe,
            color: "text-emerald-600",
          },
          {
            label: "Archived",
            value: statsMap["ARCHIVED"] ?? 0,
            icon: Archive,
            color: "text-gray-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-4 flex items-center gap-3"
          >
            <stat.icon className={`size-5 ${stat.color}`} />
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-3 mb-6">
        <input
          name="search"
          type="text"
          placeholder="Cari judul atau ringkasan..."
          defaultValue={search}
          className="flex-1 min-w-48 px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 text-sm border rounded-lg bg-background"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={category}
          className="px-3 py-2 text-sm border rounded-lg bg-background"
        >
          {categoryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Filter
        </button>
        {(search || status || category) && (
          <Link
            href="/admin/articles"
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Article Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Artikel
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Kategori
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Penulis
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Views
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Tanggal
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {article.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.coverImage}
                          alt=""
                          className="size-10 rounded-lg object-cover shrink-0 bg-muted"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                          <FileText className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="font-medium text-foreground hover:underline line-clamp-1"
                        >
                          {article.title}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {article.excerpt}
                        </p>
                        {article.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {article.tags.slice(0, 3).map((t) => (
                              <span
                                key={t.tag.name}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                              >
                                {t.tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(article.category)}`}
                    >
                      {article.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(article.status)}`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {article.author.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {article.views.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {(
                      article.publishedAt ?? article.createdAt
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <ArticleStatusActions
                      articleId={article.id}
                      status={article.status}
                    />
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Tidak ada artikel ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/articles?page=${page - 1}${status ? `&status=${status}` : ""}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/articles?page=${page + 1}${status ? `&status=${status}` : ""}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                Selanjutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
