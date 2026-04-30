"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  userName: string;
  currentRole: string;
  nextRole: string;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RoleChangeDialog({
  open,
  userName,
  currentRole,
  nextRole,
  saving,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !saving) onCancel(); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Xác nhận đổi vai trò</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn đổi vai trò của{" "}
            <span className="font-semibold text-[#023337]">{userName}</span>{" "}
            từ <span className="font-medium">{currentRole}</span> sang{" "}
            <span className="font-medium">{nextRole}</span>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={saving}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
