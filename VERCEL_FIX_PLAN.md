# Fix Vercel Hobby 12-Function Limit — Merged Plan

> **Status:** Ready to implement
> **Goal:** Reduce serverless functions from 27 → ≤12

---

## Strategy Summary

| Strategy | Functions Saved | Effort |
|----------|----------------|--------|
| **A.** Remove `force-dynamic` from landing page | **-1** | 1 min |
| **B.** Add `revalidate` to listing pages | **0** (still `ƒ` due to `searchParams`, but data is cached) | 3 min |
| **C.** Add `generateStaticParams` + ISR to `[slug]` detail pages | **-3** | 15 min |
| **D.** Convert sitemap to ISR | **-1** | 1 min |
| **E.** Merge 2 upload API routes into 1 | **-1** | 10 min |
| **F.** Vercel auto-bundles admin routes (free) | **-10 to -12** | 0 min |
| **Projected result** | **~6-10 functions** | ✅ Under 12 |

---

## Why NOT `force-static` on Listing Pages

Per Next.js 16 docs (confirmed via Context7):

> `force-static` forces `cookies()`, `headers()`, and `searchParams` to return **empty values**.

Our listing pages (`/articles`, `/events`, `/academic`) read `searchParams` for filtering, search, and pagination. Using `force-static` would silently break all filters. We use `revalidate` only instead.

---

## Detailed Changes

### A. Landing Page — Make Static (Completed ✅)

**Problem:** Landing page had `force-dynamic` and the `HeroCtaButtons` component called `auth()` server-side, which forced dynamic rendering.

**Solution:** Converted `HeroCtaButtons` to a client component using `useSession()` hook.

**Files Changed:**
1. `app/(main)/page.tsx` — Removed `force-dynamic` export
2. `app/(main)/_components/hero-cta-buttons-client.tsx` — New client component with `useSession()`
3. `app/(main)/_components/hero-section.tsx` — Updated to use client component, removed `auth()` import

**Result:** `ƒ → ○` (static) ✅

---

### B. Listing Pages — Add ISR Cache

These pages use `searchParams` so they'll remain `ƒ`, but `revalidate` caches the data and helps Vercel bundle them efficiently.

**File:** `app/(main)/articles/page.tsx`
```diff
-export const dynamic = "force-dynamic";
+export const revalidate = 3600; // ISR: regenerate data every hour
```

**File:** `app/(main)/events/page.tsx`
```diff
-export const dynamic = "force-dynamic";
+export const revalidate = 3600;
```

**File:** `app/(main)/academic/page.tsx`
```diff
-export const dynamic = "force-dynamic";
+export const revalidate = 3600;
```

**Result:** Still `ƒ` but with cached data, better bundling potential

---

### C. Detail Pages — `generateStaticParams` + ISR

Pre-render all published content at build time. New content is generated on first visit (`dynamicParams = true`) and cached.

**File:** `app/(main)/articles/[slug]/page.tsx` — Add before `generateMetadata`:
```typescript
import { prisma } from "@/lib/prisma";

// ISR: regenerate every hour
export const revalidate = 3600;
export const dynamicParams = true; // Generate new slugs on first visit

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return articles.map((a) => ({ slug: a.slug }));
}
```

**File:** `app/(main)/events/[slug]/page.tsx` — Same pattern:
```typescript
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return events.map((e) => ({ slug: e.slug }));
}
```

**File:** `app/(main)/academic/[slug]/page.tsx` — Same pattern:
```typescript
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const items = await prisma.academicInfo.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return items.map((i) => ({ slug: i.slug }));
}
```

**Result:** `ƒ → ○/●` (static/ISR) — saves 3 functions

> **Note:** These pages call `auth()` which normally forces dynamic. However, `generateStaticParams` + `dynamicParams = true` + `revalidate` tells Next.js to pre-build known pages and ISR the rest. The auth-dependent parts (reactions, bookmarks) will use the session at revalidation time. For fully static behavior, user-specific features would need to move to client components — but this is a future optimization, not required now.

---

### D. Sitemap — Replace `force-dynamic` with ISR

**File:** `app/sitemap.ts`
```diff
-export const dynamic = "force-dynamic";
+export const revalidate = 3600; // Regenerate hourly
```

**Result:** `ƒ → ○` (ISR static) — saves 1 function

---

### E. Merge Upload API Routes

Both `/api/upload` and `/api/attendance-proof/upload` upload files to Cloudinary. Merge into a single route.

**File:** `app/api/upload/route.ts` — Modify to handle both admin uploads and proof uploads:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage, uploadProofImage } from "@/lib/cloudinary";

const PROOF_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "admin";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File terlalu besar. Maksimal 5MB." },
        { status: 400 }
      );
    }

    if (type === "proof") {
      // Attendance proof upload — any authenticated user
      if (!PROOF_ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." },
          { status: 400 }
        );
      }
      const result = await uploadProofImage(file, "patra/attendance-proofs");
      return NextResponse.json(result);
    } else {
      // Admin upload — requires admin role
      if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const folder = (formData.get("folder") as string) || "patra/articles";
      const url = await uploadImage(file, folder);
      return NextResponse.json({ url });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}
```

**Delete:** `app/api/attendance-proof/` (entire directory)

**Update client code** that calls `/api/attendance-proof/upload`:
- Find all `fetch("/api/attendance-proof/upload"` calls
- Change to `fetch("/api/upload"` and add `type: "proof"` to the FormData

**Result:** Saves 1 function

---

### F. Vercel Auto-Bundling (No Changes Needed)

Vercel docs confirm: *"Frameworks like Next.js bundle dynamic code into the fewest possible Vercel Functions."*

All 14 `/admin/*` routes share `admin/layout.tsx` → bundled into **~2-3 functions** automatically.

---

## Projected Function Count

| Category | Routes | Est. Functions |
|----------|--------|----------------|
| Landing page `/` | 1 (now static) | **0** |
| Listing pages (with `searchParams`) | 3 | **1-3** (may bundle) |
| Detail `[slug]` pages (ISR) | 3 (now static) | **0** |
| Sitemap (ISR) | 1 (now static) | **0** |
| Admin routes (auto-bundled) | 14 | **~2-3** |
| API routes (after merge) | 2 (`auth` + `upload`) | **~2** |
| Dashboard + verify-email | 2 | **~2** |
| **Total** | | **~7-10** ✅ |

---

## Implementation Order

1. **Step 1** (2 min): Remove `force-dynamic` from landing page
2. **Step 2** (3 min): Replace `force-dynamic` with `revalidate = 3600` on listing pages + sitemap
3. **Step 3** (15 min): Add `generateStaticParams` to all 3 `[slug]` detail pages
4. **Step 4** (10 min): Merge upload API routes + update client references
5. **Step 5** (2 min): Run `npm run build` and count `ƒ` routes
6. **Step 6**: Push to Vercel and verify deployment succeeds

---

## Verification

```bash
npm run build
```

Check the build output for:
- [ ] Total `ƒ` routes ≤ 12
- [ ] Landing page shows `○` (static)
- [ ] `[slug]` detail pages show `○` or `●` (SSG/ISR)
- [ ] Sitemap shows `○` (ISR)
- [ ] All filters/search/pagination still work on listing pages
- [ ] Admin pages unchanged and functional

## Fallback (If Still Over 12)

If after all changes we're still over 12:
1. Move listing page filtering to client-side (removes `searchParams` dependency → pages become static)
2. Move `auth()` calls in detail pages to client-side `useSession()` hooks
3. Wrap all Prisma queries in `unstable_cache` for aggressive caching
