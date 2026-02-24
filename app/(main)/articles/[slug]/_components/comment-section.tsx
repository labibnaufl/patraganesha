"use client";

import { useState, useTransition, useRef } from "react";
import { postCommentAction, deleteCommentAction } from "../_lib/actions";
import Image from "next/image";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Trash2, LogIn, MessageCircle } from "lucide-react";
import Link from "next/link";

type Comment = {
  id: string;
  content: string; // ← correct field name per schema
  createdAt: Date;
  user: {
    // ← correct relation name per schema
    id: string;
    name: string | null;
    image: string | null;
  };
};

type CommentSectionProps = {
  articleId: string;
  initialComments: Comment[];
  currentUserId: string | null;
  currentUserRole: string | null;
  isLoggedIn: boolean;
};

export function CommentSection({
  articleId,
  initialComments,
  currentUserId,
  currentUserRole,
  isLoggedIn,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement)
      .value;
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await postCommentAction(articleId, content);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setComments((prev) => [
          {
            id: `temp-${Date.now()}`,
            content: content.trim(),
            createdAt: new Date(),
            user: { id: currentUserId!, name: "Kamu", image: null },
          },
          ...prev,
        ]);
      }
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteCommentAction(commentId);
      if (!result?.error) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    });
  }

  const isAdmin =
    currentUserRole === "SUPER_ADMIN" || currentUserRole === "ADMIN";

  return (
    <section className="mt-12 pt-10 border-t border-border/40">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary" />
        Komentar
        <span className="text-base font-normal text-muted-foreground">
          ({comments.length})
        </span>
      </h2>

      {/* Comment form */}
      {isLoggedIn ? (
        <form ref={formRef} onSubmit={handleSubmit} className="mb-10 space-y-3">
          <textarea
            name="content"
            rows={3}
            required
            placeholder="Tulis komentarmu di sini..."
            className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isPending ? "Mengirim..." : "Kirim Komentar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50">
          <MessageCircle className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Link>{" "}
            untuk ikut berkomentar.
          </p>
        </div>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          Belum ada komentar. Jadilah yang pertama!
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => {
            const canDelete = comment.user.id === currentUserId || isAdmin;
            return (
              <li key={comment.id} className="flex gap-4 items-start group">
                {/* Avatar */}
                <div className="shrink-0 w-9 h-9 rounded-full bg-primary/15 overflow-hidden flex items-center justify-center text-primary font-bold text-sm">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name ?? ""}
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  ) : (
                    (comment.user.name?.charAt(0) ?? "U").toUpperCase()
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold">
                      {comment.user.name ?? "Anonim"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(comment.createdAt),
                        "d MMM yyyy, HH:mm",
                        {
                          locale: idLocale,
                        },
                      )}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>

                {/* Delete */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isPending}
                    className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    aria-label="Hapus komentar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
