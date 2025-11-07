// app/components/RequireAuth.tsx
"use client";

import * as React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/"); // not logged in -> home
      else setReady(true);
    });
    return () => off();
  }, [router]);

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center text-sm text-zinc-500">
        Checking your session…
      </div>
    );
  }
  return <>{children}</>;
}
