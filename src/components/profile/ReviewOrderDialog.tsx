"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Plus, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { productService } from "@/services/product";
import type { OrderFullInformationEntity, OrderItemEntity } from "@/dto/order";
import type { ReviewDto } from "@/dto/product-detail";
import type { MediaEntity } from "@/dto/product";
import ImageLightbox from "@/components/common/ImageLightbox";
import ReviewEditDialog from "@/components/profile/ReviewEditDialog";

const MAX_IMAGES = 5;

interface ItemReviewState {
  rating: number;
  hoveredRating: number;
  comment: string;
  status: "idle" | "submitting" | "done" | "already_reviewed";
  productId: number | null;
  productVariantId: number;
  images: File[];
  previews: string[];
  existingMedia: MediaEntity[];
  reviewId: number | null;
}

interface ReviewOrderDialogProps {
  order: OrderFullInformationEntity;
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  accessToken: string;
  userId: number;
  existingReviews?: ReviewDto[];
}

function StarRow({
  rating,
  hovered,
  onChange,
  onHover,
  onLeave,
  disabled,
}: {
  rating: number;
  hovered: number;
  onChange: (r: number) => void;
  onHover: (r: number) => void;
  onLeave: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className="cursor-pointer disabled:cursor-default p-0.5 transition-transform hover:scale-110 disabled:hover:scale-100"
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          onClick={() => onChange(star)}
        >
          <Star
            size={22}
            className={
              star <= (hovered || rating)
                ? "fill-yellow-400 stroke-yellow-400"
                : "fill-none stroke-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewOrderDialog({
  order,
  open,
  onClose,
  onSubmitted,
  accessToken,
  userId,
  existingReviews = [],
}: ReviewOrderDialogProps) {
  const items: OrderItemEntity[] = order.orderItems ?? [];
  const submitLock = useRef(false);

  const [states, setStates] = useState<Record<number, ItemReviewState>>(() => {
    const reviewByVariant = new Map<number, ReviewDto>();
    existingReviews.forEach((r) => {
      if (r.productVariantId != null) reviewByVariant.set(r.productVariantId, r);
    });

    return Object.fromEntries(
      items.map((item) => {
        const existing = reviewByVariant.get(item.productVariantId);
        if (existing) {
          return [
            item.id,
            {
              rating: existing.rating,
              hoveredRating: 0,
              comment: existing.comment ?? "",
              status: "already_reviewed" as const,
              productId: item.productVariant?.productId ?? existing.productId ?? null,
              productVariantId: item.productVariantId,
              images: [],
              previews: [],
              existingMedia: existing.media ?? [],
              reviewId: existing.id,
            },
          ];
        }
        return [
          item.id,
          {
            rating: 5,
            hoveredRating: 0,
            comment: "",
            status: "idle" as const,
            productId: item.productVariant?.productId ?? null,
            productVariantId: item.productVariantId,
            images: [],
            previews: [],
            existingMedia: [],
            reviewId: null,
          },
        ];
      })
    );
  });

  const [lightbox, setLightbox] = useState<{ itemId: number; idx: number } | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // Track preview URLs in a ref so the unmount cleanup sees the latest set
  // without re-running the effect on every state change.
  const previewsRef = useRef<string[]>([]);
  useEffect(() => {
    previewsRef.current = Object.values(states).flatMap((s) => s.previews);
  }, [states]);
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p));
    };
  }, []);

  const update = (itemId: number, patch: Partial<ItemReviewState>) =>
    setStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...patch },
    }));

  const addImages = (itemId: number, files: File[]) => {
    setStates((prev) => {
      const cur = prev[itemId];
      const room = MAX_IMAGES - cur.images.length;
      if (room <= 0) return prev;
      const accepted = files.slice(0, room);
      const newPreviews = accepted.map((f) => URL.createObjectURL(f));
      return {
        ...prev,
        [itemId]: {
          ...cur,
          images: [...cur.images, ...accepted],
          previews: [...cur.previews, ...newPreviews],
        },
      };
    });
  };

  const removeImage = (itemId: number, idx: number) => {
    setStates((prev) => {
      const cur = prev[itemId];
      const url = cur.previews[idx];
      if (url) URL.revokeObjectURL(url);
      return {
        ...prev,
        [itemId]: {
          ...cur,
          images: cur.images.filter((_, i) => i !== idx),
          previews: cur.previews.filter((_, i) => i !== idx),
        },
      };
    });
  };

  const allReadOnly = items.every(
    (item) => states[item.id]?.status === "already_reviewed"
  );

  const handleSubmit = async () => {
    if (submitLock.current) return;
    submitLock.current = true;

    try {
      const toSubmit = items.filter(
        (item) =>
          states[item.id]?.status === "idle" &&
          states[item.id]?.comment.trim().length > 0
      );

      if (toSubmit.length === 0) {
        toast.error("Vui lòng nhập nội dung đánh giá cho ít nhất một sản phẩm.");
        return;
      }

      toSubmit.forEach((item) => update(item.id, { status: "submitting" }));

      const results = await Promise.all(
        toSubmit.map(async (item) => {
          const snapshot = states[item.id];
          const productId = item.productVariant?.productId;
          if (!productId) {
            update(item.id, { status: "idle" });
            return { itemId: item.id, ok: false };
          }
          try {
            await productService.createReview(
              {
                productId,
                userId,
                productVariantId: item.productVariantId,
                rating: snapshot.rating,
                comment: snapshot.comment.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              snapshot.images,
              accessToken
            );
            update(item.id, { status: "done" });
            return { itemId: item.id, ok: true };
          } catch {
            update(item.id, { status: "already_reviewed" });
            return { itemId: item.id, ok: false };
          }
        })
      );

      const successCount = results.filter((r) => r.ok).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success("Cảm ơn bạn đã đánh giá!");
      }

      const anyIdleLeft = items.some(
        (item) =>
          states[item.id]?.status === "idle" &&
          !toSubmit.find((s) => s.id === item.id)
      );
      if (failCount === 0 && !anyIdleLeft) {
        onSubmitted?.();
        onClose();
      } else if (failCount === 0) {
        onSubmitted?.();
      }
    } finally {
      submitLock.current = false;
    }
  };

  const title = allReadOnly
    ? "Đánh giá của bạn"
    : `Đánh giá đơn hàng #${order.id}`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-xl w-full p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]"
        onInteractOutside={(e) => {
          if (lightbox !== null || editingItemId !== null) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 divide-y">
          {items.map((item) => {
            const state = states[item.id];
            const imageUrl = item.productVariant?.media?.[0]?.url;
            const isDone = state.status === "done";
            const isAlreadyReviewed = state.status === "already_reviewed";
            const isSubmitting = state.status === "submitting";
            const readOnly = isDone || isAlreadyReviewed;
            const disabled = readOnly || isSubmitting;

            return (
              <div key={item.id} className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 border bg-gray-50 flex-shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.productVariant?.variantName ?? ""}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Star size={18} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.productVariant?.variantName ?? `Sản phẩm #${item.productVariantId}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.productVariant?.variantColor && (
                        <span>Màu: {item.productVariant.variantColor}</span>
                      )}
                      {item.productVariant?.variantSize && (
                        <span className="ml-2">Size: {item.productVariant.variantSize}</span>
                      )}
                    </p>
                  </div>
                </div>

                {readOnly ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StarRow
                          rating={state.rating}
                          hovered={0}
                          onChange={() => {}}
                          onHover={() => {}}
                          onLeave={() => {}}
                          disabled={true}
                        />
                        {isDone && (
                          <span className="text-xs text-green-600 font-medium">
                            Vừa gửi
                          </span>
                        )}
                      </div>
                      {state.reviewId && (
                        <button
                          type="button"
                          onClick={() => setEditingItemId(item.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-black hover:underline cursor-pointer"
                        >
                          <Pencil size={12} />
                          Sửa
                        </button>
                      )}
                    </div>
                    {state.comment && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {state.comment}
                      </p>
                    )}
                    {state.existingMedia.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {state.existingMedia.map((m, idx) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setLightbox({ itemId: item.id, idx })}
                            className="relative w-16 h-16 border overflow-hidden cursor-pointer hover:border-black transition-colors"
                            aria-label="Xem ảnh"
                          >
                            <Image
                              src={m.url}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    {state.productId && (
                      <Link
                        href={`/product/${state.productId}#reviews`}
                        className="inline-block text-xs text-gray-500 hover:text-black hover:underline cursor-pointer"
                      >
                        Xem trên trang sản phẩm →
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1.5">Chất lượng sản phẩm</p>
                      <StarRow
                        rating={state.rating}
                        hovered={state.hoveredRating}
                        onChange={(r) => update(item.id, { rating: r })}
                        onHover={(r) => update(item.id, { hoveredRating: r })}
                        onLeave={() => update(item.id, { hoveredRating: 0 })}
                        disabled={disabled}
                      />
                    </div>
                    <Textarea
                      value={state.comment}
                      onChange={(e) => update(item.id, { comment: e.target.value })}
                      placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
                      rows={3}
                      disabled={disabled}
                      className="resize-none text-sm border-gray-300 focus-visible:border-black focus-visible:ring-0"
                    />
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1.5">
                        Hình ảnh ({state.images.length}/{MAX_IMAGES})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {state.previews.map((src, i) => (
                          <div
                            key={`${item.id}-${i}`}
                            className="relative w-16 h-16 border overflow-hidden group"
                          >
                            <button
                              type="button"
                              onClick={() => setLightbox({ itemId: item.id, idx: i })}
                              className="absolute inset-0 w-full h-full cursor-pointer"
                              aria-label="Xem ảnh"
                            >
                              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(item.id, i)}
                              disabled={disabled}
                              className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black disabled:cursor-default disabled:opacity-50 z-10"
                              aria-label="Xoá ảnh"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {state.images.length < MAX_IMAGES && !disabled && (
                          <label className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                addImages(item.id, files);
                                e.target.value = "";
                              }}
                            />
                            <Plus size={20} className="text-gray-400" />
                          </label>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex-row gap-2 justify-end">
          {allReadOnly ? (
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 cursor-pointer"
            >
              Đóng
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 cursor-pointer"
              >
                Bỏ qua
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={items.some((i) => states[i.id]?.status === "submitting")}
                className="bg-black text-white hover:bg-gray-900 cursor-pointer"
              >
                {items.some((i) => states[i.id]?.status === "submitting")
                  ? "Đang gửi..."
                  : "Gửi đánh giá"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {lightbox &&
        (() => {
          const itemState = states[lightbox.itemId];
          if (!itemState) return null;
          const lightboxImages =
            itemState.status === "idle"
              ? itemState.previews.map((url, i) => ({ id: `preview-${i}`, url }))
              : itemState.existingMedia.map((m) => ({ id: m.id, url: m.url }));
          if (lightboxImages.length === 0) return null;
          return (
            <ImageLightbox
              images={lightboxImages}
              initialIndex={lightbox.idx}
              open={true}
              onClose={() => setLightbox(null)}
            />
          );
        })()}

      {editingItemId !== null &&
        (() => {
          const s = states[editingItemId];
          if (!s || !s.reviewId) return null;
          const review: ReviewDto = {
            id: s.reviewId,
            userId,
            productId: s.productId,
            productVariantId: s.productVariantId,
            rating: s.rating,
            comment: s.comment,
            media: s.existingMedia,
            createdAt: "",
            updatedAt: "",
          };
          const item = items.find((i) => i.id === editingItemId);
          const variantLabel = item?.productVariant
            ? `${item.productVariant.variantName ?? ""} — ${item.productVariant.variantSize ?? ""} / ${item.productVariant.variantColor ?? ""}`
            : undefined;
          return (
            <ReviewEditDialog
              review={review}
              open={true}
              onClose={() => setEditingItemId(null)}
              onUpdated={(updated) => {
                update(editingItemId, {
                  rating: updated.rating,
                  comment: updated.comment ?? "",
                  existingMedia: updated.media ?? [],
                });
                setEditingItemId(null);
                onSubmitted?.();
              }}
              accessToken={accessToken}
              productLabel={variantLabel}
            />
          );
        })()}
    </Dialog>
  );
}
