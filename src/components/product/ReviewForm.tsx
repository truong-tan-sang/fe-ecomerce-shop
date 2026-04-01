"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { ProductVariantEntity } from "@/dto/product-variant";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  productId: number;
  userId: number;
  variants: ProductVariantEntity[];
  initialData?: {
    reviewId: number;
    rating: number;
    comment: string;
    variantId: number;
  };
  onSubmit: (data: {
    rating: number;
    comment: string;
    variantId: number;
    reviewId?: number;
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  userId,
  variants,
  initialData,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    initialData?.variantId || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    if (!selectedVariantId) {
      setError("Please select a variant");
      return;
    }
    
    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        variantId: selectedVariantId,
        reviewId: initialData?.reviewId,
      });
      
      // Reset form if this is a new review
      if (!initialData) {
        setRating(0);
        setComment("");
        setSelectedVariantId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-black p-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? "Edit Your Review" : "Write a Review"}
      </h3>

      {/* Rating Stars */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              type="button"
              variant="ghost"
              size="icon-xs"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="p-1 h-auto w-auto hover:scale-110 transition-transform"
            >
              <Star
                size={24}
                className={
                  star <= (hoveredRating || rating)
                    ? "fill-black stroke-black"
                    : "fill-none stroke-gray-400"
                }
              />
            </Button>
          ))}
        </div>
      </div>

      {/* Variant Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Variant (Size & Color)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {variants.map((variant) => (
            <Button
              key={variant.id}
              type="button"
              variant={selectedVariantId === variant.id ? "default" : "outline"}
              onClick={() => setSelectedVariantId(variant.id)}
              disabled={variant.stock === 0}
              className={`h-auto p-3 text-left justify-start flex-col items-start text-sm ${
                selectedVariantId === variant.id
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:border-gray-500"
              } ${variant.stock === 0 ? "opacity-50" : ""}`}
            >
              <div className="font-medium">
                {variant.variantSize} - {variant.variantColor}
              </div>
              <div className="text-xs mt-1 opacity-75">
                {variant.stock === 0 ? "Out of stock" : `Stock: ${variant.stock}`}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          className="border-gray-300 p-3 focus-visible:border-black resize-none"
          disabled={isSubmitting}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-black text-white px-4 py-2 h-auto hover:bg-gray-900"
        >
          {isSubmitting ? "Submitting..." : initialData ? "Update Review" : "Submit Review"}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 border-black px-4 py-2 h-auto"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
