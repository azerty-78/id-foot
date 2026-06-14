import { useEffect, useState } from "react";

/** URL objet pour prévisualiser un fichier local (setState différé hors corps synchrone de l'effet). */
export function useBlobObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const frame = requestAnimationFrame(() => {
      setUrl(objectUrl);
    });

    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(objectUrl);
      requestAnimationFrame(() => {
        setUrl((current) => (current === objectUrl ? null : current));
      });
    };
  }, [file]);

  return url;
}
