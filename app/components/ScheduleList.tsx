"use client";

import * as React from "react";
import EventCard from "./EventCard";

export type ScheduleItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string | null;
  eventDate: any;
  createdAt: any;
  saved?: boolean;
  likedCount?: number;
  author?: {
    uid: string;
    name?: string;
    photoURL?: string | null;
  };
};

type Props = {
  items: ScheduleItem[];
  emptyLabel?: string;
  pageSize?: number; // default 12 (3 rows x 4 pages, tweak as you like)
};

export default function ScheduleList({
  items,
  emptyLabel = "Nothing yet.",
  pageSize = 12,
}: Props) {
  const [page, setPage] = React.useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageItems = React.useMemo(
    () => items.slice(page * pageSize, page * pageSize + pageSize),
    [items, page, pageSize]
  );

  if (!items.length) {
    return (
      <div className="mx-auto w-full max-w-[1700px] px-6">
        <div className="grid place-items-center rounded-2xl border border-zinc-200 py-16 text-center">
          <div className="mb-3 text-6xl">🎟️</div>
          <p className="text-sm text-zinc-500">{emptyLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6">
      {/* EXACTLY 3 COLUMNS on md+; 1 column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {pageItems.map((it) => (
          <div key={it.id} className="h-full">
            <EventCard item={it} />
          </div>
        ))}
      </div>

      {/* Pager */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === 0}
          >
            ← Prev
          </button>
          <div className="select-none rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700">
            Page {page + 1} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page + 1 >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
