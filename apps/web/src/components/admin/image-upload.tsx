"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export function ImageUpload({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an arbitrary uploaded URL
        <img src={value} alt="" className="h-16 w-16 rounded-md object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-zinc-300 text-zinc-300">
          <ImagePlus className="h-6 w-6" />
        </div>
      )}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-zinc-50 disabled:opacity-50"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploaden...
            </span>
          ) : value ? (
            "Foto wijzigen"
          ) : (
            "Foto uploaden"
          )}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
      </div>
    </div>
  );
}
