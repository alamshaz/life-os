import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen md:flex">
      <Sidebar userName={session.user.name} />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
