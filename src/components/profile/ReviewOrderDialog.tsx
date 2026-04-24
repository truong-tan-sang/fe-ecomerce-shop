"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
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

interface ItemReviewState {
  rating: number;
  hoveredRating: number;
  comment: string;
  status: "idle" | "submitting" | "done" | "already_reviewed";
  productId: number | null;
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
          },
        ];
      })
    );
  });

  const update = (itemId: number, patch: Partial<ItemReviewState>) =>
    setStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...patch },
    }));

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

      // Close immediately if every submitted item succeeded AND no other items still need writing
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
      <DialogContent className="max-w-xl w-full p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {/* Scrollable item list */}
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
                {/* Product info row */}
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
                    {state.comment && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {state.comment}
                      </p>
                    )}
                    {state.productId && (
                      <Link
                        href={`/product/${state.productId}#reviews`}
                        className="inline-block text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
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
    </Dialog>
  );
}
