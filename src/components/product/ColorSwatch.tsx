import React from "react";

export type ColorSwatchVariant = "default" | "clicked" | "large" | "clicked-lg";

interface ColorSwatchProps {
  color: string; // CSS color
  variant?: ColorSwatchVariant;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function ColorSwatch({ color, variant = "default", className = "", onClick }: ColorSwatchProps) {
  let size = 24;
  let border = "border border-gray-400";
  let outline = "";

  if (variant === "large") {
    size = 40;
  } else if (variant === "clicked") {
    outline = "outline outline-2 outline-red-700";
  } else if (variant === "clicked-lg") {
    size = 40;
    outline = "outline outline-2 outline-gray-500";
  }

  return (
    <div
      className={`inline-flex items-center justify-center ${border} ${outline} bg-white p-1 cursor-pointer transition-all ${className}`}
      style={{ width: size + 8, height: size + 8 }}
      onClick={onClick}
    >
      <div
        className=""
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
