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

  // fetch
  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, "posts", id));
      if (!snap.exists()) return;
      const data = { id: snap.id, ...(snap.data() as any) } as Post;
      setPost(data);
      setLikeCount(data.likedCount ?? 0);

      // saved?
      try {
        const raw = localStorage.getItem(SAVED_MAP_KEY);
        const map = raw ? (JSON.parse(raw) as Record<string, any>) : {};
        setSaved(Boolean(map[id]));
      } catch {}
    })();
  }, [id]);

  const timeLabel = useMemo(() => {
    if (!post?.eventDate) return "";
    const d = post.eventDate?.toDate?.() ?? new Date(post.eventDate);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
  }, [post]);

  if (!id) {
    return <main className="p-6">Loading…</main>;
  }
  if (!post) {
    return <main className="p-6">Not found.</main>;
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
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/${post.category === "events" ? "events" : post.category === "free-food" ? "free-food" : "opportunities"}`} className="text-sm underline">
          ← Back
        </Link>
        {canEdit && (
          <button
            onClick={() => router.push(`/p/${post.id}/edit`)}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Edit
          </button>
        )}
      </div>

      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {post.imageUrl && (
          <div className="relative aspect-[4/2] w-full">
            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="space-y-2 p-4">
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          <p className="text-sm text-zinc-500">
            {timeLabel}
            {post.location ? ` • ${post.location}` : ""}
          </p>
          {post.description && <p className="text-sm text-zinc-700">{post.description}</p>}

          <div className="flex items-center gap-2 pt-2">
            <button onClick={onLike} className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50">
              ❤️ {likeCount.toLocaleString()}
            </button>
            <button onClick={onToggleSave} className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50">
              {saved ? "★ Saved" : "☆ Save"}
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
