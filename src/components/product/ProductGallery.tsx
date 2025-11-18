"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) {
        return <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center">No images</div>;
    }

    return (
        <div className="flex gap-3 w-full">
            {/* Thumbnail column */}
            <div className="flex flex-col gap-3 shrink-0" style={{ width: '80px' }}>
                {images.map((img, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedIndex(i)}
                        className={`relative bg-gray-100 border-2 transition-all overflow-hidden ${
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
                    </button>
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
