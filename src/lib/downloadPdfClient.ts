import { parseContentDispositionFilename } from "@/lib/playerCardFilename";

export async function downloadPdfFromApi(
  url: string,
  fallbackFilename: string,
): Promise<string> {
  const res = await fetch(url);

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Erreur lors du téléchargement.");
  }

  const filename = parseContentDispositionFilename(
    res.headers.get("Content-Disposition"),
    fallbackFilename,
  );

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);

  return filename;
}
