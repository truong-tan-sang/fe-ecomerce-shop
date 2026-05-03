"use client";

import { useHasMounted } from "@/utils/customHook";
import { FormEvent, useEffect, useState } from "react";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import { User, ShieldCheck, Smile } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ModalReactiveProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  userEmail: string;
}

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { label: "Đăng nhập", icon: User },
    { label: "Xác thực", icon: ShieldCheck },
    { label: "Hoàn tất", icon: Smile },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === current;
        const isDone = index < current;
        return (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`flex size-8 items-center justify-center border ${
                  isActive || isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <span
                className={`mt-1 text-xs ${
                  isActive || isDone ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-px flex-1 mx-2 ${
                  isDone ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const ModalReactive = (props: ModalReactiveProps) => {
  const { isModalOpen, setIsModalOpen, userEmail } = props;
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const hasMounted = useHasMounted();

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  if (!hasMounted) return <></>;

  const onFinishStep0 = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await authService.retryActive({ email });
      const id = res?.data?.id ?? null;
      if (!id) throw new Error("Không nhận được ID người dùng từ server");
      setUserId(id);
      setCurrent(1);
    } catch {
      toast.error("Gửi lại mã kích hoạt thất bại. Vui lòng thử lại.");
    }
  };

  const onFinishStep1 = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) {
      setCodeError("Vui lòng nhập mã kích hoạt!");
      return;
    }
    if (!userId) {
      setCodeError("Phiên xác thực không hợp lệ. Vui lòng gửi lại mã.");
      return;
    }
    try {
      await authService.checkCode({
        codeActive: code,
        id: String(userId),
      });
      setCurrent(2);
    } catch {
      toast.error("Mã kích hoạt không hợp lệ hoặc đã hết hạn.");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kích hoạt tài khoản</DialogTitle>
        </DialogHeader>

        <StepIndicator current={current} />

        {current === 0 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Tài khoản của bạn chưa được kích hoạt</p>
            </div>
            <form onSubmit={onFinishStep0} autoComplete="off" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reactive-email">Địa chỉ email</Label>
                <Input
                  id="reactive-email"
                  value={email}
                  disabled
                />
              </div>
              <Button type="submit" className="cursor-pointer">
                Gửi lại
              </Button>
            </form>
          </>
        )}

        {current === 1 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Vui lòng nhập mã xác nhận!</p>
            </div>
            <form onSubmit={onFinishStep1} autoComplete="off" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reactive-code">Mã kích hoạt</Label>
                <Input
                  id="reactive-code"
                  placeholder="Nhập mã kích hoạt 6 chữ số"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setCodeError("");
                  }}
                />
                {codeError && <p className="text-sm text-destructive">{codeError}</p>}
              </div>
              <Button type="submit" className="cursor-pointer">
                Kích hoạt
              </Button>
            </form>
          </>
        )}

        {current === 2 && (
          <div className="my-4">
            <p className="text-sm">
              Tài khoản của bạn đã được kích hoạt thành công. Vui lòng đăng nhập lại.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalReactive;
