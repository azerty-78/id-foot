const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.82;
const COMPRESS_THRESHOLD = 400_000;

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.size <= COMPRESS_THRESHOLD && file.type === "image/jpeg") {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = image;
      const largest = Math.max(width, height);

      if (largest > MAX_DIMENSION) {
        const ratio = MAX_DIMENSION / largest;
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
          resolve(
            new File([blob], `${baseName}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            }),
          );
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Safari / HEIC : conserver le fichier original si la compression échoue
      resolve(file);
    };

    image.src = objectUrl;
  });
}
