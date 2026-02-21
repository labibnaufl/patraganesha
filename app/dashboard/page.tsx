import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

export default async function UserDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-heading text-foreground tracking-wide">
              PATRA Digital Hub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {session.user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.user.email}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-accent transition-colors"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold font-heading text-foreground">
            Selamat Datang, {session.user.name}!
          </h2>
          <p className="text-muted-foreground mt-2">
            Dashboard pengguna sedang dalam pengembangan.
          </p>
          <div className="mt-4 inline-flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              {session.user.role}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {session.user.status}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
