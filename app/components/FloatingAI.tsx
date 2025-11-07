// app/components/FloatingAI.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, getDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/src/firebase/firebaseConfig";

/* ---------------- Types ---------------- */
type Result = {
  id: string;
  title: string;
  sub: string;
  imageUrl: string | null;
  likedCount: number;
  href: string;
  why: { semantic: number; lexical: number; overlap: string[] };
};
type FullPost = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string | null;
  likedCount?: number;
  eventDate?: any;
  authorName?: string;
  orgName?: string;
};

/* ---------------- Local-Storage Keys ---------------- */
const SAVED_KEY = "berkeley-events:saved-post-ids";
const LIKED_KEY = "berkeley-events:liked-post-ids";

/* ---------------- Helpers ---------------- */
function tokenize(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function lexicalScore(query: string, hay: string) {
  const q = new Set(tokenize(query));
  const h = tokenize(hay);
  if (!q.size || !h.length) return 0;
  let hits = 0;
  for (const t of h) if (q.has(t)) hits++;
  return hits / Math.log2(2 + h.length);
}
function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    dot += x * y; na += x * x; nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}
async function embedBatch(texts: string[]) {
  const r = await fetch("/api/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  });
  if (!r.ok) throw new Error(await r.text());
  const { vectors } = (await r.json()) as { vectors: number[][] };
  return vectors;
}
function fmtDateMaybe(raw: any) {
  try {
    let dt: Date | null = null;
    if (raw instanceof Timestamp) dt = raw.toDate();
    else if (raw?.toDate) dt = raw.toDate();
    else if (typeof raw === "number") dt = new Date(raw);
    if (!dt) return "";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(dt);
  } catch { return ""; }
}

/* ---------------- Component ---------------- */
export default function FloatingAI() {
  const [open, setOpen] = React.useState(false);

  // Drag state (Pointer Events + capture)
  const [dragY, setDragY] = React.useState(0); // px offset while dragging (0 = fully open)
  const startYRef = React.useRef(0);
  const draggingRef = React.useRef(false);
  const [withTransition, setWithTransition] = React.useState(true);
  const SNAP_CLOSE = 120; // px drag-down to close

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    startYRef.current = e.clientY;
    setWithTransition(false);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dy = e.clientY - startYRef.current;
    // allow slight pull-up, cap pull-down
    const next = Math.max(-40, Math.min(dy, window.innerHeight * 0.9));
    setDragY(next);
  };
  const onDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    setWithTransition(true);
    if (dragY > SNAP_CLOSE) {
      // snap closed
      setOpen(false);
      setDragY(0);
    } else {
      // snap open
      setDragY(0);
    }
  };

  // Search state (same behavior you had)
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Result[]>([]);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detail, setDetail] = React.useState<FullPost | null>(null);

  const [savedSet, setSavedSet] = React.useState<Set<string>>(new Set());
  const [likedSet, setLikedSet] = React.useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    try {
      setSavedSet(new Set<string>(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]")));
      setLikedSet(new Set<string>(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]")));
    } catch {}
  }, []);

  const persistSets = React.useCallback((newSaved?: Set<string>, newLiked?: Set<string>) => {
    try {
      if (newSaved) localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(newSaved)));
      if (newLiked) localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(newLiked)));
    } catch {}
  }, []);

  const toggleSave = (id: string) => {
    const s = new Set(savedSet);
    s.has(id) ? s.delete(id) : s.add(id);
    setSavedSet(s);
    persistSets(s, undefined);
  };
  const toggleLike = (id: string) => {
    const l = new Set(likedSet);
    const next = { ...likeCounts };
    const seed = results.find((r) => r.id === id)?.likedCount ?? detail?.likedCount ?? 0;
    if (l.has(id)) {
      l.delete(id);
      next[id] = Math.max(0, (next[id] ?? seed) - 1);
    } else {
      l.add(id);
      next[id] = (next[id] ?? seed) + 1;
    }
    setLikedSet(l);
    setLikeCounts(next);
    persistSets(undefined, l);
  };

  const ask = async () => {
    if (!query.trim()) {
      setOpen(true); // allow opening empty, user can type then
      setDragY(0);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "posts"));
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      if (!all.length) {
        setResults([]);
        setOpen(true);
        setDragY(0);
        setLoading(false);
        return;
      }
      const CAP = 600;
      const posts = all.slice(0, CAP);
      const postTexts = posts.map((p) =>
        [p.title || "", p.description || "", Array.isArray(p.tags) ? p.tags.join(" ") : "", p.location || "", p.category || ""].join(" • ")
      );
      const vectors = await embedBatch([query, ...postTexts]);
      const qv = vectors[0];
      const pv = vectors.slice(1);

      const scored: Result[] = posts.map((p, i) => {
        const sem = cosine(qv, pv[i]);
        const lex = lexicalScore(query, postTexts[i]);
        let sub = fmtDateMaybe(p.eventDate);
        if (p.location) sub = sub ? `${sub} • ${p.location}` : p.location;
        const qTokens = new Set(tokenize(query));
        const overlap = [...new Set(tokenize(postTexts[i]).filter((t) => qTokens.has(t)))].slice(0, 6);
        return {
          id: p.id,
          title: p.title || "",
          sub,
          imageUrl: p.imageUrl || null,
          likedCount: p.likedCount ?? 0,
          href: `/p/${p.id}`,
          why: { semantic: Number(sem.toFixed(3)), lexical: Number(lex.toFixed(3)), overlap },
        };
      });

      scored.sort(
        (a, b) => 0.75 * b.why.semantic + 0.25 * b.why.lexical - (0.75 * a.why.semantic + 0.25 * a.why.lexical)
      );

      const seeded: Record<string, number> = {};
      scored.forEach((x) => (seeded[x.id] = x.likedCount ?? 0));
      setLikeCounts(seeded);

      setResults(scored.slice(0, 20));
      setOpen(true);
      setDragY(0);
    } catch (e) {
      console.error(e);
      setResults([]);
      setOpen(true);
      setDragY(0);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const d = await getDoc(doc(db, "posts", id));
      if (!d.exists()) {
        setDetail(null);
        setDetailLoading(false);
        return;
      }
      const p = d.data() as any;
      setDetail({
        id: d.id,
        title: p.title || "",
        description: p.description || "",
        location: p.location || "",
        category: p.category || "",
        tags: Array.isArray(p.tags) ? p.tags : [],
        imageUrl: p.imageUrl || null,
        likedCount: p.likedCount ?? 0,
        eventDate: p.eventDate,
        authorName: p.authorName || "",
        orgName: p.orgName || "",
      });
      setDetailOpen(true);
    } catch (e) {
      console.error(e);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      {/* Trigger — bottom-right; above tab row on small screens */}
      <button
        onClick={() => { setOpen(true); setDragY(0); }}
        className="
          fixed z-40 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg active:scale-95
          bg-black hover:bg-neutral-800
          right-3 bottom-[88px]   /* tweak to sit above your tabs */
          md:bottom-5 md:right-5
        "
        aria-label="Ask AI"
        title="Ask AI"
      >
        ✨ Ask AI
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition ${
          open ? "pointer-events-auto bg-black/40" : "pointer-events-none bg-transparent"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        aria-hidden={!open}
      />

      {/* Sheet (drag to open/close) */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-5xl
          rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-950
        "
        style={{
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: withTransition ? "transform 180ms ease" : "none",
          willChange: "transform",
        }}
      >
        {/* Drag header (handle + title) */}
        <div
          className="select-none"
          style={{ touchAction: "none" }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div className="mx-auto my-3 h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="px-4 pb-2">
            <div className="text-base font-semibold">Ask AI</div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-5">
          {/* input row */}
          <div className="flex gap-2">
            <input
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Find events, free food, opportunities…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              autoFocus
            />
            <button
              onClick={ask}
              className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-neutral-800"
            >
              Ask
            </button>
          </div>

          {/* results */}
          <div className="mt-4 grid gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-zinc-600 dark:border-t-white" />
                Thinking…
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="text-sm text-zinc-500">No matches yet. Try a different phrase.</div>
            )}

            {!loading &&
              results.map((r) => {
                const [savedIds, likedIds] = [savedSet, likedSet];
                const likes = (r.id in likeCounts ? likeCounts[r.id] : r.likedCount) ?? 0;

                return (
                  <article
                    key={r.id}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <button
                      onClick={() => openDetail(r.id)}
                      className="grid w-full grid-cols-[90px_1fr] gap-3 p-3 text-left sm:grid-cols-[120px_1fr]"
                    >
                      <div className="relative h-[90px] w-[90px] overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800 sm:h-[120px] sm:w-[120px]">
                        {r.imageUrl ? (
                          <Image src={r.imageUrl} alt={r.title} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xs text-zinc-600 dark:text-zinc-300">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-[15px] font-semibold">{r.title}</h3>
                        {r.sub && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{r.sub}</p>}

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleLike(r.id);
                              }}
                              className="cursor-pointer rounded-full bg-black/5 px-2 py-1 text-xs font-medium dark:bg-white/10"
                              aria-label="Like"
                            >
                              {(likedIds.has(r.id) ? "❤️" : "🤍") + " " + likes.toLocaleString()}
                            </span>
                            <span
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSave(r.id);
                              }}
                              className="cursor-pointer rounded-full bg-black/5 px-2 py-1 text-xs font-medium dark:bg-white/10"
                              aria-label="Save"
                            >
                              {savedIds.has(r.id) ? "🔖 Saved" : "🔖 Save"}
                            </span>
                          </div>

                          <details className="text-xs">
                            <summary className="cursor-pointer select-none text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                              Why this
                            </summary>
                            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                              <div>Semantic: {r.why.semantic.toFixed(3)}</div>
                              <div>Lexical: {r.why.lexical.toFixed(3)}</div>
                              {r.why.overlap.length > 0 && (
                                <div className="mt-1">
                                  Overlap:{" "}
                                  {r.why.overlap.map((w) => (
                                    <code key={w} className="mr-1 rounded bg-zinc-100 px-1 py-[1px] dark:bg-zinc-800">
                                      {w}
                                    </code>
                                  ))}
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
          </div>
        </div>
      </div>

      {/* Post detail (unchanged) */}
      <div
        className={`fixed inset-0 z-50 transition ${
          detailOpen ? "pointer-events-auto bg-black/40" : "pointer-events-none bg-transparent"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDetailOpen(false);
        }}
      >
        <div
          className="
            fixed inset-x-0 bottom-0 mx-auto w-full max-w-3xl
            rounded-t-2xl bg-white shadow-2xl transition-transform dark:bg-zinc-950
          "
          style={{
            transform: `translateY(${detailOpen ? 0 : 100}%)`,
            transition: "transform 160ms ease",
          }}
        >
          <div className="mx-auto my-3 h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="px-4 pb-6">
            {detailLoading && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-zinc-600 dark:border-t-white" />
                Loading…
              </div>
            )}

            {!detailLoading && detail && (
              <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="relative h-56 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 sm:h-72">
                  {detail.imageUrl ? (
                    <Image src={detail.imageUrl} alt={detail.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-zinc-600 dark:text-zinc-300">
                      No image
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-4">
                  <h1 className="text-lg font-semibold">{detail.title}</h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {fmtDateMaybe(detail.eventDate)}
                    {detail.location ? (fmtDateMaybe(detail.eventDate) ? " • " : "") + detail.location : ""}
                  </p>

                  {detail.tags && detail.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {detail.tags.map((t) => (
                        <span key={t} className="rounded-full bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {detail.description && (
                    <p className="whitespace-pre-wrap text-[15px] leading-6 text-zinc-800 dark:text-zinc-200">
                      {detail.description}
                    </p>
                  )}

                  <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {detail.authorName && <span>By {detail.authorName}</span>}
                    {detail.orgName && <span>{detail.authorName ? " • " : ""}{detail.orgName}</span>}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(detail.id)}
                      className="rounded-full bg-black/5 px-2 py-1 text-xs font-medium dark:bg-white/10"
                    >
                      {( (likedSet.has(detail.id) ? "❤️" : "🤍") + " " +
                        (likeCounts[detail.id] ?? detail.likedCount ?? 0).toLocaleString() )}
                    </button>
                    <button
                      onClick={() => toggleSave(detail.id)}
                      className="rounded-full bg-black/5 px-2 py-1 text-xs font-medium dark:bg-white/10"
                    >
                      {savedSet.has(detail.id) ? "🔖 Saved" : "🔖 Save"}
                    </button>
                  </div>

                  <div className="pt-3">
                    <Link
                      href={`/p/${detail.id}`}
                      className="text-xs font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100"
                    >
                      Open full page
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {!detailLoading && !detail && (
              <div className="text-sm text-zinc-500">Post not found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
