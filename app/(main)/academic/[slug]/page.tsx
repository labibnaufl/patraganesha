import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { incrementAcademicViewAction } from "./_lib/actions";
import { AcademicReactionBar } from "./_components/academic-reaction-bar";
import { AcademicCommentSection } from "./_components/academic-comment-section";
import Image from "next/image";
import Link from "next/link";
import { format, isFuture, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Clock,
  Eye,
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  Download,
  User,
  Phone,
  Mail,
} from "lucide-react";
import type { Metadata } from "next";

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const academic = await prisma.academicInfo.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      description: true,
      coverImage: true,
    },
  });

  if (!academic) return { title: "Info Akademik tidak ditemukan" };

  return {
    title: `${academic.title} | Info Akademik`,
    description: academic.description,
    openGraph: {
      title: academic.title,
      description: academic.description,
      images: academic.coverImage ? [{ url: academic.coverImage }] : [],
      type: "website",
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  LOMBA: "bg-orange-100 text-orange-700",
  BEASISWA: "bg-blue-100 text-blue-700",
  INFO_KAMPUS: "bg-slate-100 text-slate-700",
};

const TYPE_LABELS: Record<string, string> = {
  LOMBA: "Lomba",
  BEASISWA: "Beasiswa",
  INFO_KAMPUS: "Info Kampus",
};

export default async function AcademicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch info and session in parallel
  const [academic, session] = await Promise.all([
    prisma.academicInfo.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        createdBy: { select: { name: true } },
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

  if (!academic) notFound();

  // Increment view count (fire-and-forget)
  incrementAcademicViewAction(slug);

  const userId = session?.user?.id ?? null;
  const userRole = session?.user?.role ?? null;
  const isLoggedIn = !!userId;

  const likes = academic.reactions.filter((r) => r.type === "LIKE").length;
  const dislikes = academic.reactions.filter(
    (r) => r.type === "DISLIKE",
  ).length;
  const userReaction = userId
    ? ((academic.reactions.find((r) => r.userId === userId)?.type as
        | "LIKE"
        | "DISLIKE"
        | null) ?? null)
    : null;
  const isBookmarked = userId
    ? academic.bookmarks.some((b) => b.userId === userId)
    : false;

  const isUpcoming = academic.deadline
    ? isFuture(new Date(academic.deadline))
    : null;
  const daysUntil = academic.deadline
    ? differenceInDays(new Date(academic.deadline), new Date())
    : null;

  return (
    <article className="w-full min-h-screen">
      {/* Hero / Cover */}
      <div className="relative w-full h-[40vh] md:h-[55vh] bg-teal-950">
        {academic.coverImage && (
          <Image
            src={academic.coverImage}
            alt={academic.title}
            fill
            priority
            className="object-cover opacity-60"
            sizes="100vw"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="absolute top-6 left-4 md:left-8 flex items-center gap-1.5 text-white/70 text-sm z-20"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/academic" className="hover:text-white transition-colors">
            Info Akademik
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white/50 line-clamp-1 max-w-[180px]">
            {academic.title}
          </span>
        </nav>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-10 max-w-4xl mx-auto w-full z-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[academic.type] ?? "bg-white/20 text-white"}`}
            >
              {TYPE_LABELS[academic.type] ?? academic.type}
            </span>
            {academic.tags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="px-2.5 py-0.5 rounded-full text-xs bg-white/15 text-white/80 backdrop-blur-sm border border-white/20"
              >
                #{tag.name}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
            {academic.title}
          </h1>

          {/* Headline Meta */}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-white/80 text-sm font-medium">
            {academic.deadline ? (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>
                  Tutup:{" "}
                  {format(new Date(academic.deadline), "d MMMM yyyy", {
                    locale: idLocale,
                  })}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Tanpa tenggat waktu</span>
              </div>
            )}

            {isUpcoming !== null && daysUntil !== null && (
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${daysUntil <= 7 && daysUntil >= 0 ? "bg-red-500/80 text-white" : "bg-emerald-500/80 text-white"}`}
              >
                {daysUntil < 0
                  ? "Selesai"
                  : daysUntil === 0
                    ? "Hari Ini"
                    : `${daysUntil} Hari Lagi`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-10">
        {/* Call to Action Bar */}
        {(academic.externalLink ||
          academic.driveLink ||
          academic.attachments.length > 0) && (
          <div className="bg-muted border border-border/80 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold mb-1">Akses Informasi Penuh</h3>
              <p className="text-muted-foreground text-sm">
                Kunjungi tautan pendaftaran atau unduh dokumen lengkap terkait
                informasi ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {academic.externalLink && (
                <a
                  href={academic.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white hover:bg-brand-hover rounded-xl font-semibold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Kunjungi Tautan
                </a>
              )}
              {academic.driveLink && (
                <a
                  href={academic.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Buka Drive
                </a>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="space-y-10">
          {/* General Description */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
              Deskripsi Utama
            </h2>
            <div className="prose prose-brand max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {academic.description}
            </div>
          </section>

          {/* Requirements */}
          {academic.requirements && (
            <section className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10">
              <h2 className="text-xl font-bold mb-4 text-brand-primary">
                Persyaratan Khusus
              </h2>
              <div className="prose prose-brand max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                {academic.requirements}
              </div>
            </section>
          )}

          {/* Prizes / Benefits */}
          {(academic.prizes || academic.benefits) && (
            <section className="p-6 rounded-2xl border bg-card">
              <h2 className="text-xl font-bold mb-4">
                {academic.type === "LOMBA"
                  ? "Hadiah & Apresiasi"
                  : "Benefit / Keuntungan"}
              </h2>
              <div className="prose prose-brand max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {academic.prizes || academic.benefits}
              </div>
            </section>
          )}

          {/* Attachments List */}
          {academic.attachments && academic.attachments.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Dokumen Lampiran
              </h2>
              <ul className="space-y-2">
                {academic.attachments.map((url, idx) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border hover:bg-muted transition-colors group"
                    >
                      <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground">
                        Lampiran {idx + 1}
                      </span>
                      <Download className="w-4 h-4 ml-auto text-muted-foreground opacity-50 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Contact Person Box */}
          {(academic.contactPerson ||
            academic.contactEmail ||
            academic.contactPhone) && (
            <div className="p-6 rounded-2xl border bg-muted/30">
              <h3 className="font-bold text-lg mb-4">Narahubung (CP)</h3>
              <div className="space-y-3 text-sm">
                {academic.contactPerson && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {academic.contactPerson}
                    </span>
                  </div>
                )}
                {academic.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{academic.contactPhone}</span>
                  </div>
                )}
                {academic.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{academic.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {academic.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border/40">
            <span className="text-sm text-muted-foreground mr-1">Tags:</span>
            {academic.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/academic?search=${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary border border-border/50 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Publisher Meta */}
        <div className="flex items-center gap-6 mt-8 py-6 border-y border-border/40 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-foreground/80">
              Dipublikasi Oleh:
            </span>
            {academic.createdBy.name}
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <Eye className="w-3.5 h-3.5" />
            {academic.views.toLocaleString("id-ID")} kali dilihat
          </span>
        </div>

        {/* Reactions + Bookmark */}
        <div className="mt-4">
          <AcademicReactionBar
            academicInfoId={academic.id}
            initialLikes={likes}
            initialDislikes={dislikes}
            userReaction={userReaction}
            isBookmarked={isBookmarked}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Comments */}
        <AcademicCommentSection
          academicInfoId={academic.id}
          initialComments={academic.comments.map((c) => ({
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
      </div>
    </article>
  );
}
