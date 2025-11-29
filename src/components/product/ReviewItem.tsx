"use client";

import { Star } from "lucide-react";
import type { ReviewDto, ProductVariantDto } from "@/dto/product-detail";

interface ReviewItemProps {
  review: ReviewDto;
  variant: ProductVariantDto | null;
}

export default function ReviewItem({ review, variant }: ReviewItemProps) {
  const reviewDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="border border-gray-300 p-4 hover:border-black transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-sm">User #{review.userId}</div>
          <div className="text-xs text-gray-500">{reviewDate}</div>
        </div>
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
          <span className="font-medium">Purchased:</span>{" "}
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
    </div>
  );
}
