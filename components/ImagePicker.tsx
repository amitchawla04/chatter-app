"use client";

/**
 * ImagePicker — image upload via file input + preview.
 * On mobile Safari, capture="environment" lets user shoot from camera too.
 */

import { useState, useRef } from "react";
import { Image as ImageIcon, Trash2 } from "lucide-react";

interface ImagePickerProps {
  onPicked: (file: File) => void;
  onCleared: () => void;
}

export function ImagePicker({ onPicked, onCleared }: ImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("image must be under 10MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onPicked(file);
  };

  const clear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onCleared();
  };

  return (
    <div className="py-6">
      {!previewUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-16 border border-dashed border-line hover:border-red flex flex-col items-center justify-center gap-3 transition-colors"
        >
          <ImageIcon size={28} strokeWidth={1.5} className="text-muted" />
          <span className="text-muted text-sm">tap to add an image</span>
          <span className="mono-text text-[11px] text-muted-soft">jpg · png · webp · max 10MB</span>
        </button>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="preview"
            className="w-full max-h-96 object-cover border border-line"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-canvas/90 backdrop-blur flex items-center justify-center text-warn shadow-lg"
            aria-label="Remove image"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
