"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { ProductAttachment } from "@/utils/chat-product";

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

interface ProductMessageCardProps {
  attachment: ProductAttachment;
  isMine: boolean;
  colleague?: boolean;
  timestamp?: Date;
  senderLabel?: string;
  /** When provided, overrides Link navigation and calls this handler instead (e.g. open admin modal) */
  onCardClick?: () => void;
}

export default function ProductMessageCard({ attachment, isMine, colleague, timestamp, senderLabel, onCardClick }: ProductMessageCardProps) {
  const { productId, productName, price, imageUrl, variantSize, variantColor } = attachment;

  const sharedClassName = `flex flex-col gap-2 p-2.5 w-[240px] border transition-colors cursor-pointer rounded-lg overflow-hidden text-left ${
    isMine
      ? "bg-primary text-primary-foreground border-primary/30 hover:bg-primary/90"
      : colleague
      ? "bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600"
      : "bg-card text-card-foreground border-border hover:border-primary"
  }`;

  const inner = (
    <>
      {senderLabel && (
        <p className="text-[10px] font-medium opacity-60">{senderLabel}</p>
      )}
      <div className="flex items-start gap-3">
        <div className="relative w-14 h-14 flex-shrink-0 bg-muted overflow-hidden rounded-[var(--radius-sm)]">
          {imageUrl ? (
            <Image src={imageUrl} alt={productName} fill sizes="56px" className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={20} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <p className="text-xs font-semibold leading-tight line-clamp-2">{productName}</p>
          {(variantSize || variantColor) && (
            <p className="text-[10px] opacity-60">{[variantSize, variantColor].filter(Boolean).join(" · ")}</p>
          )}
          <p className="text-xs font-bold">{VND.format(price)}</p>
          <div className="flex items-end justify-between gap-2 mt-0.5">
            <p className="text-[10px] underline opacity-70">
              {onCardClick ? "Xem chi tiết →" : "Xem sản phẩm →"}
            </p>
            {timestamp && (
              <p className="text-[10px] opacity-50 shrink-0">
                {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (onCardClick) {
    return (
      <button type="button" className={sharedClassName} onClick={onCardClick}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={`/product/${productId}`} className={sharedClassName} onClick={(e) => e.stopPropagation()}>
      {inner}
    </Link>
  );
}
