import { Html5Qrcode } from "html5-qrcode";
import { isMobileDevice, isSecureCameraContext } from "@/lib/browserCompat";

export type CameraStartTarget = string | MediaTrackConstraints;

const REAR_CAMERA_LABEL = /back|rear|environment|arrière|traseira|posteriore/i;

export function getScannerCameraBlockedMessage(): string | null {
  if (typeof window === "undefined") return null;
  if (!isSecureCameraContext()) {
    return "La caméra n'est accessible qu'en HTTPS (ou sur localhost). Ouvrez l'application via une connexion sécurisée.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Ce navigateur ne permet pas l'accès à la caméra.";
  }
  return null;
}

export async function pickCameraStartTarget(): Promise<CameraStartTarget> {
  try {
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras?.length) {
      return { facingMode: { ideal: "environment" } };
    }

    const rearCamera = cameras.find((camera) =>
      REAR_CAMERA_LABEL.test(camera.label),
    );
    if (rearCamera) return rearCamera.id;

    if (isMobileDevice() && cameras.length > 1) {
      return cameras[cameras.length - 1].id;
    }

    return cameras[0].id;
  } catch {
    return { facingMode: { ideal: "environment" } };
  }
}

export async function pickCameraStartTarget(): Promise<CameraStartTarget> {
  const blocked = getScannerCameraBlockedMessage();
  if (blocked) return blocked;

  if (error instanceof DOMException) {
    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      return "Accès caméra refusé. Autorisez la caméra dans les paramètres du navigateur, puis réessayez.";
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return "Aucune caméra détectée sur cet appareil.";
    }
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "La caméra est utilisée par une autre application. Fermez-la puis réessayez.";
    }
    if (error.name === "OverconstrainedError") {
      return "Impossible d'activer la caméra arrière. Réessayez ou changez de navigateur.";
    }
    if (error.name === "SecurityError") {
      return "Contexte non sécurisé : utilisez HTTPS pour activer la caméra.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible d'ouvrir la caméra. Réessayez.";
}
