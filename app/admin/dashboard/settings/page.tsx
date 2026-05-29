import { getAdminFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const admin = await getAdminFromCookies();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Settings</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Account</h1>
      </header>

      <div className="rounded-3xl border border-border bg-surface/60 p-6 md:p-8">
        <h2 className="font-serif text-xl font-semibold">Profile</h2>
        <dl className="mt-6 divide-y divide-border">
          <Row label="Name" value={admin?.name || "—"} />
          <Row label="Email" value={admin?.email || "—"} />
          <Row label="Role" value={admin?.role || "—"} />
        </dl>
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 p-6 md:p-8">
        <h2 className="font-serif text-xl font-semibold">Site</h2>
        <dl className="mt-6 divide-y divide-border">
          <Row label="Site URL" value={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} />
          <Row label="Database" value={process.env.MONGODB_URI ? "Connected" : "Sample data fallback"} />
        </dl>
        <p className="mt-6 text-xs text-muted">
          Settings are read from environment variables. Edit your <code>.env.local</code> to change them.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
