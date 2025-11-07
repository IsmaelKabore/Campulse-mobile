// app/components/TopTabs.tsx
"use client";

import Link from "next/link";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebaseConfig";
import ThemeToggle from "./ThemeToggle";

type Props = { active: "events" | "food" | "opportunities" };

const tabs = [
  { key: "events" as const, href: "/events", label: "Events", icon: "🎉" },
  { key: "food" as const, href: "/free-food", label: "Free Food", icon: "🍕" },
  { key: "opportunities" as const, href: "/opportunities", label: "Opportunities", icon: "💼" },
];

const CONFETTI = ["🎊", "✨", "🟡", "🟣", "🔵", "🟢", "🟠", "⭐"];

export default function TopTabs({ active }: Props) {
  const [uid, setUid] = React.useState<string | null>(null);

  React.useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => off();
  }, []);

  const guardHref = (href: string) => (uid ? href : "/login");
  const toProfileHref = uid ? `/profile/${uid}` : "/login";

  return (
    <header className="z-20">
      {/* Row 1: theme toggle on left, controls on right (normal flow, NOT sticky) */}
      <div className="border-b border-zinc-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={guardHref("/saved")}
              className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-50 active:scale-[0.98]"
              aria-label="Saved posts"
            >
              ★ Saved
            </Link>
            <Link
              href={guardHref("/create")}
              className="rounded-xl bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              + Create
            </Link>
            <Link
              href={toProfileHref}
              className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-50 active:scale-[0.98]"
            >
              <span className="mr-1">👤</span> {uid ? "Profile" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: dark tabs band — desktop/tablet only */}
      <div className="bg-zinc-900 hidden lg:block">
        <nav className="mx-auto max-w-none">
          <div className="relative flex items-center justify-center gap-3 px-4 py-4">
            <div className="flex max-w-6xl flex-wrap items-center justify-center gap-3">
              {tabs.map((t) => {
                const isActive = active === t.key;
                const isEvents = t.key === "events";
                const isFood = t.key === "food";
                const isOpp = t.key === "opportunities";

                return (
                  <motion.div key={t.key} className="group relative">
                    <Link
                      href={guardHref(t.href)}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "flex items-center gap-3 rounded-2xl px-6 py-3",
                        "text-base font-semibold transition",
                        "ring-1 ring-white/10",
                        isActive ? "bg-white/12 text-white" : "text-zinc-100 hover:text-white hover:bg-white/6",
                      ].join(" ")}
                    >
                      <motion.span
                        aria-hidden
                        className="text-2xl inline-block"
                        initial={false}
                        animate={isActive ? { scale: 1.06 } : { scale: 1 }}
                        whileHover={isFood ? { scale: 1.15 } : isOpp ? { rotate: 360 } : undefined}
                        transition={{ type: "spring", stiffness: 420, damping: 26 }}
                      >
                        {t.icon}
                      </motion.span>
                      <span>{t.label}</span>
                    </Link>

                    {isActive ? (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute -bottom-1 left-3 right-3 h-1 rounded-full bg-gradient-to-r from-white/90 to-white/60"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    ) : (
                      <motion.div
                        className="absolute -bottom-1 left-3 right-3 h-1 rounded-full bg-white/20 opacity-0 group-hover:opacity-100"
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      />
                    )}

                    <AnimatePresence>
                      {isEvents && (
                        <motion.div
                          className="pointer-events-none absolute -top-2 left-1/2 hidden h-0 w-0 lg:block"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {CONFETTI.map((c, i) => (
                            <motion.span
                              key={i}
                              className="absolute"
                              initial={{ opacity: 0, y: 0, x: 0, scale: 0.6, rotate: 0 }}
                              whileHover={{
                                opacity: [0, 1, 0],
                                y: -20 - Math.random() * 24,
                                x: (Math.random() - 0.5) * 60,
                                rotate: Math.random() * 120 - 60,
                                scale: 1,
                              }}
                              transition={{ duration: 0.9 + Math.random() * 0.4, ease: "easeOut" }}
                              style={{ top: 0, left: 0 } as React.CSSProperties}
                            >
                              {c}
                            </motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* MOBILE bottom tabs fixed */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl grid grid-cols-3 text-center">
          {tabs.map((t) => {
            const isActive = active === t.key;
            return (
              <Link
                key={t.key}
                href={guardHref(t.href)}
                className={`flex flex-col items-center justify-center py-2 text-xs font-medium
                  ${isActive ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"}`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className={`mt-0.5 ${isActive ? "underline underline-offset-4" : ""}`}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
