// app/opportunities/page.tsx
"use client";

import * as React from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/src/firebase/firebaseConfig";
import TopTabs from "../components/TopTabs";
import EventCard from "../components/EventCard";
import { ScheduleItem } from "../components/ScheduleList";

export default function OpportunitiesPage() {
  const [items, setItems] = React.useState<ScheduleItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const qRef = query(collection(db, "posts"), where("category", "==", "opportunities"));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const rows: ScheduleItem[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          rows.push({
            id: d.id,
            title: data.title ?? "",
            description: data.description ?? "",
            location: data.location ?? "",
            imageUrl: data.imageUrl ?? null,
            createdAt: data.createdAt ?? null,
            eventDate: data.eventDate ?? null,
            likedCount: data.likedCount ?? 0,
          });
        });
        rows.sort((a, b) => {
          const da = a.eventDate?.toDate?.() ?? new Date(a.eventDate ?? 0);
          const dbb = b.eventDate?.toDate?.() ?? new Date(b.eventDate ?? 0);
          return +da - +dbb;
        });
        setItems(rows);
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <TopTabs active="opportunities" />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Opportunities</h1>
        {loading && <div className="text-sm text-zinc-500">Loading…</div>}

        {items.length === 0 ? (
          <div className="text-sm text-zinc-500">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => <EventCard key={e.id} item={e} />)}
          </div>
        )}
      </main>
    </div>
  );
}
