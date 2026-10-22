/**
 * Reads an image file and returns a downscaled data URL.
 * Keeps LocalStorage small (it has a ~5MB quota) and keeps PDFs crisp but light.
 */
export async function imageFileToDataUrl(file: File, maxSize = 480): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG or WebP).");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image is too large. Please choose a file under 5 MB.");
  }

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });

  // SVGs scale natively; keep them untouched.
  if (file.type === "image/svg+xml") return source;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("This image could not be opened."));
    el.src = source;
  });

  const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
  if (ratio === 1 && file.size < 300 * 1024) return source;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  return canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.9);
}
