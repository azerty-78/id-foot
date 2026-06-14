import type { RecentScan } from "./types";

const SESSION_KEY = "idfoot-scanner-session";
const CAMERA_GRANTED_KEY = "idfoot-scanner-camera-granted";

export type ScannerSessionSnapshot = {
  validatedCount: number;
  recentScans: RecentScan[];
};

export type CameraPermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "unknown";

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
    localStorage.setItem(CAMERA_GRANTED_KEY, "1");
  } catch {
    // ignore
  }
}

export function wasScannerCameraGranted(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return (
      sessionStorage.getItem(CAMERA_GRANTED_KEY) === "1" ||
      localStorage.getItem(CAMERA_GRANTED_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export async function queryCameraPermission(): Promise<CameraPermissionState> {
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

export function subscribeCameraPermission(
  onChange: (state: CameraPermissionState) => void,
): () => void {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return () => {};
  }

  let status: PermissionStatus | null = null;
  const handler = () => onChange(status?.state ?? "unknown");

  void navigator.permissions
    .query({ name: "camera" as PermissionName })
    .then((result) => {
      status = result;
      result.addEventListener("change", handler);
      onChange(result.state);
    })
    .catch(() => undefined);

  return () => {
    status?.removeEventListener("change", handler);
  };
}

export function isCameraPermissionDeniedError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;

  return (
    error.name === "NotAllowedError" ||
    error.name === "PermissionDeniedError" ||
    error.name === "SecurityError"
  );
}

export function shouldAttemptCameraAutoStart(
  permission: CameraPermissionState,
  wasGrantedBefore: boolean,
): boolean {
  if (permission === "denied") return false;
  if (permission === "granted") return true;
  if (wasGrantedBefore) return true;

  // iOS / Android renvoient souvent "prompt" ou "unknown" même après accord.
  return permission === "prompt" || permission === "unknown";
}
