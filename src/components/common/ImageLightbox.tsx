"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: { id?: string | number; url: string }[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export default function ImageLightbox({
  images,
  initialIndex,
  open,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(images.length - 1, i + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, images.length, onClose]);

  if (!mounted || !open || images.length === 0) return null;

  const current = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  const content = (
    <div
      className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center"
      style={{ pointerEvents: "auto" }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 cursor-pointer z-10"
        aria-label="Đóng"
      >
        <X size={24} />
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex(index - 1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white bg-black/40 hover:bg-black/60 cursor-pointer z-10"
          aria-label="Ảnh trước"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex(index + 1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white bg-black/40 hover:bg-black/60 cursor-pointer z-10"
          aria-label="Ảnh sau"
        >
          <ChevronRight size={28} />
        </button>
      )}

      <div
        className="relative w-[90vw] h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={current.url}
          alt=""
          fill
          sizes="90vw"
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
