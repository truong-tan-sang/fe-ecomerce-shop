"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset to first image when images array changes (e.g. color change)
    useEffect(() => {
        setSelectedIndex(0);
    }, [images]);

    if (!images || images.length === 0) {
        return <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center">No images</div>;
    }

    return (
        <div className="flex gap-3 w-full">
            {/* Thumbnail column */}
            <div className="flex flex-col gap-3 shrink-0" style={{ width: '80px' }}>
                {images.map((img, i) => (
                    <Button
                        key={i}
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedIndex(i)}
                        className={`relative bg-gray-100 border-2 p-0 h-auto overflow-hidden ${
                            selectedIndex === i ? "border-black" : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ width: '80px', height: '80px' }}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized
                        />
                    </Button>
                ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative bg-gray-100 overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <Image
                    src={images[selectedIndex]}
                    alt="Product"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    unoptimized
                />
            </div>
        </div>
    );
}
