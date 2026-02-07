// app/p/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/src/firebase/firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

type Post = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: "events" | "free-food" | "opportunities";
  imageUrl: string | null;
  eventDate?: any;
  createdAt?: any;
  authorId?: string;
  authorName?: string;
  authorPhoto?: string | null;
  orgName?: string;
  likedCount?: number;
};

const SAVED_MAP_KEY = "berkeley-events:saved"; // id -> {id,title,description,location,time}

export default function PostPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);

  const [loading, setLoading] = useState(true);

  // fetch
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "posts", id));
        if (!snap.exists()) {
          setPost(null);
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...(snap.data() as any) } as Post;
        setPost(data);
        setLikeCount(data.likedCount ?? 0);

        // saved?
        try {
          const raw = localStorage.getItem(SAVED_MAP_KEY);
          const map = raw ? (JSON.parse(raw) as Record<string, any>) : {};
          setSaved(Boolean(map[id]));
        } catch {}
      } catch (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getDate = (dateField: any): Date | null => {
    if (!dateField) return null;
    if (typeof dateField === 'object' && dateField.toDate) return dateField.toDate();
    return new Date(dateField);
  };

  const dateObj = useMemo(() => post ? getDate(post.eventDate) : null, [post]);
  
  const timeLabel = useMemo(() => {
    if (!dateObj || isNaN(dateObj.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(dateObj);
  }, [dateObj]);

  const dateLabel = useMemo(() => {
    if (!dateObj || isNaN(dateObj.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(dateObj);
  }, [dateObj]);

  const timeOnlyLabel = useMemo(() => {
    if (!dateObj || isNaN(dateObj.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(dateObj);
  }, [dateObj]);

  if (!id || loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500 dark:text-zinc-400">Loading…</div>
      </main>
    );
  }
  if (!post) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500 dark:text-zinc-400">Post not found.</div>
      </main>
    );
  }

  const onToggleSave = () => {
    try {
      const raw = localStorage.getItem(SAVED_MAP_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, any>) : {};
      if (map[post.id]) {
        delete map[post.id];
        setSaved(false);
      } else {
        map[post.id] = {
          id: post.id,
          title: post.title,
          description: post.description ?? "",
          location: post.location ?? "",
          time: timeLabel,
        };
        setSaved(true);
      }
      localStorage.setItem(SAVED_MAP_KEY, JSON.stringify(map));
    } catch {}
  };

  const onLike = async () => {
    setLikeCount((c) => c + 1);
    // optional: write to Firestore (simple additive, not idempotent)
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likedCount: (post.likedCount ?? 0) + 1,
        updatedAt: serverTimestamp(),
      });
    } catch {}
  };

  const canEdit = auth.currentUser?.uid && auth.currentUser.uid === post.authorId;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-3 flex items-center justify-between">
          <Link 
            href={`/${post.category === "events" ? "events" : post.category === "free-food" ? "free-food" : "opportunities"}`} 
            className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </Link>
          {canEdit && (
            <button
              onClick={() => router.push(`/p/${post.id}/edit`)}
              className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-opacity"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Hero image - full flyer visibility with contain */}
      {post.imageUrl && (
        <div className="relative w-full bg-zinc-100 dark:bg-zinc-950
          h-[400px]
          md:h-[520px]
          flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full">
            <Image 
              src={post.imageUrl} 
              alt={post.title} 
              fill 
              className="object-contain" 
              priority
              unoptimized 
            />
          </div>
        </div>
      )}

      {/* Content - responsive padding and max-width */}
      <article className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-12">
        {/* Title - responsive sizing */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 md:mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Date, time, location info */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 md:mb-8 text-sm md:text-base text-zinc-600 dark:text-zinc-400">
          {dateLabel && (
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="font-medium">{dateLabel}</span>
            </div>
          )}
          {timeOnlyLabel && (
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{timeOnlyLabel}</span>
            </div>
          )}
          {post.location && (
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{post.location}</span>
            </div>
          )}
        </div>

        {/* Author profile */}
        {post.authorId && (post.authorName || post.authorPhoto) && (
          <Link 
            href={`/profile/${post.authorId}`}
            className="flex items-center gap-3 mb-6 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-zinc-300 dark:group-hover:ring-zinc-600 transition-colors">
              {post.authorPhoto ? (
                <Image 
                  src={post.authorPhoto} 
                  alt={post.authorName || "Author"} 
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-400 to-zinc-600 dark:from-zinc-600 dark:to-zinc-800 flex items-center justify-center text-white font-semibold text-lg">
                  {(post.authorName || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {post.authorName || "Event Organizer"}
              </div>
              {post.orgName && (
                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {post.orgName}
                </div>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        )}

        {/* Description */}
        {post.description && (
          <div className="prose prose-zinc dark:prose-invert max-w-none mb-8 md:mb-10">
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {post.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={onLike} 
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={likeCount > 0 ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{likeCount.toLocaleString()}</span>
          </button>
          <button 
            onClick={onToggleSave} 
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "#facc15" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z"/>
            </svg>
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </article>
    </main>
  );
}
