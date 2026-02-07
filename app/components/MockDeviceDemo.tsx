"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

/* ---------- Demo scenes ---------- */
type Scene = {
  q: string;
  answer: {
    title: string;
    desc: string;
    when: string;
    where: string;
    img: string;
    likes: number;
    likedBy: string[];
  };
  tagline?: string;
};

const scenes: Scene[] = [
  {
    q: "Free food on campus?",
    answer: {
      title: "Free Pizza — Engineering Library",
      desc: " Grab a slice and meet other students.",
      when: "Tonight · 8–10 PM",
      where: "Engineering Library",
      img: "/mockups/freefood.jpg",
      likes: 238,
      likedBy: [],
    },
    tagline: "Spot free food fast.",
  },
  {
    q: "Any company this week?",
    answer: {
      title: "Apple Info Session",
      desc: "Internships, new grad roles, and Q&A with engineers.",
      when: "Tue · 6–8 PM",
      where: "CS Building",
      img: "/mockups/Today-at-Apple-sessions-in-apple-store.jpg",
      likes: 412,
      likedBy: [],
    },
    tagline: "Discover on-campus opportunities.",
  },
  {
    q: "Fun event this weekend?",
    answer: {
      title: "Outdoor Movie Night",
      desc: "Classic movie under the stars. Bring blankets.",
      when: "Thu · 7:30–10 PM",
      where: "Campus Quad",
      img: "/mockups/movie-night.jpg",
      likes: 189,
      likedBy: [],
    },
    tagline: "Find your next hangout.",
  },
];

/* Small helper */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------- Component ---------- */
export default function MockDeviceDemo({
  onAnswerShown,
}: {
  onAnswerShown?: (tagline?: string) => void;
}) {
  const [i, setI] = React.useState(0);
  const scene = scenes[i % scenes.length];

  const [showNotification, setShowNotification] = React.useState(false);
  const [phase, setPhase] = React.useState<"writing" | "answer">("writing");

  // cycle scenes with immediate writing appearance -> notification popup -> next
  React.useEffect(() => {
    let stop = false;
    setPhase("writing");
    setShowNotification(false);

    const run = async () => {
      // Show writing immediately (no typewriter)
      await wait(800);
      if (stop) return;

      // Show notification popup
      setPhase("answer");
      setShowNotification(true);
      onAnswerShown?.(scene.tagline);

      // Keep notification visible for ~4s
      await wait(4000);
      if (stop) return;

      // Fade out and move to next
      setShowNotification(false);
      await wait(500);
      if (stop) return;

      setI((x) => x + 1);
    };

    run();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const [deviceLoaded, setDeviceLoaded] = React.useState(false);
  const [overlayReady, setOverlayReady] = React.useState(false);

  React.useEffect(() => {
    // Small delay to ensure device frame is rendered before overlay
    if (deviceLoaded) {
      const timer = setTimeout(() => setOverlayReady(true), 50);
      return () => clearTimeout(timer);
    }
  }, [deviceLoaded]);

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="relative mx-auto grid place-items-center">
        {/* iPad on lg+ */}
        <div className="relative hidden lg:block">
          <div className={`transition-opacity duration-300 ${deviceLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src="/mockups/iPad.png"
              alt="iPad"
              width={980}
              height={720}
              priority
              className="pointer-events-none select-none h-auto w-[900px]"
              onLoad={() => setDeviceLoaded(true)}
            />
          </div>
          {overlayReady && (
            <OverlayWindow
              variant="ipad"
              phase={phase}
              showNotification={showNotification}
              i={i}
              scene={scene}
            />
          )}
        </div>

        {/* iPhone on < lg */}
        <div className="relative block lg:hidden">
          <div className={`transition-opacity duration-300 ${deviceLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src="/mockups/iphone.png"
              alt="iPhone"
              width={420}
              height={860}
              priority
              className="pointer-events-none select-none h-auto w-[300px] sm:w-[340px]"
              onLoad={() => setDeviceLoaded(true)}
            />
          </div>
          {overlayReady && (
            <OverlayWindow
              variant="iphone"
              phase={phase}
              showNotification={showNotification}
              i={i}
              scene={scene}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Overlay window pinned to the device glass ---------- */
function OverlayWindow({
  variant,
  phase,
  showNotification,
  i,
  scene,
}: {
  variant: "iphone" | "ipad";
  phase: "writing" | "answer";
  showNotification: boolean;
  i: number;
  scene: Scene;
}) {
  // Tuned safe-area for each mock
  const style: React.CSSProperties =
    variant === "iphone"
      ? {
          position: "absolute",
          top: "5.2%",
          left: "10.8%",
          width: "78.8%",
          height: "89.7%",
          borderRadius: 28,
        }
      : {
          position: "absolute",
          top: "7.4%",
          left: "6%",
          width: "88%",
          height: "85%", // keep height but make content smaller to avoid scroll
          borderRadius: 22,
        };

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* NOTE: added `relative` so the notch can sit above the status bar */}
      <div
        className="pointer-events-auto overflow-hidden bg-white/98 shadow-sm ring-1 ring-black/10 relative"
        style={style}
      >
        {/* Status bar */}
        <div
          className={`flex items-center justify-between border-b border-zinc-200/70 bg-white/90 px-3 py-2 text-zinc-900 ${
            variant === "ipad" ? "px-4 py-3 text-[16px]" : "text-[12px]"
          }`}
        >
          <span className="font-semibold">9:41</span>
          <div className={`flex items-center text-zinc-700 ${variant === "ipad" ? "gap-4" : "gap-3"}`}>
            {/* wifi */}
            <svg
              width={variant === "ipad" ? 22 : 16}
              height={variant === "ipad" ? 14 : 10}
              viewBox="0 0 20 12"
              aria-hidden
            >
              <path
                d="M2 4c4-3 12-3 16 0M5 7c3-2 7-2 10 0M9 10c1-1 1-1 2 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {/* battery */}
            <div className="flex items-center">
              <div
                className={`border-current rounded-sm border ${
                  variant === "ipad" ? "h-[14px] w-[24px]" : "h-[10px] w-[18px]"
                }`}
              >
                <div className="h-full w-[70%] bg-zinc-800" />
              </div>
              <div
                className={`ml-[2px] rounded-sm bg-current ${
                  variant === "ipad" ? "h-[8px] w-[3px]" : "h-[6px] w-[2px]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* iPhone “Dynamic Island” / notch overlay (sits ABOVE the status bar) */}
        {variant === "iphone" && (
          <div
            className="
              pointer-events-none
              absolute left-1/2 -translate-x-1/2
              top-[6px]   /* tweak a couple px to match your PNG */
              h-[22px] w-[96px] rounded-[14px]
              bg-black/90
              shadow-[0_1px_3px_rgba(0,0,0,0.35)]
              z-10
            "
          />
        )}

        {/* Content area — iPad now NO SCROLL and the card is shorter */}
        <div
          className={`min-h-0 flex flex-col bg-zinc-50 pb-4 pt-4 ${
            variant === "ipad"
              ? "h-[calc(100%-80px)] gap-6 px-5 overflow-y-hidden"  // More space for home indicator
              : "h-[calc(100%-68px)] gap-5 px-3"  // More space for home indicator
          }`}
        >
          {/* user message bubble (popup animation) */}
          <motion.div
            key={`q-${i}`}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { 
                type: "spring", 
                stiffness: 350, 
                damping: 20,
                mass: 0.8 
              },
            }}
            className={`ml-auto max-w-[86%] rounded-2xl bg-zinc-900 px-3 py-2 font-medium text-white ${
              variant === "ipad" ? "text-[16px] px-4 py-2.5" : "text-[13px]"
            }`}
            dir="ltr"
          >
            {scene.q}
          </motion.div>

          {/* Bouncy notification popup */}
          <AnimatePresence mode="popLayout">
            {showNotification && (
              <motion.div
                key={`notification-${i}`}
                initial={{ opacity: 0, y: -30, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15,
                    mass: 0.8
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -20, 
                  scale: 0.95,
                  transition: { duration: 0.3, ease: "easeInOut" }
                }}
                className="w-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
                    {/* image — original size */}
                    <div
                      className={`relative w-full bg-zinc-100 ${
                        variant === "ipad" ? "aspect-[20/8]" : "aspect-square"
                      }`}
                    >
                      <Image
                        src={scene.answer.img}
                        alt={scene.answer.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* content */}
                    <div className={variant === "ipad" ? "p-4 bg-zinc-800" : "p-3 bg-zinc-800"}>
                      <div
                        className={`font-semibold ${
                          variant === "ipad" ? "text-[16px] text-white" : "text-[13px] text-white"
                        }`}
                      >
                        {scene.answer.title}
                      </div>
                      <div
                        className={`mt-0.5 ${
                          variant === "ipad" ? "text-[13px] text-zinc-300" : "text-[11px] text-zinc-300"
                        }`}
                      >
                        {scene.answer.when} · {scene.answer.where}
                      </div>
                      <p
                        className={`mt-2 line-clamp-2 ${
                          variant === "ipad" ? "text-[14px] text-zinc-200" : "text-[12px] text-zinc-200"
                        }`}
                      >
                        {scene.answer.desc}
                      </p>

                      {/* likes strip */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {scene.answer.likedBy.slice(0, 3).map((src) => (
                            <span
                              key={src}
                              className={`inline-block overflow-hidden rounded-full ${
                                variant === "ipad" ? "h-6 w-6 ring-2 ring-zinc-600" : "h-6 w-6 ring-2 ring-zinc-600"
                              }`}
                            >
                              <Image
                                src={src}
                                alt="avatar"
                                width={24}
                                height={24}
                                className="h-6 w-6 object-cover"
                                unoptimized
                              />
                            </span>
                          ))}
                        </div>
                        <div
                          className={`${
                            variant === "ipad" ? "text-[13px] text-zinc-400" : "text-[11px] text-zinc-400"
                          }`}
                        >
                          ♥ {scene.answer.likes.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Home indicator bar for both iPhone and iPad */}
        <div className="flex items-center justify-center bg-zinc-50 py-2">
          <div
            className={`rounded-full bg-zinc-400 ${
              variant === "ipad" 
                ? "h-[5px] w-[160px]"  // Slightly larger for iPad
                : "h-[4px] w-[134px]"  // Original iPhone size
            }`}
          />
        </div>
      </div>
    </div>
  );
}
