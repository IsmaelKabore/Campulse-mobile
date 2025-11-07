// app/components/AuthGate.tsx
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebaseConfig";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setAuthed(!!u);
      setReady(true);
    });
    return () => off();
  }, []);

  if (!ready || !authed) return null;
  return <>{children}</>;
}
