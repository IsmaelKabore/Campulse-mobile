// app/profile/[uid]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TopTabs from "@/app/components/TopTabs";
import { auth, db } from "@/src/firebase/firebaseConfig";
import {
  collection, doc, getDoc, getDocs, query, where, updateDoc, serverTimestamp
} from "firebase/firestore";
import { deleteUser, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useRouter } from "next/navigation";

type UserDoc = {
  firstName?: string;
  lastName?: string;
  email?: string;
  photoURL?: string | null;
  bio?: string;
  orgName?: string;
};

type Post = {
  id: string;
  title: string;
  imageUrl?: string | null;
  eventDate?: any;
  createdAt?: any;
  authorId?: string;
  orgName?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const routeParams = useParams<{ uid?: string }>();
  const uid = routeParams?.uid as string | undefined;

  const [viewerUid, setViewerUid] = useState<string | null>(null);
  const [user, setUser] = useState<UserDoc | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  // mini actions menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // edit fields
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [org, setOrg] = useState("");
  const [bio, setBio] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const isOwner = useMemo(() => !!viewerUid && !!uid && viewerUid === uid, [viewerUid, uid]);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => setViewerUid(u?.uid ?? null));
    return () => off();
  }, []);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const udoc = await getDoc(doc(db, "users", uid));
      if (udoc.exists()) {
        const u = udoc.data() as UserDoc;
        setUser(u);
        setFirst(u.firstName ?? "");
        setLast(u.lastName ?? "");
        setOrg(u.orgName ?? "");
        setBio(u.bio ?? "");
      } else {
        setUser(null);
      }

      // fetch author's posts (client sort to avoid composite index requirements)
      const snap = await getDocs(query(collection(db, "posts"), where("authorId", "==", uid)));
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Post[];
      list.sort((a, b) => {
        const da = a.createdAt?.toDate?.() ?? new Date(0);
        const dbb = b.createdAt?.toDate?.() ?? new Date(0);
        return +dbb - +da;
      });
      setPosts(list);
    })();
  }, [uid]);

  // close the little menu on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  const onUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner || !uid) return;
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setUploading(true);
      const storage = getStorage();
      const key = `avatars/${uid}/${Date.now()}-${f.name}`;
      const r = sRef(storage, key);
      await uploadBytes(r, f);
      const url = await getDownloadURL(r);
      await updateDoc(doc(db, "users", uid), { photoURL: url, updatedAt: serverTimestamp() });
      setUser((u) => (u ? { ...u, photoURL: url } : u));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !uid) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid), {
        firstName: first.trim(),
        lastName: last.trim(),
        orgName: org.trim(),
        bio: bio.trim(),
        updatedAt: serverTimestamp(),
      });
      setUser((u) => u ? { ...u, firstName: first.trim(), lastName: last.trim(), orgName: org.trim(), bio: bio.trim() } : u);
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    await signOut(auth);
    router.replace("/"); // back to demo/home
  };

  const onDeleteAccount = async () => {
    if (!isOwner || !auth.currentUser) return;
    const ok = confirm(
      "Delete your account? This removes your profile and signs you out. You may need to re-authenticate if it's been a while."
    );
    if (!ok) return;

    try {
      // best-effort: remove user profile doc first
      try { await updateDoc(doc(db, "users", auth.currentUser.uid), { deletedAt: serverTimestamp() }); } catch {}

      // delete auth user (may throw requires-recent-login)
      await deleteUser(auth.currentUser);
      router.replace("/");
    } catch (e: any) {
      if (String(e?.code || "").includes("requires-recent-login")) {
        alert("Please sign in again to delete your account.");
        router.push("/login");
      } else {
        alert("Could not delete the account. Please try again.");
        console.error(e);
      }
    }
  };

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] || "Profile";

  if (!uid) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <TopTabs active="events" />
        <div className="mx-auto max-w-6xl p-4 animate-pulse">
          <div className="h-40 rounded-3xl bg-zinc-200" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="aspect-square bg-zinc-200" />
            <div className="aspect-square bg-zinc-200" />
            <div className="aspect-square bg-zinc-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <TopTabs active="events" />

      <div className="mx-auto max-w-6xl p-4 pb-28">
        {/* Header */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
            {/* Avatar */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
              {user?.photoURL ? (
                <Image src={user.photoURL} alt="Avatar" width={112} height={112} className="h-28 w-28 object-cover" />
              ) : (
                <div className="grid h-28 w-28 place-items-center bg-zinc-200 text-4xl font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {(user?.firstName || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
              {isOwner && (
                <>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onUploadPhoto} className="hidden" id="avatar-input" />
                  <label
                    htmlFor="avatar-input"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-black/80 px-2 py-1 text-[11px] font-medium text-white hover:bg-black"
                  >
                    {uploading ? "Uploading…" : "Change"}
                  </label>
                </>
              )}
            </div>

            {/* Identity + actions */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</h1>
                {user?.orgName && (
                  <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-700">
                    {user.orgName}
                  </span>
                )}

                {isOwner && (
                  <>
                    <button
                      onClick={() => setEditOpen(true)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Edit Profile
                    </button>

                    {/* minimalist IG-style kebab menu */}
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="rounded-lg border border-zinc-300 px-2 py-1 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        title="More"
                      >
                        ⋯
                      </button>
                      {menuOpen && (
                        <div
                          role="menu"
                          className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          <button
                            onClick={onSignOut}
                            className="block w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700"
                          >
                            Sign out
                          </button>
                          <Link
                            href={`/settings`}
                            className="block px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                          >
                            Settings
                          </Link>
                          <button
                            onClick={onDeleteAccount}
                            className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            Delete account
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {user?.bio && <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">{user.bio}</p>}

              <div className="mt-4 flex items-center gap-6 text-sm text-zinc-700 dark:text-zinc-300">
                <span><strong className="text-zinc-900 dark:text-zinc-100">{posts.length}</strong> posts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="mx-auto mt-6 max-w-7xl">
          {posts.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-zinc-200 py-16 text-center dark:border-zinc-800">
              <div className="mb-2 text-5xl">🗒️</div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">No posts yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
              {posts.map((p) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  <Link href={`/p/${p.id}`} className="block h-full w-full">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        unoptimized
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-zinc-600 dark:text-zinc-300">
                        No image
                      </div>
                    )}
                  </Link>

                  {isOwner && (
                    <>
                      <Link
                        href={`/p/${p.id}/edit`}
                        className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black"
                        title="Edit post"
                      >
                        ✏️ Edit
                      </Link>
                      <Link
                        href={`/p/${p.id}/edit`}
                        className="md:hidden absolute inset-x-0 bottom-0 z-10 grid place-items-center bg-black/60 py-1 text-xs font-medium text-white"
                      >
                        Edit
                      </Link>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit profile modal */}
      {isOwner && editOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit profile</h2>
              <button onClick={() => setEditOpen(false)} className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Close
              </button>
            </div>

            <form onSubmit={onSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">First name</label>
                  <input
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-transparent"
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Last name</label>
                  <input
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-transparent"
                    placeholder="Chen"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Organization / Club</label>
                <input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-transparent"
                  placeholder="IEEE @ Berkeley, …"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-transparent"
                  placeholder="Say something about your org or events…"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 dark:bg-zinc-700"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
