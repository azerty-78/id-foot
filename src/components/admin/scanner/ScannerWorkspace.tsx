"use client";

import { AlertCircle, Camera, Search, ShieldCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { GhostButton, PrimaryButton } from "@/components/admin/ui";
import { useHistoryOverlay } from "@/hooks/useHistoryOverlay";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { isMobileDevice, isMobileSafari } from "@/lib/browserCompat";
import {
  getCameraErrorMessage,
  getScannerCameraBlockedMessage,
  pickCameraStartTarget,
  type CameraStartTarget,
} from "./cameraUtils";
import { extractToken } from "./extractToken";
import { ManualPlayerSearchPanel } from "./ManualPlayerSearchPanel";
import { playErrorTone, playSuccessChime } from "./playScanSound";
import {
  queryCameraPermission,
  markScannerCameraGranted,
  subscribeCameraPermission,
  isCameraPermissionDeniedError,
  shouldAttemptCameraAutoStart,
} from "./scannerSession";
import { RecentScansStrip } from "./RecentScansStrip";
import { ScanSuccessOverlay } from "./ScanSuccessOverlay";
import type { ScanPhase, ValidatedPlayer, QrPlayerResponse } from "./types";
import { mapQrResponseToValidatedPlayer } from "./types";
import { useScannerSession } from "./useScannerSession";

const DUPLICATE_MS = 2500;
const ERROR_DISMISS_MS = 2200;
const SCAN_BOX_MIN = 200;
const SCAN_BOX_MAX_MOBILE = 280;
const SCAN_BOX_MAX_DESKTOP = 300;
const RESIZE_RESTART_DELTA = 48;
const CAMERA_START_TIMEOUT_MS = 12000;

type CameraStatus = "idle" | "needs-gesture" | "starting" | "active" | "denied";

function waitForViewportPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function waitForViewportReady(
  viewport: HTMLElement | null,
  attempts = 8,
): Promise<{ width: number; height: number }> {
  for (let i = 0; i < attempts; i += 1) {
    const rect = viewport?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;

    if (width >= 80 && height >= 80) {
      return { width, height };
    }

    await waitForViewportPaint();
  }

  return {
    width: viewport?.getBoundingClientRect().width ?? window.innerWidth,
    height: viewport?.getBoundingClientRect().height ?? window.innerHeight,
  };
}

async function startHtml5QrcodeCamera(
  scanner: Html5Qrcode,
  targets: CameraStartTarget[],
  scanConfig: {
    fps: number;
    qrbox: (width: number, height: number) => { width: number; height: number };
    aspectRatio: number;
    disableFlip: boolean;
  },
  onScan: (decodedText: string) => void,
): Promise<void> {
  let lastError: unknown;

  for (const target of targets) {
    try {
      await scanner.start(target, scanConfig, onScan, () => undefined);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Impossible d'ouvrir la caméra.");
}

function computeScanBoxSize(
  viewfinderWidth: number,
  viewfinderHeight: number,
  isMobile: boolean,
): number {
  const max = isMobile ? SCAN_BOX_MAX_MOBILE : SCAN_BOX_MAX_DESKTOP;
  const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
  const ratio = isMobile ? 0.72 : 0.68;
  const size = Math.floor(minEdge * ratio);

  return Math.max(SCAN_BOX_MIN, Math.min(max, size));
}

function applyScanBoxSize(
  viewport: HTMLElement | null,
  width: number,
  height: number,
  isMobile: boolean,
): number {
  const boxSize = computeScanBoxSize(width, height, isMobile);
  viewport?.style.setProperty("--scan-box-size", `${boxSize}px`);
  return boxSize;
}

function mapApiPlayer(data: QrPlayerResponse): ValidatedPlayer {
  return mapQrResponseToValidatedPlayer(data);
}

export function ScannerWorkspace() {
  const { data: session } = useSession();
  const scanOnly = session?.user?.scanOnly === true;
  const {
    ready: sessionReady,
    validatedCount,
    recentScans,
    registerValidation,
    resetSession,
    wasCameraGrantedBefore,
  } = useScannerSession();

  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [player, setPlayer] = useState<ValidatedPlayer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("needs-gesture");
  const [cameraPromptMessage, setCameraPromptMessage] = useState<string | null>(
    () => getScannerCameraBlockedMessage(),
  );

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isLockedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);
  const lastScanAtRef = useRef(0);
  const errorTimerRef = useRef<number | null>(null);
  const startInFlightRef = useRef(false);
  const lastViewportSizeRef = useRef({ width: 0, height: 0 });
  const autoStartAttemptedRef = useRef(false);
  const manualOpenRef = useRef(manualOpen);

  useEffect(() => {
    manualOpenRef.current = manualOpen;
  }, [manualOpen]);

  const clearErrorTimer = useCallback(() => {
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const unlockScanner = useCallback(() => {
    isLockedRef.current = false;
    setPhase("scanning");
    setErrorMessage(null);
  }, []);

  const showError = useCallback(
    (message: string) => {
      clearErrorTimer();
      playErrorTone();
      setPlayer(null);
      setErrorMessage(message);
      setPhase("error");
      isLockedRef.current = true;

      errorTimerRef.current = window.setTimeout(() => {
        unlockScanner();
      }, ERROR_DISMISS_MS);
    },
    [clearErrorTimer, unlockScanner],
  );

  const validatePlayer = useCallback(
    (validated: ValidatedPlayer) => {
      clearErrorTimer();
      playSuccessChime();
      setPlayer(validated);
      registerValidation({
        ...validated,
        validatedAt: Date.now(),
      });
      setPhase("success");
      isLockedRef.current = true;
      setManualOpen(false);
    },
    [clearErrorTimer, registerValidation],
  );

  const lookupToken = useCallback(
    async (rawValue: string) => {
      if (isLockedRef.current) return;

      const token = extractToken(rawValue);
      if (!token) {
        showError("QR code invalide ou illisible.");
        return;
      }

      const now = Date.now();
      if (
        token === lastTokenRef.current &&
        now - lastScanAtRef.current < DUPLICATE_MS
      ) {
        return;
      }

      lastTokenRef.current = token;
      lastScanAtRef.current = now;
      isLockedRef.current = true;
      setPhase("loading");
      setErrorMessage(null);

      try {
        const res = await fetch(`/api/qr/${token}`);
        const data = (await res.json()) as QrPlayerResponse;

        if (!res.ok || !data.valid) {
          throw new Error(data.error ?? "Joueur introuvable.");
        }

        validatePlayer(mapApiPlayer(data));
      } catch (err) {
        showError(err instanceof Error ? err.message : "QR code invalide.");
      }
    },
    [showError, validatePlayer],
  );

  const stopScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current.clear();
    } catch {
      // ignore cleanup errors
    } finally {
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async (): Promise<boolean> => {
    if (scannerRef.current || startInFlightRef.current || manualOpen) return false;

    const blockedMessage = getScannerCameraBlockedMessage();
    if (blockedMessage) {
      setCameraPromptMessage(blockedMessage);
      setCameraStatus("needs-gesture");
      return false;
    }

    startInFlightRef.current = true;
    setCameraStatus("starting");
    setCameraPromptMessage(null);
    setErrorMessage(null);

    const viewport = viewportRef.current;
    const isMobile = isMobileDevice();
    const { width: viewfinderWidth, height: viewfinderHeight } =
      await waitForViewportReady(viewport);

    applyScanBoxSize(viewport, viewfinderWidth, viewfinderHeight, isMobile);
    lastViewportSizeRef.current = {
      width: viewfinderWidth,
      height: viewfinderHeight,
    };

    const startTimeout = window.setTimeout(() => {
      if (startInFlightRef.current) {
        startInFlightRef.current = false;
        setCameraStatus("needs-gesture");
        setCameraPromptMessage(
          "La caméra met trop de temps à répondre. Appuyez sur « Activer la caméra » pour réessayer.",
        );
        void stopScanner();
      }
    }, CAMERA_START_TIMEOUT_MS);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const scanConfig = {
        fps: isMobile ? (isMobileSafari() ? 20 : 24) : 16,
        qrbox: (width: number, height: number) => {
          const size = computeScanBoxSize(width, height, isMobile);
          applyScanBoxSize(viewport, width, height, isMobile);
          return { width: size, height: size };
        },
        aspectRatio: 1,
        disableFlip: false,
      };

      const onScan = (decodedText: string) => {
        void lookupToken(decodedText);
      };

      const primaryTarget = await pickCameraStartTarget();
      const cameraTargets: CameraStartTarget[] = [
        primaryTarget,
        { facingMode: { ideal: "environment" } },
        { facingMode: "environment" },
        { facingMode: { ideal: "user" } },
        { facingMode: "user" },
      ].filter((target, index, list) => {
        const key =
          typeof target === "string" ? target : JSON.stringify(target);
        return (
          list.findIndex((item) =>
            typeof item === "string"
              ? item === key
              : JSON.stringify(item) === key,
          ) === index
        );
      });

      await startHtml5QrcodeCamera(scanner, cameraTargets, scanConfig, onScan);

      setCameraStatus("active");
      setCameraPromptMessage(null);
      markScannerCameraGranted();
      return true;
    } catch (error) {
      await stopScanner();

      const permission = await queryCameraPermission();
      const message = getCameraErrorMessage(error);
      setCameraPromptMessage(message);

      if (isCameraPermissionDeniedError(error) || permission === "denied") {
        setCameraStatus("denied");
      } else {
        setCameraStatus("needs-gesture");
      }
      return false;
    } finally {
      window.clearTimeout(startTimeout);
      startInFlightRef.current = false;
    }
  }, [lookupToken, manualOpen, stopScanner]);

  const requestCameraAccess = useCallback(() => {
    void startScanner();
  }, [startScanner]);

  const handleManualSelect = useCallback(
    (selected: ValidatedPlayer) => {
      validatePlayer(selected);
    },
    [validatePlayer],
  );

  const closeManual = useCallback(() => setManualOpen(false), []);
  const closeSuccess = useCallback(() => {
    clearErrorTimer();
    setPlayer(null);
    setErrorMessage(null);
    unlockScanner();
  }, [clearErrorTimer, unlockScanner]);

  const handleNextScan = useCallback(() => {
    closeSuccess();
  }, [closeSuccess]);

  useHistoryOverlay(manualOpen, closeManual, "scan-manual");
  useHistoryOverlay(phase === "success", closeSuccess, "scan-success");

  useBodyScrollLock(manualOpen || phase === "success");

  useEffect(() => {
    if (!sessionReady || autoStartAttemptedRef.current) return;
    autoStartAttemptedRef.current = true;

    let unsubscribePermission: () => void = () => {};

    void (async () => {
      await waitForViewportPaint();

      const permission = await queryCameraPermission();

      if (permission === "denied") {
        setCameraStatus("denied");
        return;
      }

      const grantedBefore = wasCameraGrantedBefore();
      const canAutoStart = shouldAttemptCameraAutoStart(
        permission,
        grantedBefore,
      );

      if (canAutoStart) {
        const started = await startScanner();
        if (!started) {
          setCameraStatus("needs-gesture");
        }
      } else {
        setCameraStatus("needs-gesture");
      }

      unsubscribePermission = subscribeCameraPermission((state) => {
        if (state !== "granted") return;
        if (
          scannerRef.current ||
          startInFlightRef.current ||
          manualOpenRef.current
        ) {
          return;
        }
        void startScanner();
      });
    })();

    return () => {
      unsubscribePermission();
    };
  }, [sessionReady, startScanner, wasCameraGrantedBefore]);

  useEffect(() => {
    if (manualOpen) {
      void stopScanner();
      return;
    }

    if (
      sessionReady &&
      phase === "scanning" &&
      !scannerRef.current &&
      !startInFlightRef.current &&
      cameraStatus === "active"
    ) {
      void startScanner();
    }
  }, [manualOpen, phase, cameraStatus, sessionReady, startScanner, stopScanner]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      if (manualOpen || phase !== "scanning") return;
      if (cameraStatus === "denied" || cameraStatus === "needs-gesture") return;
      if (isMobileDevice() && cameraStatus !== "active") return;
      if (!scannerRef.current && !startInFlightRef.current) {
        void startScanner();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onVisibilityChange);
    };
  }, [cameraStatus, manualOpen, phase, startScanner]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let resizeTimer: number;

    const observer = new ResizeObserver(() => {
      const rect = viewport.getBoundingClientRect();
      const isMobile = isMobileDevice();
      applyScanBoxSize(viewport, rect.width, rect.height, isMobile);

      const prev = lastViewportSizeRef.current;
      const widthDelta = Math.abs(rect.width - prev.width);
      const heightDelta = Math.abs(rect.height - prev.height);
      const restartDelta = isMobile ? RESIZE_RESTART_DELTA * 2 : RESIZE_RESTART_DELTA;

      if (
        widthDelta < restartDelta &&
        heightDelta < restartDelta
      ) {
        return;
      }

      lastViewportSizeRef.current = { width: rect.width, height: rect.height };

      if (manualOpen || phase !== "scanning" || !scannerRef.current) {
        return;
      }

      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        void stopScanner().then(() => startScanner());
      }, 280);
    });

    observer.observe(viewport);

    return () => {
      observer.disconnect();
      window.clearTimeout(resizeTimer);
    };
  }, [manualOpen, phase, startScanner, stopScanner]);

  useEffect(() => {
    return () => {
      clearErrorTimer();
      void stopScanner();
    };
  }, [clearErrorTimer, stopScanner]);

  const showCameraPrompt =
    (cameraStatus === "needs-gesture" ||
      cameraStatus === "denied" ||
      cameraStatus === "idle") &&
    phase !== "success" &&
    phase !== "loading" &&
    phase !== "error";
  const showCameraLoading = cameraStatus === "starting";
  const defaultCameraPromptText =
    cameraStatus === "denied"
      ? "L'accès a été refusé. Autorisez la caméra dans les paramètres du navigateur, puis réessayez."
      : "Appuyez pour activer la caméra arrière. Le navigateur vous demandera confirmation.";

  return (
    <div className="scanner-workspace scanner-workspace--mobile">
      <header className="scanner-toolbar">
        <div className="scanner-toolbar-copy">
          <p className="scanner-toolbar-title">
            {cameraStatus === "active" ? "Scan en cours" : "Scanner QR"}
          </p>
          <p className="scanner-toolbar-subtitle">
            {showCameraPrompt
              ? "Autorisez la caméra pour commencer"
              : "Pointez le QR code du joueur"}
          </p>
        </div>

        <div className="scanner-toolbar-actions">
          <span className="scanner-session-badge">
            <ShieldCheck size={16} aria-hidden />
            {validatedCount}
          </span>
          <GhostButton
            type="button"
            icon={Search}
            size="sm"
            onClick={() => setManualOpen(true)}
            className="scanner-rescue-btn"
          >
            <span className="scanner-rescue-label">Secours</span>
          </GhostButton>
        </div>
      </header>

      <div className="scanner-stage">
        <div
          ref={viewportRef}
          className={`scanner-viewport ${
            phase === "loading" ? "scanner-viewport--loading" : ""
          } ${phase === "success" ? "scanner-viewport--paused" : ""} ${
            showCameraPrompt ? "scanner-viewport--camera-blocked" : ""
          } ${phase === "error" ? "scanner-viewport--error" : ""}`}
        >
          <div id="qr-reader" className="scanner-reader" />

          <div className="scanner-frame" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>

          {showCameraPrompt && (
            <div className="scanner-camera-prompt">
              <div className="scanner-camera-prompt-card">
                <span className="scanner-camera-prompt-icon" aria-hidden>
                  <Camera size={28} strokeWidth={2} />
                </span>
                <p className="scanner-camera-prompt-title">Accès caméra</p>
                <p className="scanner-camera-prompt-text">
                  {cameraPromptMessage ?? defaultCameraPromptText}
                </p>
                <PrimaryButton
                  type="button"
                  icon={Camera}
                  className="scanner-camera-prompt-btn w-full"
                  onClick={requestCameraAccess}
                >
                  {cameraStatus === "denied" ? "Réessayer" : "Activer la caméra"}
                </PrimaryButton>
              </div>
            </div>
          )}

          {showCameraLoading && (
            <div className="scanner-camera-loading">
              <span className="scanner-loading-spinner" aria-hidden />
              <p>Ouverture de la caméra…</p>
            </div>
          )}

          {cameraStatus === "active" && phase === "scanning" && (
            <p className="scanner-hint">Alignez le QR code dans le cadre</p>
          )}

          {phase === "loading" && (
            <div className="scanner-loading">
              <span className="scanner-loading-spinner" aria-hidden />
              <p>Vérification…</p>
            </div>
          )}

          {phase === "error" && errorMessage && (
            <div className="scan-error-toast" role="alert">
              <AlertCircle size={18} aria-hidden />
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <RecentScansStrip scans={recentScans} onReset={resetSession} />

      {phase === "success" && player && (
        <ScanSuccessOverlay
          player={player}
          validatedCount={validatedCount}
          onNextScan={handleNextScan}
          scanOnly={scanOnly}
        />
      )}

      {manualOpen && (
        <div
          className="scan-manual-backdrop"
          onClick={closeManual}
          role="presentation"
        />
      )}

      <ManualPlayerSearchPanel
        open={manualOpen}
        onClose={closeManual}
        onSelectPlayer={handleManualSelect}
      />
    </div>
  );
}
