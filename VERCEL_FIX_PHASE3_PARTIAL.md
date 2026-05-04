# Phase 3 (Partial): Convert Admin Listing Pages + Auth Pages to Static

## Goal

Reduce `ƒ` routes from **18 → 7** to safely pass the 12-function limit.

## What We Convert (11 routes → `○` static)

| # | Route | Why it's `ƒ` now | Client Component |
|---|-------|-----------------|-----------------|
| 1 | `/admin` (layout) | `requireAdmin()` → forces ALL children `ƒ` | `AdminGuard` |
| 2 | `/admin` (dashboard) | `requireAdmin()` + 6× Prisma counts | `AdminDashboardClient` |
| 3 | `/admin/articles` | `requireAdmin()` + Prisma list + searchParams | `AdminArticlesClient` |
| 4 | `/admin/events` | `requireAdmin()` + Prisma list + searchParams | `AdminEventsClient` |
| 5 | `/admin/academic` | `requireAdmin()` + Prisma list + searchParams | `AdminAcademicClient` |
| 6 | `/admin/users` | `requireSuperAdmin()` + Prisma list + searchParams | `AdminUsersClient` |
| 7 | `/admin/logs` | `requireAdmin()` + Prisma logs + searchParams | `AdminLogsClient` |
| 8 | `/admin/articles/new` | `requireAdmin()` + `prisma.tag.findMany()` | `AdminArticleNewClient` |
| 9 | `/admin/events/new` | `requireAdmin()` + `prisma.tag.findMany()` | `AdminEventNewClient` |
| 10 | `/admin/academic/new` | `requireAdmin()` + `prisma.tag.findMany()` | `AdminAcademicNewClient` |
| 11 | `/dashboard` | `auth()` + session display | `DashboardClient` |

## What Stays Dynamic (7 routes → still `ƒ`)

| Route | Why it must stay `ƒ` |
|-------|---------------------|
| `/admin/articles/[id]` | Prisma fetch by ID (params-dependent) |
| `/admin/events/[id]` | Prisma fetch by ID |
| `/admin/events/[id]/attendances` | Prisma fetch attendances |
| `/admin/academic/[id]` | Prisma fetch by ID |
| `/admin/users/[id]` | Prisma fetch by ID |
| `/api/auth/[...nextauth]` | Auth API (must be dynamic) |
| `/api/upload` | File upload API (must be dynamic) |

**7 `ƒ` routes ≪ 12 limit ✅**

---

## Implementation Steps

### Step 1: Add Edge Middleware

**[NEW] `middleware.ts`** (project root — `d:\Kerja\PATRA_Digital_Hub\middleware.ts`)

```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/dashboard"],
};
```

This blocks unauthenticated users at the Edge before any page code runs.

---

### Step 2: Convert Admin Layout to Client Auth Guard

**[MODIFY] `app/(admin)/admin/layout.tsx`**

Remove `requireAdmin()`. Wrap children in a client-side `<AdminGuard>`.

```typescript
// BEFORE (async server component → forces ALL children to ƒ)
import { requireAdmin } from "./_lib/require-admin";
export default async function AdminLayout({ children }) {
  const session = await requireAdmin();
  return <SidebarProvider><AdminSidebar user={...} />{children}</SidebarProvider>;
}

// AFTER (sync component → static, children decide their own rendering)
export default function AdminLayout({ children }) {
  return (
    <SidebarProvider style={...}>
      <AdminGuard>{children}</AdminGuard>
    </SidebarProvider>
  );
}
```

**[NEW] `app/(admin)/admin/_components/admin-guard.tsx`**

```typescript
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "./site-header";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && 
        session?.user?.role !== "ADMIN" && 
        session?.user?.role !== "SUPER_ADMIN") {
      router.replace("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <>
        <AdminSidebar user={{ name: "...", email: "", avatar: "", role: "ADMIN" }} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </SidebarInset>
      </>
    );
  }

  if (!session?.user || !["ADMIN","SUPER_ADMIN"].includes(session.user.role)) {
    return null; // middleware already redirected
  }

  const user = {
    name: session.user.name || "Admin",
    email: session.user.email || "",
    avatar: "",
    role: session.user.role,
  };

  return (
    <>
      <AdminSidebar user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
```

---

### Step 3: Create Server Actions for Admin Data

**[NEW] `app/(admin)/admin/_lib/admin-actions.ts`**

All data fetching moves here. Each function validates auth before returning data.

```typescript
"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || !["ADMIN","SUPER_ADMIN"].includes(session.user.role))
    throw new Error("Unauthorized");
  return session;
}

async function requireSuperAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN")
    throw new Error("Unauthorized");
  return session;
}

// ── Dashboard ───────────────────────────────────────────
export async function getAdminDashboardData() {
  const session = await requireAdminSession();
  const [totalUsers, pendingUsers, verifiedUsers, bannedUsers, totalArticles, totalEvents] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { status: "VERIFIED" } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.article.count(),
      prisma.event.count(),
    ]);
  const recentPending = await prisma.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true, emailVerified: true },
  });
  return {
    stats: { totalUsers, pendingUsers, verifiedUsers, bannedUsers, totalArticles, totalEvents },
    recentPending: JSON.parse(JSON.stringify(recentPending)),
    userName: session.user.name,
  };
}

// ── Articles ────────────────────────────────────────────
export async function getAdminArticles(filters: {
  status?: string; category?: string; search?: string; page?: number;
}) {
  await requireAdminSession();
  const { status, category, search, page = 1 } = filters;
  const perPage = 15;
  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { excerpt: { contains: search, mode: "insensitive" } },
  ];
  const [articles, total, stats] = await Promise.all([
    prisma.article.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage,
      select: {
        id: true, title: true, slug: true, excerpt: true, coverImage: true,
        category: true, status: true, views: true, readTime: true,
        publishedAt: true, createdAt: true,
        author: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
    }),
    prisma.article.count({ where }),
    prisma.article.groupBy({ by: ["status"], _count: true }),
  ]);
  return {
    articles: JSON.parse(JSON.stringify(articles)),
    total,
    stats: Object.fromEntries(stats.map(s => [s.status, s._count])),
    totalPages: Math.ceil(total / perPage),
  };
}

// ── Events ──────────────────────────────────────────────
export async function getAdminEvents(filters: {
  search?: string; status?: string; page?: number;
}) {
  await requireAdminSession();
  const { search, status, page = 1 } = filters;
  const perPage = 15;
  const where: any = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } },
  ];
  const [events, total, stats] = await Promise.all([
    prisma.event.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage,
      select: {
        id: true, title: true, slug: true, status: true, locationType: true,
        location: true, startDate: true, endDate: true, maxParticipants: true,
        currentParticipants: true, coverImage: true, publishedAt: true, createdAt: true,
        tags: { select: { tag: { select: { name: true } } } },
        organizer: { select: { name: true } },
      },
    }),
    prisma.event.count({ where }),
    prisma.event.groupBy({ by: ["status"], _count: { id: true } }),
  ]);
  return {
    events: JSON.parse(JSON.stringify(events)),
    total,
    stats: Object.fromEntries(stats.map(s => [s.status, s._count.id])),
    totalPages: Math.ceil(total / perPage),
  };
}

// ── Academic ────────────────────────────────────────────
export async function getAdminAcademic(filters: {
  search?: string; status?: string; type?: string; page?: number;
}) {
  await requireAdminSession();
  const { search, status, type, page = 1 } = filters;
  const perPage = 15;
  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } },
  ];
  const [academics, total, stats] = await Promise.all([
    prisma.academicInfo.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage,
      select: {
        id: true, title: true, slug: true, status: true, type: true,
        deadline: true, coverImage: true, publishedAt: true, createdAt: true,
        tags: { select: { tag: { select: { name: true } } } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.academicInfo.count({ where }),
    prisma.academicInfo.groupBy({ by: ["status"], _count: { id: true } }),
  ]);
  return {
    academics: JSON.parse(JSON.stringify(academics)),
    total,
    stats: Object.fromEntries(stats.map(s => [s.status, s._count.id])),
    totalPages: Math.ceil(total / perPage),
  };
}

// ── Users ───────────────────────────────────────────────
export async function getAdminUsers(filters: {
  status?: string; role?: string; search?: string; page?: number;
}) {
  await requireSuperAdminSession();
  const { status, role, search, page = 1 } = filters;
  const perPage = 15;
  const where: any = {};
  if (status) where.status = status;
  if (role) where.role = role;
  if (search) where.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { nim: { contains: search, mode: "insensitive" } },
  ];
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage,
      select: {
        id: true, name: true, email: true, role: true, status: true,
        emailVerified: true, banned: true, nim: true, generation: true, createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return {
    users: JSON.parse(JSON.stringify(users)),
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

// ── Logs ────────────────────────────────────────────────
export async function getAdminLogs(filters: {
  action?: string; entity?: string; admin?: string; page?: number;
}) {
  await requireAdminSession();
  const { action, entity, admin, page = 1 } = filters;
  const perPage = 25;
  const where: any = {};
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (admin) where.userId = admin;
  const [logs, total, admins, actions] = await Promise.all([
    prisma.adminLog.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.adminLog.count({ where }),
    prisma.adminLog.findMany({
      distinct: ["userId"],
      select: { userId: true, user: { select: { name: true } } },
    }),
    prisma.adminLog.findMany({
      distinct: ["action"], select: { action: true }, orderBy: { action: "asc" },
    }),
  ]);
  return {
    logs: JSON.parse(JSON.stringify(logs)),
    total,
    totalPages: Math.ceil(total / perPage),
    admins: JSON.parse(JSON.stringify(admins)),
    actions: actions.map(a => a.action),
  };
}

// ── Tags (for new pages) ────────────────────────────────
export async function getAvailableTags() {
  await requireAdminSession();
  return prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}
```

---

### Step 4: Convert Each Admin Listing Page

For each of the 6 listing pages + 3 new pages + admin dashboard, the pattern is:

**page.tsx** becomes a thin static shell:
```typescript
import { AdminArticlesClient } from "./_components/admin-articles-client";
export default function ArticlesPage() {
  return <AdminArticlesClient />;
}
```

**_components/admin-*-client.tsx** becomes a `"use client"` component that:
1. Manages filter state with `useState()`
2. Calls the server action on mount and filter changes
3. Renders the existing table/UI with loading states

#### Files to create (10 client components):

| File | Server Action | Based on current page |
|------|--------------|----------------------|
| `admin/_components/admin-dashboard-client.tsx` | `getAdminDashboardData()` | Current `admin/page.tsx` lines 12-179 |
| `admin/articles/_components/admin-articles-client.tsx` | `getAdminArticles()` | Current `admin/articles/page.tsx` lines 7-364 |
| `admin/articles/new/_components/admin-article-new-client.tsx` | `getAvailableTags()` | Current `admin/articles/new/page.tsx` |
| `admin/events/_components/admin-events-client.tsx` | `getAdminEvents()` | Current `admin/events/page.tsx` lines 19-334 |
| `admin/events/new/_components/admin-event-new-client.tsx` | `getAvailableTags()` | Current `admin/events/new/page.tsx` |
| `admin/academic/_components/admin-academic-client.tsx` | `getAdminAcademic()` | Current `admin/academic/page.tsx` lines 13-322 |
| `admin/academic/new/_components/admin-academic-new-client.tsx` | `getAvailableTags()` | Current `admin/academic/new/page.tsx` |
| `admin/users/_components/admin-users-client.tsx` | `getAdminUsers()` | Current `admin/users/page.tsx` lines 6-284 |
| `admin/logs/_components/admin-logs-client.tsx` | `getAdminLogs()` | Current `admin/logs/page.tsx` lines 45-307 |
| `dashboard/_components/dashboard-client.tsx` | N/A (useSession) | Current `dashboard/page.tsx` |

#### Pages to simplify (10 pages):

Each page becomes ~3-5 lines:
```typescript
// Remove: requireAdmin(), prisma imports, searchParams, async
// Keep: just import and render the client component
```

---

### Step 5: Convert Dashboard Page

**[MODIFY] `app/dashboard/page.tsx`**

```typescript
import { DashboardClient } from "./_components/dashboard-client";
export default function UserDashboard() {
  return <DashboardClient />;
}
```

**[NEW] `app/dashboard/_components/dashboard-client.tsx`**

```typescript
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logoutAction } from "@/lib/actions/auth";

export function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!session?.user) return null;

  return (
    // ... existing JSX from current page.tsx, using session.user instead of server session
  );
}
```

---

### Step 6: Remove `requireAdmin()` from remaining [id] pages

Even though `[id]` pages stay `ƒ` (they still have Prisma queries), we **must** remove `requireAdmin()` from them. Why? The admin layout no longer calls `requireAdmin()`, so auth is handled by:
1. Middleware (Edge)
2. AdminGuard (client)

The `[id]` pages keep their Prisma queries but remove the `requireAdmin()` line:

```diff
 export default async function EditArticlePage({ params }) {
-  await requireAdmin();
   const { id } = await params;
   const article = await prisma.article.findUnique({...});
```

Files to modify:
- `admin/articles/[id]/page.tsx` — remove `requireAdmin()` import + call
- `admin/events/[id]/page.tsx` — remove `requireAdmin()` import + call
- `admin/events/[id]/attendances/page.tsx` — remove `requireAdmin()` import + call
- `admin/academic/[id]/page.tsx` — remove `requireAdmin()` import + call
- `admin/users/[id]/page.tsx` — remove `requireSuperAdmin()` import + call

---

## File Summary

| Action | Count | Files |
|--------|-------|-------|
| **NEW** | 12 | `middleware.ts`, `admin-guard.tsx`, `admin-actions.ts`, 9 client components |
| **MODIFY (rewrite)** | 10 | 6 listing pages, 3 new pages, dashboard page |
| **MODIFY (remove auth)** | 6 | admin layout, 5 `[id]` pages |
| **Total** | **28** | |

---

## Expected Build Output

```
○ /admin                → static (was ƒ)
○ /admin/articles       → static (was ƒ)
○ /admin/articles/new   → static (was ƒ)
○ /admin/events         → static (was ƒ)
○ /admin/events/new     → static (was ƒ)
○ /admin/academic       → static (was ƒ)
○ /admin/academic/new   → static (was ƒ)
○ /admin/logs           → static (was ƒ)
○ /admin/users          → static (was ƒ)
○ /dashboard            → static (was ƒ)
ƒ /admin/articles/[id]  → still dynamic (Prisma by ID)
ƒ /admin/events/[id]    → still dynamic
ƒ /admin/events/[id]/attendances → still dynamic
ƒ /admin/academic/[id]  → still dynamic
ƒ /admin/users/[id]     → still dynamic
ƒ /api/auth/[...nextauth] → API
ƒ /api/upload           → API
Total ƒ: 7 ✅
```

---

## Security Model (3 Layers)

| Layer | What it does | When it runs |
|-------|-------------|-------------|
| `middleware.ts` | Blocks unauthenticated users on `/admin/*` and `/dashboard` | Before ANY page code |
| `<AdminGuard>` | Checks role (ADMIN/SUPER_ADMIN), redirects if wrong | On page load (client) |
| Server Actions | Each action calls `auth()` + role check before returning data | On every data request |

---

## Verification

```bash
# 1. Build — verify ƒ count
bun run build

# 2. Deploy — must pass
npx vercel deploy

# 3. Test admin panel
# - Login as admin → verify guard works
# - Navigate all admin pages → verify data loads
# - Create/edit/delete content → verify server actions work
# - Filter/paginate → verify client-side filtering
```
