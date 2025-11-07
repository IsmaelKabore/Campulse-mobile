// src/lib/useEvents.ts
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "@/src/firebase/firebaseConfig";

export type Category = "events" | "opportunities" | "free-food";

export type EventDoc = {
  id: string;
  title: string;
  time: string;            // formatted for display
  location: string;
  description: string;
  tags?: string[];
  imagePath?: string;
  imageUrl?: string;
  likes?: number;
  eventDate?: Timestamp;
  createdAt?: Timestamp;
};

export function useEvents(category: Category) {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Single-field order (no composite index needed)
    const q = query(collection(db, category), orderBy("eventDate", "asc"));

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const rows = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data() as any;
            let imageUrl: string | undefined;

            if (data.imagePath) {
              try {
                imageUrl = await getDownloadURL(ref(storage, data.imagePath));
              } catch {
                imageUrl = undefined;
              }
            }

            // Build display time from eventDate if provided
            let displayTime: string | undefined = data.time;
            if (data.eventDate?.toDate) {
              const dt = data.eventDate.toDate();
              displayTime = new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(dt);
            }

            return {
              id: d.id,
              title: data.title ?? "",
              time: displayTime ?? "",
              location: data.location ?? "",
              description: data.description ?? "",
              tags: data.tags ?? [],
              imagePath: data.imagePath,
              imageUrl,
              likes: data.likes ?? 0,
              eventDate: data.eventDate,
              createdAt: data.createdAt,
            } as EventDoc;
          })
        );

        setEvents(rows);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [category]);

  return { events, loading };
}
