import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Root page — redirects logged-in users to their role-specific dashboard.
 * Non-logged-in users are redirected to /login by middleware.
 */
export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    redirect("/admin");
  }

  // Regular users and guests go to user dashboard
  redirect("/dashboard");
}
