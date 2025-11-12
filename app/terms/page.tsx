// app/terms/page.tsx
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-zinc-800">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Terms of Service
              </h1>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Last updated: November 11, 2025
              </p>
            </div>
            
            <div className="mt-10 space-y-8 text-sm leading-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  1. Acceptance of Terms
                </h2>
                <p className="mt-3">
                  By accessing or using Berkeley Events (the "Service"), you agree to these Terms of Service
                  ("Terms"). If you do not agree, do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  2. Eligibility
                </h2>
                <p className="mt-3">
                  The Service is intended for students and collaborators. You must create an account with a
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono dark:bg-zinc-700">
                    .edu
                  </code> email address and be legally able to enter into these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  3. Accounts
                </h2>
                <p className="mt-3">
                  You are responsible for your account activity and for maintaining the confidentiality of your
                  login credentials. Notify us promptly of any unauthorized use.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  4. User Content
                </h2>
                <p className="mt-3">
                  You may post events, opportunities, and related materials ("Content"). You retain ownership of
                  your Content, but grant us a non-exclusive, worldwide, royalty-free license to host, display,
                  and distribute your Content solely to operate and improve the Service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  5. Prohibited Conduct
                </h2>
                <ul className="mt-3 list-inside list-disc space-y-2">
                  <li>Posting unlawful, infringing, or misleading content.</li>
                  <li>Harassing others or violating privacy rights.</li>
                  <li>Attempting to access accounts, data, or systems without authorization.</li>
                  <li>Uploading malware or interfering with the Service's operation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  6. Intellectual Property
                </h2>
                <p className="mt-3">
                  The Service, including its design, software, and branding, is owned by us or our licensors.
                  Except as expressly allowed, you may not copy, modify, or create derivative works of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  7. Disclaimers
                </h2>
                <p className="mt-3">
                  The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy,
                  availability, or reliability of any content, events, or recommendations.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  8. Limitation of Liability
                </h2>
                <p className="mt-3">
                  To the fullest extent permitted by law, we are not liable for any indirect, incidental, special,
                  consequential, or punitive damages, or any loss of data, use, or goodwill.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  9. Termination
                </h2>
                <p className="mt-3">
                  We may suspend or terminate access to the Service at any time if you violate these Terms or if
                  we discontinue the Service. You may delete your account at any time.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  10. Changes to Terms
                </h2>
                <p className="mt-3">
                  We may update these Terms from time to time. If we make material changes, we will provide notice
                  (for example, via the app). Your continued use after changes means you accept the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  11. Governing Law
                </h2>
                <p className="mt-3">
                  These Terms are governed by the laws of California, without regard to conflict of laws rules.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  12. Contact
                </h2>
                <p className="mt-3">
                  Questions? Contact us at{" "}
                  <a 
                    href="mailto:support@berkeley-events.example" 
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    support@berkeley-events.example
                  </a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}