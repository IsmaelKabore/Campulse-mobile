// app/sign-up/page.tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/src/firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

function isBerkeleyEmail(email: string) {
  const m = email.trim().toLowerCase().match(/^[^@]+@([^@]+)$/);
  const domain = m?.[1] || "";
  return domain === "berkeley.edu";
}

const POLICIES_VERSION = "2025-11-11";

// Modal Component for Terms and Privacy
function PolicyModal({
  type,
  isOpen,
  onClose,
}: {
  type: "terms" | "privacy";
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const content = type === "terms" ? {
    title: "Terms of Service",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: "By accessing or using Berkeley Events (the 'Service'), you agree to these Terms of Service ('Terms'). If you do not agree, do not use the Service."
      },
      {
        title: "2. Eligibility", 
        content: "The Service is intended for UC Berkeley students and collaborators. You must create an account with a berkeley.edu email address and be legally able to enter into these Terms."
      },
      {
        title: "3. Accounts",
        content: "You are responsible for your account activity and for maintaining the confidentiality of your login credentials. Notify us promptly of any unauthorized use."
      },
      {
        title: "4. User Content",
        content: "You may post events, opportunities, and related materials ('Content'). You retain ownership of your Content, but grant us a non-exclusive, worldwide, royalty-free license to host, display, and distribute your Content solely to operate and improve the Service."
      },
      {
        title: "5. Prohibited Conduct",
        content: "• Posting unlawful, infringing, or misleading content.\n• Harassing others or violating privacy rights.\n• Attempting to access accounts, data, or systems without authorization.\n• Uploading malware or interfering with the Service's operation."
      }
    ]
  } : {
    title: "Privacy Policy", 
    sections: [
      {
        title: "1. Overview",
        content: "This Privacy Policy explains how Berkeley Events ('we', 'our', 'us') collects, uses, and shares information when you use the Service. By using the Service, you agree to this Policy."
      },
      {
        title: "2. Information We Collect",
        content: "• Account Info: name, berkeley.edu email, profile photo (optional).\n• Content: posts you create (title, description, images, time/location).\n• Usage: interactions like likes/saves, basic device and log information.\n• Cookies/Local Storage: used to keep you signed in and remember preferences."
      },
      {
        title: "3. How We Use Information", 
        content: "• Provide, maintain, and improve the Service.\n• Recommend and surface relevant posts to you.\n• Prevent abuse and ensure safety and integrity.\n• Communicate with you about updates or support."
      },
      {
        title: "4. How We Share Information",
        content: "• Service Providers: we use third parties (e.g., hosting, analytics, storage) to operate the Service.\n• Legal: we may disclose information if required by law or to protect rights, safety, and the integrity of the Service.\n• Public Content: posts you publish may be visible to other users."
      },
      {
        title: "5. Your Choices",
        content: "• Access, edit, or delete your profile and posts.\n• Control theme and certain preferences in settings.\n• Contact us for questions about your data."
      }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {content.title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-700 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Last updated: November 11, 2025
          </p>
          <div className="space-y-6">
            {content.sections.map((section, index) => (
              <div key={index}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-zinc-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState<"terms" | "privacy" | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!isBerkeleyEmail(email)) {
      setErr("Please sign up with a berkeley.edu email address.");
      return;
    }
    if (!agree) {
      setErr("You must agree to the Terms and Privacy Policy to create an account.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);

      await updateProfile(cred.user, {
        displayName: [first, last].filter(Boolean).join(" "),
      });

      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: first.trim(),
        lastName: last.trim(),
        email: cred.user.email,
        photoURL: cred.user.photoURL ?? null,
        bio: "",
        createdAt: serverTimestamp(),
        acceptedPolicies: {
          terms: true,
          privacy: true,
          version: POLICIES_VERSION,
          acceptedAt: serverTimestamp(),
        },
      });

      router.push(`/profile/${cred.user.uid}`);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center p-6 bg-white dark:bg-zinc-900 dark:text-zinc-100">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Create account</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">First name</label>
            <input
              required
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              autoComplete="given-name"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              placeholder="Alex"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Last name</label>
            <input
              required
              value={last}
              onChange={(e) => setLast(e.target.value)}
              autoComplete="family-name"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              placeholder="Chen"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Berkeley Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            placeholder="you@berkeley.edu"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Password</label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            placeholder="At least 6 characters"
            minLength={6}
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            required
          />
          <span className="text-zinc-600 dark:text-zinc-400">
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowModal("terms")}
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2 dark:text-blue-400"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => setShowModal("privacy")}
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2 dark:text-blue-400"
            >
              Privacy Policy
            </button>
            .
          </span>
        </label>

        {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline underline-offset-4">
          Sign in
        </Link>
      </p>

      {/* Policy Modals */}
      <PolicyModal
        type="terms"
        isOpen={showModal === "terms"}
        onClose={() => setShowModal(null)}
      />
      <PolicyModal
        type="privacy"
        isOpen={showModal === "privacy"}
        onClose={() => setShowModal(null)}
      />
    </main>
  );
}
