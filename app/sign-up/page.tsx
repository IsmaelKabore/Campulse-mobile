// app/sign-up/page.tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/src/firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

function isEduEmail(email: string) {
  const m = email.trim().toLowerCase().match(/^[^@]+@([^@]+)$/);
  const domain = m?.[1] || "";
  return domain.endsWith(".edu");
}

export default function SignUpPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!isEduEmail(email)) {
      setErr("Please sign up with a .edu email address.");
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
      });

      router.push(`/profile/${cred.user.uid}`);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-semibold">Create account</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-800">First name</label>
            <input
              required
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              autoComplete="given-name"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Alex"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-800">Last name</label>
            <input
              required
              value={last}
              onChange={(e) => setLast(e.target.value)}
              autoComplete="family-name"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Chen"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-800">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="you@anycampus.edu"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-800">Password</label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="At least 6 characters"
            minLength={6}
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </main>
  );
}
