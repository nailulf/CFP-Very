import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — TemanTumbuh',
  description: 'Privacy Policy for temantumbuh.com — how we collect, use, and protect your information.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'June 1, 2026';
  const siteName = 'Teman Tumbuh';
  const siteUrl = 'https://temantumbuh.com';
  const contactEmail = 'adityacleverina@gmail.com';

  return (
    <div className="min-h-screen bg-[#F0F7FA] pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[1.5px] text-[#4F9DA6] mb-4" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
            Legal
          </span>
          <h1 className="text-[40px] font-extrabold text-[#153A56] leading-[1.15] tracking-[-1px] mb-3">
            Privacy Policy
          </h1>
          <p className="text-[15px] text-[#666666]">Last updated: {lastUpdated}</p>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 sm:p-10 space-y-8">

          <section>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Welcome to {siteName} (&quot;<strong>{siteUrl}</strong>&quot;). Your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your information when you visit our website.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">1. Information We Collect</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#1A1918] leading-[1.7]">
              <li><strong>Information you provide voluntarily</strong> — such as your name and email address when you fill out a contact form, subscribe to a newsletter, or request a consultation.</li>
              <li><strong>Usage data</strong> — such as your IP address, browser type, pages visited, time spent on pages, and referring URLs, collected automatically when you visit our site.</li>
              <li><strong>Cookies and tracking data</strong> — small data files placed on your device by our site and third-party services (see Section 4).</li>
            </ul>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">2. How We Use Your Information</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">We use the information collected for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#1A1918] leading-[1.7]">
              <li>To respond to your inquiries and provide the services you requested.</li>
              <li>To send newsletters or updates you have opted into (you may unsubscribe at any time).</li>
              <li>To improve and optimize the website experience.</li>
              <li>To analyze website traffic and user behavior via analytics tools.</li>
              <li>To serve relevant advertisements through third-party advertising networks.</li>
            </ul>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">3. Sharing of Information</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist in operating our website (e.g., hosting, analytics, email delivery) under strict confidentiality agreements. We may also disclose information when required by law.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">4. Cookies and Third-Party Advertising</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              We use cookies to enhance your experience. Cookies are small text files stored on your device. You can instruct your browser to refuse cookies, though some parts of the site may not function correctly without them.
            </p>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              We use <strong>Google AdSense</strong> to display advertisements on this website. Google, as a third-party vendor, uses cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.
            </p>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              You may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors"
              >
                Google Ads Settings
              </a>
              {' '}or{' '}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors"
              >
                www.aboutads.info
              </a>
              .
            </p>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              We also use <strong>Google Analytics</strong> to understand how visitors interact with our website. Google Analytics collects data such as pages visited, time on site, and general geographic location. This data is anonymous and does not identify individual users. For more information, visit{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors"
              >
                Google Privacy Policy
              </a>
              .
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">5. Data Retention</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">6. Your Rights</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#1A1918] leading-[1.7]">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Withdraw consent for data processing at any time.</li>
              <li>Lodge a complaint with a relevant data protection authority.</li>
            </ul>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              To exercise any of these rights, please contact us at{' '}
              <a href={`mailto:${contactEmail}`} className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors">
                {contactEmail}
              </a>
              .
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">7. Third-Party Links</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies independently.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">8. Children&apos;s Privacy</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              This website is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">9. Changes to This Policy</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. We encourage you to review this page periodically.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">10. Contact Us</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-[#F0F7FA] rounded-xl p-5 text-[15px] text-[#1A1918] leading-[1.8]">
              <strong>{siteName}</strong><br />
              Email:{' '}
              <a href={`mailto:${contactEmail}`} className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors">
                {contactEmail}
              </a><br />
              Website:{' '}
              <a href={siteUrl} className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors">
                {siteUrl}
              </a>
            </div>
          </section>

        </div>

        {/* Back link */}
        <div className="mt-8 flex items-center gap-4 text-[14px]">
          <Link href="/" className="text-[#205781] hover:text-[#4F9DA6] transition-colors">
            ← Back to Home
          </Link>
          <span className="text-[#E0EBF5]">|</span>
          <Link href="/kebijakan-privasi" className="text-[#205781] hover:text-[#4F9DA6] transition-colors">
            Baca dalam Bahasa Indonesia
          </Link>
        </div>

      </div>
    </div>
  );
}
