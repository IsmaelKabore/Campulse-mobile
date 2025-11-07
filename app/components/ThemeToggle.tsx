// app/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Mode>("light");
  const [mounted, setMounted] = useState(false);

  // read saved or system preference
  useEffect(() => {
    setMounted(true);
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
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Remove both classes first to ensure clean state
    root.classList.remove('dark');
    root.classList.remove('light');
    
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      document.body.style.backgroundColor = "#18181b"; // zinc-900
      document.body.style.color = "#fafafa"; // zinc-100
    } else {
      root.style.colorScheme = "light";
      document.body.style.backgroundColor = "#ffffff"; // white
      document.body.style.color = "#111827"; // gray-900
    }
    
    try { 
      localStorage.setItem("theme", theme); 
      console.log("Theme set to:", theme); // Debug log
    } catch {}
  }, [theme, mounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        className="rounded-full border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
        aria-label="Toggle theme"
        title="Toggle theme"
        disabled
      >
        ☀️ Light
      </button>
    );
  }

  const next: Mode = theme === "dark" ? "light" : "dark";

  const handleToggle = () => {
    console.log("Toggle clicked. Current theme:", theme, "Next theme:", next);
    setTheme(next);
  };

  return (
    <button
      onClick={handleToggle}
      className="rounded-full border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
