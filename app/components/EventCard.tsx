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

  const dayOfMonth =
    isNaN(dateObj.getTime())
      ? ""
      : dateObj.toLocaleDateString(undefined, { day: "numeric" });

  const monthShort =
    isNaN(dateObj.getTime())
      ? ""
      : dateObj.toLocaleDateString(undefined, { month: "short" });

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
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-2xl bg-zinc-900 text-white shadow-xl ring-1 ring-zinc-200/20 dark:ring-zinc-800/50 aspect-[4/5] cursor-pointer"
      >
        <div className="absolute inset-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          {/* Refined gradient overlays for better text readability */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        </div>

        {/* Premium date badge - glass/frosted style with transparency */}
        {!isNaN(dateObj.getTime()) && (
          <div className="absolute left-3 top-3 md:left-4 md:top-4 z-10">
            <div className="flex flex-col items-center justify-center rounded-lg md:rounded-xl 
              bg-zinc-900/40 backdrop-blur-md 
              px-2.5 py-1.5 md:px-3 md:py-2 
              shadow-lg ring-1 ring-white/20
              border border-white/10">
              <div className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-white leading-none drop-shadow-sm">
                {monthShort}
              </div>
              <div className="text-xl md:text-2xl font-bold text-white leading-none mt-0.5 drop-shadow-sm">
                {dayOfMonth}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons - top right */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <button 
            onClick={toggleLike} 
            aria-label="Like" 
            className="rounded-full bg-black/40 backdrop-blur-md p-2.5 hover:bg-black/60 transition-colors ring-1 ring-white/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button 
            onClick={toggleSave} 
            aria-label="Save" 
            className="rounded-full bg-black/40 backdrop-blur-md p-2.5 hover:bg-black/60 transition-colors ring-1 ring-white/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z"
                stroke="currentColor"
                strokeWidth="1.8"
                fill={saved ? "#facc15" : "transparent"}
                className={saved ? "text-yellow-400" : "text-white"}
              />
            </svg>
          </button>
        </div>

        {/* Content section - bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 space-y-2.5">
          {/* Title - always visible */}
          <h3 className="text-xl font-bold leading-tight drop-shadow-lg line-clamp-2">
            {item.title}
          </h3>
          
          {/* Metadata row */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.location && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-80">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
                <span className="line-clamp-1">{item.location}</span>
              </div>
            )}
            {likeCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="opacity-80">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{likeCount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Description preview - always readable */}
          {item.description && (
            <p className="text-sm text-white/85 line-clamp-2 leading-relaxed drop-shadow">
              {item.description}
            </p>
          )}
        </div>
      </motion.article>
    </Link>
  );
}