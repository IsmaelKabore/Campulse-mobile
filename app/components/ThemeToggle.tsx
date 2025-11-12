// app/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Mode>("light");

  // read saved or system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as Mode | null;
      const prefersDark =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial: Mode =
        saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";
      setTheme(initial);
    } catch {}
  }, []);

  // apply + persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const next: Mode = theme === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      className="rounded-full border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
