// app/components/EventCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export type ScheduleItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string | null;
  eventDate: any;        // Firestore Timestamp | ISO | Date
  createdAt: any;
  saved?: boolean;
  likedCount?: number;
  author?: {
    uid: string;
    name?: string;
    photoURL?: string | null;
  };
};

const SAVED_MAP_KEY = "berkeley-events:saved"; // id -> { id,title,description,location,time }
const LIKED_KEY = "berkeley-events:liked-post-ids";

export default function EventCard({ item }: { item: ScheduleItem }) {
  const router = useRouter();

  // robust date
  const dateObj: Date =
    typeof item.eventDate === "string"
      ? new Date(item.eventDate)
      : (item.eventDate?.toDate?.() ??
         (item.eventDate instanceof Date ? item.eventDate : new Date(item.eventDate)));

  const prettyDate =
    isNaN(dateObj.getTime())
      ? ""
      : dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const timeLabel =
    isNaN(dateObj.getTime())
      ? ""
      : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(dateObj);

  const [saved, setSaved] = React.useState<boolean>(false);
  const [liked, setLiked] = React.useState<boolean>(false);
  const [likeCount, setLikeCount] = React.useState<number>(item.likedCount ?? 0);

  React.useEffect(() => {
    try {
      const sraw = localStorage.getItem(SAVED_MAP_KEY);
      const smap = sraw ? (JSON.parse(sraw) as Record<string, any>) : {};
      setSaved(Boolean(smap[item.id]));
      const l = new Set<string>(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"));
      setLiked(l.has(item.id));
    } catch {}
  }, [item.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = localStorage.getItem(SAVED_MAP_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, any>) : {};
      if (map[item.id]) {
        delete map[item.id];
        setSaved(false);
      } else {
        map[item.id] = {
          id: item.id,
          title: item.title,
          description: item.description ?? "",
          location: item.location ?? "",
          time: timeLabel,
        };
        setSaved(true);
      }
      localStorage.setItem(SAVED_MAP_KEY, JSON.stringify(map));
    } catch {}
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const l = new Set<string>(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"));
      if (l.has(item.id)) {
        l.delete(item.id);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        l.add(item.id);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
      localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(l)));
    } catch {}
  };

  const goAuthor = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.author?.uid) router.push(`/profile/${item.author.uid}`);
  };

  return (
    <Link href={`/p/${item.id}`} className="block group">
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 250, damping: 22 }}
        className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white shadow-lg ring-1 ring-black/10 aspect-[4/5]"
      >
        <div className="absolute inset-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-zinc-800" />
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </div>

        <div className="absolute left-3 top-3 z-10">
          <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold shadow">
            {prettyDate || "—"}
          </span>
        </div>

        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <button onClick={toggleLike} aria-label="Like" className="rounded-full bg-black/30 p-2 backdrop-blur hover:bg-black/50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s-6.7-3.9-9.3-7.3C.8 11.4 2.1 7.6 5.5 7c1.7-.3 3.1.3 4.1 1.3.9-1 2.4-1.6 4.1-1.3 3.3.6 4.7 4.4 2.8 6.7C18.7 17.1 12 21 12 21z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill={liked ? "#ef4444" : "transparent"}
              />
            </svg>
          </button>
          <button onClick={toggleSave} aria-label="Save" className="rounded-full bg-black/30 p-2 backdrop-blur hover:bg-black/50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill={saved ? "#facc15" : "transparent"}
              />
            </svg>
          </button>
        </div>

        {item.author?.uid && (
          <button
            onClick={goAuthor}
            className="absolute left-3 bottom-24 z-10 flex items-center gap-2"
            title={item.author.name || "View profile"}
          >
            <span className="inline-block h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/80">
              {item.author.photoURL ? (
                <Image
                  src={item.author.photoURL}
                  alt={item.author.name || "Poster"}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-cover"
                  unoptimized
                />
              ) : (
                <div className="grid h-9 w-9 place-items-center bg-white/20 text-sm font-semibold">
                  {(item.author.name || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
            </span>
            <span className="hidden md:inline text-sm/5 font-medium drop-shadow">
              {item.author.name || "View profile"}
            </span>
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight drop-shadow">
            {item.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-200">
            <span className="rounded-full bg-red-600/80 px-2 py-0.5 font-medium">
              {likeCount.toLocaleString()} likes
            </span>
            {item.location && (
              <span className="rounded-full bg-emerald-600/80 px-2 py-0.5 font-medium">
                {item.location}
              </span>
            )}
          </div>
          {item.description && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-100/90">{item.description}</p>
          )}
        </div>
      </motion.article>
    </Link>
  );
}