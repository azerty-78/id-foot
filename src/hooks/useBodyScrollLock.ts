import { useEffect } from "react";
import { lockBodyScroll } from "@/lib/browserCompat";

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    return lockBodyScroll();
  }, [locked]);
}
