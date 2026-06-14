/** Utilitaires de compatibilité Chrome / Safari / Firefox. */

let bodyScrollLockCount = 0;
let savedBodyScrollY = 0;

/** Verrouille le scroll (fix iOS Safari : position fixed + restauration du scroll). */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  bodyScrollLockCount += 1;
  if (bodyScrollLockCount > 1) {
    return unlockBodyScroll;
  }

  savedBodyScrollY = window.scrollY;
  const { style } = document.body;

  style.overflow = "hidden";
  style.position = "fixed";
  style.top = `-${savedBodyScrollY}px`;
  style.left = "0";
  style.right = "0";
  style.width = "100%";

  return unlockBodyScroll;
}

function unlockBodyScroll(): void {
  if (typeof document === "undefined") return;

  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
  if (bodyScrollLockCount > 0) return;

  const { style } = document.body;
  const scrollY = savedBodyScrollY;

  style.overflow = "";
  style.position = "";
  style.top = "";
  style.left = "";
  style.right = "";
  style.width = "";
  window.scrollTo(0, scrollY);
}

type AudioContextConstructor = typeof AudioContext;

export function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Ctor =
    globalThis.AudioContext ??
    (
      globalThis as typeof globalThis & {
        webkitAudioContext?: AudioContextConstructor;
      }
    ).webkitAudioContext;

  if (!Ctor) return null;

  try {
    return new Ctor();
  } catch {
    return null;
  }
}

export async function resumeAudioContext(ctx: AudioContext): Promise<void> {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      // Safari peut refuser hors geste utilisateur
    }
  }
}

export function isMobileSafari(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return isIOS && /WebKit/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
}
