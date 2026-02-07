// app/components/TopTabs.tsx
"use client";

import Link from "next/link";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebaseConfig";

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
      {/* Row 1: controls on right (normal flow, NOT sticky) */}
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              href={guardHref("/saved")}
              className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Saved posts"
            >
              ★ Saved
            </Link>
            <Link
              href={guardHref("/create")}
              className="rounded-xl bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              + Create
            </Link>
            <Link
              href={toProfileHref}
              className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <span className="mr-1">👤</span> {uid ? "Profile" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: premium tabs band — desktop/tablet only */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 hidden lg:block border-b border-zinc-800/50">
        <nav className="mx-auto max-w-6xl">
          <div className="relative flex items-center justify-center gap-2 px-6 py-4">
            {tabs.map((t) => {
              const isActive = active === t.key;
              const isEvents = t.key === "events";

              return (
                <motion.div key={t.key} className="group relative">
                  <Link
                    href={guardHref(t.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "relative flex items-center gap-2.5 rounded-xl px-5 py-2.5",
                      "text-sm font-semibold transition-all duration-200",
                      isActive 
                        ? "bg-white text-zinc-900 shadow-lg shadow-black/20" 
                        : "text-zinc-300 hover:text-white hover:bg-white/5",
                    ].join(" ")}
                  >
                    <motion.span
                      aria-hidden
                      className="text-xl"
                      initial={false}
                      animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {t.icon}
                    </motion.span>
                    <span>{t.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl bg-white"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {isEvents && isActive && (
                      <motion.div
                        className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {CONFETTI.slice(0, 4).map((c, i) => (
                          <motion.span
                            key={i}
                            className="absolute text-xs"
                            initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              y: -15 - i * 3,
                              x: (i - 1.5) * 8,
                              scale: [0, 1, 0.8],
                            }}
                            transition={{ 
                              duration: 1.2 + i * 0.1, 
                              delay: i * 0.1,
                              ease: "easeOut" 
                            }}
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
        </nav>
      </div>

      {/* MOBILE bottom tabs fixed */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
        <div className="mx-auto max-w-3xl grid grid-cols-3">
          {tabs.map((t) => {
            const isActive = active === t.key;
            return (
              <Link
                key={t.key}
                href={guardHref(t.href)}
                className={`relative flex flex-col items-center justify-center py-3 text-xs font-medium transition-all duration-200
                  ${isActive 
                    ? "text-zinc-900 dark:text-zinc-100" 
                    : "text-zinc-500 dark:text-zinc-400"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute inset-x-0 top-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.span 
                  className="text-xl mb-1"
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {t.icon}
                </motion.span>
                <span className={isActive ? "font-semibold" : "font-medium"}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
