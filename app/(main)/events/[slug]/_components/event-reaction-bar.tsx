"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  LogIn,
} from "lucide-react";
import {
  toggleEventReactionAction,
  toggleEventBookmarkAction,
} from "../_lib/actions";
import Link from "next/link";

type Reaction = {
  id: string;
  type: string;
  userId: string;
};

type Bookmark = {
  id: string;
  userId: string;
};

type ReactionBarProps = {
  eventId: string;
  reactions: Reaction[];
  bookmarks: Bookmark[];
};

export function EventReactionBar({
  eventId,
  reactions,
  bookmarks,
}: ReactionBarProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userId = session?.user?.id ?? null;

  // Compute likes/dislikes from reactions prop
  const initialLikes = reactions.filter((r) => r.type === "LIKE").length;
  const initialDislikes = reactions.filter((r) => r.type === "DISLIKE").length;

  // Compute user-specific states
  const userReaction = userId
    ? ((reactions.find((r) => r.userId === userId)?.type as
        | "LIKE"
        | "DISLIKE"
        | null) ?? null)
    : null;
  const isBookmarked = userId
    ? bookmarks.some((b) => b.userId === userId)
    : false;

  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [reaction, setReaction] = useState<"LIKE" | "DISLIKE" | null>(
    userReaction,
  );
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleReaction(type: "LIKE" | "DISLIKE") {
    if (!isLoggedIn) return;
    const prev = reaction;
    // Optimistic update
    if (prev === type) {
      setReaction(null);
      if (type === "LIKE") setLikes((l) => l - 1);
      else setDislikes((d) => d - 1);
    } else {
      setReaction(type);
      if (type === "LIKE") {
        setLikes((l) => l + 1);
        if (prev === "DISLIKE") setDislikes((d) => d - 1);
      } else {
        setDislikes((d) => d + 1);
        if (prev === "LIKE") setLikes((l) => l - 1);
      }
    }
    startTransition(async () => {
      await toggleEventReactionAction(eventId, type);
    });
  }

  function handleBookmark() {
    if (!isLoggedIn) return;
    setBookmarked((b) => !b);
    startTransition(async () => {
      await toggleEventBookmarkAction(eventId);
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-4 py-5 border-y border-border/40">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <ThumbsUp className="w-4 h-4" />
          <span>{initialLikes}</span>
          <ThumbsDown className="w-4 h-4" />
          <span>{initialDislikes}</span>
        </div>
        <Link
          href="/login"
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Login untuk bereaksi
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 py-5 border-y border-border/40 transition-opacity ${isPending ? "opacity-60 pointer-events-none" : ""}`}
    >
      <button
        onClick={() => handleReaction("LIKE")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
          reaction === "LIKE"
            ? "bg-green-100 border-green-300 text-green-700"
            : "hover:bg-muted border-border text-muted-foreground"
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        {likes}
      </button>

      <button
        onClick={() => handleReaction("DISLIKE")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
          reaction === "DISLIKE"
            ? "bg-red-100 border-red-300 text-red-700"
            : "hover:bg-muted border-border text-muted-foreground"
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
        {dislikes}
      </button>

      <button
        onClick={handleBookmark}
        className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
          bookmarked
            ? "bg-primary/10 border-primary/30 text-primary"
            : "hover:bg-muted border-border text-muted-foreground"
        }`}
      >
        {bookmarked ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        {bookmarked ? "Disimpan" : "Simpan"}
      </button>
    </div>
  );
}
