"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

export function InactiveSessionGuard() {
  const { data: session, status } = useSession();
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || signingOutRef.current) {
      return;
    }

    const inactive =
      session?.user?.active === false || !session?.user?.id;

    if (inactive) {
      signingOutRef.current = true;
      void signOut({ callbackUrl: "/admin/signin?reason=session-expired" });
    }
  }, [session?.user?.active, session?.user?.id, status]);

  return null;
}
