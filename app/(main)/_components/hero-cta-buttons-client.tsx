"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroCtaButtonsClient() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Skeleton className="h-12 sm:h-14 w-full sm:w-36 rounded-full" />
        <Skeleton className="h-12 sm:h-14 w-full sm:w-48 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
      <Button
        size="lg"
        className="w-full sm:w-auto rounded-full text-base sm:text-lg font-bold px-8 sm:px-10 h-12 sm:h-14 bg-brand-primary hover:bg-brand-hover text-white border-2 border-brand-primary"
        asChild
      >
        {session?.user ? (
          <Link
            href={
              session.user.role === "SUPER_ADMIN" ||
              session.user.role === "ADMIN"
                ? "/admin"
                : "/events"
            }
          >
            {session.user.role === "SUPER_ADMIN" ||
            session.user.role === "ADMIN"
              ? "Admin Panel"
              : "Events"}
          </Link>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-full sm:w-auto rounded-full text-base sm:text-lg font-bold px-6 sm:px-8 h-12 sm:h-14 bg-white hover:bg-white/90 text-brand-primary border-2 border-brand-primary flex items-center justify-center gap-2"
        asChild
      >
        <Link href="/articles">
          Baca Artikel Kami
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
        </Link>
      </Button>
    </div>
  );
}
