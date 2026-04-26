"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, Plus, X, Trash2 } from "lucide-react";
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
import type { ReviewDto } from "@/dto/product-detail";
import type { MediaEntity } from "@/dto/product";

const MAX_TOTAL_IMAGES = 5;

interface ReviewEditDialogProps {
  review: ReviewDto;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: ReviewDto) => void;
  accessToken: string;
  productLabel?: string;
}

export default function ReviewEditDialog({
  review,
  open,
  onClose,
  onUpdated,
  accessToken,
  productLabel,
}: ReviewEditDialogProps) {
  const [rating, setRating] = useState(review.rating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(review.comment ?? "");
  const [existingMedia] = useState<MediaEntity[]>(review.media ?? []);
  const [mediaIdsToDelete, setMediaIdsToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  useEffect(() => {
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remainingExistingCount = existingMedia.filter(
    (m) => !mediaIdsToDelete.includes(String(m.id))
  ).length;
  const totalImages = remainingExistingCount + newImages.length;
  const canAddMore = totalImages < MAX_TOTAL_IMAGES;

  const toggleDelete = (id: string) => {
    setMediaIdsToDelete((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addImages = (files: File[]) => {
    const room = MAX_TOTAL_IMAGES - totalImages;
    if (room <= 0) return;
    const accepted = files.slice(0, room);
    const previews = accepted.map((f) => URL.createObjectURL(f));
    setNewImages((prev) => [...prev, ...accepted]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (submitLock.current) return;
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    try {
      const res = await productService.updateReview(
        review.id,
        {
          rating,
          comment: comment.trim(),
          updatedAt: new Date().toISOString(),
        },
        newImages,
        mediaIdsToDelete,
        accessToken
      );
      if (res.data) {
        toast.success("Đã cập nhật đánh giá!");
        onUpdated(res.data);
        onClose();
      } else {
        toast.error("Không thể cập nhật đánh giá. Vui lòng thử lại.");
      }
    } catch {
      toast.error("Không thể cập nhật đánh giá. Vui lòng thử lại.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-base font-semibold">
            Sửa đánh giá
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {productLabel && (
            <p className="text-sm text-gray-600">{productLabel}</p>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1.5">Chất lượng sản phẩm</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={submitting}
                  className="cursor-pointer disabled:cursor-default p-0.5 transition-transform hover:scale-110 disabled:hover:scale-100"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={22}
                    className={
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 stroke-yellow-400"
                        : "fill-none stroke-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
            rows={4}
            disabled={submitting}
            className="resize-none text-sm border-gray-300 focus-visible:border-black focus-visible:ring-0"
          />

          <div>
            <p className="text-xs text-gray-500 mb-1.5">
              Hình ảnh ({totalImages}/{MAX_TOTAL_IMAGES})
            </p>
            <div className="flex flex-wrap gap-2">
              {existingMedia.map((m) => {
                const id = String(m.id);
                const markedDelete = mediaIdsToDelete.includes(id);
                return (
                  <div
                    key={id}
                    className={`relative w-16 h-16 border overflow-hidden group ${
                      markedDelete ? "opacity-40" : ""
                    }`}
                  >
                    <Image
                      src={m.url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleDelete(id)}
                      disabled={submitting}
                      className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black disabled:cursor-default disabled:opacity-50"
                      aria-label={markedDelete ? "Hoàn tác xoá" : "Xoá ảnh"}
                    >
                      {markedDelete ? <Plus size={12} /> : <Trash2 size={12} />}
                    </button>
                  </div>
                );
              })}

              {newPreviews.map((src, i) => (
                <div
                  key={`new-${i}`}
                  className="relative w-16 h-16 border overflow-hidden"
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    disabled={submitting}
                    className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black disabled:cursor-default disabled:opacity-50"
                    aria-label="Xoá ảnh mới"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {canAddMore && !submitting && (
                <label className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addImages(Array.from(e.target.files ?? []));
                      e.target.value = "";
                    }}
                  />
                  <Plus size={20} className="text-gray-400" />
                </label>
              )}
            </div>
            {mediaIdsToDelete.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {mediaIdsToDelete.length} ảnh sẽ bị xoá khi lưu thay đổi.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex-row gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border-gray-300 cursor-pointer"
          >
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-black text-white hover:bg-gray-900 cursor-pointer"
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
