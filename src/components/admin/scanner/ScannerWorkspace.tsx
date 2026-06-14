"use client";

import { AlertCircle, Search, ShieldCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { GhostButton } from "@/components/admin/ui";
import { extractToken } from "./extractToken";
import { ManualPlayerSearchPanel } from "./ManualPlayerSearchPanel";
import { playErrorTone, playSuccessChime } from "./playScanSound";
import { RecentScansStrip } from "./RecentScansStrip";
import { ScanSuccessOverlay } from "./ScanSuccessOverlay";
import type { RecentScan, ScanPhase, ValidatedPlayer } from "./types";

const DUPLICATE_MS = 2500;
const ERROR_DISMISS_MS = 2200;

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

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const viewportWidth = Math.min(window.innerWidth - 48, 520);
      const boxSize = Math.max(220, Math.min(320, viewportWidth - 40));

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 16,
          qrbox: { width: boxSize, height: boxSize },
          aspectRatio: 1,
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

  const handleNextScan = useCallback(() => {
    clearErrorTimer();
    setPlayer(null);
    setErrorMessage(null);
    unlockScanner();
  }, [clearErrorTimer, unlockScanner]);

  const handleManualSelect = useCallback(
    (selected: ValidatedPlayer) => {
      validatePlayer(selected);
    },
    [validatePlayer],
  );

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

  return (
    <div className="scanner-workspace">
      <header className="scanner-toolbar">
        <div>
          <p className="scanner-toolbar-title">Contrôle d&apos;accès</p>
          <p className="scanner-toolbar-subtitle">
            Scannez le QR code — validation instantanée
          </p>
        </div>

        <div className="scanner-toolbar-actions">
          <span className="scanner-session-badge">
            <ShieldCheck size={16} aria-hidden />
            {validatedCount} validé{validatedCount > 1 ? "s" : ""}
          </span>
          <GhostButton
            type="button"
            icon={Search}
            size="sm"
            onClick={() => setManualOpen(true)}
          >
            Secours
          </GhostButton>
        </div>
      </header>

      <div className="scanner-stage">
        <div
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
          onClick={() => setManualOpen(false)}
          role="presentation"
        />
      )}

      <ManualPlayerSearchPanel
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSelectPlayer={handleManualSelect}
      />
    </div>
  );
}
