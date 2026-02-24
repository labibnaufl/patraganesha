import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../_lib/require-admin";
import { createAcademic } from "../_lib/action";
import { AcademicForm } from "../_components/academic-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewAcademicPage() {
  await requireAdmin();

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/academic"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Kembali
        </Link>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-xl font-bold font-heading">
          Tambah Informasi Akademik
        </h1>
      </div>

      <AcademicForm action={createAcademic} tags={tags} />
    </div>
  );
}
