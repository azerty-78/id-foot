import { useEffect, useState } from "react";

/** Prévisualisation locale — data: URL (compatible CSP sans blob:). */
export function useBlobObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") {
        setUrl(reader.result);
      }
    };

    reader.onerror = () => {
      if (!cancelled) setUrl(null);
    };

    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
    };
  }, [file]);

  return url;
}
