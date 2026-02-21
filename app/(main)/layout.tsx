export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar will be added in Phase 3 */}
      <main className="flex-1">{children}</main>
      {/* Footer will be added in Phase 3 */}
    </div>
  );
}
