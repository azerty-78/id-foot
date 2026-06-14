"use client";

import { AlertCircle, Search, ShieldCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { GhostButton } from "@/components/admin/ui";
import { useHistoryOverlay } from "@/hooks/useHistoryOverlay";
import { extractToken } from "./extractToken";
import { ManualPlayerSearchPanel } from "./ManualPlayerSearchPanel";
import { playErrorTone, playSuccessChime } from "./playScanSound";
import { RecentScansStrip } from "./RecentScansStrip";
import { ScanSuccessOverlay } from "./ScanSuccessOverlay";
import type { RecentScan, ScanPhase, ValidatedPlayer } from "./types";

const DUPLICATE_MS = 2500;
const ERROR_DISMISS_MS = 2200;
const SCAN_BOX_MIN = 200;
const SCAN_BOX_MAX_MOBILE = 280;
const SCAN_BOX_MAX_DESKTOP = 300;

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

function mapApiPlayer(data: ValidatedPlayer & { valid?: boolean; error?: string }): ValidatedPlayer {
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
  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [player, setPlayer] = useState<ValidatedPlayer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validatedCount, setValidatedCount] = useState(0);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isLockedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);
  const lastScanAtRef = useRef(0);
  const errorTimerRef = useRef<number | null>(null);

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

  const validatePlayer = useCallback((validated: ValidatedPlayer) => {
    clearErrorTimer();
    playSuccessChime();
    setPlayer(validated);
    setValidatedCount((count) => count + 1);
    setRecentScans((items) =>
      [{ ...validated, validatedAt: Date.now() }, ...items].slice(0, 12),
    );
    setPhase("success");
    isLockedRef.current = true;
    setManualOpen(false);
  }, [clearErrorTimer]);

  const lookupToken = useCallback(
    async (rawValue: string) => {
      if (isLockedRef.current) return;

      const token = extractToken(rawValue);
      if (!token) {
        showError("QR code invalide ou illisible.");
        return;
      }

      const now = Date.now();
      if (token === lastTokenRef.current && now - lastScanAtRef.current < DUPLICATE_MS) {
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
      setCameraReady(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    const viewport = viewportRef.current;
    const rect = viewport?.getBoundingClientRect();
    const viewfinderWidth = rect?.width ?? window.innerWidth;
    const viewfinderHeight = rect?.height ?? window.innerHeight;
    const isMobile = window.innerWidth < 1024;

    applyScanBoxSize(viewport, viewfinderWidth, viewfinderHeight, isMobile);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: isMobile ? 20 : 16,
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

      setCameraReady(true);
    } catch {
      showError("Caméra inaccessible. Vérifiez les permissions du navigateur.");
      await stopScanner();
    }
  }, [lookupToken, showError, stopScanner]);

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
    void startScanner();
    return () => {
      clearErrorTimer();
      void stopScanner();
    };
  }, [clearErrorTimer, startScanner, stopScanner]);

  useEffect(() => {
    if (manualOpen) {
      void stopScanner();
      return;
    }

    if (phase === "scanning" && !scannerRef.current) {
      void startScanner();
    }
  }, [manualOpen, phase, startScanner, stopScanner]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let resizeTimer: number;

    const observer = new ResizeObserver(() => {
      const rect = viewport.getBoundingClientRect();
      const isMobile = window.innerWidth < 1024;
      applyScanBoxSize(viewport, rect.width, rect.height, isMobile);

      if (manualOpen || phase !== "scanning" || !scannerRef.current) {
        return;
      }

      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        void stopScanner().then(() => startScanner());
      }, 350);
    });

    observer.observe(viewport);

    return () => {
      observer.disconnect();
      window.clearTimeout(resizeTimer);
    };
  }, [manualOpen, phase, startScanner, stopScanner]);

  return (
    <div className="scanner-workspace scanner-workspace--mobile">
      <header className="scanner-toolbar">
        <div className="scanner-toolbar-copy">
          <p className="scanner-toolbar-title">Scan en cours</p>
          <p className="scanner-toolbar-subtitle">
            Pointez le QR code du joueur
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

          {cameraReady && phase === "scanning" && (
            <p className="scanner-hint">
              Alignez le QR code dans le cadre
            </p>
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
