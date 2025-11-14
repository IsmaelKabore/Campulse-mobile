// app/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addDoc, collection, serverTimestamp, Timestamp,
  updateDoc, doc, getDoc
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/src/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import RequireAuth from "../components/RequireAuth";

type Category = "events" | "free-food" | "opportunities";

export default function CreatePage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);

  // form
  const [category, setCategory] = useState<Category>("events");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(""); // datetime-local string
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hasFreeFood, setHasFreeFood] = useState(false);
  const [saving, setSaving] = useState(false);

  // require auth
  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
      if (!u) router.replace("/login");
    });
    return () => off();
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return router.replace("/login");
    if (!title.trim()) return;

    setSaving(true);
    try {
      // author info
      const udoc = await getDoc(doc(db, "users", uid));
      const u = udoc.exists() ? (udoc.data() as any) : {};
      const authorName =
        [u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
        auth.currentUser?.displayName || "";
      const authorPhoto = u?.photoURL ?? auth.currentUser?.photoURL ?? null;
      const orgName = u?.orgName ?? "";

      const ed = eventDate ? Timestamp.fromDate(new Date(eventDate)) : undefined;

      const postRef = await addDoc(collection(db, "posts"), {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category,
        tags: tags
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        eventDate: ed ?? serverTimestamp(),
        createdAt: serverTimestamp(),
        likedCount: 0,
        hasFreeFood,

        authorId: uid,
        authorName,
        authorPhoto,
        orgName,

        imageUrl: null,
        imagePath: null,
      });

      if (file) {
        const path = `posts/${postRef.id}/banner-${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateDoc(postRef, { imagePath: path, imageUrl: url });
      }

      router.push(
        category === "events" ? "/events" :
        category === "free-food" ? "/free-food" :
        "/opportunities"
      );
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth blockWhenSignedOut={true} redirectTo="/login">
      <div className="min-h-screen bg-white /* dark:bg-zinc-900 dark:text-zinc-100 */">
        <div className="h-14 px-4 border-b border-black/10 /* dark:border-zinc-700 */ flex items-center justify-between bg-white/80 /* dark:bg-zinc-900/80 */ backdrop-blur supports-[backdrop-filter]:bg-white/70 /* dark:supports-[backdrop-filter]:bg-zinc-900/70 */">
          <Link href="/events" className="text-sm rounded-md px-3 py-1.5 ring-1 ring-black/10 dark:ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95">
            ← Back
          </Link>
          <div className="font-semibold">Create Post</div>
          <div className="w-16" />
        </div>

        <main className="max-w-xl mx-auto p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="text-sm font-medium">
              Category
              <select
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                <option value="events">Events</option>
                <option value="free-food">Free Food</option>
                <option value="opportunities">Opportunities</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Title
              <input
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Campus Hackathon 2025"
                required
              />
            </label>

            <label className="text-sm font-medium">
              Location
              <input
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 px-3 py-2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Engineering Building"
              />
            </label>

            <label className="text-sm font-medium">
              Date & Time
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 px-3 py-2"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </label>

            <label className="text-sm font-medium">
              Tags (comma-separated)
              <input
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 px-3 py-2"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="pizza, free, cs"
              />
            </label>

            <label className="flex items-center space-x-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={hasFreeFood}
                onChange={(e) => setHasFreeFood(e.target.checked)}
                className="rounded border-gray-200 dark:border-zinc-600"
              />
              <span>This event includes free food</span>
            </label>

            <label className="text-sm font-medium">
              Description
              <textarea
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 px-3 py-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </label>

            <label className="text-sm font-medium">
              Banner Image (optional)
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 px-3 py-2"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-md px-4 py-2 text-white transition active:scale-95 ${
                saving ? "bg-gray-400" : "bg-black dark:bg-zinc-100 dark:text-zinc-900 hover:bg-neutral-800 dark:hover:bg-zinc-200"
              }`}
            >
              {saving ? "Saving…" : "Create"}
            </button>
          </form>
        </main>
      </div>
    </RequireAuth>
  );
}
