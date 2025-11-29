"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import ReviewItem from "./ReviewItem";
import type { ReviewDto, ProductVariantDto } from "@/dto/product-detail";

interface ReviewSectionProps {
  productId: number;
  initialReviews: ReviewDto[];
  variants: ProductVariantDto[];
}

export default function ReviewSection({
  productId,
  initialReviews,
  variants,
}: ReviewSectionProps) {
  const [reviews] = useState<ReviewDto[]>(initialReviews);

  // Calculate statistics
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  // Display-only: no create/edit/delete handlers

  return (
    <section className="mt-12 border-t border-gray-300 pt-12">
      <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Rating Summary */}
        <div className="lg:col-span-1">
          <div className="border border-black p-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={
                      star <= Math.round(averageRating)
                        ? "fill-black stroke-black"
                        : "fill-none stroke-gray-300"
                    }
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2 mb-6">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <div className="w-8">{star}★</div>
                  <div className="flex-1 h-2 bg-gray-200">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-gray-600">{count}</div>
                </div>
              ))}
            </div>

            {/* Display-only: no actions here */}
          </div>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="border border-gray-300 p-12 text-center text-gray-500">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const variant = variants.find(
                  (v) => v.id === review.productVariantId
                );
                return (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    variant={variant || null}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
