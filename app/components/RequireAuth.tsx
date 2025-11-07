// app/components/RequireAuth.tsx
"use client";

import * as React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

type Props = { children: React.ReactNode; redirectTo?: string; blockWhenSignedOut?: boolean };

/**
 * Default behavior (no props): acts as a gate that only renders children when authed.
 * If you pass blockWhenSignedOut=true, it will redirect to redirectTo (default "/") when signed out.
 * This lets us reuse it both for layout gating (no redirect) and protected pages (with redirect).
 */
export default function RequireAuth({
  children,
  redirectTo = "/",
  blockWhenSignedOut = false,
}: Props) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      const isAuthed = !!u;
      setAuthed(isAuthed);
      setReady(true);
      if (blockWhenSignedOut && !isAuthed) {
        router.replace(redirectTo);
      }
    });
    return () => off();
  }, [blockWhenSignedOut, redirectTo, router]);

  if (!ready || !authed) return null;
  return <>{children}</>;
}
