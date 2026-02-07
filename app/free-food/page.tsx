// app/free-food/page.tsx
"use client";

import * as React from "react";
import { collection, onSnapshot, query, where, or } from "firebase/firestore";
import { db } from "@/src/firebase/firebaseConfig";
import TopTabs from "../components/TopTabs";
import EventCard from "../components/EventCard";
import { ScheduleItem } from "../components/ScheduleList";
import RequireAuth from "../components/RequireAuth";

export default function FreeFoodPage() {
  const [items, setItems] = React.useState<ScheduleItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const qRef = query(
      collection(db, "posts"), 
      or(
        where("category", "==", "free-food"),
        where("hasFreeFood", "==", true)
      )
    );
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
            author: data.authorId ? {
              uid: data.authorId,
              name: data.authorName ?? undefined,
              photoURL: data.authorPhoto ?? undefined,
            } : undefined,
          });
        });
        // Smart sorting: upcoming first, then recent past (1-2 days), then older
        const getDate = (dateField: any): Date => {
          if (!dateField) return new Date(0);
          if (typeof dateField === 'object' && dateField.toDate) {
            return dateField.toDate();
          }
          return new Date(dateField);
        };

        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

        rows.sort((a, b) => {
          const da = getDate(a.eventDate);
          const db = getDate(b.eventDate);
          
          const aIsUpcoming = da > now;
          const bIsUpcoming = db > now;
          const aIsRecent = da > twoDaysAgo && da <= now;
          const bIsRecent = db > twoDaysAgo && db <= now;
          
          // Upcoming events first (ascending by date)
          if (aIsUpcoming && bIsUpcoming) {
            return +da - +db;
          }
          if (aIsUpcoming) return -1;
          if (bIsUpcoming) return 1;
          
          // Recent past events next (descending by date - most recent first)
          if (aIsRecent && bIsRecent) {
            return +db - +da;
          }
          if (aIsRecent) return -1;
          if (bIsRecent) return 1;
          
          // Older events last (descending by date)
          return +db - +da;
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
      <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <TopTabs active="food" />
        <main className="mx-auto max-w-5xl px-4 py-8 pb-24 lg:pb-8">
          <h1 className="mb-6 text-2xl font-bold">Free Food</h1>
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
