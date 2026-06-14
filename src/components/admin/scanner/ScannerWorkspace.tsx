"use client";

import { AlertCircle, Camera, Search, ShieldCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { GhostButton, PrimaryButton } from "@/components/admin/ui";
import { useHistoryOverlay } from "@/hooks/useHistoryOverlay";
import { extractToken } from "./extractToken";
import { ManualPlayerSearchPanel } from "./ManualPlayerSearchPanel";
import { playErrorTone, playSuccessChime } from "./playScanSound";
import { queryCameraPermission, markScannerCameraGranted } from "./scannerSession";
import { RecentScansStrip } from "./RecentScansStrip";
import { ScanSuccessOverlay } from "./ScanSuccessOverlay";
import type { RecentScan, ScanPhase, ValidatedPlayer } from "./types";
import { useScannerSession } from "./useScannerSession";

const DUPLICATE_MS = 2500;
const ERROR_DISMISS_MS = 2200;
const SCAN_BOX_MIN = 200;
const SCAN_BOX_MAX_MOBILE = 280;
const SCAN_BOX_MAX_DESKTOP = 300;
const RESIZE_RESTART_DELTA = 48;

type CameraStatus = "idle" | "needs-gesture" | "starting" | "active" | "denied";

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

function mapApiPlayer(
  data: ValidatedPlayer & { valid?: boolean; error?: string },
): ValidatedPlayer {
  return {
    id: data.id,
    nom: data.nom,
    prenom: data.prenom,
    numero: data.numero,
    poste: data.poste,
    photo: data.photo,
    qrToken: data.qrToken,
    equipe: data.equipe,
  };
}

export function ScannerWorkspace() {
  const {
    ready: sessionReady,
    validatedCount,
    recentScans,
    registerValidation,
    wasCameraGrantedBefore,
  } = useScannerSession();

  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [player, setPlayer] = useState<ValidatedPlayer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isLockedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);
  const lastScanAtRef = useRef(0);
  const errorTimerRef = useRef<number | null>(null);
  const startInFlightRef = useRef(false);
  const lastViewportSizeRef = useRef({ width: 0, height: 0 });
  const autoStartAttemptedRef = useRef(false);

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
        const data = (await res.json()) as ValidatedPlayer & {
          error?: string;
          valid?: boolean;
        };

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

  const startScanner = useCallback(async () => {
    if (scannerRef.current || startInFlightRef.current || manualOpen) return;

    startInFlightRef.current = true;
    setCameraStatus("starting");
    setErrorMessage(null);

    const viewport = viewportRef.current;
    const rect = viewport?.getBoundingClientRect();
    const viewfinderWidth = rect?.width ?? window.innerWidth;
    const viewfinderHeight = rect?.height ?? window.innerHeight;
    const isMobile = window.innerWidth < 1024;

    applyScanBoxSize(viewport, viewfinderWidth, viewfinderHeight, isMobile);
    lastViewportSizeRef.current = {
      width: viewfinderWidth,
      height: viewfinderHeight,
    };

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: { ideal: "environment" } },
        {
          fps: isMobile ? 24 : 16,
          qrbox: (width, height) => {
            const size = computeScanBoxSize(width, height, isMobile);
            applyScanBoxSize(viewport, width, height, isMobile);
            return { width: size, height: size };
          },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decodedText) => {
          void lookupToken(decodedText);
        },
        () => undefined,
      );

      setCameraStatus("active");
      markScannerCameraGranted();
    } catch {
      setCameraStatus("denied");
      showError("Caméra inaccessible. Autorisez l'accès dans le navigateur.");
      await stopScanner();
    } finally {
      startInFlightRef.current = false;
    }
  }, [lookupToken, manualOpen, showError, stopScanner]);

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

  useEffect(() => {
    const shouldLock = manualOpen || phase === "success";
    if (!shouldLock) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [manualOpen, phase]);

  useEffect(() => {
    if (!sessionReady || autoStartAttemptedRef.current) return;
    autoStartAttemptedRef.current = true;

    void (async () => {
      const permission = await queryCameraPermission();
      const canAutoStart =
        permission === "granted" ||
        (wasCameraGrantedBefore() && permission !== "denied");

      if (canAutoStart) {
        void startScanner();
      } else if (permission === "denied") {
        setCameraStatus("denied");
      } else {
        setCameraStatus("needs-gesture");
      }
    })();
  }, [sessionReady, startScanner, wasCameraGrantedBefore]);

  useEffect(() => {
    if (manualOpen) {
      void stopScanner();
      return;
    }

    if (
      phase === "scanning" &&
      !scannerRef.current &&
      !startInFlightRef.current &&
      (cameraStatus === "active" ||
        cameraStatus === "idle" ||
        cameraStatus === "starting")
    ) {
      void startScanner();
    }
  }, [manualOpen, phase, cameraStatus, startScanner, stopScanner]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      if (manualOpen || phase !== "scanning") return;
      if (cameraStatus === "needs-gesture" || cameraStatus === "denied") return;
      if (!scannerRef.current) {
        void startScanner();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [cameraStatus, manualOpen, phase, startScanner]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let resizeTimer: number;

    const observer = new ResizeObserver(() => {
      const rect = viewport.getBoundingClientRect();
      const isMobile = window.innerWidth < 1024;
      applyScanBoxSize(viewport, rect.width, rect.height, isMobile);

      const prev = lastViewportSizeRef.current;
      const widthDelta = Math.abs(rect.width - prev.width);
      const heightDelta = Math.abs(rect.height - prev.height);

      if (
        widthDelta < RESIZE_RESTART_DELTA &&
        heightDelta < RESIZE_RESTART_DELTA
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
    cameraStatus === "needs-gesture" || cameraStatus === "denied";
  const showCameraLoading = cameraStatus === "starting";

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
          } ${phase === "success" ? "scanner-viewport--paused" : ""}`}
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
                  {cameraStatus === "denied"
                    ? "L'accès a été refusé. Autorisez la caméra dans les paramètres du navigateur, puis réessayez."
                    : "Appuyez pour activer la caméra arrière. Le navigateur vous demandera confirmation."}
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
        </div>

        {phase === "error" && errorMessage && (
          <div className="scan-error-toast" role="alert">
            <AlertCircle size={18} aria-hidden />
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      <RecentScansStrip scans={recentScans} />

      {phase === "success" && player && (
        <ScanSuccessOverlay
          player={player}
          validatedCount={validatedCount}
          onNextScan={handleNextScan}
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
