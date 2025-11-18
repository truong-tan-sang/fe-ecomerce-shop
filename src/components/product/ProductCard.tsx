import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ColorSwatch from "./ColorSwatch";

interface ProductCardProps {
  id?: string;
  imageUrl: string;
  name: string;
  price: string;
  colors: { color: string; selected?: boolean }[];
}

export default function ProductCard({ id = "1", imageUrl, name, price, colors }: ProductCardProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(
    colors.findIndex((c) => c.selected) !== -1 ? colors.findIndex((c) => c.selected) : 0
  );

  return (
    <Link href={`/product/${id}`} className="w-full overflow-hidden bg-white flex flex-col group cursor-pointer transition-all border border-transparent hover:border-black">
      {/* Image (top half) */}
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="256px"
        />
      </div>
      {/* Info (bottom half) */}
      <div className="flex-1 flex flex-col gap-1 p-3 justify-between">
        <div>
          <div className="text-sm md:text-base font-bold leading-tight line-clamp-2 text-black">{name}</div>
          <div className="text-xs md:text-sm text-gray-700 mt-1">{price}</div>
        </div>
        <div className="flex gap-2 mt-2">
          {colors.map((c, i) => (
            <ColorSwatch
              key={i}
              color={c.color}
              variant={selectedColorIndex === i ? "clicked" : "default"}
              onClick={(e) => {
                e.preventDefault();
                setSelectedColorIndex(i);
              }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
