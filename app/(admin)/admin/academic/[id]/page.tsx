import { prisma } from "@/lib/prisma";
import { updateAcademic } from "../_lib/action";
import { AcademicForm } from "../_components/academic-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Globe, Eye, Tag as TagIcon } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

export default async function EditAcademicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [academic, tags] = await Promise.all([
    prisma.academicInfo.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        driveLink: true,
        externalLink: true,
        deadline: true,
        requirements: true,
        prizes: true,
        benefits: true,
        contactPerson: true,
        contactEmail: true,
        contactPhone: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        views: true,
        createdBy: { select: { name: true } },
        tags: { select: { tagId: true } },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!academic) notFound();

  const updateBound = updateAcademic.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/academic"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Kembali
          </Link>
          <span className="text-muted-foreground">|</span>
          <h1 className="text-xl font-bold font-heading">
            Edit Informasi Akademik
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[academic.status]}`}
          >
            {academic.status}
          </span>
          {academic.publishedAt && (
            <span className="flex items-center gap-1">
              <Globe className="size-3.5" />
              {academic.publishedAt.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <TagIcon className="size-3.5" />
            {academic.type}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" />
            {academic.views.toLocaleString()} views
          </span>
        </div>
      </div>

      <AcademicForm action={updateBound} tags={tags} academic={academic} />
    </div>
  );
}
