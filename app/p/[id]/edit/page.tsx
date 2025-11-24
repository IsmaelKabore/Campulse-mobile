// app/p/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { auth, db, storage } from "@/src/firebase/firebaseConfig";
import { doc, getDoc, serverTimestamp, Timestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";

type Category = "events" | "free-food" | "opportunities";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [category, setCategory] = useState<Category>("events");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(""); // datetime-local
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "posts", id));
      if (!snap.exists()) {
        router.replace("/events");
        return;
      }
      const data = snap.data() as any;

      // ownership
      if (auth.currentUser?.uid !== data.authorId) {
        router.replace(`/p/${id}`);
        return;
      }

      setCategory(data.category);
      setTitle(data.title ?? "");
      setLocation(data.location ?? "");
      setDescription(data.description ?? "");
      if (data.eventDate) {
        // Handle Firestore Timestamp, Date, or string/number
        const getDate = (dateField: any): Date => {
          if (!dateField) return new Date();
          if (typeof dateField === 'object' && dateField.toDate) {
            return dateField.toDate();
          }
          return new Date(dateField);
        };
        
        const d = getDate(data.eventDate);
        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setEventDate(iso);
      }
      setLoading(false);
    })();
  }, [id, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ed = eventDate ? Timestamp.fromDate(new Date(eventDate)) : undefined;

      const refDoc = doc(db, "posts", id);
      await updateDoc(refDoc, {
        category,
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        ...(ed ? { eventDate: ed } : {}),
        updatedAt: serverTimestamp(),
      });

      if (file) {
        const path = `posts/${id}/banner-${Date.now()}-${file.name}`;
        await uploadBytes(ref(storage, path), file);
        const url = await getDownloadURL(ref(storage, path));
        await updateDoc(refDoc, { imagePath: path, imageUrl: url });
      }

      router.push(`/p/${id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this post? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const snap = await getDoc(doc(db, "posts", id));
      const data = snap.data() as any;
      
      // Delete image from storage if exists
      if (data?.imagePath) {
        try {
          await deleteObject(ref(storage, data.imagePath));
        } catch (e) {
          console.warn("Failed to delete image from storage:", e);
        }
      }

      // Delete post document
      await deleteDoc(doc(db, "posts", id));

      // Redirect to profile
      if (auth.currentUser?.uid) {
        router.push(`/profile/${auth.currentUser.uid}`);
      } else {
        router.push("/events");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete post");
      setDeleting(false);
    }
  };

  if (loading) return <main className="p-6">Loading…</main>;

  return (
    <div className="min-h-screen bg-white">
      <div className="h-14 px-4 border-b border-black/10 flex items-center justify-between bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <Link href={`/p/${id}`} className="text-sm rounded-md px-3 py-1.5 ring-1 ring-black/10 hover:bg-gray-50 active:scale-95">
          ← Back
        </Link>
        <div className="font-semibold">Edit Post</div>
        <div className="w-16" />
      </div>

      <main className="max-w-xl mx-auto p-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="text-sm font-medium">
            Category
            <select
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
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
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="text-sm font-medium">
            Location
            <input
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </label>

          <label className="text-sm font-medium">
            Date & Time
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </label>

          <label className="text-sm font-medium">
            Description
            <textarea
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </label>

          <label className="text-sm font-medium">
            Replace Banner (optional)
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            type="submit"
            disabled={saving || deleting}
            className={`w-full rounded-md px-4 py-2 text-white transition active:scale-95 ${
              saving || deleting ? "bg-gray-400" : "bg-black hover:bg-neutral-800"
            }`}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>

        {/* Delete button */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className={`w-full rounded-md px-4 py-2 font-semibold text-white transition active:scale-95 ${
              deleting || saving ? "bg-red-300" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {deleting ? "Deleting…" : "Delete Post"}
          </button>
          <p className="mt-2 text-center text-xs text-gray-500">
            This action cannot be undone
          </p>
        </div>
      </main>
    </div>
  );
}
