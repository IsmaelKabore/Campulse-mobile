// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import FloatingAI from "./components/FloatingAI";

export const viewport: Viewport = { themeColor: "#000000" };
export const metadata: Metadata = {
  title: "Berkeley Events",
  description: "Discover campus events, free food, and opportunities",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var t = (saved === 'light' || saved === 'dark') ? saved : (prefersDark ? 'dark' : 'light');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch(_) {}
})();`,
          }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased dark:bg-zinc-900 dark:text-zinc-100">
        {children}

        {/* AI button shows only after login; desktop bottom-right, mobile under tabs */}
        <FloatingAI />
      </body>
    </html>
  );
}
