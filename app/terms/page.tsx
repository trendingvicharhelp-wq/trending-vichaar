import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms under which you can use Trending Vichaar.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-20 lg:py-28">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">Legal</p>
      <h1 className="mt-4 font-serif text-display-xl">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted">Last updated: May 2026</p>

      <div className="prose-vichaar mt-12">
        <h2>Use of the site</h2>
        <p>
          You may read, share and link to articles freely. Republishing in
          full requires our written permission. Commercial use of our
          content without a license is not allowed.
        </p>

        <h2>Comments</h2>
        <p>
          Be civil. Stay on topic. No spam or harassment. We reserve the
          right to remove comments at our discretion.
        </p>

        <h2>Disclaimer</h2>
        <p>
          Articles are written in good faith but reflect the personal views
          of the author at time of publication. Tools and services we
          mention may change or disappear — please verify before relying on
          them.
        </p>

        <h2>Contact</h2>
        <p>
          For anything terms-related, write to{" "}
          <a href="mailto:legal@trendingvichaar.com">legal@trendingvichaar.com</a>.
        </p>
      </div>
    </div>
  );
}
