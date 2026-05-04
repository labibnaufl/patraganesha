"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAvailableTags } from "../../../_lib/admin-actions";
import { createAcademic } from "../../_lib/action";
import { AcademicForm } from "../../_components/academic-form";

interface Tag {
  id: string;
  name: string;
}

export function AdminAcademicNewClient() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTags() {
      try {
        const result = await getAvailableTags();
        setTags(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tags");
      } finally {
        setLoading(false);
      }
    }
    loadTags();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-6" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
        Error: {error}
      </div>
    );
  }

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
