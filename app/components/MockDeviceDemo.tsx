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

  const [typed, setTyped] = React.useState("");
  const [phase, setPhase] = React.useState<"typing" | "thinking" | "answer">("typing");

  // cycle scenes with: type (LTR) -> thinking -> answer (float 5s) -> next
  React.useEffect(() => {
    let stop = false;
    setTyped("");
    setPhase("typing");

    const run = async () => {
      // TYPE (left to right)
      const chars = scene.q.split("");
      for (let k = 0; k <= chars.length; k++) {
        if (stop) return;
        setTyped(chars.slice(0, k).join(""));
        await wait(32);
      }

      // THINK
      setPhase("thinking");
      await wait(700);
      if (stop) return;

      // ANSWER + notify page for tagline
      setPhase("answer");
      onAnswerShown?.(scene.tagline);

      // Let both the bubble & the card float gently for ~5s
      await wait(5000);
      if (stop) return;

      setI((x) => x + 1);
    };

    run();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="relative mx-auto grid place-items-center">
        {/* iPad on lg+ */}
        <div className="relative hidden lg:block">
          <Image
            src="/mockups/iPad.png"
            alt="iPad"
            width={980}
            height={720}
            priority
            className="pointer-events-none select-none h-auto w-[900px]"
          />
          <OverlayWindow
            variant="ipad"
            phase={phase}
            typed={typed}
            i={i}
            scene={scene}
          />
        </div>

        {/* iPhone on < lg */}
        <div className="relative block lg:hidden">
          <Image
            src="/mockups/iphone.png"
            alt="iPhone"
            width={420}
            height={860}
            priority
            className="pointer-events-none select-none h-auto w-[300px] sm:w-[340px]"
          />
          <OverlayWindow
            variant="iphone"
            phase={phase}
            typed={typed}
            i={i}
            scene={scene}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Overlay window pinned to the device glass ---------- */
function OverlayWindow({
  variant,
  phase,
  typed,
  i,
  scene,
}: {
  variant: "iphone" | "ipad";
  phase: "typing" | "thinking" | "answer";
  typed: string;
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
          {/* user bubble (typewriter) */}
          <motion.div
            key={`q-${i}`}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 260, damping: 22 },
            }}
            className={`ml-auto max-w-[86%] rounded-2xl bg-zinc-900 px-3 py-2 font-medium text-white ${
              variant === "ipad" ? "text-[16px] px-4 py-2.5" : "text-[13px]"
            }`}
            dir="ltr"
          >
            <motion.span
              className="inline-block"
              animate={phase === "answer" ? { y: [0, -1.5, 0, 1.5, 0] } : {}}
              transition={phase === "answer" ? { duration: 3.2, repeat: 1, ease: "easeInOut" } : undefined}
            >
              {typed || "\u00A0"}
            </motion.span>
            {phase === "typing" && <span className="ml-1 align-baseline">▍</span>}
          </motion.div>

          {/* searching*/}
          <AnimatePresence>
            {phase === "thinking" && (
              <motion.div
                key={`think-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`flex items-center gap-2 pl-1 text-zinc-500 ${
                  variant === "ipad" ? "text-[15px]" : "text-[12px]"
                }`}
              >
                <div
                  className={`animate-spin rounded-full border-2 border-zinc-300 border-t-black ${
                    variant === "ipad" ? "h-5 w-5" : "h-4 w-4"
                  }`}
                />
                Searching…
              </motion.div>
            )}
          </AnimatePresence>

          {/* siri-like single card answer */}
          <AnimatePresence mode="popLayout">
            {phase === "answer" && (
              <motion.div
                key={`a-${i}`}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
              >
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 3.2, repeat: 1, ease: "easeInOut" }}
                  className="mx-auto w-full"
                >
                  <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
                    {/* image — SHORTER on iPad so the full card fits without scroll */}
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

                    {/* text — slightly tighter on iPad */}
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

                      {/* likes strip — smaller avatars on iPad to save height */}
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
