import type { RecentScan } from "./types";

const SESSION_KEY = "idfoot-scanner-session";
const CAMERA_GRANTED_KEY = "idfoot-scanner-camera-granted";

export type ScannerSessionSnapshot = {
  validatedCount: number;
  recentScans: RecentScan[];
};

export function loadScannerSession(): ScannerSessionSnapshot {
  if (typeof window === "undefined") {
    return { validatedCount: 0, recentScans: [] };
  }

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { validatedCount: 0, recentScans: [] };

    const data = JSON.parse(raw) as Partial<ScannerSessionSnapshot>;
    return {
      validatedCount:
        typeof data.validatedCount === "number" ? data.validatedCount : 0,
      recentScans: Array.isArray(data.recentScans) ? data.recentScans : [],
    };
  } catch {
    return { validatedCount: 0, recentScans: [] };
  }
}

export function saveScannerSession(snapshot: ScannerSessionSnapshot): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // quota / private mode
  }
}

export function markScannerCameraGranted(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(CAMERA_GRANTED_KEY, "1");
  } catch {
    // ignore
  }
}

export function wasScannerCameraGranted(): boolean {
  if (typeof window === "undefined") return false;

  return sessionStorage.getItem(CAMERA_GRANTED_KEY) === "1";
}

export async function queryCameraPermission(): Promise<
  "granted" | "denied" | "prompt" | "unknown"
> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unknown";
  }

  try {
    const result = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    return result.state;
  } catch {
    return "unknown";
  }
}
