import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Verotides Coastal Intelligence Hub',
  description: 'Privacy Policy and Cookie Disclosure for Verotides.com. Learn how we collect data, use cookies, and comply with GDPR/AdSense guidelines.',
  keywords: 'Verotides privacy policy, cookies disclosure, GDPR consent, Google AdSense privacy, coastal utility privacy, Vero Beach',
  alternates: { canonical: 'https://verotides.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8 font-mono text-white/80 leading-relaxed text-sm">
      <h1 className="text-3xl md:text-5xl font-black glow-text tracking-tighter italic mb-4 uppercase text-white">
        Privacy Policy
      </h1>
      <p className="text-xs text-white/40 uppercase tracking-widest mb-8 border-b-2 border-primary/20 pb-4">
        Last Updated: May 2026 · Verotides Intelligence Node
      </p>

      <div className="flex flex-col gap-6 max-w-4xl">
        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">&gt; 01_OVERVIEW</h2>
          <p>
            Verotides (verotides.com) operates as a hyper-local coastal utilities dashboard and marine intelligence resource for Vero Beach, FL. This privacy policy explains what data we collect, how we use cookies, and how we comply with advertising regulations (including Google AdSense) and regional privacy laws (GDPR, UK GDPR, and CCPA).
          </p>
        </section>

        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">&gt; 02_DATA_COLLECTION</h2>
          <p className="mb-3">
            To deliver real-time tide reports, weather forecasts, and vessel tracking, we may log the following automated information:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li><strong>Device Logs:</strong> IP addresses, browser types, referrer pages, and timestamps are captured to optimize network traffic.</li>
            <li><strong>Local Storage:</strong> Used to save UI preferences, grid coordinates, and node selection locally on your device.</li>
            <li><strong>Analytics:</strong> We use Vercel Analytics, Speed Insights, and Google Analytics to monitor server load and site performance.</li>
          </ul>
        </section>

        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">&gt; 03_ADSENSE_DISCLOSURES</h2>
          <p className="mb-3">
            We display advertisements served through Google AdSense. Google, as a third-party vendor, uses cookies to serve ads on this website:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2 mb-4">
            <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visits to this site and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://settings.google.com/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</li>
          </ul>
          <p>
            By using a Google-certified Consent Management Platform (CMP) on this site, we obtain necessary user consent for the use of cookies and personalization in accordance with Google&apos;s user consent policies.
          </p>
        </section>

        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">&gt; 04_GDPR_UK_EUROPE</h2>
          <p className="mb-3">
            If you access this site from the European Economic Area (EEA), United Kingdom, or Switzerland, you are protected by the General Data Protection Regulation (GDPR) and UK GDPR:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>You have the right to consent, refuse consent, or manage options regarding cookies and personalized tracking via the on-screen Consent Message (CMP) pop-up.</li>
            <li>You have the right to request access, rectification, or erasure of any automated analytics data gathered during your session.</li>
            <li>You can change your consent selections at any time by clearing your browser cookies and reloading the site to re-initialize the CMP selector.</li>
          </ul>
        </section>

        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">&gt; 05_COOKIE_SENTRY</h2>
          <p>
            This site implements the **CookieSentry** tracking tool to save cookie preferences. Your session-consent parameters are stored in a local cookie for up to 400 days to prevent repeated pop-up interruptions, in compliance with standard cookie duration guidelines.
          </p>
        </section>

        <section className="terminal-box p-6 rounded-xl border border-primary/20 bg-black/60">
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-3">&gt; 06_CONTACT</h2>
          <p>
            For questions regarding this privacy policy or to discuss site monetization, contact: <a href="mailto:ads@verotides.com" className="text-primary hover:underline">ads@verotides.com</a>.
          </p>
        </section>
      </div>

      <p className="text-[10px] text-white/30 uppercase mt-8">
        Verotides Operations Hub · Vero Beach, Florida 32963
      </p>
    </main>
  );
}
