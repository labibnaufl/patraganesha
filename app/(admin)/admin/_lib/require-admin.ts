import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Require admin access in server components.
 * Allows both SUPER_ADMIN and ADMIN.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

/**
 * Require SUPER_ADMIN access only.
 * Regular admins are redirected to the admin dashboard.
 */
export async function requireSuperAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return session;
}
