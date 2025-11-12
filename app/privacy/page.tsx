// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-zinc-800">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Last updated: November 11, 2025
              </p>
            </div>
            
            <div className="mt-10 space-y-8 text-sm leading-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  1. Overview
                </h2>
                <p className="mt-3">
                  This Privacy Policy explains how Berkeley Events ("we", "our", "us") collects, uses, and
                  shares information when you use the Service. By using the Service, you agree to this Policy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  2. Information We Collect
                </h2>
                <ul className="mt-3 list-inside list-disc space-y-2">
                  <li>
                    <strong>Account Info:</strong> name,{" "}
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono dark:bg-zinc-700">
                      .edu
                    </code>{" "}
                    email, profile photo (optional).
                  </li>
                  <li><strong>Content:</strong> posts you create (title, description, images, time/location).</li>
                  <li><strong>Usage:</strong> interactions like likes/saves, basic device and log information.</li>
                  <li><strong>Cookies/Local Storage:</strong> used to keep you signed in and remember preferences (e.g., theme).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  3. How We Use Information
                </h2>
                <ul className="mt-3 list-inside list-disc space-y-2">
                  <li>Provide, maintain, and improve the Service.</li>
                  <li>Recommend and surface relevant posts to you.</li>
                  <li>Prevent abuse and ensure safety and integrity.</li>
                  <li>Communicate with you about updates or support.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  4. How We Share Information
                </h2>
                <ul className="mt-3 list-inside list-disc space-y-2">
                  <li>
                    <strong>Service Providers:</strong> we use third parties (e.g., hosting, analytics, storage)
                    to operate the Service. They may process data on our behalf under confidentiality obligations.
                  </li>
                  <li>
                    <strong>Legal:</strong> we may disclose information if required by law or to protect rights, safety,
                    and the integrity of the Service.
                  </li>
                  <li>
                    <strong>Public Content:</strong> posts you publish may be visible to other users.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  5. Data Retention
                </h2>
                <p className="mt-3">
                  We retain information for as long as your account is active or as needed to operate the Service.
                  You can delete your account in settings; some logs may persist for a limited period for security,
                  backup, or legal reasons.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  6. Your Choices
                </h2>
                <ul className="mt-3 list-inside list-disc space-y-2">
                  <li>Access, edit, or delete your profile and posts.</li>
                  <li>Control theme and certain preferences in settings.</li>
                  <li>Contact us for questions about your data.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  7. Children's Privacy
                </h2>
                <p className="mt-3">
                  The Service is not directed to children under 13. If you believe a child has provided personal
                  information, contact us to remove it.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  8. Security
                </h2>
                <p className="mt-3">
                  We use reasonable safeguards to protect information. No method of transmission or storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  9. Changes to This Policy
                </h2>
                <p className="mt-3">
                  We may update this Policy from time to time. If we make material changes, we will provide notice.
                  Your continued use means you accept the updated Policy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  10. Contact
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