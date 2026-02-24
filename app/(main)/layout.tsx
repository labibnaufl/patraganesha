import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 w-full flex flex-col items-center">
        {children}
      </main>
      <MainFooter />
    </div>
  );
}
