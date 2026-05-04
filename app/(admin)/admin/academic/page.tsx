import { Suspense } from "react";
import { AdminAcademicClient } from "./_components/admin-academic-client";

function AdminAcademicFallback() {
  return (
    <div className="p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-6 rounded-lg border shadow-sm">
        <div className="p-4">
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="border-t p-4">
          <div className="h-32 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function AdminAcademicPage() {
  return (
    <Suspense fallback={<AdminAcademicFallback />}>
      <AdminAcademicClient />
    </Suspense>
  );
}
