import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Admin · Sign in",
  description: "Sign in to the Trending Vichaar admin dashboard.",
};

export default async function AdminLoginPage() {
  const admin = await getAdminFromCookies();
  if (admin) redirect("/admin/dashboard");

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-20">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-12 rounded-3xl border border-border bg-surface/60 p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Admin access
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to publish, edit and manage Trending Vichaar.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Lost your password? Reset it from the server console.
        </p>
      </div>
    </div>
  );
}
