// app/opportunities/page.tsx
"use client";

import * as React from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/src/firebase/firebaseConfig";
import TopTabs from "../components/TopTabs";
import EventCard from "../components/EventCard";
import { ScheduleItem } from "../components/ScheduleList";
import RequireAuth from "../components/RequireAuth";

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
          // Handle Firestore Timestamp, Date, or string/number
          const getDate = (dateField: any): Date => {
            if (!dateField) return new Date(0);
            if (typeof dateField === 'object' && dateField.toDate) {
              return dateField.toDate();
            }
            return new Date(dateField);
          };
          
          const da = getDate(a.eventDate);
          const db = getDate(b.eventDate);
          return +da - +db;
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
    <RequireAuth blockWhenSignedOut={true} redirectTo="/login">
      <div className="min-h-screen bg-white text-zinc-900 /* dark:bg-zinc-900 dark:text-zinc-100 */">
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
    </RequireAuth>
  );
}
