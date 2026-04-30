"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { returnRequestService } from "@/services/returnRequest";
import { awsS3Service } from "@/services/awsS3";
import MediaGallery from "@/components/common/MediaGallery";
import {
  VIETNAM_BANK_OPTIONS,
  type VietnamBankName,
} from "@/dto/returnRequest";
import type {
  OrderFullInformationEntity,
  RequestInOrderDto,
  RequestInOrderStatus,
} from "@/dto/order";

export const REQUEST_STATUS_BADGE: Record<
  RequestInOrderStatus,
  { label: string; className: string }
> = {
  PENDING:     { label: "Đang chờ",   className: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning)]" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-[var(--status-info-bg)] border-[var(--status-info-border)] text-[var(--status-info)]" },
  APPROVED:    { label: "Đã duyệt",   className: "bg-[var(--status-success-bg)] border-[var(--status-success-border)] text-[var(--status-success)]" },
  REJECTED:    { label: "Đã từ chối", className: "bg-[var(--status-error-bg)] border-[var(--status-error-border)] text-[var(--status-error)]" },
};

export interface ReturnRequestDialogProps {
  order: OrderFullInformationEntity;
  open: boolean;
  onClose: () => void;
  existingRequest?: RequestInOrderDto;
  onSubmitted?: () => void;
}

export default function ReturnRequestDialog({
  order,
  open,
  onClose,
  existingRequest,
  onSubmitted,
}: ReturnRequestDialogProps) {
  const { data: session } = useSession();
  const readOnly = !!existingRequest;
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState<VietnamBankName | "">("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; isVideo: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_FILES = 10;

  useEffect(() => {
    if (!open) return;
    if (existingRequest) {
      const bank = existingRequest.returnRequest?.[0];
      setDescription(existingRequest.description ?? "");
      setBankName((bank?.bankName as VietnamBankName | undefined) ?? "");
      setBankAccountNumber(bank?.bankAccountNumber ?? "");
      setBankAccountName(bank?.bankAccountName ?? "");
    } else {
      setDescription("");
      setBankName("");
      setBankAccountNumber("");
      setBankAccountName("");
      setFiles([]);
      setPreviews([]);
    }
  }, [open, existingRequest]);

  useEffect(() => {
    const urls = files.map((f) => ({
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith("video/"),
    }));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u.url));
    };
  }, [files]);

  const handlePickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;

    const invalid = picked.find(
      (f) => !f.type.startsWith("image/") && !f.type.startsWith("video/"),
    );
    if (invalid) {
      toast.error("Chỉ hỗ trợ ảnh hoặc video.");
      e.target.value = "";
      return;
    }
    if (files.length + picked.length > MAX_FILES) {
      toast.error(`Tối đa ${MAX_FILES} tệp đính kèm.`);
      e.target.value = "";
      return;
    }
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!session?.user?.access_token) return;
    if (!description.trim()) { toast.error("Vui lòng nhập lý do trả hàng."); return; }
    if (!bankName) { toast.error("Vui lòng chọn ngân hàng."); return; }
    if (!bankAccountNumber.trim()) { toast.error("Vui lòng nhập số tài khoản."); return; }
    if (!bankAccountName.trim()) { toast.error("Vui lòng nhập tên chủ tài khoản."); return; }

    setSubmitting(true);
    try {
      const created = await returnRequestService.create(
        {
          userId: order.userId,
          orderId: order.id,
          description: description.trim(),
          bankName: bankName as VietnamBankName,
          bankAccountNumber: bankAccountNumber.trim(),
          bankAccountName: bankAccountName.trim(),
        },
        session.user.access_token
      );

      const requestId = created?.data?.requestId;
      if (files.length > 0 && requestId) {
        try {
          await awsS3Service.uploadManyRequestFile(
            order.userId,
            requestId,
            files,
            session.user.access_token,
          );
        } catch (uploadErr) {
          console.error("[ReturnRequestDialog] Media upload failed:", uploadErr);
          toast.error(
            "Đã tạo yêu cầu nhưng tải ảnh/video thất bại. Bạn có thể thử lại sau.",
          );
          onSubmitted?.();
          onClose();
          return;
        }
      }

      toast.success("Yêu cầu hoàn trả đã được gửi. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.");
      onSubmitted?.();
      onClose();
    } catch {
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const existingMedia = existingRequest?.media ?? [];

  const badge = existingRequest
    ? REQUEST_STATUS_BADGE[existingRequest.status]
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? "Yêu cầu trả hàng" : "Yêu cầu trả hàng / hoàn tiền"}
          </DialogTitle>
          <DialogDescription>
            Đơn hàng #{order.id}.
            {!readOnly &&
              " Vui lòng cung cấp lý do và thông tin tài khoản để nhận hoàn tiền."}
          </DialogDescription>
        </DialogHeader>

        {badge && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Trạng thái:</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 border text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rr-desc">
              Lý do trả hàng {!readOnly && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="rr-desc"
              placeholder="Mô tả lý do bạn muốn trả hàng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={readOnly}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rr-bank">
              Ngân hàng {!readOnly && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={bankName}
              onValueChange={(v) => setBankName(v as VietnamBankName)}
              disabled={readOnly}
            >
              <SelectTrigger id="rr-bank" className="cursor-pointer">
                <SelectValue placeholder="Chọn ngân hàng" />
              </SelectTrigger>
              <SelectContent>
                {VIETNAM_BANK_OPTIONS.map((b) => (
                  <SelectItem key={b.value} value={b.value} className="cursor-pointer">
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rr-acc-num">
              Số tài khoản {!readOnly && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="rr-acc-num"
              placeholder="VD: 0123456789"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              disabled={readOnly}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rr-acc-name">
              Tên chủ tài khoản {!readOnly && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="rr-acc-name"
              placeholder="VD: NGUYEN VAN A"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
              disabled={readOnly}
            />
          </div>

          {!readOnly && (
            <div className="flex flex-col gap-1.5">
              <Label>Ảnh / video minh chứng (tối đa {MAX_FILES})</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handlePickFiles}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= MAX_FILES}
                className="cursor-pointer w-fit"
              >
                <Upload className="size-4 mr-2" />
                Chọn tệp ({files.length}/{MAX_FILES})
              </Button>
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {previews.map((p, idx) => (
                    <div key={idx} className="relative group border border-gray-200">
                      {p.isVideo ? (
                        <video src={p.url} className="w-full h-20 object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.url} alt={`preview-${idx}`} className="w-full h-20 object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Xoá tệp"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {readOnly && existingMedia.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Ảnh / video đính kèm</Label>
              <MediaGallery media={existingMedia} columns={4} />
            </div>
          )}
        </div>

        <DialogFooter>
          {readOnly ? (
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Đóng
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={submitting} className="cursor-pointer">
                Huỷ
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[var(--bg-button)] text-[var(--text-inverse)] hover:bg-[var(--bg-button-hover)] cursor-pointer"
              >
                {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
