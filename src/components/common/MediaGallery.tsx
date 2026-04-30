"use client";

import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

export interface MediaGalleryItem {
  id: number;
  url: string;
  type: "IMAGE" | "VIDEO" | string;
}

interface MediaGalleryProps {
  media: MediaGalleryItem[];
  /** Thumbnail size class. In "wrap" layout, applied to both width and height (e.g. "w-16 h-16"); in "grid" layout, applied as height only (e.g. "h-20"). */
  thumbSize?: string;
  /** Grid column count (only used when layout="grid"). */
  columns?: 3 | 4 | 5 | 6;
  /** "wrap": fixed-square thumbs that wrap. "grid": fluid thumbs filling row. */
  layout?: "wrap" | "grid";
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function VideoThumb({ url }: { url: string }) {
  const [duration, setDuration] = useState<string>("");
  return (
    <div className="relative w-full h-full">
      <video
        src={url}
        className="w-full h-full object-cover bg-black"
        preload="metadata"
        muted
        onLoadedMetadata={(e) => setDuration(formatDuration(e.currentTarget.duration))}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-9 h-9 rounded-full bg-black/55 flex items-center justify-center">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      </div>
      {duration && (
        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-semibold">
          {duration}
        </span>
      )}
    </div>
  );
}

export default function MediaGallery({
  media,
  thumbSize,
  columns = 4,
  layout = "grid",
}: MediaGalleryProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const open = openIdx !== null;
  const current = open ? media[openIdx] : null;

  // Arrow key navigation (ESC is handled natively by Radix)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setOpenIdx((i) => (i === null ? i : (i - 1 + media.length) % media.length));
      else if (e.key === "ArrowRight") setOpenIdx((i) => (i === null ? i : (i + 1) % media.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, media.length]);

  if (media.length === 0) return null;

  const isVideo = (m: MediaGalleryItem) => m.type === "VIDEO";

  const containerClass =
    layout === "wrap"
      ? "flex flex-wrap gap-2"
      : `grid gap-2 ${
          columns === 5 ? "grid-cols-5" :
          columns === 6 ? "grid-cols-6" :
          columns === 3 ? "grid-cols-3" :
          "grid-cols-4"
        }`;

  const wrapSize = thumbSize ?? "w-16 h-16";
  const gridHeight = thumbSize ?? "h-20";

  const thumbClass =
    layout === "wrap"
      ? `${wrapSize}`
      : `w-full ${gridHeight}`;

  return (
    <>
      <div className={containerClass}>
        {media.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setOpenIdx(i)}
            className={`relative block border border-gray-200 overflow-hidden cursor-pointer bg-white hover:opacity-80 transition-opacity ${thumbClass}`}
            aria-label={isVideo(m) ? "Xem video" : "Xem ảnh"}
          >
            {isVideo(m) ? (
              <VideoThumb url={m.url} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.url}
                alt={`media-${m.id}`}
                className="w-full h-full object-cover"
              />
            )}
          </button>
        ))}
      </div>

      <DialogPrimitive.Root
        open={open}
        onOpenChange={(v) => { if (!v) setOpenIdx(null); }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Content
            aria-label="Trình xem ảnh / video"
            onEscapeKeyDown={() => setOpenIdx(null)}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4"
            onClick={() => setOpenIdx(null)}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpenIdx(null); }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenIdx((openIdx! - 1 + media.length) % media.length); }}
                  className="absolute left-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  aria-label="Trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenIdx((openIdx! + 1) % media.length); }}
                  className="absolute right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  aria-label="Tiếp"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {current && (
              <div
                className="max-w-[92vw] max-h-[88vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {isVideo(current) ? (
                  <video
                    src={current.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[88vh] bg-black"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.url}
                    alt={`media-${current.id}`}
                    className="max-w-full max-h-[88vh] object-contain"
                  />
                )}
              </div>
            )}

            {media.length > 1 && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">
                {openIdx! + 1} / {media.length}
              </span>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
