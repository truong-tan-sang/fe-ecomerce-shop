"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const NO_IMAGE = "/no-image.jpg";

interface ProductGalleryProps {
  images: string[];
  /** When set, forces the gallery to jump to this index (e.g. on color change) */
  forcedIndex?: number;
}

export default function ProductGallery({ images, forcedIndex }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Jump to forcedIndex whenever the parent signals a color change
  useEffect(() => {
    if (forcedIndex !== undefined) setSelectedIndex(forcedIndex);
  }, [forcedIndex]);

  // Reset to first image when the image list itself changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center">No images</div>;
  }

  return (
    <div className="flex gap-3 w-full">
      {/* Thumbnail column */}
      <div className="flex flex-col gap-3 shrink-0" style={{ width: "80px" }}>
        {images.map((img, i) => (
          <Button
            key={i}
            type="button"
            variant="ghost"
            onClick={() => setSelectedIndex(i)}
            className={`relative bg-gray-100 border-2 p-0 h-auto overflow-hidden ${
              selectedIndex === i ? "border-black" : "border-gray-300 hover:border-gray-400"
            }`}
            style={{ width: "80px", height: "80px" }}
          >
            <Image
              src={img}
              alt={`Thumbnail ${i + 1}`}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = NO_IMAGE; }}
            />
          </Button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <Image
          src={images[selectedIndex]}
          alt="Product"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          unoptimized
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = NO_IMAGE; }}
        />
      </div>
    </div>
  );
}
