import { useEffect, useState } from "react";

/** Prévisualisation locale — data: URL (compatible CSP sans blob:). */
export function useBlobObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (cancelled || typeof reader.result !== "string") return;
      requestAnimationFrame(() => {
        if (!cancelled) setUrl(reader.result as string);
      });
    };

    reader.onerror = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (!cancelled) setUrl(null);
      });
    };

    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
    };
  }, [file]);

  if (!file) return null;
  return url;
}
