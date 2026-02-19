import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 pt-20 lg:p-8 lg:pt-8 transition-all">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
