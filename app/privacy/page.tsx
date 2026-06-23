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
      <p className="mt-4 text-sm text-muted">Last updated: June 2026</p>

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
          comment. We never sell or rent your data.
        </p>

        <h2>Cookies</h2>
        <p>
          We use first-party cookies for authentication (admin) and theme
          preference (dark/light mode). In addition, third-party vendors —
          including Google — use cookies to serve ads on this site (see
          Advertising below).
        </p>

        <h2>Advertising</h2>
        <p>
          Trending Vichaar displays ads served by Google AdSense. Third-party
          vendors, including Google, use cookies to serve ads based on your
          prior visits to this and other websites.
        </p>
        <p>
          Google&apos;s use of advertising cookies enables it and its partners
          to serve ads to you based on your visits to this site and/or other
          sites on the Internet. You may opt out of personalised advertising by
          visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          . You can also opt out of a third-party vendor&apos;s use of cookies
          for personalised advertising by visiting{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info
          </a>
          . For more information on how Google uses data when you use our
          partners&apos; sites or apps, see{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s Privacy &amp; Terms
          </a>
          .
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
