"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Trash2, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { reviewService } from "@/services/review";
import ImageLightbox from "@/components/common/ImageLightbox";
import type { AdminReviewDto } from "@/dto/review";

interface ReviewDetailSheetProps {
  review: AdminReviewDto | null;
  open: boolean;
  onClose: () => void;
  onDeleted: (reviewId: number) => void;
  accessToken: string;
}

const formatDateTime = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ReviewDetailSheet({
  review,
  open,
  onClose,
  onDeleted,
  accessToken,
}: ReviewDetailSheetProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Reset lightbox and confirm state when a different review is shown
  useEffect(() => {
    setLightboxIdx(null);
    setConfirmDelete(false);
  }, [review?.id]);

  const handleDelete = async () => {
    if (!review) return;
    setDeleting(true);
    try {
      await reviewService.deleteReview(review.id, accessToken);
      toast.success("Đã xoá đánh giá.");
      onDeleted(review.id);
      setConfirmDelete(false);
      onClose();
    } catch {
      toast.error("Không thể xoá đánh giá. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
          onInteractOutside={(e) => {
            if (lightboxIdx !== null || confirmDelete) {
              e.preventDefault();
            }
          }}
        >
          {review && (
            <>
              <SheetHeader>
                <SheetTitle>Đánh giá #{review.id}</SheetTitle>
              </SheetHeader>

              <div className="px-4 pb-6 space-y-6">
                {/* User card */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
                    Người dùng
                  </p>
                  {review.user ? (
                    <>
                      <p className="text-sm font-medium">
                        {[review.user.firstName, review.user.lastName]
                          .filter(Boolean)
                          .join(" ") || `User #${review.user.id}`}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {review.user.email}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      User #{review.userId}
                    </p>
                  )}
                </div>

                {/* Product card */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
                    Sản phẩm
                  </p>
                  {review.product ? (
                    <p className="text-sm font-medium">{review.product.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Product #{review.productId}
                    </p>
                  )}
                  {review.productVariant && (
                    <p className="text-xs text-gray-600 mt-1">
                      {review.productVariant.variantSize} •{" "}
                      {review.productVariant.variantColor}
                    </p>
                  )}
                  {review.productId && (
                    <Link
                      href={`/product/${review.productId}#reviews`}
                      target="_blank"
                      className="inline-block mt-2 text-xs text-primary hover:underline underline-offset-2 cursor-pointer"
                    >
                      Xem trên trang sản phẩm →
                    </Link>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
                    Đánh giá
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          className={
                            s <= review.rating
                              ? "fill-yellow-400 stroke-yellow-400"
                              : "fill-none stroke-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
                      Nội dung
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}

                {/* Photos */}
                {review.media && review.media.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
                      Hình ảnh ({review.media.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {review.media.map((m, idx) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setLightboxIdx(idx)}
                          className="relative w-20 h-20 border overflow-hidden cursor-pointer hover:border-black transition-colors rounded"
                          aria-label="Xem ảnh"
                        >
                          <Image
                            src={m.url}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="flex gap-6 text-xs text-gray-500 pt-2 border-t">
                  <div>
                    <p className="uppercase font-semibold mb-1">Ngày đăng</p>
                    <p>{formatDateTime(review.createdAt)}</p>
                  </div>
                  {review.updatedAt && review.updatedAt !== review.createdAt && (
                    <div>
                      <p className="uppercase font-semibold mb-1">Cập nhật</p>
                      <p>{formatDateTime(review.updatedAt)}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                    disabled={deleting}
                    className="cursor-pointer w-full"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Xoá đánh giá
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {review && review.media && review.media.length > 0 && (
        <ImageLightbox
          images={review.media.map((m) => ({ id: m.id, url: m.url }))}
          initialIndex={lightboxIdx ?? 0}
          open={lightboxIdx !== null}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      <Dialog open={confirmDelete} onOpenChange={(o) => !deleting && setConfirmDelete(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xoá đánh giá này?</DialogTitle>
            <DialogDescription>
              Đánh giá sẽ bị xoá vĩnh viễn cùng với toàn bộ hình ảnh đính kèm.
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setConfirmDelete(false)}
              className="cursor-pointer"
            >
              Huỷ
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {deleting ? "Đang xoá..." : "Xoá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
