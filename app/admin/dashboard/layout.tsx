import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <AdminSidebar adminName={admin.name} />
          </aside>
          <div className="lg:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
