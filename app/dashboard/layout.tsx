import { DashboardNav } from "@/components/dashboard-nav";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="dashboard-bg flex min-h-screen flex-col lg:flex-row">
      <DashboardNav userName={session.name} />
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
