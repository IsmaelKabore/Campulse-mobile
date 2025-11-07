// app/saved/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-black/10 bg-white/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <Link href="/events" className="rounded-md px-3 py-1.5 text-sm ring-1 ring-black/10 hover:bg-gray-50">
          ← Home
        </Link>
        <div className="font-semibold">Saved</div>
        <div className="w-16" />
      </div>

      <main className="mx-auto max-w-3xl space-y-3 p-4">
        {saved.length === 0 ? (
          <div className="text-sm text-gray-500">No saved posts yet.</div>
        ) : (
          <div className="grid gap-3">
            {saved.map((e) => (
              <article key={e.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/10">
                <div className="space-y-1 p-4">
                  <h3 className="text-lg font-semibold">{e.title}</h3>
                  <p className="text-sm text-gray-500">
                    {e.time}
                    {e.location ? ` • ${e.location}` : ""}
                  </p>
                  {e.description && <p className="text-sm text-gray-700">{e.description}</p>}
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
  );
}
