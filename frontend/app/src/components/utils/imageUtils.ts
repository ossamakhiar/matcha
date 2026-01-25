export type FilterSettings = {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
};

export const defaultFilters: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

export function filterCss(f: FilterSettings) {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) grayscale(${f.grayscale}%)`;
}

export async function getCroppedFilteredImageFile(opts: {
  imageUrl: string;
  cropPixels: { x: number; y: number; width: number; height: number };
  filters: FilterSettings;
  fileName: string;
  mimeType?: "image/jpeg" | "image/png";
  quality?: number;
}): Promise<File> {
  const { imageUrl, cropPixels, filters, fileName, mimeType = "image/jpeg", quality = 0.92 } = opts;

  const image = await createImage(imageUrl);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = Math.max(1, Math.round(cropPixels.width));
  canvas.height = Math.max(1, Math.round(cropPixels.height));

  ctx.filter = filterCss(filters);

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to export image"))),
      mimeType,
      mimeType === "image/jpeg" ? quality : undefined
    );
  });

  return new File([blob], fileName, { type: mimeType });
}


export async function buildFilteredPreviewUrl(baseUrl: string, filters: FilterSettings) {
  const img = await createImage(baseUrl);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  ctx.filter = filterCss(filters);
  ctx.drawImage(img, 0, 0);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92);
  });

  return URL.createObjectURL(blob);
}