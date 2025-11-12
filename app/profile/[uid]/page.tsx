// app/profile/[uid]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TopTabs from "@/app/components/TopTabs";
import RequireAuth from "@/app/components/RequireAuth";
import { auth, db, storage } from "@/src/firebase/firebaseConfig";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useParams, useRouter } from "next/navigation";

type UserDoc = {
  firstName?: string;
  lastName?: string;
  email?: string;
  photoURL?: string | null;
  bio?: string;
  orgName?: string;
  createdAt?: any;
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
  const routeParams = useParams<{ uid?: string }>();
  const uid = (routeParams?.uid as string) || undefined;

  const router = useRouter();
  const [viewerUid, setViewerUid] = useState<string | null>(null);
  const [user, setUser] = useState<UserDoc | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // change password sheet
  const [pwOpen, setPwOpen] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [currPw, setCurrPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

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

      const snap = await getDocs(query(collection(db, "posts"), where("authorId", "==", uid)));
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Post[];
      list.sort((a, b) => {
        const dOf = (x: any): number => {
          if (!x) return 0;
          if (typeof x === "object" && x.toDate) return +x.toDate();
          return +new Date(x);
        };
        return dOf(b.createdAt) - dOf(a.createdAt);
      });
      setPosts(list);
    })();
  }, [uid]);

  const onUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner || !uid) return;
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setUploading(true);
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
      setUser((u) =>
        u ? { ...u, firstName: first.trim(), lastName: last.trim(), orgName: org.trim(), bio: bio.trim() } : u
      );
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setViewerUid(null);
      setUser(null);
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("Failed to sign out.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!isOwner || !uid || !auth.currentUser) return;
    const sure = confirm("Delete your account and all your posts? This cannot be undone.");
    if (!sure) return;

    try {
      setDeleting(true);

      const postsQ = query(collection(db, "posts"), where("authorId", "==", uid));
      const ps = await getDocs(postsQ);
      for (const d of ps.docs) {
        const data = d.data() as any;
        if (data.imagePath) {
          try { await deleteObject(sRef(storage, data.imagePath)); } catch {}
        }
        await deleteDoc(doc(db, "posts", d.id));
      }

      await deleteDoc(doc(db, "users", uid));

      try {
        await deleteUser(auth.currentUser);
        router.push("/");
      } catch (err: any) {
        if (err?.code === "auth/requires-recent-login") {
          alert("For security, sign in again, then delete your account.");
          await signOut(auth);
          router.push("/login");
        } else {
          throw err;
        }
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete account.");
    } finally {
      setDeleting(false);
      setSettingsOpen(false);
    }
  };

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Profile";

  const canChangePassword =
    !!user?.email &&
    (auth.currentUser?.providerData ?? []).some((p) => p.providerId === "password");

  if (!uid) {
    return (
      <RequireAuth blockWhenSignedOut={true} redirectTo="/login">
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
          <TopTabs active="events" />
          <div className="mx-auto max-w-6xl p-4 animate-pulse">
            <div className="h-40 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800" />
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800" />
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth blockWhenSignedOut={true} redirectTo="/login">
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <TopTabs active="events" />

      <div className="mx-auto max-w-6xl p-4 pb-28">
        {/* Header */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
            {/* Avatar */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-zinc-800">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Avatar"
                  width={112}
                  height={112}
                  className="h-28 w-28 object-cover"
                />
              ) : (
                <div className="grid h-28 w-28 place-items-center bg-zinc-200 text-4xl font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {(user?.firstName || "U").slice(0, 1).toUpperCase()}
                </div>
              )}

              {isOwner && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onUploadPhoto}
                    className="hidden"
                    id="avatar-input"
                  />
                  <label
                    htmlFor="avatar-input"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-black/80 px-2 py-1 text-[11px] font-medium text-white hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    {uploading ? "Uploading…" : "Change"}
                  </label>
                </>
              )}
            </div>

            {/* Identity + actions */}
            <div className="flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <h1 className="text-3xl font-semibold">{displayName}</h1>

                {user?.orgName && (
                  <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-200 dark:text-zinc-900">
                    {user.orgName}
                  </span>
                )}

                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditOpen(true)}
                      className="mt-1 w-fit rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 sm:mt-0 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Edit Profile
                    </button>

                    <button
                      onClick={() => setSettingsOpen(true)}
                      className="mt-1 grid h-9 w-9 place-items-center rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-50 sm:mt-0 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      aria-label="Settings"
                      title="Settings"
                    >
                      ⚙️
                    </button>
                  </div>
                )}
              </div>

              {user?.bio && <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">{user.bio}</p>}

              <div className="mt-4 flex items-center gap-6 text-sm text-zinc-700 dark:text-zinc-300">
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-100">{posts.length}</strong> posts
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Posts grid */}
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
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit profile</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
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
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Last name</label>
                  <input
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    placeholder="Chen"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Organization / Club</label>
                <input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="IEEE @ Berkeley, …"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="Say something about your org or events…"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Sheet */}
      {isOwner && settingsOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-4">
          <div className="w-full overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-sm sm:rounded-2xl dark:bg-zinc-950">
            <div className="border-b p-4 text-center text-sm font-semibold dark:border-zinc-800">Settings</div>

            <div className="grid divide-y dark:divide-zinc-800">
              <button onClick={handleSignOut} className="w-full px-4 py-4 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900">
                Sign out
              </button>

              {canChangePassword && (
                <button onClick={() => setPwOpen(true)} className="w-full px-4 py-4 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  Change password
                </button>
              )}

              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full px-4 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-950/30"
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full px-4 py-4 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Change Password Sheet */}
      {isOwner && pwOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Change password</h2>
              <button
                onClick={() => { setPwOpen(false); setPwError(null); setCurrPw(""); setNewPw(""); setNewPw2(""); }}
                className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPwError(null);
                if (!auth.currentUser) { setPwError("Not signed in."); return; }
                if (!user?.email) { setPwError("No email on account."); return; }
                if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
                if (newPw !== newPw2) { setPwError("New passwords do not match."); return; }

                try {
                  setPwSaving(true);
                  const cred = EmailAuthProvider.credential(user.email, currPw);
                  await reauthenticateWithCredential(auth.currentUser, cred);
                  await updatePassword(auth.currentUser, newPw);

                  setPwOpen(false);
                  setCurrPw(""); setNewPw(""); setNewPw2("");
                  alert("Password updated.");
                } catch (err: any) {
                  console.error(err);
                  if (err?.code === "auth/wrong-password") setPwError("Current password is incorrect.");
                  else if (err?.code === "auth/weak-password") setPwError("New password is too weak.");
                  else if (err?.code === "auth/requires-recent-login") setPwError("Please sign in again and retry.");
                  else setPwError("Failed to update password.");
                } finally {
                  setPwSaving(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Current password</label>
                <input
                  type="password"
                  value={currPw}
                  onChange={(e) => setCurrPw(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-[16px] outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">New password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-[16px] outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Confirm new password</label>
                <input
                  type="password"
                  value={newPw2}
                  onChange={(e) => setNewPw2(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-[16px] outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="Repeat new password"
                />
              </div>

              {pwError && <p className="text-sm text-red-600">{pwError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setPwOpen(false); setPwError(null); setCurrPw(""); setNewPw(""); setNewPw2(""); }}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {pwSaving ? "Updating…" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </RequireAuth>
  );
}
