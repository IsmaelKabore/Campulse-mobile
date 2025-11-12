// app/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

function isEduEmail(email: string) {
  const m = email.trim().toLowerCase().match(/^[^@]+@([^@]+)$/);
  const domain = m?.[1] || "";
  return domain.endsWith(".edu");
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!isEduEmail(email)) {
      setErr("Please use a .edu email address.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
      router.push("/events");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center p-6 /* dark:text-zinc-100 */">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 /* dark:border-zinc-700 */ bg-white /* dark:bg-zinc-800 */ p-5 shadow-sm"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            placeholder="you@anycampus.edu"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            placeholder="••••••••"
          />
        </div>

        {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Don't have an account?{" "}
        <Link href="/sign-up" className="font-medium underline underline-offset-4">
          Create one
        </Link>
      </p>
    </main>
  );
}
