"use client";

import { useState } from "react";
import { Star, Pencil } from "lucide-react";
import type { ReviewDto } from "@/dto/product-detail";
import type { ProductVariantEntity } from "@/dto/product-variant";
import MediaGallery from "@/components/common/MediaGallery";
import ReviewEditDialog from "@/components/profile/ReviewEditDialog";

interface ReviewItemProps {
  review: ReviewDto;
  variant: ProductVariantEntity | null;
  currentUserId?: number;
  accessToken?: string;
  onUpdated?: (updated: ReviewDto) => void;
}

export default function ReviewItem({
  review,
  variant,
  currentUserId,
  accessToken,
  onUpdated,
}: ReviewItemProps) {
  const [editing, setEditing] = useState(false);

  const reviewDate = new Date(review.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isMine = currentUserId != null && review.userId === currentUserId;
  const canEdit = isMine && accessToken && onUpdated;

  return (
    <div className="border border-gray-300 p-4 hover:border-black transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-sm">
            {isMine ? "Đánh giá của bạn" : `Người dùng #${review.userId}`}
          </div>
          <div className="text-xs text-gray-500">{reviewDate}</div>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-black hover:underline cursor-pointer"
          >
            <Pencil size={12} />
            Sửa
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= review.rating
                ? "fill-black stroke-black"
                : "fill-none stroke-gray-300"
            }
          />
        ))}
      </div>

      {variant && (
        <div className="mb-3 text-sm">
          <span className="font-medium">Đã mua:</span>{" "}
          <span className="inline-block border border-gray-300 px-2 py-1 text-xs">
            {variant.variantSize}
          </span>
          {" "}
          <span className="inline-block border border-gray-300 px-2 py-1 text-xs">
            {variant.variantColor}
          </span>
        </div>
      )}

      {review.comment && (
        <div className="text-sm text-gray-700 leading-relaxed">{review.comment}</div>
      )}

      {review.media && review.media.length > 0 && (
        <div className="mt-3">
          <MediaGallery media={review.media} layout="wrap" />
        </div>
      )}

      {canEdit && editing && (
        <ReviewEditDialog
          review={review}
          open={editing}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => {
            onUpdated?.(updated);
            setEditing(false);
          }}
          accessToken={accessToken!}
          productLabel={
            variant
              ? `${variant.variantName ?? ""} — ${variant.variantSize} / ${variant.variantColor}`
              : undefined
          }
        />
      )}
    </div>
  );
}
