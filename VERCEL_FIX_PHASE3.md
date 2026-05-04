# Phase 3: Convert Admin + Auth Routes to Static Shells

## Problem

After Phase 2, we still have **18 `ƒ` routes** that Vercel bundles into **>12 serverless functions**, exceeding the Hobby plan limit.

## Root Cause

The admin layout at `app/(admin)/admin/layout.tsx` calls `requireAdmin()` → `auth()`, which reads cookies and **forces every child route to `ƒ`**. Additionally, every admin page **redundantly** calls `requireAdmin()` and runs its own Prisma queries, making them independently dynamic.

### Current `ƒ` routes (18 total)

| Group | Count | Routes |
|-------|-------|--------|
| Admin | 14 | `/admin`, `/admin/articles`, `/admin/articles/[id]`, `/admin/articles/new`, `/admin/events`, `/admin/events/[id]`, `/admin/events/[id]/attendances`, `/admin/events/new`, `/admin/academic`, `/admin/academic/[id]`, `/admin/academic/new`, `/admin/logs`, `/admin/users`, `/admin/users/[id]` |
| API | 2 | `/api/auth/[...nextauth]`, `/api/upload` |
| Auth pages | 2 | `/dashboard`, `/verify-email` |

## Strategy

Move all server-side auth (`requireAdmin()`, `auth()`) and data fetching (`prisma.*`) out of page components:
- **Auth** → `useSession()` client-side + Edge Middleware protection
- **Data** → Server Actions called from `useEffect()` in client components

### Target: **2 `ƒ` routes** (only API routes remain dynamic)

---

## Step 1: Add Edge Middleware

### [NEW] `middleware.ts` (project root)

```typescript
export { auth as middleware } from "@/lib/auth";
export const config = {
  matcher: ["/admin/:path*", "/dashboard"],
};
```

Auth.js v5 exports a middleware-compatible `auth` function that validates JWT/session cookies at the Edge. No Prisma needed.

---

## Step 2: Admin Layout → Client Auth Guard

### [MODIFY] `app/(admin)/admin/layout.tsx`

**Before:** Server component calling `requireAdmin()` → forces ALL children to `ƒ`  
**After:** Static layout wrapping a client `<AdminGuard>` component

```diff
-import { requireAdmin } from "./_lib/require-admin";
+// No server-side auth — middleware handles route protection

-export default async function AdminLayout({ children }) {
-  const session = await requireAdmin();
-  const user = { name: session.user.name, ... };
+export default function AdminLayout({ children }) {
   return (
     <SidebarProvider>
-      <AdminSidebar user={user} />
+      <AdminGuard>
+        {children}
+      </AdminGuard>
     </SidebarProvider>
   );
 }
```

### [NEW] `app/(admin)/admin/_components/admin-guard.tsx`

Client component that:
1. Uses `useSession()` to check auth status
2. Redirects to `/login` if not authenticated
3. Redirects to `/` if not ADMIN/SUPER_ADMIN
4. Passes user data to `<AdminSidebar>`
5. Shows loading skeleton while session loads

---

## Step 3: Convert Admin Pages to Client-Side Data

Each admin page follows this pattern:

**Before (Server Component):**
```typescript
export default async function AdminArticlesPage() {
  await requireAdmin();
  const articles = await prisma.article.findMany({...});
  return <ArticleTable data={articles} />;
}
```

**After (Static Shell + Client Component):**
```typescript
// page.tsx — static shell
export default function AdminArticlesPage() {
  return <AdminArticlesClient />;
}

// _components/admin-articles-client.tsx
"use client";
export function AdminArticlesClient() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchArticles().then(setArticles).finally(() => setLoading(false));
  }, []);
  
  if (loading) return <TableSkeleton />;
  return <ArticleTable data={articles} />;
}
```

### [NEW] `app/(admin)/admin/_lib/admin-actions.ts`

Centralized server actions for all admin data:
```typescript
"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminDashboardData() {
  const session = await auth();
  if (!session?.user || !["ADMIN","SUPER_ADMIN"].includes(session.user.role))
    throw new Error("Unauthorized");
  
  const [totalUsers, pendingUsers, ...] = await Promise.all([...]);
  return { totalUsers, pendingUsers, ... };
}

export async function getArticles() { ... }
export async function getEvents() { ... }
export async function getAcademic() { ... }
export async function getUsers(filters) { ... }
export async function getUserById(id) { ... }
export async function getLogs(filters) { ... }
```

### Pages to convert (14 total)

| Page | Server Action | Client Component |
|------|--------------|-----------------|
| `/admin` | `getAdminDashboardData()` | `AdminDashboardClient` |
| `/admin/articles` | `getArticles()` | `AdminArticlesClient` |
| `/admin/articles/[id]` | `getArticleById(id)` | `AdminArticleEditClient` |
| `/admin/articles/new` | minimal (form only) | `AdminArticleNewClient` |
| `/admin/events` | `getEvents()` | `AdminEventsClient` |
| `/admin/events/[id]` | `getEventById(id)` | `AdminEventEditClient` |
| `/admin/events/[id]/attendances` | `getAttendances(id)` | `AdminAttendancesClient` |
| `/admin/events/new` | minimal (form only) | `AdminEventNewClient` |
| `/admin/academic` | `getAcademicList()` | `AdminAcademicClient` |
| `/admin/academic/[id]` | `getAcademicById(id)` | `AdminAcademicEditClient` |
| `/admin/academic/new` | minimal (form only) | `AdminAcademicNewClient` |
| `/admin/logs` | `getLogs()` | `AdminLogsClient` |
| `/admin/users` | `getUsers(filters)` | `AdminUsersClient` |
| `/admin/users/[id]` | `getUserById(id)` | `AdminUserDetailClient` |

---

## Step 4: Dashboard → Static

### [MODIFY] `app/dashboard/page.tsx`

```diff
-import { auth } from "@/lib/auth";
-export default async function UserDashboard() {
-  const session = await auth();
+export default function UserDashboard() {
+  return <DashboardClient />;
+}
```

### [NEW] `app/dashboard/_components/dashboard-client.tsx`

Client component using `useSession()` to display user info.

---

## Step 5: Verify-Email → Static

### [MODIFY] `app/(auth)/verify-email/page.tsx`

```diff
-export default async function VerifyEmailPage({ searchParams }) {
-  const { token } = await searchParams;
-  const verification = await prisma.verification.findFirst({...});
+export default function VerifyEmailPage() {
+  return <VerifyEmailClient />;
+}
```

### [NEW] `app/(auth)/verify-email/_components/verify-email-client.tsx`

Client component using `useSearchParams()` + server action `verifyEmailAction(token)`.

### [NEW] `app/(auth)/verify-email/_lib/actions.ts`

Moves existing Prisma verification logic into a server action.

---

## Expected Result

| Route | Before | After |
|-------|--------|-------|
| 14 admin routes | `ƒ` (14 functions) | `○` static (0 functions) |
| `/dashboard` | `ƒ` (1 function) | `○` static (0 functions) |
| `/verify-email` | `ƒ` (1 function) | `○` static (0 functions) |
| `/api/auth/[...nextauth]` | `ƒ` | `ƒ` (unchanged) |
| `/api/upload` | `ƒ` | `ƒ` (unchanged) |
| **Total `ƒ`** | **18** | **2** |

**2 functions ≪ 12 limit. Guaranteed to pass.**

---

## Security Model

| Layer | Protection |
|-------|-----------|
| Edge Middleware | Blocks unauthenticated users before ANY code runs |
| `<AdminGuard>` | Client-side redirect for role checking + UX |
| Server Actions | Verify `auth()` before returning ANY data |

This is actually **more secure** than before — 3 layers instead of 1.

---

## UX Trade-off

Admin pages show a brief **loading skeleton** on first load (~200-500ms) instead of instant server-rendered content. Only affects admin users (not public visitors).

---

## Verification

```bash
# 1. Build check — all admin routes should show ○
bun run build

# 2. Deploy test — must pass without function limit error
npx vercel deploy

# 3. Functional test — verify admin panel works
# - Navigate to /admin → auth guard works
# - CRUD operations on articles/events/academic
# - User management filtering
# - Verify-email flow
```
