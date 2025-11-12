// app/saved/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "../components/RequireAuth";

type SavedDoc = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  time?: string;
};

const SAVED_MAP_KEY = "berkeley-events:saved"; // id -> SavedDoc

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedDoc[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_MAP_KEY);
      const obj = raw ? (JSON.parse(raw) as Record<string, SavedDoc>) : {};
      setSaved(Object.values(obj));
    } catch {
      setSaved([]);
    }
  }, []);

  return (
    <RequireAuth blockWhenSignedOut={true} redirectTo="/login">
      <div className="min-h-screen dark:bg-zinc-900 dark:text-zinc-100">
        <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-black/10 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/70">
          <Link href="/events" className="rounded-md px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800">
            ← Home
          </Link>
          <div className="font-semibold">Saved</div>
          <div className="w-16" />
        </div>

        <main className="mx-auto max-w-3xl space-y-3 p-4">
          {saved.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-zinc-400">No saved posts yet.</div>
          ) : (
            <div className="grid gap-3">
              {saved.map((e) => (
                <article key={e.id} className="overflow-hidden rounded-xl bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-black/10 dark:ring-zinc-600">
                  <div className="space-y-1 p-4">
                    <h3 className="text-lg font-semibold">{e.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      {e.time}
                      {e.location ? ` • ${e.location}` : ""}
                    </p>
                    {e.description && <p className="text-sm text-gray-700 dark:text-zinc-300">{e.description}</p>}
                    <Link href={`/p/${e.id}`} className="text-sm font-medium underline">
                      Open →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
