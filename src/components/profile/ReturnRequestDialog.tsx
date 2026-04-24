"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
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
  PENDING:     { label: "Đang chờ",   className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800 border-blue-300" },
  APPROVED:    { label: "Đã duyệt",   className: "bg-green-100 text-green-800 border-green-300" },
  REJECTED:    { label: "Đã từ chối", className: "bg-red-100 text-red-800 border-red-300" },
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
    }
  }, [open, existingRequest]);

  const handleSubmit = async () => {
    if (!session?.user?.access_token) return;
    if (!description.trim()) { toast.error("Vui lòng nhập lý do trả hàng."); return; }
    if (!bankName) { toast.error("Vui lòng chọn ngân hàng."); return; }
    if (!bankAccountNumber.trim()) { toast.error("Vui lòng nhập số tài khoản."); return; }
    if (!bankAccountName.trim()) { toast.error("Vui lòng nhập tên chủ tài khoản."); return; }

    setSubmitting(true);
    try {
      await returnRequestService.create(
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
      toast.success("Yêu cầu hoàn trả đã được gửi. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.");
      onSubmitted?.();
      onClose();
    } catch {
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

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
