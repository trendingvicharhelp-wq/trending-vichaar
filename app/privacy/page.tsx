import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Trending Vichaar collects and uses your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-20 lg:py-28">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">Legal</p>
      <h1 className="mt-4 font-serif text-display-xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted">Last updated: May 2026</p>

      <div className="prose-vichaar mt-12">
        <h2>What we collect</h2>
        <p>
          Trending Vichaar collects the minimum information needed to operate
          the site: your email address when you subscribe to the newsletter,
          your name and email when you post a comment, and standard request
          logs (IP address, user agent, timestamp) for security and analytics.
        </p>

        <h2>How we use it</h2>
        <p>
          We use your email solely to deliver the newsletter or reply to your
          comment. We never sell or rent your data. We do not use third-party
          ad networks that profile you across sites.
        </p>

        <h2>Cookies</h2>
        <p>
          We use a small number of first-party cookies for authentication
          (admin) and theme preference (dark/light mode). No tracking cookies.
        </p>

        <h2>Your rights</h2>
        <p>
          You can request deletion of your data at any time by emailing{" "}
          <a href="mailto:hello@trendingvichaar.com">hello@trendingvichaar.com</a>.
          We'll honour the request within 30 days.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy. Material changes will be announced on
          the homepage and noted at the top of this page.
        </p>
      </div>
    </div>
  );
}
