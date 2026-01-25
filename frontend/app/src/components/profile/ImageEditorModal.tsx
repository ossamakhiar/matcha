import { useEffect, useMemo, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { buildFilteredPreviewUrl, defaultFilters, FilterSettings, getCroppedFilteredImageFile } from "../utils/imageUtils";

type Props = {
  file: File;
  onCancel: () => void;
  onDone: (editedFile: File) => void;
};

export default function ImageEditorModal({ file, onCancel, onDone }: Props) {
  const [baseUrl, setBaseUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);
  const [saving, setSaving] = useState(false);

  const buildIdRef = useRef(0);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setBaseUrl(url);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!baseUrl) return;

    const myBuildId = ++buildIdRef.current;
    let cancelled = false;

    const t = setTimeout(async () => {
      try {
        const newUrl = await buildFilteredPreviewUrl(baseUrl, filters);

        if (cancelled || myBuildId !== buildIdRef.current) {
          URL.revokeObjectURL(newUrl);
          return;
        }

        setPreviewUrl((old) => {
          if (old && old !== baseUrl) URL.revokeObjectURL(old);
          return newUrl;
        });
      } catch (err) {
        console.log(err)
    }
    }, 80);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [baseUrl, filters, file]);

  const onCropComplete = (_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const outputMime: "image/jpeg" | "image/png" = useMemo(() => {
    return file.type === "image/png" ? "image/png" : "image/jpeg";
  }, [file.type]);

  async function handleSave() {
    if (!croppedAreaPixels) return;

    setSaving(true);
    try {
      // IMPORTANT: use previewUrl so you crop the filtered pixels
      const edited = await getCroppedFilteredImageFile({
        imageUrl: previewUrl || baseUrl,
        cropPixels: croppedAreaPixels,
        filters: defaultFilters, // already baked into previewUrl; don't double-apply
        fileName: `profile.${outputMime === "image/png" ? "png" : "jpg"}`,
        mimeType: outputMime,
        quality: 0.92,
      });

      onDone(edited);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="font-semibold">Edit picture</div>
          <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-100">
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="md:col-span-2">
            <div className="relative w-full h-[380px] bg-gray-100 rounded-xl overflow-hidden">
              {previewUrl && (
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            <div className="mt-4">
              <label className="text-sm">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="font-medium">Filters</div>

            <div>
              <label className="text-sm">Brightness</label>
              <input
                type="range"
                min={0}
                max={200}
                value={filters.brightness}
                onChange={(e) => setFilters((p) => ({ ...p, brightness: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm">Contrast</label>
              <input
                type="range"
                min={0}
                max={200}
                value={filters.contrast}
                onChange={(e) => setFilters((p) => ({ ...p, contrast: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm">Saturation</label>
              <input
                type="range"
                min={0}
                max={200}
                value={filters.saturate}
                onChange={(e) => setFilters((p) => ({ ...p, saturate: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm">Grayscale</label>
              <input
                type="range"
                min={0}
                max={100}
                value={filters.grayscale}
                onChange={(e) => setFilters((p) => ({ ...p, grayscale: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <button type="button" onClick={() => setFilters(defaultFilters)} className="px-3 py-2 rounded bg-gray-100">
              Reset filters
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !croppedAreaPixels}
              className="px-3 py-2 rounded text-white bg-pink disabled:opacity-60"
            >
              {saving ? "Saving..." : "Use this photo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
