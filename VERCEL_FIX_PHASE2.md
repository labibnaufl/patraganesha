# Phase 2 — Force 6 Public Routes Static

> **Status:** Ready to implement  
> **Problem:** Phase 1 reduced routes but Vercel still bundles to >12 functions  
> **Goal:** Convert 6 remaining `ƒ` public routes → `○` static  

---

## Root Cause

Phase 1 left **24 `ƒ` routes**. Vercel bundled them but the result was **still >12 functions**. The 6 public pages remain `ƒ` because:

| Route | Why still `ƒ` | Fix |
|-------|--------------|-----|
| `/articles` | `searchParams` in server component | Move data fetching + filtering to client |
| `/events` | `searchParams` in server component | Move data fetching + filtering to client |
| `/academic` | `searchParams` in server component | Move data fetching + filtering to client |
| `/articles/[slug]` | `auth()` call in page body | Remove `auth()`, pass user context via client components |
| `/events/[slug]` | `auth()` call in page body | Remove `auth()`, pass user context via client components |
| `/academic/[slug]` | `auth()` call in page body | Remove `auth()`, pass user context via client components |

After this, the remaining `ƒ` routes will be:

```
Admin (14 routes) → bundled into ~3 functions
/api/auth           → 1 function
/api/upload         → 1 function
/dashboard          → 1 function
/verify-email       → 1 function
Total: ~7 functions ✅
```

---

## Strategy A — Listing Pages (Remove `searchParams`)

### The Pattern

**Before:** Server reads `searchParams` → queries DB with filters → renders HTML  
**After:** Server fetches ALL data → passes to client component → client filters/paginates

Since these pages use `revalidate = 3600`, the "ALL data" is cached and served statically. The client-side filtering is instant because the data is already in the page.

> **Tradeoff:** We load more data upfront (all published items instead of one page). For a student org website with ~50-200 items per category, this is totally fine.

### A1. Articles Listing

#### [MODIFY] `app/(main)/articles/page.tsx`

```typescript
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ArticlesContent } from "./_components/articles-content";

export const revalidate = 3600;

export const metadata = {
  title: 'Artikel | HMTM "PATRA" ITB',
  description: "Baca artikel terbaru seputar energi, non-energi, dan isu umum dari PATRA Ganesha.",
};

// Server: fetch ALL published articles (cached for 1 hour)
async function getAllArticles() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      publishedAt: true,
      readTime: true,
      views: true,
      author: { select: { name: true } },
    },
  });
}

export default async function ArticlesPage() {
  // No searchParams! Page is now static
  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl py-16">
        {/* Static header */}
        <div className="mb-10 text-center">
          <p className="text-brand-primary font-medium mb-2">Artikel</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Wawasan & Perspektif <span className="text-brand-primary">PATRA Ganesha</span>
          </h1>
          <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
            Kumpulan artikel seputar energi, lingkungan, dan isu-isu terkini dari himpunan kami.
          </p>
        </div>

        {/* Client component handles filtering + pagination */}
        <Suspense>
          <ArticlesContent articles={JSON.parse(JSON.stringify(articles))} />
        </Suspense>
      </div>
    </main>
  );
}
```

#### [NEW] `app/(main)/articles/_components/articles-content.tsx`

Client component that:
- Reads `useSearchParams()` for category, search, page
- Filters the pre-fetched articles array client-side
- Renders `ArticleFilters`, `FeaturedArticle`, grid, and pagination
- Updates URL params via `useRouter().push()` without page reload

The key logic:
```typescript
"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

// Filter + paginate the pre-fetched data client-side
const filtered = useMemo(() => {
  let result = articles;
  if (category) result = result.filter(a => a.category === category);
  if (search) result = result.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.excerpt?.toLowerCase().includes(search.toLowerCase())
  );
  return result;
}, [articles, category, search]);

const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
```

### A2. Events Listing

#### [MODIFY] `app/(main)/events/page.tsx`
Same pattern — fetch all published events server-side, pass to client.

#### [NEW] `app/(main)/events/_components/events-content.tsx`
Client component handles time filter (UPCOMING/PAST/ALL), locationType, search, pagination.

### A3. Academic Listing

#### [MODIFY] `app/(main)/academic/page.tsx`
Same pattern.

#### [NEW] `app/(main)/academic/_components/academic-content.tsx`
Client component handles type filter, sort, search, pagination.

---

## Strategy B — Detail Pages (Remove `auth()`)

### The Pattern

**Before:** Server calls `auth()` + fetches data → computes userReaction, isBookmarked → passes to components  
**After:** Server fetches data only (no `auth()`) → passes article data + all reactions/bookmarks to client → client component uses `useSession()` to determine current user's state

### B1. Articles Detail

#### [MODIFY] `app/(main)/articles/[slug]/page.tsx`

1. Remove `import { auth } from "@/lib/auth"`
2. Remove `auth()` from the `Promise.all`
3. Remove `userId`, `userRole`, `isLoggedIn` server-side computation
4. Remove `userReaction`, `isBookmarked` server-side computation
5. Pass raw `reactions`, `bookmarks`, `comments` arrays to client components
6. Let `ReactionBar` and `CommentSection` use `useSession()` internally

```diff
- import { auth } from "@/lib/auth";

  export default async function ArticleDetailPage({ params }) {
    const { slug } = await params;

-   const [article, session] = await Promise.all([
+   const article = await
      prisma.article.findUnique({
        where: { slug, status: "PUBLISHED" },
        include: { ... },
-     }),
-     auth(),
-   ]);
+     });

    if (!article) notFound();
    incrementViewAction(slug);

-   const userId = session?.user?.id ?? null;
-   const userRole = session?.user?.role ?? null;
-   const isLoggedIn = !!userId;
-   const likes = article.reactions.filter(r => r.type === "LIKE").length;
-   // ... etc

    // Pass raw data to client components
    return (
      <>
        <ReactionBar
          articleId={article.id}
-         initialLikes={likes}
-         initialDislikes={dislikes}
-         userReaction={userReaction}
-         isBookmarked={isBookmarked}
-         isLoggedIn={isLoggedIn}
+         reactions={article.reactions}
+         bookmarks={article.bookmarks}
        />
        <CommentSection
          articleId={article.id}
          initialComments={...}
-         currentUserId={userId}
-         currentUserRole={userRole}
-         isLoggedIn={isLoggedIn}
        />
      </>
    );
  }
```

#### [MODIFY] `app/(main)/articles/[slug]/_components/reaction-bar.tsx`

Add `useSession()` to determine current user's reaction/bookmark status client-side:

```typescript
"use client";
import { useSession } from "next-auth/react";

export function ReactionBar({ articleId, reactions, bookmarks }) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const isLoggedIn = !!userId;

  const likes = reactions.filter(r => r.type === "LIKE").length;
  const dislikes = reactions.filter(r => r.type === "DISLIKE").length;
  const userReaction = userId 
    ? reactions.find(r => r.userId === userId)?.type ?? null 
    : null;
  const isBookmarked = userId 
    ? bookmarks.some(b => b.userId === userId) 
    : false;

  // ... rest of existing component logic
}
```

#### [MODIFY] `app/(main)/articles/[slug]/_components/comment-section.tsx`

Same pattern — add `useSession()`.

### B2. Events Detail

#### [MODIFY] `app/(main)/events/[slug]/page.tsx`
Same pattern — remove `auth()`, pass raw data.

#### [MODIFY] Reaction bar + comment section + registration box
Add `useSession()` to each.

> **Note:** `EventRegistrationBox` already uses `useSession()` pattern since it's a client component. We just need to pass `isLoggedIn`, `userId` as derived from `useSession()` instead of from server.

### B3. Academic Detail

#### [MODIFY] `app/(main)/academic/[slug]/page.tsx`
Same pattern.

---

## Implementation Order

| Step | Task | Time | Impact |
|------|------|------|--------|
| **1** | Articles listing → client-side filtering | 20 min | -1 function |
| **2** | Events listing → client-side filtering | 20 min | -1 function |
| **3** | Academic listing → client-side filtering | 20 min | -1 function |
| **4** | Article `[slug]` → remove `auth()` | 15 min | -1 function |
| **5** | Event `[slug]` → remove `auth()` | 15 min | -1 function |
| **6** | Academic `[slug]` → remove `auth()` | 15 min | -1 function |
| **7** | `bun run build` → verify ƒ count | 2 min | — |
| **8** | `npx vercel` → test deploy | 5 min | ✅ |
| **Total** | | **~2 hours** | **-6 functions** |

---

## Expected Build Output After Phase 2

```
Route (app)                           Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ○ /academic                              1h      1y
├ ○ /academic/[slug]                       1h      1y
├ ƒ /admin
├ ƒ /admin/academic
├ ƒ /admin/academic/[id]
├ ƒ /admin/academic/new
├ ƒ /admin/articles
├ ƒ /admin/articles/[id]
├ ƒ /admin/articles/new
├ ƒ /admin/events
├ ƒ /admin/events/[id]
├ ƒ /admin/events/[id]/attendances
├ ƒ /admin/events/new
├ ƒ /admin/logs
├ ƒ /admin/users
├ ƒ /admin/users/[id]
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/upload
├ ○ /articles                              1h      1y
├ ○ /articles/[slug]                       1h      1y
├ ƒ /dashboard
├ ○ /events                                1h      1y
├ ○ /events/[slug]                         1h      1y
├ ○ /login
├ ○ /privacy-policy
├ ○ /profile
├ ○ /register
├ ○ /robots.txt
├ ○ /sitemap.xml                           1h      1y
├ ○ /terms
└ ƒ /verify-email

ƒ (Dynamic): 18 routes → bundled into ~7 functions ✅
○ (Static):  20 routes → 0 functions
```

---

## Tradeoffs

| Aspect | Before | After |
|--------|--------|-------|
| **Listing page data** | Server filters, sends small payload | Server sends all items, client filters |
| **Data freshness** | Real-time on every request | Cached 1 hour (ISR) |
| **User reactions** | Computed server-side instantly | Client fetches session, computes ~200ms |
| **SEO** | Server-rendered with filters | Static HTML + client hydration (SEO same for content) |
| **Performance** | SSR on every request | Static + CDN cached (much faster) |

> [!NOTE]
> For a student org site with ~50-200 items per category, client-side filtering is instantaneous. The tradeoff is worth it for free hosting on Vercel Hobby.

---

## Verification

```bash
bun run build
```

Check:
- [ ] All 6 public pages show `○` (static) with `1h` revalidate
- [ ] Only admin + API + dashboard + verify-email show `ƒ`
- [ ] Total `ƒ` routes = 18
- [ ] Filters still work on all listing pages
- [ ] Reactions, bookmarks, comments still work on detail pages
- [ ] `npx vercel` deploys successfully (no 12-function error)
