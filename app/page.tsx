// app/page.tsx  (HomePage)
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import MockDeviceDemo from "./components/MockDeviceDemo";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

type TaglineParts = { before: string; highlight: string; after: string };

export default function HomePage() {
  const [tagline, setTagline] = useState<TaglineParts>({
    before: "Find the best",
    highlight: "Events",
    after: "around campus.",
  });

  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);

  // track auth just for landing CTA behavior
  useState(() => {
    const off = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => off();
  });

  const handleDemoClick = () => {
    // tap/click on the device demo -> go where it makes sense
    if (uid) router.push("/events");
    else router.push("/sign-up");
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-6 px-4 py-6 sm:gap-8 sm:py-10">
      {/* Device mock (tap = CTA) */}
      <div className="w-full">
        <div onClick={handleDemoClick} className="cursor-pointer">
          <MockDeviceDemo
            onAnswerShown={(t) => {
              if (!t) return;
              const toParts = (s: string): TaglineParts => {
                if (/free food/i.test(s)) return { before: "Spot", highlight: "Free Food", after: "fast." };
                if (/opportunit/i.test(s)) return { before: "Discover on-campus", highlight: "Opportunities", after: "" };
                return { before: "Find your next", highlight: "Hangout", after: "" };
              };
              setTagline(toParts(t));
            }}
          />
        </div>
      </div>

      {/* Floating, synchronized headline */}
      <motion.h1
        key={`${tagline.before}-${tagline.highlight}-${tagline.after}`}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: [0, -2, 0, 2, 0], scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 0.55, 0.36, 1],
          y: { duration: 2.6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        }}
        className="px-2 text-center text-[22px] font-semibold tracking-tight text-zinc-900 sm:text-5xl"
      >
        <span>{tagline.before} </span>
        <span className="align-baseline text-[26px] font-semibold text-zinc-500 sm:text-6xl">
          {tagline.highlight}
        </span>
        <span> {tagline.after}</span>
      </motion.h1>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <Link
          href="/sign-up"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:px-6 sm:py-3 sm:text-base"
        >
          Try it out
        </Link>
        <Link
          href="/login"
          className="text-xs text-zinc-700 underline underline-offset-4 hover:opacity-80 sm:text-sm"
        >
          Already have an account? Sign in →
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-6 w-full text-center text-[11px] text-zinc-500 sm:mt-10">
        <div className="flex items-center justify-center gap-3">
          <Link href="/terms" className="hover:text-zinc-700 transition-colors">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-zinc-700 transition-colors">Privacy</Link>
          <span>·</span>
          <span>© 2025</span>
        </div>
      </footer>
    </main>
  );
}
